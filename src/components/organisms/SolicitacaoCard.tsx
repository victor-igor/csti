import { StatusBadge } from '@/components/atoms/StatusBadge'
import type { ISolicitacao } from '@/types/domain'

interface SolicitacaoCardProps {
  solicitacao: ISolicitacao
}

export function SolicitacaoCard({ solicitacao }: SolicitacaoCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-xs text-muted-foreground">{solicitacao.numero}</p>
          <p className="mt-0.5 font-medium text-foreground truncate">{solicitacao.titulo}</p>
          {solicitacao.categoria && (
            <p className="mt-0.5 text-xs text-muted-foreground">{solicitacao.categoria}</p>
          )}
        </div>
        <StatusBadge status={solicitacao.status} />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {new Date(solicitacao.created_at).toLocaleDateString('pt-BR')}
      </p>
    </div>
  )
}
