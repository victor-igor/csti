---
status: issues_found
files_reviewed: 22
findings:
  critical: 4
  warning: 8
  info: 5
  total: 17
---

# Design Audit — OrçaFácil vs DESIGN.md

**Data:** 2026-05-11
**Escopo:** 22 arquivos de telas, páginas e componentes
**Arquivos de referência:** `DESIGN.md`, `src/index.css`

## Sumário Executivo

O codebase tem boa consistência nos padrões de **campos de formulário** (todos usam os molecules corretos com as classes certas) e nos **cards de lista** (`SolicitacaoCard`, `OrcamentoCard`, `OrdemServicoCard` são quase idênticos em estrutura — bom sinal). Os problemas principais são: (1) **botão primary com `rounded-md` em vez de `rounded-lg`** em 3 telas de formulário/auth; (2) **`DashboardPage` com tokens arbitrários** (shadows, radius, cores) fora do design system; (3) **`OrdensServicoPage` incompleta** — só renderiza o header; (4) **triplicação dos chips de status** sem componente compartilhado.

---

## Findings por Severidade

### CRITICAL

#### CR-01 — Botão primary com `rounded-md` em vez de `rounded-lg`

**Arquivos:**
- `src/features/auth/LoginPage.tsx` (linha 72)
- `src/features/auth/RegisterPage.tsx` (linha 104)
- `src/pages/PerfilPage.tsx` (linha 121)

**Problema:** Três telas usam `rounded-md` (6px) no botão de submit. O DESIGN.md §6 define `rounded-lg` (12px) para todos os botões primários. `SolicitacaoFormPage.tsx:64` faz isso corretamente e deve ser a referência.

**Atual:**
```tsx
className="w-full flex items-center justify-center gap-2 rounded-md bg-primary py-2.5 ..."
```
**Esperado:**
```tsx
className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 ..."
```
**Impacto:** Inconsistência visual entre as telas de auth/perfil e as telas de fluxo principal.

---

#### CR-02 — `DashboardPage` usa tokens arbitrários fora do design system

**Arquivo:** `src/pages/DashboardPage.tsx` (linhas 34, 37, 59–62, 127–129, 172–173)

**Problema:** O componente `StatCard` interno e o `AllClearBanner` usam shadows e radius arbitrários, radius fora da escala, e cores hardcoded sem equivalente nos tokens.

**Atual:**
```tsx
// StatCard — shadow arbitrária, rounded-2xl fora da escala
className="... rounded-2xl border border-neutral-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] ..."

// StatCard icon — rounded-xl fora da escala
className="bg-blue-500 ... rounded-xl"   // bg-blue-500, bg-amber-500, bg-green-500 sem token

// AllClearBanner — cores hardcoded (green-100, green-50, green-700)
className="... border-green-100 bg-green-50 ... text-green-700 ..."

// ActivityItem wrapper — neutral-100 e rounded-xl fora da escala
className="rounded-xl border border-neutral-100 bg-white ..."
```
**Esperado:**
```tsx
// StatCard
className="... rounded-lg border border-border bg-card shadow-card hover:shadow-card-hover ..."

// StatCard icon: usar --color-primary ou tokens existentes; cores contextuais ok se documentadas
// AllClearBanner: usar --color-success / --color-success-light
className="... border border-success/20 bg-success-light ... text-success ..."

// ActivityItem wrapper
className="rounded-lg border border-border bg-card ..."
```
**Impacto:** Dashboard diverge do sistema de design Stripe em radius e sombras — visualmente diferente de todas as outras telas.

---

#### CR-03 — `PerfilPage` sem `PageHeader` e sem título de página

**Arquivo:** `src/pages/PerfilPage.tsx` (linha 85)

**Problema:** A página de perfil começa direto com `<UserCard>` sem `<PageHeader title="Meu Perfil" />`. Todas as outras páginas autenticadas usam `PageHeader`. A `PerfilPage` não tem `BackButton` nem título — o usuário não tem contexto de onde está.

**Atual:**
```tsx
<div className="p-6 max-w-lg">
  {activeProfile && (
    <div className="mb-6">
      <UserCard name={activeProfile.nome} role={activeProfile.role} />
    </div>
  )}
  <form ...>
```
**Esperado:**
```tsx
<div className="p-6 max-w-2xl">
  <PageHeader title="Meu Perfil" />
  {activeProfile && (
    <div className="mb-4">
      <UserCard ... />
    </div>
  )}
  <form ...>
```
**Impacto:** Inconsistência estrutural — usuário sem título de contexto, `max-w-lg` fora do padrão de formulários (`max-w-2xl`).

---

#### CR-04 — `OrdensServicoPage` completamente incompleta

**Arquivo:** `src/pages/OrdensServicoPage.tsx`

