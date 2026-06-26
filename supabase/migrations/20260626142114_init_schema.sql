-- Parkesy initial schema
-- Multi-tenant: every business-owned table carries business_id, isolated via RLS.
-- IDs are UUIDs (gen_random_uuid()) so records can be created offline and synced later.
-- All timestamps are timestamptz (stored UTC); money is whole rupees (integer).

-- ============================================================================
-- Businesses (tenants)
-- ============================================================================
create table businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'My Business',
  address jsonb not null default '{}'::jsonb,
  phone text,
  vehicle_number_capture_mode text not null default 'full' check (vehicle_number_capture_mode in ('full', 'last4')),
  collect_at_checkin boolean not null default true,
  long_stay_threshold_hours numeric not null default 24,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- Profiles (one per auth.users row; role + business membership)
-- ============================================================================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  business_id uuid not null references businesses(id) on delete cascade,
  name text not null,
  phone text not null,
  address jsonb not null default '{}'::jsonb,
  role text not null check (role in ('admin', 'employee')),
  created_at timestamptz not null default now()
);

create index profiles_business_id_idx on profiles(business_id);

-- ============================================================================
-- Vehicle types (per business): rate slabs + membership pricing as jsonb
-- ============================================================================
create table vehicle_types (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  name text not null,
  ticket_prefix text not null,
  total_slots integer not null default 0,
  slabs jsonb not null default '[]'::jsonb,
  membership_pricing jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  unique (business_id, ticket_prefix)
);

create index vehicle_types_business_id_idx on vehicle_types(business_id);

-- ============================================================================
-- Ticket numbering: atomic per-business, per-vehicle-type, per-day counter
-- ============================================================================
create table ticket_counters (
  business_id uuid not null references businesses(id) on delete cascade,
  vehicle_type_id uuid not null references vehicle_types(id) on delete cascade,
  counter_date date not null,
  last_number integer not null default 0,
  primary key (business_id, vehicle_type_id, counter_date)
);

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
  select ticket_prefix into v_prefix from vehicle_types where id = p_vehicle_type_id and business_id = p_business_id;
  if v_prefix is null then
    raise exception 'Unknown vehicle type for this business';
  end if;

  insert into ticket_counters (business_id, vehicle_type_id, counter_date, last_number)
  values (p_business_id, p_vehicle_type_id, current_date, 1)
  on conflict (business_id, vehicle_type_id, counter_date)
  do update set last_number = ticket_counters.last_number + 1
  returning last_number into v_number;

  return v_prefix || '-' || lpad(v_number::text, 6, '0');
end;
$$;

-- ============================================================================
-- Parking sessions
-- ============================================================================
create table parking_sessions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  vehicle_type_id uuid not null references vehicle_types(id) on delete restrict,
  ticket_code text not null,
  vehicle_number text not null default '',
  vehicle_photo_url text,
  entry_time timestamptz not null default now(),
  exit_time timestamptz,
  amount_paid_at_entry integer not null default 0,
  payment_mode_at_entry text check (payment_mode_at_entry in ('cash', 'online')),
  amount_paid_at_exit integer,
  payment_mode_at_exit text check (payment_mode_at_exit in ('cash', 'online')),
  total_amount integer,
  recorded_by uuid not null references profiles(id) default auth.uid(),
  exit_recorded_by uuid references profiles(id),
  status text not null default 'parked' check (status in ('parked', 'completed')),
  member_id uuid,
  created_at timestamptz not null default now()
);

create index parking_sessions_business_id_idx on parking_sessions(business_id);
create index parking_sessions_entry_time_idx on parking_sessions(business_id, entry_time);
create index parking_sessions_status_idx on parking_sessions(business_id, status);

-- ============================================================================
-- Expenses
-- ============================================================================
create table expenses (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  amount integer not null,
  title text not null,
  note text,
  expense_date timestamptz not null default now(),
  recorded_by uuid not null references profiles(id) default auth.uid(),
  created_at timestamptz not null default now()
);

create index expenses_business_id_idx on expenses(business_id);
create index expenses_date_idx on expenses(business_id, expense_date);

