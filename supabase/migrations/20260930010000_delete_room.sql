-- The host can close a table for good, in the lobby or mid-game. Members go with it
-- (room_members cascades); other phones notice on their next poll and head home.

create or replace function public.delete_room(p_code text) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_host uuid;
begin
  select host into v_host from rooms where code = p_code for update;
  if not found then raise exception 'No table with that code'; end if;
  if v_host <> auth.uid() then raise exception 'Only the host can close the table'; end if;
  delete from rooms where code = p_code;
end $$;

revoke all on function public.delete_room from public, anon;
grant execute on function public.delete_room to authenticated;
