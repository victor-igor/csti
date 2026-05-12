---
phase: 02-padronizar-mensagens-de-erro-para-o-usuario
plan: "03"
subsystem: error-handling
tags: [hooks, error-handling, refactor, auth, perfil]
dependency_graph:
  requires: [02-01]
  provides: [parseApiError-wired-in-all-hooks]
  affects: [useSolicitacao, useOrcamento, useOrdemServico, useAuth, PerfilModal]
tech_stack:
  added: []
  patterns: [parseApiError-mediator, friendly-fallback-PT-BR]
key_files:
  created:
    - src/features/perfil/PerfilModal.tsx (was untracked, now committed)
  modified:
    - src/features/solicitacao/useSolicitacao.ts
    - src/features/orcamento/useOrcamento.ts
    - src/features/ordem-servico/useOrdemServico.ts
    - src/features/auth/useAuth.ts
    - src/features/perfil/PerfilModal.tsx
decisions:
  - "useAuth.login() wraps signInWithPassword in try/catch to handle both Supabase error object and thrown exceptions via parseApiError"
  - "PerfilModal.tsx was untracked in git — committed as part of this plan (first time tracked)"
  - "buildStoredPhone unused import in PerfilModal pre-existed — left as-is (out of scope)"
metrics:
  duration: "~15min"
  completed: "2026-05-11"
  tasks_completed: 2
  files_modified: 5
---

# Phase 02 Plan 03: Wire parseApiError em Todos os Hooks Summary

**One-liner:** Substituição completa do antipadrão `error.message || fallback` por `parseApiError(error) || fallback` nos 5 arquivos de hooks/componentes, fechando o canal de vazamento de mensagens técnicas ao usuário.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Wire parseApiError em useSolicitacao + useOrcamento + useOrdemServico | 9198caf | useSolicitacao.ts, useOrcamento.ts, useOrdemServico.ts |
| 2 | Wire parseApiError em useAuth + PerfilModal | 14d743e | useAuth.ts, PerfilModal.tsx |

## Changes Summary

### useSolicitacao.ts
- Import `parseApiError` adicionado
- 2 onError corrigidos: `useCreateSolicitacao` e `useCancelSolicitacao`

### useOrcamento.ts
- Import `parseApiError` adicionado
- 5 onError corrigidos: `useAprovarOrcamento`, `useRecusarOrcamento`, `useCreateOrcamento`, `useUpdateOrcamento`, `useEnviarOrcamento`

### useOrdemServico.ts
- Import `parseApiError` adicionado
- 1 onError corrigido: `useUpdateStatusOS` (fallback melhorado para 'Erro ao atualizar status da OS')

### useAuth.ts
- Import `parseApiError` adicionado
- `login()` refatorado para wrap try/catch: `parseApiError(error) || 'E-mail ou senha incorretos'`
- Catch genérico: `parseApiError(err) || 'Erro de conexão. Tente novamente.'`
- Elimina retorno direto de `error.message` (fecha ameaça T-02-08: account enumeration)

### PerfilModal.tsx
- Import `parseApiError` adicionado
- `PerfilTab.onSubmit` onError: adicionado parâmetro `error: Error`, usa `parseApiError(error) || 'Erro ao atualizar perfil'`
- `SegurancaTab.handleTrocarSenha`: `setSenhaError` agora mediado por `parseApiError` (fecha T-02-09)

## Verification Results

- `grep -rE "toast.error(error.message" src/features/` → 0 ocorrências
- `parseApiError` presente nos 5 arquivos
- `setSenhaError(error.message)` → 0 ocorrências
- `npx tsc --noEmit` → sem novos erros (apenas deprecation warning pré-existente de baseUrl)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] useAuth.ts versão no worktree difere da versão referenciada no plano**
- **Found during:** Task 2
- **Issue:** O plan referenciava a versão com caching (localStorage + useAuthStore.setSession) mas o worktree tinha a versão simplificada sem esse bloco
- **Fix:** Aplicou parseApiError na versão real do worktree, adicionando try/catch para cobrir ambos os padrões de erro (objeto Supabase e exceção thrown)
- **Files modified:** src/features/auth/useAuth.ts
- **Commit:** 14d743e

**2. [Rule 3 - Blocking] PerfilModal.tsx era arquivo untracked (nunca commitado)**
- **Found during:** Task 2
- **Issue:** PerfilModal.tsx existia apenas no working tree da main repo, nunca tinha sido adicionado ao git. O worktree não o tinha.
- **Fix:** Copiou o arquivo para o worktree e o commitou como novo arquivo tracked, aplicando as correções do plano
- **Files modified:** src/features/perfil/PerfilModal.tsx (criado no git)
- **Commit:** 14d743e

## Threat Mitigations Closed

| Threat ID | Mitigation |
|-----------|-----------|
| T-02-07 | Hook onError → toast: todos os 8 onError agora mediados por parseApiError |
| T-02-08 | useAuth.login() nunca retorna error.message direto — previne account enumeration |
| T-02-09 | SegurancaTab.setSenhaError mediado por parseApiError |
| T-02-10 | parseApiError já detecta network errors (implementado em 02-01) |

## Known Stubs

None — todas as substituições são funcionais e wired ao parseApiError do Plan 01.

## Threat Flags

None — nenhuma nova superfície de rede ou auth path introduzida.

## Self-Check: PASSED

- [x] src/features/solicitacao/useSolicitacao.ts — commitado em 9198caf
- [x] src/features/orcamento/useOrcamento.ts — commitado em 9198caf
- [x] src/features/ordem-servico/useOrdemServico.ts — commitado em 9198caf
- [x] src/features/auth/useAuth.ts — commitado em 14d743e
- [x] src/features/perfil/PerfilModal.tsx — commitado em 14d743e
- [x] Commits 9198caf e 14d743e existem no git log
- [x] Zero antipadrões `toast.error(error.message` remanescentes
- [x] TypeScript passa sem novos erros
