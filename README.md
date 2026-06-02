# ORION-9 — Deep Space Rescue Investigation System

A cinematic sci-fi investigation experience built on **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Supabase**.

## Stack

- Next.js App Router · React 18
- TypeScript (strict)
- Tailwind CSS — neon HUD theme, glassmorphism, CSS-only animations
- Supabase — Auth + Postgres with strict RLS
- Framer Motion — entrance animations

## Game design

- 4 phases of escalating ASTRA influence
- 5 fixed roles per team: `captain`, `engineer`, `analyst`, `medic`, `hacker`
- Each user belongs to **exactly one** team — membership is permanent
- Teams have **3 attempts** before permanent failure
- Endgame is a sealed-room puzzle: role fragments → captain ordering → ASTRA reveal

## Setup

### 1. Environment

Create `.env.local` at the repo root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

### 2. Apply the schema

Run the contents of `sql/schema.sql` in the Supabase SQL editor. It is idempotent and creates:

- 9 tables: `profiles`, `teams`, `team_members`, `missions`, `signals`, `solo_challenges`, `solo_progress`, `system_logs`, `attempts`, `admin_actions`
- All enums (`orion_clearance`, `orion_team_role`, etc.)
- RLS policies (team-scoped reads, OMEGA full access)
- Triggers (auto-profile-on-signup, attempt → lock & fail)
- Seed solo challenges and a public log

### 3. Seed the OMEGA operator

In Supabase Auth → Users, create user `operator@orion9.space` with password `orion9`.

Then re-run the bottom of `sql/schema.sql` (or this snippet) to elevate clearance:

```sql
update public.profiles
   set clearance_level = 'OMEGA', callsign = coalesce(callsign, 'OPERATOR-PRIME')
 where email = 'operator@orion9.space';
```

### 4. Install + run

```bash
npm install
npm run dev
```

Visit <http://localhost:3000>.

## Routes

| Path                    | Description                                |
| ----------------------- | ------------------------------------------ |
| `/`                     | Public landing                             |
| `/auth`                 | Sign in / register                         |
| `/dashboard`            | Mission control · ASTRA voice · telemetry  |
| `/missions`             | Team mission board                         |
| `/mission/[id]`         | Mission detail with attempt panel          |
| `/signals`              | Team signal feed                           |
| `/scan`                 | Radar scan console                         |
| `/solo`                 | Solo challenge archive                     |
| `/archive`              | Resolved signals + telemetry archive       |
| `/leaderboard`          | XP rankings                                |
| `/crew`                 | Crew dashboard                             |
| `/crew/team`            | Form / view team                           |
| `/crew/roles`           | Role matrix                                |
| `/crew/comms`           | System log feed                            |
| `/endgame`              | Sealed chamber puzzle (Phase 4)            |
| `/admin`                | OMEGA-only operations console              |

## Endgame

Master access vector: `E19-B04-72-11`

- **Engineer** fragment: `E19`
- **Analyst** fragment: `B04`
- **Hacker** fragment: `72`
- **Tail** (from solo Phase IV lore): `11`
- **Captain** orders the fragments

Final verification asks who compromised ORION-9. Only **ASTRA** is correct.
