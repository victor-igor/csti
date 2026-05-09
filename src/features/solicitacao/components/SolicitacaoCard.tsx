import { ChevronRight } from 'lucide-react'
import { StatusBadge } from '@/components/atoms/StatusBadge'
import { STATUS_BORDER_CLASS } from '@/lib/constants'
import { relativeDate, isNew } from '@/lib/dateUtils'
import type { ISolicitacao } from '@/types/domain'

interface SolicitacaoCardProps {
  solicitacao: ISolicitacao
  onClick: () => void
  variant?: 'cliente' | 'prestador'
}

export function SolicitacaoCard({ solicitacao, onClick, variant: _variant = 'cliente' }: SolicitacaoCardProps) {
  const borderClass = STATUS_BORDER_CLASS[solicitacao.status as keyof typeof STATUS_BORDER_CLASS] ?? 'border-l-neutral-300'
  const novo = isNew(solicitacao.created_at)

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      className={`group relative rounded-2xl border border-neutral-100 border-l-4 ${borderClass} bg-white p-4 shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}
    >
      {novo && (
        <span
          data-testid="badge-novo"
          className="absolute top-3 right-8 h-2 w-2 rounded-full bg-green-500"
          aria-label="Novo"
        />
      )}

      {/* Linha 1: Título */}
      <p className="font-semibold text-neutral-900 leading-tight line-clamp-2 pr-6">
        {solicitacao.titulo}
      </p>

      {/* Linha 2: Categoria + Equipamento */}
      {(solicitacao.categoria || solicitacao.equipamento) && (
        <div className="mt-1.5 flex items-center gap-2 flex-wrap">
          {solicitacao.categoria && (
            <span
              data-testid="categoria-chip"
              className="rounded-md bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-600 capitalize"
            >
              {solicitacao.categoria}
            </span>
          )}
          {solicitacao.equipamento && (
            <span className="text-xs text-neutral-500 truncate max-w-[180px]">
              {solicitacao.equipamento}
            </span>
          )}
        </div>
      )}

      {/* Linha 3: Número + Status + Data */}
      <div className="mt-3 flex items-center gap-2">
        <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider shrink-0">
          {solicitacao.numero}
        </span>
        <div className="ml-auto flex items-center gap-2 shrink-0">
          <StatusBadge status={solicitacao.status} />
          <span className="text-[11px] text-neutral-500">
            {relativeDate(solicitacao.created_at)}
          </span>
        </div>
      </div>

      {/* Indicador de navegação — sempre visível em mobile */}
      <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200" />
    </div>
  )
}
