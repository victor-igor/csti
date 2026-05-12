import { ChevronRight } from 'lucide-react'
import { StatusBadge } from '@/components/atoms/StatusBadge'
import { UrgenciaBadge } from '@/components/atoms/UrgenciaBadge'
import { STATUS_BORDER_CLASS } from '@/lib/constants'
import { relativeDate, isNew } from '@/lib/dateUtils'
import type { ISolicitacao } from '@/types/domain'

interface SolicitacaoCardProps {
  solicitacao: ISolicitacao
  onClick: () => void
  variant?: 'cliente' | 'prestador'
}

export function SolicitacaoCard({ solicitacao, onClick, variant = 'cliente' }: SolicitacaoCardProps) {
  const borderClass = STATUS_BORDER_CLASS[solicitacao.status as keyof typeof STATUS_BORDER_CLASS] ?? 'border-l-neutral-200'
  const novo = isNew(solicitacao.created_at)

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      className={`group relative rounded-md border border-border border-l-4 ${borderClass} bg-white p-4 shadow-card cursor-pointer hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200`}
    >
      {novo && (
        <span
          data-testid="badge-novo"
          className="absolute top-3 right-8 h-2 w-2 rounded-full bg-success"
          aria-label="Novo"
        />
      )}

      <p className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider">
        {solicitacao.numero}
      </p>

      <p className="mt-0.5 text-sm font-semibold text-foreground leading-tight line-clamp-2 pr-6">
        {solicitacao.titulo}
      </p>

      {(solicitacao.categoria || solicitacao.equipamento) && (
        <div className="mt-1.5 flex items-center gap-2 flex-wrap">
          {solicitacao.categoria && (
            <span
              data-testid="categoria-chip"
              className="rounded-full bg-neutral-25 border border-border px-2 py-0.5 text-[10px] font-medium text-neutral-500 capitalize"
            >
              {solicitacao.categoria}
            </span>
          )}
          {solicitacao.equipamento && (
            <span className="text-xs text-muted-foreground truncate max-w-[180px]">
              {solicitacao.equipamento}
            </span>
          )}
        </div>
      )}

      {variant === 'prestador' && solicitacao.cliente_nome && (
        <p data-testid="cliente-nome" className="mt-1 text-xs text-muted-foreground">
          {solicitacao.cliente_nome}
        </p>
      )}

      {variant === 'prestador' && (solicitacao.urgencia || solicitacao.prazo_desejado) && (
        <div className="mt-1.5 flex items-center gap-2 flex-wrap">
          {solicitacao.urgencia && (
            <UrgenciaBadge urgencia={solicitacao.urgencia} />
          )}
          {solicitacao.prazo_desejado && (
            <span className="text-xs text-muted-foreground">
              Prazo: {new Date(solicitacao.prazo_desejado).toLocaleDateString('pt-BR')}
            </span>
          )}
        </div>
      )}

      <div className="mt-2 flex items-center gap-2 shrink-0 justify-end">
        <StatusBadge status={solicitacao.status} />
        <span className="text-[11px] text-muted-foreground">
          {relativeDate(solicitacao.created_at)}
        </span>
      </div>

      <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200" />
    </div>
  )
}
