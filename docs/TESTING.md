<!-- generated-by: gsd-doc-writer -->
# Testes — CSTI

Guia de referência para escrever, rodar e entender os testes do projeto.

---

## Visão Geral da Estratégia

O projeto adota duas camadas de teste principais:

| Camada | Ferramenta | Onde fica | O que cobre |
|--------|-----------|-----------|-------------|
| **Unit / Integração** | Vitest + Testing Library | `src/**/__tests__/` | Componentes, hooks, schemas, utils, store |
| **E2E** | Playwright | `package.json` script `test:e2e` | Fluxos completos no browser |

---

## Ferramental e Versões

- **Vitest**: `^4.1.5`
- **Playwright**: `^1.59.1`
- **Testing Library**: `@testing-library/react`, `@testing-library/jest-dom`
- **Ambiente**: `jsdom` (configurado em `vite.config.ts`)

---

## Como Rodar os Testes

### Unitários e de Integração (Vitest)

```bash
# Executa todos os testes uma vez
npm run test

# Modo watch (reexecuta ao salvar arquivos)
npm run test -- --watch

# Gerar relatório de cobertura (coverage)
npm run test -- --coverage
```

### End-to-End (Playwright)

```bash
npm run test:e2e
```

---

## Estrutura de Testes

Os arquivos de teste são co-localizados com a implementação em diretórios `__tests__/`. Extensões utilizadas: `*.test.ts` (lógica) ou `*.test.tsx` (componentes).

### Mapeamento de Testes Existentes

```
src/
├── components/
│   ├── atoms/__tests__/          # Button, StatusBadge, UrgenciaBadge...
│   ├── molecules/__tests__/      # FilterBar, SelectField, ListPageShell...
│   └── pdf/__tests__/            # PdfGenerator.test.ts
├── features/
│   ├── auth/__tests__/           # login.test.tsx, authSchemas.test.ts
│   ├── notificacoes/__tests__/   # useNotificacoes.test.ts
│   ├── orcamento/__tests__/      # orcamentoSchemas.test.ts
│   ├── perfil/__tests__/         # usePerfil.test.tsx
│   └── solicitacao/__tests__/    # useSolicitacao.test.ts, solicitacaoSchemas.test.ts
├── hooks/__tests__/              # useBreadcrumb.test.tsx
├── lib/__tests__/                # dateUtils, errorUtils, metricsUtils...
└── store/__tests__/              # authStore.test.ts
```

---

## Padrões de Mocking

### 1. Supabase Client
O módulo `@/lib/supabase` deve ser mockado para evitar chamadas reais à API. Usamos `vi.mock` e `vi.hoisted` para lidar com encadeamento de métodos (chaining):

```typescript
const mockSupabase = vi.hoisted(() => ({
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn(),
}))

vi.mock('@/lib/supabase', () => ({
  supabase: mockSupabase,
}))
```

### 2. TanStack Query
Hooks que utilizam `useQuery` ou `useMutation` precisam ser envolvidos por um `QueryClientProvider` nos testes:

```typescript
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

renderHook(() => useMyHook(), { wrapper })
```

---

## Convenções de Escrita

- **Idioma**: Descrições de testes (`describe`, `it`) são escritas em **Português**.
- **Padrão**: Gherkin-like ou "should" pattern (ex: `'deve renderizar erro quando o e-mail é inválido'`).
- **Localização**: Sempre dentro de uma pasta `__tests__` no mesmo nível do arquivo testado.

---

## Cobertura (Coverage)

Não há thresholds (limites) obrigatórios configurados no momento, mas as features críticas (`auth`, `solicitacao`, `orcamento`) possuem alta cobertura de testes unitários e de esquema.

Para visualizar o relatório detalhado:
```bash
npx vitest --coverage --reporter=html
# Abra o arquivo ./coverage/index.html no seu navegador
```

---

## Testes Manuais

O arquivo `CHECKLIST-TESTES-CSTI.md` contém um roteiro detalhado para testes manuais de regressão, cobrindo fluxos de:
- Cadastro e Login
- Criação de Solicitação
- Envio e Aprovação de Orçamento
- Fluxo de Admin (Gerenciamento de Usuários)
