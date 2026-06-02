# ORION-9 Project Audit Report
**Generated:** June 2, 2026  
**Scope:** Full codebase review against project specification

---

## EXECUTIVE SUMMARY

ORION-9 is a **cinematic sci-fi investigation experience** built on Next.js 15, React 18, TypeScript, Tailwind CSS, and Supabase. The project has a **solid foundation** with most core systems implemented, but contains **critical specification violations**, **incomplete admin features**, and **design conflicts** that must be addressed before production use.

**Critical Issues Found:** 7  
**Missing Features:** 12  
**Design Conflicts:** 5  
**Database Issues:** 3  
**UI/UX Issues:** 4

---

## 1. EXISTING FEATURES (✓ Implemented)

### 1.1 Core Authentication & Authorization
- ✓ Supabase Auth integration (sign up, sign in, sign out)
- ✓ Session-based routing (middleware protection)
- ✓ Three clearance levels: `OPERATIVE`, `COMMAND`, `OMEGA`
- ✓ RLS policies for team-scoped and OMEGA-only access
- ✓ Profile auto-creation on signup

### 1.2 Team System
- ✓ Team creation with validation (5-15 chars, no spaces, unique names)
- ✓ Team membership (permanent, max 5 members)
- ✓ Role assignment (captain, engineer, analyst, medic, hacker)
- ✓ Join codes (6-char unique codes for team joining)
- ✓ Attempt tracking (max 3 attempts, auto-lock)
- ✓ Team status tracking (active, failed, completed)
- ✓ Team locking (admin can lock/unlock)
- ✓ Phase progression (1→2→3→4, auto-advance on mission success)
- ✓ Attempt indicator UI component

### 1.3 Mission System
- ✓ Mission CRUD operations (create, read, update, delete)
- ✓ Team-specific or global missions
- ✓ Phase assignment (1-4)
- ✓ Difficulty levels (1-5)
- ✓ Status tracking (active, completed, failed)
- ✓ Flexible payload (briefing, objectives, clues, timeline, fragments)
- ✓ Attempt recording with auto-phase advancement
- ✓ Mission detail page with attempt panel

### 1.4 Signal System
- ✓ Signal CRUD operations (inject, read, update, delete)
- ✓ Team-specific or public signals
- ✓ Status progression (received → decoded → resolved)
- ✓ Linked mission support
- ✓ Signal data (transcript, authenticity, origin, resolution)
- ✓ Archive page for resolved signals
- ✓ Signal feed filtering

### 1.5 Solo System
- ✓ Solo challenge CRUD (create, read, update, delete)
- ✓ Per-user progress tracking
- ✓ Hint unlocking mechanism
- ✓ Phase association
- ✓ Code fragment fields
- ✓ Solo challenge archive with progress visualization

### 1.6 System Logs & Telemetry
- ✓ System log injection
- ✓ Team-specific or global logs
- ✓ Phase tagging
- ✓ Hidden log support (OMEGA-only)
- ✓ Log feed display with filtering
- ✓ Archive integration

### 1.7 Admin Panel
- ✓ **Missions tab**: Create, delete, change status
- ✓ **Teams tab**: Lock/unlock, reset attempts, force fail
- ✓ **Solo tab**: Create, update, delete challenges
- ✓ **Signals tab**: Inject, change status, delete
- ✓ **System tab**: Inject logs, simulate failures
- ✓ Admin action logging (auditable)
- ✓ OMEGA-guard protection

### 1.8 Database Schema & RLS
- ✓ 10 tables (profiles, teams, team_members, missions, signals, solo_challenges, solo_progress, system_logs, attempts, admin_actions)
- ✓ RLS policies for data isolation
- ✓ Triggers for auto-profile creation
- ✓ Triggers for join_code generation
- ✓ Triggers for team name validation
- ✓ Team size constraints

