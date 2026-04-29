import { ChevronRight, ChevronLeft } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useSidebar } from '@/hooks/useSidebar'
import { NAV_LINKS } from './navLinks'

export function Sidebar() {
  const { isExpanded, toggleExpanded } = useSidebar()
  const { pathname } = useLocation()

  function isActive(href: string) {
    return href === '/' ? pathname === '/' : pathname.startsWith(href)
  }

  return (
    <aside className="hidden md:flex flex-col fixed top-14 left-0 bottom-0 bg-white border-r border-neutral-200 transition-all duration-200 lg:w-[240px] md:w-[64px] z-[10]">
      <nav className="flex-1 py-4 space-y-1 px-2 overflow-hidden">
        {NAV_LINKS.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            to={href}
            title={label}
            className={cn(
              'flex items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors',
              isActive(href)
                ? 'bg-primary-light text-primary font-medium'
                : 'text-neutral-600 hover:bg-neutral-100',
            )}
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span className="hidden lg:inline truncate">{label}</span>
          </Link>
        ))}
      </nav>

      <div className="hidden md:flex lg:hidden border-t border-neutral-200 p-2">
        <button
          onClick={toggleExpanded}
          className="w-full flex items-center justify-center p-2 rounded-md text-neutral-500 hover:bg-neutral-100"
          aria-label={isExpanded ? 'Recolher sidebar' : 'Expandir sidebar'}
        >
          {isExpanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  )
}
