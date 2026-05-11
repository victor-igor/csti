---
phase: 01-melhorias-de-ui-ux-24-findings-do-ui-review
plan: 02
subsystem: notificacoes
tags: [notifications, hooks, react-query, utils, phone-mask]
dependency_graph:
  requires: []
  provides:
    - useNotificacoes hook (lista + mark-all-read)
    - formatPhone utility
    - NotificacoesPage funcional
  affects:
    - Plans 09 e 10 (Wave 3) consomem formatPhone
    - TopBar badge invalida via useNotificacoesNaoLidas após mark-all-read
tech_stack:
  added: []
  patterns:
    - react-query useQuery + useMutation com queryKey padronizada
    - Mutation com onSuccess invalidateQueries para sincronizar badge
key_files:
  created: []
  modified:
    - src/lib/utils.ts
    - src/features/notificacoes/useNotificacoes.ts
    - src/pages/NotificacoesPage.tsx
decisions:
  - formatPhone trunca em 11 dígitos (formato celular BR) e usa regex para 10/11 dígitos
  - NotificacoesPage usa ErrorState + LoadingSkeleton padrão do projeto
  - ICON_BY_TIPO com Bell como fallback para tipos desconhecidos
  - Não convertido para Sheet/Drawer (deferred per CONTEXT.md)
metrics:
  duration: "~15 min"
  completed: "2026-05-11"
  tasks_completed: 3
  tasks_total: 3
  files_modified: 3
---

# Phase 01 Plan 02: Notificações Funcionais + formatPhone Summary

**One-liner:** NotificacoesPage conectada ao hook useNotificacoes com lista real, mark-all-read e ícones por tipo; utilitário formatPhone com máscara BR de 10/11 dígitos adicionado a utils.ts.

## Tasks Completed

| Task | Description | Commit |
|------|-------------|--------|
| 1 | F-14: formatPhone em src/lib/utils.ts | 8a79862 |
| 2 | F-12 (parte 1): useNotificacoes + useMarkAllAsRead | 90ad724 |
| 3 | F-12 (parte 2): NotificacoesPage conectada | a4d6223 |

## What Was Built

### formatPhone (F-14)
- Exportado de `src/lib/utils.ts`
- Remove não-dígitos, trunca em 11, formata `(DD) NNNNN-NNNN` (11 dígitos) ou `(DD) NNNN-NNNN` (10)
- Função `cn()` preservada intacta
- Será consumida por PerfilPage (Plan 09) e RegisterPage (Plan 10)

### useNotificacoes + useMarkAllAsRead (F-12 parte 1)
- `useNotificacoes()`: query com `['notificacoes','lista',profileId]`, SELECT ordenado desc, limit 50, enabled por profileId
- `useMarkAllAsRead()`: mutation UPDATE `lida=true` WHERE `usuario_id AND lida=false`, invalida ambas query keys
- `useNotificacoesNaoLidas()` preservado intacto

### NotificacoesPage (F-12 parte 2)
- Substituiu EmptyState estático por lista real via `useNotificacoes()`
- LoadingSkeleton (rows=4) durante carregamento
- ErrorState com retry em caso de erro
- Notificações não lidas destacadas com `bg-primary/5` e bullet `bg-primary`
- Ícones por tipo: FileText (orcamento), ClipboardList (solicitacao), Wrench (os), AlertCircle (alerta), Bell (fallback)
- Timestamp relativo via `relativeDate()` de `@/lib/dateUtils`
- Botão "Marcar todas como lidas" aparece apenas quando `naoLidas > 0`, dispara toast.success/error

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — NotificacoesPage agora consome dados reais via Supabase/react-query.

## Threat Surface Scan

Ameaças cobertas conforme threat_model do plano:
- T-01-04: SELECT filtrado por `usuario_id` (RLS enforce `auth.uid()`)
- T-01-05: UPDATE filtrado por `usuario_id AND lida=false` (RLS bloqueia outros usuários)
- T-01-06: `.limit(50)` previne histórico ilimitado
- T-01-07: `formatPhone` é função pura sem efeitos colaterais

Nenhuma superfície nova além do previsto no threat_model.

## Self-Check: PASSED

All 3 files found. All 3 commits verified (8a79862, 90ad724, a4d6223).
