---
phase: 02-padronizar-mensagens-de-erro-para-o-usuario
verified: 2026-05-12T00:25:35Z
status: passed
score: 9/9 must-haves verified
overrides_applied: 0
---

# Phase 02: Padronizar Mensagens de Erro — Verification Report

**Phase Goal:** Padronizar mensagens de erro para o usuário — zero erros técnicos crus chegando ao usuário via toast ou ErrorState
**Verified:** 2026-05-12T00:25:35Z
**Status:** PASSED
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | `parseApiError` exists as named export in `src/lib/errorUtils.ts` | VERIFIED | `export function parseApiError(error: unknown): string` at line 1 |
| 2 | `parseApiError` maps Supabase code 23505 (email duplicado) | VERIFIED | Line 15-17: `if (e.code === '23505') return 'Este e-mail já está cadastrado'` |
| 3 | `parseApiError` maps code 42501 / 'permission denied' | VERIFIED | Lines 20-21 and 30: both code and message pattern handled |
| 4 | `parseApiError` maps offline / network errors | VERIFIED | Lines 7 (`navigator.onLine === false`) and 27 (`failed to fetch`) |
| 5 | `parseApiError` returns empty string when no mapping matches | VERIFIED | Returns `''` — no framework imports in file |
| 6 | Campo valor do item de orçamento usa `z.coerce.number` (fix bug string→number) | VERIFIED | `orcamentoSchemas.ts` lines 6-13: `quantidade` and `valor_unitario` both use `.coerce.number()`; zero bare `z.number()` remaining |
| 7 | Schemas solicitacao + orcamento emitem mensagens PT-BR, sem inglês cru | VERIFIED | `solicitacaoSchemas.ts`: `'Informe o título da solicitação'`, `'Descreva o problema'`, `'Selecione a urgência'`; `orcamentoSchemas.ts`: `'Digite apenas números'`, `'Deve ser maior que zero'` |
| 8 | Nenhum hook chama `toast.error(error.message)` — todos usam `parseApiError(error) \|\| fallback` | VERIFIED | Zero hits of `toast.error(error.message` in all 5 files; `useOrcamento.ts` has 5 `parseApiError` calls, `useSolicitacao.ts` has 2, `useOrdemServico.ts` has 1; `useAuth.ts` uses `parseApiError(error) \|\| 'E-mail ou senha incorretos'`; `PerfilModal.tsx` uses `parseApiError` in both PerfilTab and SegurancaTab |
| 9 | 6 páginas com `isError` exibem mensagem contextual + `onRetry={refetch}` | VERIFIED | All 6 pages confirmed: SolicitacoesPage, OrcamentosPage, OrdemServicoListPage, SolicitacaoDetailPage, OrdemServicoDetailPage, OrcamentoDetailPage — each with "Não foi possível carregar..." and `onRetry={refetch}` |

**Score:** 9/9 truths verified

---

### Required Artifacts

| Artifact | Status | Evidence |
|----------|--------|----------|
| `src/lib/errorUtils.ts` | VERIFIED | Exists, exports `parseApiError`, no framework imports, handles 23505/42501/network, returns `''` on no-match |
| `src/features/solicitacao/solicitacaoSchemas.ts` | VERIFIED | Contains `'Informe o título da solicitação'`, `'Descreva o problema'`, `'Selecione a urgência'` |
| `src/features/orcamento/orcamentoSchemas.ts` | VERIFIED | Uses `z.coerce.number` on all numeric fields; zero bare `z.number()` remaining |
| `src/features/solicitacao/useSolicitacao.ts` | VERIFIED | Imports `parseApiError`; 2 `parseApiError(error) \|\|` calls; zero `toast.error(error.message` |
| `src/features/orcamento/useOrcamento.ts` | VERIFIED | Imports `parseApiError`; 5 `parseApiError(error) \|\|` calls across all onError handlers |
| `src/features/ordem-servico/useOrdemServico.ts` | VERIFIED | Imports `parseApiError`; 1 `parseApiError(error) \|\|` call |
| `src/features/auth/useAuth.ts` | VERIFIED | Imports `parseApiError`; returns `parseApiError(error) \|\| 'E-mail ou senha incorretos'` and network fallback |
| `src/features/perfil/PerfilModal.tsx` | VERIFIED | Imports `parseApiError`; PerfilTab onError and SegurancaTab handleTrocarSenha both mediated; zero `setSenhaError(error.message)` |
| `src/pages/SolicitacoesPage.tsx` | VERIFIED | `"Não foi possível carregar as solicitações. Verifique sua conexão e tente novamente."` + `onRetry={refetch}` |
| `src/pages/OrcamentosPage.tsx` | VERIFIED | `"Não foi possível carregar os orçamentos. Verifique sua conexão e tente novamente."` + `onRetry={refetch}` |
| `src/features/ordem-servico/OrdemServicoListPage.tsx` | VERIFIED | `"Não foi possível carregar as ordens de serviço. Verifique sua conexão e tente novamente."` + `onRetry={refetch}` |
| `src/features/solicitacao/SolicitacaoDetailPage.tsx` | VERIFIED | `"Não foi possível carregar a solicitação. Verifique sua conexão e tente novamente."` + `onRetry={refetch}` |
| `src/features/ordem-servico/OrdemServicoDetailPage.tsx` | VERIFIED | `"Não foi possível carregar a ordem de serviço. Verifique sua conexão e tente novamente."` + `onRetry={refetch}` |
| `src/features/orcamento/OrcamentoDetailPage.tsx` | VERIFIED | `"Não foi possível carregar o orçamento. Verifique sua conexão e tente novamente."` + `onRetry={refetch}` |

