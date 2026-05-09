import { StatusBadge } from '@/components/atoms/StatusBadge'
import { relativeDate } from '@/lib/dateUtils'

interface ActivityItemProps {
  tabelaNome: string
  statusAnterior: string | null
  statusNovo: string
  createdAt: string
}

const TABELA_LABEL: Record<string, string> = {
  solicitacoes_orcamento: 'Solicitação',
  orcamentos: 'Orçamento',
  ordens_servico: 'OS',
}

export function ActivityItem({ tabelaNome, statusAnterior, statusNovo, createdAt }: ActivityItemProps) {
  const label = TABELA_LABEL[tabelaNome] ?? tabelaNome

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-neutral-100 last:border-0">
      <div className="h-2 w-2 rounded-full bg-primary/40 shrink-0 mt-0.5" />
      <div className="min-w-0 flex-1">
        <p className="text-sm text-neutral-700">
          <span className="font-medium">{label}</span>
          {statusAnterior && (
            <> mudou de <StatusBadge status={statusAnterior} /> para</>
          )}
          {' '}
          <StatusBadge status={statusNovo} />
        </p>
        <p className="text-xs text-neutral-400 mt-0.5">{relativeDate(createdAt)}</p>
      </div>
    </div>
  )
}
