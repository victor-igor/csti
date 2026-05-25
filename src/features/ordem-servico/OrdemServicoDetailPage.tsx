import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Loader2, Phone, ArrowRight, XCircle } from 'lucide-react'
import { PageHeader } from '@/components/molecules/PageHeader'
import { BackButton } from '@/components/molecules/BackButton'
import { InfoCard } from '@/components/molecules/InfoCard'
import { InfoRow } from '@/components/molecules/InfoRow'
import { ConfirmDialog } from '@/components/molecules/ConfirmDialog'
import { OverflowMenu } from '@/components/molecules/OverflowMenu'
import { LoadingSkeleton } from '@/components/atoms/LoadingSkeleton'
import { ErrorState } from '@/components/atoms/ErrorState'
import { StatusBadge } from '@/components/atoms/StatusBadge'
import { StickyActionBar } from '@/components/atoms/StickyActionBar'
import { StatusTimeline } from '@/components/organisms/StatusTimeline'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/authStore'
import { useGetOrdemServico, useUpdateStatusOS, useCancelOrdemServico, getProximoStatus } from './useOrdemServico'
import type { OSStatus } from '@/types/domain'
import { formatDisplayPhone } from '@/lib/phoneUtils'

function formatDate(date: string | null) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('pt-BR')
}

const LABELS_TRANSICAO: Partial<Record<OSStatus, string>> = {
  aberta: 'Iniciar Atendimento',
  em_andamento: 'Marcar como Concluída',
}

const OS_STATUS_LABEL: Partial<Record<OSStatus, string>> = {
  aberta: 'Aberta',
  em_andamento: 'Em Andamento',
  concluida: 'Concluída',
  cancelada: 'Cancelada',
}

const STATUS_CANCELAVEIS: OSStatus[] = ['aberta', 'em_andamento']

