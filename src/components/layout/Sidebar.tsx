// src/components/layout/Sidebar.tsx
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useSidebar } from '@/hooks/useSidebar'
import { useNavGroups } from './useNavLinks'
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
  const navGroups = useNavGroups()

  function isActive(href: string) {
    return href === '/' ? pathname === '/' : pathname.startsWith(href)
  }

  const initials = profile?.nome?.charAt(0).toUpperCase() ?? '?'
  const roleLabel = profile?.role ? ROLE_LABEL[profile.role as Role] : ''

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col fixed top-0 left-0 bottom-0 bg-white border-r border-border transition-all duration-200 z-30 overflow-hidden',
        isExpanded ? 'w-[256px]' : 'w-[72px]',
      )}
    >
      {/* Branding section */}
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-3 shrink-0 w-full',
          !isExpanded && 'justify-center px-2',
        )}
      >
        {isExpanded ? (
          <>
            <img
              src="/logo+texto.png"
              alt="OrçaFácil"
              className="h-28 flex-1 min-w-0 object-contain object-left"
            />
            <button
              onClick={toggleExpanded}
              className="shrink-0 flex items-center justify-center h-8 w-8 rounded-md text-neutral-500 hover:bg-neutral-25 transition-colors"
              aria-label="Recolher sidebar"
              title="Recolher"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <img
              src="/logoiconroxo.png"
              alt="OrçaFácil"
              className="h-10 w-10 object-cover rounded-lg"
            />
            <button
              onClick={toggleExpanded}
              className="flex items-center justify-center h-6 w-6 rounded-md hover:bg-neutral-25 transition-colors"
              aria-label="Expandir sidebar"
              title="Expandir"
            >
              <ChevronRight className="h-4 w-4 text-neutral-500" />
            </button>
          </div>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 py-3 px-3 overflow-y-auto overflow-x-hidden">
        {navGroups.map((group, gi) => (
          <div key={group.label ?? `group-${gi}`} className={cn(gi > 0 && 'mt-4')}>
            {group.label && isExpanded && (
              <p className="px-3 mb-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                {group.label}
              </p>
            )}
            {group.label && !isExpanded && gi > 0 && (
              <div className="mx-3 mb-2 h-px bg-neutral-100" aria-hidden />
            )}
            <div className="space-y-1">
              {group.items.map(({ label, href, icon: Icon, badge }) => {
                const active = isActive(href)
                return (
                  <Link
                    key={href}
                    to={href}
                    title={!isExpanded ? label : undefined}
                    className={cn(
                      'relative flex items-center gap-4 rounded-md px-3 py-2.5 text-[16px] leading-6 transition-colors',
                      active
                        ? 'text-primary font-semibold'
                        : 'text-neutral-700 font-normal hover:bg-neutral-50 hover:text-foreground',
                      !isExpanded && 'justify-center px-2',
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-5 w-5 shrink-0',
                        active ? 'text-primary' : 'text-neutral-500',
                      )}
                      strokeWidth={active ? 2.25 : 1.75}
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
            </div>
          </div>
        ))}
      </nav>

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
