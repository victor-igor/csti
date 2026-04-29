import { STATUS_LABELS } from '@/lib/constants'

interface StatusBadgeProps {
  status: string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const entry = STATUS_LABELS[status as keyof typeof STATUS_LABELS]
  const label = entry?.label ?? status
  const className = entry?.className ?? 'bg-neutral-100 text-neutral-600'

  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${className}`}>
      {label}
    </span>
  )
}
