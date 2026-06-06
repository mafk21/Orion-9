# ORION-9 — Comprehensive Audit Report & Implementation Plan

**Audit Date:** June 4, 2025  
**Project:** ORION-9 Deep Space Rescue Investigation System  
**Stack:** Next.js 15 (App Router), React 18, TypeScript, Tailwind CSS, Supabase  
**Version:** 0.1.0

---

## EXECUTIVE SUMMARY

ORION-9 is a **well-architected sci-fi investigation game** with solid foundations in authentication, team management, mission tracking, and admin capabilities. The project demonstrates thoughtful design patterns including Row-Level Security (RLS), proper TypeScript typing, component-based architecture, and configurable game rules.

**Overall Assessment:** 75% Complete  
**Production Ready:** No — requires critical fixes  
**Security Posture:** Good (with noted exceptions)  
**Architecture Quality:** Strong

### Key Findings Summary

| Category | Count | Severity |
|----------|-------|----------|
| Critical Bugs | 3 | 🔴 High |
| Security Issues | 4 | 🟠 Medium-High |
| Missing Features | 8 | 🟡 Medium |
| Database Issues | 2 | 🟡 Medium |
| Hardcoded Content | 2 | 🟡 Medium |
| Architecture Concerns | 3 | 🟢 Low-Medium |

---

## 1. EXISTING SYSTEMS ✓

### 1.1 Authentication & Authorization
- ✅ Supabase Auth integration (signUp, signIn, signOut)
- ✅ Session persistence via `sb-access-token` cookie
- ✅ Three clearance levels: `OPERATIVE`, `COMMAND`, `OMEGA`
- ✅ Auto-profile creation on signup (trigger-based)
- ✅ AuthContext with full state hydration (user, profile, membership, team)
- ✅ Protected routes via middleware
- ✅ OmegaGuard for admin-only access

### 1.2 Team System
- ✅ Team creation with validation (5-15 chars, no spaces, unique names)
- ✅ Join codes (6-char auto-generated, unique)
- ✅ Permanent membership (single team per user, enforced by unique constraint)
- ✅ Five roles: captain, engineer, analyst, medic, hacker
- ✅ Role uniqueness per team (unique team_id, role constraint)
- ✅ Team size validation (max 5 members via trigger)
- ✅ Attempt tracking (configurable max attempts)
- ✅ Auto-lock on max attempts reached (trigger-based)
- ✅ Phase progression (1→2→3→4)
- ✅ Team status: active, failed, completed

### 1.3 Mission System
- ✅ CRUD operations (admin + service layer)
- ✅ Team-specific or global missions
- ✅ Phase assignment (1-4)
- ✅ Difficulty levels (1-5)
- ✅ Status tracking (active, completed, failed)
- ✅ Flexible JSONB payload (briefing, objectives, clues, timeline, fragments)
- ✅ Attempt recording with auto-phase advancement
- ✅ Mission detail page with attempt panel

### 1.4 Signal System
- ✅ CRUD operations
- ✅ Team-specific or public signals
- ✅ Status progression (received → decoded → resolved)
- ✅ Linked mission support
- ✅ Signal data structure (transcript, authenticity, origin, resolution)
- ✅ Signal feed with filtering

### 1.5 Solo Challenge System
- ✅ Challenge CRUD (admin-managed)
- ✅ Per-user progress tracking
- ✅ Hint unlocking mechanism
- ✅ Phase association
- ✅ Code fragment fields
- ✅ Progress visualization

### 1.6 System Logs & Telemetry
- ✅ Log injection (admin + service layer)
- ✅ Team-specific or global logs
- ✅ Phase tagging
- ✅ Hidden log support (OMEGA-only visibility)
- ✅ Log feed display with filtering
- ✅ Archive integration

