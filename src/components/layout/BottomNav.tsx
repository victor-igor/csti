import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { NAV_LINKS } from './navLinks'

export function BottomNav() {
  const { pathname } = useLocation()

  function isActive(href: string) {
    return href === '/' ? pathname === '/' : pathname.startsWith(href)
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[200] bg-white border-t border-neutral-200 flex">
      {NAV_LINKS.map(({ label, href, icon: Icon }) => (
        <Link
          key={href}
          to={href}
          className={cn(
            'flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-[10px] transition-colors',
            isActive(href) ? 'text-primary' : 'text-neutral-500',
          )}
        >
          <Icon className="h-5 w-5" />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  )
}