**Problema:** A página importa e renderiza apenas `<PageHeader title="Ordens de Serviço" />` sem wrapper `p-6`, sem lista de dados, sem esqueleto. Mas existe `OrdemServicoListPage` completa em `src/features/ordem-servico/OrdemServicoListPage.tsx`. A rota `/ordens-servico` provavelmente deveria usar essa feature page.

**Atual:**
```tsx
export default function OrdensServicoPage() {
  return <PageHeader title="Ordens de Serviço" />
}
```
**Esperado:** Ou deletar `OrdensServicoPage` e apontar a rota para `OrdemServicoListPage`, ou implementá-la espelhando `SolicitacoesPage` / `OrcamentosPage`.

**Impacto:** A rota `/ordens-servico` exibe apenas um header sem conteúdo — bug de roteamento ou página esquecida.

---

### WARNING

#### WR-01 — Status chips triplicados sem componente compartilhado

**Arquivos:**
- `src/pages/SolicitacoesPage.tsx` (linhas 37–51) — inline
- `src/pages/OrcamentosPage.tsx` (linhas 31–57) — componente local `StatusChips`
- `src/features/ordem-servico/OrdemServicoListPage.tsx` (linhas 36–51) — inline

**Problema:** As classes dos chips de status são idênticas nas 3 telas mas triplicadas. Se precisar ajustar o design do chip (ex: mudar `text-xs` para `text-sm` ou o padding), é necessário alterar em 3 lugares.

**Atual:** Classes duplicadas em cada tela:
```tsx
className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
  active ? 'bg-primary text-white border-primary' : 'bg-neutral-25 border-border text-neutral-500 ...'
}`}
```
**Esperado:** Extrair para `src/components/molecules/StatusChip.tsx` e `StatusChipGroup.tsx` (ou ao menos documentar o padrão em DESIGN.md §2.5 para referência única).

---

#### WR-02 — `text-destructive` em vez de `text-danger` em OrcamentoFormPage e OrcamentoReviewPage

**Arquivos:**
- `src/features/orcamento/OrcamentoFormPage.tsx` (linhas 139, 143, 187)
- `src/features/orcamento/OrcamentoReviewPage.tsx` (linha 144)

**Problema:** Essas telas usam o token shadcn `destructive` enquanto todo o restante do projeto usa `danger` (definido em `src/index.css`). Se os valores divergirem, as cores de erro ficarão diferentes.

**Atual:**
```tsx
<p className="text-xs text-destructive">...</p>
<button className="... hover:text-destructive hover:bg-destructive/10 ...">
<Button className="... border-destructive text-destructive hover:bg-destructive/10">
```
**Esperado:**
```tsx
<p className="text-xs text-danger">...</p>
<button className="... hover:text-danger hover:bg-danger/10 ...">
<Button className="... border-danger text-danger hover:bg-danger/10">
```

---

#### WR-03 — `LoginPage`/`RegisterPage` com `border-neutral-200` ao invés de `border-border`

**Arquivos:**
- `src/features/auth/LoginPage.tsx` (linha 41)
- `src/features/auth/RegisterPage.tsx` (linha 38)

**Problema:** O card de auth usa `border-neutral-200` (`#bac8da`) enquanto o token padrão de borda é `border-border` (`#e5edf5` = `neutral-50`). São cores diferentes — o card de auth tem borda mais escura que o resto.

**Atual:**
```tsx
<div className="w-full max-w-md bg-white rounded-xl border border-neutral-200 p-8 shadow-sm">
```
**Esperado:**
```tsx
<div className="w-full max-w-md bg-card rounded-lg border border-border p-8 shadow-card">
```
Nota: `rounded-xl` também está fora da escala (deveria ser `rounded-lg` = 12px).

---

#### WR-04 — `OrcamentoDetailPage` usa `max-w-3xl` enquanto DESIGN.md define `max-w-5xl` para detalhes

**Arquivo:** `src/features/orcamento/OrcamentoDetailPage.tsx` (linha 41)

**Problema:** Inconsistência entre páginas de detalhe:
- `OrcamentoDetailPage`: `max-w-3xl`
- `OrcamentoReviewPage`: `max-w-5xl` ✓
- `SolicitacaoDetailPage`: `max-w-5xl` ✓
- `OrdemServicoDetailPage`: `max-w-3xl`

**Esperado:** `max-w-5xl` para todas as páginas de detalhe (padrão DESIGN.md §5).

---

#### WR-05 — `PageHeader` com `subtitle` inexistente na interface

**Arquivo:** `src/pages/DashboardPage.tsx` (linha 329–332)

**Problema:** `DashboardPage` passa `subtitle` para `PageHeader`, mas `PageHeader.tsx` não tem essa prop — ela é silenciosamente ignorada. O subtitle da saudação nunca é exibido.

