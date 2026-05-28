# Testing Patterns

**Analysis Date:** 2025-05-15

## Test Framework

**Runner:**
- **Vitest** `^4.1.5`
- **Config:** `vite.config.ts` and `vitest.setup.ts`.
- **Environment:** `jsdom`.

**Assertion Library:**
- **Vitest built-in** (`expect`).
- **@testing-library/jest-dom** for DOM-specific assertions.

**Run Commands:**
```bash
npm run test          # Run tests
npm run test -- --watch # Watch mode
```

## Test File Organization

**Location:**
- Co-located with implementation in `__tests__` directories.
- Example: `src/features/auth/__tests__/login.test.tsx`.

**Naming:**
- `[FileName].test.ts` or `[FileName].test.tsx`.

**Structure:**
```
src/
├── features/
│   └── [feature]/
│       ├── __tests__/
│       └── components/
│           └── __tests__/
```

## Test Structure

**Suite Organization:**
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

describe('ComponentName', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render correctly', () => {
    // Arrange, Act, Assert
  })
})
```

**Patterns:**
- Extensive use of `vi.mock` for external dependencies, especially `@/lib/supabase`.
- Tests are written in Portuguese for descriptions (e.g., `'retorna lista quando supabase retorna dados'`).

## Mocking

**Framework:** Vitest (`vi`).

**Patterns:**
```typescript
const mockSupabase = vi.hoisted(() => ({
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  // ... chain methods
}))

vi.mock('@/lib/supabase', () => ({
  supabase: mockSupabase,
}))
```

**What to Mock:**
- External services (Supabase, API calls).
- Routing (`useNavigate` from `react-router-dom`).
- Global state (`useAuthStore`).

**What NOT to Mock:**
- Pure utility functions (unless testing side effects).
- Zod schemas (test validation logic directly).

## Fixtures and Factories

**Test Data:**
- Defined locally within test files as constants.
- Typed using domain interfaces from `src/types/domain.ts`.

**Location:**
- Mostly inline in `__tests__` files.

## Coverage

**Requirements:** None explicitly enforced in CI, but high coverage is maintained in critical features like `auth` and `solicitacao`.

**View Coverage:**
```bash
npm run test -- --coverage
```

## Test Types

**Unit Tests:**
- Utilities in `src/lib/__tests__`.
- Zod schemas in `src/features/**/__tests__/*Schemas.test.ts`.

**Integration Tests:**
- Hooks in `src/features/**/__tests__/use*.test.ts` (testing TanStack Query interactions with mocked Supabase).
- Components in `src/components/**/__tests__`.

**E2E Tests:**
- Playwright is configured (`playwright.config.ts` if present, but `package.json` has `test:e2e` script).
- Manual checklist: `CHECKLIST-TESTES-OrcaFacil.md`.

## Common Patterns

**Async Testing:**
```typescript
await waitFor(() => expect(result.current.isSuccess).toBe(true))
```

**Error Testing:**
```typescript
mockSupabase.select.mockResolvedValueOnce({ data: null, error: new Error('API Error') })
```

---

*Testing analysis: 2025-05-15*