-- ============================================================================
-- Members (parking memberships) + payments
-- ============================================================================
create table members (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  vehicle_number text not null,
  vehicle_type_id uuid not null references vehicle_types(id) on delete restrict,
  customer_name text,
  customer_phone text,
  customer_address jsonb,
  id_proof jsonb,
  vehicle_photo_url text,
  duration_months integer not null,
  fee_amount integer not null,
  start_date timestamptz not null default now(),
  expiry_date timestamptz not null,
  recorded_by uuid not null references profiles(id) default auth.uid(),
  created_at timestamptz not null default now()
);

create index members_business_id_idx on members(business_id);
create index members_vehicle_number_idx on members(business_id, vehicle_number);
create index members_expiry_idx on members(business_id, expiry_date);

alter table parking_sessions
  add constraint parking_sessions_member_id_fkey
  foreign key (member_id) references members(id) on delete set null;

create table member_payments (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  member_id uuid not null references members(id) on delete cascade,
  amount integer not null,
  payment_mode text not null check (payment_mode in ('cash', 'online')),
  paid_at timestamptz not null default now(),
  type text not null check (type in ('signup', 'renewal')),
  recorded_by uuid not null references profiles(id) default auth.uid()
);

create index member_payments_business_id_idx on member_payments(business_id);
create index member_payments_member_id_idx on member_payments(member_id);

-- ============================================================================
-- Team invites
-- ============================================================================
create table team_invites (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  name text not null,
  phone text not null,
  pin text not null,
  role text not null check (role in ('admin', 'employee')),
  created_at timestamptz not null default now(),
  redeemed_at timestamptz
);

create index team_invites_business_id_idx on team_invites(business_id);
create unique index team_invites_phone_pending_idx on team_invites(phone) where redeemed_at is null;

-- ============================================================================
-- Helper: current caller's business_id (SECURITY DEFINER avoids RLS recursion)
-- ============================================================================
create or replace function get_my_business_id()
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select business_id from profiles where id = auth.uid();
$$;

create or replace function get_my_role()
returns text
language sql
security definer
stable
set search_path = public
as $$
  select role from profiles where id = auth.uid();
$$;

