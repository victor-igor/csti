import { useState } from 'react'
import { useNavigate, Outlet } from 'react-router-dom'
import { ListPageShell } from '@/components/molecules/ListPageShell'
import { StatusFilterChips } from '@/components/molecules/StatusFilterChips'
import { Pagination } from '@/components/molecules/Pagination'
import { SolicitacaoCard } from './components/SolicitacaoCard'
import { LoadingSkeleton } from '@/components/atoms/LoadingSkeleton'
import { EmptyState } from '@/components/atoms/EmptyState'
import { ErrorState } from '@/components/atoms/ErrorState'
import { useListSolicitacoesParaPrestador } from './useSolicitacao'
import { CATEGORIAS } from './solicitacaoSchemas'

const PAGE_SIZE = 10

export default function SolicitacaoListPrestadorPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [activeCategoria, setActiveCategoria] = useState<string>('')
  const [page, setPage] = useState(1)
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

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const handleCategoriaChange = (v: string) => {
    setActiveCategoria(v)
    setPage(1)
  }

  const handleSearchChange = (v: string) => {
    setSearch(v)
    setPage(1)
  }

  if (isLoading) return <div className="p-4 sm:p-6"><LoadingSkeleton rows={4} /></div>
  if (isError) return <div className="p-4 sm:p-6"><ErrorState message="Não foi possível carregar as solicitações. Verifique sua conexão e tente novamente." onRetry={refetch} /></div>

  return (
    <>
      <Outlet />
      <ListPageShell
        title="Solicitações Disponíveis"
        subtitle="Aguardando orçamento"
        columns={1}
        filters={
          <StatusFilterChips
            filters={CATEGORIA_FILTERS}
            active={activeCategoria}
            onSelect={handleCategoriaChange}
          />
        }
        search={search}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Buscar por título ou número..."
        resultCount={filtered.length}
        totalCount={data.length}
      >
        {paginated.length === 0 ? (
          <div className="col-span-full">
            <EmptyState
              title="Nenhuma solicitação disponível"
              description="Novas solicitações aparecerão aqui quando clientes enviarem pedidos"
            />
          </div>
        ) : (
          <>
            {paginated.map(s => (
              <SolicitacaoCard
                key={s.id}
                solicitacao={s}
                variant="prestador"
                onClick={() => navigate(`/prestador/solicitacoes/${s.id}`)}
              />
            ))}
            <Pagination
              page={safePage}
              totalPages={totalPages}
              onPrev={() => setPage(p => Math.max(1, p - 1))}
              onNext={() => setPage(p => Math.min(totalPages, p + 1))}
            />
          </>
        )}
      </ListPageShell>
    </>
  )
}