---

### Key Link Verification

| From | To | Via | Status |
|------|----|-----|--------|
| `src/features/*/use*.ts` (5 files) | `src/lib/errorUtils.ts` | `import { parseApiError } from '@/lib/errorUtils'` | WIRED — confirmed in all 5 files |
| `hooks onError callbacks` | `toast.error()` | `parseApiError(error) \|\| fallback` | WIRED — pattern present in all hooks |
| `useAuth.ts` | login error return | `parseApiError(error) \|\| 'E-mail ou senha incorretos'` | WIRED |
| `PerfilModal.tsx SegurancaTab` | `setSenhaError` | `parseApiError(error) \|\| 'Erro ao atualizar senha'` | WIRED |
| `6 pages isError state` | `ErrorState` component | `message=` contextual string + `onRetry={refetch}` | WIRED |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status |
|-------------|-------------|-------------|--------|
| D-01 | 02-02 | Zod schema string fields emit PT-BR messages, not "Required" | SATISFIED |
| D-02 | 02-02 | Zod string required fields use `.min(1, 'Mensagem PT-BR')` | SATISFIED |
| D-03 | 02-02 | Numeric fields use `z.coerce.number` — bug coerce fix | SATISFIED |
| D-04 | 02-01, 02-03 | `parseApiError` utility centralizes Supabase error mapping | SATISFIED |
| D-05 | 02-01, 02-03 | Hooks use `parseApiError` not `error.message` direct | SATISFIED |
| D-06 | 02-01, 02-03 | `parseApiError` returns `''` on no-match; caller uses fallback | SATISFIED |
| D-07 | 02-02, 02-03 | Messages say what to do, not what failed technically | SATISFIED |
| D-08 | 02-01–04 | All messages 100% PT-BR | SATISFIED |
| D-09 | 02-04 | ErrorState `onRetry` connected to `refetch` in all 6 pages | SATISFIED |
| D-10 | 02-04 | ErrorState messages contextual per entity (solicitação, orçamento, OS) | SATISFIED |

---

### Anti-Patterns Found

| File | Pattern | Severity | Assessment |
|------|---------|----------|------------|
| `src/features/perfil/PerfilModal.tsx:96` | `fieldState.error.message` | Info | NOT a stub — this is React Hook Form rendering Zod validation messages (already PT-BR from Plan 02). Correct pattern. |
| `src/features/auth/RegisterPage.tsx:93,135` | `fieldState.error.message` | Info | Same — RHF field-level validation display, messages come from Zod schemas (PT-BR). Correct pattern. |

No blockers. The `fieldState.error.message` pattern is the intended RHF form field inline validation display — it sources messages from Zod schemas, which are now fully PT-BR.

---

### Human Verification Required

None — all observable truths are verifiable programmatically for this phase.

---

### Summary

Phase 02 goal is fully achieved. All 10 requirement IDs (D-01 through D-10) are satisfied:

- `src/lib/errorUtils.ts` is a clean, framework-free utility with 3 canonical mappings (23505, 42501, network) returning PT-BR messages, and `''` for unmapped errors.
- All 5 hooks/modals import and use `parseApiError(error) || 'fallback'` — the `error.message` raw leak channel is fully closed.
- `orcamentoSchemas.ts` fixes the string-to-number coercion bug; both schemas emit exclusively PT-BR messages.
- All 6 pages with `isError` show contextual messages mentioning what failed and include `onRetry={refetch}`.
- A test suite (`src/lib/__tests__/errorUtils.test.ts`) covering all 8 behavior cases was also produced as a bonus.

Zero technical errors reach the user via toast or ErrorState. Phase goal achieved.

---

_Verified: 2026-05-12T00:25:35Z_
_Verifier: Claude (gsd-verifier)_
