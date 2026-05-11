import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ListPageShell } from '@/components/molecules/ListPageShell'
import { StatusFilterChips } from '@/components/molecules/StatusFilterChips'
import { SolicitacaoCard } from '@/components/organisms/SolicitacaoCard'
import { LoadingSkeleton } from '@/components/atoms/LoadingSkeleton'
import { EmptyState } from '@/components/atoms/EmptyState'
import { ErrorState } from '@/components/atoms/ErrorState'
import { useListSolicitacoes } from '@/features/solicitacao/useSolicitacao'
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

  const abertas = data.filter(s => s.status !== 'cancelado').length
  const subtitle = abertas > 0
    ? `${abertas} solicitaç${abertas === 1 ? 'ão aberta' : 'ões abertas'}`
    : undefined

  if (isLoading) return <div className="p-4 sm:p-6"><LoadingSkeleton rows={4} /></div>
  if (isError) return <div className="p-4 sm:p-6"><ErrorState message="Erro ao carregar solicitações" onRetry={refetch} /></div>

  return (
    <ListPageShell
      title="Minhas Solicitações"
      subtitle={subtitle}
      actions={
        <button
          onClick={() => navigate('/solicitacoes/nova')}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Nova Solicitação
        </button>
      }
      filters={
        <StatusFilterChips
          filters={STATUS_FILTERS}
          active={activeFilter}
          onSelect={setActiveFilter}
        />
      }
      search={search}
      onSearchChange={setSearch}
      searchPlaceholder="Buscar por número ou título..."
      resultCount={filtered.length}
      totalCount={data.length}
    >
      {filtered.length === 0 ? (
        <div className="col-span-full">
          <EmptyState
            title="Nenhuma solicitação encontrada"
            description={search ? 'Tente outros termos de busca' : 'Crie sua primeira solicitação de orçamento'}
          />
        </div>
      ) : (
        filtered.map(s => (
          <SolicitacaoCard
            key={s.id}
            solicitacao={s}
            onClick={() => navigate(`/solicitacoes/${s.id}`)}
          />
        ))
      )}
    </ListPageShell>
  )
}
