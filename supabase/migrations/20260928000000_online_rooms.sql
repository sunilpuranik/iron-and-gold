-- Iron & Gold online rooms (closed beta).
--
-- Who can do what:
--   * Every player is a Supabase user. The app signs in anonymously and keeps the session,
--     so the same phone is the same tycoon until the app is deleted.
--   * Clients can only READ rooms they are a member of. They never write rooms directly:
--     lobby changes go through the RPCs below, game moves through the `game` Edge Function,
--     which checks each move with the game engine and writes with the service role.
--
-- Beta caveat: members can read the whole game state, including other tycoons' deeds.

-- The prototype table (open to anyone with the anon key) is replaced.
drop table if exists public.rooms cascade;

create table public.rooms (
  code       text primary key check (code ~ '^[A-Z]{4}$'),
  host       uuid not null references auth.users (id) on delete cascade,
  lobby      jsonb not null,                       -- { host, players: [{ id, name, avatar, bot }] }
  state      jsonb,                                -- engine state; null while in the lobby
  seq        int  not null default 1,              -- bumped on every write (optimistic concurrency)
  status     text not null default 'lobby' check (status in ('lobby', 'playing', 'over')),
  turn_of    text,                                 -- id of the tycoon (or bot) who must act; drives "your turn"
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.room_members (
  code      text not null references public.rooms (code) on delete cascade,
  user_id   uuid not null references auth.users (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (code, user_id)
);
create index room_members_user on public.room_members (user_id);

alter table public.rooms enable row level security;
alter table public.room_members enable row level security;

-- security definer so the policy can look at room_members without recursing through its RLS.
create or replace function public.is_member(p_code text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from room_members where code = p_code and user_id = auth.uid());
$$;

create policy "members read their rooms" on public.rooms
  for select to authenticated using (public.is_member(code));

create policy "members read their tables' members" on public.room_members
  for select to authenticated using (public.is_member(code));

-- No insert/update/delete policies: all writes go through the functions below or the service role.

create or replace function public.touch_room() returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

create trigger rooms_touch before update on public.rooms
  for each row execute function public.touch_room();

-- ---------------------------------------------------------------- lobby RPCs

create or replace function public.lobby_member(p_name text, p_avatar int) returns jsonb
language sql stable as $$
  select jsonb_build_object(
    'id', auth.uid(),
    'name', left(coalesce(nullif(trim(p_name), ''), 'Tycoon'), 16),
    'avatar', greatest(0, least(5, coalesce(p_avatar, 0))),
    'bot', false);
$$;

create or replace function public.create_room(p_name text, p_avatar int) returns public.rooms
language plpgsql security definer set search_path = public as $$
declare
  letters constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  v_code text;
  v_row rooms;
begin
  if auth.uid() is null then raise exception 'Sign in first'; end if;
  for attempt in 1..20 loop
    v_code := '';
    for i in 1..4 loop
      v_code := v_code || substr(letters, 1 + floor(random() * length(letters))::int, 1);
    end loop;
    begin
      insert into rooms (code, host, lobby)
      values (v_code, auth.uid(), jsonb_build_object('host', auth.uid(), 'players', jsonb_build_array(lobby_member(p_name, p_avatar))))
      returning * into v_row;
      insert into room_members (code, user_id) values (v_code, auth.uid());
      return v_row;
    exception when unique_violation then
      -- code taken; try another
    end;
  end loop;
  raise exception 'Could not find a free room code';
end $$;

create or replace function public.join_room(p_code text, p_name text, p_avatar int) returns public.rooms
language plpgsql security definer set search_path = public as $$
declare
  v_row rooms;
  v_players jsonb;
begin
  if auth.uid() is null then raise exception 'Sign in first'; end if;
  select * into v_row from rooms where code = upper(trim(p_code)) for update;
  if not found then raise exception 'No table with that code'; end if;
  v_players := v_row.lobby -> 'players';
  if exists (select 1 from jsonb_array_elements(v_players) p where p ->> 'id' = auth.uid()::text) then
    return v_row; -- already seated: rejoin
  end if;
  if v_row.state is not null then raise exception 'That game has already started'; end if;
  if jsonb_array_length(v_players) >= 6 then raise exception 'That table is full'; end if;
  update rooms
     set lobby = jsonb_set(lobby, '{players}', v_players || lobby_member(p_name, p_avatar)), seq = seq + 1
   where code = v_row.code
  returning * into v_row;
  insert into room_members (code, user_id) values (v_row.code, auth.uid()) on conflict do nothing;
  return v_row;
end $$;

-- Host only, lobby only.
create or replace function public.add_bot(p_code text, p_name text, p_avatar int) returns public.rooms
language plpgsql security definer set search_path = public as $$
declare
  v_row rooms;
begin
  select * into v_row from rooms where code = p_code for update;
  if not found or v_row.host <> auth.uid() then raise exception 'Only the host can add bots'; end if;
  if v_row.state is not null then raise exception 'That game has already started'; end if;
  if jsonb_array_length(v_row.lobby -> 'players') >= 6 then raise exception 'That table is full'; end if;
  update rooms
     set lobby = jsonb_set(lobby, '{players}', (lobby -> 'players') || jsonb_build_object(
           'id', 'bot-' || substr(md5(random()::text), 1, 6),
           'name', left(coalesce(nullif(trim(p_name), ''), 'Bot'), 16),
           'avatar', greatest(0, least(5, coalesce(p_avatar, 0))),
           'bot', true)),
         seq = seq + 1
   where code = p_code
  returning * into v_row;
  return v_row;
end $$;

-- The host can remove anyone but themselves; anyone can remove themselves (leave). Lobby only.
create or replace function public.remove_player(p_code text, p_id text) returns public.rooms
language plpgsql security definer set search_path = public as $$
declare
  v_row rooms;
begin
  select * into v_row from rooms where code = p_code for update;
  if not found then raise exception 'No table with that code'; end if;
  if v_row.state is not null then raise exception 'That game has already started'; end if;
  if p_id = v_row.host::text then raise exception 'The host cannot leave their own table'; end if;
  if v_row.host <> auth.uid() and p_id <> auth.uid()::text then raise exception 'Only the host can remove tycoons'; end if;
  update rooms
     set lobby = jsonb_set(lobby, '{players}', coalesce(
           (select jsonb_agg(p) from jsonb_array_elements(lobby -> 'players') p where p ->> 'id' <> p_id), '[]'::jsonb)),
         seq = seq + 1
   where code = p_code
  returning * into v_row;
  delete from room_members where code = p_code and user_id::text = p_id;
  return v_row;
end $$;

revoke all on function public.create_room, public.join_room, public.add_bot, public.remove_player from public, anon;
grant execute on function public.create_room, public.join_room, public.add_bot, public.remove_player to authenticated;

-- ---------------------------------------------------------------- realtime

-- Realtime respects RLS, so each client only hears about its own rooms.
alter table public.rooms replica identity full;
do $$
begin
  alter publication supabase_realtime add table public.rooms;
exception when duplicate_object then null;
end $$;

-- ---------------------------------------------------------------- housekeeping
-- Finished games and abandoned lobbies are removed after 14 days.
-- Requires the pg_cron extension (Database → Extensions → pg_cron). Safe to skip.
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.schedule('iron-gold-cleanup', '17 4 * * *',
      $cron$delete from public.rooms where updated_at < now() - interval '14 days'$cron$);
  end if;
end $$;
