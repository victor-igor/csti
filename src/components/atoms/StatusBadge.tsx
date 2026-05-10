import { STATUS_CONFIG } from '@/lib/constants'

interface StatusBadgeProps {
  status: string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const entry = STATUS_CONFIG[status]

  if (!entry) {
    return (
      <span className="rounded-full bg-neutral-25 px-2 py-0.5 text-xs font-medium text-neutral-500">
        {status}
      </span>
    )
  }

  const { label, icon: Icon, className } = entry

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${className}`}>
      <Icon className="h-3 w-3 shrink-0" aria-hidden />
      {label}
    </span>
  )
}