-- ============================================================================
-- Signup completion: creates a new business (admin) or redeems a pending
-- invite (joins inviting business with the assigned role).
-- ============================================================================
create or replace function complete_signup(p_name text, p_phone text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite team_invites%rowtype;
  v_business_id uuid;
  v_role text;
begin
  if exists (select 1 from profiles where id = auth.uid()) then
    raise exception 'Profile already exists for this user';
  end if;

  select * into v_invite from team_invites where phone = p_phone and redeemed_at is null limit 1;

  if v_invite.id is not null then
    v_business_id := v_invite.business_id;
    v_role := v_invite.role;
    update team_invites set redeemed_at = now() where id = v_invite.id;
  else
    insert into businesses (name) values ('My Business') returning id into v_business_id;
    v_role := 'admin';

    insert into vehicle_types (business_id, name, ticket_prefix, total_slots, slabs, membership_pricing)
    values
      (v_business_id, 'Bike', 'BK', 20,
        '[{"order":1,"fromHour":0,"toHour":1,"amount":10,"type":"flat"},{"order":2,"fromHour":1,"toHour":null,"amount":5,"type":"per_hour","unitHours":1}]'::jsonb,
        '[{"durationMonths":1,"price":500},{"durationMonths":3,"price":1400},{"durationMonths":6,"price":2700},{"durationMonths":12,"price":5000}]'::jsonb),
      (v_business_id, 'Cycle', 'CY', 10,
        '[{"order":1,"fromHour":0,"toHour":2,"amount":5,"type":"flat"},{"order":2,"fromHour":2,"toHour":null,"amount":3,"type":"per_hour","unitHours":1}]'::jsonb,
        '[{"durationMonths":1,"price":300},{"durationMonths":3,"price":850},{"durationMonths":6,"price":1600},{"durationMonths":12,"price":3000}]'::jsonb),
      (v_business_id, 'Car', 'CR', 8,
        '[{"order":1,"fromHour":0,"toHour":1,"amount":20,"type":"flat"},{"order":2,"fromHour":1,"toHour":null,"amount":10,"type":"per_hour","unitHours":1}]'::jsonb,
        '[{"durationMonths":1,"price":800},{"durationMonths":3,"price":2300},{"durationMonths":6,"price":4400},{"durationMonths":12,"price":8000}]'::jsonb);
  end if;

  insert into profiles (id, business_id, name, phone, role)
  values (auth.uid(), v_business_id, p_name, p_phone, v_role);
end;
$$;

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table businesses enable row level security;
alter table profiles enable row level security;
alter table vehicle_types enable row level security;
alter table parking_sessions enable row level security;
alter table expenses enable row level security;
alter table members enable row level security;
alter table member_payments enable row level security;
alter table team_invites enable row level security;
alter table ticket_counters enable row level security;

-- businesses: any authenticated member of the business can read/update it
create policy "business select" on businesses for select
  using (id = get_my_business_id());
create policy "business update" on businesses for update
  using (id = get_my_business_id());

-- profiles: read your own profile or teammates'; only update your own
create policy "profiles select" on profiles for select
  using (id = auth.uid() or business_id = get_my_business_id());
create policy "profiles update own" on profiles for update
  using (id = auth.uid());

-- vehicle_types: any business member can read; only admins manage
create policy "vehicle_types select" on vehicle_types for select
  using (business_id = get_my_business_id());
create policy "vehicle_types admin write" on vehicle_types for all
  using (business_id = get_my_business_id() and get_my_role() = 'admin')
  with check (business_id = get_my_business_id() and get_my_role() = 'admin');

-- parking_sessions: any business member can read/write within their business
create policy "parking_sessions select" on parking_sessions for select
  using (business_id = get_my_business_id());
create policy "parking_sessions write" on parking_sessions for all
  using (business_id = get_my_business_id())
  with check (business_id = get_my_business_id());

-- expenses: any business member can read/write within their business
create policy "expenses select" on expenses for select
  using (business_id = get_my_business_id());
create policy "expenses write" on expenses for all
  using (business_id = get_my_business_id())
  with check (business_id = get_my_business_id());

-- members + member_payments: any business member can read/write
create policy "members select" on members for select
  using (business_id = get_my_business_id());
create policy "members write" on members for all
  using (business_id = get_my_business_id())
  with check (business_id = get_my_business_id());

create policy "member_payments select" on member_payments for select
  using (business_id = get_my_business_id());
create policy "member_payments write" on member_payments for all
  using (business_id = get_my_business_id())
  with check (business_id = get_my_business_id());

-- team_invites: only admins of the owning business can read/manage the table
-- directly. There is deliberately NO public/anon select policy here — that
-- would let anyone list every business's pending invites and PINs. Instead,
-- the signup flow checks/redeems invites through the SECURITY DEFINER
-- functions below, which only ever reveal a single targeted phone+PIN match.
create policy "team_invites admin manage" on team_invites for all
  using (business_id = get_my_business_id() and get_my_role() = 'admin')
  with check (business_id = get_my_business_id() and get_my_role() = 'admin');

-- ticket_counters: internal bookkeeping only, no direct client access
-- (writes happen exclusively via the SECURITY DEFINER next_ticket_code function)

-- ============================================================================
-- Invite lookup/verification: callable pre-auth (anon), reveals nothing
-- beyond a single targeted phone+PIN match — never lists other invites.
-- ============================================================================
create or replace function has_pending_invite(p_phone text)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (select 1 from team_invites where phone = p_phone and redeemed_at is null);
$$;

create or replace function verify_invite_pin(p_phone text, p_pin text)
returns text
language sql
security definer
stable
set search_path = public
as $$
  select role from team_invites
  where phone = p_phone and pin = p_pin and redeemed_at is null
  limit 1;
$$;

grant execute on function has_pending_invite(text) to anon, authenticated;
grant execute on function verify_invite_pin(text, text) to anon, authenticated;
grant execute on function complete_signup(text, text) to authenticated;
grant execute on function get_my_business_id() to authenticated;
grant execute on function get_my_role() to authenticated;
grant execute on function next_ticket_code(uuid, uuid) to authenticated;
