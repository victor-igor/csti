// src/components/layout/TopBar.tsx
import { HelpCircle, Search, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { usePerfilModal } from '@/store/perfilModalStore'
import { useSidebar } from '@/hooks/useSidebar'
import { NotificacoesBell } from '@/features/notificacoes/NotificacoesBell'
import { UserMenuItems } from './UserMenuItems'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Role } from '@/types/domain'

const ROLE_LABEL: Record<Role, string> = {
  cliente: 'Cliente',
  prestador: 'Prestador',
  admin: 'Administrador',
  super_admin: 'Super Admin',
}

export function TopBar() {
  const profile = useAuthStore((s) => s.profile)
  const openPerfilModal = usePerfilModal((s) => s.open)
  const isExpanded = useSidebar((s) => s.isExpanded)

  const initials = profile?.nome?.charAt(0).toUpperCase() ?? '?'
  const firstName = profile?.nome?.split(' ')[0] ?? ''
  const roleLabel = profile?.role ? ROLE_LABEL[profile.role as Role] : ''

  return (
    <header
      className={cn(
        'fixed top-0 right-0 z-[100] h-20 md:h-14 bg-white flex items-center px-4 gap-4 transition-all duration-200',
        'left-0',
        isExpanded ? 'md:left-[256px]' : 'md:left-[72px]',
      )}
    >
      {/* Logo mobile (só aparece no mobile, no desktop a logo fica na sidebar) */}
      <div className="flex items-center md:hidden">
        <img
          src="/logo+texto.png"
          alt="CSTI"
          className="h-20 object-contain"
        />
      </div>

      {/* Search bar — alinhada à esquerda no desktop, oculta no mobile */}
      <div className="hidden md:flex flex-1">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="search"
            placeholder="Buscar..."
            className="w-full rounded-md border border-border bg-neutral-25 pl-9 pr-3 py-1.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Ações direita */}
      <div className="flex items-center gap-1 shrink-0 ml-auto">
        {/* Help — oculto no mobile */}
        <button
          className="hidden md:flex items-center justify-center p-2 rounded-lg text-neutral-500 hover:bg-neutral-25 transition-colors"
          aria-label="Ajuda"
          title="Ajuda"
        >
          <HelpCircle className="h-5 w-5" />
        </button>

        {/* Bell — popover de notificações */}
        <NotificacoesBell />

        {/* Settings — oculto no mobile */}
        <button
          className="hidden md:flex items-center justify-center p-2 rounded-lg text-neutral-500 hover:bg-neutral-25 transition-colors"
          aria-label="Configurações"
          title="Configurações"
          onClick={openPerfilModal}
        >
          <Settings className="h-5 w-5" />
        </button>

        {/* Avatar dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-neutral-25 transition-colors">
            {profile ? (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary font-semibold text-sm select-none">
                {initials}
              </div>
            ) : (
              <div className="h-8 w-8 shrink-0 rounded-full bg-neutral-100 animate-pulse" />
            )}
            {profile ? (
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-foreground leading-tight">{firstName}</p>
                <p className="text-[11px] text-muted-foreground leading-tight">{roleLabel}</p>
              </div>
            ) : (
              <div className="hidden md:block space-y-1">
                <div className="h-3 w-16 rounded bg-neutral-100 animate-pulse" />
                <div className="h-2 w-12 rounded bg-neutral-100 animate-pulse" />
              </div>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <UserMenuItems />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
