import { ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'

interface BaseCardProps {
  onClick?: () => void
  borderLeftClass?: string
  children: ReactNode
  className?: string
}

export function BaseCard({ onClick, borderLeftClass, children, className }: BaseCardProps) {
  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      className={[
        'group relative rounded-md border border-border bg-white p-4 shadow-card transition-all duration-200',
        borderLeftClass ? `border-l-4 ${borderLeftClass}` : '',
        onClick ? 'cursor-pointer hover:shadow-card-hover hover:-translate-y-0.5' : '',
        className ?? '',
      ].filter(Boolean).join(' ')}
    >
      {children}
      {onClick && (
        <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200" />
      )}
    </div>
  )
}
