-- ============================================================================
-- ORION-9 — Migration 002: Game Configuration (configurable story content)
-- Run after sql/schema.sql and migration-001-team-system.sql
-- ============================================================================

-- Single-row configuration table for game-wide settings
create table if not exists public.game_config (
  id uuid primary key default gen_random_uuid(),
  -- Game rules
  max_team_attempts smallint not null default 3 check (max_team_attempts >= 1),
  -- Endgame configuration
  endgame_master_code text not null default 'UNSET',
  endgame_question text not null default 'Who is responsible?',
  -- Timestamps
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Endgame reveal options (admin-configurable answers)
create table if not exists public.endgame_options (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  is_correct boolean not null default false,
  -- Ordering
  position smallint not null default 1,
  -- Metadata
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.game_config enable row level security;
alter table public.endgame_options enable row level security;

-- RLS: Only OMEGA can read/modify config
create policy "game_config_omega_read" on public.game_config for select using (public.is_omega());
create policy "game_config_omega_all" on public.game_config for all using (public.is_omega()) with check (public.is_omega());

create policy "endgame_options_read" on public.endgame_options for select using (auth.uid() is not null);
create policy "endgame_options_omega_all" on public.endgame_options for all using (public.is_omega()) with check (public.is_omega());

-- Auto-update updated_at
drop trigger if exists game_config_touch_updated on public.game_config;
create trigger game_config_touch_updated
  before update on public.game_config
  for each row execute function public.touch_updated_at();

-- Seed default config (single row)
insert into public.game_config (id, max_team_attempts, endgame_master_code, endgame_question)
values ('00000000-0000-0000-0000-000000000001'::uuid, 3, 'UNSET', 'Who is responsible?')
on conflict do nothing;
