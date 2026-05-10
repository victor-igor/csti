import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/molecules/PageHeader'
import { FilterBar } from '@/components/molecules/FilterBar'
import { OrdemServicoCard } from '@/components/organisms/OrdemServicoCard'
import { LoadingSkeleton } from '@/components/atoms/LoadingSkeleton'
import { EmptyState } from '@/components/atoms/EmptyState'
import { ErrorState } from '@/components/atoms/ErrorState'
import type { OSStatus } from '@/types/domain'
import { useListOrdensServico } from './useOrdemServico'

const STATUS_FILTERS: { label: string; value: OSStatus | '' }[] = [
  { label: 'Todos',        value: '' },
  { label: 'Aberta',       value: 'aberta' },
  { label: 'Em Andamento', value: 'em_andamento' },
  { label: 'Concluída',    value: 'concluida' },
  { label: 'Cancelada',    value: 'cancelada' },
]

export default function OrdemServicoListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [activeStatus, setActiveStatus] = useState<OSStatus | ''>('')

  const { data = [], isLoading, isError, refetch } = useListOrdensServico(
    activeStatus ? { status: activeStatus } : undefined,
  )

  const filtered = search
    ? data.filter(os =>
        os.numero.toLowerCase().includes(search.toLowerCase())
      )
    : data

  const statusChips = (
    <>
      {STATUS_FILTERS.map(f => (
        <button
          key={f.value}
          onClick={() => setActiveStatus(f.value as OSStatus | '')}
          className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
            activeStatus === f.value
              ? 'bg-primary text-white border-primary'
              : 'bg-neutral-25 border-border text-neutral-500 hover:text-foreground hover:border-neutral-300'
          }`}
        >
          {f.label}
        </button>
      ))}
    </>
  )

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Ordens de Serviço" />

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        placeholder="Buscar por número..."
        filters={statusChips}
        resultCount={filtered.length}
        totalCount={data.length}
      />

      {isLoading && <LoadingSkeleton rows={4} />}
      {isError && <ErrorState message="Erro ao carregar ordens de serviço" onRetry={refetch} />}

      {!isLoading && !isError && filtered.length === 0 && (
        <EmptyState
          title="Nenhuma ordem de serviço encontrada"
          description={search ? 'Tente outros termos de busca' : 'As ordens de serviço serão criadas automaticamente quando um orçamento for aprovado'}
        />
      )}

      {!isLoading && !isError && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map(os => (
            <OrdemServicoCard
              key={os.id}
              os={os}
              onClick={() => navigate(`/ordens-servico/${os.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