### 1.7 Admin Panel (OMEGA-only)
- ✅ Missions tab: Create, delete, status changes
- ✅ Teams tab: Lock/unlock, reset attempts, force fail
- ✅ Solo tab: Create, update hints, delete challenges
- ✅ Signals tab: Inject, status changes, delete
- ✅ System tab: Inject logs, simulate failures, view admin actions
- ✅ Config tab: Game configuration, endgame options management
- ✅ All actions logged to `admin_actions` table

### 1.8 Database Schema
- ✅ 12 tables: profiles, teams, team_members, missions, signals, solo_challenges, solo_progress, system_logs, attempts, admin_actions, game_config, endgame_options
- ✅ 5 enums: orion_clearance, orion_team_role, orion_team_status, orion_mission_status, orion_signal_status
- ✅ RLS policies on all tables
- ✅ Triggers: handle_new_user, generate_join_code, validate_team_name, validate_team_size, touch_updated_at, increment_attempt_count
- ✅ Helper functions: current_profile_id(), current_team_id(), is_omega()

### 1.9 Routes & Navigation
- ✅ Public: `/`, `/auth`, `/scan`, `/leaderboard`, `/mode-select`
- ✅ Protected: `/dashboard`, `/missions`, `/crew`, `/signals`, `/solo`, `/archive`, `/endgame`
- ✅ Admin: `/admin` (OMEGA-guarded)
- ✅ Proper redirects based on auth state

### 1.10 UI/Theme System
- ✅ HUD-style glassmorphism components
- ✅ Neon color palette (cyan, violet, amber, rose)
- ✅ Starfield background component
- ✅ Signal wave animations
- ✅ Radar scan animation
- ✅ Responsive layout (mobile-first)
- ✅ Reusable UI components (Card, Button, Badge, Dialog, Modal, etc.)

---

## 2. MISSING SYSTEMS ❌

### 2.1 Critical Missing Features

#### 2.1.1 Mission Objectives Management (HIGH PRIORITY)
**Issue:** Mission payload supports objectives but no UI exists to manage them.

```typescript
// types/database.ts
export interface MissionPayload {
  objectives?: Array<{ id: string; label: string; complete?: boolean }>
}
```

**Missing:**
- UI to add/edit/remove objectives in admin panel
- UI for players to mark objectives complete
- Objective checklist display on mission detail page
- Backend service for objective updates

**Impact:** Missions lack interactive goal tracking; reduces engagement.

---

#### 2.1.2 Profile Management (MEDIUM PRIORITY)
**Issue:** Users cannot update their callsign after registration.

**Missing:**
- Profile edit page/component
- Callsign change functionality
- Avatar/customization support
- XP history view

**Current State:** Callsign auto-generated from email prefix.

---

#### 2.1.3 Attempt History Display (MEDIUM PRIORITY)
**Issue:** Attempts are recorded but never displayed to users.

**Missing:**
- Attempt history panel on dashboard
- Success/failure rate statistics
- Phase-specific attempt breakdown
- Visual attempt timeline

**Impact:** Players cannot track their performance over time.

---

#### 2.1.4 Storage/Attachments System (LOW PRIORITY)
**Issue:** `services/storage.ts` exists but is unused.

**Missing:**
- File upload integration with Supabase Storage
- Attachment support for signals
- Archive downloads
- Evidence file management

---

#### 2.1.5 Encryption/Decryption (LOW PRIORITY)
**Issue:** Spec mentions encryption but no implementation exists.

**Missing:**
- Signal data encryption at rest
- Decryption UI for authorized users
- Key management

---

### 2.2 Feature Gaps

#### 2.2.1 Crew Roster Enhancements
**Current:** Static display of team members  
**Missing:**
- Member contribution stats
- XP per member
- Activity timeline
- Role change history

#### 2.2.2 Leaderboard Granularity
**Current:** Raw XP ranking only  
**Missing:**
- Per-phase rankings
- Challenge completion rates
- Signal decode rates
- Time-based filters (weekly, monthly)

#### 2.2.3 Real-time Updates
**Current:** Manual refresh required  
**Missing:**
- Supabase Realtime subscriptions
- Live signal notifications
- Live mission status updates
- Live team activity feed

