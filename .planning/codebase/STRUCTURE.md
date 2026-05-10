# Codebase Structure

**Analysis Date:** 2026-05-09

## Directory Layout

```
orcafacil/
├── src/
│   ├── App.tsx                  # Route tree, providers, guards
│   ├── main.tsx                 # DOM entry point
│   ├── assets/                  # Static assets (images, icons)
│   ├── components/
│   │   ├── atoms/               # Primitive UI components
│   │   ├── molecules/           # Composite UI components
│   │   ├── organisms/           # Complex UI blocks
│   │   ├── guards/              # ProtectedRoute, RoleGuard
│   │   ├── layout/              # AppShell, Sidebar, TopBar, BottomNav
│   │   ├── pdf/                 # PDF generation components
│   │   └── ui/                  # shadcn/ui primitives
│   ├── features/
│   │   ├── auth/                # Login, Register, useAuth, authSchemas
│   │   ├── solicitacao/         # Solicitacao pages, useSolicitacao, schemas, sub-components
│   │   ├── orcamento/           # Orcamento pages, useOrcamento, schemas
│   │   ├── ordem-servico/       # OS pages, useOrdemServico
│   │   ├── perfil/              # Profile page, usePerfil
│   │   └── notificacoes/        # Notification feature
│   ├── hooks/                   # Shared/global hooks (useSidebar, useBreadcrumb)
│   ├── lib/                     # Utilities, clients, constants
│   ├── pages/                   # Thin shell pages (delegate to features)
│   ├── store/                   # Zustand stores (authStore)
│   └── types/                   # domain.ts, supabase.ts (generated)
├── supabase/
│   └── migrations/              # SQL migration files
├── docs/
│   └── superpowers/             # Project specs and plans
├── public/                      # Static public assets
├── dist/                        # Build output (gitignored)
├── index.html                   # Vite HTML entry
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Directory Purposes

**`src/features/`:**
- Purpose: Primary home for all domain logic
- Contains: Per-feature directories, each with pages, a `use{Feature}.ts` hook, `{feature}Schemas.ts` (Zod), and optionally a `components/` subdirectory for feature-local UI
- Key files: `src/features/solicitacao/useSolicitacao.ts`, `src/features/orcamento/OrcamentoFormPage.tsx`

**`src/components/atoms/`:**
- Purpose: Smallest reusable UI primitives
- Contains: `Button.tsx`, `LoadingSkeleton.tsx`, `StatusBadge.tsx`, `EmptyState.tsx`, `ErrorState.tsx`, `CurrencyDisplay.tsx`

**`src/components/molecules/`:**
- Purpose: Composites built from atoms
- Contains: (No subdirectory — files directly inside)

**`src/components/organisms/`:**
- Purpose: Complex, self-contained UI blocks
- Contains: `DataTable.tsx`, `MultiStepForm.tsx`, `OrcamentoCard.tsx`, `SolicitacaoCard.tsx`, `OrdemServicoCard.tsx`, `StatusTimeline.tsx`, `ActionMenu.tsx`, `ItemOrcamentoRow.tsx`

**`src/components/guards/`:**
- Purpose: Route guard wrapper components
- Contains: `ProtectedRoute.tsx` (auth check), `RoleGuard.tsx` (role check)

**`src/components/layout/`:**
- Purpose: Persistent authenticated app shell
- Contains: `AppShell.tsx`, `TopBar.tsx`, `Sidebar.tsx`, `BottomNav.tsx`, `MobileDrawer.tsx`, `useNavLinks.ts`

**`src/components/ui/`:**
- Purpose: shadcn/ui base primitives (do not edit directly)
- Contains: Generated component library files

**`src/components/pdf/`:**
- Purpose: PDF rendering/export components
- Contains: PDF view components for orcamentos/OS

**`src/pages/`:**
- Purpose: Thin shell pages used by routes for list/overview views
- Contains: `DashboardPage.tsx`, `SolicitacoesPage.tsx`, `OrcamentosPage.tsx`, `OrdensServicoPage.tsx`, `PerfilPage.tsx`
- Note: Detail/form pages live in `src/features/` directly; these pages are for list/hub views

**`src/store/`:**
- Purpose: Global client state (Zustand)
- Contains: `authStore.ts` (user, profile, session)

**`src/lib/`:**
- Purpose: Infrastructure utilities and clients
- Contains: `supabase.ts` (Supabase client), `queryClient.ts` (TanStack Query config), `utils.ts` (cn helper), `constants.ts`, `dateUtils.ts`, `greeting.ts`

**`src/types/`:**
- Purpose: Shared TypeScript types
- Contains: `domain.ts` (domain entities and unions), `supabase.ts` (auto-generated DB types)

**`src/hooks/`:**
- Purpose: Shared hooks used across multiple features
- Contains: `useSidebar.ts`, `useBreadcrumb.ts`

**`supabase/migrations/`:**
- Purpose: Version-controlled SQL schema migrations
- Generated: No — authored manually
- Committed: Yes

## Key File Locations

**Entry Points:**
- `src/main.tsx`: DOM render
- `src/App.tsx`: Full route tree and provider setup

**Configuration:**
- `vite.config.ts`: Vite build config, path aliases (`@/` → `src/`)
- `tailwind.config.ts`: Tailwind theme config
- `tsconfig.app.json`: TypeScript compiler settings
- `components.json`: shadcn/ui component config

**Core Logic:**
- `src/store/authStore.ts`: Auth state + Supabase listener
- `src/lib/supabase.ts`: Supabase client singleton
- `src/lib/queryClient.ts`: TanStack Query client config
- `src/types/domain.ts`: All domain entity types and status unions

**Guards:**
- `src/components/guards/ProtectedRoute.tsx`: Session gate
- `src/components/guards/RoleGuard.tsx`: Role gate (`cliente` | `prestador`)

**Layout:**
- `src/components/layout/AppShell.tsx`: Authenticated shell

**Testing:**
- `src/features/**/__tests__/`: Feature-level tests (co-located)
- `src/components/**/__tests__/`: Component tests (co-located)
- `vitest.setup.ts`: Vitest global setup

## Naming Conventions

**Files:**
- Pages: `PascalCase` with `Page` suffix — e.g., `OrcamentoFormPage.tsx`
- Hooks: `camelCase` with `use` prefix — e.g., `useOrcamento.ts`, `useSidebar.ts`
- Schemas: `camelCase` with `Schemas` suffix — e.g., `orcamentoSchemas.ts`
- Components: `PascalCase` — e.g., `StatusBadge.tsx`, `AppShell.tsx`
- Types/interfaces: `PascalCase` with `I` prefix for domain entities — e.g., `ISolicitacao`, `IProfile`
- Status types: `camelCase` union strings — e.g., `'aberta' | 'em_andamento'`

**Directories:**
- Features: `kebab-case` matching domain name — e.g., `ordem-servico/`, `solicitacao/`
- Component categories: `lowercase` atomic design terms — `atoms/`, `molecules/`, `organisms/`

## Where to Add New Code

**New Feature (new domain entity):**
- Create directory: `src/features/{feature-name}/`
- Primary page: `src/features/{feature-name}/{FeatureName}Page.tsx`
- Hook: `src/features/{feature-name}/use{FeatureName}.ts`
- Schemas: `src/features/{feature-name}/{featureName}Schemas.ts`
- Tests: `src/features/{feature-name}/__tests__/`
- Register route in: `src/App.tsx` (lazy import + `<Route>`)
- Add types to: `src/types/domain.ts`

**New Route:**
- Add lazy import at top of `src/App.tsx`
- Add `<Route>` inside appropriate guard block (`ProtectedRoute`, `RoleGuard`, or public)
- If role-restricted: wrap with `<RoleGuard allowedRoles={['cliente']} />` or `['prestador']`

**New Shared Component:**
- Atom (primitive): `src/components/atoms/{ComponentName}.tsx`
- Organism (complex block): `src/components/organisms/{ComponentName}.tsx`
- Layout piece: `src/components/layout/{ComponentName}.tsx`

**New Shared Hook:**
- File: `src/hooks/use{HookName}.ts`
- Test: `src/hooks/__tests__/use{HookName}.test.ts`

**Utilities:**
- Shared helpers: `src/lib/utils.ts` or a new named file in `src/lib/`

**Database Migration:**
- New SQL file: `supabase/migrations/{timestamp}_{description}.sql`

## Special Directories

**`dist/`:**
- Purpose: Vite build output
- Generated: Yes
- Committed: No

**`supabase/migrations/`:**
- Purpose: SQL migration history
- Generated: No
- Committed: Yes

**`src/components/ui/`:**
- Purpose: shadcn/ui generated primitives
- Generated: Yes (via shadcn CLI)
- Committed: Yes — but treat as read-only; customization goes in atoms/molecules

**`src/types/supabase.ts`:**
- Purpose: Auto-generated Supabase DB types
- Generated: Yes (via `supabase gen types`)
- Committed: Yes — regenerate after schema changes

---

*Structure analysis: 2026-05-09*
