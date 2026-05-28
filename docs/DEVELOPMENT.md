<!-- generated-by: gsd-doc-writer -->
# Guia de Desenvolvimento — CSTI

Referência para desenvolvedores sobre workflow, padrões de código, componentes obrigatórios e convenções do projeto.

---

## Workflow Diário

### Comandos Principais

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento com HMR (Vite) |
| `npm run build` | Compilação de produção com verificação de tipos |
| `npm run lint` | Executa o ESLint (Flat Config v10) |
| `npm run typecheck` | Executa o compilador TypeScript apenas para verificação |
| `npm run test` | Executa testes unitários com Vitest |

**Regra de Ouro:** Antes de submeter um PR, garanta que `lint`, `typecheck` e `test` estão passando.

---

## Estrutura de Features (Feature-Based Development)

O projeto utiliza uma organização baseada em domínios de negócio em `src/features/`. Cada feature deve ser autossuficiente:

```
src/features/nome-da-feature/
├── components/             # Componentes exclusivos desta feature
├── __tests__/              # Testes da feature
├── NomePage.tsx            # Página principal
├── useNome.ts              # Hooks (queries/mutations) com TanStack Query
└── nomeSchemas.ts          # Definições Zod e Tipos TypeScript
```

### Regras de Ouro:
1. **Privacidade**: Componentes dentro de uma feature são privados. Se precisar compartilhar, mova para `src/components/`.
2. **Dependência**: Features não devem importar arquivos de outras features diretamente. Use `src/lib/` ou `src/components/` para compartilhamento.

---

## Convenções de Componentes

### Camadas do Atomic Design
- **Atoms** (`src/components/atoms/`): Primitivos puros sem estado (Button, Badge).
- **Molecules** (`src/components/molecules/`): Composições com lógica simples (PhoneInput, InfoRow).
- **Organisms** (`src/components/organisms/`): Blocos complexos vinculados a domínio (DataTable, Cards).

### Componentes Obrigatórios (Use estes, não crie novos)

| Componente | Localização | Uso Obrigatório |
|---|---|---|
| `<PhoneInput>` | `molecules/PhoneInput` | Sempre usar para campos de telefone (máscaras BR e DDI). |
| `<InfoRow>` | `molecules/InfoRow` | Exibição label/valor em telas de perfil e detalhes. |
| `usePerfilModal`| `store/perfilModalStore` | **Nunca** navegue para `/perfil`. Use `open()` do modal. |

### Padrão Read-Only + Edit Mode
Telas de configuração e perfil devem seguir este comportamento:
1. Inicialmente em modo leitura usando `<InfoRow>`.
2. Botão "Editar" alterna o estado local para exibir formulários.
3. Botões "Salvar" e "Cancelar" encerram o modo de edição.

---

## Gerenciamento de Estado

### 1. Estado Global (Zustand)
Localizado em `src/store/`. Use para estados persistentes ou cross-feature:
- `authStore`: Sessão e perfil do usuário.
- `perfilModalStore`: Estado global do modal de perfil.

### 2. Estado de Servidor (TanStack Query)
Centralizado nos hooks `use{Feature}.ts`.
- **Query Keys**: Use arrays hierárquicos: `['orcamentos', id]`.
- **Invalidation**: Sempre invalide as queries relacionadas após uma mutation bem-sucedida.

### 3. Formulários (React Hook Form + Zod)
Mantenha a lógica de validação nos arquivos `{feature}Schemas.ts`.

---

## Estilo de Código e Naming

- **Componentes**: `PascalCase` (ex: `SolicitacaoCard.tsx`).
- **Hooks**: `camelCase` com prefixo `use` (ex: `useSolicitacao.ts`).
- **Interfaces**: Prefixo `I` para entidades de domínio (ex: `ISolicitacao`).
- **Schemas**: Sufixo `Schemas` (ex: `authSchemas.ts`).
- **Tipos de Form**: Sufixo `FormData` (ex: `LoginFormData`).

### Import Aliases
Use sempre o alias `@/` para apontar para `src/`:
```typescript
import { Button } from '@/components/ui/button'; // Correto
import { Button } from '../../../components/ui/button'; // Errado
```

---

## Workflow Git

- **Commits**: Siga os [Conventional Commits](https://www.conventionalcommits.org/):
  - `feat: ...` para novas funcionalidades.
  - `fix: ...` para correções.
  - `docs: ...` para documentação.
- **Stories**: Referencie o ID da story se aplicável: `feat: add phone mask [Story 2.1]`.
