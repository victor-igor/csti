import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
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

  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-4"><BackButton to="/ordens-servico" /></div>
      <PageHeader title={data.numero} />

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <InfoCard label="Status" value={<StatusBadge status={data.status} />} />
        <InfoCard label="Início" value={formatDate(data.data_inicio)} />
        <InfoCard label="Conclusão" value={formatDate(data.data_conclusao)} />
      </div>

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
        description={`Alterar status para "${proximoStatus}"?`}
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
