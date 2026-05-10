# Technology Stack

**Analysis Date:** 2026-05-09

## Languages

**Primary:**
- TypeScript ~6.0.2 - All source code under `src/`

**Secondary:**
- CSS - Tailwind v4 via `src/index.css` (CSS-first config, no JS config needed)

## Runtime

**Environment:**
- Node.js 18+ (required by Vite 8 and Playwright)

**Package Manager:**
- npm
- Lockfile: `package-lock.json` (present)

## Frameworks

**Core:**
- React 19.2.5 - UI framework, configured with `react-jsx` transform
- React Router DOM 7.14.2 - Client-side routing (`src/App.tsx`)
- Vite 8.0.10 - Build tool and dev server (`vite.config.ts`)

**State Management:**
- Zustand 5.0.12 - Global client state (`src/store/authStore.ts`)
- TanStack Query 5.100.6 - Server state / async data fetching (`src/lib/queryClient.ts`)
  - Default staleTime: 5 minutes, retry: 1, refetchOnWindowFocus: false

**Forms & Validation:**
- React Hook Form 7.74.0 - Form state management
- @hookform/resolvers 5.2.2 - Zod adapter for RHF
- Zod 4.3.6 - Schema validation (`src/features/*/`*Schemas.ts`)

**UI & Styling:**
- Tailwind CSS 4.2.4 - Utility-first CSS (via `@tailwindcss/vite` plugin, CSS-first approach)
- shadcn/ui 4.6.0 - Component library scaffold (`components.json`, style: `base-nova`)
  - Base color: neutral, CSS variables enabled, icon library: lucide
- @base-ui/react 1.4.1 - Unstyled primitives (used alongside shadcn)
- @radix-ui/react-dropdown-menu 2.1.16 - Dropdown primitive
- lucide-react 1.14.0 - Icon library
- sonner 2.0.7 - Toast notifications
- class-variance-authority 0.7.1 - Variant-based className management
- clsx 2.1.1 + tailwind-merge 3.5.0 - Conditional class merging (`src/lib/utils.ts`)
- tw-animate-css 1.4.0 - Animation utilities
- @fontsource-variable/geist 5.2.8 - Geist variable font
- @fontsource/inter 5.2.8 - Inter font

**PDF Generation:**
- jsPDF 4.2.1 - Client-side PDF generation (`src/components/pdf/PdfGenerator.ts`)
  - Used for generating orçamento (budget) PDFs with BRL currency formatting

**Testing:**
- Vitest 4.1.5 - Unit test runner (`vite.config.ts` test config, jsdom environment)
- @testing-library/react 16.3.2 - React component testing
- @testing-library/user-event 14.6.1 - User interaction simulation
- @testing-library/jest-dom 6.9.1 - DOM matchers (`vitest.setup.ts`)
- jsdom 29.1.0 - DOM environment for tests
- Playwright 1.59.1 - E2E testing (`npm run test:e2e`)

**Build/Dev:**
- @vitejs/plugin-react 6.0.1 - React fast refresh
- TypeScript ESLint 8.58.2 - Type-aware linting (`eslint.config.js`)
- eslint-plugin-react-hooks 7.1.1 - Hooks rules
- eslint-plugin-react-refresh 0.5.2 - HMR safety
- autoprefixer 10.5.0 / postcss 8.5.12 - CSS processing

## Key Dependencies

**Critical:**
- `@supabase/supabase-js` 2.105.1 - Database, auth, and realtime (sole backend)
- `zustand` 5.0.12 - Auth session state persisted in `src/store/authStore.ts`
- `@tanstack/react-query` 5.100.6 - All async data queries across feature hooks

**Infrastructure:**
- `react-router-dom` 7.14.2 - Page routing
- `jspdf` 4.2.1 - PDF export (core business feature)
- `zod` 4.3.6 - Shared validation between forms and type guards

## Configuration

**Environment:**
- Configured via `.env.local` (present, not committed)
- Template available at `.env.example`
- Required vars:
  - `VITE_SUPABASE_URL` - Supabase project URL
  - `VITE_SUPABASE_ANON_KEY` - Supabase anonymous/public key
- All env vars must be prefixed `VITE_` to be exposed to browser via `import.meta.env`
- Supabase client initialized at `src/lib/supabase.ts` using these vars

**Build:**
- `vite.config.ts` - Main build + test config
- `tsconfig.json` + `tsconfig.app.json` + `tsconfig.node.json` - TypeScript project references
- `tsconfig.app.json`: target ES2023, module ESNext, bundler resolution, path alias `@` → `./src`
- `tailwind.config.ts` - Tailwind configuration (Tailwind v4 CSS-first, minimal JS config)
- `components.json` - shadcn/ui registry config (aliases: `@/components`, `@/components/ui`, `@/lib`, `@/hooks`)
- `eslint.config.js` - ESLint flat config
- `index.html` - Vite SPA entry point

## Platform Requirements

**Development:**
- Node.js 18+
- npm (lockfile present)
- `.env.local` with Supabase credentials

**Production:**
- Static SPA build (`npm run build` → `dist/`)
- Requires hosting that serves `index.html` for all routes (SPA)
- No server-side rendering — pure client-side React
- All backend via Supabase (remote-only, no local Supabase instance)

---

*Stack analysis: 2026-05-09*
