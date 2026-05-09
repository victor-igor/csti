import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

interface DashboardSectionProps {
  title: string
  icon: ReactNode
  children: ReactNode
  viewAllTo?: string
  viewAllLabel?: string
}

export function DashboardSection({ title, icon, children, viewAllTo, viewAllLabel = 'Ver tudo' }: DashboardSectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
          {icon}
          {title}
        </h2>
        {viewAllTo && (
          <Link
            to={viewAllTo}
            className="text-xs font-medium text-primary hover:underline"
          >
            {viewAllLabel}
          </Link>
        )}
      </div>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  )
}
