-- Change ticket numbering from 6 digits to 4 digits.
-- Tokens now look like BK-0012 instead of BK-000012.
-- Re-creates the function with lpad width changed from 6 → 4.

create or replace function next_ticket_code(p_business_id uuid, p_vehicle_type_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_number integer;
  v_prefix text;
begin
  select ticket_prefix into v_prefix
  from vehicle_types
  where id = p_vehicle_type_id and business_id = p_business_id;

  if v_prefix is null then
    raise exception 'Unknown vehicle type for this business';
  end if;

  insert into ticket_counters (business_id, vehicle_type_id, counter_date, last_number)
  values (p_business_id, p_vehicle_type_id, current_date, 1)
  on conflict (business_id, vehicle_type_id, counter_date)
  do update set last_number = ticket_counters.last_number + 1
  returning last_number into v_number;

  return v_prefix || '-' || lpad(v_number::text, 4, '0');
end;
$$;
