---
phase: 01-melhorias-de-ui-ux-24-findings-do-ui-review
plan: 01
subsystem: ui
tags: [react, typescript, tailwind, supabase, react-router]

requires: []
provides:
  - OS_STATUS_LABEL map com labels pt-BR para enum OSStatus
  - Microcopy de auth padronizado em LoginPage e RegisterPage
  - Campo email read-only com bg-muted no topo do PerfilPage
  - PrestadorDashboard StatCard 'Orç. Enviados' filtrado por status enviado/aceito/recusado
  - Rota ordens-servico/* removida do App.tsx; OrdensServicoPage.tsx deletado
affects: [auth, dashboard, perfil, ordens-servico]

tech-stack:
  added: []
  patterns:
    - "Status label map pattern: Partial<Record<OSStatus, string>> para humanizar enums em UI"
    - "Email read-only com readOnly+disabled+bg-muted+cursor-not-allowed para campos de identidade"

key-files:
  created: []
  modified:
    - src/features/ordem-servico/OrdemServicoDetailPage.tsx
    - src/features/auth/LoginPage.tsx
    - src/features/auth/RegisterPage.tsx
    - src/pages/PerfilPage.tsx
    - src/pages/DashboardPage.tsx
    - src/App.tsx
  deleted:
    - src/pages/OrdensServicoPage.tsx

key-decisions:
  - "OS_STATUS_LABEL usa ?? proximoStatus como fallback para valores fora do mapa"
  - "Microcopy auth usa text-muted-foreground (token semântico) em vez de text-neutral-500 (valor fixo)"
  - "Email read-only lê de session?.user?.email via useAuthStore selector direto"
  - "meusOrc query usa .in('status', ['enviado','aceito','recusado']) no lado cliente; RLS já restringe por prestador_id"
  - "OrdensServicoPage.tsx era apenas re-export de OrdemServicoListPage — remoção segura"

patterns-established:
  - "Status label maps: definir Partial<Record<EnumType, string>> próximo ao componente consumidor"
  - "Auth microcopy: parágrafo muted-foreground + Link com text-primary font-medium hover:underline"

requirements-completed: [F-05, F-10, F-13, F-21, F-23]

duration: 22min
completed: 2026-05-11
---

# Phase 01 Plan 01: Quick Wins UI — 5 Findings XS Summary

**OS status labels humanizados, microcopy de auth padronizado, email read-only no perfil, filtro correto de orçamentos enviados e rota duplicada eliminada**

## Performance

- **Duration:** 22 min
- **Started:** 2026-05-11T00:00:00Z
- **Completed:** 2026-05-11T00:22:00Z
- **Tasks:** 3
- **Files modified:** 6 + 1 deletado

## Accomplishments

- F-05: ConfirmDialog de OS agora exibe "Em Andamento" e "Concluída" em vez dos enums raw
- F-10: Microcopy de auth com hierarquia visual correta (muted-foreground + primary link) em Login e Register
- F-13: Campo email read-only com indicação "(não pode ser alterado)" aparece no topo do formulário de perfil
- F-21: StatCard prestador renomeado para "Orç. Enviados" e contagem restrita aos status relevantes (enviado/aceito/recusado)
- F-23: Rota ordens-servico/* e re-export OrdensServicoPage.tsx removidos sem quebrar rota ordens-servico/:id

## Task Commits

1. **Task 1: F-05 — Label amigável no ConfirmDialog da OS** - `791b88b` (feat)
2. **Task 2: F-10 — Microcopy de auth em Login e Register** - `85b8f48` (feat)
3. **Task 3: F-13 + F-21 + F-23 — Email read-only, StatCard, rota duplicada** - `ac83297` (feat)

## Files Created/Modified

- `src/features/ordem-servico/OrdemServicoDetailPage.tsx` - Adiciona OS_STATUS_LABEL map; ConfirmDialog usa label amigável com fallback raw
- `src/features/auth/LoginPage.tsx` - Microcopy "Não tem conta ainda? Cadastre-se" com muted-foreground
- `src/features/auth/RegisterPage.tsx` - Microcopy "Já tem uma conta? Entrar" com muted-foreground
- `src/pages/PerfilPage.tsx` - Email read-only (readOnly+disabled+bg-muted) lido de session?.user?.email
- `src/pages/DashboardPage.tsx` - .in('status', ['enviado','aceito','recusado']) na query meusOrc; label "Orç. Enviados"
- `src/App.tsx` - Remove import OrdensServicoPage e Route path="ordens-servico/*"
- `src/pages/OrdensServicoPage.tsx` - DELETADO (era apenas re-export de OrdemServicoListPage)

## Decisions Made

- OS_STATUS_LABEL adota `?? proximoStatus` como fallback — qualquer valor não mapeado exibe o raw em vez de undefined
- Microcopy usa `text-muted-foreground` (token CSS semântico do design system) em vez de `text-neutral-500` hardcoded
- Email field lê diretamente `session?.user?.email` via selector do authStore — não requer prop drilling
- Filtro de orçamentos do prestador aplica `.in()` client-side; RLS Supabase já garante isolamento por `prestador_id = auth.uid()`
- OrdensServicoPage.tsx era um re-export de uma linha — sua remoção não quebra nenhuma funcionalidade

## Deviations from Plan

None — plano executado exatamente como escrito. Os 5 findings foram implementados nos 7 arquivos listados.

## Issues Encountered

- Linter/formatter modificou PerfilPage.tsx durante a execução (removeu temporariamente PageHeader e compactou classes). A leitura do arquivo após o stash pop confirmou que as mudanças de F-13 estavam preservadas corretamente.
- `npx tsc --noEmit` retorna erro TS5101 sobre `baseUrl` deprecated — pre-existente, não relacionado a este plano.
- `npm run build` falha em `MobileDrawer.tsx` (módulo `./navLinks` não encontrado) — pre-existente, não introduzido por este plano (confirmado via git stash).

## Known Stubs

None — todos os campos renderizam dados reais (session email, contagens reais do Supabase).

## Threat Flags

Nenhum — mudanças restritas a labels, microcopy, campo read-only (sem novos endpoints ou trust boundaries).

## Next Phase Readiness

- 5 quick wins (F-05, F-10, F-13, F-21, F-23) eliminados da dívida visual
- MobileDrawer.tsx com erro pre-existente (`./navLinks` não encontrado) deve ser investigado em plano separado
- Pronto para avançar para findings de maior esforço na fase 01

---

## Self-Check: PASSED

- `src/features/ordem-servico/OrdemServicoDetailPage.tsx` — FOUND (OS_STATUS_LABEL presente)
- `src/features/auth/LoginPage.tsx` — FOUND ("Não tem conta ainda?" presente)
- `src/features/auth/RegisterPage.tsx` — FOUND ("Já tem uma conta?" presente)
- `src/pages/PerfilPage.tsx` — FOUND (email read-only presente)
- `src/pages/DashboardPage.tsx` — FOUND ("Orç. Enviados" presente)
- `src/App.tsx` — FOUND (sem OrdensServicoPage import/route)
- `src/pages/OrdensServicoPage.tsx` — DELETED (confirmado)
- Commits 791b88b, 85b8f48, ac83297 — FOUND no git log

---
*Phase: 01-melhorias-de-ui-ux-24-findings-do-ui-review*
*Completed: 2026-05-11*
