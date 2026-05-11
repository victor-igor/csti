import { useParams, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { PageHeader } from '@/components/molecules/PageHeader'
import { BackButton } from '@/components/molecules/BackButton'
import { InfoCard } from '@/components/molecules/InfoCard'
import { TotalSummary } from '@/components/molecules/TotalSummary'
import { LoadingSkeleton } from '@/components/atoms/LoadingSkeleton'
import { ErrorState } from '@/components/atoms/ErrorState'
import { StatusBadge } from '@/components/atoms/StatusBadge'
import { ItemOrcamentoRow } from '@/components/organisms/ItemOrcamentoRow'
import { PdfDownloadButton } from '@/components/pdf/PdfDownloadButton'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/authStore'
import { useGetOrcamento, useEnviarOrcamento } from './useOrcamento'

export default function OrcamentoDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const profile = useAuthStore((s) => s.profile)
  const { data, isLoading, isError, refetch } = useGetOrcamento(id ?? '')
  const { mutate: enviar, isPending } = useEnviarOrcamento()

  if (isLoading) return <div className="p-6"><LoadingSkeleton rows={6} /></div>
  if (isError || !data) return (
    <div className="p-6">
      <ErrorState message="Orçamento não encontrado" onRetry={refetch} />
    </div>
  )

  const itens = data.itens_orcamento ?? []
  const total = itens.reduce((sum, i) => sum + (i.quantidade ?? 0) * (i.valor_unitario ?? 0), 0)
  const canDownload = data.status === 'enviado' || data.status === 'aceito'

  const prestador = {
    nome: profile?.nome ?? '',
    especialidade: profile?.especialidade ?? null,
    telefone: profile?.telefone ?? null,
  }

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-4">
        <BackButton to="/orcamentos" />
      </div>

      <PageHeader
        title={data.numero}
        actions={canDownload ? <PdfDownloadButton orcamento={data} itens={itens} prestador={prestador} /> : null}
      />

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <InfoCard label="Status" value={<StatusBadge status={data.status} />} />
        {data.prazo_estimado_dias != null && (
          <InfoCard label="Prazo" value={`${data.prazo_estimado_dias} dia(s)`} />
        )}
        <InfoCard
          label="Criado em"
          value={new Date(data.created_at).toLocaleDateString('pt-BR')}
        />
        {(data as any).ordens_servico?.id && (
          <InfoCard
            label="Ordem de Serviço"
            value={
              <button
                className="text-primary hover:underline font-medium text-sm"
                onClick={() => navigate(`/ordens-servico/${(data as any).ordens_servico.id}`)}
              >
                {(data as any).ordens_servico.numero}
              </button>
            }
          />
        )}
      </div>

      {data.observacoes && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-foreground mb-1">Observações</h2>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{data.observacoes}</p>
        </div>
      )}

      {data.status === 'recusado' && (() => {
        const motivoDireto = (data as { motivo_recusa?: string | null }).motivo_recusa
        const motivoFallback = data.observacoes?.startsWith('[Motivo da recusa:')
          ? data.observacoes.replace(/^\[Motivo da recusa:\s*/, '').replace(/\]$/, '')
          : null
        const motivo = motivoDireto ?? motivoFallback
        if (!motivo) return null
        return (
          <div className="mt-6 rounded-md border border-danger/30 bg-danger/5 p-4">
            <h2 className="text-sm font-semibold text-danger mb-1">Motivo da Recusa</h2>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{motivo}</p>
          </div>
        )
      })()}

      <div className="mt-6">
        <h2 className="text-sm font-semibold text-foreground mb-3">
          Itens ({itens.length})
        </h2>
        {itens.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum item.</p>
        ) : (
          <div className="space-y-2">
            {itens.map((item) => (
              <ItemOrcamentoRow key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>

      <div className="mt-6">
        <TotalSummary subtotal={total} total={total} />
      </div>

      {data.status === 'rascunho' && (
        <div className="mt-6 flex gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={() => navigate(`/prestador/orcamentos/${data.id}/editar`)}
          >
            Editar Rascunho
          </Button>
          <Button
            disabled={isPending}
            onClick={() =>
              enviar({ orcamentoId: data.id, solicitacaoId: data.solicitacao_id })
            }
          >
            {isPending && <Loader2 className="size-4 animate-spin" />}
            Enviar Orçamento ao Cliente
          </Button>
        </div>
      )}
    </div>
  )
}
