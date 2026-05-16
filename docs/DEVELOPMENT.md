<!-- generated-by: gsd-doc-writer -->

# Guia de Desenvolvimento — OrçaFácil

Referência do dia a dia para quem desenvolve no projeto. Cobre workflow, padrões, convenções e como adicionar features corretamente.

---

## Workflow diário

### Servidor de desenvolvimento

```bash
npm run dev
```

Inicia o Vite em modo HMR. Acesse `http://localhost:5173` (porta padrão Vite). O HMR atualiza componentes sem recarregar a página; se um módulo não puder ser substituído em quente, o Vite faz reload completo automaticamente.

### Comandos disponíveis

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento (Vite HMR) |
| `npm run build` | Typecheck + bundle de produção (`dist/`) |
| `npm run preview` | Serve o bundle de produção localmente |
| `npm run lint` | ESLint flat config em todos os `.ts`/`.tsx` |
| `npm run typecheck` | `tsc -b --noEmit` sem gerar arquivos |
| `npm run test` | Vitest (modo watch no terminal interativo) |
| `npm run test:e2e` | Playwright end-to-end |

**Antes de abrir PR:** rode `npm run lint && npm run typecheck && npm run test` e garanta que tudo passa.

---

## Estilo de código

### ESLint (flat config)

Arquivo: `eslint.config.js` — usa a API flat config do ESLint v10.

Regras ativas:
- `@eslint/js` recommended
- `typescript-eslint` recommended (TypeScript strict via `tsconfig.app.json`)
- `eslint-plugin-react-hooks` (rules of hooks + exhaustive-deps)
- `eslint-plugin-react-refresh` (apenas exports de componentes em arquivos Vite)

Execute: `npm run lint`

### TypeScript

`tsconfig.app.json` habilita modo estrito. Não use `any` — prefira `unknown` com narrowing ou tipos explícitos.

### Alias de imports

Todos os imports internos usam o alias `@/` (configurado em `vite.config.ts` e `tsconfig.app.json`):

```ts
// correto
import { supabase } from '@/lib/supabase'
import { PhoneInput } from '@/components/molecules/PhoneInput'

// nunca use paths relativos longos
import { supabase } from '../../../../lib/supabase'
```

Mapeamento dos aliases (definido em `components.json`):

| Alias | Diretório |
|---|---|
| `@/components` | `src/components` |
| `@/components/ui` | `src/components/ui` |
| `@/lib` | `src/lib` |
| `@/hooks` | `src/hooks` |

---

## Adicionando um componente shadcn/ui

```bash
npx shadcn add <nome-do-componente>
```

O `components.json` já está configurado com `style: base-nova`, `tsx: true` e o alias `@/components/ui`. O componente será gerado em `src/components/ui/`.

**Regra:** nunca edite diretamente os arquivos em `src/components/ui/`. Se precisar de uma variante customizada, crie um novo componente em `src/components/molecules/` ou `src/components/atoms/` que compõe o componente base.

---

## Estrutura de features

Novas features ficam em `src/features/{nome}/`. Siga este layout:

```
src/features/minha-feature/
├── MinhaFeaturePage.tsx        # Página(s) / entry points de rota
├── MinhaFeatureDialog.tsx      # Dialogs específicos (opcional)
├── useMinhFeature.ts           # React Query hooks (queries + mutations)
├── minhaFeatureSchemas.ts      # Schemas Zod + tipos inferidos
└── __tests__/
    └── minhaFeatureSchemas.test.ts
```

**Referência real:** `src/features/orcamento/` e `src/features/solicitacao/`.

### Passos para adicionar uma nova feature

1. Crie o diretório `src/features/{nome}/`
2. Defina os schemas Zod em `{nome}Schemas.ts` (schema + `export type ... = z.infer<typeof ...>`)
3. Implemente os React Query hooks em `use{Nome}.ts`
4. Crie os componentes de página/dialog
5. Registre as rotas em `src/App.tsx` com os guards apropriados
6. Adicione testes em `__tests__/`

---

## Convenções de componentes

### Atomic design

| Camada | Localização | Quando usar |
|---|---|---|
| **atoms** | `src/components/atoms/` | Elemento mínimo sem estado próprio (ícone, badge, spinner) |
| **molecules** | `src/components/molecules/` | Composição de 2+ atoms com lógica simples (PhoneInput, InfoRow, FormField, DatePickerField) |
| **organisms** | dentro de `src/features/` ou `src/components/` raiz | Seção completa com estado e queries (listagem, form completo, drawer) |

