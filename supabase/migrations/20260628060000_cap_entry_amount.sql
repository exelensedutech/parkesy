-- amount_paid_at_entry is the one client-supplied money value in the
-- system (everything else is computed server-side). Without a bound, a
-- dishonest employee could check a vehicle in claiming an implausibly large
-- amount was collected, then immediately check it out to generate a large
-- fake "refund due" and pocket the difference - the request would still
-- succeed today since nothing validates this value.
--
-- Rather than guess an arbitrary rupee ceiling, the cap is derived from the
-- business's own configured rates: no single entry payment should plausibly
-- exceed 30 days of parking at that vehicle type's own rate slabs. This
-- scales naturally with each business's actual pricing instead of an
-- arbitrary constant, and rejects negative amounts outright too.
create or replace function start_parking_session(
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

  if p_amount_paid_at_entry < 0 then
    raise exception 'Amount paid cannot be negative';
  end if;
  if p_amount_paid_at_entry > calculate_parking_amount(p_vehicle_type_id, 720) then
    raise exception 'Amount paid at entry is implausibly high';
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
