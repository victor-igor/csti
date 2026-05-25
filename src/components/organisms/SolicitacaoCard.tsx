import { ChevronRight, User } from 'lucide-react'
import { StatusBadge } from '@/components/atoms/StatusBadge'
import { relativeDate, isNew } from '@/lib/dateUtils'
import type { ISolicitacao } from '@/types/domain'

interface SolicitacaoCardProps {
  solicitacao: ISolicitacao
  onClick: () => void
  variant?: 'cliente' | 'prestador'
  /** Slot para OverflowMenu "⋮" — substitui o ChevronRight quando presente */
  overflowMenu?: React.ReactNode
}

export function SolicitacaoCard({ solicitacao, onClick, variant = 'cliente', overflowMenu }: SolicitacaoCardProps) {
  const novo = isNew(solicitacao.created_at)

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      className="group relative rounded-lg border border-border bg-white p-4 cursor-pointer hover:border-neutral-200 hover:shadow-card hover:-translate-y-0.5 transition-all duration-200"
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

      <p className="mt-0.5 text-sm font-semibold text-foreground leading-tight line-clamp-2 pr-10">
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
        <div data-testid="cliente-nome" className="mt-1.5 flex items-center gap-1.5">
          <User className="h-3 w-3 text-neutral-400 shrink-0" />
          <span className="text-xs text-muted-foreground">{solicitacao.cliente_nome}</span>
        </div>
      )}

      <div className="mt-2 flex items-center gap-2 shrink-0 justify-end flex-wrap">
        {solicitacao.urgencia && (
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
              solicitacao.urgencia === 'urgente'
                ? 'bg-red-100 text-red-700'
                : solicitacao.urgencia === 'media'
                ? 'bg-amber-100 text-amber-700'
                : 'bg-green-100 text-green-700'
            }`}
          >
            {solicitacao.urgencia === 'baixa' ? 'Baixa' : solicitacao.urgencia === 'media' ? 'Média' : 'Urgente'}
          </span>
        )}
        <StatusBadge status={solicitacao.status} />
        <span className="text-[11px] text-muted-foreground">
          {relativeDate(solicitacao.created_at)}
        </span>
      </div>

      {/* Overflow menu ou chevron */}
      <div
        className="absolute right-3 top-1/2 -translate-y-1/2"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        {overflowMenu ?? (
          <ChevronRight className="h-4 w-4 text-neutral-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200" />
        )}
      </div>
    </div>
  )
}
