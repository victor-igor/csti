# UI/UX Redesign — Sidebar, TopBar e BottomNav — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesenhar Sidebar, TopBar e BottomNav do OrçaFácil para nível de produção — logo, active pill sólido, perfil do usuário logado, badges de contagem, saudação contextual e notificações.

**Architecture:** Oito tarefas sequenciais. Utilitários e hooks primeiro (`getGreeting`, `useNotificacoesNaoLidas`, `useNavLinks`), depois os três componentes visuais (Sidebar, TopBar, BottomNav), e por último o wiring no AppShell. `useSidebar` é uma Zustand store já existente — consumida diretamente, sem context adicional. `useAuthStore` já carrega o `profile` do usuário em background — é a fonte de dados para nome e role em todos os componentes de layout.

**Tech Stack:** React 19, TypeScript, Tailwind v4, shadcn/ui (DropdownMenu — a instalar), Lucide React, Zustand, TanStack Query, Supabase, Vitest + @testing-library/react

---

## File Map

| Arquivo | Ação |
|---|---|
| `src/lib/greeting.ts` | Criar — função pura `getGreeting(name)` |
| `src/lib/__tests__/greeting.test.ts` | Criar — testes unitários do getGreeting |
| `src/features/notificacoes/useNotificacoes.ts` | Criar — hook `useNotificacoesNaoLidas` |
| `src/features/notificacoes/__tests__/useNotificacoes.test.ts` | Criar — testes do hook |
| `src/components/layout/useNavLinks.ts` | Criar — hook que retorna NavLink[] com badges |
| `src/hooks/useSidebar.ts` | Modificar — mudar `isExpanded` inicial de `false` para `true` |
| `src/components/layout/Sidebar.tsx` | Redesenhar completo |
| `src/components/layout/TopBar.tsx` | Redesenhar completo |
| `src/components/layout/BottomNav.tsx` | Atualizar — remove Perfil, adiciona badge, usa `useNavLinks` |
| `src/components/layout/AppShell.tsx` | Atualizar — ml dinâmico via `useSidebar` |
| `src/components/layout/navLinks.ts` | Deletar — substituído por `useNavLinks.ts` |
| `src/components/ui/dropdown-menu.tsx` | Criar via `npx shadcn@latest add dropdown-menu` |

---

## Task 1: Instalar shadcn dropdown-menu + criar `getGreeting`

**Files:**
- Create: `src/components/ui/dropdown-menu.tsx` (via shadcn CLI)
- Create: `src/lib/greeting.ts`
- Create: `src/lib/__tests__/greeting.test.ts`

- [ ] **Step 1: Instalar dropdown-menu via shadcn**

```bash
cd /Users/victorigor/eep-projeto/eep-projeto/orcafacil && npx shadcn@latest add dropdown-menu --yes
```

Expected: arquivo `src/components/ui/dropdown-menu.tsx` criado sem erros.

- [ ] **Step 2: Escrever o teste de `getGreeting`**

Crie `src/lib/__tests__/greeting.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getGreeting } from '../greeting'

describe('getGreeting', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it('retorna "Bom dia" para horas entre 0 e 11', () => {
    vi.setSystemTime(new Date('2026-05-08T08:00:00'))
    expect(getGreeting('Victor Hugo')).toBe('Bom dia, Victor!')
  })

  it('retorna "Boa tarde" para horas entre 12 e 17', () => {
    vi.setSystemTime(new Date('2026-05-08T15:00:00'))
    expect(getGreeting('Ana')).toBe('Boa tarde, Ana!')
  })

  it('retorna "Boa noite" para horas entre 18 e 23', () => {
    vi.setSystemTime(new Date('2026-05-08T20:00:00'))
    expect(getGreeting('João')).toBe('Boa noite, João!')
  })

  it('usa apenas o primeiro nome quando nome tem múltiplas palavras', () => {
    vi.setSystemTime(new Date('2026-05-08T08:00:00'))
    expect(getGreeting('Maria Fernanda Santos')).toBe('Bom dia, Maria!')
  })
})
```

- [ ] **Step 3: Rodar o teste para verificar que falha**

