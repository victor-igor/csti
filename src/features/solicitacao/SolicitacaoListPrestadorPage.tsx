import { useState } from 'react'
import { useNavigate, Outlet } from 'react-router-dom'
import { ListPageShell } from '@/components/molecules/ListPageShell'
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

  if (isLoading) return <div className="p-4 sm:p-6"><LoadingSkeleton rows={4} /></div>
  if (isError) return <div className="p-4 sm:p-6"><ErrorState message="Erro ao carregar solicitações" onRetry={refetch} /></div>

  return (
    <>
    <Outlet />
    <ListPageShell
      title="Solicitações Disponíveis"
      subtitle="Aguardando orçamento"
      filters={
        <StatusFilterChips
          filters={CATEGORIA_FILTERS}
          active={activeCategoria}
          onSelect={setActiveCategoria}
        />
      }
      search={search}
      onSearchChange={setSearch}
      searchPlaceholder="Buscar por título ou número..."
      resultCount={filtered.length}
      totalCount={data.length}
    >
      {filtered.length === 0 ? (
        <div className="col-span-full">
          <EmptyState
            title="Nenhuma solicitação disponível"
            description="Novas solicitações aparecerão aqui quando clientes enviarem pedidos"
          />
        </div>
      ) : (
        filtered.map(s => (
          <SolicitacaoCard
            key={s.id}
            solicitacao={s}
            variant="prestador"
            onClick={() => navigate(`/prestador/solicitacoes/${s.id}`)}
          />
        ))
      )}
    </ListPageShell>
    </>
  )
}
