-- Server-side, authoritative versions of the money/billing logic that used
-- to live only in the client (calc.ts / membership.ts). The client still
-- keeps a copy for instant on-screen estimates, but these functions are the
-- source of truth actually written to the database — matching the
-- client-predicts/server-confirms design agreed on earlier.

-- ============================================================================
-- Fee calculation from a vehicle type's rate slabs (mirrors calc.ts exactly)
-- ============================================================================
create or replace function calculate_parking_amount(p_vehicle_type_id uuid, p_hours numeric)
returns integer
language plpgsql
stable
set search_path = public
as $$
declare
  v_slabs jsonb;
  v_slab jsonb;
  v_first jsonb := null;
  v_amount integer := 0;
  v_slab_hours numeric;
  v_unit numeric;
  v_to_hour numeric;
begin
  select slabs into v_slabs from vehicle_types where id = p_vehicle_type_id;
  if v_slabs is null or jsonb_array_length(v_slabs) = 0 then
    return 0;
  end if;

  for v_slab in
    select value from jsonb_array_elements(v_slabs) order by (value->>'order')::int
  loop
    if v_first is null then
      v_first := v_slab;
      v_to_hour := (v_first->>'toHour')::numeric;
      if v_to_hour is null or p_hours <= v_to_hour then
        return (v_first->>'amount')::int;
      end if;
      v_amount := (v_first->>'amount')::int;
      continue;
    end if;

    v_to_hour := (v_slab->>'toHour')::numeric;
    if v_to_hour is null then
      v_slab_hours := p_hours - (v_slab->>'fromHour')::numeric;
    else
      v_slab_hours := least(p_hours, v_to_hour) - (v_slab->>'fromHour')::numeric;
    end if;

    if v_slab_hours <= 0 then
      continue;
    end if;

    if v_slab->>'type' = 'flat' then
      v_amount := v_amount + (v_slab->>'amount')::int;
    else
      v_unit := coalesce((v_slab->>'unitHours')::numeric, 1);
      v_amount := v_amount + (ceil(v_slab_hours / v_unit) * (v_slab->>'amount')::numeric)::int;
    end if;

    if v_to_hour is not null and p_hours <= v_to_hour then
      exit;
    end if;
  end loop;

  return v_amount;
end;
$$;

-- ============================================================================
-- Check-in: looks up active membership, generates the ticket code, inserts —
-- all atomically, so two devices can never collide on a ticket number.
-- ============================================================================
create or replace function start_parking_session(
  p_vehicle_type_id uuid,
  p_vehicle_number text,
  p_amount_paid_at_entry integer,
  p_payment_mode_at_entry text,
  p_vehicle_photo_url text
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

  if v_normalized_number <> '' then
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

-- ============================================================================
-- Check-out: server computes the final amount and balance/refund itself —
-- the client never tells the server what to charge, only how it was settled.
-- ============================================================================
create or replace function complete_parking_session(
  p_session_id uuid,
  p_payment_mode text
)
returns parking_sessions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session parking_sessions%rowtype;
  v_hours numeric;
  v_total_amount integer;
  v_balance integer;
begin
  select * into v_session from parking_sessions
    where id = p_session_id and business_id = get_my_business_id();
  if v_session.id is null then
    raise exception 'Session not found';
  end if;

  if v_session.member_id is not null then
    v_total_amount := 0;
  else
    v_hours := extract(epoch from (now() - v_session.entry_time)) / 3600;
    v_total_amount := calculate_parking_amount(v_session.vehicle_type_id, v_hours);
  end if;

  v_balance := v_total_amount - v_session.amount_paid_at_entry;

  update parking_sessions set
    status = 'completed',
    exit_time = now(),
    total_amount = v_total_amount,
    amount_paid_at_exit = v_balance,
    payment_mode_at_exit = case when v_balance <> 0 then p_payment_mode else null end,
    exit_recorded_by = auth.uid()
  where id = p_session_id
  returning * into v_session;

  return v_session;
end;
$$;

-- ============================================================================
-- Membership signup/renewal: server looks up the price, client never submits
-- a fee amount it computed itself.
-- ============================================================================
create or replace function add_member(
  p_vehicle_number text,
  p_vehicle_type_id uuid,
  p_customer_name text,
  p_customer_phone text,
  p_customer_address jsonb,
  p_id_proof jsonb,
  p_vehicle_photo_url text,
  p_duration_months integer,
  p_payment_mode text
)
returns members
language plpgsql
security definer
set search_path = public
as $$
declare
  v_business_id uuid;
  v_fee integer := 0;
  v_member members%rowtype;
  v_pricing jsonb;
  v_entry jsonb;
begin
  v_business_id := get_my_business_id();

  select membership_pricing into v_pricing from vehicle_types
    where id = p_vehicle_type_id and business_id = v_business_id;

  for v_entry in select value from jsonb_array_elements(coalesce(v_pricing, '[]'::jsonb))
  loop
    if (v_entry->>'durationMonths')::int = p_duration_months then
      v_fee := (v_entry->>'price')::int;
    end if;
  end loop;

  insert into members (
    business_id, vehicle_number, vehicle_type_id, customer_name, customer_phone,
    customer_address, id_proof, vehicle_photo_url, duration_months, fee_amount, expiry_date
  ) values (
    v_business_id, upper(trim(p_vehicle_number)), p_vehicle_type_id, p_customer_name, p_customer_phone,
    p_customer_address, p_id_proof, p_vehicle_photo_url, p_duration_months, v_fee,
    now() + (p_duration_months || ' months')::interval
  )
  returning * into v_member;

  insert into member_payments (business_id, member_id, amount, payment_mode, type)
  values (v_business_id, v_member.id, v_fee, p_payment_mode, 'signup');

  return v_member;
end;
$$;

create or replace function renew_member(
  p_member_id uuid,
  p_duration_months integer,
  p_payment_mode text
)
returns members
language plpgsql
security definer
set search_path = public
as $$
declare
  v_business_id uuid;
  v_fee integer := 0;
  v_member members%rowtype;
  v_pricing jsonb;
  v_entry jsonb;
  v_base timestamptz;
begin
  v_business_id := get_my_business_id();

  select * into v_member from members where id = p_member_id and business_id = v_business_id;
  if v_member.id is null then
    raise exception 'Member not found';
  end if;

  select membership_pricing into v_pricing from vehicle_types where id = v_member.vehicle_type_id;

  for v_entry in select value from jsonb_array_elements(coalesce(v_pricing, '[]'::jsonb))
  loop
    if (v_entry->>'durationMonths')::int = p_duration_months then
      v_fee := (v_entry->>'price')::int;
    end if;
  end loop;

  v_base := greatest(v_member.expiry_date, now());

  update members set
    duration_months = p_duration_months,
    fee_amount = v_fee,
    expiry_date = v_base + (p_duration_months || ' months')::interval
  where id = p_member_id
  returning * into v_member;

  insert into member_payments (business_id, member_id, amount, payment_mode, type)
  values (v_business_id, p_member_id, v_fee, p_payment_mode, 'renewal');

  return v_member;
end;
$$;

grant execute on function calculate_parking_amount(uuid, numeric) to authenticated;
grant execute on function start_parking_session(uuid, text, integer, text, text) to authenticated;
grant execute on function complete_parking_session(uuid, text) to authenticated;
grant execute on function add_member(text, uuid, text, text, jsonb, jsonb, text, integer, text) to authenticated;
grant execute on function renew_member(uuid, integer, text) to authenticated;
