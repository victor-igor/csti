---
phase: 01-melhorias-de-ui-ux-24-findings-do-ui-review
plan: "07"
subsystem: ordem-servico
tags: [F-17, F-06, user-card, cross-links, profiles-join]
dependency_graph:
  requires: [01-01-PLAN.md]
  provides: [contraparte-card, cross-navigation-links]
  affects: [OrdemServicoDetailPage, useOrdemServico]
tech_stack:
  added: []
  patterns: [supabase-fk-join, react-router-link, tel-href]
key_files:
  created: []
  modified:
    - src/features/ordem-servico/useOrdemServico.ts
    - src/features/ordem-servico/OrdemServicoDetailPage.tsx
decisions:
  - Used FK alias syntax (profiles!ordens_servico_prestador_id_fkey) confirmed from supabase.ts
  - contraparte resolved by role at render time (no extra fetch)
  - Pre-existing build errors in MobileDrawer/authSchemas/useOrcamento deferred (out of scope)
metrics:
  duration: ~10min
  completed: "2026-05-11"
  tasks_completed: 2
  files_modified: 2
---

# Phase 01 Plan 07: F-17 + F-06 Contacts and Cross-Links in OS Detail Summary

**One-liner:** Supabase profiles join exposes prestador/cliente identity + tel link + Ver Solicitação/Ver Orçamento cross-links in OrdemServicoDetailPage.

## Tasks Completed

| # | Name | Commit | Files |
|---|------|--------|-------|
| 1 | Extend useGetOrdemServico with profiles join | 4077739 | useOrdemServico.ts |
| 2 | UI: UserCard + cross-links in OrdemServicoDetailPage | fd67c10 | OrdemServicoDetailPage.tsx |

## Deviations from Plan

None — plan executed exactly as written. Pre-existing build errors (MobileDrawer.tsx, authSchemas.ts, useOrcamento.ts) exist on main branch prior to this plan and are out of scope.

## Deferred Items

Pre-existing TS/build errors logged for awareness:
- `src/components/layout/MobileDrawer.tsx` — missing `navLinks` module
- `src/features/auth/authSchemas.ts` — zod overload mismatch
- `src/features/orcamento/useOrcamento.ts` — Record type mismatch

## Known Stubs

None — contraparte data flows from Supabase join; if RLS blocks it, UI degrades gracefully (block hidden).

## Threat Flags

None — T-01-20 (profiles join) handled via graceful null degradation; T-01-21 (tel: href) accepted per plan.

## Self-Check: PASSED

- `4077739` exists in git log
- `fd67c10` exists in git log
- `src/features/ordem-servico/useOrdemServico.ts` modified with profiles join
- `src/features/ordem-servico/OrdemServicoDetailPage.tsx` modified with UserCard + links
