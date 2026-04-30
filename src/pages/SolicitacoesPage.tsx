import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useListSolicitacoes } from '@/features/solicitacao/useSolicitacao'
import { SolicitacaoCard } from '@/features/solicitacao/components/SolicitacaoCard'
import { PageHeader } from '@/components/molecules/PageHeader'
import { FilterBar } from '@/components/molecules/FilterBar'
import { StatusBadge } from '@/components/atoms/StatusBadge'
import { LoadingSkeleton } from '@/components/atoms/LoadingSkeleton'
import { EmptyState } from '@/components/atoms/EmptyState'
import { ErrorState } from '@/components/atoms/ErrorState'
import type { SolicitacaoStatus } from '@/types/domain'

const STATUS_FILTERS: { label: string; value: SolicitacaoStatus | 'todos' }[] = [
  { label: 'Todos', value: 'todos' },
  { label: 'Aguardando Orçamento', value: 'aguardando_orcamento' },
  { label: 'Orçamento Enviado', value: 'orcamento_enviado' },
  { label: 'Aprovado', value: 'aprovado' },
  { label: 'Cancelado', value: 'cancelado' },
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

  const filterButtons = (
    <div className="flex flex-wrap gap-1">
      {STATUS_FILTERS.map(f => (
        <button
          key={f.value}
          onClick={() => setActiveFilter(f.value)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            activeFilter === f.value
              ? 'bg-primary text-white'
              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  )

  return (
    <div className="p-6">
      <PageHeader
        title="Minhas Solicitações"
        actions={
          <Link
            to="/solicitacoes/nova"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Nova Solicitação
          </Link>
        }
      />

      <div className="mt-4 space-y-4">
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          placeholder="Buscar por número ou título..."
          filters={filterButtons}
        />

        {isLoading && <LoadingSkeleton rows={4} />}
        {isError && <ErrorState message="Erro ao carregar solicitações" onRetry={refetch} />}
        {!isLoading && !isError && filtered.length === 0 && (
          <EmptyState
            title="Nenhuma solicitação encontrada"
            description="Crie sua primeira solicitação de orçamento"
            action={
              <Link
                to="/solicitacoes/nova"
                className="text-primary text-sm font-medium hover:underline"
              >
                Nova Solicitação
              </Link>
            }
          />
        )}

        {!isLoading && !isError && filtered.length > 0 && (
          <>
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto rounded-lg border border-neutral-200">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Número</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Título</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Categoria</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Data</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filtered.map(s => (
                    <tr
                      key={s.id}
                      className="hover:bg-neutral-50 cursor-pointer"
                      onClick={() => navigate(`/solicitacoes/${s.id}`)}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-neutral-600">{s.numero}</td>
                      <td className="px-4 py-3 font-medium text-neutral-800">{s.titulo}</td>
                      <td className="px-4 py-3 text-neutral-600 capitalize">{s.categoria ?? '—'}</td>
                      <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                      <td className="px-4 py-3 text-neutral-500">
                        {new Date(s.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/solicitacoes/${s.id}`) }}
                          className="text-xs text-primary hover:underline"
                        >
                          Ver Detalhes
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="md:hidden space-y-3">
              {filtered.map(s => (
                <SolicitacaoCard
                  key={s.id}
                  solicitacao={s}
                  onClick={() => navigate(`/solicitacoes/${s.id}`)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
