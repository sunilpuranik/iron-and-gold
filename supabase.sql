-- Iron & Gold online rooms. Run this in the Supabase SQL editor.
-- Prototype only: RLS is permissive, so anyone with the anon key can read/write rooms.

create table if not exists public.rooms (
  code  text primary key,
  lobby jsonb not null default '{}'::jsonb,
  state jsonb,
  seq   int  not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.rooms enable row level security;

drop policy if exists "rooms are public (prototype)" on public.rooms;
create policy "rooms are public (prototype)" on public.rooms
  for all to anon, authenticated
  using (true) with check (true);

-- Send full rows with realtime UPDATE events.
alter table public.rooms replica identity full;

-- Add the table to the realtime publication.
do $$
begin
  alter publication supabase_realtime add table public.rooms;
exception when duplicate_object then null;
end $$;

-- Optional housekeeping: delete rooms untouched for a day.
-- delete from public.rooms where updated_at < now() - interval '1 day';
