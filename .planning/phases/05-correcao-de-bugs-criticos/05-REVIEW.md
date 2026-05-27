---
phase: 05-correcao-de-bugs-criticos
reviewed: 2026-05-26T12:00:00Z
depth: standard
files_reviewed: 11
files_reviewed_list:
  - src/App.tsx
  - src/components/guards/RoleGuard.tsx
  - src/components/layout/useNavLinks.ts
  - src/features/auth/RecuperarSenhaPage.tsx
  - src/features/auth/RedefinirSenhaPage.tsx
  - src/features/orcamento/OrcamentoPrestadorPage.tsx
  - src/features/solicitacao/SolicitacaoDetailDialog.tsx
  - src/features/solicitacao/SolicitacaoListPrestadorPage.tsx
  - src/pages/NotFoundPage.tsx
  - src/pages/NotificacoesPage.tsx
  - supabase/migrations/20260527000004_fix_mensagens_rls_dedup.sql
findings:
  critical: 1
  warning: 4
  info: 3
  total: 8
status: issues_found
---

# Phase 05: Code Review Report

**Reviewed:** 2026-05-26T12:00:00Z
**Depth:** standard
**Files Reviewed:** 11
**Status:** issues_found

## Summary

This phase introduces password recovery/reset flows, new auth pages, a provider-specific solicitacoes list, and a migration to deduplicate overly-permissive RLS policies on `mensagens_solicitacao`. The code is generally well-structured and follows project conventions. However, one critical issue was found: the `NotFoundPage` redirects unauthenticated users to `/dashboard` (a protected route), which will cause an infinite redirect loop or confusing UX for users who land on a non-existent public URL. Four warnings were found related to non-null assertion operator usage, a race condition in session detection, missing email format validation, and an authorization gap for admin roles. Three info items cover minor style and dead-code concerns.

---

## Critical Issues

### CR-01: NotFoundPage redirects to protected route — breaks unauthenticated 404 flows

**File:** `src/pages/NotFoundPage.tsx:14-19`
**Issue:** The 404 page hardcodes a link to `/dashboard`, which is behind `ProtectedRoute`. An unauthenticated user who lands on any unknown URL (e.g. from an expired share link) will see the 404 page and clicking "Voltar ao início" will redirect them to `/dashboard`, which then redirects them to `/login`. This creates confusing UX for unauthenticated visitors. More critically, the route in `App.tsx` (line 102) places `<Route path="*" element={<NotFoundPage />} />` **outside** the `ProtectedRoute` wrapper, but the link inside still points to a protected destination with no fallback for unauthenticated state.

**Fix:** Either link to `/login` unconditionally, or read auth state and link conditionally:
```tsx
import { useAuthStore } from '@/store/authStore'

export default function NotFoundPage() {
  const isAuthenticated = useAuthStore((s) => !!s.profile)
  const homeHref = isAuthenticated ? '/dashboard' : '/login'
  const homeLabel = isAuthenticated ? 'Voltar ao início' : 'Ir para o login'

  return (
    // ...
    <Link to={homeHref}>
      {homeLabel}
    </Link>
  )
}
```

---

## Warnings

### WR-01: Non-null assertion on `solicitacao` inside ConfirmDialog callbacks — potential crash

**File:** `src/features/solicitacao/SolicitacaoDetailDialog.tsx:227` and `241`
**Issue:** `cancelar(solicitacao!.id)` and `excluir(solicitacao!.id)` use the non-null assertion operator. The confirm dialogs can only be opened when `hasActions && solicitacao` is truthy (footer is only rendered then), so `solicitacao` should be defined. However, if the data is invalidated and refetched between the user clicking "Cancelar Solicitação" and confirming in the dialog, `solicitacao` could momentarily be `undefined`, triggering a crash.
**Fix:** Add a guard before mutating:
```tsx
onConfirm={() => {
  setConfirmCancel(false)
  if (solicitacao) cancelar(solicitacao.id)
}}
```
```tsx
onConfirm={() => {
  setConfirmDelete(false)
  if (solicitacao) excluir(solicitacao.id)
}}
```

---

### WR-02: RedefinirSenhaPage — race condition between getSession and PASSWORD_RECOVERY event

**File:** `src/features/auth/RedefinirSenhaPage.tsx:23-37`
**Issue:** The `useEffect` calls `supabase.auth.getSession()` and also subscribes to `onAuthStateChange`. The `PASSWORD_RECOVERY` event fires when Supabase processes the `#access_token` hash fragment. If the hash is processed before `getSession()` resolves, `getSession()` may already return a valid session and `hasSession` will be set to `true` correctly. But if `getSession()` resolves first (returning `null`) and the `PASSWORD_RECOVERY` event fires afterward, there is a brief flash of the "Link inválido ou expirado" state before `hasSession` flips to `true`. In some browser/Supabase SDK timing combinations the event may also fire before the subscription is registered, meaning the session is missed entirely.

