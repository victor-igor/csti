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
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-[200] bg-white border-t border-border flex items-center justify-around h-16"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)', height: 'calc(4rem + env(safe-area-inset-bottom, 0px))' }}
    >
      {navLinks.map(({ label, href, icon: Icon, badge }) => {
        const active = isActive(href)
        return (
          <Link
            key={href}
            to={href}
            className="relative flex-1 flex flex-col items-center justify-center h-full"
          >
            {badge ? (
              <span className="absolute top-2 left-1/2 translate-x-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-danger px-0.5 text-[10px] font-bold text-white z-10">
                {badge > 9 ? '9+' : badge}
              </span>
            ) : null}

            <div className={cn(
              'flex items-center justify-center rounded-full px-4 py-1.5 transition-all duration-300',
              active ? 'bg-primary-light' : '',
            )}>
              <Icon className={cn(
                'h-5 w-5 transition-transform duration-300',
                active ? 'text-primary scale-110' : 'text-neutral-500',
              )} />
            </div>

            <span className={cn(
              'text-[10px] transition-all duration-300 mt-0.5',
              active ? 'font-semibold text-primary' : 'font-medium text-neutral-500 opacity-70',
            )}>
              {label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
