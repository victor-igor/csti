---
phase: 01-melhorias-de-ui-ux-24-findings-do-ui-review
plan: 05
subsystem: orcamento
tags: [responsive, mobile-ux, edit-mode, toast, routing]
dependency_graph:
  requires: []
  provides: [orcamento-edit-mode, mobile-total-bar, responsive-items-grid, rascunho-toast]
  affects: [OrcamentoFormPage, OrcamentoDetailPage, useOrcamento, App]
tech_stack:
  added: []
  patterns: [delete-insert item replacement, conditional mutation hook, useEffect reset for edit pre-load]
key_files:
  created: []
  modified:
    - src/features/orcamento/OrcamentoFormPage.tsx
    - src/features/orcamento/OrcamentoDetailPage.tsx
    - src/features/orcamento/useOrcamento.ts
    - src/App.tsx
decisions:
  - "useUpdateOrcamento usa delete+insert de itens_orcamento (não upsert) — aceito como rascunho apenas"
  - "Barra fixa usa lg:hidden (oculta em desktop lg+) pois TotalSummary sticky já existe na coluna direita"
  - "Modo edição detectado por params.id — reutiliza OrcamentoFormPage para criar e editar"
  - "toast.success('Rascunho salvo') em useCreateOrcamento onSuccess — aparece em todas as criações"
metrics:
  duration: "~15 min"
  completed: "2026-05-11T15:23:36Z"
  tasks_completed: 3
  files_modified: 4
---

# Phase 01 Plan 05: Bundle Orçamento (F-07, F-08, F-09, F-19) Summary

**One-liner:** Grid responsivo de itens com card vertical em mobile, barra total fixa acima do BottomNav, toast "Rascunho salvo" em criação, e modo edição completo via rota /prestador/orcamentos/:id/editar.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | F-09 + F-19 pt1 — rota + hook useUpdateOrcamento + toast | 4903a64 | src/App.tsx, src/features/orcamento/useOrcamento.ts |
| 2 | F-07 + F-08 + F-19 pt2 — form responsivo, total fixo, modo edição | c2eff58 | src/features/orcamento/OrcamentoFormPage.tsx |
| 3 | F-19 pt3 — botão Editar Rascunho em OrcamentoDetailPage | 0e2529d | src/features/orcamento/OrcamentoDetailPage.tsx |

## Findings Implemented

- **F-07:** Grid de itens mobile-first — `grid-cols-1 md:grid-cols-[2fr_1fr_1fr_auto]`, header oculto em mobile (`hidden md:grid`), label "Item #N" em mobile
- **F-08:** Barra total fixa — `fixed bottom-16 left-0 right-0 lg:hidden` com CurrencyDisplay; não sobrepõe BottomNav (h-16)
- **F-09:** `toast.success('Rascunho salvo')` em useCreateOrcamento onSuccess (antes do navigate)
- **F-19:** Rota `/prestador/orcamentos/:id/editar` dentro do RoleGuard prestador; `useUpdateOrcamento` com delete+insert de itens; `useGetOrcamento` + `useEffect reset` para pré-carga; botão "Editar Rascunho" (variant outline) em OrcamentoDetailPage quando status=rascunho

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None.

## Security Notes (Threat Model T-01-16)

**T-01-16 accepted:** `useUpdateOrcamento` executa delete+insert sem transação atômica client-side. Se o delete suceder e o insert falhar, os itens do rascunho são perdidos. Isso é aceitável para rascunhos (usuário pode re-adicionar itens). RLS protege contra edição de orçamentos de outros prestadores (T-01-13, T-01-15). A rota de edição está dentro do RoleGuard de prestador (T-01-14).

## Build Status

- `npx tsc --noEmit`: passa com aviso pré-existente sobre `baseUrl` deprecation (tsconfig.json) — não introduzido por este plano
- `npm run build`: falha com 4 erros pré-existentes em `MobileDrawer.tsx` (módulo navLinks ausente) e `DashboardPage.tsx` (prop subtitle inexistente) — confirmados presentes antes das alterações deste plano via `git stash` test

## Self-Check: PASSED

- src/App.tsx: `grep "prestador/orcamentos/:id/editar"` — FOUND
- src/features/orcamento/useOrcamento.ts: `export function useUpdateOrcamento` — FOUND
- src/features/orcamento/useOrcamento.ts: `toast.success('Rascunho salvo')` — FOUND
- src/features/orcamento/OrcamentoFormPage.tsx: `fixed bottom-16` — FOUND
- src/features/orcamento/OrcamentoFormPage.tsx: `isEditMode` — FOUND (14x)
- src/features/orcamento/OrcamentoDetailPage.tsx: `Editar Rascunho` — FOUND
- Commits 4903a64, c2eff58, 0e2529d — FOUND in git log