---

## 3. BUGS 🐛

### 3.1 CRITICAL: Duplicate Trigger Logic

**Location:** `sql/schema.sql` lines 227-262 AND lines 365-388

**Issue:** Two triggers handle attempt counting:
1. `attempts_increment_count` (lines 260-262)
2. `attempts_after_insert` (lines 386-388)

Both triggers fire on INSERT and both increment `attempt_count`. This causes **double-counting** of failed attempts.

```sql
-- First trigger (line 260)
create trigger attempts_increment_count
  after insert on public.attempts
  for each row execute function public.increment_attempt_count();

-- Second trigger (line 386)  
create trigger attempts_after_insert
  after insert on public.attempts
  for each row execute function public.handle_attempt_after_insert();
```

**Impact:** Teams reach max attempts in half the intended attempts (e.g., locked after 1-2 failures instead of 3).

**Fix:** Remove one trigger. Recommend keeping `increment_attempt_count()` as it properly reads from `game_config`.

---

### 3.2 CRITICAL: Endgame Option Update Bug

**Location:** `components/admin/AdminGameConfigTab.tsx` line ~180

**Issue:** `toggleCorrect` function creates new options instead of updating existing ones.

```typescript
async function toggleCorrect(id: string, current: boolean) {
  // ...
  for (const opt of updated) {
    if (opt.is_correct || opt.is_correct !== options.find((o) => o.id === opt.id)?.is_correct) {
      await createEndgameOption({ label: opt.label, is_correct: opt.is_correct, position: opt.position });
      // Should use updateEndgameOption instead!
    }
  }
}
```

**Impact:** Toggling correct answer creates duplicate entries; database pollution.

**Fix:** Replace `createEndgameOption` with `updateEndgameOption(id, patch)`.

---

### 3.3 CRITICAL: Middleware Cookie Name Mismatch

**Location:** `middleware.ts` line 4

**Issue:** Middleware checks for `sb-access-token` but Supabase may use different cookie format.

```typescript
const SESSION_COOKIE = 'sb-access-token';
```

**Impact:** Protected route redirects may fail if cookie name doesn't match actual Supabase session cookie.

**Fix:** Verify Supabase JS client cookie configuration matches middleware expectation. Consider using Supabase's `getSession()` server-side instead.

---

### 3.4 HIGH: Race Condition in Team Join

**Location:** `services/teams.ts` - `joinTeam()` function

**Issue:** Check-then-insert pattern without transaction:

```typescript
export async function joinTeam(joinCode: string, userId: string, role: TeamRole) {
  const existing = await fetchMembership(userId);  // Check 1
  if (existing) throw new Error('...');

  const team = await fetchTeamByJoinCode(joinCode);  // Check 2
  if (!team) throw new Error('...');
  if (team.locked) throw new Error('...');

  const { data: roleClash } = await supabase...  // Check 3
  if (roleClash) throw new Error('...');

  const { error } = await supabase.insert(...)  // Insert
}
```

**Impact:** Concurrent joins could exceed team size limit or assign duplicate roles.

**Fix:** Use Supabase transaction or move validation entirely to database triggers.

---

## 4. SECURITY ISSUES 🔒

### 4.1 MEDIUM-HIGH: Client-Side Clearance Check

**Location:** Multiple components check `isOmega` client-side

**Issue:** Components like `SealedRoom.tsx` check config client-side:

```typescript
if (!gameConfig || gameConfig.endgame_master_code === 'UNSET') {
  return <HudFrame>Endgame not configured.</HudFrame>;
}
```

**Risk:** While RLS protects data, logic bypass is possible if client modifies responses.

**Recommendation:** Move critical game logic validation to server-side RPC functions.

---

### 4.2 MEDIUM: Environment Variable Exposure

**Location:** `.env.local` requirements

**Issue:** `NEXT_PUBLIC_SUPABASE_ANON_KEY` is exposed to client (by design for Supabase).

