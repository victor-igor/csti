# Architecture

**Analysis Date:** 2026-05-09

## Pattern Overview

**Overall:** Feature-based SPA with role-based access control

**Key Characteristics:**
- Features are self-contained modules under `src/features/` with their own pages, hooks, and schemas
- Role-based routing enforced at the route level via `RoleGuard` (`cliente` vs `prestador`)
- Global auth state managed via Zustand store, synced with Supabase's `onAuthStateChange` singleton listener
- All protected pages render inside `AppShell`, which provides the persistent layout (TopBar, Sidebar, BottomNav)
- Data fetching via TanStack Query; all queries/mutations live inside feature-level hooks

## Layers

**Auth Layer:**
- Purpose: Session management and role enforcement
- Location: `src/store/authStore.ts`, `src/components/guards/`
- Contains: Zustand store, `ProtectedRoute`, `RoleGuard`
- Depends on: Supabase client (`src/lib/supabase.ts`)
- Used by: `App.tsx` (route wrappers), feature hooks (reads profile/role)

**Routing Layer:**
- Purpose: Declare all routes, apply auth and role guards
- Location: `src/App.tsx`
- Contains: React Router v6 `<Routes>` tree with nested `<Route>` guards
- Depends on: `ProtectedRoute`, `RoleGuard`, `AppShell`, lazy-loaded feature pages
- Used by: Root render (`src/main.tsx`)

**Layout Layer:**
- Purpose: Persistent shell for all authenticated pages
- Location: `src/components/layout/`
- Contains: `AppShell.tsx`, `TopBar.tsx`, `Sidebar.tsx`, `BottomNav.tsx`, `MobileDrawer.tsx`, `useNavLinks.ts`
- Depends on: `useSidebar` hook, React Router `<Outlet>`
- Used by: `App.tsx` (wraps all protected routes)

**Feature Layer:**
- Purpose: Domain-specific pages, hooks, and validation schemas
- Location: `src/features/{auth,solicitacao,orcamento,ordem-servico,perfil,notificacoes}/`
- Contains: Page components, `use{Feature}.ts` hooks, `{feature}Schemas.ts` (Zod)
- Depends on: `src/lib/supabase.ts`, `src/types/domain.ts`, shared components
- Used by: `App.tsx` (lazy imports)

**Shared Component Layer:**
- Purpose: Reusable UI primitives and composites
- Location: `src/components/{atoms,molecules,organisms,ui,pdf}/`
- Contains: `Button`, `LoadingSkeleton`, `StatusBadge`, `EmptyState`, `ErrorState`, `DataTable`, `OrcamentoCard`, `SolicitacaoCard`, etc.
- Depends on: `src/lib/utils.ts`, Tailwind
- Used by: Feature pages

**Data / Types Layer:**
- Purpose: Domain types derived from Supabase schema and shared constants
- Location: `src/types/domain.ts`, `src/types/supabase.ts`, `src/lib/constants.ts`
- Contains: `Role`, `ISolicitacao`, `IOrcamento`, `IOrdemServico`, `IProfile`, status union types
- Depends on: Auto-generated `supabase.ts` types
- Used by: All layers above

## Data Flow

**Authenticated User Action (e.g., creating a solicitacao):**

1. User navigates to `/solicitacoes/nova` (guarded by `RoleGuard allowedRoles=['cliente']`)
2. `SolicitacaoFormPage` renders inside `AppShell > Outlet`
3. Form validated by Zod schema (`solicitacaoSchemas.ts`)
4. Submission calls mutation in `useSolicitacao.ts` → Supabase insert
5. TanStack Query invalidates relevant query keys
6. `sonner` toast confirms result; router navigates to detail page

**Auth State Flow:**

1. `supabase.auth.onAuthStateChange` fires (singleton in `authStore.ts`)
2. Fetches `profiles` row for the user
3. Calls `useAuthStore.getState().setSession(user, profile, session)`
4. `ProtectedRoute` reads `session` from store — redirects to `/login` if null
5. `RoleGuard` reads `profile.role` — redirects to `/dashboard` if role not allowed

**State Management:**
- Auth: Zustand (`useAuthStore`) — single global store
- Server state: TanStack Query — per-feature query hooks
- UI state (sidebar expanded): `useSidebar` hook (local/hook-level)

## Key Abstractions

**ProtectedRoute:**
- Purpose: Gate all authenticated routes
- Location: `src/components/guards/ProtectedRoute.tsx`
- Pattern: Reads `session` from Zustand; renders `<Outlet>` or redirects to `/login`

**RoleGuard:**
- Purpose: Gate role-specific routes (`cliente` or `prestador`)
- Location: `src/components/guards/RoleGuard.tsx`
- Pattern: Reads `profile.role` from Zustand; renders `<Outlet>` or redirects to `/dashboard`

**AppShell:**
- Purpose: Persistent authenticated layout
- Location: `src/components/layout/AppShell.tsx`
- Pattern: `TopBar + Sidebar + <main><Outlet /></main> + BottomNav`; sidebar width is responsive via `useSidebar`

**Feature Hook (use{Feature}.ts):**
- Purpose: Encapsulate all Supabase queries/mutations for a domain
- Examples: `src/features/solicitacao/useSolicitacao.ts`, `src/features/orcamento/useOrcamento.ts`
- Pattern: TanStack Query `useQuery` / `useMutation` wrapping Supabase calls; returns typed data

**Domain Types:**
- Purpose: Single source of truth for all entity shapes
- Location: `src/types/domain.ts`
- Pattern: `type IEntity = Tables<'table_name'>` — derived directly from generated Supabase types

## Entry Points

**Application Bootstrap:**
- Location: `src/main.tsx`
- Triggers: Browser loads `index.html` → Vite serves `main.tsx`
- Responsibilities: Renders `<App />` into DOM

**Route Tree:**
- Location: `src/App.tsx`
- Triggers: Every navigation event
- Responsibilities: Lazy-loads pages, applies `GlobalErrorBoundary`, `QueryClientProvider`, `BrowserRouter`, auth/role guards, `AppShell`

## Error Handling

**Strategy:** Error boundary at root + per-component error states

**Patterns:**
- `GlobalErrorBoundary` (`src/components/GlobalErrorBoundary.tsx`) wraps entire app — catches unhandled render errors
- Feature pages use `ErrorState` atom component for query error display
- Toast notifications via `sonner` for mutation errors/successes

## Cross-Cutting Concerns

**Logging:** Console only — no structured logging service detected
**Validation:** Zod schemas co-located per feature (`{feature}Schemas.ts`)
**Authentication:** Supabase Auth + Zustand store; role from `profiles` table

---

*Architecture analysis: 2026-05-09*
