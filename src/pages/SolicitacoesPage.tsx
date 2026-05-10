import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useListSolicitacoes } from '@/features/solicitacao/useSolicitacao'
import { SolicitacaoCard } from '@/features/solicitacao/components/SolicitacaoCard'
import { PageHeader } from '@/components/molecules/PageHeader'
import { FilterBar } from '@/components/molecules/FilterBar'
import { LoadingSkeleton } from '@/components/atoms/LoadingSkeleton'
import { EmptyState } from '@/components/atoms/EmptyState'
import { ErrorState } from '@/components/atoms/ErrorState'
import type { SolicitacaoStatus } from '@/types/domain'

const STATUS_FILTERS: { label: string; value: SolicitacaoStatus | 'todos' }[] = [
  { label: 'Todos',        value: 'todos' },
  { label: 'Aguardando',   value: 'aguardando_orcamento' },
  { label: 'Orç. Enviado', value: 'orcamento_enviado' },
  { label: 'Aprovado',     value: 'aprovado' },
  { label: 'Cancelado',    value: 'cancelado' },
]

export default function SolicitacoesPage() {
  const navigate = useNavigate()
  const [activeFilter, setActiveFilter] = useState<SolicitacaoStatus | 'todos'>('todos')
  const [search, setSearch] = useState('')

  const filters = activeFilter !== 'todos' ? { status: activeFilter } : undefined
  const { data = [], isLoading, isError, refetch } = useListSolicitacoes(filters)

  const filtered = search
    ? data.filter(s =>
        s.titulo.toLowerCase().includes(search.toLowerCase()) ||
        s.numero.toLowerCase().includes(search.toLowerCase())
      )
    : data

  const statusChips = (
    <>
      {STATUS_FILTERS.map(f => (
        <button
          key={f.value}
          onClick={() => setActiveFilter(f.value)}
          className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
            activeFilter === f.value
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
      <PageHeader
        title="Minhas Solicitações"
        actions={
          <button
            onClick={() => navigate('/solicitacoes/nova')}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Nova Solicitação
          </button>
        }
      />

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        placeholder="Buscar por número ou título..."
        filters={statusChips}
        resultCount={filtered.length}
        totalCount={data.length}
      />

      {isLoading && <LoadingSkeleton rows={4} />}
      {isError && <ErrorState message="Erro ao carregar solicitações" onRetry={refetch} />}

      {!isLoading && !isError && filtered.length === 0 && (
        <EmptyState
          title="Nenhuma solicitação encontrada"
          description={search ? 'Tente outros termos de busca' : 'Crie sua primeira solicitação de orçamento'}
        />
      )}

      {!isLoading && !isError && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map(s => (
            <SolicitacaoCard
              key={s.id}
              solicitacao={s}
              onClick={() => navigate(`/solicitacoes/${s.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
