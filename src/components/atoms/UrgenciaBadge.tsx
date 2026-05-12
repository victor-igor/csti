import { URGENCIA_CONFIG } from '@/lib/constants'

interface UrgenciaBadgeProps {
  urgencia: string | null | undefined
}

export function UrgenciaBadge({ urgencia }: UrgenciaBadgeProps) {
  if (!urgencia) return null
  const config = URGENCIA_CONFIG[urgencia]
  if (!config) return null

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  )
}