### Guards de rota (`src/components/guards/`)

- **`ProtectedRoute`** — redireciona para `/login` se não houver sessão autenticada.
- **`RoleGuard`** — recebe `allowedRoles: Role[]`; redireciona para `/dashboard` se o perfil do usuário não tiver o role permitido. Roles possíveis: `'cliente'` e `'prestador'`.

```tsx
// Exemplo de uso em App.tsx
<Route element={<RoleGuard allowedRoles={['prestador']} />}>
  <Route path="/prestador/orcamentos" element={<OrcamentosPage />} />
</Route>
```

### Layout (`src/components/layout/`)

Arquivos: `AppShell.tsx`, `Sidebar.tsx`, `TopBar.tsx`, `BottomNav.tsx`, `MobileDrawer.tsx`, `UserMenuItems.tsx`, `useNavLinks.ts`.

O `AppShell` encapsula sidebar + topbar + área de conteúdo. Páginas autenticadas são renderizadas dentro dele. Não duplique estrutura de layout em páginas individuais.

---

## Componentes compartilhados obrigatórios

Estes componentes **devem** ser usados em vez de implementar inline. São mantidos em um único lugar — mudanças propagam automaticamente.

### `<PhoneInput>` — Campo de telefone com DDI

```tsx
import { PhoneInput } from '@/components/molecules/PhoneInput'

<PhoneInput
  dial={dial}              // string — ex: '+55'
  number={number}          // string — número já formatado
  onDialChange={setDial}   // (dial: string) => void
  onNumberChange={setNum}  // (number: string) => void
  placeholder="(11) 99999-9999"  // opcional
  disabled={false}               // opcional
/>
```

Inclui seletor de país via Popover (BR, US, PT, AR, CL, MX, CO, PY, UY) e aplica máscara automática pelo DDI selecionado.

### `<InfoRow>` — Linha label/valor read-only

```tsx
import { InfoRow } from '@/components/molecules/InfoRow'

<InfoRow
  label="E-mail"
  value={profile.email}
  placeholder={<span className="text-neutral-400">Não informado</span>}
  action={<button onClick={handleEdit}>Editar</button>}
/>
```

Empilha em mobile, exibe lado a lado em `sm+`. Use em telas de configuração/perfil no modo read-only.

### `phoneUtils` — Lógica de países e máscaras

```tsx
import {
  COUNTRIES,
  formatBRPhone,
  formatPhoneByDial,
  parseStoredPhone,
  buildStoredPhone,
} from '@/lib/phoneUtils'

// Ler do banco (formato "DDI número_formatado")
const { dial, number } = parseStoredPhone(profile.telefone)

// Salvar no banco
const stored = buildStoredPhone(dial, number) // ex: "+55 (11) 99999-9999"
```

### Modal de perfil — `usePerfilModal`

**Nunca navegue para `/perfil`.** Abra o `PerfilModal` via store:

```tsx
import { usePerfilModal } from '@/store/perfilModalStore'

const openPerfil = usePerfilModal((s) => s.open)

<button onClick={openPerfil}>Meu Perfil</button>
```

O `PerfilModal` é montado no `AppShell` e controla seu próprio estado de abertura.

### Padrão read-only + edit mode

Telas de configuração/perfil devem usar este padrão:

1. Dados exibidos como `<InfoRow>` por padrão (modo read-only)
2. Botão "Editar" no header da seção
3. Ao clicar em editar: campos tornam-se inputs; aparecem "Cancelar" e "Salvar"
4. Nunca exibir formulário sempre aberto em telas de configuração

---

## Gerenciamento de estado

### Zustand stores (`src/store/`)

Stores existentes:

| Store | Arquivo | Uso |
|---|---|---|
| `useAuthStore` | `authStore.ts` | Sessão do usuário, profile, session |
| `usePerfilModal` | `perfilModalStore.ts` | Abertura/fechamento do PerfilModal |

**Convenção para nova store:**

```ts
// src/store/meuModuloStore.ts
import { create } from 'zustand'

interface MeuModuloState {
  valor: string
  setValor: (v: string) => void
}

export const useMeuModulo = create<MeuModuloState>((set) => ({
  valor: '',
  setValor: (v) => set({ valor: v }),
}))
```

