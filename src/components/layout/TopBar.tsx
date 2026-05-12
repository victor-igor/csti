// src/components/layout/TopBar.tsx
import { HelpCircle, Search, Settings } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { usePerfilModal } from '@/store/perfilModalStore'
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
}

export function TopBar() {
  const profile = useAuthStore((s) => s.profile)
  const openPerfilModal = usePerfilModal((s) => s.open)

  const initials = profile?.nome?.charAt(0).toUpperCase() ?? '?'
  const firstName = profile?.nome?.split(' ')[0] ?? ''
  const roleLabel = profile?.role ? ROLE_LABEL[profile.role as Role] : ''

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] h-14 bg-white border-b border-border flex items-center px-4 gap-4">
      {/* Spacer left (mobile) / left side (desktop) */}
      <div className="flex-1 md:flex-none md:w-[200px]" />

      {/* Search bar — centralizada, oculta no mobile */}
      <div className="hidden md:flex flex-1 justify-center">
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
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary font-semibold text-sm select-none">
              {initials}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-foreground leading-tight">{firstName}</p>
              <p className="text-[11px] text-muted-foreground leading-tight">{roleLabel}</p>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <UserMenuItems />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
