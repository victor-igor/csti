---
phase: 01-melhorias-de-ui-ux-24-findings-do-ui-review
plan: 11
subsystem: ui/button-system
tags: [F-24, button, shadcn, refactor, migration]
dependency_graph:
  requires: [01-01, 01-04, 01-05, 01-06, 01-07, 01-08, 01-09, 01-10]
  provides: [unified-button-system]
  affects: [SolicitacaoFormPage, LoginPage, RegisterPage, PerfilPage, OrcamentoReviewPage, OrcamentoFormPage, ConfirmDialog]
tech_stack:
  added: []
  patterns: [shadcn-button-canonical, variant-mapping]
key_files:
  created: []
  modified:
    - src/features/solicitacao/SolicitacaoFormPage.tsx
    - src/features/auth/LoginPage.tsx
    - src/features/auth/RegisterPage.tsx
    - src/pages/PerfilPage.tsx
    - src/features/orcamento/OrcamentoReviewPage.tsx
    - src/features/orcamento/OrcamentoFormPage.tsx
    - src/components/molecules/ConfirmDialog.tsx
  deleted:
    - src/components/atoms/Button.tsx
decisions:
  - shadcn Button (@/components/ui/button) is the sole canonical button component
  - Dialog.Close native primitive retained for ConfirmDialog cancel (base-ui behavior); inline buttons replaced with Button onClick handlers in PerfilPage and OrcamentoReviewPage dialogs
  - Pre-existing build errors in MobileDrawer.tsx (missing navLinks module) are out-of-scope
metrics:
  duration: ~15min
  completed: 2026-05-11T15:42:23Z
  tasks_completed: 3
  files_modified: 7
  files_deleted: 1
---

# Phase 01 Plan 11: F-24 Unificação do Sistema de Botões — Summary

**One-liner:** Migração completa de todos os `<button>` inline com classes mágicas e eliminação de `atoms/Button.tsx` — shadcn `Button` é agora o único componente canônico de botão.

## Tasks Executed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Auditoria de usos | (no-op) | — |
| 2 | Migrar buttons inline para shadcn Button | 3f72ffa | 7 arquivos modificados |
| 3 | Deletar atoms/Button.tsx | d1929ee | 1 arquivo deletado |

## Audit Results (Task 1)

**atoms/Button imports encontrados:** NENHUM (zero arquivos importavam `@/components/atoms/Button` antes da migração)

**Inline `<button>` com `bg-primary` nos arquivos alvo:**
- `SolicitacaoFormPage.tsx:121` — submit button
- `LoginPage.tsx:72` — submit button
- `RegisterPage.tsx:147` — submit button
- `PerfilPage.tsx:179` — submit salvar button
- `PerfilPage.tsx:191` — alterar senha button
- `PerfilPage.tsx:252` — atualizar senha dialog button
- `OrcamentoReviewPage.tsx:194` — confirmar recusa dialog button
- `ConfirmDialog.tsx:38` — confirm action button
- `OrcamentoFormPage.tsx:220` — remove item (ghost, sem bg-primary — migrado para variant=ghost)

## Migrations Applied

| File | Before | After |
|------|--------|-------|
| SolicitacaoFormPage | `<button className="...bg-primary...">` | `<Button className="w-full">` |
| LoginPage | `<button className="...bg-primary...">` | `<Button className="w-full">` |
| RegisterPage | `<button className="...bg-primary...">` | `<Button className="w-full">` |
| PerfilPage (submit) | `<button className="...bg-primary...">` | `<Button className="w-full">` |
| PerfilPage (alterar senha) | `<button className="...border-border...">` | `<Button variant="outline">` |
| PerfilPage (dialog cancel) | `<Dialog.Close className="...">` | `<Button variant="outline" onClick={() => setSenhaOpen(false)}>` |
| PerfilPage (dialog confirm) | `<button className="...bg-primary...">` | `<Button>` |
| OrcamentoReviewPage (dialog cancel) | `<Dialog.Close className="...">` | `<Button variant="outline" onClick={...}>` |
| OrcamentoReviewPage (dialog confirm) | `<button className="...bg-danger...">` | `<Button variant="destructive">` |
| OrcamentoFormPage (trash) | `<button className="...h-8 w-8...">` | `<Button variant="ghost" size="icon-sm">` |
| ConfirmDialog | `<button className="...bg-primary...">` | `<Button>` |

## Deviations from Plan

### Auto-applied decisions

**1. Dialog.Close handling in PerfilPage and OrcamentoReviewPage**
- **Found during:** Task 2
- **Issue:** Plan suggested using `Dialog.Close asChild` with `<Button>` for cancel buttons, but noted this could cause slot issues. The cancel buttons in PerfilPage dialog and OrcamentoReviewPage dialog were native `Dialog.Close` primitives.
- **Fix:** Replaced `Dialog.Close` with `<Button variant="outline" onClick={() => setSenhaOpen(false)}>` / `onClick={() => setConfirmRecusar(false)}` — same behavior, no asChild slot complexity.
- **Files modified:** `src/pages/PerfilPage.tsx`, `src/features/orcamento/OrcamentoReviewPage.tsx`
- **Note:** ConfirmDialog's cancel button retained `Dialog.Close` native primitive (correct — it manages the open state via `onOpenChange`).

### Out-of-scope pre-existing issues

Deferred to `deferred-items.md`:
- `MobileDrawer.tsx` — TS2307: Cannot find module './navLinks' (pre-existing, not caused by this plan)
- `DashboardPage.tsx` — TS2322: subtitle prop type error (pre-existing, not caused by this plan)
- `tsconfig.json` — TS5101: baseUrl deprecation warning (pre-existing)

## Known Stubs

None — all button migrations are complete with real handlers.

## Threat Flags

None — pure UI refactor, no new network surface or auth paths.

## Self-Check

### Files exist check
- `src/components/ui/button.tsx` — EXISTS (canonical shadcn button)
- `src/components/atoms/Button.tsx` — DELETED (confirmed)

### Commits exist check
- `3f72ffa` — feat(01-11): F-24 migrate inline buttons to shadcn Button
- `d1929ee` — feat(01-11): F-24 delete atoms/Button.tsx — button system unified

### Acceptance criteria
- [x] `grep -r "@/components/atoms/Button" src/` returns 0 matches
- [x] All 7 target files contain `from '@/components/ui/button'`
- [x] `src/components/atoms/Button.tsx` does not exist
- [x] No new TypeScript/build errors introduced (pre-existing MobileDrawer errors unrelated)

## Self-Check: PASSED
