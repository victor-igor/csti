---
phase: 02-padronizar-mensagens-de-erro-para-o-usuario
plan: "04"
subsystem: ui/error-states
tags: [error-state, ui-text, microcopy, pt-br]
dependency_graph:
  requires: []
  provides: [contextual-error-messages-all-pages]
  affects: [SolicitacoesPage, OrcamentosPage, OrdemServicoListPage, SolicitacaoDetailPage, OrdemServicoDetailPage, OrcamentoDetailPage, SolicitacaoListPrestadorPage, SolicitacaoDetailDialog, OrcamentoReviewPage]
tech_stack:
  added: []
  patterns: [ErrorState component with message + onRetry props]
key_files:
  created: []
  modified:
    - src/pages/SolicitacoesPage.tsx
    - src/pages/OrcamentosPage.tsx
    - src/features/ordem-servico/OrdemServicoListPage.tsx
    - src/features/solicitacao/SolicitacaoDetailPage.tsx
    - src/features/ordem-servico/OrdemServicoDetailPage.tsx
    - src/features/orcamento/OrcamentoDetailPage.tsx
    - src/features/solicitacao/SolicitacaoListPrestadorPage.tsx
    - src/features/solicitacao/SolicitacaoDetailDialog.tsx
    - src/features/orcamento/OrcamentoReviewPage.tsx
decisions:
  - D-09 implementado: ErrorState com onRetry={refetch} em todas as páginas com isError
  - D-10 implementado: mensagens contextuais mencionando o que falhou em todas as páginas
metrics:
  duration: ~10min
  completed: 2026-05-11
  tasks_completed: 2
  files_modified: 9
---

# Phase 02 Plan 04: Contextual ErrorState Messages Summary

**One-liner:** Substituídas mensagens genéricas de erro ("Erro ao carregar", "OS não encontrada", "Orçamento não encontrado") por mensagens contextuais em PT-BR com instrução de ação em 9 páginas.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Atualizar ErrorState nas 3 páginas LIST | a620ae8 | SolicitacoesPage, OrcamentosPage, OrdemServicoListPage |
| 2 | Atualizar ErrorState nas 3 páginas DETAIL | 456d00d | SolicitacaoDetailPage, OrdemServicoDetailPage, OrcamentoDetailPage |
| deviation | Corrigir 3 páginas fora do escopo original | 8f0ed6a | SolicitacaoListPrestadorPage, SolicitacaoDetailDialog, OrcamentoReviewPage |

## What Was Built

All `ErrorState` component usages across the app now display contextual, actionable messages in PT-BR. Every message:
- Names specifically what failed (e.g., "as solicitações", "a ordem de serviço")
- Ends with "Verifique sua conexão e tente novamente."
- Has `onRetry={refetch}` connected (D-09)

### Message Map Applied

| Page | New Message |
|------|-------------|
| SolicitacoesPage | "Não foi possível carregar as solicitações. Verifique sua conexão e tente novamente." |
| OrcamentosPage | "Não foi possível carregar os orçamentos. Verifique sua conexão e tente novamente." |
| OrdemServicoListPage | "Não foi possível carregar as ordens de serviço. Verifique sua conexão e tente novamente." |
| SolicitacaoDetailPage | "Não foi possível carregar a solicitação. Verifique sua conexão e tente novamente." |
| OrdemServicoDetailPage | "Não foi possível carregar a ordem de serviço. Verifique sua conexão e tente novamente." |
| OrcamentoDetailPage | "Não foi possível carregar o orçamento. Verifique sua conexão e tente novamente." |
| SolicitacaoListPrestadorPage | "Não foi possível carregar as solicitações. Verifique sua conexão e tente novamente." |
| SolicitacaoDetailDialog | "Não foi possível carregar a solicitação. Verifique sua conexão e tente novamente." |
| OrcamentoReviewPage | "Não foi possível carregar o orçamento. Verifique sua conexão e tente novamente." |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing] Extended coverage to 3 additional pages not listed in plan**
- **Found during:** Post-task-2 final verification (`grep -rE` across all of `src/`)
- **Issue:** `SolicitacaoListPrestadorPage.tsx`, `SolicitacaoDetailDialog.tsx`, and `OrcamentoReviewPage.tsx` had the same old generic messages violating D-08 (100% PT-BR, no technical text) and D-09/D-10
- **Fix:** Applied identical contextual messages to all 3 files
- **Files modified:** src/features/solicitacao/SolicitacaoListPrestadorPage.tsx, src/features/solicitacao/SolicitacaoDetailDialog.tsx, src/features/orcamento/OrcamentoReviewPage.tsx
- **Commit:** 8f0ed6a

## Known Stubs

None — all messages are hardcoded PT-BR strings with no placeholder text.

## Threat Flags

No new network endpoints, auth paths, or trust boundary changes introduced. Threat model T-02-11 satisfied: messages are hardcoded strings and do not interpolate `error.message` or any runtime data.

## Self-Check: PASSED

Files exist:
- src/pages/SolicitacoesPage.tsx: FOUND
- src/pages/OrcamentosPage.tsx: FOUND
- src/features/ordem-servico/OrdemServicoListPage.tsx: FOUND
- src/features/solicitacao/SolicitacaoDetailPage.tsx: FOUND
- src/features/ordem-servico/OrdemServicoDetailPage.tsx: FOUND
- src/features/orcamento/OrcamentoDetailPage.tsx: FOUND

Commits:
- a620ae8: FOUND
- 456d00d: FOUND
- 8f0ed6a: FOUND

Zero old messages remain in src/: CONFIRMED (grep returned 0 lines)
