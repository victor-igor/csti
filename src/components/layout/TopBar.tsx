// src/components/layout/TopBar.tsx
import { Bell } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { useNotificacoesNaoLidas } from '@/features/notificacoes/useNotificacoes'
import { Breadcrumb } from '@/components/molecules/Breadcrumb'
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

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] h-14 bg-white border-b border-border flex items-center justify-between px-4 gap-4">
      {/* Breadcrumb (desktop only) */}
      <div className="hidden md:flex flex-1 min-w-0">
        <Breadcrumb />
      </div>

      {/* Spacer mobile */}
      <div className="flex-1 md:hidden" />

      {/* Ações direita */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Bell — aponta para /notificacoes (P2; cai no redirect caso não exista) */}
        <Link
          to="/notificacoes"
          className="relative p-2 rounded-lg transition-colors hover:bg-neutral-25"
          aria-label="Notificações"
          title="Notificações (em breve)"
        >
          <Bell
            className={notifCount > 0 ? 'h-5 w-5 text-foreground' : 'h-5 w-5 text-neutral-500'}
          />
          {notifCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-danger px-0.5 text-[10px] font-bold text-white">
              {notifCount > 9 ? '9+' : notifCount}
            </span>
          )}
        </Link>

        {/* Avatar dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-neutral-25 transition-colors">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary font-semibold text-sm select-none">
                {initials}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-foreground leading-tight">{firstName}</p>
                <p className="text-[11px] text-muted-foreground leading-tight">{roleLabel}</p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link to="/perfil">Meu Perfil</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-danger focus:text-danger">
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
