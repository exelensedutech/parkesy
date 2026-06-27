-- The previous migration kept a fallback that independently re-derived
-- membership by exact-matching the typed text against vehicle_number
-- whenever no member id was supplied. That fallback is now actively wrong:
-- the client always resolves membership client-side (suffix-matched,
-- scoped to vehicle type, with attendant disambiguation when ambiguous)
-- for every capture mode, so "no member id supplied" now means "the
-- attendant explicitly confirmed this is not a member" — not "the server
-- should go guess." Without removing the fallback, tapping "None of these"
-- could still silently grant free entry if the typed digits happened to
-- exactly equal another member's full plate.
drop function if exists start_parking_session(uuid, text, integer, text, text, uuid);

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
    -- Never trust the client outright — re-verify the id actually belongs
    -- to this business and is still active before granting free entry.
    select id into v_member_id from members
      where id = p_member_id
        and business_id = v_business_id
        and expiry_date >= now();
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
