import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useSidebar } from '@/hooks/useSidebar'
import { useNavLinks } from './useNavLinks'

export function MobileDrawer() {
  const { isDrawerOpen, closeDrawer } = useSidebar()
  const navLinks = useNavLinks()
  const { pathname } = useLocation()

  function isActive(href: string) {
    return href === '/' ? pathname === '/' : pathname.startsWith(href)
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 bg-black/40 z-[290] transition-opacity duration-200 lg:hidden',
          isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        className={cn(
          'fixed top-0 left-0 bottom-0 w-[280px] bg-white z-[300] transition-transform duration-200 lg:hidden flex flex-col',
          isDrawerOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="h-14 flex items-center px-4 border-b border-neutral-200">
          <span className="font-semibold text-primary">OrçaFácil</span>
        </div>

        <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
          {navLinks.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              to={href}
              onClick={closeDrawer}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors',
                isActive(href)
                  ? 'bg-primary-light text-primary font-medium'
                  : 'text-neutral-600 hover:bg-neutral-100',
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  )
}
