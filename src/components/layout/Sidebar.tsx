// src/components/layout/Sidebar.tsx
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useSidebar } from '@/hooks/useSidebar'
import { useNavLinks } from './useNavLinks'
import { useAuthStore } from '@/store/authStore'
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

export function Sidebar() {
  const { isExpanded, toggleExpanded } = useSidebar()
  const { pathname } = useLocation()
  const profile = useAuthStore((s) => s.profile)
  const navLinks = useNavLinks()

  function isActive(href: string) {
    return href === '/' ? pathname === '/' : pathname.startsWith(href)
  }

  const initials = profile?.nome?.charAt(0).toUpperCase() ?? '?'
  const roleLabel = profile?.role ? ROLE_LABEL[profile.role as Role] : ''

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col fixed top-14 left-0 bottom-0 bg-white border-r border-border transition-all duration-200 z-10 overflow-hidden',
        isExpanded ? 'w-[256px]' : 'w-[72px]',
      )}
    >
      {/* Branding section */}
      <div
        className={cn(
          'flex items-center px-4 py-3 shrink-0',
          !isExpanded && 'justify-center px-2',
        )}
      >
        {isExpanded ? (
          <img
            src="/logo+texto.png"
            alt="OrçaFácil"
            className="h-12 w-full max-w-[200px] object-cover object-center"
          />
        ) : (
          <img
            src="/logoiconroxo.png"
            alt="OrçaFácil"
            className="h-10 w-10 object-cover rounded-md"
          />
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 py-2 space-y-1 px-3 overflow-y-auto overflow-x-hidden">
        {navLinks.map(({ label, href, icon: Icon, badge }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              to={href}
              title={!isExpanded ? label : undefined}
              className={cn(
                'relative flex items-center gap-3 rounded-md px-3 py-2.5 text-[15px] transition-colors',
                active
                  ? 'text-primary font-semibold'
                  : 'text-neutral-700 hover:bg-neutral-50 hover:text-foreground',
                !isExpanded && 'justify-center px-2',
              )}
            >
              <Icon
                className={cn(
                  'h-5 w-5 shrink-0',
                  active ? 'text-primary' : 'text-neutral-500',
                )}
              />
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
        <DropdownMenuTrigger
          className={cn(
            'flex items-center gap-3 p-4 w-full hover:bg-neutral-50 transition-colors text-left shrink-0',
            !isExpanded && 'justify-center px-2',
          )}
        >
          {profile ? (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary font-semibold text-sm select-none">
              {initials}
            </div>
          ) : (
            <div className="h-8 w-8 shrink-0 rounded-full bg-neutral-100 animate-pulse" />
          )}
          {isExpanded && (
            profile ? (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{profile.nome}</p>
                <p className="text-[11px] text-muted-foreground">{roleLabel}</p>
              </div>
            ) : (
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="h-3 w-24 rounded bg-neutral-100 animate-pulse" />
                <div className="h-2 w-16 rounded bg-neutral-100 animate-pulse" />
              </div>
            )
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="start" className="w-48">
          <UserMenuItems />
        </DropdownMenuContent>
      </DropdownMenu>
    </aside>
  )
}
