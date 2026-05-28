# UI/UX Redesign — Sidebar, TopBar e BottomNav

**Data:** 2026-05-08
**Escopo:** Redesign da navegação principal do CSTI (Sidebar, TopBar, BottomNav, AppShell wiring)
**Abordagem:** B — Redesign dos 3 componentes com dados dinâmicos

---

## Contexto e Problema

O layout atual do CSTI tem falhas críticas de UX:

- TopBar quase vazia (só nome do app + botão Sair)
- Sidebar sem identidade visual, sem logo, sem perfil do usuário
- Active state fraco (só cor de texto, sem pill sólido)
- `useSidebar` hook existe mas é ignorado — sidebar usa breakpoints CSS fixos
- `MobileDrawer.tsx` criado mas não utilizado (será removido do AppShell)
- BottomNav com "Perfil" ocupando slot de navegação desnecessariamente
- Nenhum badge/contador para itens com pendências
- Usuário logado não tem identidade visual em nenhum lugar

---

## Decisões de Design

### Não incluído no escopo
- Dark mode (não é prioridade)
- Grupos de navegação ("PRINCIPAL / GESTÃO") — só 4-5 links, seria over-engineering
- MobileDrawer / hamburguer — mobile usa exclusivamente BottomNav
- Página de notificações — sino navega para `/perfil` por ora

---

## Design por Componente

### 1. Sidebar

**Layout:**
- Largura expandida: 240px | Collapsed: 64px
- Controlada por `useSidebar` (hook existente) via context no AppShell
- Oculta em mobile (< md) — BottomNav cuida do mobile

**Logo no topo:**
- Ícone (ex: `Wrench` estilizado ou initials "OF" em `bg-primary text-white rounded-lg`) + texto "CSTI" em `font-semibold text-primary`
- Collapsed: só ícone
- Expanded: ícone + texto

**Nav links:**
- Fonte: `useNavLinks()` hook (substitui constante `NAV_LINKS`)
- Active: `bg-primary rounded-lg` full-width, ícone + texto brancos
- Inativo: `text-neutral-500`, hover `bg-neutral-100 rounded-lg`
- Badge: `<span>` circular `bg-danger text-white text-[10px] font-bold` posicionado absoluto no canto superior direito do ícone quando `badge > 0`
- Collapsed: só ícone + badge, sem label

**Botão collapse:**
- Ícone `ChevronLeft` / `ChevronRight` posicionado no bottom da nav area
- Chama `toggleExpanded` do `useSidebar`
- Só aparece em desktop (≥ md)

**Perfil do usuário (bottom):**
- Avatar circular: inicial do nome em `bg-primary-light text-primary font-semibold`
- Expanded: avatar + nome completo + role traduzida (`text-[11px] text-neutral-400`)
- Collapsed: só avatar
- Clique abre Popover com: "Meu Perfil" (navega `/perfil`) + "Sair" (logout)
- Dados via `useGetPerfil()` (hook existente)

---

### 2. TopBar

**Estrutura:** `h-14 bg-white border-b border-neutral-200 fixed top-0 left-0 right-0 z-[100]`

**Zona esquerda (mobile only, < md):**
- Vazia — sem hamburguer, mobile usa BottomNav

**Zona esquerda (desktop):**
- Vazia — logo está no sidebar

**Zona centro (desktop only):**
- Saudação: `"Bom dia, [PrimeiroNome]!"` | `"Boa tarde, ..."` | `"Boa noite, ..."`
- Função utilitária pura `getGreeting(name)` baseada em `new Date().getHours()`
- `text-sm font-medium text-neutral-700`
- Escondida em mobile

**Zona direita:**
1. Ícone `Bell` com badge vermelho circular quando `useNotificacoesNaoLidas().count > 0`
   - Clique navega para `/perfil` (notificações integradas na story futura)
2. Avatar circular (inicial do nome) + nome + role em `text-xs text-neutral-500`
   - Clique abre Dropdown com: "Meu Perfil" → `/perfil` | "Sair" → logout
   - Em mobile: só avatar (sem nome/role ao lado)

**Remove:** botão "Sair" standalone atual

---

### 3. BottomNav (mobile)

