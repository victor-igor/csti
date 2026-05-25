import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Calendar, Tag, Wrench, X } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Dialog } from '@base-ui/react'
import { useGetSolicitacao, useCancelSolicitacao, useDeleteSolicitacao } from './useSolicitacao'
import { ConfirmDialog } from '@/components/molecules/ConfirmDialog'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { InfoCard } from '@/components/molecules/InfoCard'
import { StatusTimeline } from '@/components/organisms/StatusTimeline'
import { StatusBadge } from '@/components/atoms/StatusBadge'
import { LoadingSkeleton } from '@/components/atoms/LoadingSkeleton'
import { ErrorState } from '@/components/atoms/ErrorState'
import { Button } from '@/components/ui/button'
import { EditSolicitacaoForm } from './components/EditSolicitacaoForm'

export default function SolicitacaoDetailDialog() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const role = useAuthStore((s) => s.profile?.role)
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const { data: solicitacao, isLoading, isError, refetch } = useGetSolicitacao(id ?? '')
  const { mutate: cancelar, isPending: cancelando } = useCancelSolicitacao()
  const { mutate: excluir, isPending: excluindo } = useDeleteSolicitacao()

  const { data: orcamentoVinculado } = useQuery({
    queryKey: ['orcamento-por-solicitacao', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orcamentos')
        .select('id, status')
        .eq('solicitacao_id', id ?? '')
        .is('deleted_at', null)
        .single()
      if (error) return null
      return data
    },
    enabled: !!id && solicitacao?.status === 'orcamento_enviado',
  })

  function onClose() {
    navigate(-1)
  }

  const isPrestador = role === 'prestador'
  const podeVerOrcamento = !isPrestador && solicitacao?.status === 'orcamento_enviado' && orcamentoVinculado
  const podeCriarOrcamento = isPrestador &&
    (solicitacao?.status === 'aberta' || solicitacao?.status === 'aguardando_orcamento')
  const podeCancelar =
    !isPrestador &&
    (solicitacao?.status === 'aberta' || solicitacao?.status === 'aguardando_orcamento')
  const podeEditarExcluir =
    !isPrestador &&
    solicitacao &&
    (solicitacao.status === 'aberta' || solicitacao.status === 'aguardando_orcamento')

  const hasActions = podeVerOrcamento || podeCriarOrcamento || podeCancelar || podeEditarExcluir

  return (
    <>
      <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[300]" />
          <Dialog.Popup className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[400] w-[calc(100%-2rem)] max-w-2xl rounded-xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 shrink-0">
              <Dialog.Title className="text-base font-semibold text-neutral-900">
                {solicitacao ? (isEditing ? 'Editar Solicitação' : solicitacao.numero) : 'Solicitação'}
              </Dialog.Title>
              <button
                onClick={onClose}
                className="p-1.5 rounded-md text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
                aria-label="Fechar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            {isEditing && solicitacao ? (
              <div className="flex-1 overflow-y-auto px-6 py-5">
                <EditSolicitacaoForm
                  solicitacao={solicitacao}
                  onCancel={() => setIsEditing(false)}
                  onSuccess={() => setIsEditing(false)}
                />
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-6 py-5">
                  {isLoading && <LoadingSkeleton rows={6} />}

                  {(isError || (!isLoading && !solicitacao)) && (
                    <ErrorState message="Não foi possível carregar a solicitação. Verifique sua conexão e tente novamente." onRetry={refetch} />
                  )}

                  {solicitacao && (
                    <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr] gap-6">

                      {/* Coluna principal */}
                      <div className="space-y-5">
                        <div>
                          <h2 className="text-base font-semibold text-foreground">{solicitacao.titulo}</h2>
                          <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">
                            {solicitacao.descricao}
                          </p>
                          {solicitacao.equipamento && (
                            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                              <Wrench className="h-4 w-4 shrink-0" />
                              <span>{solicitacao.equipamento}</span>
                            </div>
                          )}
                        </div>

                        {(solicitacao.status_historico ?? []).length > 0 && (
                          <div>
                            <h3 className="text-sm font-semibold text-foreground mb-3">Histórico</h3>
                            <StatusTimeline historico={solicitacao.status_historico ?? []} />
                          </div>
                        )}
                      </div>

                      {/* Coluna lateral */}
                      <div className="grid grid-cols-2 sm:grid-cols-1 gap-3">
                        <InfoCard label="Status" value={<StatusBadge status={solicitacao.status} />} />
                        <InfoCard label="Categoria" value={solicitacao.categoria ?? '—'} icon={Tag} />
                        <InfoCard
                          label="Criado em"
                          value={new Date(solicitacao.created_at).toLocaleDateString('pt-BR')}
                          icon={Calendar}
                        />
                        {solicitacao.urgencia && (
                          <InfoCard
                            label="Urgência"
                            value={
                              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                solicitacao.urgencia === 'urgente'
                                  ? 'bg-red-100 text-red-700'
                                  : solicitacao.urgencia === 'media'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-green-100 text-green-700'
                              }`}>
                                {solicitacao.urgencia === 'baixa' ? 'Baixa' : solicitacao.urgencia === 'media' ? 'Média' : 'Urgente'}
                              </span>
                            }
                          />
                        )}
                        {solicitacao.prazo_desejado && (
                          <InfoCard
                            label="Prazo Desejado"
                            value={new Date(solicitacao.prazo_desejado).toLocaleDateString('pt-BR')}
                            icon={Calendar}
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer — ações */}
                {hasActions && solicitacao && (
                  <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-100 shrink-0">
                    {podeEditarExcluir && (
                      <>
                        <button
                          onClick={() => setIsEditing(true)}
                          className="rounded-md border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => setConfirmDelete(true)}
                          className="rounded-md border border-danger px-4 py-2 text-sm font-medium text-danger hover:bg-danger/5 transition-colors cursor-pointer"
                        >
                          Excluir
                        </button>
                      </>
                    )}
                    {podeCancelar && (
                      <button
                        onClick={() => setConfirmCancel(true)}
                        className="rounded-md border border-danger px-4 py-2 text-sm font-medium text-danger hover:bg-danger/5 transition-colors cursor-pointer"
                      >
                        Cancelar Solicitação
                      </button>
                    )}
                    {podeVerOrcamento && (
                      <Link
                        to={`/orcamentos/${orcamentoVinculado.id}/revisar`}
                        className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
                      >
                        Ver Orçamento
                      </Link>
                    )}
                    {podeCriarOrcamento && (
                      <Button onClick={() => navigate(`/prestador/orcamentos/novo/${id}`)}>
                        Criar Orçamento
                      </Button>
                    )}
                  </div>
                )}
              </>
            )}
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>

      <ConfirmDialog
        open={confirmCancel}
        onOpenChange={setConfirmCancel}
        title="Cancelar Solicitação"
        description="Tem certeza que deseja cancelar esta solicitação? Esta ação não pode ser desfeita."
        confirmLabel="Sim, cancelar"
        cancelLabel="Voltar"
        loading={cancelando}
        onConfirm={() => {
          setConfirmCancel(false)
          cancelar(solicitacao!.id)
        }}
      />

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Excluir Solicitação"
        description="Tem certeza que deseja excluir permanentemente esta solicitação e todos os orçamentos associados? Esta ação não pode ser desfeita."
        confirmLabel="Sim, excluir"
        cancelLabel="Voltar"
        loading={excluindo}
        onConfirm={() => {
          setConfirmDelete(false)
          excluir(solicitacao!.id)
        }}
      />
    </>
  )
}
