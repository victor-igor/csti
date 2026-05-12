# DESIGN.md — OrçaFácil Design System

Padrões de UI para garantir consistência em todas as telas. Baseado na spec Stripe (`stripedesign.md`) e nos tokens definidos em `src/index.css`.

---

## 1. Design Tokens

### Cores

| Token Tailwind | Valor | Uso |
|---|---|---|
| `text-primary` / `bg-primary` | `#533afd` | CTA principal, foco, links |
| `text-foreground` | `#061b31` | Texto primário |
| `text-muted-foreground` | `#64748d` | Labels, placeholders, meta |
| `bg-muted` | `#f8fafd` | Thead, fundos suaves |
| `border-border` | `#e5edf5` | Divisórias, bordas de card/input |
| `text-danger` / `border-danger` | `#d8351e` | Erros, ações destrutivas |
| `text-success` | `#00b261` | Status positivo |
| `text-warning` | `#ff6118` | Alertas |
| `bg-card` | `#ffffff` | Superfície de card |
| `text-neutral-700` | `#3c4f69` | Labels de campo |
| `text-neutral-300` | `#95a4ba` | Borda padrão de input |

### Tipografia

| Elemento | Classes |
|---|---|
| Título de página | `text-xl font-semibold text-neutral-800` |
| Label de campo | `text-sm font-medium text-neutral-700` |
| Corpo / valor em campo | `text-sm` |
| Texto auxiliar / erro | `text-xs text-danger` |
| Meta / muted | `text-sm text-muted-foreground` |

### Raio de borda

| Token | Valor | Uso |
|---|---|---|
| `rounded-md` (`--radius-md`) | `6px` | Inputs, selects, textareas, cards |
| `rounded-lg` (`--radius-lg`) | `12px` | Botões de ação principal, painéis maiores |
| `rounded-full` | `9999px` | Badges de status, avatares |

### Sombras

```
shadow-card       → 0 2px 10px rgba(0,55,112,.06), 0 1px 4px rgba(0,59,137,.04)
shadow-card-hover → 0 6px 12px -2px rgba(50,50,93,.08), 0 3px 7px -3px rgba(0,0,0,.04)
shadow-floating   → 0 6px 22px rgba(0,55,112,.10)
shadow-button     → 0 1.7px 3.4px rgba(50,50,93,.2), 0 1px 1.4px rgba(125,138,161,.09)
```

---

## 2. Formulários

### Estrutura padrão

```tsx
<form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4 mt-4">
  <FormField ... />
  <SelectField ... />
  <TextareaField ... />
  <button type="submit" ...>Salvar</button>
</form>
```

- `noValidate` sempre presente (validação via Zod)
- `space-y-4` entre campos (16px)
- Largura máxima: `max-w-2xl` para formulários de criação/edição

### Campos — Moléculas disponíveis

| Componente | Arquivo | Uso |
|---|---|---|
| `<FormField>` | `molecules/FormField.tsx` | `<input>` genérico (text, email, etc.) |
| `<TextareaField>` | `molecules/TextareaField.tsx` | `<textarea>` multi-linha |
| `<SelectField>` | `molecules/SelectField.tsx` | `<select>` nativo |
| `<CurrencyInput>` | `molecules/CurrencyInput.tsx` | Valor monetário em BRL |

Todos recebem `name`, `control` (react-hook-form) e `label`.

### Anatomia de campo (padrão compartilhado)

```tsx
<div className="flex flex-col gap-1">
  <label className="text-sm font-medium text-neutral-700" htmlFor={name}>
    {label}
  </label>
  <input
    className="rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none
               focus:border-primary focus:ring-1 focus:ring-primary"
  />
  {fieldState.error && (
    <p className="text-xs text-danger">{fieldState.error.message}</p>
  )}
</div>
```

- Gap label→input: `gap-1` (4px)
- Borda padrão: `border-neutral-300`
- Foco: `focus:border-primary focus:ring-1 focus:ring-primary`
- Erro: substituir por `border-danger focus:border-danger focus:ring-danger`

### Estado de erro

