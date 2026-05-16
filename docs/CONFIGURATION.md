<!-- generated-by: gsd-doc-writer -->
# Configuração — OrçaFácil

Guia completo de configuração do projeto OrçaFácil (React 19 + Vite 8 + TypeScript + Supabase).

---

## Variáveis de Ambiente

O projeto utiliza **apenas duas** variáveis de ambiente, definidas em `.env.example`:

| Variável | Obrigatória | Descrição |
|---|---|---|
| `VITE_SUPABASE_URL` | **Sim** | URL do projeto Supabase (ex.: `https://<project-ref>.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | **Sim** | Chave pública anon do Supabase (JWT de acesso sem privilégios elevados) |

Ambas são prefixadas com `VITE_` para que o Vite as exponha ao bundle do cliente via `import.meta.env`.

### Como obter os valores

1. Acesse o painel do Supabase: <!-- VERIFY: URL do painel do projeto Supabase (não disponível no repositório) -->
2. Navegue para **Project Settings → API**.
3. Copie **Project URL** → `VITE_SUPABASE_URL`
4. Copie **anon / public key** → `VITE_SUPABASE_ANON_KEY`

### Criando o arquivo local

```bash
cp .env.example .env.local
# Preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY com os valores do painel
```

---

## Precedência de Arquivos `.env` (Vite)

O Vite carrega arquivos de variáveis de ambiente na seguinte ordem (maior prioridade primeiro):

| Arquivo | Quando é carregado |
|---|---|
| `.env.local` | Sempre (sobrepõe tudo — nunca comitar) |
| `.env.[mode].local` | Apenas no mode especificado (ex.: `.env.development.local`) |
| `.env.[mode]` | Apenas no mode especificado (ex.: `.env.development`) |
| `.env` | Sempre (valor-base) |

**Regra prática:** use `.env.example` como template e `.env.local` como arquivo real. O `.env.local` está no `.gitignore` e nunca deve ser commitado.

---

## Supabase — Configuração e Banco de Dados

### Credenciais

As credenciais são lidas em `src/` via `import.meta.env.VITE_SUPABASE_URL` e `import.meta.env.VITE_SUPABASE_ANON_KEY`. Sem esses valores preenchidos, a aplicação não consegue conectar ao backend.

### Migrações

As migrações estão em `supabase/migrations/` e devem ser aplicadas em ordem:

| Arquivo | Conteúdo |
|---|---|
| `20260429000001_schema.sql` | Schema principal (tabelas base) |
| `20260429000002_rls.sql` | Row Level Security policies |
| `20260429000003_aprovar_orcamento_fn.sql` | Função de aprovação de orçamento |
| `20260429000004_schema_complement.sql` | Complementos de schema |

Para aplicar as migrações usando o CLI do Supabase:

```bash
# Em desenvolvimento local (requer supabase CLI instalado)
supabase db push

# Verificar status das migrações
supabase migration list
```

### Row Level Security (RLS)

As políticas RLS estão definidas em `supabase/migrations/20260429000002_rls.sql`. A estratégia geral é restringir acesso por `user_id` — cada usuário acessa apenas seus próprios registros. Consulte o arquivo de migração para as políticas exatas por tabela.

<!-- VERIFY: Detalhes de ambiente de produção do Supabase (project ref, region, pool mode) — não disponíveis no repositório -->

---

## Configuração do Vite (`vite.config.ts`)

```ts
// vite.config.ts
plugins: [react(), tailwindcss()]
resolve.alias: { '@': path.resolve(__dirname, './src') }
```

### Alias de importação

O alias `@/` mapeia para `src/`. Exemplo:

```ts
import { supabase } from '@/lib/supabase'
```

### Plugins

| Plugin | Pacote | Função |
|---|---|---|
| `react()` | `@vitejs/plugin-react` | Suporte a JSX/React, Fast Refresh |
| `tailwindcss()` | `@tailwindcss/vite` | Integração Tailwind CSS v4 com Vite |

### Code Splitting (build)

O build produz chunks separados para reduzir o tamanho do bundle inicial:

| Chunk | Conteúdo |
|---|---|
| `vendor-react` | `react`, `react-dom`, `react-router-dom` |
| `vendor-query` | `@tanstack/react-query` e persistência |
| `vendor-supabase` | `@supabase/*` |
| `vendor-ui` | `lucide-react`, `@base-ui/react`, `@radix-ui/react-dropdown-menu` |
| `vendor-forms` | `react-hook-form`, `@hookform/resolvers`, `zod` |

### Pre-bundling (`optimizeDeps`)

Pré-empacotado para startup mais rápido em desenvolvimento: `react`, `react-dom`, `react-router-dom`, `@tanstack/react-query`, `react-hook-form`, `zod`, `@hookform/resolvers/zod`, `sonner`, `lucide-react`.

---

## Configuração TypeScript

O projeto usa **três arquivos `tsconfig`** com referências de projeto:

### `tsconfig.json` (raiz)

Arquivo orquestrador. Define o alias global `@/*` → `./src/*` e referencia os dois configs especializados:

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ],
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  }
}
```

### `tsconfig.app.json` (código da aplicação — `src/`)

| Opção | Valor | Observação |
|---|---|---|
| `target` | `es2023` | Output moderno |
| `lib` | `["ES2023", "DOM"]` | APIs de browser disponíveis |
| `module` | `esnext` | ESM puro |
| `moduleResolution` | `bundler` | Resolução otimizada para Vite |
| `jsx` | `react-jsx` | Transform automático React 17+ |
| `noUnusedLocals` | `true` | Strict |
| `noUnusedParameters` | `true` | Strict |
| `noFallthroughCasesInSwitch` | `true` | Strict |
| `verbatimModuleSyntax` | `true` | Preserva `import type` |
| `noEmit` | `true` | Vite compila, tsc apenas verifica |
| `types` | `["vite/client", "@testing-library/jest-dom"]` | Tipos globais |

### `tsconfig.node.json` (config files — `vite.config.ts`)

Mesmo conjunto de opções strict, mas com `lib: ["ES2023"]` (sem DOM) e `types: ["node"]`. Inclui apenas `vite.config.ts`.

---

## Tailwind CSS v4

O projeto usa **Tailwind CSS v4** integrado via plugin Vite (`@tailwindcss/vite`). Não existe um arquivo `tailwind.config.ts` com configuração de tema — o Tailwind v4 lê tokens via CSS nativo em `src/index.css`.

O arquivo `tailwind.config.ts` presente define apenas um **safelist** de classes dinamicamente geradas (para garantir que não sejam purgadas no build):

```ts
safelist: [
  'bg-warning-light', 'text-warning',
  'bg-primary-light', 'text-primary',
  'bg-success-light', 'text-success',
  'bg-danger-light',  'text-danger',
  'bg-neutral-25', 'text-neutral-500',
  'hover:bg-primary-dark',
  'border-l-warning', 'border-l-primary', 'border-l-success', 'border-l-neutral-200',
  'shadow-card', 'shadow-card-hover',
]
```

### Design Tokens

Os tokens de cor personalizados (`primary`, `warning`, `success`, `danger`, `neutral`) são definidos como variáveis CSS em `src/index.css` e consumidos pelas classes utilitárias acima.

### Dark Mode

Nenhuma estratégia de dark mode está configurada explicitamente no arquivo de configuração. <!-- VERIFY: estratégia de dark mode (class vs media) definida em src/index.css ou outro local -->

### PostCSS / Autoprefixer

O pacote `autoprefixer` está presente em `devDependencies` (v10), mas não foi encontrado um arquivo `postcss.config.*` na raiz. Com Tailwind CSS v4 + plugin Vite, a integração PostCSS é gerenciada internamente pelo `@tailwindcss/vite`.

---

## ESLint (`eslint.config.js`)

Usa a **flat config** do ESLint (v10). Configuração aplicada a todos os arquivos `**/*.{ts,tsx}`:

| Plugin | Pacote | Função |
|---|---|---|
| `js.configs.recommended` | `@eslint/js` | Regras base JavaScript |
| `tseslint.configs.recommended` | `typescript-eslint` | Regras TypeScript |
| `reactHooks.configs.flat.recommended` | `eslint-plugin-react-hooks` | Regras de hooks React |
| `reactRefresh.configs.vite` | `eslint-plugin-react-refresh` | Compatibilidade com HMR do Vite |

- Globals configurados para ambiente `browser`.
- Pasta `dist/` ignorada via `globalIgnores`.

**Executar lint:**

```bash
npm run lint
```

---

## shadcn/ui (`components.json`)

| Campo | Valor | Descrição |
|---|---|---|
| `style` | `base-nova` | Estilo visual base (nova variante) |
| `rsc` | `false` | Sem React Server Components |
| `tsx` | `true` | Componentes em TypeScript |
| `tailwind.css` | `src/index.css` | Arquivo CSS principal |
| `tailwind.baseColor` | `neutral` | Cor base para tokens gerados |
| `tailwind.cssVariables` | `true` | Usa variáveis CSS (não valores hardcoded) |
| `tailwind.prefix` | `""` | Sem prefixo nos utilitários |
| `iconLibrary` | `lucide` | Ícones via `lucide-react` |
| `rtl` | `false` | Sem suporte RTL |

**Aliases de importação:**

| Alias | Caminho |
|---|---|
| `@/components` | Componentes gerais |
| `@/components/ui` | Componentes shadcn/ui |
| `@/lib/utils` | Utilitários (`cn()` etc.) |
| `@/lib` | Biblioteca geral |
| `@/hooks` | Hooks customizados |

Para adicionar um novo componente shadcn/ui:

```bash
npx shadcn add <component-name>
```

---

## Vitest — Configuração de Testes

A configuração do Vitest está embutida no `vite.config.ts` (seção `test`):

```ts
test: {
  environment: 'jsdom',        // Simula DOM de browser
  setupFiles: ['./vitest.setup.ts'],
  globals: true,               // describe/it/expect sem imports
  exclude: ['**/node_modules/**', '**/.claude/**', '**/dist/**'],
}
```

### Setup (`vitest.setup.ts`)

```ts
import '@testing-library/jest-dom'
```

Registra os matchers customizados do `@testing-library/jest-dom` (ex.: `toBeInTheDocument()`, `toHaveValue()`) globalmente em todos os testes.

### Executar testes

```bash
npm run test          # Modo watch interativo
npm run test:e2e      # Playwright (testes end-to-end)
```

---

## Scripts NPM

| Script | Comando | Descrição |
|---|---|---|
| `dev` | `vite` | Servidor de desenvolvimento com HMR |
| `build` | `tsc -b && vite build` | Verifica tipos e gera bundle de produção |
| `lint` | `eslint .` | Verifica qualidade do código |
| `preview` | `vite preview` | Serve o bundle de produção localmente |
| `test` | `vitest` | Executa testes unitários (modo watch) |
| `test:e2e` | `playwright test` | Executa testes end-to-end |
| `typecheck` | `tsc -b --noEmit` | Verifica tipos sem gerar arquivos |

---

## Configuração de Ambiente por Estágio

<!-- VERIFY: Variáveis de ambiente de staging e produção (CI/CD) — não definidas no repositório. Verificar plataforma de deploy utilizada. -->

Para ambientes distintos (desenvolvimento, staging, produção), crie arquivos conforme a convenção Vite:

- Desenvolvimento: `.env.development.local`
- Produção: `.env.production.local`

As variáveis obrigatórias em todos os ambientes são `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`, cada uma apontando para o projeto Supabase do respectivo ambiente.
