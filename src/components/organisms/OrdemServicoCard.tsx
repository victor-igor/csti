import { ChevronRight } from 'lucide-react'
import { StatusBadge } from '@/components/atoms/StatusBadge'
import { relativeDate } from '@/lib/dateUtils'
import type { IOrdemServico } from '@/types/domain'

const STATUS_BORDER: Record<string, string> = {
  aberta:       'border-l-warning',
  em_andamento: 'border-l-primary',
  concluida:    'border-l-success',
  cancelada:    'border-l-neutral-200',
}

interface OrdemServicoCardProps {
  os: IOrdemServico
  onClick?: () => void
}

export function OrdemServicoCard({ os, onClick }: OrdemServicoCardProps) {
  const borderClass = STATUS_BORDER[os.status] ?? 'border-l-neutral-200'

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      className={`group relative rounded-md border border-border border-l-4 ${borderClass} bg-card p-4 shadow-card ${onClick ? 'cursor-pointer hover:shadow-card-hover hover:-translate-y-0.5' : ''} transition-all duration-200`}
    >
      <div className="pr-6">
        <p className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider">{os.numero}</p>
        {os.data_inicio && (
          <p className="mt-0.5 text-xs text-muted-foreground">
            Início: {new Date(os.data_inicio).toLocaleDateString('pt-BR')}
          </p>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <StatusBadge status={os.status} />
        <span className="text-[11px] text-muted-foreground">{relativeDate(os.created_at)}</span>
      </div>

      {onClick && (
        <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200" />
      )}
    </div>
  )
}
