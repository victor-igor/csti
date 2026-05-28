# Codebase Concerns (Inspection Report)

**Analysis Date:** 2025-05-15

## Tech Debt

**Large Page Components:**
- Issue: `AdminUsuariosPage.tsx` (688 lines) and `DashboardPage.tsx` (505 lines) have grown too large and handle too many responsibilities (data fetching, state management, and complex rendering).
- Files: `src/pages/AdminUsuariosPage.tsx`, `src/pages/DashboardPage.tsx`.
- Impact: Difficult to test, maintain, and understand. Increases risk of side effects when making changes.
- Fix approach: Refactor into smaller, focused sub-components and move complex logic to dedicated hooks.

**Usage of `any` in Database Calls:**
- Issue: `any` is used in several places when interacting with Supabase because the generated types are missing some fields or for complex joins.
- Files: `src/features/solicitacao/useSolicitacao.ts`, `src/features/orcamento/useOrcamento.ts`.
- Impact: Bypasses TypeScript's safety, potentially leading to runtime errors if the database schema changes.
- Fix approach: Update Supabase generated types or define explicit interfaces that extend the base types to cover missing fields.

**Code Duplication in Responsive Lists:**
- Issue: Toggling between Table (Desktop) and Card (Mobile) views often involves duplicating rendering logic.
- Files: `src/pages/SolicitacoesPage.tsx`.
- Impact: Increased maintenance burden; bug fixes or UI updates must be applied in two places.
- Fix approach: Consolidate into a single `DataTable` component that handles responsive rendering internally (DRY).

## Known Bugs

**Supabase RLS Policy Conflict:**
- Issue: `useRecusarOrcamento` attempts to update `status = 'aguardando_orcamento'` in `solicitacoes_orcamento`, but the RLS policy `solicitacoes_update_cliente` blocks status changes.
- Files: `src/features/orcamento/useOrcamento.ts`, `AUDIT-REPORT.md`.
- Impact: Users cannot refuse budgets (Error 42501).
- Fix approach: Implement a database RPC (PostgreSQL function) to handle the status transition atomically with `SECURITY DEFINER`.

**Broken Navigation in Prestador Dashboard:**
- Issue: StatCards in the Prestador dashboard link to `/orcamentos`, which is a cliente-only route, causing a redirect loop.
- Files: `src/pages/DashboardPage.tsx`.
- Impact: High. Prestadores cannot access their budget lists from the dashboard.
- Fix approach: Correct the links to point to `/prestador/orcamentos`.

## Security Considerations

**Loose RLS Policies:**
- Risk: Some policies like `orcamentos_update_cliente` do not restrict which status values a client can set.
- Files: `supabase/migrations/...`.
- Current mitigation: Frontend validation, but insufficient for direct API access.
- Recommendations: Tighten RLS policies to allow only specific status transitions (e.g., only 'aceito' or 'recusado' for clients).

## Performance Bottlenecks

**Large Bundle Size:**
- Problem: Many large components are loaded, although `lazy` loading is used in `App.tsx`.
- Files: `src/App.tsx`.
- Cause: Deeply nested component trees and heavy libraries like `recharts` and `jspdf`.
- Improvement path: Review bundle analysis and consider further code splitting or lighter alternatives for specific utilities.

## Fragile Areas

**RoleGuard Race Condition:**
- Files: `src/components/guards/RoleGuard.tsx`, `src/store/authStore.ts`.
- Why fragile: If the profile fetch fails after session initialization, the `RoleGuard` shows an infinite spinner with no error recovery path.
- Safe modification: Add error state handling to `authStore` and display an error message/retry button in `RoleGuard`.

---

*Concerns audit: 2025-05-15*
