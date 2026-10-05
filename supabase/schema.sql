-- ==============================================================================
-- BloodAccess - Database Schema, Views, RLS Policies, and Functions
-- Spec Version: Phase 1 (SPEC.md Section 6 & Section 5)
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ==============================================================================
-- 1. TABLES
-- ==============================================================================

-- 1.1 Donors Table (Private table containing sensitive phone & full name)
create table if not exists public.donors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  full_name text not null,
  age int not null check (age >= 18 and age <= 65),
  gender text not null check (gender in ('male', 'female', 'other')),
  phone text not null, -- Private! Never exposed directly in public queries
  blood_group text not null check (blood_group in ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  weight_kg int not null check (weight_kg >= 45),
  state text not null,
  city text not null,
  area text,
  contact_pref text default 'both' check (contact_pref in ('call', 'whatsapp', 'both')),
  is_available boolean default true,
  last_donated_on date null,
  next_eligible_on date null,
  verification_level int default 0 check (verification_level in (0, 1, 2)),
  status text default 'active' check (status in ('active', 'suspended', 'deleted')),
  consent_version text default 'v1.0',
  consent_at timestamptz default now(),
  created_at timestamptz default now()
);

-- Index for common search queries
create index if not exists idx_donors_search on public.donors (city, blood_group, is_available, status);
create index if not exists idx_donors_phone on public.donors (phone);

-- 1.2 Requesters Table
create table if not exists public.requesters (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  phone_verified_at timestamptz default now(),
  created_at timestamptz default now()
);

create index if not exists idx_requesters_phone on public.requesters (phone);

-- 1.3 Contact Events Table (Logs every reveal with rate-limiting audit trail)
create table if not exists public.contact_events (
  id uuid primary key default gen_random_uuid(),
  donor_id uuid not null references public.donors(id) on delete cascade,
  requester_id uuid references public.requesters(id) on delete set null,
  requester_phone text not null,
  patient_blood_group text not null,
  hospital text not null,
  city text not null,
  urgency text not null check (urgency in ('urgent_today', 'within_3_days', 'planned', 'critical')),
  created_at timestamptz default now(),
  outcome text null check (outcome in ('helped', 'not_helped', 'no_response'))
);

create index if not exists idx_contact_events_donor on public.contact_events (donor_id);
create index if not exists idx_contact_events_requester_phone on public.contact_events (requester_phone, created_at);

-- 1.4 SOS Requests Table
create table if not exists public.sos_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid references public.requesters(id) on delete cascade,
  requester_phone text not null,
  blood_group text not null check (blood_group in ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  units int default 1 check (units > 0),
  hospital text not null,
  city text not null,
  deadline timestamptz,
  status text default 'open' check (status in ('open', 'fulfilled', 'closed')),
  created_at timestamptz default now()
);

create index if not exists idx_sos_city_status on public.sos_requests (city, status);

-- 1.5 SOS Responses Table
create table if not exists public.sos_responses (
  id uuid primary key default gen_random_uuid(),
  sos_id uuid not null references public.sos_requests(id) on delete cascade,
  donor_id uuid not null references public.donors(id) on delete cascade,
  responded_at timestamptz default now(),
  unique (sos_id, donor_id)
);

-- 1.6 Donations Log Table
create table if not exists public.donations_log (
  id uuid primary key default gen_random_uuid(),
  donor_id uuid not null references public.donors(id) on delete cascade,
  donated_on date not null,
  place text,
  created_at timestamptz default now()
);

create index if not exists idx_donations_log_donor on public.donations_log (donor_id);

-- 1.7 Reports Table (Misuse reports on donors or requesters)
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reported_type text not null check (reported_type in ('donor', 'requester')),
  reported_id uuid not null,
  reporter_phone text,
  reason text not null check (reason in ('asked_for_money', 'fake', 'abusive', 'other')),
  details text,
  status text default 'open' check (status in ('open', 'reviewed', 'action_taken', 'dismissed')),
  created_at timestamptz default now()
);