```tsx
// Adicionar ao input/select/textarea quando fieldState.error existe:
className={cn(
  'rounded-md border border-neutral-300 ...',
  fieldState.error && 'border-danger focus:border-danger focus:ring-danger',
)}
// Mensagem abaixo do campo:
{fieldState.error && <p className="text-xs text-danger">{fieldState.error.message}</p>}
```

### Campo monetário (CurrencyInput)

```tsx
<div className="relative">
  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-500">R$</span>
  <input className="w-full rounded-md border border-neutral-300 pl-9 pr-3 py-2 text-sm ..." />
</div>
```

- Prefixo absoluto posicionado em `left-3`
- Padding esquerdo: `pl-9` para dar espaço ao prefixo
- `inputMode="numeric"` + formatação via `Intl.NumberFormat('pt-BR')`

### Botão de submit

```tsx
<button
  type="submit"
  disabled={isPending || isSubmitting}
  className="w-full flex items-center justify-center gap-2 rounded-lg
             bg-primary px-4 py-2.5 text-sm font-medium text-white
             disabled:opacity-60 transition-opacity"
>
  {(isPending || isSubmitting) && <Loader2 className="h-4 w-4 animate-spin" />}
  Salvar
</button>
```

- Full-width em formulários de página inteira
- Spinner `Loader2` do Lucide durante loading
- `disabled:opacity-60` (não `cursor-not-allowed` — segue padrão do projeto)

### Schema Zod (padrão)

```ts
// features/[feature]/[feature]Schemas.ts
export const MeuFormSchema = z.object({
  titulo: z.string().min(3, 'Mínimo 3 caracteres').max(100),
  valor: z.number().positive('Deve ser maior que zero'),
})
export type MeuFormData = z.infer<typeof MeuFormSchema>
```

---

## 3. Tabelas e Páginas de Lista

### Página de lista completa — `ListPageShell` (componente pronto)

```tsx
import { ListPageShell } from '@/components/molecules/ListPageShell'

<ListPageShell
  title="Solicitações"
  actions={<button ...>Nova</button>}   // opcional
  filters={<FilterBar ... />}            // opcional
>
  {/* tabela ou cards */}
</ListPageShell>
```

- Inclui PageHeader, area de filtros e padding padrão
- **Usar sempre** em páginas de listagem — não montar estrutura manualmente

### Filtros de status — `FilterBar` / `StatusFilterChips`

```tsx
import { FilterBar } from '@/components/molecules/FilterBar'
import { StatusFilterChips } from '@/components/molecules/StatusFilterChips'

// Genérico:
<FilterBar filters={filters} value={status} onChange={setStatus} />

// Específico para status de OS/orçamento:
<StatusFilterChips value={status} onChange={setStatus} />
```

### Estado vazio — `EmptyState`

```tsx
import { EmptyState } from '@/components/atoms/EmptyState'

<EmptyState message="Nenhuma solicitação encontrada." />
// Suporta: message, icon?, action?
```

### Estado de loading — `LoadingSkeleton`

```tsx
import { LoadingSkeleton } from '@/components/atoms/LoadingSkeleton'

<LoadingSkeleton rows={4} />
```

### Anatomia da tabela (referência — para casos sem `DataTable`)

```tsx
{/* Desktop */}
<div className="hidden overflow-x-auto rounded-lg border border-border md:block">
  <table className="w-full text-sm">
    <thead className="border-b border-border bg-muted/40">
      <tr>
        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Coluna</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-border">
      <tr className="bg-card hover:bg-muted/20 transition-colors">
        <td className="px-4 py-3 text-foreground">Valor</td>
      </tr>
    </tbody>
  </table>
</div>

{/* Mobile — cards */}
<div className="flex flex-col gap-3 md:hidden">
  {data.map((row, i) => (
    <div key={i} className="rounded-lg border border-border bg-card p-4">
      <div className="flex justify-between py-1 text-sm">
        <span className="text-muted-foreground">Label</span>
        <span className="font-medium">{row.valor}</span>
      </div>
    </div>
  ))}
</div>
```

- Thead: `bg-muted/40` + `border-b border-border`
- Th: `px-4 py-3 text-left font-medium text-muted-foreground`
- Tr hover: `hover:bg-muted/20 transition-colors`
- Td: `px-4 py-3 text-foreground`

---

## 4. Calendário / Seletor de Data

