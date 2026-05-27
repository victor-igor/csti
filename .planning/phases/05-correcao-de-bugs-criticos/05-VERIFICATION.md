---
phase: 05-correcao-de-bugs-criticos
verified: 2026-05-26T18:00:00Z
status: human_needed
score: 7/7 must-haves verified
overrides_applied: 0
human_verification:
  - test: "NotFoundPage 404 link para usuário não autenticado"
    expected: "Unauthenticated user landing on unknown URL sees 404 page; clicking 'Voltar ao início' reaches login, not infinite redirect loop"
    why_human: "NotFoundPage hardcodes link to /dashboard (protected route). Code review (05-REVIEW.md CR-01) flags that an unauthenticated user clicking this link gets bounced through ProtectedRoute to /login — confusing but not a crash. Need manual test to confirm the flow is acceptable or needs fixing."
---

# Phase 5: Correção de Bugs Críticos Verification Report

**Phase Goal:** Corrigir os bugs críticos identificados — chat invisível, RLS permissivo, menu quebrado, redirects silenciosos e telas sem error state.
**Verified:** 2026-05-26T18:00:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Chat de negociação visível no SolicitacaoDetailDialog para cliente e prestador (BUG-01) | VERIFIED | `SolicitacaoDetailDialog.tsx` line 17: `import { TimelineMensagens }`, line 129: `<TimelineMensagens solicitacaoId={solicitacao.id} />`. Commit 4617e6e confirmed. |
| 2 | Policies RLS permissivas `mensagens_select_policy` e `mensagens_insert_policy` removidas do banco (BUG-02) | VERIFIED | `supabase/migrations/20260527000004_fix_mensagens_rls_dedup.sql` exists with `DROP POLICY IF EXISTS` for both policies. Summary confirms pg_policies query returns only 3 correct policies post-migration. Commit 1f6328f confirmed. |
| 3 | Prestador não acessa `/orcamentos` (rota com RoleGuard bloqueando prestador) (BUG-03) | VERIFIED | `useNavLinks.ts` line 69–71: prestador receives `href: '/prestador/orcamentos'` (dedicated page), not `/orcamentos`. Implementation exceeded plan by creating a real page — better UX. |
| 4 | Badge de orçamentos não exibe contagem errada para prestador (BUG-07) | VERIFIED | `useNavLinks.ts` line 45: `if (role === 'prestador'...) return 0`. Prestador item uses no badge prop (line 70 does not include `badge:`), cliente/admin get badge with `orcBadge` value. |
| 5 | RoleGuard exibe feedback ao usuário antes de redirecionar (BUG-04) | VERIFIED | `RoleGuard.tsx` lines 2,4,12–16,33: `import toast from 'sonner'`, `function RoleRedirect()` calls `toast.error('Você não tem permissão para acessar essa página.')` then navigates. Commit 7bc5df5 confirmed. |
| 6 | URL inexistente exibe página 404 com retorno ao dashboard (BUG-05) | VERIFIED (with human needed) | `NotFoundPage.tsx` exists. `App.tsx` line 32,102: `lazy(() => import('@/pages/NotFoundPage'))` and `<Route path="*" element={<NotFoundPage />} />`. HOWEVER: `NotFoundPage.tsx` lines 14–19 hardcode `to="/dashboard"` — protected route — causing confusing redirect for unauthenticated users (flagged in 05-REVIEW.md CR-01). Page functions for authenticated users. |
| 7 | Todas as 5 páginas de listagem exibem ErrorState com retry ao falhar a query (BUG-06) | VERIFIED | All 5 pages have `isError` destructured + `onRetry={refetch}`: SolicitacoesPage (isError=2,onRetry=1), SolicitacaoListPrestadorPage (isError=2,onRetry=1), OrcamentosPage (isError=9,onRetry=1), OrdemServicoListPage (isError=4,onRetry=1), NotificacoesPage (isError=2,onRetry=1). |