```bash
cd /Users/victorigor/eep-projeto/eep-projeto/orcafacil && npx vitest run src/lib/__tests__/greeting.test.ts
```

Expected: FAIL — "Cannot find module '../greeting'"

- [ ] **Step 4: Implementar `getGreeting`**

Crie `src/lib/greeting.ts`:

```typescript
export function getGreeting(name: string): string {
  const hour = new Date().getHours()
  const period = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'
  const firstName = name.split(' ')[0]
  return `${period}, ${firstName}!`
}
```

- [ ] **Step 5: Rodar o teste para verificar que passa**

```bash
cd /Users/victorigor/eep-projeto/eep-projeto/orcafacil && npx vitest run src/lib/__tests__/greeting.test.ts
```

Expected: PASS — 4 tests passed

- [ ] **Step 6: Commit**

```bash
cd /Users/victorigor/eep-projeto/eep-projeto/orcafacil && git add src/components/ui/dropdown-menu.tsx src/lib/greeting.ts src/lib/__tests__/greeting.test.ts && git commit -m "feat: add dropdown-menu component and getGreeting utility"
```

---

## Task 2: Criar `useNotificacoesNaoLidas`

**Files:**
- Create: `src/features/notificacoes/useNotificacoes.ts`
- Create: `src/features/notificacoes/__tests__/useNotificacoes.test.ts`

- [ ] **Step 1: Escrever o teste do hook**

Crie o diretório e o arquivo `src/features/notificacoes/__tests__/useNotificacoes.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'

const mockSupabase = vi.hoisted(() => ({
  auth: {
    onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
  },
  from: vi.fn(),
  select: vi.fn(),
  eq: vi.fn(),
}))

vi.mock('@/lib/supabase', () => ({ supabase: mockSupabase }))

vi.mock('@/store/authStore', () => ({
  useAuthStore: vi.fn((selector: (s: { profile: { id: string } }) => unknown) =>
    selector({ profile: { id: 'user-123' } })
  ),
}))

import { useNotificacoesNaoLidas } from '../useNotificacoes'

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: qc }, children)
}

describe('useNotificacoesNaoLidas', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabase.from.mockReturnThis()
    mockSupabase.select.mockReturnThis()
  })

  it('retorna 0 quando não há notificações não lidas', async () => {
    // Cadeia: .from().select().eq('usuario_id').eq('lida') → resolve
    mockSupabase.eq
      .mockReturnValueOnce(mockSupabase)                       // primeiro .eq() retorna this
      .mockResolvedValueOnce({ count: 0, error: null })        // segundo .eq() resolve

    const { result } = renderHook(() => useNotificacoesNaoLidas(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toBe(0)
  })

  it('retorna a contagem de notificações não lidas', async () => {
    mockSupabase.eq
      .mockReturnValueOnce(mockSupabase)
      .mockResolvedValueOnce({ count: 3, error: null })

    const { result } = renderHook(() => useNotificacoesNaoLidas(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toBe(3)
  })
})
```

- [ ] **Step 2: Rodar o teste para verificar que falha**

```bash
cd /Users/victorigor/eep-projeto/eep-projeto/orcafacil && npx vitest run src/features/notificacoes/__tests__/useNotificacoes.test.ts
```

Expected: FAIL — "Cannot find module '../useNotificacoes'"

- [ ] **Step 3: Implementar o hook**

Crie `src/features/notificacoes/useNotificacoes.ts`:

```typescript
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'

export function useNotificacoesNaoLidas() {
  const profileId = useAuthStore((s) => s.profile?.id)

  return useQuery({
    queryKey: ['notificacoes', 'nao-lidas', profileId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('notificacoes')
        .select('*', { count: 'exact', head: true })
        .eq('usuario_id', profileId!)
        .eq('lida', false)
      if (error) throw error
      return count ?? 0
    },
    enabled: !!profileId,
  })
}
```

- [ ] **Step 4: Rodar o teste para verificar que passa**

```bash
cd /Users/victorigor/eep-projeto/eep-projeto/orcafacil && npx vitest run src/features/notificacoes/__tests__/useNotificacoes.test.ts
```

