import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

const MAX_WIDTH = {
  sm: 'max-w-sm mx-auto',
  md: 'max-w-md mx-auto',
  lg: 'max-w-lg mx-auto',
} as const

interface PageContainerProps {
  children: ReactNode
  maxWidth?: keyof typeof MAX_WIDTH
  className?: string
}

export function PageContainer({ children, maxWidth, className }: PageContainerProps) {
  return (
    <div className={cn('p-4 sm:p-6 space-y-6', maxWidth && MAX_WIDTH[maxWidth], className)}>
      {children}
    </div>
  )
}
