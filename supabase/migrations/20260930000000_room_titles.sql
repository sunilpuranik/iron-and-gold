-- Room names: an optional title the host picks ("Friday night rails"), shown in the lobby,
-- in "Your tables" and in the invite. The 4-letter code is still how people join.

alter table public.rooms
  add column title text check (char_length(title) <= 32);

create or replace function public.room_title(p_title text) returns text
language sql immutable as $$
  select nullif(left(regexp_replace(trim(coalesce(p_title, '')), '\s+', ' ', 'g'), 32), '');
$$;

-- create_room gains an optional title. Dropping the old signature (rather than adding an
-- overload) keeps PostgREST from seeing two candidates; clients that send only name and
-- portrait still match through the default.
drop function public.create_room(text, int);

create function public.create_room(p_name text, p_avatar int, p_title text default null) returns public.rooms
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
      insert into rooms (code, host, lobby, title)
      values (v_code, auth.uid(), jsonb_build_object('host', auth.uid(), 'players', jsonb_build_array(lobby_member(p_name, p_avatar))), room_title(p_title))
      returning * into v_row;
      insert into room_members (code, user_id) values (v_code, auth.uid());
      return v_row;
    exception when unique_violation then
      -- code taken; try another
    end;
  end loop;
  raise exception 'Could not find a free room code';
end $$;

-- Host only, lobby only (a rename bumps seq, which would bounce a move in flight). Empty clears it.
create or replace function public.rename_room(p_code text, p_title text) returns public.rooms
language plpgsql security definer set search_path = public as $$
declare
  v_row rooms;
begin
  select * into v_row from rooms where code = p_code for update;
  if not found or v_row.host <> auth.uid() then raise exception 'Only the host can rename the table'; end if;
  if v_row.state is not null then raise exception 'That game has already started'; end if;
  update rooms set title = room_title(p_title), seq = seq + 1
   where code = p_code
  returning * into v_row;
  return v_row;
end $$;

revoke all on function public.create_room, public.rename_room from public, anon;
grant execute on function public.create_room, public.rename_room to authenticated;
