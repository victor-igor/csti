import { STATUS_CONFIG } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { relativeDate } from '@/lib/dateUtils'

interface TimelineEntry {
  status_novo: string
  created_at: string
  observacao?: string | null
}

interface StatusTimelineProps {
  historico: TimelineEntry[]
}

export function StatusTimeline({ historico }: StatusTimelineProps) {
  if (historico.length === 0) return null

  return (
    <ol className="flex flex-col">
      {historico.map((entry, i) => {
        const config = STATUS_CONFIG[entry.status_novo]
        const isLast = i === historico.length - 1
        const Icon = config?.icon

        return (
          <li key={i} className="flex gap-3">
            {/* Dot + connector */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full',
                  isLast
                    ? config?.className ?? 'bg-neutral-25 text-neutral-500'
                    : 'bg-neutral-25 text-neutral-400',
                )}
              >
                {Icon && <Icon className="h-3 w-3" aria-hidden />}
              </div>
              {!isLast && <div className="mt-1 flex-1 w-px bg-border" />}
            </div>

            {/* Content */}
            <div className={cn('pb-4', isLast && 'pb-0')}>
              <p className={cn(
                'text-sm font-medium',
                isLast ? 'text-foreground' : 'text-muted-foreground',
              )}>
                {config?.label ?? entry.status_novo}
              </p>
              <p className="text-xs text-muted-foreground">{relativeDate(entry.created_at)}</p>
              {entry.observacao && (
                <p className="mt-0.5 text-xs text-muted-foreground italic">{entry.observacao}</p>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