Implementado via `shadcn/ui Calendar` + `react-day-picker` + `date-fns`.

### Uso em formulários — `DatePickerField` (molecule pronta)

```tsx
import { DatePickerField } from '@/components/molecules/DatePickerField'

<DatePickerField
  name="dataAgendamento"
  control={control}
  label="Data de Agendamento"
  placeholder="Selecione uma data"   // opcional
  disabled={isPending}               // opcional
  optional                           // opcional — exibe "(opcional)" no label
/>
```

- Props: `name`, `control`, `label`, `placeholder?`, `disabled?`, `optional?`
- Integra com react-hook-form via `Controller` — sem código extra
- Exibe erro abaixo do campo automaticamente
- Aceita `Date` ou string ISO (`yyyy-MM-dd`) como valor — armazena como string ISO
- Campo Zod obrigatório: `z.string().min(1, 'Obrigatório')`
- Campo Zod opcional: `z.string().optional()`

### Uso avulso (sem react-hook-form)

```tsx
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

<Popover>
  <PopoverTrigger asChild>
    <button className="flex w-full items-center gap-2 rounded-md border border-neutral-300
                       px-3 py-2 text-sm text-left outline-none
                       focus:border-primary focus:ring-1 focus:ring-primary">
      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
      {date ? format(date, 'dd/MM/yyyy', { locale: ptBR }) : 'Selecione uma data'}
    </button>
  </PopoverTrigger>
  <PopoverContent className="w-auto p-0 shadow-floating" align="start">
    <Calendar mode="single" selected={date} onSelect={setDate} locale={ptBR} initialFocus />
  </PopoverContent>
</Popover>
```

- Trigger: mesmas classes de input (`border-neutral-300`, foco `border-primary`)
- Popover: `shadow-floating` (token do projeto), `align="start"`
- Locale: sempre `ptBR` de `date-fns/locale`
- Formato de exibição: `'dd/MM/yyyy'`

---

## 5. Page Header

### Componente: `PageHeader`

```tsx
import { PageHeader } from '@/components/molecules/PageHeader'

<PageHeader
  title="Solicitações"
  actions={
    <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white">
      Nova Solicitação
    </button>
  }
/>
```

### Anatomia

```tsx
<div className="flex items-center justify-between pb-4">
  <h1 className="text-xl font-semibold text-neutral-800">{title}</h1>
  {actions && <div className="flex items-center gap-2">{actions}</div>}
</div>
```

- Padding bottom: `pb-4`
- `h1`: `text-xl font-semibold text-neutral-800`
- Actions alinhados à direita com `gap-2`

### Layout de página completo

```tsx
<div className="p-6 max-w-2xl">        {/* forms */}
  <div className="mb-4"><BackButton /></div>
  <PageHeader title="..." actions={...} />
  {/* conteúdo */}
</div>

<div className="p-6 max-w-5xl">        {/* páginas de detalhe */}
  <div className="mb-4"><BackButton /></div>
  <PageHeader title="..." />
  <div className="mt-6 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
    {/* conteúdo principal + sidebar */}
  </div>
</div>
```

- Padding de página: `p-6`
- Formulários: `max-w-2xl`
- Detalhes e listas: `max-w-5xl`

---

## 6. Botões

### Componente — `Button` (shadcn)

```tsx
import { Button } from '@/components/ui/button'

<Button variant="default">Salvar</Button>
<Button variant="outline">Cancelar</Button>
<Button variant="ghost">Ver mais</Button>
<Button variant="destructive">Excluir</Button>

// Com loading:
<Button disabled={isPending}>
  {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
  Salvar
</Button>
```

- **Usar `<Button>` sempre** — não escrever `<button>` com classes manuais
- Full-width em formulários: `<Button className="w-full">` 
- `disabled:opacity-60` já está no componente — não adicionar manualmente

### Referência de classes (para contextos sem `Button`)

| Variante | Classes |
|---|---|
| Primary | `rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-button disabled:opacity-60 transition-opacity` |
| Secondary | `rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted/40 transition-colors` |
| Ghost | `text-sm text-primary hover:underline` |
| Destrutivo | `rounded-lg bg-danger px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60` |

---

## 7. Cards e Containers