**Risk:** Anon key allows any operation permitted by RLS. If RLS is misconfigured, data exposure occurs.

**Current Mitigation:** RLS policies appear correctly configured.

**Recommendation:** Regular RLS policy audits; consider edge functions for sensitive operations.

---

### 4.3 MEDIUM: Admin Action Logging Gaps

**Location:** Admin tabs

**Issue:** Some admin actions don't log metadata:

```typescript
// AdminTeamsTab.tsx
await logAdminAction({ 
  admin_id: user.id, 
  action: 'team.lock', 
  target_type: 'team', 
  target_id: t.id 
  // Missing: previous_state, reason
});
```

**Risk:** Audit trail incomplete for incident response.

**Recommendation:** Standardize metadata schema for all admin actions.

---

### 4.4 LOW: Rate Limiting Absent

**Issue:** No rate limiting on auth endpoints or admin actions.

**Risk:** Brute force attacks on login; admin action spam.

**Recommendation:** Implement Supabase Edge Functions rate limiting or use external service.

---

## 5. DATABASE ISSUES 🗄️

### 5.1 MEDIUM: Missing Indexes

**Issue:** Several foreign keys lack indexes:

```sql
-- Missing indexes:
-- missions.team_id (exists: missions_team_idx ✓)
-- signals.linked_mission_id (exists: signals_mission_idx ✓)
-- team_members.user_id (missing!)
-- solo_progress.user_id (missing!)
-- solo_progress.challenge_id (missing!)
```

**Impact:** Slow queries on membership lookups, progress tracking.

**Fix:** Add indexes:
```sql
create index if not exists team_members_user_idx on public.team_members(user_id);
create index if not exists solo_progress_user_idx on public.solo_progress(user_id);
create index if not exists solo_progress_challenge_idx on public.solo_progress(challenge_id);
```

---

### 5.2 MEDIUM: Cascade Delete Behavior

**Issue:** Some cascades may be too aggressive:

```sql
-- profiles: on delete cascade (appropriate)
-- teams: on delete cascade for members (appropriate)
-- missions: on delete cascade for signals? (debatable)
```

**Risk:** Accidental team deletion removes all associated data permanently.

**Recommendation:** Consider soft deletes for game-critical data; add confirmation dialogs.

---

## 6. ADMIN CAPABILITY GAPS 👨‍💼

### 6.1 User Management

**Missing:**
- View all users/profiles
- Grant/revoke OMEGA clearance
- Reset user password (must use Supabase dashboard)
- Impersonate user (for debugging)
- Ban/suspend user

### 6.2 Content Bulk Operations

**Missing:**
- Bulk mission creation (CSV import)
- Bulk signal injection
- Template system for common missions
- Scheduled content release

### 6.3 Analytics Dashboard

**Missing:**
- Active player count
- Average phase completion time
- Failure rate per phase
- Most challenging missions
- User retention metrics

### 6.4 Game State Control

**Missing:**
- Global maintenance mode
- Force phase advance for all teams
- Reset all teams (new season)
- Export game state backup

---

## 7. HARDCODED CONTENT 🔧

### 7.1 CRITICAL: Default Endgame Code

**Location:** `lib/game-logic.ts` line 54

```typescript
export const MASTER_CODE_EXPECTED = 'UNSET';  // Deprecated comment but still referenced
```

**Status:** Partially fixed — now uses `game_config.endgame_master_code`  
**Remaining Issue:** Fallback behavior when config is missing should be more explicit.

---

### 7.2 MEDIUM: Seed Operator Credentials

**Location:** `README.md`, `lib/constants.ts`

```typescript
export const SEED_OPERATOR = {
  email: 'operator@orion9.space',
  password: 'orion9'
};
```

**Risk:** Well-known default credentials; must be changed in production.

**Recommendation:** 
- Remove hardcoded password from codebase
- Document one-time setup process
- Force password change on first login

---

## 8. ARCHITECTURE PROBLEMS 🏗️

### 8.1 MEDIUM: Supabase Client Initialization

