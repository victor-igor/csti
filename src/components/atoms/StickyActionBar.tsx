import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface StickyActionBarProps {
  children: ReactNode
  className?: string
}

export function StickyActionBar({ children, className }: StickyActionBarProps) {
  return (
    <div
      data-testid="sticky-action-bar"
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40',
        'flex gap-3 bg-white border-t border-neutral-200 p-4',
        'md:hidden',
        className,
      )}
    >
      {children}
    </div>
  )
}
