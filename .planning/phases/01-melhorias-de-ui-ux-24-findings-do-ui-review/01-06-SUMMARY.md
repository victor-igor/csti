---
phase: 01-melhorias-de-ui-ux-24-findings-do-ui-review
plan: 06
subsystem: solicitacao
tags: [f-04, cancel, confirm-dialog, ux]
dependency_graph:
  requires: [01-04-PLAN.md]
  provides: [useCancelSolicitacao, cancel-button-ui]
  affects: [SolicitacaoDetailPage, useSolicitacao]
tech_stack:
  added: []
  patterns: [useMutation-onSuccess-navigate, ConfirmDialog-pattern]
key_files:
  created: []
  modified:
    - src/features/solicitacao/useSolicitacao.ts
    - src/features/solicitacao/SolicitacaoDetailPage.tsx
decisions:
  - "Cancel button only shown when !isPrestador AND status in (aberta, aguardando_orcamento) — UI guard complementing RLS"
  - "ConfirmDialog reuses existing component — no new dependencies"
  - "Pre-existing build errors in useOrcamento.ts and OrdemServicoDetailPage.tsx are out-of-scope and deferred"
metrics:
  duration: "~10 min"
  completed: "2026-05-11"
requirements: [F-04]
---

# Phase 01 Plan 06: F-04 Cliente Cancelar Solicitação Summary

Cliente pode cancelar sua própria solicitação (status aberta/aguardando_orcamento) via botão destrutivo com ConfirmDialog, mutation UPDATE status='cancelado', toast e redirect.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Hook useCancelSolicitacao | 0d6ad66 | useSolicitacao.ts |
| 2 | Botão Cancelar + ConfirmDialog | 442d023 | SolicitacaoDetailPage.tsx |

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None.

## Threat Flags

No new security surface introduced beyond what the plan's threat model covers (T-01-17, T-01-18, T-01-19). RLS on solicitacoes_orcamento is the server-side truth; UI guard is defense-in-depth.

## Self-Check: PASSED

- `src/features/solicitacao/useSolicitacao.ts` — FOUND, contains useCancelSolicitacao
- `src/features/solicitacao/SolicitacaoDetailPage.tsx` — FOUND, contains podeCancelar + ConfirmDialog
- Commit 0d6ad66 — FOUND
- Commit 442d023 — FOUND
- `npx tsc --noEmit` — no errors in solicitacao files (pre-existing errors in unrelated files deferred)
