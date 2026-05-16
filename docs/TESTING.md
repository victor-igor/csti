<!-- generated-by: gsd-doc-writer -->
# Testes — OrçaFácil

Guia de referência para escrever, rodar e entender os testes do projeto.

---

## Visão Geral da Estratégia

O projeto adota duas camadas de teste:

| Camada | Ferramenta | Onde fica | O que cobre |
|--------|-----------|-----------|-------------|
| **Unit / Integração** | Vitest + Testing Library | `src/**/__tests__/` (ao lado dos arquivos) | Componentes, hooks, schemas, utils, store |
| **E2E** | Playwright (`@playwright/test`) | `npm run test:e2e` | Fluxos completos no browser |

---

## Como Rodar os Testes

### Unitários (Vitest)

```bash
# Roda todos os testes uma vez
npm run test

# Modo watch (padrão do Vitest — reexecuta ao salvar)
npm run test -- --watch

# UI interativa do Vitest (se disponível no terminal)
npm run test -- --ui

# Coverage (sem script dedicado — rodar diretamente)
npx vitest --coverage
```

### E2E (Playwright)

```bash
npm run test:e2e
```

> **Nota:** O script `test:e2e` está definido no `package.json`, mas não existe `playwright.config.*` nem diretório `e2e/` ou `tests/` no repositório no momento desta documentação. A suite E2E ainda não foi criada. <!-- VERIFY: existência de playwright.config.ts e diretório e2e/ -->

---

## Estrutura de Testes

Os arquivos de teste ficam em pastas `__tests__/` imediatamente ao lado da pasta que contêm o código testado. Extensão utilizada: **`*.test.ts`** / **`*.test.tsx`** (não há arquivos `*.spec.*`).

```
src/
├── components/
│   ├── atoms/
│   │   └── __tests__/
│   │       ├── Button.test.tsx
│   │       ├── CurrencyDisplay.test.tsx
│   │       ├── PageContainer.test.tsx
│   │       ├── StatusBadge.test.tsx
│   │       ├── StickyActionBar.test.tsx
│   │       └── UrgenciaBadge.test.tsx
│   ├── molecules/
│   │   └── __tests__/
│   │       ├── FilterBar.test.tsx
│   │       ├── ListPageShell.test.tsx
│   │       ├── OrcamentosMetricsChart.test.tsx
│   │       └── SelectField.test.tsx
│   └── pdf/
│       └── __tests__/
│           └── PdfGenerator.test.ts
├── features/
│   ├── auth/
│   │   └── __tests__/
│   │       ├── authSchemas.test.ts       ← validação Zod
│   │       └── login.test.tsx            ← página de login + hooks
│   ├── notificacoes/
│   │   └── __tests__/
│   │       └── useNotificacoes.test.ts
│   ├── orcamento/
│   │   └── __tests__/
│   │       └── orcamentoSchemas.test.ts  ← validação Zod
│   ├── perfil/
│   │   └── __tests__/
│   │       └── usePerfil.test.tsx        ← hook + página
│   └── solicitacao/
│       ├── __tests__/
│       │   ├── SolicitacaoDetailPage.test.tsx
│       │   ├── solicitacaoSchemas.test.ts
│       │   └── useSolicitacao.test.ts    ← hooks com React Query
│       └── components/
│           └── __tests__/
│               └── SolicitacaoCard.test.tsx
├── hooks/
│   └── __tests__/
│       └── useBreadcrumb.test.tsx
├── lib/
│   └── __tests__/
│       ├── constants.test.ts
│       ├── dateUtils.test.ts
│       ├── errorUtils.test.ts
│       ├── greeting.test.ts
│       └── metricsUtils.test.ts
├── store/
│   └── __tests__/
│       └── authStore.test.ts
└── types/
    └── domain.test.ts
```

---

## Configuração

### Ambiente

A configuração de teste fica em `vite.config.ts` (seção `test`):

```ts
test: {
  environment: 'jsdom',
  setupFiles: ['./vitest.setup.ts'],
  globals: true,
  exclude: ['**/node_modules/**', '**/.claude/**', '**/dist/**'],
}
```

- **`environment: 'jsdom'`** — simula DOM para testes de componentes React.
- **`globals: true`** — `describe`, `it`, `expect`, `vi` disponíveis globalmente (sem import explícito).
- **`setupFiles`** — `vitest.setup.ts` é executado antes de cada suite.

### Setup Global (`vitest.setup.ts`)

```ts
import '@testing-library/jest-dom'
```

Isso importa os matchers customizados do `@testing-library/jest-dom` (`.toBeInTheDocument()`, `.toBeDisabled()`, `.toHaveClass()`, etc.) em todos os testes.

---