Expected: PASS — 2 tests passed

- [ ] **Step 5: Commit**

```bash
cd /Users/victorigor/eep-projeto/eep-projeto/orcafacil && git add src/features/notificacoes/ && git commit -m "feat: add useNotificacoesNaoLidas hook"
```

---

## Task 3: Criar `useNavLinks` hook

**Files:**
- Create: `src/components/layout/useNavLinks.ts`

Nota: `navLinks.ts` ainda existe neste ponto — será deletado na Task 8 após todos os componentes serem atualizados.

- [ ] **Step 1: Criar `src/components/layout/useNavLinks.ts`**

```typescript
import { LayoutDashboard, ClipboardList, FileText, Wrench, type LucideIcon } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { Role } from '@/types/domain'

export interface NavLink {
  label: string
  href: string
  icon: LucideIcon
  badge?: number
}

function useSolicitacoesBadge() {
  const profile = useAuthStore((s) => s.profile)
  const role = profile?.role as Role | undefined

  return useQuery({
    queryKey: ['badge', 'solicitacoes', role, profile?.id],
    queryFn: async () => {
      if (role === 'cliente') return 0
      // Prestador: solicitações abertas aguardando orçamento
      const { count, error } = await supabase
        .from('solicitacoes_orcamento')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'aberta')
      if (error) throw error
      return count ?? 0
    },
    enabled: !!profile?.id,
  })
}

function useOrcamentosBadge() {
  const profile = useAuthStore((s) => s.profile)
  const role = profile?.role as Role | undefined

  return useQuery({
    queryKey: ['badge', 'orcamentos', role, profile?.id],
    queryFn: async () => {
      if (role === 'prestador') return 0
      // Cliente: orçamentos enviados aguardando aprovação
      const { count, error } = await supabase
        .from('orcamentos')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'enviado')
      if (error) throw error
      return count ?? 0
    },
    enabled: !!profile?.id,
  })
}

export function useNavLinks(): NavLink[] {
  const { data: solBadge = 0 } = useSolicitacoesBadge()
  const { data: orcBadge = 0 } = useOrcamentosBadge()

  return [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'Solicitações', href: '/solicitacoes', icon: ClipboardList, badge: solBadge || undefined },
    { label: 'Orçamentos', href: '/orcamentos', icon: FileText, badge: orcBadge || undefined },
    { label: 'OS', href: '/ordens-servico', icon: Wrench },
  ]
}
```

- [ ] **Step 2: Typecheck para garantir que o arquivo compila**

```bash
cd /Users/victorigor/eep-projeto/eep-projeto/orcafacil && npx tsc --noEmit
```

Expected: sem erros relacionados a `useNavLinks.ts`

- [ ] **Step 3: Commit**

```bash
cd /Users/victorigor/eep-projeto/eep-projeto/orcafacil && git add src/components/layout/useNavLinks.ts && git commit -m "feat: add useNavLinks hook with badge support"
```

---

## Task 4: Corrigir estado inicial do `useSidebar`

**Files:**
- Modify: `src/hooks/useSidebar.ts`

- [ ] **Step 1: Atualizar `isExpanded` inicial para `true`**

Em `src/hooks/useSidebar.ts`, mude `isExpanded: false` para `isExpanded: true`:

Arquivo completo atualizado:

```typescript
import { create } from 'zustand'

interface SidebarState {
  isDrawerOpen: boolean
  isExpanded: boolean
  openDrawer: () => void
  closeDrawer: () => void
  toggleExpanded: () => void
}

export const useSidebar = create<SidebarState>((set) => ({
  isDrawerOpen: false,
  isExpanded: true,
  openDrawer: () => set({ isDrawerOpen: true }),
  closeDrawer: () => set({ isDrawerOpen: false }),
  toggleExpanded: () => set((state) => ({ isExpanded: !state.isExpanded })),
}))
```

- [ ] **Step 2: Commit**

```bash
cd /Users/victorigor/eep-projeto/eep-projeto/orcafacil && git add src/hooks/useSidebar.ts && git commit -m "fix: set sidebar expanded by default"
```

