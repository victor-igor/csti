---
phase: 01-melhorias-de-ui-ux-24-findings-do-ui-review
plan: 08
subsystem: ui
tags: [react, typescript, supabase, base-ui, dialog, mutation]

# Dependency graph
requires:
  - phase: 01-melhorias-de-ui-ux-24-findings-do-ui-review
    plan: 05
    provides: useUpdateOrcamento adicionado a useOrcamento.ts
provides:
  - Dialog customizado com textarea para capturar motivo de recusa (F-20)
  - useRecusarOrcamento aceita motivo opcional e persiste via observacoes
  - OrcamentoDetailPage exibe bloco "Motivo da Recusa" quando status='recusado'
affects:
  - OrcamentoReviewPage
  - OrcamentoDetailPage
  - useOrcamento

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Dialog customizado com @base-ui/react para forms inline (textarea dentro de Dialog.Popup)"
    - "Caminho B (fallback observacoes): persiste texto prefixado '[Motivo da recusa: ...]' quando coluna dedicada ausente"
    - "Spread condicional tipado: { status, ...(cond ? { campo } : {}) } para compatibilidade Supabase strict types"

key-files:
  created: []
  modified:
    - src/features/orcamento/useOrcamento.ts
    - src/features/orcamento/OrcamentoReviewPage.tsx
    - src/features/orcamento/OrcamentoDetailPage.tsx

key-decisions:
  - "Caminho B adotado: coluna motivo_recusa inexiste em orcamentos (confirmado via supabase.ts); motivo persiste em observacoes como '[Motivo da recusa: texto]'"
  - "Spread tipado usado em update() para contornar rejeicao do Supabase client a Record<string, unknown>"
  - "Dialog.Root de @base-ui/react reutilizado diretamente (mesmo padrao do ConfirmDialog) com body customizado"

patterns-established:
  - "Fallback motivo: startsWith('[Motivo da recusa:') para extrair texto de observacoes prefixada"

requirements-completed:
  - F-20

# Metrics
duration: 15min
completed: 2026-05-11
---

# Phase 01 Plan 08: F-20 Motivo de Recusa do Orçamento Summary

**Dialog com textarea para capturar motivo de recusa (opcional) e exibição condicional em OrcamentoDetailPage via fallback em campo observacoes**

## Performance

- **Duration:** 15 min
- **Started:** 2026-05-11T00:00:00Z
- **Completed:** 2026-05-11T00:15:00Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments

- useRecusarOrcamento agora aceita motivo?: string e persiste via observacoes prefixada (Caminho B)
- OrcamentoReviewPage substitui ConfirmDialog simples por Dialog customizado com textarea controlada (maxLength=500)
- OrcamentoDetailPage renderiza bloco "Motivo da Recusa" condicionalmente quando status='recusado' e motivo presente

## Task Commits

1. **Task 1: F-20 Estender useRecusarOrcamento para aceitar motivo opcional** - `e159044` (feat)
2. **Task 2: F-20 Dialog com textarea em OrcamentoReviewPage** - `76a0159` (feat)
3. **Task 3: F-20 Exibir motivo da recusa em OrcamentoDetailPage** - `92e8638` (feat)

## Files Created/Modified

- `src/features/orcamento/useOrcamento.ts` - useRecusarOrcamento estendido com motivo?: string, persiste via observacoes (Caminho B)
- `src/features/orcamento/OrcamentoReviewPage.tsx` - ConfirmDialog de recusa substituido por Dialog.Root customizado com textarea
- `src/features/orcamento/OrcamentoDetailPage.tsx` - Bloco condicional "Motivo da Recusa" quando status='recusado' e motivo presente

## Decisions Made

- **Caminho B adotado:** A coluna `motivo_recusa` nao existe na tabela `orcamentos` (verificado em `src/types/supabase.ts`). Motivo e persistido em `observacoes` com prefixo `[Motivo da recusa: ...]`.
- **Spread tipado:** O cliente Supabase rejeita `Record<string, unknown>` em `.update()`. Solucao: spread condicional `{ status: 'recusado', ...(motivo?.trim() ? { observacoes: ... } : {}) }` que satisfaz os tipos gerados.
- **Dialog de @base-ui/react reutilizado:** ConfirmDialog existente nao suporta textarea; Dialog.Root customizado seguiu o mesmo padrao interno do ConfirmDialog.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] TypeScript error no update() do Supabase com Record<string, unknown>**
- **Found during:** Task 3 (build run apos implementacao)
- **Issue:** Supabase strict types rejeitam `Record<string, unknown>` como argumento de `.update()` — erro TS2345
- **Fix:** Substituido por spread condicional tipado que o compilador aceita
- **Files modified:** src/features/orcamento/useOrcamento.ts
- **Verification:** `npx tsc --noEmit` sem erros nos arquivos modificados
- **Committed in:** 92e8638 (Task 3 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 — bug de tipagem)
**Impact on plan:** Fix necessario para compilacao. Sem alteracao de comportamento.

## Issues Encountered

- Build apresenta erros pre-existentes em `MobileDrawer.tsx`, `AppShell.tsx` e `authSchemas.ts` que estao fora do escopo deste plano. Registrados como out-of-scope.

## Known Stubs

None — todos os campos sao funcionais e persistidos no banco.

## Threat Flags

Nenhum — ameacas T-01-22 (RLS) e T-01-24 (XSS via React escape) ja cobertas pelo design. Render do motivo usa `{motivo}` (escape automatico React), sem `dangerouslySetInnerHTML`.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- F-20 completo: mutation + Dialog + exibicao
- Quando coluna `motivo_recusa` for adicionada ao schema do banco, substituir Caminho B pelo Caminho A em useRecusarOrcamento e OrcamentoDetailPage
- Build verde nos arquivos deste plano; erros pre-existentes em outros arquivos nao bloqueiam

---
*Phase: 01-melhorias-de-ui-ux-24-findings-do-ui-review*
*Completed: 2026-05-11*
