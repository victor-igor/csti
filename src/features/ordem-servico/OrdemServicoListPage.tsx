import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/molecules/PageHeader'
import { FilterBar } from '@/components/molecules/FilterBar'
import { StatusFilterChips } from '@/components/molecules/StatusFilterChips'
import { OrdemServicoCard } from '@/components/organisms/OrdemServicoCard'
import { LoadingSkeleton } from '@/components/atoms/LoadingSkeleton'
import { EmptyState } from '@/components/atoms/EmptyState'
import { ErrorState } from '@/components/atoms/ErrorState'
import { useAuthStore } from '@/store/authStore'
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
  const role = useAuthStore((s) => s.profile?.role)
  const isPrestador = role === 'prestador'

  const [search, setSearch] = useState('')
  const [activeStatus, setActiveStatus] = useState<OSStatus | ''>('')

  const { data = [], isLoading, isError, refetch } = useListOrdensServico(
    activeStatus ? { status: activeStatus } : undefined,
  )

  const filtered = search
    ? data.filter(os => os.numero.toLowerCase().includes(search.toLowerCase()))
    : data

  const emptyDescription = search
    ? 'Tente outros termos de busca'
    : isPrestador
      ? 'As ordens de serviço aparecerão aqui quando um cliente aprovar seu orçamento'
      : 'As ordens de serviço serão criadas automaticamente quando um orçamento for aprovado'

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Ordens de Serviço"
        subtitle={isPrestador ? 'Serviços em execução' : 'Acompanhe seus serviços'}
      />

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        placeholder="Buscar por número..."
        filters={
          <StatusFilterChips
            filters={STATUS_FILTERS}
            active={activeStatus}
            onSelect={(v) => setActiveStatus(v as OSStatus | '')}
          />
        }
        resultCount={filtered.length}
        totalCount={data.length}
      />

      {isLoading && <LoadingSkeleton rows={4} />}
      {isError && <ErrorState message="Não foi possível carregar as ordens de serviço. Verifique sua conexão e tente novamente." onRetry={refetch} />}

      {!isLoading && !isError && filtered.length === 0 && (
        <EmptyState
          title="Nenhuma ordem de serviço encontrada"
          description={emptyDescription}
        />
      )}

      {!isLoading && !isError && filtered.length > 0 && (
        <div className="grid grid-cols-1 gap-3">
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
