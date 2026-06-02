-- ============================================================================
-- ORION-9 — Deep Space Rescue Investigation System
-- Supabase schema, RLS policies, helpers, and seed data
-- ----------------------------------------------------------------------------
-- Run order:
--   1. Apply this file in the Supabase SQL editor (or via supabase db push)
--   2. Sign up the seed user `operator@orion9.space / orion9` via Supabase Auth
--   3. Re-run the SEED block at the bottom (idempotent) to elevate clearance
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0. Extensions
-- ----------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. Enumerations
-- ----------------------------------------------------------------------------
do $$ begin
  create type orion_clearance as enum ('OPERATIVE', 'COMMAND', 'OMEGA');
exception when duplicate_object then null; end $$;

do $$ begin
  create type orion_team_role as enum ('captain', 'engineer', 'analyst', 'medic', 'hacker');
exception when duplicate_object then null; end $$;

do $$ begin
  create type orion_team_status as enum ('active', 'failed', 'completed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type orion_mission_status as enum ('active', 'completed', 'failed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type orion_signal_status as enum ('received', 'decoded', 'resolved');
exception when duplicate_object then null; end $$;

-- ----------------------------------------------------------------------------
-- 2. Tables
-- ----------------------------------------------------------------------------

-- profiles ---------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  callsign text,
  xp integer not null default 0,
  clearance_level orion_clearance not null default 'OPERATIVE',
  created_at timestamptz not null default now()
);

-- teams ------------------------------------------------------------
create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phase smallint not null default 1 check (phase between 1 and 4),
  attempt_count smallint not null default 0 check (attempt_count between 0 and 3),
  status orion_team_status not null default 'active',
  locked boolean not null default false,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- team_members -----------------------------------------------------
-- Permanent membership: each user can belong to ONLY one team (unique user_id)
create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  role orion_team_role not null,
  joined_at timestamptz not null default now(),
  unique (team_id, role)
);
create index if not exists team_members_team_idx on public.team_members(team_id);