---

## Task 5: Redesenhar Sidebar

**Files:**
- Modify: `src/components/layout/Sidebar.tsx`

- [ ] **Step 1: Substituir o conteúdo completo de `src/components/layout/Sidebar.tsx`**

```tsx
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useSidebar } from '@/hooks/useSidebar'
import { useNavLinks } from './useNavLinks'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Role } from '@/types/domain'

const ROLE_LABEL: Record<Role, string> = {
  cliente: 'Cliente',
  prestador: 'Prestador',
}

export function Sidebar() {
  const { isExpanded, toggleExpanded } = useSidebar()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const profile = useAuthStore((s) => s.profile)
  const navLinks = useNavLinks()

  function isActive(href: string) {
    return href === '/' ? pathname === '/' : pathname.startsWith(href)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const initials = profile?.nome?.charAt(0).toUpperCase() ?? '?'
  const roleLabel = profile?.role ? ROLE_LABEL[profile.role as Role] : ''

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col fixed top-14 left-0 bottom-0 bg-white border-r border-neutral-200 transition-all duration-200 z-10 overflow-hidden',
        isExpanded ? 'w-[240px]' : 'w-[64px]',
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          'flex items-center gap-3 p-4 border-b border-neutral-100 shrink-0',
          !isExpanded && 'justify-center px-2',
        )}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-white font-bold text-sm select-none">
          OF
        </div>
        {isExpanded && (
          <span className="font-semibold text-primary text-base truncate">OrçaFácil</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-1 px-2 overflow-hidden">
        {navLinks.map(({ label, href, icon: Icon, badge }) => (
          <Link
            key={href}
            to={href}
            title={!isExpanded ? label : undefined}
            className={cn(
              'relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
              isActive(href)
                ? 'bg-primary text-white font-medium'
                : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700',
              !isExpanded && 'justify-center px-2',
            )}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {isExpanded && <span className="truncate">{label}</span>}
            {badge ? (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-danger px-0.5 text-[10px] font-bold text-white">
                {badge > 9 ? '9+' : badge}
              </span>
            ) : null}
          </Link>
        ))}
      </nav>

      {/* Collapse button */}
      <div className="border-t border-neutral-100 px-2 py-2 shrink-0">
        <button
          onClick={toggleExpanded}
          className={cn(
            'w-full flex items-center rounded-lg px-3 py-2 text-neutral-500 hover:bg-neutral-100 transition-colors text-sm',
            !isExpanded && 'justify-center px-2',
          )}
          aria-label={isExpanded ? 'Recolher sidebar' : 'Expandir sidebar'}
        >
          {isExpanded ? (
            <>
              <ChevronLeft className="h-4 w-4 shrink-0" />
              <span className="ml-3">Recolher</span>
            </>
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* User profile */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              'flex items-center gap-3 p-4 border-t border-neutral-100 w-full hover:bg-neutral-50 transition-colors text-left shrink-0',
              !isExpanded && 'justify-center px-2',
            )}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary font-semibold text-sm select-none">
              {initials}
            </div>
            {isExpanded && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-800 truncate">{profile?.nome}</p>
                <p className="text-[11px] text-neutral-400">{roleLabel}</p>
              </div>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="start" className="w-48">
          <DropdownMenuItem asChild>
            <Link to="/perfil">Meu Perfil</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogout}
            className="text-danger focus:text-danger"
          >
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </aside>
  )
}
```

- [ ] **Step 2: Typecheck**

```bash
cd /Users/victorigor/eep-projeto/eep-projeto/orcafacil && npx tsc --noEmit
```

Expected: sem erros

- [ ] **Step 3: Commit**

```bash
cd /Users/victorigor/eep-projeto/eep-projeto/orcafacil && git add src/components/layout/Sidebar.tsx && git commit -m "feat: redesign Sidebar with logo, solid active pill, user profile and collapse"
```

---

## Task 6: Redesenhar TopBar

**Files:**
- Modify: `src/components/layout/TopBar.tsx`

- [ ] **Step 1: Substituir o conteúdo completo de `src/components/layout/TopBar.tsx`**

