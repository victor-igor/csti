import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import {
  useListOrcamentosPrestador,
  useListOrcamentosCliente,
} from '@/features/orcamento/useOrcamento'
import { PageHeader } from '@/components/molecules/PageHeader'
import { FilterBar } from '@/components/molecules/FilterBar'
import { OrcamentoCard } from '@/components/organisms/OrcamentoCard'
import { LoadingSkeleton } from '@/components/atoms/LoadingSkeleton'
import { EmptyState } from '@/components/atoms/EmptyState'
import { ErrorState } from '@/components/atoms/ErrorState'
import type { IOrcamento } from '@/types/domain'

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

function StatusChips({
  filters,
  active,
  onSelect,
}: {
  filters: { label: string; value: string }[]
  active: string
  onSelect: (v: string) => void
}) {
  return (
    <>
      {filters.map(f => (
        <button
          key={f.value}
          onClick={() => onSelect(f.value)}
          className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
            active === f.value
              ? 'bg-primary text-white border-primary'
              : 'bg-neutral-25 border-border text-neutral-500 hover:text-foreground hover:border-neutral-300'
          }`}
        >
          {f.label}
        </button>
      ))}
    </>
  )
}

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
  data: IOrcamento[]
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
        filters={<StatusChips filters={statusFilters} active={activeStatus} onSelect={setActiveStatus} />}
        resultCount={filtered.length}
        totalCount={data.length}
      />

      {isLoading && <LoadingSkeleton rows={4} />}
      {isError && <ErrorState message="Erro ao carregar orçamentos" onRetry={refetch} />}

      {!isLoading && !isError && filtered.length === 0 && (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      )}

      {!isLoading && !isError && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map(orc => (
            <OrcamentoCard
              key={orc.id}
              orcamento={orc}
              onClick={() => navigate(getPath(orc.id))}
            />
          ))}
        </div>
      )}
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
    <div className="p-6 space-y-6">
      <PageHeader title="Orçamentos" />
      {role === 'cliente' ? <OrcamentosCliente /> : <OrcamentosPrestador />}
    </div>
  )
}
