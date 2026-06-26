-- Nightly cleanup of vehicle entry/exit photos for sessions that have
-- already checked out — once a session is "completed" nothing in the app
-- reads its photo again, so there's no reason to keep paying storage for it.
-- Member vehicle/ID-proof photos are NOT touched here; those follow the
-- membership's own lifecycle, not a single parking visit.
--
-- This needs the project's service_role key to bypass RLS (a single
-- maintenance job legitimately needs to clean up every business's old
-- photos, not just one). The key is read from Supabase Vault, NOT stored in
-- this file — see the one-off setup command run separately in the SQL
-- Editor, which never gets committed to git.
create extension if not exists pg_cron;
create extension if not exists pg_net;

create or replace function cleanup_old_vehicle_photos()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_key text;
  v_row record;
  v_cutoff timestamptz;
begin
  select decrypted_secret into v_key from vault.decrypted_secrets where name = 'service_role_key';
  if v_key is null then
    raise notice 'service_role_key not found in Vault — skipping photo cleanup';
    return;
  end if;

  -- "Today" computed in IST, not server UTC, so this matches what a user
  -- means by "yesterday" regardless of the database's default timezone.
  v_cutoff := date_trunc('day', now() at time zone 'Asia/Kolkata') at time zone 'Asia/Kolkata';

  for v_row in
    select id, vehicle_photo_url from parking_sessions
    where status = 'completed'
      and exit_time < v_cutoff
      and vehicle_photo_url is not null
  loop
    -- Fire-and-forget: pg_net calls are async. Worst case on a transient
    -- failure is one orphaned ~150KB file, not worth a retry/saga for a
    -- nightly hygiene job.
    perform net.http_delete(
      url := 'https://kiqzrwxwdmztdtlmhedh.supabase.co/storage/v1/object/photos/' || v_row.vehicle_photo_url,
      headers := jsonb_build_object('Authorization', 'Bearer ' || v_key)
    );
    update parking_sessions set vehicle_photo_url = null where id = v_row.id;
  end loop;
end;
$$;

-- Defense in depth: newly created functions default to PUBLIC execute
-- access in Postgres. This job touches every business's data, so it must
-- never be callable directly by a client.
revoke execute on function cleanup_old_vehicle_photos() from public, anon, authenticated;

select cron.schedule(
  'cleanup-old-vehicle-photos',
  '30 19 * * *', -- 19:30 UTC = 01:00 IST the next day
  $$ select cleanup_old_vehicle_photos(); $$
);
