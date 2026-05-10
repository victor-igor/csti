# Coding Conventions

**Analysis Date:** 2026-05-09

## Naming Patterns

**Files:**
- React components: PascalCase with descriptive suffix — `LoginPage.tsx`, `SolicitacaoCard.tsx`, `GlobalErrorBoundary.tsx`
- Pages: `PascalCase` ending in `Page` — `DashboardPage.tsx`, `SolicitacaoDetailPage.tsx`
- Hooks: camelCase starting with `use` — `useSolicitacao.ts`, `useBreadcrumb.ts`, `usePerfil.ts`
- Schemas: camelCase ending in `Schemas` — `solicitacaoSchemas.ts`, `authSchemas.ts`, `orcamentoSchemas.ts`
- Stores: camelCase ending in `Store` — `authStore.ts`
- Utilities: camelCase — `dateUtils.ts`, `queryClient.ts`, `constants.ts`, `utils.ts`
- Types: camelCase or `supabase.ts` / `domain.ts` — no suffix required for type-only files

**Functions/Hooks:**
- React components: PascalCase functions (exported default or named)
- Custom hooks: `useCamelCase()` — always start with `use`
- Utility functions: camelCase — `formatDate()`, `getGreeting()`
- Mutation/query functions in hooks: descriptive verbs — `useCreateSolicitacao`, `useListSolicitacoes`, `useGetSolicitacao`

**Variables:**
- camelCase for all identifiers
- Constants in UPPER_SNAKE_CASE for truly static values — `CATEGORIAS` array in `solicitacaoSchemas.ts`

**Types/Interfaces:**
- Interfaces prefixed with `I` — `ISolicitacao`, `IOrdemServico` (from `src/types/domain.ts`)
- Zod inferred types as `FormData` suffix — `CreateSolicitacaoFormData`, `CreateAuthFormData`
- Enums/union types as PascalCase — `SolicitacaoStatus`

## Code Style

**Formatting:**
- No dedicated `.prettierrc` detected — Vite default + ESLint formatting rules
- Single quotes for imports (TypeScript/ESLint default)
- 2-space indentation (consistent across all observed files)

**Linting:**
- Config: `eslint.config.js` (flat config format)
- Rules: `@eslint/js` recommended + `typescript-eslint` recommended + `eslint-plugin-react-hooks` + `eslint-plugin-react-refresh`
- TypeScript strict-equivalent flags: `noUnusedLocals: true`, `noUnusedParameters: true`, `noFallthroughCasesInSwitch: true`
- `erasableSyntaxOnly: true` — no `enum`, no `namespace`, no `declare`

## TypeScript Configuration

**Strict mode:** Not `strict: true` explicitly, but equivalent enforced via:
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- `noFallthroughCasesInSwitch: true`
- `verbatimModuleSyntax: true` — requires `import type` for type-only imports
- Target: `ES2023`

**Path Aliases:**
- `@/*` maps to `./src/*` — always use `@/` for absolute imports from `src/`
- Example: `import { supabase } from '@/lib/supabase'`

## Import Organization

**Order (observed pattern):**
1. External packages — `react`, `@tanstack/react-query`, `react-router-dom`, `vitest`
2. Internal absolute imports (`@/`) — `@/lib/supabase`, `@/store/authStore`, `@/types/domain`
3. Relative imports — `../solicitacaoSchemas`, `./SolicitacaoCard`

**Type-only imports:**
- Use `import type` when importing only types (enforced by `verbatimModuleSyntax`)
- Example: `import type { ISolicitacao, SolicitacaoStatus } from '@/types/domain'`

## Zod Schema Pattern

**Schema definition (`src/features/*/[feature]Schemas.ts`):**
```typescript
import { z } from 'zod'

export const CATEGORIAS = ['hardware', 'software'] as const

export const CreateSolicitacaoSchema = z.object({
  titulo: z.string().min(3, 'Mínimo 3 caracteres').max(100, 'Máximo 100 caracteres'),
  categoria: z.enum(CATEGORIAS, { error: 'Categoria inválida' }),
})

export type CreateSolicitacaoFormData = z.infer<typeof CreateSolicitacaoSchema>
```

**Rules:**
- Each feature has its own `[feature]Schemas.ts` file in `src/features/[feature]/`
- Schema name: `Create[Entity]Schema`, `Update[Entity]Schema`
- Inferred type exported as `[Action][Entity]FormData`
- Validation messages in Portuguese (pt-BR)

## TanStack Query Hook Pattern

**Location:** `src/features/[feature]/use[Feature].ts`

**Structure:**
```typescript
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

// Query hook — list
export function useListSolicitacoes(filters?: { status?: SolicitacaoStatus }) {
  return useQuery({
    queryKey: ['solicitacoes', filters],
    queryFn: async () => {
      const { data, error } = await supabase.from('...').select('*')
      if (error) throw error
      return data as ISolicitacao[]
    },
  })
}

// Mutation hook
export function useCreateSolicitacao() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateFormData) => { ... },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solicitacoes'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao criar')
    },
  })
}
```

**Query key convention:** `['entityName', filters?]` — array with entity name first

**Enabled pattern:** Use `enabled: !!id` to prevent queries with empty IDs

## Error Handling

**Supabase errors:**
- Destructure `{ data, error }` from every Supabase call
- `if (error) throw error` — always throw, never swallow
- Mutations catch errors in `onError` callback via `toast.error()`

**Form errors:**
- Zod `.safeParse()` for validation — check `result.success` before using `result.data`
- Inline validation messages in Portuguese

## Toast Notifications

**Library:** `sonner`

**Patterns:**
- `toast.error(message)` — on mutation failure in `onError`
- `toast.success(message)` — on mutation success when needed

## Logging

- No dedicated logging library detected
- `console.error` used in error boundaries and error recovery
- Errors from Supabase are thrown and handled at the hook level

## Comments

- Inline comments used sparingly for non-obvious logic
- No mandatory JSDoc requirement observed
- Test descriptions in Portuguese (pt-BR) — e.g., `'retorna lista quando supabase retorna dados'`

## Module Design

**Exports:**
- Named exports preferred — `export function useListSolicitacoes()`
- Default exports for React page components — `export default LoginPage`
- No barrel `index.ts` files observed — import directly from module file

**Barrel Files:** Not used. Import directly: `import { useListSolicitacoes } from '@/features/solicitacao/useSolicitacao'`

---

*Convention analysis: 2026-05-09*
