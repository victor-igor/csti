import { StatusBadge } from '@/components/atoms/StatusBadge'
import { CurrencyDisplay } from '@/components/atoms/CurrencyDisplay'
import type { IOrcamento } from '@/types/domain'

interface OrcamentoCardProps {
  orcamento: IOrcamento
  valorTotal?: number | null
}

export function OrcamentoCard({ orcamento, valorTotal }: OrcamentoCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-xs text-muted-foreground">{orcamento.numero}</p>
          {orcamento.prazo_estimado_dias != null && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              Prazo: {orcamento.prazo_estimado_dias} dia{orcamento.prazo_estimado_dias !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1">
          <StatusBadge status={orcamento.status} />
          {valorTotal != null && (
            <CurrencyDisplay value={valorTotal} className="text-sm font-semibold text-foreground" />
          )}
        </div>
      </div>
    </div>
  )
}
