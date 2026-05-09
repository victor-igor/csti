import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useListOrcamentosPrestador, useListOrcamentosCliente } from '@/features/orcamento/useOrcamento'
import { PageHeader } from '@/components/molecules/PageHeader'
import { StatusBadge } from '@/components/atoms/StatusBadge'
import { LoadingSkeleton } from '@/components/atoms/LoadingSkeleton'
import { EmptyState } from '@/components/atoms/EmptyState'
import { ErrorState } from '@/components/atoms/ErrorState'
import { relativeDate } from '@/lib/dateUtils'
import type { IOrcamento } from '@/types/domain'

interface OrcamentosListProps {
  data: IOrcamento[]
  isLoading: boolean
  isError: boolean
  refetch: () => void
  getPath: (id: string) => string
  emptyTitle: string
  emptyDescription: string
}

function OrcamentosList({ data, isLoading, isError, refetch, getPath, emptyTitle, emptyDescription }: OrcamentosListProps) {
  const navigate = useNavigate()

  if (isLoading) return <LoadingSkeleton rows={4} />
  if (isError) return <ErrorState message="Erro ao carregar orçamentos" onRetry={refetch} />
  if (data.length === 0) return (
    <EmptyState title={emptyTitle} description={emptyDescription} />
  )

  return (
    <div className="space-y-3">
      {data.map((orc) => (
        <div
          key={orc.id}
          role="button"
          tabIndex={0}
          onClick={() => navigate(getPath(orc.id))}
          onKeyDown={(e) => e.key === 'Enter' && navigate(getPath(orc.id))}
          className="flex items-center gap-4 rounded-xl border border-neutral-100 bg-white px-4 py-3 shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
        >
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider">{orc.numero}</p>
            {'solicitacoes_orcamento' in orc && (orc as any).solicitacoes_orcamento?.titulo ? (
              <p className="text-sm font-medium text-neutral-800 truncate mt-0.5">
                {(orc as any).solicitacoes_orcamento.titulo}
              </p>
            ) : orc.prazo_estimado_dias != null ? (
              <p className="text-xs text-neutral-500 mt-0.5">Prazo: {orc.prazo_estimado_dias} dia(s)</p>
            ) : null}
          </div>
          <div className="shrink-0 flex flex-col items-end gap-1">
            <StatusBadge status={orc.status} />
            <span className="text-[11px] text-neutral-400">{relativeDate(orc.created_at)}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function OrcamentosCliente() {
  const { data = [], isLoading, isError, refetch } = useListOrcamentosCliente()
  return (
    <OrcamentosList
      data={data as IOrcamento[]}
      isLoading={isLoading}
      isError={isError}
      refetch={refetch}
      getPath={(id) => `/orcamentos/${id}/revisar`}
      emptyTitle="Nenhum orçamento recebido"
      emptyDescription="Quando prestadores enviarem orçamentos para suas solicitações, eles aparecerão aqui."
    />
  )
}

function OrcamentosPrestador() {
  const { data = [], isLoading, isError, refetch } = useListOrcamentosPrestador()
  return (
    <OrcamentosList
      data={data}
      isLoading={isLoading}
      isError={isError}
      refetch={refetch}
      getPath={(id) => `/prestador/orcamentos/${id}`}
      emptyTitle="Nenhum orçamento criado"
      emptyDescription="Acesse as solicitações disponíveis para começar a enviar orçamentos."
    />
  )
}

export default function OrcamentosPage() {
  const profile = useAuthStore((s) => s.profile)
  const isPrestador = profile?.role === 'prestador'

  return (
    <div className="p-6">
      <PageHeader title="Orçamentos" />
      <div className="mt-6">
        {isPrestador ? <OrcamentosPrestador /> : <OrcamentosCliente />}
      </div>
    </div>
  )
}