```tsx
import { Bell } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { useNotificacoesNaoLidas } from '@/features/notificacoes/useNotificacoes'
import { getGreeting } from '@/lib/greeting'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Role } from '@/types/domain'

const ROLE_LABEL: Record<Role, string> = {
  cliente: 'Cliente',
  prestador: 'Prestador',
}

export function TopBar() {
  const navigate = useNavigate()
  const profile = useAuthStore((s) => s.profile)
  const { data: notifCount = 0 } = useNotificacoesNaoLidas()

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const initials = profile?.nome?.charAt(0).toUpperCase() ?? '?'
  const firstName = profile?.nome?.split(' ')[0] ?? ''
  const roleLabel = profile?.role ? ROLE_LABEL[profile.role as Role] : ''
  const greeting = profile?.nome ? getGreeting(profile.nome) : ''

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] h-14 bg-white border-b border-neutral-200 flex items-center justify-between px-4">
      {/* Left — placeholder para alinhar o centro */}
      <div className="w-[120px]" />

      {/* Center — saudação (desktop only) */}
      {greeting && (
        <p className="hidden md:block text-sm font-medium text-neutral-700">{greeting}</p>
      )}

      {/* Right — notificações + usuário */}
      <div className="flex items-center gap-2">
        {/* Sino */}
        <Link
          to="/perfil"
          className="relative p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 transition-colors"
          aria-label="Notificações"
        >
          <Bell className="h-5 w-5" />
          {notifCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-danger px-0.5 text-[10px] font-bold text-white">
              {notifCount > 9 ? '9+' : notifCount}
            </span>
          )}
        </Link>

        {/* Dropdown do usuário */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-neutral-100 transition-colors">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary font-semibold text-sm select-none">
                {initials}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-neutral-800 leading-tight">{firstName}</p>
                <p className="text-[11px] text-neutral-400 leading-tight">{roleLabel}</p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link to="/perfil">Meu Perfil</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-danger focus:text-danger"
            >
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
```

- [ ] **Step 2: Typecheck**

```bash
cd /Users/victorigor/eep-projeto/eep-projeto/orcafacil && npx tsc --noEmit
```

Expected: sem erros

- [ ] **Step 3: Commit**

```bash
cd /Users/victorigor/eep-projeto/eep-projeto/orcafacil && git add src/components/layout/TopBar.tsx && git commit -m "feat: redesign TopBar with greeting, notification bell and user dropdown"
```

---

## Task 7: Atualizar BottomNav

**Files:**
- Modify: `src/components/layout/BottomNav.tsx`

- [ ] **Step 1: Substituir o conteúdo completo de `src/components/layout/BottomNav.tsx`**

```tsx
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useNavLinks } from './useNavLinks'

export function BottomNav() {
  const { pathname } = useLocation()
  const navLinks = useNavLinks()

  function isActive(href: string) {
    return href === '/' ? pathname === '/' : pathname.startsWith(href)
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[200] bg-white border-t border-neutral-200 flex items-center justify-around pb-safe">
      {navLinks.map(({ label, href, icon: Icon, badge }) => {
        const active = isActive(href)
        return (
          <Link
            key={href}
            to={href}
            className="relative flex-1 flex flex-col items-center justify-center h-16"
          >
            {badge ? (
              <span className="absolute top-2 left-1/2 translate-x-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-danger px-0.5 text-[10px] font-bold text-white z-10">
                {badge > 9 ? '9+' : badge}
              </span>
            ) : null}
            <div
              className={cn(
                'flex flex-col items-center gap-1 transition-all duration-300 ease-in-out',
                active ? 'text-primary -translate-y-0.5' : 'text-neutral-500',
              )}
            >
              <div
                className={cn(
                  'flex items-center justify-center rounded-full transition-all duration-300 px-4 py-1.5',
                  active && 'bg-primary-light',
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span
                className={cn(
                  'text-[10px] transition-all duration-300',
                  active ? 'font-semibold opacity-100' : 'font-medium opacity-70',
                )}
              >
                {label}
              </span>
            </div>
          </Link>
        )
      })}
    </nav>
  )
}
```