Nome do export: `use{NomeDoModulo}` com sufixo `Store` omitido no nome da variável (ex: `useMeuModulo`, não `useMeuModuloStore`).

### React Query — convenções

**QueryClient** configurado em `src/lib/queryClient.ts`:
- `staleTime`: 5 minutos
- `retry`: 1 tentativa
- `refetchOnWindowFocus`: desabilitado
- Persister: `createSyncStoragePersister` com `localStorage`

**Query keys** — use arrays hierárquicos:

```ts
// listagem geral
queryKey: ['orcamentos']

// listagem filtrada por contexto
queryKey: ['orcamentos', 'prestador']
queryKey: ['orcamentos', 'cliente']

// item específico
queryKey: ['orcamentos', id]
```

**Invalidação após mutation:**

```ts
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['orcamentos'] })
  queryClient.invalidateQueries({ queryKey: ['solicitacoes'] })
}
```

**Referência real:** `src/features/orcamento/useOrcamento.ts`

### react-hook-form + Zod

Schema em arquivo separado (`{feature}Schemas.ts`), nunca inline no componente:

```ts
// src/features/minha-feature/minhaFeatureSchemas.ts
import { z } from 'zod'

export const MinhaFeatureSchema = z.object({
  nome: z.string().min(1, 'Campo obrigatório'),
  valor: z.coerce.number().positive('Deve ser positivo'),
})

export type MinhaFeatureFormData = z.infer<typeof MinhaFeatureSchema>
```

Uso no componente:

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { MinhaFeatureSchema, type MinhaFeatureFormData } from './minhaFeatureSchemas'

const { register, handleSubmit, formState: { errors } } = useForm<MinhaFeatureFormData>({
  resolver: zodResolver(MinhaFeatureSchema),
})
```

Exibição de erros:

```tsx
<input {...register('nome')} />
{errors.nome && <p className="text-xs text-red-500">{errors.nome.message}</p>}
```

---

## Queries Supabase

O cliente tipado está em `src/lib/supabase.ts`:

```ts
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/supabase'
```

**Padrão de query dentro de React Query:**

```ts
export function useGetPerfil(userId: string) {
  return useQuery({
    queryKey: ['perfis', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      if (error) throw error
      return data  // tipado via Database
    },
    enabled: !!userId,
  })
}
```

**RLS** é implícito: o cliente usa a sessão do usuário autenticado. Nunca bypasse o RLS via service role no frontend.

---

## Toasts e notificações

Use `sonner`:

```tsx
import { toast } from 'sonner'

toast.success('Orçamento enviado ao cliente')
toast.error('Erro ao salvar. Tente novamente.')
```

O `<Toaster>` já está montado no `AppShell` ou `main.tsx`. Não instancie outro.

---

## Geração de PDF

Componentes em `src/components/pdf/`:

- `PdfGenerator.ts` — lógica de geração usando `jspdf`
- `PdfDownloadButton.tsx` — botão que aciona o download

```tsx
import { PdfDownloadButton } from '@/components/pdf/PdfDownloadButton'

<PdfDownloadButton orcamento={orcamento} />
```

Não instancie `jspdf` diretamente fora de `PdfGenerator.ts`.

---

## Workflow Git

### Conventional commits

```
feat: adiciona filtro por status em listagem de solicitações
fix: corrige máscara de telefone para DDI +351
docs: atualiza DEVELOPMENT com padrão de query keys
chore: atualiza dependências
```

Prefixos permitidos: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `style`, `perf`.

### Referência de story

Quando o commit fecha uma story, inclua o ID:

```
feat: implementa aprovação de orçamento [Story 3.2]
```

---

## Debugging

### React Query Devtools

Se instalado, o painel flutua no canto da tela em modo dev. Permite inspecionar queries ativas, cache, status de fetching e disparar refetch manual.

### Vite HMR

Se o estado da aplicação ficar inconsistente após edições, recarregue a página completamente (`Ctrl+Shift+R`). O HMR preserva estado do Zustand entre trocas de módulo; em casos raros isso pode causar estado "fantasma".

### Logs do authStore

O `authStore` loga erros de carregamento de perfil no console com o prefixo `[authStore]`. Se o app travar no loading após login, verifique o console por esse prefixo.