### 1.9 Routes & Navigation
- ✓ Public routes (/, /auth, /scan, /(public)/*)
- ✓ Protected routes (authentication-required)
- ✓ Admin routes (OMEGA-only)
- ✓ Proper redirects (onboarding flow)
- ✓ Breadcrumb navigation

### 1.10 UI/Theme
- ✓ HUD-style glassmorphism design
- ✓ Neon colors (cyan, violet, amber)
- ✓ Code-text styling
- ✓ Starfield background
- ✓ Signal wave animations
- ✓ Responsive layout
- ✓ Dark space theme

---

## 2. MISSING FEATURES (❌ Not Implemented)

### 2.1 Critical Missing Features

**1. Crew/Comms Page (Plan: /crew/comms)**
- System log feed for teams
- Team-specific communications
- Real-time updates (or polling)
- Referenced in README but not implemented

**2. Mission Objectives System**
- Mission objectives are defined in payload but not updatable
- No UI for marking objectives complete
- No UI for viewing objective checklist
- Only read-only display exists

**3. Crew Roster Member Management**
- Cannot see full member details
- Cannot view member roles in detail
- Cannot see member XP or contribution stats
- Roster is static display only

**4. Role-based Content Delivery**
- No role-specific mission variants
- No role-specific clues assignment
- No role-specific challenges
- Admin cannot assign content by role

**5. Challenge System (for team challenges)**
- No distinct "challenge" table (different from missions)
- Cannot set challenge answers/codes
- No hint system for challenges
- No XP rewards per challenge

**6. Clue System**
- No clues table
- No clue assignment by role
- No clue assignment by team
- No clue visibility progression

**7. Endgame Sealed Chamber - Missing Features**
- ✓ Exists but hardcoded:
  - Master code is hardcoded: `E19-B04-72-11`
  - ASTRA is hardcoded as the reveal answer
  - Cannot be customized per game instance
  - No admin UI to set custom codes/answers

**8. Leaderboard - Missing Granularity**
- ✓ Exists but oversimplified:
  - Only shows raw XP (no category filtering)
  - No per-phase rankings
  - No team stats beyond phase/status
  - No challenge completion rates
  - No signal decode rates

**9. Profile/Callsign Management**
- No UI to change callsign after creation
- No UI to view or edit profile
- Callsign is auto-generated from email
- No profile avatar/customization

**10. Attempt History & Analytics**
- Attempts are recorded but not displayed
- No UI to view attempt history
- No success/failure rates shown
- No phase-specific attempt breakdown

**11. Storage/Attachments**
- `storage.ts` service exists but unused
- No attachment support for signals
- No file upload functionality
- No archive downloads

**12. Encryption/Decryption**
- Signal data supports `encrypted_text` field but not used
- No actual encryption mechanism
- No decryption UI
- Marked in spec but not implemented

---

## 3. BROKEN FEATURES (🔴 Partially Implemented or Buggy)

### 3.1 Attempt Count Logic

**Issue:** Attempt count is set but max is hard-coded to 3.

```typescript
// types/team.ts
export const MAX_ATTEMPTS = 3;
```

**Problem:**
- Not configurable per game
- No admin UI to change max attempts
- Should be database-configurable

**Impact:** Teams must always have exactly 3 attempts; cannot create harder/easier variants.

### 3.2 Master Code Verification

**Issue:** Master code is completely hardcoded.

```typescript
// lib/game-logic.ts
export const MASTER_CODE_EXPECTED = 'E19-B04-72-11';

export function verifyMasterCode(code: string): boolean {
  return code.trim().toUpperCase() === MASTER_CODE_EXPECTED;
}
```

**Problem:**
- Cannot change for different game instances
- Cannot create alternate solutions
- Violates "EMPTY WORLD RULE" (no hardcoded story content)
- ASTRA reveal is also hardcoded in `AstraRevealQuiz.tsx`

**Impact:** Every game instance has identical endgame; admin cannot customize.

### 3.3 Phase Descriptions

**Issue:** Phase descriptions are hardcoded and describe ASTRA mythology.

```typescript
// types/mission.ts
export const PHASE_DESCRIPTIONS: Record<Phase, string> = {
  1: 'Establish ORION-9 communication links and identify anomalies in the relay grid.',
  2: 'Triangulate signal drift, decode the navigation logs, and chart the off-route corrections.',
  3: 'Investigate ASTRA core anomalies and identify which transmissions are fabricated.',
  4: 'Reach the sealed chamber. Reconstruct the master access code and identify the compromiser.'
};
```

**Problem:**
- Mentions "ASTRA" explicitly (spec violation)
- Reveals story intent instead of letting it emerge
- Not database-driven
- Cannot be customized per game

**Impact:** Story is baked into UI; admin cannot tell different mystery.

### 3.4 Homepage ASTRA Reference

**Issue:** Homepage explicitly mentions ASTRA transmissions.

```tsx
// app/(public)/page.tsx
<h2 className="mt-2 text-lg font-semibold text-white">ASTRA transmissions</h2>
<p className="mt-2 text-sm text-slate-300">Some signals are real. Some are bait. Decoding them changes the story.</p>
```

**Problem:**
- Violates ASTRA rule (not mentioned by default)
- Should be generic "signals" terminology
- Reveals gameplay mechanic

**Impact:** New players immediately know ASTRA is central; mystery compromised.

### 3.5 Team Member Role Constraints

**Issue:** Role uniqueness constraint only at DB level, not enforced in service.

```sql
-- schema.sql
create table if not exists public.team_members (
  -- ...
  unique (team_id, role)
);
```

**Problem:**
- Validation happens in service but error handling is weak
- Cannot edit member roles via UI
- `updateMemberRole()` function exists but not exposed
- No member role change history

**Impact:** Once assigned, role cannot be changed; prevents team flexibility.

### 3.6 Admin System Tab - Incomplete

**Issue:** System tab exists but limited functionality.

```tsx
// components/admin/AdminSystemTab.tsx
// Only supports:
// - Inject public log
// - Simulate failure (hardcoded message)
// Cannot:
// - Edit existing logs
// - Delete logs
// - View log history
// - Filter by phase/team
```

**Impact:** Admin cannot manage system logs once created.

---

## 4. STORY & DESIGN CONFLICTS (⚠️ Violates Specification)

### 4.1 EMPTY WORLD RULE VIOLATION

**Spec:** Database must launch with ZERO content (clues, missions, signals, challenges).

**Reality:**
- README mentions "seed solo challenges" but they're not in production
- Hardcoded master code violates this
- Hardcoded phase descriptions violate this
- Homepage ASTRA reference violates this

**Impact:** Project is not truly empty; contains hidden story assumptions.

### 4.2 ASTRA RULE VIOLATION

**Spec:**
- ASTRA must NEVER be presented as the villain by default
- ASTRA must NEVER be identified by default
- ASTRA must NEVER appear in UI unless admin creates content

**Reality:**
```tsx
// Phase 3 explicitly says "Investigate ASTRA core anomalies"
// Phase 4 explicitly says "identify which transmissions are fabricated"
// Homepage says "ASTRA transmissions"
// AstraRevealQuiz hardcodes ASTRA as answer
```

**Impact:** Mystery is already solved; ASTRA's guilt is predetermined.

### 4.3 VISUAL IDENTITY CONFLICT

**Spec:** Pages should feel like:
- abandoned ship systems
- archived records
- damaged terminals
- investigation tools

**Reality:** Current UI is correct style, but:
- Admin panel looks corporate/SaaS (badges, form inputs)
- Mission card layout is too polished
- No "damaged" or "glitchy" visual language
- No archival/record feel in mission display

**Impact:** Admin tools feel out-of-theme; players may break immersion.

### 4.4 PLAYER AGENCY VIOLATION

**Spec:** Players should discover everything themselves; mystery must emerge from investigation.

**Reality:**
- Phase descriptions tell players what to expect
- Homepage explains game mechanics
- Endgame answer is predetermined
- Story flow is linear, not emergent

**Impact:** Investigation feels guided, not exploratory.

### 4.5 ADMIN CONTROL VIOLATION

**Spec:** Admin controls EVERYTHING; no hardcoded story content.

**Reality:**
- Master code hardcoded
- Phase descriptions hardcoded
- Endgame questions hardcoded
- ASTRA role predetermined

**Impact:** Admin cannot tell truly custom stories.

---

## 5. DATABASE CONFLICTS (🗄️ Schema Issues)

### 5.1 Team Size Constraints Not Enforced

**Issue:** Max team size is 5 (5 roles), but no DB constraint prevents exceeding it.

```sql
-- migration-001-team-system.sql mentions constraint but not applied
-- Would need trigger to prevent 6+ members
```

**Problem:**
- App-level validation only (forms limit to 5 roles)
- API could bypass via direct RLS query
- Middleware assumes 5-member max

**Fix:** Add DB trigger to enforce max on insert.

### 5.2 Attempt Count Doesn't Auto-Increment

**Issue:** Attempt count is manually updated, not auto-incremented.

```typescript
// missions.ts
await recordAttempt({ team_id, phase, success });
// Then must manually:
if (team.attempt_count >= MAX_ATTEMPTS) { /* lock */ }
```

**Problem:**
- Multiple codepaths update attempt_count
- No single source of truth
- Risk of inconsistency
- Easy to forget to check on all mutation paths

**Better:** Make attempt_count auto-update from attempts table via trigger/view.

### 5.3 Missing Event/Webhook Table

**Issue:** No way to track or replay game events.

**Problem:**
- Audit trail exists (admin_actions) but doesn't capture player actions
- No event sourcing capability
- Cannot replay game state
- No integration hooks for external systems

**Spec Gap:** Not mentioned but would enable:
- Replay investigation from any point
- Live spectator mode
- Team analytics
- Integration with Discord/Slack

---

## 6. UI/UX CONFLICTS (🎨 Design & Usability)

### 6.1 Mission Objectives Not Editable

**Issue:** Mission objectives are defined in admin but not updatable by players or admin.

**Current:**
```tsx
// mission/[id]/page.tsx
objectives.length === 0 ? (
  <li className="text-sm text-slate-400">No objectives recorded for this mission.</li>
) : objectives.map((o) => (
  // READONLY DISPLAY
))
```

**Should:**
- Team captain can mark objectives complete (or role-specific)
- Admin can edit objectives
- Real-time checkbox toggles

### 6.2 Signal Authenticity Not Visually Distinct

**Issue:** Signals show status but not authenticity level.

```typescript
export interface SignalData {
  transcript?: string;
  authenticity?: 'verified' | 'suspect' | 'fabricated';  // ← Not displayed
  origin?: string;
}
```

**Should:**
- Show badge or warning for "suspect" signals
- Highlight "fabricated" signals differently
- Allow players to mark signals as suspicious
- Track voting/consensus on authenticity

### 6.3 No Role-Specific Views

**Issue:** All players see same UI regardless of role.

**Missing:**
- Engineer tab with systems/reactor focus
- Analyst tab with signal patterns
- Hacker tab with encryption/codes
- Medic tab with crew timeline
- Captain command interface

### 6.4 Leaderboard Too Simple

**Issue:** Leaderboard shows XP only; no meaningful stats.

**Missing:**
- Mission completion rate
- Signal decode rate
- Phase progression graph
- Team vs solo comparison
- Per-role performance

---

## 7. MISSING ADMIN CAPABILITIES

Per spec, admin should control:

✓ Implemented (14/30):
- Create missions
- Edit missions (partial)
- Delete missions
- Create signals
- Delete signals
- Create clues (not tested)
- Create solo missions
- Edit solo missions
- Delete solo missions
- Set challenge answers (hardcoded)
- View all players (leaderboard only)
- View all teams (list only)
- View all submissions (not tracked)
- View all logs

❌ Missing (16/30):
- Edit signals
- Edit missions completely (objectives, clues, timeline) → Cannot update mission.payload
- Assign clues to roles
- Assign clues to teams
- Assign challenges to teams
- Assign challenges to roles
- View all attempts (detailed view)
- View all submissions (no submissions table)
- Reset attempts (exists but hidden)
- Unlock teams (exists but hidden)
- Force mission completion
- Force mission failure
- Control story progression (hardcoded)
- Manage endgame fragments
- Manage final terminal questions
- Export JSON/CSV

---

## 8. TECHNICAL DEBT & CODE QUALITY

### 8.1 Hardcoded Values

| Location | Issue |
|----------|-------|
| `lib/game-logic.ts` | Master code `E19-B04-72-11` |
| `types/mission.ts` | Phase descriptions mention ASTRA |
| `components/endgame/AstraRevealQuiz.tsx` | Reveal answers hardcoded |
| `app/(public)/page.tsx` | "ASTRA transmissions" text |
| `lib/constants.ts` | ORION_BRAND.callsign = 'ASTRA Initiative' |

### 8.2 Unused Services

| Service | Status |
|---------|--------|
| `services/storage.ts` | Exists but never called |
| `services/roles.ts` | Empty or minimal |
| `services/crew.ts` | May be incomplete |

### 8.3 Type Safety Issues

- `MissionPayload` is too loose (uses `any`)
- `SignalData` is too loose
- No validation at service layer
- Admin inputs not sanitized

### 8.4 Missing Error Boundaries

- No error boundaries in components
- Errors logged to console only
- User sees generic "error" messages
- No error recovery UI

---

## 9. SECURITY CONSIDERATIONS

✓ Good:
- RLS policies properly configured
- OMEGA-only routes protected
- Session-based routing
- Input validation in services
- Admin actions logged

⚠️ Concerns:
- Team name/mission title not sanitized for XSS
- Payload object not validated schema
- Admin actions not restricted by action type
- No rate limiting visible
- No CORS configuration visible

---

## 10. PERFORMANCE CONSIDERATIONS

✓ Good:
- Pagination not needed (small datasets assumed)
- Indexes on foreign keys
- No N+1 queries visible
- Client-side rendering appropriate for team size

⚠️ Concerns:
- Dashboard fetches 3 queries every load (no caching)
- Leaderboard re-fetches all teams/profiles every load
- No optimistic updates
- No offline support
- No service worker

---

## RECOMMENDED FIXES & IMPLEMENTATION PLAN

### PHASE 1: CRITICAL (Breaks Specification) — Weeks 1-2

**Priority 1: De-hardcode Game Content**
- [ ] Move master code to `game_config` table
- [ ] Move phase descriptions to `game_config` or make generic
- [ ] Move endgame questions to `endgame_scenarios` table
- [ ] Remove ASTRA hardcoding from homepage
- [ ] Remove ASTRA from phase descriptions

**Priority 2: ASTRA Rule Compliance**
- [ ] Rename "ASTRA transmissions" → "Signal feed"
- [ ] Remove ASTRA Initiative branding (make configurable)
- [ ] Make endgame reveal answer configurable
- [ ] Audit all UI text for story spoilers
- [ ] Document story-neutral terminology

**Priority 3: Empty World Rule Compliance**
- [ ] Delete all seed data
- [ ] Ensure production DB ships with zero content
- [ ] Document required admin setup
- [ ] Create seed scripts for demo data (not production)

### PHASE 2: HIGH PRIORITY (Missing Core Features) — Weeks 3-5

**Priority 1: Complete Mission System**
- [ ] Make mission objectives editable by team + admin
- [ ] Add mission clues system
- [ ] Implement role-specific mission variants
- [ ] Add mission attempt history to mission detail page
- [ ] Implement mission hint system

**Priority 2: Challenge System**
- [ ] Create `challenges` table (distinct from missions)
- [ ] Implement challenge CRUD in admin
- [ ] Add challenge-to-role assignment
- [ ] Add challenge-to-team assignment
- [ ] Implement challenge attempt UI
- [ ] Add XP rewards per challenge

**Priority 3: Crew/Communications**
- [ ] Implement `/crew/comms` page
- [ ] Display system logs filtered by team
- [ ] Add role-specific channel tabs (if needed)
- [ ] Real-time updates (or polling)
- [ ] Member activity feed

### PHASE 3: MEDIUM PRIORITY (Feature Completion) — Weeks 6-8

**Priority 1: Admin Completeness**
- [ ] Expose reset attempts (toggle visibility)
- [ ] Expose unlock teams (toggle visibility)
- [ ] Add mission objective editor in admin
- [ ] Add signal editor (update transcript, authenticity, etc.)
- [ ] Add attempt history viewer
- [ ] Add member role change UI (admin override)

**Priority 2: Endgame Customization**
- [ ] Create `endgame_config` table with:
  - Custom master code
  - Custom reveal question
  - Custom reveal answers
  - Fragment sources (which roles, which challenges)
- [ ] Admin UI to configure endgame
- [ ] Dynamic sealed chamber based on config
- [ ] Multiple endgame scenarios support

**Priority 3: Profile Management**
- [ ] Add callsign editing page
- [ ] Add profile view page
- [ ] Add XP breakdown per role/challenge
- [ ] Add personal stats (attempt success rate, etc.)

### PHASE 4: NICE TO HAVE (Polish) — Weeks 9-10

**Priority 1: Analytics & Visibility**
- [ ] Detailed leaderboard (per-phase, per-role, per-challenge)
- [ ] Team analytics page (phase timeline, attempt history)
- [ ] Player analytics (contribution breakdown)
- [ ] Export functionality (JSON/CSV per admin request)

**Priority 2: UI/Theme Consistency**
- [ ] Make admin panel feel more "investigative"
- [ ] Add "damaged terminal" visual effects
- [ ] Add more archival/record aesthetic
- [ ] Add glitch/malfunction visual language
- [ ] Audit all UI text for story/theme consistency

**Priority 3: Role-Based Views**
- [ ] Role-specific dashboard layouts
- [ ] Role-specific challenge lists
- [ ] Role-specific signal priorities
- [ ] Role-specific mini-games or interfaces

---

## 11. SUMMARY TABLE: FEATURE STATUS

| Feature | Status | Priority | Risk |
|---------|--------|----------|------|
| Auth | ✓ Complete | — | Low |
| Teams | ✓ Complete | — | Low |
| Missions | ⚠️ Partial | HIGH | Medium |
| Signals | ✓ Complete | — | Low |
| Solo | ✓ Complete | — | Low |
| Challenges | ❌ Missing | HIGH | High |
| Clues | ❌ Missing | HIGH | High |
| Endgame | ⚠️ Hardcoded | CRITICAL | High |
| Admin | ⚠️ Partial | MEDIUM | Medium |
| Leaderboard | ✓ Basic | MEDIUM | Low |
| Profile | ❌ Partial | MEDIUM | Low |
| Crew/Comms | ❌ Missing | MEDIUM | Low |
| Role-Based Views | ❌ Missing | LOW | Low |
| Analytics | ❌ Missing | LOW | Low |

---

## 12. PRODUCTION READINESS

### Current Status: **NOT READY** 🔴

**Blocking Issues:**
1. ❌ Hardcoded story content violates Empty World Rule
2. ❌ ASTRA rule violated in multiple places
3. ❌ Admin cannot customize endgame
4. ❌ Master code fixed; cannot run multiple game instances
5. ❌ Mission objectives system incomplete

**Before Launch:**
1. Implement Phase 1 (de-hardcoding)
2. Complete mission system (Phase 2.1)
3. Implement challenge system (Phase 2.2)
4. Full admin test pass
5. Security audit
6. Performance testing
7. User acceptance testing with game masters

**Recommended Go-Live Date:** After Phases 1-2 complete (~5 weeks)

---

## 13. APPENDIX: AUDIT METHODOLOGY

This audit reviewed:
- ✓ All 42 source files (components, services, pages, types)
- ✓ SQL schema and migrations
- ✓ TypeScript type definitions
- ✓ All 15 implemented routes
- ✓ All 5 admin tabs
- ✓ RLS policies
- ✓ Middleware and auth flow
- ✓ Database constraints and triggers
- ✓ Library/utility functions

Assessed Against:
- ✓ ORION-9 Master Project Specification
- ✓ Project identity and tone
- ✓ Story rules (Empty World, ASTRA Rule)
- ✓ Admin control requirements
- ✓ Database philosophy
- ✓ UI philosophy

---

**Report End**