**Location:** `lib/supabase/client.ts`

**Issue:** Proxy-based lazy initialization is clever but adds complexity:

```typescript
export const supabase: SupabaseClient = new Proxy<SupabaseClient>({} as SupabaseClient, {
  get(_, prop) {
    return Reflect.get(getClient(), prop);
  }
});
```

**Risk:** Debugging difficulty; potential SSR issues.

**Recommendation:** Consider simpler singleton pattern with explicit initialization.

---

### 8.2 LOW: Service Layer Error Handling

**Issue:** Inconsistent error handling across services:

```typescript
// Some services:
if (error) throw error;

// Others:
if (error) throw new Error('Custom message');
```

**Recommendation:** Standardize error wrapping for better UX messages.

---

### 8.3 LOW: Type Duplication

**Issue:** Some types defined in multiple places:

```typescript
// types/team.ts
export const MAX_ATTEMPTS = 3;

// lib/game-logic.ts imports and uses DEFAULT_MAX_ATTEMPTS
```

**Recommendation:** Centralize constants in single source of truth.

---

## 9. PRODUCTION READINESS 🚀

### 9.1 What's Ready

- ✅ Core authentication flow
- ✅ Team formation and management
- ✅ Basic mission/signals gameplay loop
- ✅ Admin panel for content management
- ✅ Database schema with RLS
- ✅ Responsive UI design

### 9.2 Blockers for Production

1. **Duplicate trigger bug** — breaks core game mechanic
2. **Endgame option update bug** — breaks admin configuration
3. **Missing profile management** — poor UX
4. **No rate limiting** — security risk
5. **Hardcoded credentials** — security risk

### 9.3 Recommended Pre-Launch Checklist

- [ ] Fix duplicate trigger (remove one)
- [ ] Fix endgame option toggle
- [ ] Add profile edit page
- [ ] Implement rate limiting
- [ ] Change default operator password
- [ ] Add attempt history display
- [ ] Load test with concurrent users
- [ ] Security audit of RLS policies
- [ ] Set up monitoring/alerting
- [ ] Create admin runbook

---

## PHASED IMPLEMENTATION PLAN

### Phase 1: Critical Fixes (Week 1)

**Goal:** Make game mechanically sound and secure.

#### 1.1 Fix Duplicate Trigger
- Remove `attempts_after_insert` trigger
- Keep `attempts_increment_count` (configurable)
- Test attempt counting with multiple failures

#### 1.2 Fix Endgame Option Toggle
- Update `AdminGameConfigTab.tsx` to use `updateEndgameOption`
- Add deduplication of existing duplicates
- Test toggle functionality

#### 1.3 Verify Middleware Session Handling
- Confirm cookie name matches Supabase config
- Add server-side session verification
- Test protected route redirects

#### 1.4 Security Hardening
- Remove hardcoded password from `constants.ts`
- Add rate limiting documentation
- Audit RLS policies

**Deliverables:**
- Patched SQL migration
- Updated admin component
- Security checklist

---

### Phase 2: Essential UX Improvements (Week 2)

**Goal:** Complete core user-facing features.

#### 2.1 Profile Management
- Create `/profile` page
- Add callsign edit functionality
- Display XP history
- Add avatar placeholder

#### 2.2 Attempt History
- Create attempt history panel component
- Add to dashboard and mission detail pages
- Show success/failure statistics

#### 2.3 Mission Objectives UI
- Extend admin missions tab with objectives editor
- Add objectives checklist to mission detail page
- Implement objective completion tracking

#### 2.4 Crew Roster Enhancements
- Show member XP and contributions
- Add activity indicators
- Display role assignment history

**Deliverables:**
- Profile page component
- Attempt history components
- Objectives management UI
- Enhanced roster display

---

### Phase 3: Admin Power-Ups (Week 3)

**Goal:** Empower admins with better tools.

#### 3.1 User Management Tab
- List all users with search/filter
- Grant/revoke OMEGA clearance
- View user details and history

