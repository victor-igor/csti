interface PageHeaderProps {
  title: string
  subtitle?: React.ReactNode
  /** Generic slot — use for custom action combos */
  actions?: React.ReactNode
  /** Primary CTA button rendered on the right */
  primaryAction?: React.ReactNode
  /** OverflowMenu node (⋮) placed after primaryAction */
  overflowMenu?: React.ReactNode
}

export function PageHeader({ title, subtitle, actions, primaryAction, overflowMenu }: PageHeaderProps) {
  const hasRight = actions || primaryAction || overflowMenu
  return (
    <div className="flex items-start justify-between gap-4 pb-4">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold text-neutral-800 truncate">{title}</h1>
        {subtitle && <div className="mt-0.5 text-sm text-muted-foreground">{subtitle}</div>}
      </div>
      {hasRight && (
        <div className="flex shrink-0 items-center gap-2">
          {actions}
          {primaryAction}
          {overflowMenu}
        </div>
      )}
    </div>
  )
}