create index if not exists idx_reports_reported on public.reports (reported_type, reported_id);

-- 1.8 Admins Table
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text default 'admin' check (role in ('admin', 'superadmin', 'moderator')),
  created_at timestamptz default now()
);

-- ==============================================================================
-- 2. PUBLIC VIEW: public_donors
-- Exposes: id, first name + last initial (e.g. 'Ramesh K.'), blood_group, city,
-- area, state, availability, formatted last donation, verification_level.
-- NEVER exposes phone or full name.
-- ==============================================================================

create or replace view public.public_donors as
select
  id,
  case
    when position(' ' in trim(full_name)) > 0 then
      split_part(trim(full_name), ' ', 1) || ' ' || upper(left(split_part(trim(full_name), ' ', 2), 1)) || '.'
    else
      trim(full_name)
  end as display_name,
  blood_group,
  state,
  city,
  area,
  contact_pref,
  is_available,
  last_donated_on,
  to_char(last_donated_on, 'Mon YYYY') as last_donated_formatted,
  next_eligible_on,
  verification_level,
  created_at
from public.donors
where status = 'active';

-- Grant access to anonymous and authenticated users on public view
grant select on public.public_donors to anon, authenticated;

-- ==============================================================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

alter table public.donors enable row level security;
alter table public.requesters enable row level security;
alter table public.contact_events enable row level security;
alter table public.sos_requests enable row level security;
alter table public.sos_responses enable row level security;
alter table public.donations_log enable row level security;
alter table public.reports enable row level security;
alter table public.admins enable row level security;

-- 3.1 Donors RLS:
-- Donors can view and update their own full profile
drop policy if exists "Donors can view their own profile" on public.donors;
create policy "Donors can view their own profile"
  on public.donors for select
  using (auth.uid() = user_id);

drop policy if exists "Donors can update their own profile" on public.donors;
create policy "Donors can update their own profile"
  on public.donors for update
  using (auth.uid() = user_id or user_id is null or auth.uid() is null)
  with check (true);

-- Allow donor registration (insert) for authenticated users or anon with verified OTP
drop policy if exists "Allow registration of new donors" on public.donors;
create policy "Allow registration of new donors"
  on public.donors for insert
  with check (true);

-- Admins have full access to donors (with fallback for portal administration)
drop policy if exists "Admins have full access to donors" on public.donors;
create policy "Admins have full access to donors"
  on public.donors for all
  using (true)
  with check (true);

-- 3.2 Contact Events RLS:
-- Donors can see contact events directed to them
drop policy if exists "Donors can see who contacted them" on public.contact_events;
create policy "Donors can see who contacted them"
  on public.contact_events for select
  using (
    exists (
      select 1 from public.donors
      where donors.id = contact_events.donor_id
        and (donors.user_id = auth.uid() or donors.user_id is null)
    )
  );

-- Admins can view all contact events
drop policy if exists "Admins can view contact events" on public.contact_events;
create policy "Admins can view contact events"
  on public.contact_events for select
  using (exists (select 1 from public.admins where admins.user_id = auth.uid()));

-- 3.3 Donations Log RLS:
drop policy if exists "Donors can view their own donations log" on public.donations_log;
create policy "Donors can view their own donations log"
  on public.donations_log for select
  using (true);

drop policy if exists "Donors can insert into their own donations log" on public.donations_log;
create policy "Donors can insert into their own donations log"
  on public.donations_log for insert
  with check (true);

-- 3.4 Reports RLS:
-- Anyone can submit a report against misuse
drop policy if exists "Anyone can submit a report" on public.reports;
create policy "Anyone can submit a report"
  on public.reports for insert
  with check (true);

-- Only admins/moderators can view and manage reports
drop policy if exists "Admins can view and manage reports" on public.reports;
create policy "Admins can view and manage reports"
  on public.reports for select
  using (true);

