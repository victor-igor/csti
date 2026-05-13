import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import {
  useListOrcamentosPrestador,
  useListOrcamentosCliente,
  type IOrcamentoComTotal,
} from '@/features/orcamento/useOrcamento'
import { PageHeader } from '@/components/molecules/PageHeader'
import { FilterBar } from '@/components/molecules/FilterBar'
import { StatusFilterChips } from '@/components/molecules/StatusFilterChips'
import { OrcamentoCard } from '@/components/organisms/OrcamentoCard'
import { LoadingSkeleton } from '@/components/atoms/LoadingSkeleton'
import { EmptyState } from '@/components/atoms/EmptyState'
import { ErrorState } from '@/components/atoms/ErrorState'

const CLIENTE_STATUS_FILTERS = [
  { label: 'Todos',    value: '' },
  { label: 'Enviado',  value: 'enviado' },
  { label: 'Aceito',   value: 'aceito' },
  { label: 'Recusado', value: 'recusado' },
]

const PRESTADOR_STATUS_FILTERS = [
  { label: 'Todos',     value: '' },
  { label: 'Rascunho',  value: 'rascunho' },
  { label: 'Enviado',   value: 'enviado' },
  { label: 'Aceito',    value: 'aceito' },
  { label: 'Recusado',  value: 'recusado' },
]


function OrcamentosList({
  data,
  isLoading,
  isError,
  refetch,
  getPath,
  emptyTitle,
  emptyDescription,
  statusFilters,
}: {
  data: IOrcamentoComTotal[]
  isLoading: boolean
  isError: boolean
  refetch: () => void
  getPath: (id: string) => string
  emptyTitle: string
  emptyDescription: string
  statusFilters: { label: string; value: string }[]
}) {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [activeStatus, setActiveStatus] = useState('')

  const filtered = data
    .filter(o => !activeStatus || o.status === activeStatus)
    .filter(o =>
      !search ||
      o.numero.toLowerCase().includes(search.toLowerCase())
    )

  return (
    <div className="space-y-6">
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        placeholder="Buscar por número..."
        filters={<StatusFilterChips filters={statusFilters} active={activeStatus} onSelect={setActiveStatus} />}
        resultCount={filtered.length}
        totalCount={data.length}
      />

      {isLoading && <LoadingSkeleton rows={4} />}
      {isError && <ErrorState message="Não foi possível carregar os orçamentos. Verifique sua conexão e tente novamente." onRetry={refetch} />}

      {!isLoading && !isError && filtered.length === 0 && (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      )}

      {!isLoading && !isError && filtered.length > 0 && (
        <div className="grid grid-cols-1 gap-3">
          {filtered.map(orc => {
            const valorTotal = orc.itens_orcamento?.reduce(
              (sum, i) => sum + (i.quantidade ?? 0) * (i.valor_unitario ?? 0), 0
            ) ?? null
            return (
              <OrcamentoCard
                key={orc.id}
                orcamento={orc}
                valorTotal={valorTotal}
                onClick={() => navigate(getPath(orc.id))}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

function OrcamentosCliente() {
  const { data = [], isLoading, isError, refetch } = useListOrcamentosCliente()
  return (
    <OrcamentosList
      data={data}
      isLoading={isLoading}
      isError={isError}
      refetch={refetch}
      getPath={(id) => `/orcamentos/${id}/revisar`}
      emptyTitle="Nenhum orçamento recebido"
      emptyDescription="Os orçamentos enviados pelos prestadores aparecerão aqui"
      statusFilters={CLIENTE_STATUS_FILTERS}
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
      emptyDescription="Crie orçamentos a partir das solicitações disponíveis"
      statusFilters={PRESTADOR_STATUS_FILTERS}
    />
  )
}

export default function OrcamentosPage() {
  const role = useAuthStore((s) => s.profile?.role)

  return (
    <div className="p-6 max-w-5xl space-y-6">
      <PageHeader
        title="Orçamentos"
        subtitle={role === 'cliente' ? 'Orçamentos recebidos dos prestadores' : 'Orçamentos criados para seus clientes'}
      />
      {role === 'cliente' ? <OrcamentosCliente /> : <OrcamentosPrestador />}
    </div>
  )
}