**Fix:** Rely solely on `onAuthStateChange` for `PASSWORD_RECOVERY` detection and use `getSession` only as a fallback for an already-active session:
```tsx
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
      setHasSession(true)
      setCheckingSession(false)
    } else if (event === 'SIGNED_OUT' || !session) {
      setCheckingSession(false)
    }
  })

  // Fallback: user already has a valid session (e.g. navigated directly)
  supabase.auth.getSession().then(({ data }) => {
    if (data.session) {
      setHasSession(true)
    }
    setCheckingSession(false)
  })

  return () => subscription.unsubscribe()
}, [])
```

---

### WR-03: RecuperarSenhaPage — email validated only with trim() but no format check

**File:** `src/features/auth/RecuperarSenhaPage.tsx:17`
**Issue:** `handleSubmit` only checks `!email.trim()` before calling `resetPasswordForEmail`. A string like `"notanemail"` passes this guard. The `<input type="email">` with `required` provides browser-level validation, but `noValidate` is set on the `<form>` (line 98), which disables all browser native validation. This means malformed email strings are sent to Supabase unnecessarily, producing opaque errors.
**Fix:** Either remove `noValidate` so native browser email validation runs, or add an explicit format check:
```tsx
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
if (!emailRegex.test(email.trim())) {
  setError('Informe um e-mail válido.')
  return
}
```

---

### WR-04: RoleGuard — `admin` role can access both `cliente` and `prestador` routes, but badge queries return 0 for admin

**File:** `src/components/layout/useNavLinks.ts:26` and `45`
**Issue:** The badge queries short-circuit with `return 0` for `admin`/`super_admin` on both sides:
- `useSolicitacoesBadge` returns 0 for `admin` (line 26) — this means admin users who need to monitor open requests do not see the pending badge count.
- `useOrcamentosBadge` returns 0 for `admin` (line 45) — same issue for pending budgets.

This is a functional issue: admins bypass badge counts entirely, losing visibility into outstanding items.
**Fix:** Remove the `admin`/`super_admin` early-return from both badge queries so they count items based on the same RLS/DB visibility as their role grants. If admins should see all items, the queries will naturally return the correct count:
```ts
// useSolicitacoesBadge
queryFn: async () => {
  // Remove: if (role === 'cliente' || role === 'admin' || role === 'super_admin') return 0
  const { count, error } = await supabase
    .from('solicitacoes_orcamento')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'aberta')
  if (error) throw error
  return count ?? 0
},
```

---

## Info

### IN-01: SolicitacaoDetailDialog — orcamentoVinculado query uses `.single()` but does not handle multiple rows

**File:** `src/features/solicitacao/SolicitacaoDetailDialog.tsx:33-43`
**Issue:** `.single()` throws a Supabase error if zero or more than one row is returned. The query already filters by `solicitacao_id` and `deleted_at IS NULL`, so in theory at most one active budget exists per request. But if duplicate orçamentos are created (e.g., a bug or race condition), this will surface as a confusing `null` result (the `if (error) return null` swallows it silently). Consider `.maybeSingle()` which returns `null` for zero rows without throwing.
**Fix:** Replace `.single()` with `.maybeSingle()`.

---

### IN-02: Hardcoded CloudFront video URL duplicated in two auth pages

**File:** `src/features/auth/RecuperarSenhaPage.tsx:7` and `src/features/auth/RedefinirSenhaPage.tsx:8`
**Issue:** The `BG_VIDEO_URL` constant is copy-pasted identically into both files. If the video URL changes, both must be updated.
**Fix:** Extract to a shared constant, e.g. `src/features/auth/authConstants.ts`:
```ts
export const AUTH_BG_VIDEO_URL = 'https://...'
```

---

### IN-03: useNavLinks.ts — useSolicitacoesBadge fetches data even for roles that don't use it

**File:** `src/components/layout/useNavLinks.ts:26`
**Issue:** For `cliente`, `admin`, and `super_admin`, the badge returns `0` immediately without querying. However, both `useSolicitacoesBadge` and `useOrcamentosBadge` are always called (hooks cannot be conditional), meaning the query is still registered in React Query with `enabled: !!profile?.id`. For `cliente` roles the solicitacoes query fires and returns 0 — the early return never executes because it is inside `queryFn`. This is wasteful but not a bug. Consider using the `enabled` option to skip entirely: `enabled: !!profile?.id && role === 'prestador'`.

---

_Reviewed: 2026-05-26T12:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
