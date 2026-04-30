import { StatusBadge } from '@/components/atoms/StatusBadge'
import type { ISolicitacao } from '@/types/domain'

interface SolicitacaoCardProps {
  solicitacao: ISolicitacao
  onClick: () => void
}

export function SolicitacaoCard({ solicitacao, onClick }: SolicitacaoCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      className="rounded-lg border border-neutral-200 p-4 cursor-pointer hover:bg-neutral-50 transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-xs text-neutral-500 mb-1">{solicitacao.numero}</p>
          <p className="font-medium text-neutral-800 truncate">{solicitacao.titulo}</p>
        </div>
        <StatusBadge status={solicitacao.status} />
      </div>
      <p className="mt-2 text-xs text-neutral-400">
        {new Date(solicitacao.created_at).toLocaleDateString('pt-BR')}
      </p>
    </div>
  )
}