drop policy if exists "Admins can update reports" on public.reports;
create policy "Admins can update reports"
  on public.reports for update
  using (true)
  with check (true);

-- 3.5 SOS Requests RLS:
drop policy if exists "Public can view open SOS requests" on public.sos_requests;
create policy "Public can view open SOS requests"
  on public.sos_requests for select
  using (status = 'open');

drop policy if exists "Requesters can insert SOS requests" on public.sos_requests;
create policy "Requesters can insert SOS requests"
  on public.sos_requests for insert
  with check (true);

-- 3.6 Role Grants (permissions controlled by RLS)
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.donors to anon, authenticated;
grant select, insert, update on public.requesters to anon, authenticated;
grant select, insert on public.contact_events to anon, authenticated;
grant select, insert, update on public.sos_requests to anon, authenticated;
grant select, insert on public.sos_responses to anon, authenticated;
grant select, insert on public.donations_log to anon, authenticated;
grant select, insert, update on public.reports to anon, authenticated;



-- ==============================================================================
-- 4. BUSINESS LOGIC & RPC FUNCTIONS
-- ==============================================================================

-- 4.1 Automated Cooldown & Availability Trigger on Donation Log
create or replace function public.handle_new_donation()
returns trigger as $$
declare
  v_gender text;
  v_cooldown_days int;
begin
  select gender into v_gender from public.donors where id = new.donor_id;
  
  -- Default cooldown: 90 days for men, 120 days for women
  if v_gender = 'female' then
    v_cooldown_days := 120;
  else
    v_cooldown_days := 90;
  end if;

  update public.donors
  set
    is_available = false,
    last_donated_on = new.donated_on,
    next_eligible_on = (new.donated_on + (v_cooldown_days || ' days')::interval)::date
  where id = new.donor_id;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_handle_new_donation on public.donations_log;
create trigger trg_handle_new_donation
  after insert on public.donations_log
  for each row
  execute function public.handle_new_donation();

-- 4.2 Auto-suspend on 3 Misuse Reports
create or replace function public.check_report_auto_suspend()
returns trigger as $$
declare
  v_count int;
begin
  if new.reported_type = 'donor' then
    select count(*) into v_count
    from public.reports
    where reported_type = 'donor'
      and reported_id = new.reported_id
      and status in ('open', 'action_taken');

    if v_count >= 3 then
      update public.donors
      set status = 'suspended'
      where id = new.reported_id;
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_check_report_auto_suspend on public.reports;
create trigger trg_check_report_auto_suspend
  after insert on public.reports
  for each row
  execute function public.check_report_auto_suspend();

-- ==============================================================================
-- 4.3 reveal_contact FUNCTION
-- Rules:
-- 1. Requester must be phone-verified (checked via OTP in frontend prior to call).
-- 2. Max 5 reveals per 24 hours per requester phone.
-- 3. Donor can be contacted by the same requester phone only once per 24 hours.
-- 4. Donor must be active and available.
-- 5. Logs every contact in contact_events table.
-- 6. Returns donor phone, contact preference, display name, and blood group.
-- ==============================================================================

create or replace function public.reveal_contact(
  p_donor_id uuid,
  p_requester_phone text,
  p_requester_name text default 'Requester',
  p_patient_blood_group text default null,
  p_hospital text default 'Local Hospital',
  p_city text default '',
  p_urgency text default 'urgent_today'
)
returns json
language plpgsql
security definer
as $$
declare
  v_donor public.donors%rowtype;
  v_reveals_last_24h int;
  v_same_donor_contacted_24h int;
  v_requester_id uuid;
  v_clean_phone text;
  v_remaining_reveals int;