**Atual:**
```tsx
<PageHeader
  title={`${greeting}, ${firstName}!`}
  subtitle={`${hoje} • Painel do ${roleLabel}`}
/>
```
**Esperado:** Ou adicionar `subtitle?: string` ao `PageHeader`, ou exibir o subtitle com elemento separado abaixo do título:
```tsx
<PageHeader title={`${greeting}, ${firstName}!`} />
<p className="text-sm text-muted-foreground -mt-2">{hoje} • Painel do {roleLabel}</p>
```

---

#### WR-06 — `OrcamentoDetailPage` e `OrcamentoReviewPage` com `PageHeader` dentro de `flex justify-between`

**Arquivos:**
- `src/features/orcamento/OrcamentoDetailPage.tsx` (linhas 46–55)
- `src/features/orcamento/OrcamentoReviewPage.tsx` (linhas 65–69)

**Problema:** O `PageHeader` é envolto em `div.flex.items-start.justify-between` para colocar o botão de PDF ao lado. Isso anula o `pb-4` do `PageHeader`. A ação deveria ser passada via `actions` prop do `PageHeader`.

**Atual:**
```tsx
<div className="flex items-start justify-between gap-4">
  <PageHeader title={data.numero} />
  {canDownload && <PdfDownloadButton ... />}
</div>
```
**Esperado:**
```tsx
<PageHeader
  title={data.numero}
  actions={canDownload ? <PdfDownloadButton ... /> : null}
/>
```

---

#### WR-07 — `DashboardPage.tsx` usa `AllClearBanner` com cores hardcoded (green-*)

**Arquivo:** `src/pages/DashboardPage.tsx` (linhas 58–64)

**Problema:** `AllClearBanner` usa `border-green-100`, `bg-green-50`, `text-green-700` — classes Tailwind fora dos tokens do design system. Os tokens corretos são `success`, `success-light`.

**Atual:**
```tsx
<div className="... border-green-100 bg-green-50 ...">
  <div className="... bg-green-500 ...">
  <p className="... text-green-700 ...">
```
**Esperado:**
```tsx
<div className="... border-success/20 bg-success-light ...">
  <div className="... bg-success ...">
  <p className="... text-success ...">
```

---

#### WR-08 — `SolicitacaoCard` em `features/` em vez de `components/organisms/`

**Arquivo:** `src/features/solicitacao/components/SolicitacaoCard.tsx`

**Problema:** `OrcamentoCard` e `OrdemServicoCard` estão em `components/organisms/`, mas `SolicitacaoCard` está em `features/solicitacao/components/`. Estruturalmente são o mesmo tipo de componente (card de item de lista com badge e chevron). Dificulta encontrar/reutilizar e pode criar uma segunda versão com classes distintas futuramente.

**Esperado:** Mover para `src/components/organisms/SolicitacaoCard.tsx` e atualizar o import em `SolicitacoesPage` e `SolicitacaoListPrestadorPage`.

---

### INFO

#### IN-01 — `OrdemServicoDetailPage` com grid de 4 colunas para 3 InfoCards

**Arquivo:** `src/features/ordem-servico/OrdemServicoDetailPage.tsx` (linha 49)

**Problema:** `grid grid-cols-2 gap-4 sm:grid-cols-4` mas só 3 InfoCards (Status, Início, Conclusão) — a 4ª coluna fica vazia no desktop.

**Esperado:**
```tsx
<div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
```

---

#### IN-02 — `OrcamentoFormPage` mistura `<Button>` shadcn com botão raw

**Arquivo:** `src/features/orcamento/OrcamentoFormPage.tsx` (linhas 128–135, 204–223)

**Problema:** Usa `<Button variant="outline">` e `<Button>` de `@/components/ui/button` para os CTAs principais, enquanto todas as outras telas usam `<button>` raw com classes explícitas. A aparência pode divergir se o tema do shadcn Button for alterado.

**Sugestão:** Escolher uma das abordagens e documentar no DESIGN.md §6. A recomendação é manter `<button>` raw com as classes explícitas do DESIGN.md para total controle.

---

#### IN-03 — `OrcamentosPage` sem `max-w` no container

**Arquivo:** `src/pages/OrcamentosPage.tsx` (linha 158)

**Problema:** `<div className="p-6 space-y-6">` sem `max-w`. Todas as list pages seguem o mesmo padrão (sem max-w nas list pages — isso é correto para listas em grid), mas vale documentar explicitamente que list pages não têm max-w.

**Sugestão:** Adicionar ao DESIGN.md §5: "List pages (`SolicitacoesPage`, `OrcamentosPage`, `OrdemServicoListPage`) — sem `max-w`, usar `p-6 space-y-6` direto."

---

#### IN-04 — `StatCard` no Dashboard com `border-neutral-100` ao invés de `border-border`