export default function OrdemServicoDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const profile = useAuthStore((s) => s.profile)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false)

  const { data, isLoading, isError, refetch } = useGetOrdemServico(id ?? '')
  const { mutate: updateStatus, isPending } = useUpdateStatusOS()
  const { mutate: cancelarOS, isPending: cancelando } = useCancelOrdemServico()

  if (isLoading) return <div className="p-6"><LoadingSkeleton rows={6} /></div>
  if (isError || !data) return (
    <div className="p-6"><ErrorState message="Não foi possível carregar a ordem de serviço. Verifique sua conexão e tente novamente." onRetry={refetch} /></div>
  )

  const isPrestador = profile?.role === 'prestador'
  const isAdmin = profile?.role === 'admin'
  const isCliente = profile?.role === 'cliente'

  const proximoStatus = getProximoStatus(data.status as OSStatus)
  const labelTransicao = LABELS_TRANSICAO[data.status as OSStatus]
  const contraparte = isPrestador ? data.cliente : data.prestador

  const podeCancelar =
    (isAdmin || isCliente) &&
    STATUS_CANCELAVEIS.includes(data.status as OSStatus)

  // ─── Ação primária (CTA) — avançar status para o prestador ───────────────
  const primaryAction = isPrestador && proximoStatus && labelTransicao ? (
    <Button disabled={isPending} onClick={() => setConfirmOpen(true)}>
      {isPending && <Loader2 className="size-4 animate-spin" />}
      {labelTransicao}
    </Button>
  ) : null

  // ─── Ações do overflow "⋮" — cancelar para admin/cliente ─────────────────
  const overflowActions = [
    podeCancelar && {
      label: 'Cancelar OS',
      icon: XCircle,
      variant: 'destructive' as const,
      onClick: () => setConfirmCancelOpen(true),
    },
  ].filter(Boolean) as import('@/components/molecules/OverflowMenu').OverflowAction[]

  return (
    <div className="p-6 max-w-5xl pb-24 md:pb-6">
      <div className="mb-4">
        <BackButton to={isPrestador ? '/prestador/ordens-servico' : '/ordens-servico'} />
      </div>

      <PageHeader
        title={data.numero}
        primaryAction={primaryAction}
        overflowMenu={
          overflowActions.length > 0 ? (
            <OverflowMenu actions={overflowActions} />
          ) : undefined
        }
      />

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <InfoCard label="Status" value={<StatusBadge status={data.status} />} />
        <InfoCard label="Criado em" value={new Date(data.created_at).toLocaleDateString('pt-BR')} />
        <InfoCard label="Início" value={formatDate(data.data_inicio)} />
        <InfoCard label="Conclusão" value={formatDate(data.data_conclusao)} />
        {data.solicitacao_id && (
          <InfoCard
            label="Solicitação"
            value={
              <Link
                to={isPrestador ? `/prestador/solicitacoes/${data.solicitacao_id}` : `/solicitacoes/${data.solicitacao_id}`}
                className="inline-flex items-center gap-1 font-medium text-primary hover:underline text-sm"
              >
                Ver <ArrowRight className="h-3 w-3" />
              </Link>
            }
          />
        )}
        {data.orcamento_id && (
          <InfoCard
            label="Orçamento"
            value={
              <Link
                to={isPrestador ? `/prestador/orcamentos/${data.orcamento_id}` : `/orcamentos/${data.orcamento_id}/revisar`}
                className="inline-flex items-center gap-1 font-medium text-primary hover:underline text-sm"
              >
                Ver <ArrowRight className="h-3 w-3" />
              </Link>
            }
          />
        )}
      </div>

      {contraparte && (
        <div className="mt-6 rounded-md border border-border bg-card p-4">
          <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {isPrestador ? 'Cliente' : 'Prestador'}
          </p>
          <InfoRow label="Nome" value={contraparte.nome ?? '—'} />
          {!isPrestador && data.prestador?.especialidade && (
            <InfoRow label="Especialidade" value={data.prestador.especialidade} />
          )}
          <InfoRow
            label="Telefone"
            value={contraparte.telefone ? formatDisplayPhone(contraparte.telefone) : '—'}
            action={
              contraparte.telefone ? (
                <a
                  href={`tel:+${contraparte.telefone.replace(/\D/g, '')}`}
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  <Phone className="h-3 w-3" /> Ligar
                </a>
              ) : undefined
            }
          />
        </div>
      )}

      {data.historico.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-3 text-sm font-semibold text-foreground">Histórico</h2>
          <StatusTimeline historico={data.historico} />
        </div>
      )}

      {/* Mobile: sticky apenas para a ação primária do prestador */}
      {primaryAction && (
        <StickyActionBar className="bottom-16">
          <div className="flex-1">{primaryAction}</div>
        </StickyActionBar>
      )}

      {/* Dialog: Avançar status (prestador) */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={labelTransicao ?? 'Confirmar'}
        description={`Alterar status para "${OS_STATUS_LABEL[proximoStatus as OSStatus] ?? proximoStatus}"?`}
        confirmLabel="Confirmar"
        loading={isPending}
        onConfirm={() => {
          setConfirmOpen(false)
          updateStatus({ id: data.id, status: proximoStatus as OSStatus })
        }}
      />

      {/* Dialog: Cancelar OS (admin/cliente) */}
      <ConfirmDialog
        open={confirmCancelOpen}
        onOpenChange={setConfirmCancelOpen}
        title="Cancelar Ordem de Serviço"
        description="Tem certeza que deseja cancelar esta ordem de serviço? Esta ação não pode ser desfeita."
        confirmLabel="Sim, cancelar"
        cancelLabel="Voltar"
        loading={cancelando}
        onConfirm={() => {
          setConfirmCancelOpen(false)
          cancelarOS({ id: data.id }, {
            onSuccess: () => navigate(isPrestador ? '/prestador/ordens-servico' : '/ordens-servico'),
          })
        }}
      />
    </div>
  )
}
