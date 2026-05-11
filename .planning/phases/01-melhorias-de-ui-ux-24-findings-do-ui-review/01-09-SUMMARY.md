---
phase: 01-melhorias-de-ui-ux-24-findings-do-ui-review
plan: 09
subsystem: perfil
tags: [auth, perfil, formatPhone, dialog, supabase]
dependency_graph:
  requires: [01-01-PLAN.md, 01-02-PLAN.md]
  provides: [F-14-wired, F-15-implemented]
  affects: [src/pages/PerfilPage.tsx]
tech_stack:
  added: []
  patterns: [Controller-with-transform, Dialog.Root-inline]
key_files:
  modified: [src/pages/PerfilPage.tsx]
decisions:
  - Used inline Controller instead of FormField for telefone to intercept onChange with formatPhone
  - Used inline Dialog.Root (same @base-ui/react pattern as ConfirmDialog) for password change
metrics:
  duration: "~10min"
  completed_date: "2026-05-11"
---

# Phase 01 Plan 09: F-14 formatPhone wiring + F-15 troca de senha Summary

**One-liner:** Phone mask via formatPhone Controller + password-change Dialog with client validation and supabase.auth.updateUser integration.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | F-14 — formatPhone mask on telefone field | f865eaa | src/pages/PerfilPage.tsx |
| 2 | F-15 — Alterar senha Dialog + supabase integration | f865eaa | src/pages/PerfilPage.tsx |

## What Was Built

### F-14: Phone Mask (Task 1)
- Replaced `FormField name="telefone"` with a `Controller` that calls `formatPhone(e.target.value)` on every keystroke
- Added `inputMode="tel"` and `placeholder="(11) 99999-9999"`
- Imported `formatPhone` from `@/lib/utils` (created in Plan 02)
- Imported `Controller` from `react-hook-form` directly

### F-15: Password Change Dialog (Task 2)
- Added "Segurança" section below the main form with an "Alterar senha" button
- Dialog with two `type="password"` inputs: "Nova senha" + "Confirmar nova senha"
- Client-side validation: minimum 8 characters + passwords must match
- On confirm: calls `supabase.auth.updateUser({ password: novaSenha })`
- Success: `toast.success('Senha atualizada')` + dialog closes + state reset
- Error: `toast.error('Erro ao atualizar senha')` + inline error message
- Button and inputs disabled during async operation (`trocandoSenha` state)

## Deviations from Plan

None — plan executed exactly as written. Both tasks committed together as one atomic commit since Task 2 is additive to the same file.

## Pre-existing Issues (Out of Scope)

Build errors exist in other files (MobileDrawer, authSchemas, RegisterPage, OrcamentoReviewPage, OrdemServicoDetailPage, useOrcamento) — all pre-existing and unrelated to this plan. Logged to deferred-items as out-of-scope.

## Known Stubs

None — all functionality is fully wired.

## Threat Surface Scan

No new network endpoints introduced. `supabase.auth.updateUser` uses the existing authenticated session JWT — within the existing trust boundary documented in the plan's threat model (T-01-25 through T-01-27). No new threat flags.

## Self-Check: PASSED

- src/pages/PerfilPage.tsx: FOUND
- Commit f865eaa: FOUND
- `grep "formatPhone" src/pages/PerfilPage.tsx`: 2 matches
- `grep 'inputMode="tel"'`: 1 match
- `grep "não pode ser alterado"`: 1 match (Plan 01 preserved)
- `grep "supabase.auth.updateUser"`: 1 match
- `grep "Senha atualizada"`: 1 match
- `grep "Segurança"`: 1 match