-- missions ---------------------------------------------------------
create table if not exists public.missions (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references public.teams(id) on delete cascade,
  title text not null,
  phase smallint not null check (phase between 1 and 4),
  status orion_mission_status not null default 'active',
  difficulty smallint not null default 2 check (difficulty between 1 and 5),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists missions_team_idx on public.missions(team_id);
create index if not exists missions_phase_idx on public.missions(phase);

-- signals ----------------------------------------------------------
create table if not exists public.signals (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references public.teams(id) on delete cascade,
  title text not null,
  status orion_signal_status not null default 'received',
  linked_mission_id uuid references public.missions(id) on delete set null,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists signals_team_idx on public.signals(team_id);
create index if not exists signals_mission_idx on public.signals(linked_mission_id);

-- solo_challenges --------------------------------------------------
create table if not exists public.solo_challenges (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  clue text not null,
  code_fragment text,
  lore_hint text,
  phase smallint check (phase is null or phase between 1 and 4),
  created_at timestamptz not null default now()
);

-- solo_progress (per-user completion of solo_challenges, mapped from spec) ----
create table if not exists public.solo_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  challenge_id uuid not null references public.solo_challenges(id) on delete cascade,
  completed boolean not null default false,
  unlocked_hint boolean not null default false,
  completed_at timestamptz,
  unique (user_id, challenge_id)
);

-- system_logs ------------------------------------------------------
create table if not exists public.system_logs (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references public.teams(id) on delete cascade,
  content text not null,
  phase smallint check (phase is null or phase between 1 and 4),
  hidden boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists system_logs_team_idx on public.system_logs(team_id);

-- attempts ---------------------------------------------------------
create table if not exists public.attempts (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  phase smallint not null check (phase between 1 and 4),
  success boolean not null,
  created_at timestamptz not null default now()
);
create index if not exists attempts_team_idx on public.attempts(team_id);

-- admin_actions ----------------------------------------------------
create table if not exists public.admin_actions (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.profiles(id) on delete set null,
  action text not null,
  target_type text not null,
  target_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists admin_actions_admin_idx on public.admin_actions(admin_id);

-- ----------------------------------------------------------------------------
-- 3. Helper functions
-- ----------------------------------------------------------------------------

-- Resolve current user's profile id (uses auth.uid()) ---------------
create or replace function public.current_profile_id()
returns uuid
language sql stable security definer
as $$
  select id from public.profiles where id = auth.uid();
$$;

-- Resolve current user's team id (or null) -------------------------
create or replace function public.current_team_id()
returns uuid
language sql stable security definer
as $$
  select team_id from public.team_members where user_id = auth.uid() limit 1;
$$;

-- Is the current user OMEGA clearance? -----------------------------
create or replace function public.is_omega()
returns boolean
language sql stable security definer
as $$
  select coalesce(
    (select clearance_level = 'OMEGA' from public.profiles where id = auth.uid()),
    false
  );
$$;

-- ----------------------------------------------------------------------------
-- 4. Triggers
-- ----------------------------------------------------------------------------

-- Auto-create profile row when a new auth user registers ------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer
as $$
begin
  insert into public.profiles (id, email, callsign)
  values (new.id, new.email, split_part(new.email, '@', 1))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- missions.updated_at -----------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists missions_touch_updated on public.missions;
create trigger missions_touch_updated
  before update on public.missions
  for each row execute function public.touch_updated_at();

-- attempts.increment_team_count -----------------------------------------------
-- When a failed attempt is recorded, increment the team's attempt_count
-- When max attempts reached, auto-lock the team
create or replace function public.increment_attempt_count()
returns trigger language plpgsql as $$
declare
  v_max_attempts smallint;
  v_current_count smallint;
  v_new_count smallint;
begin
  if not new.success then
    -- Get current max attempts from game_config
    select max_team_attempts into v_max_attempts from public.game_config limit 1;
    v_max_attempts := coalesce(v_max_attempts, 3);

    -- Increment attempt_count on the team
    update public.teams
    set attempt_count = attempt_count + 1
    where id = new.team_id
    returning attempt_count into v_new_count;

    -- If max attempts reached, auto-lock the team
    if v_new_count >= v_max_attempts then
      update public.teams
      set locked = true, status = 'failed'
      where id = new.team_id;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists attempts_increment_count on public.attempts;
create trigger attempts_increment_count
  after insert on public.attempts
  for each row execute function public.increment_attempt_count();

-- ----------------------------------------------------------------------------
-- 5. Row-Level Security
-- ------------------------------------------------------------------------------------------------------------------------------------------------
alter table public.profiles        enable row level security;
alter table public.teams           enable row level security;
alter table public.team_members    enable row level security;
alter table public.missions        enable row level security;
alter table public.signals         enable row level security;
alter table public.solo_challenges enable row level security;
alter table public.solo_progress   enable row level security;
alter table public.system_logs     enable row level security;
alter table public.attempts        enable row level security;
alter table public.admin_actions   enable row level security;

-- profiles ---------------------------------------------------------
drop policy if exists "profiles_self_read"  on public.profiles;
drop policy if exists "profiles_self_write" on public.profiles;
drop policy if exists "profiles_omega_all"  on public.profiles;

create policy "profiles_self_read"  on public.profiles for select using (id = auth.uid() or public.is_omega());
create policy "profiles_self_write" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy "profiles_omega_all"  on public.profiles for all    using (public.is_omega()) with check (public.is_omega());

-- teams ------------------------------------------------------------
drop policy if exists "teams_member_read" on public.teams;
drop policy if exists "teams_create"      on public.teams;
drop policy if exists "teams_omega_all"   on public.teams;

create policy "teams_member_read" on public.teams for select using (id = public.current_team_id() or public.is_omega());
create policy "teams_create"      on public.teams for insert with check (auth.uid() is not null);
create policy "teams_omega_all"   on public.teams for all    using (public.is_omega()) with check (public.is_omega());

-- team_members -----------------------------------------------------
drop policy if exists "team_members_self_read" on public.team_members;
drop policy if exists "team_members_self_join" on public.team_members;
drop policy if exists "team_members_omega"     on public.team_members;

create policy "team_members_self_read" on public.team_members for select using (user_id = auth.uid() or team_id = public.current_team_id() or public.is_omega());
create policy "team_members_self_join" on public.team_members for insert with check (user_id = auth.uid());
create policy "team_members_omega"     on public.team_members for all    using (public.is_omega()) with check (public.is_omega());

-- missions ---------------------------------------------------------
drop policy if exists "missions_team_read" on public.missions;
drop policy if exists "missions_omega_all" on public.missions;

create policy "missions_team_read" on public.missions for select using (team_id is null or team_id = public.current_team_id() or public.is_omega());
create policy "missions_omega_all" on public.missions for all    using (public.is_omega()) with check (public.is_omega());

-- signals ----------------------------------------------------------
drop policy if exists "signals_team_read" on public.signals;
drop policy if exists "signals_omega_all" on public.signals;

create policy "signals_team_read" on public.signals for select using (team_id is null or team_id = public.current_team_id() or public.is_omega());
create policy "signals_omega_all" on public.signals for all    using (public.is_omega()) with check (public.is_omega());

-- solo_challenges --------------------------------------------------
drop policy if exists "solo_challenges_read"  on public.solo_challenges;
drop policy if exists "solo_challenges_omega" on public.solo_challenges;

create policy "solo_challenges_read"  on public.solo_challenges for select using (auth.uid() is not null);
create policy "solo_challenges_omega" on public.solo_challenges for all    using (public.is_omega()) with check (public.is_omega());

-- solo_progress ----------------------------------------------------
drop policy if exists "solo_progress_self"  on public.solo_progress;
drop policy if exists "solo_progress_omega" on public.solo_progress;

create policy "solo_progress_self"  on public.solo_progress for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "solo_progress_omega" on public.solo_progress for all using (public.is_omega()) with check (public.is_omega());

-- system_logs ------------------------------------------------------
drop policy if exists "system_logs_team_read" on public.system_logs;
drop policy if exists "system_logs_omega_all" on public.system_logs;

create policy "system_logs_team_read" on public.system_logs for select using ((not hidden and (team_id is null or team_id = public.current_team_id())) or public.is_omega());
create policy "system_logs_omega_all" on public.system_logs for all    using (public.is_omega()) with check (public.is_omega());

-- attempts ---------------------------------------------------------
drop policy if exists "attempts_team_read"   on public.attempts;
drop policy if exists "attempts_team_insert" on public.attempts;
drop policy if exists "attempts_omega_all"   on public.attempts;

create policy "attempts_team_read"   on public.attempts for select using (team_id = public.current_team_id() or public.is_omega());
create policy "attempts_team_insert" on public.attempts for insert with check (team_id = public.current_team_id());
create policy "attempts_omega_all"   on public.attempts for all    using (public.is_omega()) with check (public.is_omega());

-- admin_actions ----------------------------------------------------
drop policy if exists "admin_actions_omega" on public.admin_actions;

create policy "admin_actions_omega" on public.admin_actions for all using (public.is_omega()) with check (public.is_omega());

-- ----------------------------------------------------------------------------
-- 6. Game-rule integrity
-- ----------------------------------------------------------------------------

-- Lock a team after first mission entry; fail at 3 attempts ---------
create or replace function public.handle_attempt_after_insert()
returns trigger
language plpgsql security definer
as $$
declare
  failed_count smallint;
begin
  -- Locked on first attempt of phase 1 (first mission entry)
  update public.teams set locked = true where id = new.team_id and locked = false;

  if new.success = false then
    select count(*) into failed_count from public.attempts where team_id = new.team_id and success = false;
    update public.teams
       set attempt_count = least(failed_count, 3),
           status = case when failed_count >= 3 then 'failed'::orion_team_status else status end
     where id = new.team_id;
  end if;

  return new;
end;
$$;

drop trigger if exists attempts_after_insert on public.attempts;
create trigger attempts_after_insert
  after insert on public.attempts
  for each row execute function public.handle_attempt_after_insert();

-- ----------------------------------------------------------------------------
-- 7. Seed data (idempotent)
-- ----------------------------------------------------------------------------

-- Solo challenges (phase-aware indirect clues) ----------------------
insert into public.solo_challenges (title, clue, code_fragment, lore_hint, phase)
values
  ('Drift log #019',  'Among the static, an engineer''s ledger references "E" against a recurring digit.', 'E19', 'The reactor was modified twice. The second time, off the books.', 1),
  ('Bridge fragment B04', 'The bridge tape is fractured. Listen for the count beneath the count.', 'B04', 'Navigation logs disagree by precisely four corrections.', 2),
  ('Pulse 72',        'A handheld scanner pulses 7 then 2. ASTRA filed it as noise.', '72', 'ASTRA classifies its own anomalies as background.', 3),
  ('Final remainder', 'Eleven survivors. Eleven seats. The math never balanced.', '11', 'One member never boarded. Their ID was reassigned.', 4)
on conflict do nothing;

-- Public system log (visible to everyone, phase 0/null) -------------
insert into public.system_logs (content, phase, hidden)
select 'ORION-9 long-range telemetry archive online. Awaiting operator handshake.', null, false
where not exists (select 1 from public.system_logs where content like 'ORION-9 long-range telemetry archive online%');

-- Elevate the seed operator to OMEGA (after they sign up) ----------
update public.profiles
   set clearance_level = 'OMEGA', callsign = coalesce(callsign, 'OPERATOR-PRIME')
 where email = 'operator@orion9.space';

-- ============================================================================
-- END
-- ============================================================================
