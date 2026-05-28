# Coding Conventions

**Analysis Date:** 2025-05-15

## Naming Patterns

**Files:**
- **React Components:** PascalCase with descriptive names — `SolicitacaoCard.tsx`, `StatusBadge.tsx`, `AppShell.tsx`.
- **Pages:** PascalCase with `Page` suffix — `DashboardPage.tsx`, `SolicitacaoDetailPage.tsx`.
- **Hooks:** camelCase starting with `use` — `useSolicitacao.ts`, `useAuthStore.ts`.
- **Schemas:** camelCase with `Schemas` suffix — `solicitacaoSchemas.ts`.
- **Utilities:** camelCase — `dateUtils.ts`, `errorUtils.ts`.
- **Types:** Usually `domain.ts` or `supabase.ts`.

**Functions:**
- **Components:** PascalCase named exports preferred — `export function Button()`.
- **Hooks:** camelCase starting with `use`.
- **Utility functions:** camelCase with descriptive verbs — `formatCurrency()`, `parseApiError()`.

**Variables:**
- **Local variables:** camelCase.
- **Constants:** UPPER_SNAKE_CASE for global/static constants — `STATUS_CONFIG` in `src/lib/constants.ts`.

**Types:**
- **Interfaces:** Often prefixed with `I` for domain entities — `ISolicitacao`, `IOrcamento`.
- **Zod Inferred Types:** Suffix `FormData` — `CreateSolicitacaoFormData`.
- **Enums/Unions:** PascalCase — `SolicitacaoStatus`, `Role`.

## Code Style

**Formatting:**
- **Tool:** Prettier (default Vite settings) + ESLint.
- **Indentation:** 2 spaces.
- **Quotes:** Single quotes preferred for strings and imports.
- **Semicolons:** Omitted where possible (standard Modern JS style).

**Linting:**
- **Tool:** ESLint 10.x.
- **Config:** `eslint.config.js` (Flat config).
- **Key Rules:** `@eslint/js/recommended`, `typescript-eslint/recommended`, `react-hooks/recommended`.

## Import Organization

**Order:**
1. External libraries (e.g., `react`, `lucide-react`, `@tanstack/react-query`).
2. Internal absolute imports using `@/` alias (e.g., `@/components/...`, `@/lib/...`).
3. Relative imports for local files.

**Path Aliases:**
- `@/` maps to `src/` directory — defined in `tsconfig.json` and `vite.config.ts`.

## Error Handling

**Patterns:**
- **API/Supabase:** Destructure `{ data, error }` and throw on error: `if (error) throw error`.
- **Mutations:** Use `onError` callback in TanStack Query to display toasts via `sonner`.
- **Global:** `GlobalErrorBoundary` wraps the application in `src/App.tsx`.
- **Utility:** `parseApiError` in `src/lib/errorUtils.ts` centralizes error message formatting.

## Logging

**Framework:** `console` (native).

**Patterns:**
- `console.error` used in error boundaries and critical failure points.
- No production logging service detected.

## Comments

**When to Comment:**
- Use comments to explain non-obvious logic or performance optimizations (e.g., stable references in `useSolicitacao.ts`).
- TODO/FIXME comments are used to track pending improvements.

**JSDoc/TSDoc:**
- Sparingly used; mostly rely on TypeScript types for documentation.

## Function Design

**Size:** Most components and hooks are kept small, but some pages like `AdminUsuariosPage.tsx` exceed 600 lines.

**Parameters:** Prefer object destructuring for props and complex function arguments to improve readability.

**Return Values:** Hooks typically return TanStack Query result objects or custom state/methods.

## Module Design

**Exports:**
- Named exports for most functions and components.
- Default exports for Pages (to facilitate `lazy` loading in `App.tsx`).

**Barrel Files:** Not used; direct imports are preferred to avoid circular dependencies and improve tree-shaking.

---

*Convention analysis: 2025-05-15*