**Score:** 7/7 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/features/solicitacao/SolicitacaoDetailDialog.tsx` | TimelineMensagens wired | VERIFIED | Import + render present at lines 17,129 |
| `supabase/migrations/20260527000004_fix_mensagens_rls_dedup.sql` | DROP POLICY statements | VERIFIED | Lines 7–8 contain both DROP POLICY IF EXISTS statements |
| `src/components/layout/useNavLinks.ts` | Prestador routed to /prestador/orcamentos | VERIFIED | Line 70: `href: '/prestador/orcamentos'` for prestador role |
| `src/features/orcamento/OrcamentoPrestadorPage.tsx` | New page for prestador orcamentos | VERIFIED | File exists, uses `useListOrcamentosPrestador()` with real Supabase query |
| `src/components/guards/RoleGuard.tsx` | Toast error before redirect | VERIFIED | RoleRedirect component with toast.error + useNavigate |
| `src/pages/NotFoundPage.tsx` | 404 page with return link | VERIFIED | Exists with FileQuestion icon and Link to /dashboard |
| `src/App.tsx` | catch-all uses NotFoundPage | VERIFIED | Line 102: `<Route path="*" element={<NotFoundPage />} />` |
| `src/pages/SolicitacoesPage.tsx` | isError + ErrorState + refetch | VERIFIED | isError=2, onRetry=1 |
| `src/features/solicitacao/SolicitacaoListPrestadorPage.tsx` | isError + ErrorState + refetch | VERIFIED | isError=2, onRetry=1 |
| `src/pages/OrcamentosPage.tsx` | isError + ErrorState + refetch | VERIFIED | isError=9, onRetry=1 |
| `src/features/ordem-servico/OrdemServicoListPage.tsx` | isError + ErrorState + refetch | VERIFIED | isError=4, onRetry=1 |
| `src/pages/NotificacoesPage.tsx` | isError + ErrorState + refetch | VERIFIED | isError=2, onRetry=1 |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| SolicitacaoDetailDialog | TimelineMensagens | import + JSX render | WIRED | Import line 17, render line 129 with `solicitacaoId={solicitacao.id}` |
| useNavLinks (prestador) | /prestador/orcamentos | ternary on role | WIRED | Line 69–71 ternary routes prestador to correct href |
| RoleGuard | toast.error + navigate | RoleRedirect component + useEffect | WIRED | RoleRedirect uses useEffect to sequence toast then navigate |
| App.tsx catch-all | NotFoundPage | lazy import | WIRED | Lazy import line 32, route line 102 |
| Listing pages | ErrorState | isError guard + onRetry prop | WIRED | All 5 pages verified |
| OrcamentoPrestadorPage | useListOrcamentosPrestador | direct hook call | WIRED | Line 35, real Supabase query confirmed in useOrcamento.ts line 277 |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|--------------|--------|-------------------|--------|
| OrcamentoPrestadorPage | `data` from `useListOrcamentosPrestador()` | `supabase.from('orcamentos')` query in useOrcamento.ts line 277 | Yes — DB query confirmed | FLOWING |
| SolicitacaoDetailDialog | TimelineMensagens receives `solicitacaoId` | Component handles own data fetch internally | Yes — existing component already working in SolicitacaoDetailPage | FLOWING |

### Behavioral Spot-Checks

Step 7b: Skipped — no runnable entry points testable without a running server. All artifacts are React components and SQL migrations.

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| BUG-01 | 05-01-PLAN | Chat invisível no Dialog | SATISFIED | TimelineMensagens wired in SolicitacaoDetailDialog |
| BUG-02 | 05-02-PLAN | RLS permissivo em mensagens | SATISFIED | Migration 20260527000004 created and applied |
| BUG-03 | 05-03-PLAN | Menu prestador com link quebrado /orcamentos | SATISFIED | Prestador routed to /prestador/orcamentos (new dedicated page) |
| BUG-04 | 05-04-PLAN | RoleGuard sem feedback ao usuário | SATISFIED | toast.error added in RoleRedirect component |
| BUG-05 | 05-04-PLAN | Página 404 ausente (catch-all redirect silencioso) | SATISFIED | NotFoundPage created and wired to catch-all |
| BUG-06 | 05-05-PLAN | Error states ausentes nas queries de listagem | SATISFIED | All 5 listing pages have isError + ErrorState + refetch |
| BUG-07 | 05-03-PLAN | Badge errado/item /orcamentos exibido para prestador | SATISFIED | useOrcamentosBadge returns 0 for prestador; nav item uses /prestador/orcamentos with no badge |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/pages/NotFoundPage.tsx` | 15 | `to="/dashboard"` hardcoded (protected route) | Warning | Unauthenticated users clicking "Voltar ao início" on a 404 are redirected to /dashboard then bounced to /login — confusing but non-crashing. Flagged as CR-01 in 05-REVIEW.md. |

### Human Verification Required

#### 1. NotFoundPage behavior for unauthenticated user

**Test:** Open the app in a private/incognito browser (logged out). Navigate to any non-existent URL, e.g. `http://localhost:5173/pagina-que-nao-existe`.
**Expected (acceptable):** User sees the 404 page. Clicking "Voltar ao início" redirects to `/login` (via ProtectedRoute) without a visible error or loop.
**Expected (ideal fix from CR-01):** Clicking the button links directly to `/login` or uses auth state to route appropriately.
**Why human:** Requires browser to observe redirect behavior; not testable by grep. The code review (05-REVIEW.md CR-01) flagged this as a UX issue for unauthenticated users. Automated checks confirmed the code paths but cannot evaluate whether the redirect chain is acceptable.

### Gaps Summary

No blocking gaps found. All 7 requirements (BUG-01 through BUG-07) are implemented and wired. One human verification item exists: the NotFoundPage links to a protected route (`/dashboard`) which causes an extra redirect step for unauthenticated users. This is a UX concern flagged by the code reviewer (CR-01 in 05-REVIEW.md) but does not block the core goal of "URL inexistente exibe página 404."

**Notable deviation in BUG-03/BUG-07:** Plan 05-03 specified removing `/orcamentos` from the prestador menu. Implementation went further — a new `/prestador/orcamentos` page was created and the menu now points prestadors to it. This is strictly better than the plan and satisfies both BUG-03 and BUG-07.

---

_Verified: 2026-05-26T18:00:00Z_
_Verifier: Claude (gsd-verifier)_
