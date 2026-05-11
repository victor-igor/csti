---
phase: 01-melhorias-de-ui-ux-24-findings-do-ui-review
plan: 03
subsystem: solicitacao
tags: [filter, chips, prestador, categoria, F-22]
dependency_graph:
  requires: []
  provides: [categoria-filter-prestador]
  affects: [SolicitacaoListPrestadorPage]
tech_stack:
  added: []
  patterns: [StatusFilterChips reuse, combined AND filter]
key_files:
  created: []
  modified:
    - src/features/solicitacao/SolicitacaoListPrestadorPage.tsx
decisions:
  - Reuse StatusFilterChips genérico com T extends string para categoria
  - Filtro combinado AND: matchesSearch && matchesCategoria
  - Chip 'Todas' usa value '' (string vazia) para retornar tudo
metrics:
  duration: 5min
  completed: "2026-05-11"
---

# Phase 01 Plan 03: F-22 Filtro por Categoria no Prestador Summary

**One-liner:** Chips de categoria acima da grid do prestador reutilizando StatusFilterChips com filtro AND combinado com busca textual.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | F-22 — Adicionar chips de categoria + filtro combinado | 42b5dc3 | SolicitacaoListPrestadorPage.tsx |

## What Was Built

- Importados `StatusFilterChips` e `CATEGORIAS` em `SolicitacaoListPrestadorPage`
- Estado `activeCategoria` inicializado com `''` (todas)
- Array `CATEGORIA_FILTERS`: chip 'Todas' (value `''`) + 6 categorias com capitalize
- Lógica `filtered` refatorada para filtro combinado AND (busca + categoria)
- JSX: `<div className="flex flex-wrap gap-2">` com `<StatusFilterChips>` entre `PageHeader` e `FilterBar`

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None.

## Threat Flags

None — filtro client-side sobre dados já carregados com RLS aplicada (T-01-08: accepted).

## Self-Check: PASSED

- File exists: src/features/solicitacao/SolicitacaoListPrestadorPage.tsx — FOUND
- Commit 42b5dc3 — FOUND
- npx tsc --noEmit — PASSED (only pre-existing baseUrl deprecation warning, no errors)