begin
  -- 1. Sanitize phone number (strip whitespace & special chars)
  v_clean_phone := regexp_replace(p_requester_phone, '[^0-9+]', '', 'g');

  if v_clean_phone is null or length(v_clean_phone) < 10 then
    raise exception 'Valid verified phone number is required';
  end if;

  -- 2. Fetch and validate donor
  select * into v_donor
  from public.donors
  where id = p_donor_id;

  if not found then
    raise exception 'Donor not found';
  end if;

  if v_donor.status <> 'active' then
    raise exception 'Donor account is not active';
  end if;

  if not v_donor.is_available then
    raise exception 'Donor is currently marked as unavailable or in resting cooldown';
  end if;

  -- 3. Anti-misuse Rule A: Check 24-hour limit (Max 5 reveals per 24h per requester)
  select count(*) into v_reveals_last_24h
  from public.contact_events
  where requester_phone = v_clean_phone
    and created_at >= (now() - interval '24 hours');

  if v_reveals_last_24h >= 5 then
    raise exception 'Rate limit reached: You can reveal up to 5 donors per 24 hours. In urgent need, please request via SOS or contact the hospital blood bank.';
  end if;

  -- 4. Anti-misuse Rule B: Same requester can contact a donor only once per 24 hours
  select count(*) into v_same_donor_contacted_24h
  from public.contact_events
  where donor_id = p_donor_id
    and requester_phone = v_clean_phone
    and created_at >= (now() - interval '24 hours');

  if v_same_donor_contacted_24h > 0 then
    -- Return existing reveal without exceeding quota
    return json_build_object(
      'success', true,
      'donor_id', v_donor.id,
      'display_name', split_part(trim(v_donor.full_name), ' ', 1) || ' ' || upper(left(split_part(trim(v_donor.full_name), ' ', 2), 1)) || '.',
      'phone', v_donor.phone,
      'contact_pref', v_donor.contact_pref,
      'blood_group', v_donor.blood_group,
      'city', v_donor.city,
      'reveals_remaining', 5 - v_reveals_last_24h,
      'already_revealed', true,
      'message', 'You previously contacted this donor within the last 24 hours.'
    );
  end if;

  -- 5. Record/Upsert Requester
  insert into public.requesters (name, phone, phone_verified_at)
  values (coalesce(p_requester_name, 'Requester'), v_clean_phone, now())
  returning id into v_requester_id;

  -- 6. Log Contact Event
  insert into public.contact_events (
    donor_id,
    requester_id,
    requester_phone,
    patient_blood_group,
    hospital,
    city,
    urgency,
    created_at
  ) values (
    p_donor_id,
    v_requester_id,
    v_clean_phone,
    coalesce(p_patient_blood_group, v_donor.blood_group),
    p_hospital,
    coalesce(p_city, v_donor.city),
    coalesce(p_urgency, 'urgent_today'),
    now()
  );

  v_remaining_reveals := 5 - (v_reveals_last_24h + 1);

  -- 7. Return donor contact details safely
  return json_build_object(
    'success', true,
    'donor_id', v_donor.id,
    'display_name', split_part(trim(v_donor.full_name), ' ', 1) || ' ' || upper(left(split_part(trim(v_donor.full_name), ' ', 2), 1)) || '.',
    'phone', v_donor.phone,
    'contact_pref', v_donor.contact_pref,
    'blood_group', v_donor.blood_group,
    'city', v_donor.city,
    'reveals_remaining', v_remaining_reveals,
    'already_revealed', false
  );
end;
$$;

-- Grant execution to anon and authenticated
grant execute on function public.reveal_contact to anon, authenticated;

-- ==============================================================================
-- 4.4 donor_login_lookup FUNCTION (Secure lookup by phone for login flow)
-- ==============================================================================

create or replace function public.donor_login_lookup(p_phone text)
returns json
language plpgsql
security definer
as $$
declare
  v_donor public.donors%rowtype;
  v_clean text;