#### 3.2 Bulk Operations
- CSV import for missions
- Template system for common content
- Batch signal injection

#### 3.3 Analytics Dashboard
- Active player metrics
- Phase completion statistics
- Failure rate analysis
- Engagement trends

#### 3.4 Game State Controls
- Maintenance mode toggle
- Season reset functionality
- State export/import

**Deliverables:**
- Admin user management tab
- Bulk import/export tools
- Analytics dashboard
- Game state controls

---

### Phase 4: Polish & Optimization (Week 4)

**Goal:** Prepare for scale and production.

#### 4.1 Performance
- Add missing database indexes
- Implement query caching where appropriate
- Optimize image/assets loading

#### 4.2 Real-time Features
- Supabase Realtime subscriptions
- Live notifications for signals
- Live team activity feed

#### 4.3 Testing
- Unit tests for services
- Integration tests for critical flows
- Load testing script

#### 4.4 Documentation
- Admin runbook
- Player guide
- API documentation
- Deployment guide

**Deliverables:**
- Performance improvements
- Real-time notifications
- Test suite
- Complete documentation

---

### Phase 5: Advanced Features (Post-Launch)

**Goal:** Expand gameplay depth.

#### 5.1 Storage Integration
- File attachments for signals
- Evidence archive
- Downloadable reports

#### 5.2 Encryption
- Signal encryption at rest
- Role-based decryption

#### 5.3 Advanced Leaderboards
- Per-category rankings
- Seasonal leaderboards
- Team vs team comparisons

#### 5.4 Mobile App
- React Native companion app
- Push notifications
- Offline mode for lore review

---

## APPENDIX A: File Inventory

### Core Services (15 files)
- `services/auth.ts` — Authentication
- `services/teams.ts` — Team management
- `services/missions.ts` — Mission CRUD
- `services/signals.ts` — Signal management
- `services/solo.ts` — Solo challenges
- `services/logs.ts` — System logs
- `services/profile.ts` — User profiles
- `services/admin.ts` — Admin actions
- `services/gameConfig.ts` — Game configuration
- `services/attempts.ts` — Attempt tracking
- `services/crew.ts` — Legacy shim
- `services/storage.ts` — Unused storage
- `services/supabase.ts` — Legacy shim
- `services/database.ts` — Type exports
- `services/roles.ts` — Role definitions

### Components (50+ files)
- Admin tabs (6 files)
- Auth components (5 files)
- UI primitives (15 files)
- Layout components (4 files)
- Feature components (20+ files)

### Pages (20+ files)
- Public pages (4 files)
- Protected pages (10 files)
- Admin pages (1 file with tabs)
- Solo pages (3 files)

### Types (10 files)
- `types/database.ts` — Core types
- `types/team.ts` — Team types
- `types/mission.ts` — Mission types
- `types/signal.ts` — Signal types
- `types/solo.ts` — Solo types
- `types/roles.ts` — Role types
- `types/admin.ts` — Admin types
- `types/log.ts` — Log types
- `types/story.ts` — Story types
- `types/story-engine.ts` — Story engine types

### SQL (3 files)
- `sql/schema.sql` — Main schema (411 lines)
- `sql/migration-001-team-system.sql` — Team enhancements
- `sql/migration-002-game-config.sql` — Configurable game rules

---

## APPENDIX B: Priority Matrix

| Issue | Impact | Effort | Priority |
|-------|--------|--------|----------|
| Duplicate trigger | Critical | Low | P0 |
| Endgame toggle bug | High | Low | P0 |
| Middleware session | High | Low | P0 |
| Profile management | Medium | Medium | P1 |
| Attempt history | Medium | Low | P1 |
| Mission objectives | Medium | Medium | P1 |
| User management | Medium | Medium | P2 |
| Analytics | Low | High | P2 |
| Real-time updates | Low | Medium | P3 |
| Storage/attachments | Low | Medium | P3 |

---

**Report Generated By:** Code Audit System  
**Next Review Date:** After Phase 1 completion
