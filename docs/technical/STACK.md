# Technology Stack

**Analysis Date:** 2025-05-24

## Languages

**Primary:**
- TypeScript - Frontend development, domain logic, and types.

**Secondary:**
- SQL (PL/pgSQL) - Database migrations, triggers, and RPC functions in `supabase/migrations/`.
- CSS3 - Global styles and Tailwind directives.

## Runtime

**Environment:**
- Node.js (via Vite) - Development server and build tool.

**Package Manager:**
- npm - Dependency management.
- Lockfile: `package-lock.json` present.

## Frameworks

**Core:**
- React 19 - UI library for building the single-page application.
- Vite - Build tool and development server.
- Tailwind CSS 4 - Utility-first CSS framework for styling.

**Testing:**
- Vitest - Unit and integration testing runner.
- Playwright - End-to-end testing framework.
- React Testing Library - Testing utilities for React components.

**Build/Dev:**
- TypeScript - Static type checking.
- ESLint - Linting tool for code quality.

## Key Dependencies

**Critical:**
- `@supabase/supabase-js` - Client library for interacting with Supabase (Auth, DB).
- `@tanstack/react-query` - Data fetching, caching, and state synchronization.
- `zustand` - Lightweight state management for client-side state.
- `react-router-dom` - Routing library for single-page application navigation.

**Infrastructure:**
- `zod` - Schema validation and type inference.
- `react-hook-form` - Form state management and validation.
- `shadcn` - UI component library.
- `lucide-react` - Icon library.
- `recharts` - Charting library for data visualization.
- `jsPDF` - PDF generation for reports and service orders.
- `react-joyride` - Onboarding and product tours.

## Configuration

**Environment:**
- Configured via `.env` files.
- Key configs: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.

**Build:**
- `vite.config.ts`: Vite configuration including React plugin and path aliases.
- `tsconfig.json`: TypeScript configuration for the project.
- `vercel.json`: Deployment configuration for Vercel.

## Platform Requirements

**Development:**
- Node.js environment (v20+ recommended).
- Supabase account for backend services.

**Production:**
- Deployment target: Vercel.

---

*Stack analysis: 2025-05-24*