### Card com título — `InfoCard` (componente pronto)

```tsx
import { InfoCard } from '@/components/molecules/InfoCard'

<InfoCard title="Dados do Cliente">
  <InfoRow label="Nome" value={cliente.nome} />
  <InfoRow label="Telefone" value={cliente.telefone} />
</InfoCard>
```

- Usar sempre que o card tiver título + conteúdo estruturado

### Referência de anatomia (para cards customizados)

```tsx
{/* Card simples */}
<div className="rounded-lg border border-border bg-card p-4 shadow-card">
  {/* conteúdo */}
</div>

{/* Card clicável */}
<div className="rounded-lg border border-border bg-card p-4 shadow-card hover:shadow-card-hover transition-shadow cursor-pointer">
  {/* conteúdo */}
</div>

{/* Card com cabeçalho separado por borda */}
<div className="rounded-lg border border-border bg-card">
  <div className="border-b border-border px-4 py-3">
    <h2 className="text-sm font-semibold text-foreground">Título</h2>
  </div>
  <div className="p-4">
    {/* conteúdo */}
  </div>
</div>
```

---

## 8. Status Badge

Usar `<StatusBadge status={...} />` de `@/components/atoms/StatusBadge`.

O componente mapeia os status do sistema (`aberta`, `orcamento_enviado`, `aprovado`, etc.) para cores e labels em PT-BR.

---

## 9. Regras gerais

1. **Não inventar tokens** — usar apenas os definidos em `src/index.css` via `@theme`
2. **Tailwind v4**: tokens via `@theme`, não `tailwind.config.ts`; classes como `bg-primary` resolvem os CSS vars automaticamente
3. **shadcn/ui**: não usar `asChild` em `DropdownMenuTrigger` — usar `className` diretamente no trigger
4. **Responsive**: tabelas = desktop (`hidden md:block`) + cards mobile (`flex md:hidden`)
5. **Acessibilidade**: `htmlFor` + `id` sempre vinculados; foco visível com `focus:ring-1`
6. **Zod v4**: usar `error:` em vez de `errorMap:` em `z.enum()`

---

## 10. Layout — AppShell, Sidebar, TopBar

### Estrutura do AppShell

```
AppShell
├── Sidebar (desktop: fixed left, 64px collapsed / 240px expanded)
├── TopBar (fixed top, left-0 mobile / left-[64px ou 240px] desktop)
├── <main> (padding-top para TopBar, margin-left para Sidebar)
└── BottomNav (mobile only, fixed bottom)
```

- Background da área principal: `bg-neutral-25` (`#f8fafd`)
- Arquivo: `src/components/layout/AppShell.tsx`

### Sidebar

- Active state: `text-primary font-semibold` — sem pílula/fundo sólido
- Ícones: `h-4 w-4` (menores, estilo Stripe)
- Section labels ("Operações", "Configurações"): `text-xs font-medium text-muted-foreground uppercase tracking-wide`
- Agrupamento via `useNavGroups()` em `src/components/layout/useNavLinks.ts`
- Arquivo: `src/components/layout/Sidebar.tsx`

### TopBar

- Search bar centralizada (oculta no mobile)
- Ícones da direita: Help → Bell (`NotificacoesBell`) → Settings → Avatar
- Help e Settings ocultos no mobile: `hidden md:flex`
- `left-0` no mobile, `md:left-[64px]` (ou 240px expandido) no desktop
- Arquivo: `src/components/layout/TopBar.tsx`

### Navegação — `useNavGroups()`

```ts
import { useNavGroups } from '@/components/layout/useNavLinks'
const groups = useNavGroups() // retorna grupos com label + links
```

- `BottomNav` ainda usa `useNavLinks` legado — migrar se necessário

---

## 11. Dashboard — StatCards e Seções

### Seção do dashboard — `DashboardSection`

```tsx
import { DashboardSection } from '@/components/molecules/DashboardSection'

<DashboardSection title="Atividade Recente">
  <ActivityItem activity={...} />
</DashboardSection>
```

### Estado vazio do dashboard — `DashboardEmptyState`

```tsx
import { DashboardEmptyState } from '@/components/molecules/DashboardEmptyState'

<DashboardEmptyState message="Nenhuma atividade recente." />
```

