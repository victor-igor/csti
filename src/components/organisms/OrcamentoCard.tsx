import { ChevronRight } from 'lucide-react'
import { StatusBadge } from '@/components/atoms/StatusBadge'
import { CurrencyDisplay } from '@/components/atoms/CurrencyDisplay'
import { relativeDate } from '@/lib/dateUtils'
import type { IOrcamento } from '@/types/domain'

const STATUS_BORDER: Record<string, string> = {
  rascunho:  'border-l-neutral-200',
  enviado:   'border-l-primary',
  aceito:    'border-l-success',
  recusado:  'border-l-danger',
}

interface OrcamentoCardProps {
  orcamento: IOrcamento
  valorTotal?: number | null
  onClick?: () => void
}

export function OrcamentoCard({ orcamento, valorTotal, onClick }: OrcamentoCardProps) {
  const borderClass = STATUS_BORDER[orcamento.status] ?? 'border-l-neutral-200'

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      className={`group relative rounded-md border border-border border-l-4 ${borderClass} bg-card p-4 shadow-card ${onClick ? 'cursor-pointer hover:shadow-card-hover hover:-translate-y-0.5' : ''} transition-all duration-200`}
    >
      <div className="pr-6">
        <p className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider">{orcamento.numero}</p>
        {orcamento.prazo_estimado_dias != null && (
          <p className="mt-0.5 text-xs text-muted-foreground">
            Prazo: {orcamento.prazo_estimado_dias} dia{orcamento.prazo_estimado_dias !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <StatusBadge status={orcamento.status} />
        <div className="flex items-center gap-2">
          {valorTotal != null && (
            <CurrencyDisplay value={valorTotal} className="text-sm font-semibold text-foreground" />
          )}
          <span className="text-[11px] text-muted-foreground">{relativeDate(orcamento.created_at)}</span>
        </div>
      </div>

      {onClick && (
        <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200" />
      )}
    </div>
  )
}
