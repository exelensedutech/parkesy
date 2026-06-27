-- "Last 4 digits" capture mode breaks membership auto-detection: members are
-- stored with their full plate, so an exact-text match against 4 typed
-- digits almost never hits. Fix: the client now resolves which specific
-- member (if any) matches — by suffix, scoped to vehicle type, with the
-- attendant disambiguating manually only when two+ members share the same
-- last 4 digits — and passes that member's id explicitly. The server still
-- never trusts this outright: it re-verifies the id belongs to this
-- business and is still active before granting free entry.
--
-- CREATE OR REPLACE cannot add a parameter to an existing function, so the
-- old 5-arg version is dropped first.
drop function if exists start_parking_session(uuid, text, integer, text, text);

create function start_parking_session(
  p_vehicle_type_id uuid,
  p_vehicle_number text,
  p_amount_paid_at_entry integer,
  p_payment_mode_at_entry text,
  p_vehicle_photo_url text,
  p_member_id uuid default null
)
returns parking_sessions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_business_id uuid;
  v_ticket_code text;
  v_member_id uuid;
  v_final_amount integer;
  v_normalized_number text;
  v_session parking_sessions%rowtype;
begin
  v_business_id := get_my_business_id();
  if v_business_id is null then
    raise exception 'No business context for current user';
  end if;

  v_normalized_number := upper(trim(p_vehicle_number));

  if p_member_id is not null then
    select id into v_member_id from members
      where id = p_member_id
        and business_id = v_business_id
        and expiry_date >= now();
  elsif v_normalized_number <> '' then
    -- No explicit member id (e.g. full-plate capture mode) — fall back to
    -- an exact match on the complete number.
    select id into v_member_id from members
      where business_id = v_business_id
        and vehicle_number = v_normalized_number
        and expiry_date >= now()
      limit 1;
  end if;

  v_final_amount := case when v_member_id is not null then 0 else p_amount_paid_at_entry end;
  v_ticket_code := next_ticket_code(v_business_id, p_vehicle_type_id);

  insert into parking_sessions (
    business_id, vehicle_type_id, ticket_code, vehicle_number, vehicle_photo_url,
    amount_paid_at_entry, payment_mode_at_entry, member_id
  ) values (
    v_business_id, p_vehicle_type_id, v_ticket_code, v_normalized_number, p_vehicle_photo_url,
    v_final_amount, case when v_final_amount > 0 then p_payment_mode_at_entry else null end, v_member_id
  )
  returning * into v_session;

  return v_session;
end;
$$;

grant execute on function start_parking_session(uuid, text, integer, text, text, uuid) to authenticated;