## Convenção de Nomenclatura

| Aspecto | Convenção |
|---------|-----------|
| Extensão | `*.test.ts` ou `*.test.tsx` |
| Localização | `__tests__/` dentro da mesma pasta do arquivo testado |
| Nome do arquivo | Igual ao arquivo de origem (ex.: `Button.tsx` → `Button.test.tsx`) |
| `describe` | Nome do componente/hook/módulo |
| `it` | Frase em português descrevendo o comportamento esperado |

---

## Padrões de Mock

### Mocking do Supabase

O módulo `@/lib/supabase` é mockado com `vi.mock`. Para testes de hooks que fazem chaining (`.from().select().eq().order()`), use `vi.hoisted` para garantir que o mock seja processado antes dos imports:

```ts
const mockSupabase = vi.hoisted(() => ({
  auth: {
    onAuthStateChange: vi.fn().mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    }),
    getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
  },
  from: vi.fn(),
  select: vi.fn(),
  eq: vi.fn(),
  order: vi.fn(),
  single: vi.fn(),
}))

vi.mock('@/lib/supabase', () => ({
  supabase: mockSupabase,
}))
```

No `beforeEach`, configure o chaining retornando `this` em cada método intermediário:

```ts
beforeEach(() => {
  vi.clearAllMocks()
  mockSupabase.from.mockReturnThis()
  mockSupabase.select.mockReturnThis()
  mockSupabase.eq.mockReturnThis()
  mockSupabase.order.mockReturnThis()
})
```

Para testes de componentes com `vi.mock` simples (sem chaining complexo):

```ts
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
    from: vi.fn(),
  },
}))
```

### Mocking do React Query (TanStack Query)

Hooks que usam `useQuery` / `useMutation` precisam de um `QueryClientProvider` no wrapper. Padrão utilizado no projeto:

```ts
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

// Para renderHook:
const { result } = renderHook(() => useListSolicitacoes(), {
  wrapper: createWrapper(),
})

// Para render de componente:
function renderPerfilPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <MinhaPage />
      </QueryClientProvider>
    </MemoryRouter>,
  )
}
```

> Use `retry: false` para evitar que queries com erro façam retentativas e travem os testes.

### Testing com React Hook Form

Para testar componentes com formulários (React Hook Form + Zod), use `fireEvent.change` e `fireEvent.click` para preencher campos e submeter, aguardando mensagens de validação com `waitFor`:

```ts
it('exibe erro de email inválido inline', async () => {
  renderLoginPage()

  fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'nao-e-email' } })
  fireEvent.change(screen.getByLabelText('Senha'), { target: { value: '12345678' } })
  fireEvent.click(screen.getByRole('button', { name: /entrar/i }))

  await waitFor(() => {
    expect(screen.getByText('E-mail inválido')).toBeInTheDocument()
  })
})
```

Para interações mais realistas (digitação caractere a caractere), use `userEvent`:

```ts
import userEvent from '@testing-library/user-event'

it('chama onClick ao clicar', async () => {
  const onClick = vi.fn()
  render(<Button onClick={onClick}>Clicar</Button>)
  await userEvent.click(screen.getByRole('button', { name: 'Clicar' }))
  expect(onClick).toHaveBeenCalledOnce()
})
```

---

## Coverage

Não há script dedicado nem threshold configurado. Para gerar relatório de cobertura:

```bash
# Relatório no terminal
npx vitest --coverage

# Relatório HTML (abre em browser)
npx vitest --coverage --reporter=html
```

Para adicionar threshold permanente, adicionar à seção `test` do `vite.config.ts`:

```ts
coverage: {
  thresholds: {
    lines: 80,
    branches: 75,
    functions: 80,
    statements: 80,
  },
}
```

---

## CI

<!-- VERIFY: configuração de CI/CD no repositório — não foram encontrados arquivos .github/workflows/ durante a geração desta documentação -->

Não foram detectados workflows de CI (`.github/workflows/`) no repositório. Recomenda-se adicionar um step de testes na pipeline de integração contínua usando `npm run test`.

---

## E2E com Playwright

O Playwright está instalado (`@playwright/test ^1.59.1`) e o script `test:e2e` está configurado no `package.json`, mas ainda não há `playwright.config.*` nem diretório com suites E2E no repositório.

<!-- VERIFY: criação de playwright.config.ts e diretório e2e/ com as primeiras suites -->

Quando a suite for criada, documentar aqui:
- Arquivo de configuração (`playwright.config.ts`)
- Diretório das specs (ex.: `e2e/`)
- Browsers configurados
- Como rodar em modo headed: `npx playwright test --headed`
- Como rodar um único arquivo: `npx playwright test e2e/login.spec.ts`
