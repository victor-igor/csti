import { StatusBadge } from '@/components/atoms/StatusBadge'
import type { IOrdemServico } from '@/types/domain'

interface OrdemServicoCardProps {
  os: IOrdemServico
}

export function OrdemServicoCard({ os }: OrdemServicoCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-xs text-muted-foreground">{os.numero}</p>
          {os.data_inicio && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              Início: {new Date(os.data_inicio).toLocaleDateString('pt-BR')}
            </p>
          )}
        </div>
        <StatusBadge status={os.status} />
      </div>
    </div>
  )
}