- [ ] **Step 2: Typecheck**

```bash
cd /Users/victorigor/eep-projeto/eep-projeto/orcafacil && npx tsc --noEmit
```

Expected: sem erros

- [ ] **Step 3: Commit**

```bash
cd /Users/victorigor/eep-projeto/eep-projeto/orcafacil && git add src/components/layout/BottomNav.tsx && git commit -m "feat: update BottomNav — remove Perfil, add badge support, use useNavLinks"
```

---

## Task 8: Atualizar AppShell + deletar navLinks.ts

**Files:**
- Modify: `src/components/layout/AppShell.tsx`
- Delete: `src/components/layout/navLinks.ts`

- [ ] **Step 1: Substituir o conteúdo completo de `src/components/layout/AppShell.tsx`**

```tsx
import { Outlet } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { TopBar } from './TopBar'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { useSidebar } from '@/hooks/useSidebar'

export function AppShell() {
  const { isExpanded } = useSidebar()

  return (
    <div className="min-h-screen bg-neutral-50">
      <TopBar />
      <Sidebar />

      <main
        className={cn(
          'pt-14 pb-20 md:pb-6 min-h-screen transition-all duration-200',
          'md:ml-[64px]',
          isExpanded ? 'lg:ml-[240px]' : 'lg:ml-[64px]',
        )}
      >
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
```

- [ ] **Step 2: Deletar `navLinks.ts`**

```bash
rm /Users/victorigor/eep-projeto/eep-projeto/orcafacil/src/components/layout/navLinks.ts
```

- [ ] **Step 3: Typecheck**

```bash
cd /Users/victorigor/eep-projeto/eep-projeto/orcafacil && npx tsc --noEmit
```

Expected: sem erros

- [ ] **Step 4: Commit**

```bash
cd /Users/victorigor/eep-projeto/eep-projeto/orcafacil && git add src/components/layout/AppShell.tsx && git rm src/components/layout/navLinks.ts && git commit -m "feat: wire AppShell with dynamic sidebar margin, remove navLinks.ts"
```

---

## Task 9: Validação final

**Files:** nenhum novo

- [ ] **Step 1: Rodar todos os testes**

```bash
cd /Users/victorigor/eep-projeto/eep-projeto/orcafacil && npx vitest run
```

Expected: todos os 69+ testes passando (67 existentes + 2 de notificacoes + 4 de greeting)

- [ ] **Step 2: Lint**

```bash
cd /Users/victorigor/eep-projeto/eep-projeto/orcafacil && npm run lint
```

Expected: sem erros

- [ ] **Step 3: Typecheck final**

```bash
cd /Users/victorigor/eep-projeto/eep-projeto/orcafacil && npx tsc --noEmit
```

Expected: sem erros

- [ ] **Step 4: Build de produção**

```bash
cd /Users/victorigor/eep-projeto/eep-projeto/orcafacil && npm run build
```

Expected: build completo sem erros

---

## Critérios de Aceitação

- [ ] Sidebar exibe logo "OF" no topo (collapsed: só ícone; expanded: ícone + "OrçaFácil")
- [ ] Active state é pill sólido `bg-primary` com texto/ícone brancos
- [ ] Badges aparecem nos links com pendências > 0
- [ ] Botão collapse funciona e `main` ajusta margem suavemente (240px ↔ 64px)
- [ ] Perfil do usuário aparece no bottom do sidebar (avatar + nome + role quando expanded)
- [ ] Dropdown do perfil tem "Meu Perfil" e "Sair"
- [ ] TopBar exibe saudação contextual (desktop only, centralizada)
- [ ] TopBar exibe sino com badge de notificações não lidas
- [ ] TopBar exibe avatar + primeiro nome + role + dropdown
- [ ] Dropdown do avatar tem "Meu Perfil" e "Sair"
- [ ] Botão "Sair" standalone removido da TopBar
- [ ] BottomNav tem 4 itens (sem Perfil), com badges
- [ ] Mobile: sem hamburguer — só BottomNav
- [ ] 69+ testes passando, lint e typecheck limpos