### StatCard (estilo Stripe — inline no DashboardPage)

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
  <div className="rounded-lg border border-border bg-card p-5 shadow-card">
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className="mt-1 text-3xl font-semibold text-foreground">{value}</p>
  </div>
</div>
```

- **Sem ícone colorido** — só label + número grande
- Grid responsivo: `grid-cols-1 sm:grid-cols-2 md:grid-cols-3`

### Notificações — `NotificacoesBell`

```tsx
import { NotificacoesBell } from '@/features/notificacoes/NotificacoesBell'
// Usado no TopBar — Popover flutuante com abas "Não lidas" / "Todas"
```

- Width: `w-[calc(100vw-16px)] sm:w-[460px]`
- Shadow: `shadow-floating`
- Footer: link "Ver tudo" → `/notificacoes`
- Empty state: "Sem novidades"

---

## 12. Inventário de Componentes

### Atoms (`src/components/atoms/`)

| Componente | Uso |
|---|---|
| `StatusBadge` | Badge colorido por status do sistema (aberta, aprovado, etc.) |
| `EmptyState` | Estado vazio com ícone + mensagem + CTA opcional |
| `ErrorState` | Erro de carregamento com mensagem |
| `LoadingSkeleton` | Skeleton animado — props: `rows?` |
| `CurrencyDisplay` | Valor em BRL formatado read-only |
| `PageContainer` | Wrapper com padding + max-width padrão |
| `StickyActionBar` | Barra de ações fixa no bottom em formulários longos |

### Molecules (`src/components/molecules/`)

| Componente | Props principais | Uso |
|---|---|---|
| `FormField` | `name, control, label, type?, placeholder?` | Input genérico (text, email, etc.) |
| `TextareaField` | `name, control, label, rows?` | Textarea multi-linha |
| `SelectField` | `name, control, label, options` | Select nativo |
| `CurrencyInput` | `name, control, label` | Valor monetário BRL |
| `DatePickerField` | `name, control, label, placeholder?, disabled?` | Seletor de data com calendário |
| `PhoneInput` | `dial, number, onDialChange, onNumberChange` | Telefone com DDI |
| `InfoRow` | `label, value?, placeholder?, action?` | Row read-only label/valor |
| `PageHeader` | `title, actions?` | Título de página + botões à direita |
| `BackButton` | — | Botão "← Voltar" com navegação |
| `Breadcrumb` | `items` | Trilha de navegação |
| `FilterBar` | `filters, value, onChange` | Chips de filtro de status |
| `StatusFilterChips` | `value, onChange` | Chips específicos de status de OS/orçamento |
| `ListPageShell` | `title, actions?, filters?, children` | Shell completo de página de lista |
| `ConfirmDialog` | `open, onConfirm, onCancel, title, description` | Dialog de confirmação destrutiva |
| `InfoCard` | `title, children` | Card com título e conteúdo genérico |
| `UserCard` | `user` | Card de dados de usuário |
| `ActivityItem` | `activity` | Item de feed de atividade |
| `ActionItem` | `label, icon, onClick` | Item de ação em listas |
| `DashboardSection` | `title, children` | Seção do dashboard com título |
| `DashboardEmptyState` | `message` | Empty state específico do dashboard |
| `TotalSummary` | `items, total` | Resumo de itens com total |

### shadcn/ui instalados (`src/components/ui/`)

| Componente | Origem | Notas |
|---|---|---|
| `Button` / `buttonVariants` | shadcn | Variantes: default, ghost, outline, destructive |
| `DropdownMenu` | shadcn | Não usar `asChild` no Trigger |
| `Popover` | shadcn | Usar `asChild` no Trigger é OK aqui |
| `Sheet` | shadcn | Para drawers/painéis laterais |
| `Calendar` | shadcn | Usar via `DatePickerField` em formulários |

### Layout (`src/components/layout/`)

| Componente | Uso |
|---|---|
| `AppShell` | Wrapper principal com Sidebar + TopBar |
| `Sidebar` | Navegação lateral desktop |
| `TopBar` | Barra superior com search + ícones |
| `BottomNav` | Navegação inferior mobile |
| `MobileDrawer` | Drawer de navegação mobile |
