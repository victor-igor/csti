# CSTI

Sistema de orçamentos e ordens de serviço para manutenção de TI — conecta clientes e prestadores em um fluxo unificado de solicitação, aprovação e execução.

**Stack:** React 19 · TypeScript · Vite 8 · Tailwind CSS v4 · shadcn/ui · Supabase · Zustand · TanStack Query v5 · react-hook-form + Zod · Playwright

---

## Início Rápido

```bash
# 1. Clone o repositório
git clone <url-do-repositorio>
cd orcafacil

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais do Supabase

# 4. Inicie o servidor de desenvolvimento
npm run dev
```

O app estará disponível em `http://localhost:5173`.

---

## Módulos da Aplicação

| Módulo | Descrição |
|--------|-----------|
| `auth` | Autenticação e controle de sessão via Supabase Auth |
| `orcamento` | Criação, edição e aprovação de orçamentos |
| `ordem-servico` | Gestão de ordens de serviço vinculadas a orçamentos |
| `solicitacao` | Fluxo de solicitação de serviço pelo cliente |
| `perfil` | Perfil de usuário (prestador / cliente) |
| `notificacoes` | Notificações em tempo real |

Cada módulo fica em `src/features/{nome-do-modulo}/`.

---

## Comandos Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia o servidor de desenvolvimento (Vite HMR) |
| `npm run build` | Compilação de produção (TypeScript + Vite) |
| `npm run preview` | Visualiza o build de produção localmente |
| `npm run lint` | Executa o ESLint em todos os arquivos |
| `npm run typecheck` | Verificação de tipos sem emissão de arquivos |
| `npm run test` | Executa testes unitários com Vitest |
| `npm run test:e2e` | Executa testes end-to-end com Playwright |

---

## Estrutura do Projeto

```
src/
├── features/          # Módulos de domínio (auth, orcamento, etc.)
├── components/
│   ├── ui/            # Componentes shadcn/ui
│   ├── atoms/         # Componentes primitivos reutilizáveis
│   ├── molecules/     # Composições (PhoneInput, InfoRow, etc.)
│   ├── organisms/     # Blocos de UI completos
│   ├── layout/        # Shell, sidebars, cabeçalhos
│   ├── guards/        # Route guards (autenticação, perfil)
│   └── pdf/           # Geração de PDF com jsPDF
├── hooks/             # Custom hooks compartilhados
├── store/             # Stores Zustand
├── lib/               # Utilitários (supabase client, phoneUtils, etc.)
├── pages/             # Páginas mapeadas pelo react-router-dom
└── types/             # Tipos TypeScript globais
```

---

## Documentação

- [DESIGN.md](./DESIGN.md) — Sistema de design e tokens visuais
- [DESIGN-REVIEW.md](./DESIGN-REVIEW.md) — Revisão de conformidade do design
- [UI-REVIEW.md](./UI-REVIEW.md) — Revisão de componentes de UI

---

---

<details>
<summary>Referência do Template Vite/React (gerado automaticamente)</summary>

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

</details>
