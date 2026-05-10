# Testing Patterns

**Analysis Date:** 2026-05-09

## Test Framework

**Runner:**
- Vitest `^4.1.5`
- Config: `vite.config.ts` (single file — `/// <reference types="vitest" />`)
- Environment: `jsdom`
- Setup: `vitest.setup.ts` — imports `@testing-library/jest-dom` for DOM matchers
- Globals: `true` — vitest globals available (though files explicitly import from `vitest`)

**Assertion Library:**
- `@testing-library/jest-dom` — DOM matchers (`toBeInTheDocument`, `toBeDisabled`, `toHaveClass`)
- Vitest native `expect` — `toEqual`, `toBe`, `toHaveBeenCalledWith`, `toHaveBeenCalledOnce`

**Run Commands:**
```bash
npm run test          # Run all tests (vitest)
npm run test -- --watch   # Watch mode
npm run test -- --coverage  # Coverage (if configured)
```

## Test File Organization

**Location:**
- Collocated in `__tests__/` subdirectory within each feature/module
- Pattern: `src/features/[feature]/__tests__/[Unit].test.tsx`
- Exception: `src/types/domain.test.ts` — collocated directly next to `domain.ts`

**Naming:**
- `[ComponentOrHookName].test.tsx` for React components and hooks
- `[schemaFile]Schemas.test.ts` for Zod schema files
- Extension `.tsx` when JSX is used in the test, `.ts` otherwise

**Structure:**
```
src/
├── features/
│   ├── solicitacao/
│   │   ├── __tests__/
│   │   │   ├── solicitacaoSchemas.test.ts
│   │   │   ├── useSolicitacao.test.ts
│   │   │   └── SolicitacaoDetailPage.test.tsx
│   │   └── components/
│   │       └── __tests__/
│   │           └── SolicitacaoCard.test.tsx
│   └── auth/
│       └── __tests__/
│           ├── authSchemas.test.ts
│           └── login.test.tsx
├── components/
│   └── atoms/
│       └── __tests__/
│           ├── Button.test.tsx
│           ├── CurrencyDisplay.test.tsx
│           └── StatusBadge.test.tsx
├── hooks/
│   └── __tests__/
│       └── useBreadcrumb.test.tsx
├── store/
│   └── __tests__/
│       └── authStore.test.ts
├── lib/
│   └── __tests__/
│       ├── constants.test.ts
│       ├── dateUtils.test.ts
│       └── greeting.test.ts
└── types/
    └── domain.test.ts
```

## Test Structure

**Suite Organization:**
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('ComponentOrHookName', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('descrição do cenário em português', () => {
    // Arrange → Act → Assert
  })
})
```

**TDD pattern (SP1/SP2):**
- Tests written before implementation in Sprints 1 and 2
- Schema tests enumerate all boundary cases with numbered descriptions:
  `'1. Título vazio → success: false'`, `'2. Título com 2 chars → success: false (min 3)'`

**Patterns:**
- `beforeEach` to `vi.clearAllMocks()` and reset mock chain returns
- `afterEach` with `vi.useRealTimers()` when fake timers are used
- Test descriptions in Portuguese (pt-BR)
- AAA structure: Arrange → Act → Assert (implicit, not labeled)

## Mocking

**Framework:** Vitest `vi` module

**Supabase mock pattern (used in all hook tests):**
```typescript
const mockSupabase = vi.hoisted(() => ({
  auth: {
    onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
  },
  from: vi.fn(),
  select: vi.fn(),
  is: vi.fn(),
  order: vi.fn(),
  eq: vi.fn(),
  single: vi.fn(),
}))

vi.mock('@/lib/supabase', () => ({
  supabase: mockSupabase,
}))
```

**Supabase chain setup in `beforeEach`:**
```typescript
beforeEach(() => {
  vi.clearAllMocks()
  mockSupabase.from.mockReturnThis()
  mockSupabase.select.mockReturnThis()
  mockSupabase.is.mockReturnThis()
  mockSupabase.eq.mockReturnThis()
  mockSupabase.order.mockReturnThis()
})
```

**Resolve the terminal call only:**
```typescript
// The last method in the chain resolves
mockSupabase.order.mockResolvedValueOnce({ data: mockData, error: null })
```

**Router mock pattern:**
```typescript
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: null }),
  }
})
```

**Store mock pattern:**
```typescript
vi.mock('@/store/authStore', () => ({
  useAuthStore: vi.fn((selector) => selector({ profile: { id: 'user-123' } })),
}))
```

**What to Mock:**
- `@/lib/supabase` — always mock for all unit/hook tests
- `react-router-dom` hooks (`useNavigate`, `useLocation`) in page component tests
- `@/store/authStore` when hooks depend on auth state
- `vi.useFakeTimers()` for date-relative tests (`SolicitacaoCard.test.tsx`)

**What NOT to Mock:**
- Zod schemas — test them directly with `.safeParse()`
- React Testing Library render — use real DOM environment
- Utility functions from `@/lib/` — test them directly

## TanStack Query Hook Testing

**Wrapper pattern:**
```typescript
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

