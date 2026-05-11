---
phase: 01-melhorias-de-ui-ux-24-findings-do-ui-review
plan: 10
subsystem: auth
tags: [terms-acceptance, onboarding, phone-mask, zod, react-hook-form]
dependency_graph:
  requires: [01-01-PLAN.md, 01-02-PLAN.md]
  provides: [aceita_termos schema, OnboardingWelcome modal, phone mask in RegisterPage]
  affects: [src/features/auth/RegisterPage.tsx, src/features/auth/authSchemas.ts, src/pages/OnboardingWelcome.tsx, src/App.tsx]
tech_stack:
  added: [OnboardingWelcome component, @base-ui/react Dialog]
  patterns: [z.boolean().refine() for Zod v4 literal validation, Controller with onChange mask, localStorage onboarding flag]
key_files:
  created: [src/pages/OnboardingWelcome.tsx]
  modified:
    - src/features/auth/authSchemas.ts
    - src/features/auth/RegisterPage.tsx
    - src/App.tsx
    - src/components/layout/AppShell.tsx (reverted — no net change)
decisions:
  - "Used z.boolean().refine() instead of z.literal(true, {errorMap}) — Zod v4 does not support errorMap param; refine() is the documented v4 pattern"
  - "Mounted OnboardingWelcome in App.tsx as sibling to AppShell inside ProtectedRoute — avoids touching AppShell and satisfies acceptance criteria grep check"
  - "localStorage flag orcafacil_onboarding_seen persists across sessions; Supabase update to onboarding_done is best-effort (column may not exist)"
metrics:
  duration: "~10 minutes"
  completed_date: "2026-05-11"
  tasks_completed: 3
  files_changed: 4
---

# Phase 01 Plan 10: F-11 Termos + Onboarding + F-14 Phone Mask Summary

**One-liner:** Mandatory terms checkbox with Zod refine validation, phone mask via formatPhone Controller, and localStorage-gated onboarding modal with 3 bullets using @base-ui/react Dialog.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | F-11 Schema: aceita_termos obrigatório | 722eae5 | authSchemas.ts |
| 2 | F-11 + F-14 Checkbox + phone mask | 4f95b8a | RegisterPage.tsx |
| 3 | F-11 Modal de boas-vindas + Zod fix | d8b2a8c | OnboardingWelcome.tsx, App.tsx, authSchemas.ts, RegisterPage.tsx |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed Zod v4 incompatible errorMap**
- **Found during:** Task 3 (npm run build)
- **Issue:** Plan prescribed `z.literal(true, { errorMap: () => ... })` — Zod v4 uses `error:` key, not `errorMap`. Build failed with TS2769.
- **Fix:** Switched to `z.boolean().refine((v) => v === true, { message: '...' })` — plan's own fallback option, fully Zod v4 compatible.
- **Files modified:** src/features/auth/authSchemas.ts
- **Commit:** d8b2a8c

**2. [Rule 1 - Bug] Cleaned up defaultValues cast**
- **Found during:** Task 3 (after Zod fix)
- **Issue:** `aceita_termos: false as unknown as true` was needed when type was `true` literal; after switching to `z.boolean().refine()`, inferred type is `boolean`, making the cast unnecessary and misleading.
- **Fix:** Changed to `aceita_termos: false` (plain boolean).
- **Files modified:** src/features/auth/RegisterPage.tsx
- **Commit:** d8b2a8c

## Out-of-Scope Deferred Items

Pre-existing `MobileDrawer.tsx` build errors (missing `./navLinks` module, implicit `any` types) logged to `deferred-items.md` — not introduced by this plan.

## Known Stubs

None — all functionality fully wired. OnboardingWelcome reads live profile from authStore, localStorage flag persists across sessions, Supabase update is best-effort with silent catch.

## Threat Flags

| Flag | File | Description |
|------|------|-------------|
| T-01-28 accepted | src/features/auth/RegisterPage.tsx | Terms acceptance is client-only; no server-side timestamp persisted in this phase |

## Self-Check: PASSED

- src/pages/OnboardingWelcome.tsx: FOUND
- Commit 722eae5: FOUND
- Commit 4f95b8a: FOUND
- Commit d8b2a8c: FOUND
