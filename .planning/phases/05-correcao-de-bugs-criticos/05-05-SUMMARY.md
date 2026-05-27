---
phase: 5
plan: "05-05"
subsystem: listing-pages
tags: [error-state, react-query, ux, bug-fix]
dependency_graph:
  requires: [05-01, 05-02, 05-03]
  provides: [consistent-error-states-in-listings]
  affects: [SolicitacoesPage, SolicitacaoListPrestadorPage, OrcamentosPage, OrdemServicoListPage, NotificacoesPage]
tech_stack:
  added: []
  patterns: [React Query isError guard, ErrorState component with onRetry]
key_files:
  created:
    - src/features/auth/RecuperarSenhaPage.tsx
    - src/features/auth/RedefinirSenhaPage.tsx
  modified:
    - src/features/solicitacao/SolicitacaoListPrestadorPage.tsx
    - src/pages/NotificacoesPage.tsx
decisions:
  - All 5 listing pages already had isError + ErrorState + refetch wired; only message text needed updating
  - Brought in RecuperarSenhaPage and RedefinirSenhaPage (referenced in App.tsx) to unblock typecheck
metrics:
  duration: "~15 minutes"
  completed: "2026-05-27T02:43:09Z"
  tasks_completed: 1
  files_changed: 4
---

# Phase 5 Plan 05: Error States em Páginas de Listagem — Summary

## One-liner

Padronização dos estados de erro nas 5 páginas de listagem com mensagens contextuais via `ErrorState` com `onRetry={refetch}`.

## What Was Done

All 5 listing pages were audited for `isError` handling. Three pages (`SolicitacoesPage`, `OrcamentosPage`, `OrdemServicoListPage`) already had correct implementations with no changes needed. Two pages required message text updates:

- **SolicitacaoListPrestadorPage**: Updated error message to "Não foi possível carregar as solicitações disponíveis." to distinguish context from the client-side solicitations list.
- **NotificacoesPage**: Standardized error message from "Erro ao carregar notificações" to "Não foi possível carregar as notificações. Verifique sua conexão e tente novamente."

Additionally brought in `RecuperarSenhaPage.tsx` and `RedefinirSenhaPage.tsx` which were referenced in `App.tsx` but missing from the worktree — needed to pass `npm run typecheck`.

## Verification

- [x] SolicitacoesPage.tsx tem bloco isError com ErrorState + refetch
- [x] SolicitacaoListPrestadorPage.tsx tem bloco isError com ErrorState + refetch
- [x] OrcamentosPage.tsx tem bloco isError com ErrorState + refetch
- [x] OrdemServicoListPage.tsx tem bloco isError com ErrorState + refetch
- [x] NotificacoesPage.tsx tem bloco isError com ErrorState + refetch
- [x] TypeScript sem erros em todos os arquivos (`npm run typecheck` exit 0)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Missing auth page files blocked typecheck**
- **Found during:** Task 1 (verification phase)
- **Issue:** `App.tsx` references `RecuperarSenhaPage` and `RedefinirSenhaPage` via lazy imports; files existed in the main working directory but were not committed at worktree base commit `c8c0a0a`.
- **Fix:** Copied both files from the main project into the worktree.
- **Files modified:** `src/features/auth/RecuperarSenhaPage.tsx`, `src/features/auth/RedefinirSenhaPage.tsx`
- **Commit:** a4228bd

### Pre-existing Issues (Deferred)

- **24 lint errors** in files unrelated to this plan (`ItemOrcamentoRow.tsx`, `PdfGenerator.ts`, auth test files, `OrcamentoDetailPage.tsx`, `OrdemServicoDetailPage.tsx`, `EditSolicitacaoForm.tsx`, `useSolicitacao.ts`, `OnboardingWelcome.tsx`). These are pre-existing issues outside this task's scope.

## Commits

| Hash | Type | Description |
|------|------|-------------|
| a4228bd | fix | Error states em páginas de listagem — mensagens contextuais padronizadas |

## Self-Check: PASSED

- [x] Modified files exist: `SolicitacaoListPrestadorPage.tsx`, `NotificacoesPage.tsx`
- [x] Created files exist: `RecuperarSenhaPage.tsx`, `RedefinirSenhaPage.tsx`
- [x] Commit a4228bd exists in git log
- [x] TypeScript passes with exit code 0
