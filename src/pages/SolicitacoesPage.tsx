import { useState, useEffect } from 'react'
import { useNavigate, Outlet } from 'react-router-dom'
import { Pencil, XCircle, Trash2 } from 'lucide-react'
import { ListPageShell } from '@/components/molecules/ListPageShell'
import { StatusFilterChips } from '@/components/molecules/StatusFilterChips'
import { Pagination } from '@/components/molecules/Pagination'
import { SolicitacaoCard } from '@/components/organisms/SolicitacaoCard'
import { OverflowMenu } from '@/components/molecules/OverflowMenu'
import { ConfirmDialog } from '@/components/molecules/ConfirmDialog'
import { LoadingSkeleton } from '@/components/atoms/LoadingSkeleton'
import { EmptyState } from '@/components/atoms/EmptyState'
import { ErrorState } from '@/components/atoms/ErrorState'
import { useListSolicitacoes, useCancelSolicitacao, useDeleteSolicitacao } from '@/features/solicitacao/useSolicitacao'
import { useAuthStore } from '@/store/authStore'
import type { SolicitacaoStatus, ISolicitacao } from '@/types/domain'

const PAGE_SIZE = 10

const STATUS_FILTERS: { label: string; value: SolicitacaoStatus | 'todos' }[] = [
  { label: 'Todos',        value: 'todos' },
  { label: 'Aberta',       value: 'aberta' },
  { label: 'Aguardando',   value: 'aguardando_orcamento' },
  { label: 'Orç. Enviado', value: 'orcamento_enviado' },
  { label: 'Aprovado',     value: 'aprovado' },
  { label: 'Cancelado',    value: 'cancelado' },
]

const STATUS_EDITAVEIS: SolicitacaoStatus[] = ['aberta', 'aguardando_orcamento']

export default function SolicitacoesPage() {
  const navigate = useNavigate()
  const [activeFilter, setActiveFilter] = useState<SolicitacaoStatus | 'todos'>('todos')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  // Estado para dialogs de ação rápida
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const filters = activeFilter !== 'todos' ? { status: activeFilter } : undefined
  const { data = [], isLoading, isError, refetch } = useListSolicitacoes(filters)
  const { mutate: cancelar, isPending: cancelando } = useCancelSolicitacao()
  const { mutate: excluir, isPending: excluindo } = useDeleteSolicitacao()

  const filtered = search
    ? data.filter(s =>
        s.titulo.toLowerCase().includes(search.toLowerCase()) ||
        s.numero.toLowerCase().includes(search.toLowerCase())
      )
    : data

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const abertas = data.filter(s => s.status !== 'cancelado').length
  const subtitle = abertas > 0
    ? `${abertas} solicitaç${abertas === 1 ? 'ão aberta' : 'ões abertas'}`
    : undefined

  const handleFilterChange = (v: SolicitacaoStatus | 'todos') => {
    setActiveFilter(v)
    setPage(1)
  }

  const handleSearchChange = (v: string) => {
    setSearch(v)
    setPage(1)
  }

  function buildOverflowMenu(s: ISolicitacao) {
    const podeEditar = STATUS_EDITAVEIS.includes(s.status as SolicitacaoStatus)
    if (!podeEditar) return undefined

    return (
      <OverflowMenu
        actions={[
          {
            label: 'Editar',
            icon: Pencil,
            onClick: () => navigate(`/solicitacoes/${s.id}`),
          },
          { separator: true, label: 'Cancelar', icon: XCircle, variant: 'destructive', onClick: () => { setSelectedId(s.id); setConfirmCancel(true) } },
          { label: 'Excluir', icon: Trash2, variant: 'destructive', onClick: () => { setSelectedId(s.id); setConfirmDelete(true) } },
        ]}
      />
    )
  }

  if (isLoading) return <div className="p-4 sm:p-6"><LoadingSkeleton rows={4} /></div>
  if (isError) return <div className="p-4 sm:p-6"><ErrorState message="Não foi possível carregar as solicitações. Verifique sua conexão e tente novamente." onRetry={refetch} /></div>

  return (
    <>
      <Outlet />
      <ListPageShell
        title="Minhas Solicitações"
        subtitle={subtitle}
        columns={1}
        actions={
          <button
            data-tour="nova-solicitacao"
            onClick={() => navigate('/solicitacoes/nova')}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Nova Solicitação
          </button>
        }
        filters={
          <div data-tour="filtros-solicitacoes">
            <StatusFilterChips
              filters={STATUS_FILTERS}
              active={activeFilter}
              onSelect={handleFilterChange}
            />
          </div>
        }
        search={search}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Buscar por número ou título..."
        resultCount={filtered.length}
        totalCount={data.length}
      >
        {paginated.length === 0 ? (
          <div className="col-span-full">
            <EmptyState
              title="Nenhuma solicitação encontrada"
              description={search ? 'Tente outros termos de busca' : 'Crie sua primeira solicitação de orçamento'}
            />
          </div>
        ) : (
          <>
            {paginated.map(s => (
              <SolicitacaoCard
                key={s.id}
                solicitacao={s}
                onClick={() => navigate(`/solicitacoes/${s.id}`)}
                overflowMenu={buildOverflowMenu(s)}
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

      {/* Dialogs de confirmação centralizados */}
      <ConfirmDialog
        open={confirmCancel}
        onOpenChange={(open) => { setConfirmCancel(open); if (!open) setSelectedId(null) }}
        title="Cancelar Solicitação"
        description="Tem certeza que deseja cancelar esta solicitação? Esta ação não pode ser desfeita."
        confirmLabel="Sim, cancelar"
        cancelLabel="Voltar"
        loading={cancelando}
        onConfirm={() => {
          if (selectedId) cancelar(selectedId)
          setConfirmCancel(false)
          setSelectedId(null)
        }}
      />

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={(open) => { setConfirmDelete(open); if (!open) setSelectedId(null) }}
        title="Excluir Solicitação"
        description="Tem certeza que deseja excluir permanentemente esta solicitação e todos os orçamentos associados? Esta ação não pode ser desfeita."
        confirmLabel="Sim, excluir"
        cancelLabel="Voltar"
        loading={excluindo}
        onConfirm={() => {
          if (selectedId) excluir(selectedId)
          setConfirmDelete(false)
          setSelectedId(null)
        }}
      />
    </>
  )
}
