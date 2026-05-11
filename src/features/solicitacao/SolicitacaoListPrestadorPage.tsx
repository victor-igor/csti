import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/molecules/PageHeader'
import { FilterBar } from '@/components/molecules/FilterBar'
import { StatusFilterChips } from '@/components/molecules/StatusFilterChips'
import { SolicitacaoCard } from './components/SolicitacaoCard'
import { LoadingSkeleton } from '@/components/atoms/LoadingSkeleton'
import { EmptyState } from '@/components/atoms/EmptyState'
import { ErrorState } from '@/components/atoms/ErrorState'
import { useListSolicitacoesParaPrestador } from './useSolicitacao'
import { CATEGORIAS } from './solicitacaoSchemas'

export default function SolicitacaoListPrestadorPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [activeCategoria, setActiveCategoria] = useState<string>('')
  const { data = [], isLoading, isError, refetch } = useListSolicitacoesParaPrestador()

  const CATEGORIA_FILTERS = [
    { label: 'Todas', value: '' as const },
    ...CATEGORIAS.map((c) => ({
      label: c.charAt(0).toUpperCase() + c.slice(1),
      value: c as string,
    })),
  ]

  const filtered = data.filter((s) => {
    const matchesSearch =
      !search ||
      s.titulo.toLowerCase().includes(search.toLowerCase()) ||
      s.numero.toLowerCase().includes(search.toLowerCase())
    const matchesCategoria = !activeCategoria || s.categoria === activeCategoria
    return matchesSearch && matchesCategoria
  })

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Solicitações Disponíveis" />

      <div className="flex flex-wrap gap-2">
        <StatusFilterChips
          filters={CATEGORIA_FILTERS}
          active={activeCategoria}
          onSelect={setActiveCategoria}
        />
      </div>

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