**Arquivo:** `src/pages/DashboardPage.tsx` (linha 34)

**Problema:** `border-neutral-100` (`#d4dee9`) é mais escuro que `border-border` (`#e5edf5` = `neutral-50`). Cards do Dashboard terão bordas visualmente mais pesadas que cards em outros contextos.

**Atual:** `border border-neutral-100`  
**Esperado:** `border border-border`

---

#### IN-05 — `OrdemServicoDetailPage` e `SolicitacaoDetailPage` sem `max-w` consistente

**Arquivos:**
- `src/features/ordem-servico/OrdemServicoDetailPage.tsx` (linha 45): `max-w-3xl`
- `src/features/solicitacao/SolicitacaoDetailPage.tsx` (linha 53): `max-w-5xl` ✓

**Sugestão:** Padronizar em `max-w-5xl` (conforme DESIGN.md §5) para manter layout de detalhe consistente entre OS e Solicitação.

---

## Arquivos Conformes (sem findings)

Esses arquivos estão alinhados com o DESIGN.md sem necessidade de correção:

| Arquivo | Conformidade |
|---|---|
| `src/features/solicitacao/SolicitacaoFormPage.tsx` | ✓ Estrutura correta — botão `rounded-lg`, `p-6 max-w-2xl`, BackButton + PageHeader |
| `src/components/molecules/FormField.tsx` | ✓ Label, input, erro — 100% alinhados |
| `src/components/molecules/TextareaField.tsx` | ✓ Idêntico ao FormField |
| `src/components/molecules/SelectField.tsx` | ✓ Idêntico ao FormField |
| `src/components/molecules/CurrencyInput.tsx` | ✓ Prefixo absoluto, classes corretas |
| `src/components/molecules/PageHeader.tsx` | ✓ Estrutura conforme (mas precisa de `subtitle` prop — WR-05) |
| `src/components/organisms/DataTable.tsx` | ✓ Desktop/mobile correto, tokens corretos |
| `src/components/organisms/OrcamentoCard.tsx` | ✓ `rounded-md border border-border bg-white shadow-card` |
| `src/components/organisms/OrdemServicoCard.tsx` | ✓ Idêntico ao OrcamentoCard |
| `src/features/solicitacao/components/SolicitacaoCard.tsx` | ✓ Estrutura correta (mas localização errada — WR-08) |
| `src/pages/SolicitacoesPage.tsx` | ✓ `p-6 space-y-6`, PageHeader, FilterBar, grid md:2 |
| `src/pages/OrcamentosPage.tsx` | ✓ Mesmo padrão de SolicitacoesPage |
| `src/features/ordem-servico/OrdemServicoListPage.tsx` | ✓ Mesmo padrão |
| `src/features/solicitacao/SolicitacaoListPrestadorPage.tsx` | ✓ Mesmo padrão |
| `src/features/orcamento/OrcamentoFormPage.tsx` | ⚠ Conforme estruturalmente, mas WR-02 e IN-02 |

---

## Sumário de Correções por Prioridade

| # | Severidade | Arquivo(s) | Correção |
|---|---|---|---|
| CR-01 | CRITICAL | LoginPage, RegisterPage, PerfilPage | `rounded-md` → `rounded-lg` no botão submit |
| CR-02 | CRITICAL | DashboardPage | Substituir shadows/radius/cores arbitrários por tokens |
| CR-03 | CRITICAL | PerfilPage | Adicionar `<PageHeader title="Meu Perfil" />` e corrigir `max-w-lg` → `max-w-2xl` |
| CR-04 | CRITICAL | OrdensServicoPage | Apontar para `OrdemServicoListPage` ou implementar completa |
| WR-01 | WARNING | SolicitacoesPage, OrcamentosPage, OrdemServicoListPage | Extrair chips de status para componente compartilhado |
| WR-02 | WARNING | OrcamentoFormPage, OrcamentoReviewPage | `text-destructive` → `text-danger` |
| WR-03 | WARNING | LoginPage, RegisterPage | `border-neutral-200` → `border-border`, `rounded-xl` → `rounded-lg` |
| WR-04 | WARNING | OrcamentoDetailPage, OrdemServicoDetailPage | `max-w-3xl` → `max-w-5xl` |
| WR-05 | WARNING | DashboardPage | Implementar `subtitle` no `PageHeader` ou usar elemento separado |
| WR-06 | WARNING | OrcamentoDetailPage, OrcamentoReviewPage | Passar PDF button via `actions` prop do PageHeader |
| WR-07 | WARNING | DashboardPage | `green-*` → `success` / `success-light` tokens |
| WR-08 | WARNING | SolicitacaoCard | Mover para `components/organisms/` |

---

_Auditoria manual realizada em 2026-05-11_
_Arquivos lidos: 22 | Findings: 4 critical, 8 warning, 5 info_
