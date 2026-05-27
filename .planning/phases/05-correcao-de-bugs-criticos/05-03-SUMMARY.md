---
phase: 5
plan: "05-03"
subsystem: navigation, orcamento
tags: [bug-fix, nav, prestador, orcamento]
dependency_graph:
  requires: []
  provides: [prestador/orcamentos route, OrcamentoPrestadorPage]
  affects: [useNavLinks.ts, App.tsx]
tech_stack:
  added: []
  patterns: [React Query, ListPageShell, StatusFilterChips]
key_files:
  created:
    - src/features/orcamento/OrcamentoPrestadorPage.tsx
  modified:
    - src/App.tsx
    - src/components/layout/useNavLinks.ts
decisions:
  - Reutilizar useListOrcamentosPrestador existente em vez de criar novo hook
  - Prestador recebe link "Meus Orcamentos" em vez de remover o item do menu (melhor UX)
  - Rota /prestador/orcamentos inserida antes de /prestador/orcamentos/:id para evitar conflito de rota
metrics:
  duration: "15min"
  completed_date: "2026-05-26"
  tasks_completed: 3
  files_changed: 3
---

# Phase 5 Plan 03: Menu prestador — criar pagina Meus Orcamentos e corrigir link nav (REVISED)

Criacao da pagina `OrcamentoPrestadorPage` para listar orcamentos do prestador autenticado, registro de rota `/prestador/orcamentos` no App.tsx, e atualizacao do `useNavLinks.ts` para apontar prestadores para a nova pagina em vez do `/orcamentos` que tinha RoleGuard bloqueando seu acesso.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Criar OrcamentoPrestadorPage | 840c7ff | src/features/orcamento/OrcamentoPrestadorPage.tsx |
| 2 | Registrar rota no App.tsx | 9473993 | src/App.tsx |
| 3 | Atualizar useNavLinks.ts | e257671 | src/components/layout/useNavLinks.ts |

## Deviations from Plan

None. Revised plan executed exactly as specified. The original plan (05-03) would have removed "Orcamentos" from prestador menu entirely; this revised plan creates a dedicated page instead, providing better UX.

## Decisions Made

1. Reused existing `useListOrcamentosPrestador()` hook rather than creating a new query
2. Prestador sees "Meus Orcamentos" label (not "Orcamentos") to distinguish from the cliente view
3. Route ordering: `/prestador/orcamentos` placed before `/:id` sub-routes to prevent route conflict

## Known Stubs

None. The page is fully wired to real Supabase data via `useListOrcamentosPrestador()`.

## Threat Flags

None. No new auth surface introduced. Route is inside existing `RoleGuard(['prestador', 'admin', 'super_admin'])`.

## Self-Check: PASSED

- [x] `src/features/orcamento/OrcamentoPrestadorPage.tsx` exists
- [x] `src/App.tsx` contains `import('@/features/orcamento/OrcamentoPrestadorPage')`
- [x] `src/components/layout/useNavLinks.ts` contains `/prestador/orcamentos`
- [x] Commits 840c7ff, 9473993, e257671 exist in git log
- [x] `npm run typecheck` exits 0
