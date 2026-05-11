import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Loader2, Phone, ArrowRight } from 'lucide-react'
import { PageHeader } from '@/components/molecules/PageHeader'
import { BackButton } from '@/components/molecules/BackButton'
import { InfoCard } from '@/components/molecules/InfoCard'
import { ConfirmDialog } from '@/components/molecules/ConfirmDialog'
import { LoadingSkeleton } from '@/components/atoms/LoadingSkeleton'
import { ErrorState } from '@/components/atoms/ErrorState'
import { StatusBadge } from '@/components/atoms/StatusBadge'
import { StatusTimeline } from '@/components/organisms/StatusTimeline'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/authStore'
import { UserCard } from '@/components/molecules/UserCard'
import { useGetOrdemServico, useUpdateStatusOS, getProximoStatus } from './useOrdemServico'
import type { OSStatus } from '@/types/domain'

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

export default function OrdemServicoDetailPage() {
  const { id } = useParams<{ id: string }>()
  const profile = useAuthStore((s) => s.profile)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const { data, isLoading, isError, refetch } = useGetOrdemServico(id ?? '')
  const { mutate: updateStatus, isPending } = useUpdateStatusOS()

  if (isLoading) return <div className="p-6"><LoadingSkeleton rows={6} /></div>
  if (isError || !data) return (
    <div className="p-6"><ErrorState message="OS não encontrada" onRetry={refetch} /></div>
  )

  const isPrestador = profile?.role === 'prestador'
  const proximoStatus = getProximoStatus(data.status as OSStatus)
  const labelTransicao = LABELS_TRANSICAO[data.status as OSStatus]
  const contraparte = isPrestador ? data.cliente : data.prestador
  const contraparteRole = isPrestador ? 'Cliente' : (data.prestador?.especialidade ?? 'Prestador')

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-4"><BackButton to="/ordens-servico" /></div>
      <PageHeader title={data.numero} />

      <div className="mt-2 flex flex-wrap gap-2">
        {data.solicitacao_id && (
          <Link
            to={isPrestador ? `/prestador/solicitacoes/${data.solicitacao_id}` : `/solicitacoes/${data.solicitacao_id}`}
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            Ver Solicitação <ArrowRight className="h-3 w-3" />
          </Link>
        )}
        {data.orcamento_id && (
          <Link
            to={isPrestador ? `/prestador/orcamentos/${data.orcamento_id}` : `/orcamentos/${data.orcamento_id}/revisar`}
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            Ver Orçamento <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <InfoCard label="Status" value={<StatusBadge status={data.status} />} />
        <InfoCard label="Início" value={formatDate(data.data_inicio)} />
        <InfoCard label="Conclusão" value={formatDate(data.data_conclusao)} />
      </div>

      {contraparte && (
        <div className="mt-6 rounded-md border border-border p-4">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {isPrestador ? 'Cliente' : 'Prestador'}
          </p>
          <UserCard name={contraparte.nome ?? ''} role={contraparteRole} />
          {contraparte.telefone && (
            <a
              href={`tel:${contraparte.telefone}`}
              className="mt-3 inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <Phone className="h-4 w-4" />
              {contraparte.telefone}
            </a>
          )}
        </div>
      )}

      {data.historico.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-3 text-sm font-semibold text-foreground">Histórico</h2>
          <StatusTimeline historico={data.historico} />
        </div>
      )}

      {isPrestador && proximoStatus && labelTransicao && (
        <div className="mt-6">
          <Button
            disabled={isPending}
            onClick={() => setConfirmOpen(true)}
          >
            {isPending && <Loader2 className="size-4 animate-spin" />}
            {labelTransicao}
          </Button>
        </div>
      )}

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
    </div>
  )
}
