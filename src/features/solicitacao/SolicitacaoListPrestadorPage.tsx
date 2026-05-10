import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/molecules/PageHeader'
import { FilterBar } from '@/components/molecules/FilterBar'
import { SolicitacaoCard } from './components/SolicitacaoCard'
import { LoadingSkeleton } from '@/components/atoms/LoadingSkeleton'
import { EmptyState } from '@/components/atoms/EmptyState'
import { ErrorState } from '@/components/atoms/ErrorState'
import { useListSolicitacoesParaPrestador } from './useSolicitacao'

export default function SolicitacaoListPrestadorPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const { data = [], isLoading, isError, refetch } = useListSolicitacoesParaPrestador()

  const filtered = search
    ? data.filter(s =>
        s.titulo.toLowerCase().includes(search.toLowerCase()) ||
        s.numero.toLowerCase().includes(search.toLowerCase())
      )
    : data

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Solicitações Disponíveis" />

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        placeholder="Buscar por título ou número..."
        resultCount={filtered.length}
        totalCount={data.length}
      />

      {isLoading && <LoadingSkeleton rows={4} />}
      {isError && <ErrorState message="Erro ao carregar solicitações" onRetry={refetch} />}

      {!isLoading && !isError && filtered.length === 0 && (
        <EmptyState
          title="Nenhuma solicitação disponível"
          description="Novas solicitações aparecerão aqui quando clientes enviarem pedidos"
        />
      )}

      {!isLoading && !isError && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map(s => (
            <SolicitacaoCard
              key={s.id}
              solicitacao={s}
              variant="prestador"
              onClick={() => navigate(`/prestador/solicitacoes/${s.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
