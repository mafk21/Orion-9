-- ============================================================================
-- ORION-9 — Migration 001: Team system (join codes, name validation, size)
-- ----------------------------------------------------------------------------
-- Apply after sql/schema.sql. Run this in the Supabase SQL editor.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Add join_code column to teams table
-- ----------------------------------------------------------------------------
-- join_code: a unique 6-character uppercase alphanumeric code used to join teams
-- instead of sharing raw UUIDs. Generated automatically on insert.
alter table public.teams
  add column if not exists join_code text;

-- Make join_code unique and not null after backfill
-- (existing rows get a generated code)
update public.teams
  set join_code = upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6))
  where join_code is null;

alter table public.teams
  alter column join_code set not null,
  add constraint teams_join_code_unique unique (join_code);

-- Index for fast join-code lookups
create index if not exists teams_join_code_idx on public.teams(join_code);

-- ----------------------------------------------------------------------------
-- 2. Add unique constraint on team name (no duplicate names)
-- ----------------------------------------------------------------------------
-- Requires that team names are globally unique.
alter table public.teams
  add constraint teams_name_unique unique (name);

-- ----------------------------------------------------------------------------
-- 3. Auto-generate join_code on team insert
-- ----------------------------------------------------------------------------
create or replace function public.generate_join_code()
returns trigger
language plpgsql
as $$
begin
  -- Generate a 6-char uppercase alphanumeric code, ensure uniqueness
  loop
    new.join_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
    exit when not exists (select 1 from public.teams where join_code = new.join_code);
  end loop;
  return new;
end;
$$;

drop trigger if exists teams_generate_join_code on public.teams;
create trigger teams_generate_join_code
  before insert on public.teams
  for each row execute function public.generate_join_code();

-- ----------------------------------------------------------------------------
-- 4. Validate team name on insert and update
-- ----------------------------------------------------------------------------
-- Rules:
--   - No leading/trailing whitespace (already trimmed by app)
--   - No spaces allowed
--   - Minimum 5 characters
--   - Maximum 15 characters
--   - Must contain at least one letter
create or replace function public.validate_team_name()
returns trigger
language plpgsql
as $$
begin
  if length(new.name) < 5 then
    raise exception 'Team name must be at least 5 characters.';
  end if;
  if length(new.name) > 15 then
    raise exception 'Team name must be at most 15 characters.';
  end if;
  if new.name ~ '\s' then
    raise exception 'Team name must not contain spaces.';
  end if;
  if new.name !~ '[A-Za-z]' then
    raise exception 'Team name must contain at least one letter.';
  end if;
  return new;
end;
$$;

drop trigger if exists teams_validate_name on public.teams;
create trigger teams_validate_name
  before insert or update of name on public.teams
  for each row execute function public.validate_team_name();

-- ----------------------------------------------------------------------------
-- 5. Validate team size on team_members insert
-- ----------------------------------------------------------------------------
-- Rules:
--   - Minimum 3 members
--   - Maximum 5 members
--   - Checked before insert (prevent exceeding max) and after (warn on delete)
--   - The minimum is enforced at the application level by requiring 3 before
--     the team can proceed; the DB only enforces the max.
create or replace function public.validate_team_size()
returns trigger
language plpgsql
as $$
declare
  current_count integer;
begin
  select count(*) into current_count
    from public.team_members
    where team_id = new.team_id;

  if current_count >= 5 then
    raise exception 'Team is full. Maximum 5 members allowed.';
  end if;

  return new;
end;
$$;

drop trigger if exists team_members_check_size on public.team_members;
create trigger team_members_check_size
  before insert on public.team_members
  for each row execute function public.validate_team_size();

-- ----------------------------------------------------------------------------
-- 6. Function to update a member's role (leader-only)
-- ----------------------------------------------------------------------------
-- Only the team creator can change member roles. Called from the app.
create or replace function public.update_member_role(
  p_team_id uuid,
  p_member_user_id uuid,
  p_new_role orion_team_role,
  p_requested_by uuid
)
returns void
language plpgsql security definer
as $$
declare
  v_creator uuid;
begin
  -- Verify the requester is the team creator
  select created_by into v_creator from public.teams where id = p_team_id;
  if v_creator is distinct from p_requested_by then
    raise exception 'Only the team leader can assign roles.';
  end if;

  -- Check for duplicate role in the same team (except if updating the same member)
  if exists (
    select 1 from public.team_members
    where team_id = p_team_id
      and role = p_new_role
      and user_id != p_member_user_id
  ) then
    raise exception 'Role "%" is already assigned to another member.', p_new_role;
  end if;

  update public.team_members
    set role = p_new_role
    where team_id = p_team_id
      and user_id = p_member_user_id;

  if not found then
    raise exception 'Member not found in this team.';
  end if;
end;
$$;

-- ============================================================================
-- END
-- ============================================================================