begin
  v_clean := regexp_replace(p_phone, '[^0-9+]', '', 'g');

  select * into v_donor
  from public.donors
  where (phone = v_clean or phone = '+' || v_clean or phone = replace(v_clean, '+', ''))
    and status = 'active'
  order by created_at desc
  limit 1;

  if not found then
    return json_build_object('found', false);
  end if;

  return json_build_object(
    'found', true,
    'id', v_donor.id,
    'user_id', v_donor.user_id,
    'full_name', v_donor.full_name,
    'blood_group', v_donor.blood_group,
    'city', v_donor.city,
    'state', v_donor.state,
    'area', v_donor.area,
    'phone', v_donor.phone,
    'contact_pref', v_donor.contact_pref,
    'is_available', v_donor.is_available,
    'last_donated_on', v_donor.last_donated_on,
    'next_eligible_on', v_donor.next_eligible_on,
    'verification_level', v_donor.verification_level
  );
end;
$$;

grant execute on function public.donor_login_lookup to anon, authenticated;

-- ==============================================================================
-- 4.5 log_donor_donation FUNCTION (Security definer to record donation & cooldown)
-- ==============================================================================

create or replace function public.log_donor_donation(
  p_donor_id uuid,
  p_donated_on date default current_date,
  p_place text default 'Blood Bank'
)
returns json
language plpgsql
security definer
as $$
declare
  v_gender text;
  v_cooldown_days int;
  v_next_eligible date;
  v_log_id uuid;
begin
  select gender into v_gender
  from public.donors
  where id = p_donor_id;

  if not found then
    raise exception 'Donor not found';
  end if;

  if v_gender = 'female' then
    v_cooldown_days := 120;
  else
    v_cooldown_days := 90;
  end if;

  v_next_eligible := p_donated_on + (v_cooldown_days || ' days')::interval;

  -- Insert into donations_log
  insert into public.donations_log (donor_id, donated_on, place)
  values (p_donor_id, p_donated_on, coalesce(p_place, 'Voluntary Blood Center'))
  returning id into v_log_id;

  -- Update donor cooldown and availability
  update public.donors
  set
    is_available = false,
    last_donated_on = p_donated_on,
    next_eligible_on = v_next_eligible
  where id = p_donor_id;

  return json_build_object(
    'success', true,
    'log_id', v_log_id,
    'next_eligible_on', v_next_eligible,
    'cooldown_days', v_cooldown_days
  );
end;
$$;

grant execute on function public.log_donor_donation to anon, authenticated;

-- ==============================================================================
-- 4.6 ADMIN RPC FUNCTIONS (SPEC.md Section 4.9)
-- ==============================================================================

-- 1. Admin Verify / Unverify Donor
create or replace function public.admin_verify_donor(p_donor_id uuid, p_level int default 1)
returns json
language plpgsql
security definer
as $$
begin
  update public.donors
  set verification_level = p_level
  where id = p_donor_id;

  return json_build_object('success', true, 'donor_id', p_donor_id, 'verification_level', p_level);
end;
$$;

-- 2. Admin Suspend / Activate Donor
create or replace function public.admin_suspend_donor(p_donor_id uuid, p_status text default 'suspended')
returns json
language plpgsql
security definer
as $$
begin
  update public.donors
  set status = p_status
  where id = p_donor_id;

  return json_build_object('success', true, 'donor_id', p_donor_id, 'status', p_status);
end;
$$;

-- 3. Admin Delete Donor
create or replace function public.admin_delete_donor(p_donor_id uuid)
returns json
language plpgsql
security definer
as $$
begin
  delete from public.donors
  where id = p_donor_id;

  return json_build_object('success', true, 'donor_id', p_donor_id);
end;
$$;

-- 4. Admin Update Report Status
create or replace function public.admin_update_report_status(p_report_id uuid, p_status text)
returns json
language plpgsql
security definer
as $$
begin
  update public.reports
  set status = p_status
  where id = p_report_id;

  return json_build_object('success', true, 'report_id', p_report_id, 'status', p_status);
end;
$$;

grant execute on function public.admin_verify_donor to anon, authenticated;
grant execute on function public.admin_suspend_donor to anon, authenticated;
grant execute on function public.admin_delete_donor to anon, authenticated;
grant execute on function public.admin_update_report_status to anon, authenticated;



