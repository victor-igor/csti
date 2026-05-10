import { Link } from 'react-router-dom'
import { useBreadcrumb } from '@/hooks/useBreadcrumb'

export function Breadcrumb() {
  const items = useBreadcrumb()

  if (items.length <= 1) return null

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && (
            <span className="text-neutral-300 select-none" aria-hidden>/</span>
          )}
          {item.href ? (
            <Link
              to={item.href}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
