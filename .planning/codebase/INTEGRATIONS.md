# External Integrations

**Analysis Date:** 2026-05-09

## APIs & External Services

**Backend-as-a-Service:**
- Supabase - Primary and sole backend (database, auth, realtime, storage)
  - SDK/Client: `@supabase/supabase-js` 2.105.1
  - Client singleton: `src/lib/supabase.ts`
  - Auth env var: `VITE_SUPABASE_ANON_KEY`
  - URL env var: `VITE_SUPABASE_URL`
  - Usage: Remote-only via MCP (no local Supabase instance)
  - Generated types: `src/types/supabase.ts` (auto-generated from schema)

## Data Storage

**Databases:**
- Supabase (PostgreSQL)
  - Connection: `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`
  - Client: `supabase` singleton from `src/lib/supabase.ts`, typed with `Database` from `src/types/supabase.ts`
  - Tables known from domain types: `profiles`, `solicitacoes`, `orcamentos`, `itens_orcamento`, `ordens_servico`
  - Migrations: `src/migrations/` (applied via Supabase MCP)

**File Storage:**
- Supabase Storage (available via the Supabase client, not explicitly configured beyond client setup)

**Caching:**
- TanStack Query in-memory cache (`src/lib/queryClient.ts`)
  - staleTime: 5 minutes
  - No persistence layer (cache resets on page reload)

## Authentication & Identity

**Auth Provider:**
- Supabase Auth (built into `@supabase/supabase-js`)
  - Implementation: `src/features/auth/useAuth.ts` (hooks), `src/store/authStore.ts` (state)
  - Session listener: singleton `supabase.auth.onAuthStateChange` in `src/store/authStore.ts`
  - Profile sync: on auth state change, fetches from `profiles` table and stores in Zustand
  - Pages: `src/features/auth/LoginPage.tsx`, `src/features/auth/RegisterPage.tsx`
  - Schemas: `src/features/auth/authSchemas.ts` (Zod)
  - Session shape: `{ user: User | null, profile: IProfile | null, session: Session | null }`
  - Auth guards: `src/components/guards/` directory

## Monitoring & Observability

**Error Tracking:**
- Not detected (no Sentry, Datadog, or similar)

**Error Boundaries:**
- `src/components/GlobalErrorBoundary.tsx` - React error boundary for UI crash containment

**Logs:**
- Browser console only — no structured logging library detected

## CI/CD & Deployment

**Hosting:**
- Not explicitly configured in codebase (static SPA output to `dist/`)

**CI Pipeline:**
- Not detected (no GitHub Actions, CircleCI, etc. config files found)

## Environment Configuration

**Required env vars:**
- `VITE_SUPABASE_URL` - Supabase project endpoint URL
- `VITE_SUPABASE_ANON_KEY` - Supabase public anon key (safe for browser)

**Secrets location:**
- `.env.local` (gitignored, not committed)
- `.env.example` present as template

**Note:** Only `VITE_`-prefixed vars are exposed to the browser bundle by Vite. No server-side secrets.

## Webhooks & Callbacks

**Incoming:**
- Not detected (no webhook endpoints — this is a pure client-side SPA)

**Outgoing:**
- Not detected

## PDF Generation (Client-Side)

**Library:** jsPDF 4.2.1
- Entry point: `src/components/pdf/PdfGenerator.ts`
- Function: `generateOrcamentoPdf(orcamento, itens, prestador)`
- Output: In-browser PDF download, no server involved
- Locale: `pt-BR` currency formatting (BRL)

## Font CDN

**Self-hosted via npm packages:**
- `@fontsource-variable/geist` - Geist variable font (bundled, no CDN)
- `@fontsource/inter` - Inter font (bundled, no CDN)

---

*Integration audit: 2026-05-09*