**Links:** 4 itens — Dashboard, Solicitações, Orçamentos, OS. Remove "Perfil".
**Badge:** mesmo sistema do sidebar — `<span>` circular `bg-danger` quando `badge > 0`
**Active state:** mantém pill atual (já está bom)
**Espaçamento:** `justify-around` com 4 itens fica mais equilibrado que 5

---

### 4. AppShell — wiring

```
AppShell
├── TopBar          (saudação + notificações + avatar/dropdown)
├── Sidebar         (logo + nav + collapse + perfil)  [hidden mobile]
├── main
│   ├── pt-14       (sempre, topbar fixa)
│   ├── pb-20 md:pb-6
│   ├── ml-0 md:ml-[64px] lg:ml-[var(--sidebar-width)]  ← controlado por useSidebar
│   └── <Outlet />
└── BottomNav       [hidden md+]
```

- `useSidebar` exposto via React Context (`SidebarContext`) para que AppShell e TopBar possam ler `isExpanded`
- `--sidebar-width` CSS var: `240px` (expanded) ou `64px` (collapsed) — `main` faz `transition-all duration-200`
- `MobileDrawer` não é renderizado (componente pode ser deletado ou mantido sem uso)

---

## Dados Dinâmicos

### `useNavLinks()` hook
Substitui a constante `NAV_LINKS`. Retorna `NavLink[]` com campo `badge?: number` preenchido:

```ts
// src/components/layout/useNavLinks.ts
export function useNavLinks(role: 'cliente' | 'prestador'): NavLink[]
```

Internamente chama:
- `useSolicitacoesBadge(role)` — count de solicitações pendentes por role
- `useOrcamentosBadge(role)` — count de orçamentos pendentes

Queries simples via Supabase RPC ou `.select('id', { count: 'exact', head: true })`.

### `useNotificacoesNaoLidas()`
```ts
// src/features/notificacoes/useNotificacoes.ts
export function useNotificacoesNaoLidas(): { count: number }
```
Tabela `notificacoes` já existe. Query: `select count where lida = false and usuario_id = me`.

### `getGreeting(name: string): string`
```ts
// src/lib/greeting.ts
export function getGreeting(name: string): string
```
Pura, sem side effects. Baseada em `new Date().getHours()`.

---

## Arquivos Afetados

| Arquivo | Ação |
|---|---|
| `src/components/layout/Sidebar.tsx` | Redesign completo |
| `src/components/layout/TopBar.tsx` | Redesign completo |
| `src/components/layout/BottomNav.tsx` | Remove Perfil, adiciona badge |
| `src/components/layout/AppShell.tsx` | Wiring de context + ml dinâmico |
| `src/components/layout/navLinks.ts` | Substituído por `useNavLinks.ts` (hook) |
| `src/hooks/useSidebar.ts` | Expor via SidebarContext |
| `src/lib/greeting.ts` | Criar — função pura `getGreeting` |
| `src/features/notificacoes/useNotificacoes.ts` | Criar — `useNotificacoesNaoLidas` |
| `src/components/layout/useNavLinks.ts` | Criar — hook com badges |

---

## Critérios de Aceitação

- [ ] Sidebar exibe logo no topo (collapsed: só ícone; expanded: ícone + nome)
- [ ] Active state é pill sólido `bg-primary` com texto/ícone brancos
- [ ] Badges aparecem nos links com pendências > 0
- [ ] Botão collapse funciona e `main` ajusta margem suavemente
- [ ] Perfil do usuário aparece no bottom do sidebar (nome + role + avatar)
- [ ] Popover do perfil tem "Meu Perfil" e "Sair"
- [ ] TopBar exibe saudação contextual (desktop only)
- [ ] TopBar exibe sino com badge de notificações não lidas
- [ ] TopBar exibe avatar + nome + role + dropdown
- [ ] Dropdown do avatar tem "Meu Perfil" e "Sair"
- [ ] Botão "Sair" standalone removido da TopBar
- [ ] BottomNav tem 4 itens (sem Perfil), com badges
- [ ] Mobile: sem hamburguer, sem drawer — só BottomNav
- [ ] Todos os testes existentes continuam passando (67 testes)
- [ ] Lint e typecheck passam
