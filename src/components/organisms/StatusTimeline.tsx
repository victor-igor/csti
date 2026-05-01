import { STATUS_LABELS } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface TimelineEntry {
  status_novo: string
  created_at: string
  alterado_por?: string | null
}

interface StatusTimelineProps {
  historico: TimelineEntry[]
}

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString))
}

export function StatusTimeline({ historico }: StatusTimelineProps) {
  if (historico.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhum histórico disponível.</p>
  }

  return (
    <ol className="flex flex-col">
      {historico.map((entry, i) => {
        const statusEntry = STATUS_LABELS[entry.status_novo as keyof typeof STATUS_LABELS]
        const isLast = i === historico.length - 1

        return (
          <li key={i} className="flex gap-3">
            {/* Dot + connector */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'mt-1 h-3 w-3 shrink-0 rounded-full border-2',
                  statusEntry?.className
                    ? 'border-current bg-current opacity-80'
                    : 'border-muted-foreground bg-muted-foreground',
                  statusEntry?.className,
                )}
              />
              {!isLast && <div className="mt-1 flex-1 w-px bg-border" />}
            </div>

            {/* Content */}
            <div className={cn('pb-4', isLast && 'pb-0')}>
              <p className="text-sm font-medium text-foreground">
                {statusEntry?.label ?? entry.status_novo}
              </p>
              <p className="text-xs text-muted-foreground">{formatDate(entry.created_at)}</p>
              {entry.alterado_por && (
                <p className="text-xs text-muted-foreground">por {entry.alterado_por}</p>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