// Usage
const { result } = renderHook(() => useListSolicitacoes(), {
  wrapper: createWrapper(),
})
await waitFor(() => expect(result.current.isSuccess).toBe(true))
expect(result.current.data).toEqual(mockData)
```

**Key rules:**
- `retry: false` — prevents test hanging on failed queries
- New `QueryClient` per test (via `createWrapper()` factory)
- `waitFor` from `@testing-library/react` for async resolution
- Check `result.current.isSuccess` before asserting `data`
- Idle state check: `expect(result.current.fetchStatus).toBe('idle')` for disabled queries

## Zod Schema Testing Pattern

```typescript
import { describe, it, expect } from 'vitest'
import { CreateSolicitacaoSchema } from '../solicitacaoSchemas'

describe('CreateSolicitacaoSchema', () => {
  it('1. Boundary description → success: false', () => {
    const result = CreateSolicitacaoSchema.safeParse({ titulo: '', ... })
    expect(result.success).toBe(false)
  })

  it('N. Valid case → success: true', () => {
    const result = CreateSolicitacaoSchema.safeParse({ titulo: 'Valid', ... })
    expect(result.success).toBe(true)
  })
})
```

**Rules:**
- Use `.safeParse()`, never `.parse()` (avoids throws)
- Assert only `result.success` — not error messages (unless specifically testing messages)
- Number each `it()` for boundary cases: `'1. ...', '2. ...'`
- Cover: min boundary fail, max boundary fail, invalid enum, and valid happy paths

## Component Testing Pattern

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

describe('Button', () => {
  it('chama onClick ao clicar', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Clicar</Button>)
    await userEvent.click(screen.getByRole('button', { name: 'Clicar' }))
    expect(onClick).toHaveBeenCalledOnce()
  })
})
```

**Queries (in order of preference):**
- `screen.getByRole()` — primary, accessible queries
- `screen.getByText()` — for displayed content
- `screen.getByLabelText()` — for form fields
- `container.querySelector()` — last resort for DOM-specific checks

**Page components:** Wrap in `<MemoryRouter>` for routing context:
```typescript
render(<MemoryRouter><LoginPage /></MemoryRouter>)
```

## Fixtures and Factories

**Test data:**
```typescript
const mockSolicitacao: ISolicitacao = {
  id: 'abc-123',
  numero: 'SOL-2026-0001',
  titulo: 'Manutenção do servidor principal',
  status: 'aguardando_orcamento',
  // all required fields explicitly typed
}
```

**Location:** Defined inline at the top of each test file — no shared fixture directory detected.

**Pattern:** Type-annotated const objects matching domain interfaces from `@/types/domain`

## Fake Timers

```typescript
beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-05-08T12:00:00Z'))
})

afterEach(() => {
  vi.useRealTimers()
})
```

Used when testing relative date display (e.g., "há 2 dias").

## Coverage

**Requirements:** Not enforced — no coverage threshold configured in `vite.config.ts`

**Total tests:** 111 passing (as of SP2 completion)

**View Coverage:**
```bash
npm run test -- --coverage
```

## Test Types

**Unit Tests:**
- Pure functions: `src/lib/__tests__/` — `dateUtils`, `constants`, `greeting`
- Zod schemas: `src/features/*/  __tests__/*Schemas.test.ts`
- Domain types: `src/types/domain.test.ts`

**Integration Tests (hook-level):**
- TanStack Query hooks with mocked Supabase: `src/features/*/  __tests__/use*.test.ts`
- Auth store: `src/store/__tests__/authStore.test.ts`

**Component Tests:**
- Atoms: `src/components/atoms/__tests__/`
- Feature components: `src/features/*/components/__tests__/`
- Page components: `src/features/*/  __tests__/*Page.test.tsx`

**E2E Tests:** Not present.

---

*Testing analysis: 2026-05-09*
