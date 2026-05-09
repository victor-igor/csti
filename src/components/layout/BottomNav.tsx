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
