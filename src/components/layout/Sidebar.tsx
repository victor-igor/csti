// src/components/layout/Sidebar.tsx
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
        'hidden md:flex flex-col fixed top-14 left-0 bottom-0 bg-white border-r border-border transition-all duration-200 z-10 overflow-hidden',
        isExpanded ? 'w-[240px]' : 'w-[64px]',
      )}
    >
      {/* Branding section — fundo primary */}
      <div
        className={cn(
          'flex items-center gap-3 bg-primary px-4 py-3 shrink-0',
          !isExpanded && 'justify-center px-2',
        )}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white/10 text-white font-bold text-sm select-none">
          OF
        </div>
        {isExpanded && (
          <span className="font-semibold text-white text-base truncate">OrçaFácil</span>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 py-3 space-y-0.5 px-2 overflow-y-auto overflow-x-hidden">
        {navLinks.map(({ label, href, icon: Icon, badge }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              to={href}
              title={!isExpanded ? label : undefined}
              className={cn(
                'relative flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                active
                  ? 'bg-primary-light text-primary font-medium border-l-2 border-primary'
                  : 'text-neutral-500 hover:bg-neutral-25 hover:text-foreground',
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
          )
        })}
      </nav>

      {/* Collapse button */}
      <button
        onClick={toggleExpanded}
        className={cn(
          'mx-2 mb-1 flex items-center rounded-md px-3 py-2 text-neutral-500 hover:bg-neutral-25 transition-colors text-sm shrink-0',
          !isExpanded && 'justify-center px-2',
        )}
        aria-label={isExpanded ? 'Recolher sidebar' : 'Expandir sidebar'}
      >
        {isExpanded ? (
          <>
            <ChevronLeft className="h-4 w-4 shrink-0" />
            <span className="ml-3 text-sm">Recolher</span>
          </>
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </button>

      {/* User section */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              'flex items-center gap-3 p-4 border-t border-border w-full hover:bg-neutral-25 transition-colors text-left shrink-0',
              !isExpanded && 'justify-center px-2',
            )}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary font-semibold text-sm select-none">
              {initials}
            </div>
            {isExpanded && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{profile?.nome}</p>
                <p className="text-[11px] text-muted-foreground">{roleLabel}</p>
              </div>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="start" className="w-48">
          <DropdownMenuItem asChild>
            <Link to="/perfil">Meu Perfil</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-danger focus:text-danger">
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </aside>
  )
}
