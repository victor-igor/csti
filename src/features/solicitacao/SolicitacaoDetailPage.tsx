import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Calendar, Tag, Wrench } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useGetSolicitacao, useCancelSolicitacao } from './useSolicitacao'
import { ConfirmDialog } from '@/components/molecules/ConfirmDialog'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { PageHeader } from '@/components/molecules/PageHeader'
import { BackButton } from '@/components/molecules/BackButton'
import { InfoCard } from '@/components/molecules/InfoCard'
import { StatusTimeline } from '@/components/organisms/StatusTimeline'
import { StatusBadge } from '@/components/atoms/StatusBadge'
import { LoadingSkeleton } from '@/components/atoms/LoadingSkeleton'
import { ErrorState } from '@/components/atoms/ErrorState'
import { Button } from '@/components/ui/button'
import { StickyActionBar } from '@/components/atoms/StickyActionBar'
import { TimelineMensagens } from './components/TimelineMensagens'

export default function SolicitacaoDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const role = useAuthStore((s) => s.profile?.role)

  const { data: solicitacao, isLoading, isError, refetch } = useGetSolicitacao(id ?? '')
  const { mutate: cancelar, isPending: cancelando } = useCancelSolicitacao()
  const [confirmCancel, setConfirmCancel] = useState(false)

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

  if (isLoading) return <div className="p-6"><LoadingSkeleton rows={6} /></div>
  if (isError || !solicitacao) return (
    <div className="p-6">
      <ErrorState message="Não foi possível carregar a solicitação. Verifique sua conexão e tente novamente." onRetry={refetch} />
    </div>
  )

  const historico = solicitacao.status_historico ?? []
  const isPrestador = role === 'prestador'
  // Mostra link de orçamento para clientes e para usuários sem role definido (ex: testes)
  const podeVerOrcamento = !isPrestador && solicitacao.status === 'orcamento_enviado' && orcamentoVinculado
  const podeCriarOrcamento = isPrestador &&
    (solicitacao.status === 'aberta' || solicitacao.status === 'aguardando_orcamento')
  const podeCancelar =
    !isPrestador &&
    (solicitacao.status === 'aberta' || solicitacao.status === 'aguardando_orcamento')

  return (
    <div className="p-4 sm:p-6 pb-20 md:pb-0 space-y-6 max-w-2xl mx-auto">
      <div className="mb-4">
        <BackButton to={isPrestador ? '/prestador/solicitacoes' : '/solicitacoes'} />
      </div>

      <PageHeader title={solicitacao.numero} />

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">

        {/* Coluna principal */}
        <div className="space-y-6">
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

          {historico.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Histórico de Status</h3>
              <StatusTimeline historico={historico} />
            </div>
          )}

          {/* Timeline de Mensagens / Chat */}
          <div className="pt-2">
            <TimelineMensagens solicitacaoId={solicitacao.id} />
          </div>
        </div>

        {/* Coluna lateral */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
            <InfoCard label="Status" value={<StatusBadge status={solicitacao.status} />} />
            <InfoCard
              label="Categoria"
              value={solicitacao.categoria ?? '—'}
              icon={Tag}
            />
            <InfoCard
              label="Criado em"
              value={new Date(solicitacao.created_at).toLocaleDateString('pt-BR')}
              icon={Calendar}
            />
            {solicitacao.urgencia && (
              <InfoCard
                label="Urgência"
                value={
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      solicitacao.urgencia === 'urgente'
                        ? 'bg-red-100 text-red-700'
                        : solicitacao.urgencia === 'media'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
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

          {/* Ações — desktop (inline) */}
          <div className="hidden md:flex gap-3 flex-wrap">
            {podeVerOrcamento && (
              <Link
                to={`/orcamentos/${orcamentoVinculado.id}/revisar`}
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
              >
                Ver Orçamento
              </Link>
            )}
            {podeCriarOrcamento && (
              <Button
                onClick={() => navigate(`/prestador/orcamentos/novo/${id}`)}
              >
                Criar Orçamento
              </Button>
            )}
            {podeCancelar && (
              <button
                onClick={() => setConfirmCancel(true)}
                className="rounded-md border border-danger px-4 py-2 text-sm font-medium text-danger hover:bg-danger/5 transition-colors"
              >
                Cancelar Solicitação
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Ações — mobile (sticky) */}
      <StickyActionBar>
        {podeVerOrcamento && (
          <Link
            to={`/orcamentos/${orcamentoVinculado.id}/revisar`}
            className="flex-1 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            Ver Orçamento
          </Link>
        )}
        {podeCriarOrcamento && (
          <Button
            className="flex-1"
            onClick={() => navigate(`/prestador/orcamentos/novo/${id}`)}
          >
            Criar Orçamento
          </Button>
        )}
        {podeCancelar && (
          <button
            onClick={() => setConfirmCancel(true)}
            className="flex-1 rounded-md border border-danger px-4 py-2 text-sm font-medium text-danger hover:bg-danger/5 transition-colors"
          >
            Cancelar
          </button>
        )}
      </StickyActionBar>

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
          cancelar(solicitacao.id)
        }}
      />
    </div>
  )
}
