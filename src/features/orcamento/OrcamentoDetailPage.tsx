import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Loader2, Pencil, Trash2, XCircle, Send } from 'lucide-react'
import { PageHeader } from '@/components/molecules/PageHeader'
import { BackButton } from '@/components/molecules/BackButton'
import { InfoCard } from '@/components/molecules/InfoCard'
import { LoadingSkeleton } from '@/components/atoms/LoadingSkeleton'
import { ErrorState } from '@/components/atoms/ErrorState'
import { StatusBadge } from '@/components/atoms/StatusBadge'
import { ItemOrcamentoRow } from '@/components/organisms/ItemOrcamentoRow'
import { PdfDownloadButton } from '@/components/pdf/PdfDownloadButton'
import { Button } from '@/components/ui/button'
import { StickyActionBar } from '@/components/atoms/StickyActionBar'
import { OverflowMenu } from '@/components/molecules/OverflowMenu'
import { ConfirmDialog } from '@/components/molecules/ConfirmDialog'
import { useAuthStore } from '@/store/authStore'
import { useGetOrcamento, useEnviarOrcamento, useDeleteOrcamento } from './useOrcamento'
import { CurrencyDisplay } from '@/components/atoms/CurrencyDisplay'

export default function OrcamentoDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const profile = useAuthStore((s) => s.profile)
  const { data, isLoading, isError, refetch } = useGetOrcamento(id ?? '')
  const { mutate: enviar, isPending } = useEnviarOrcamento()
  const { mutate: excluir, isPending: excluindo } = useDeleteOrcamento()
  const [confirmDelete, setConfirmDelete] = useState(false)

  if (isLoading) return <div className="p-6"><LoadingSkeleton rows={6} /></div>
  if (isError || !data) return (
    <div className="p-6">
      <ErrorState message="Não foi possível carregar o orçamento. Verifique sua conexão e tente novamente." onRetry={refetch} />
    </div>
  )

  const itens = data.itens_orcamento ?? []

  const servicoTotal = itens.reduce(
    (sum, item) => sum + ((item as any).tipo === 'servico' ? (item.quantidade ?? 0) * (item.valor_unitario ?? 0) : 0),
    0,
  )
  const produtoTotal = itens.reduce(
    (sum, item) => sum + ((item as any).tipo === 'produto' ? (item.quantidade ?? 0) * (item.valor_unitario ?? 0) : 0),
    0,
  )
  const outrosTotal = itens.reduce(
    (sum, item) => sum + ((item as any).tipo === 'outros' ? (item.quantidade ?? 0) * (item.valor_unitario ?? 0) : 0),
    0,
  )
  const total = servicoTotal + produtoTotal + outrosTotal
  const canDownload = data.status === 'enviado' || data.status === 'aceito'

  const prestador = {
    nome: profile?.nome ?? '',
    especialidade: profile?.especialidade ?? null,
    telefone: profile?.telefone ?? null,
  }

  const isPrestador = profile?.role === 'prestador'
  const podeExcluir = isPrestador && (data.status === 'rascunho' || data.status === 'enviado')
  const podeEditar = isPrestador && data.status === 'rascunho'
  const podeEnviar = isPrestador && data.status === 'rascunho'
  const podeRetirar = isPrestador && data.status === 'enviado'

  // ─── Ação primária (CTA) ──────────────────────────────────────────────────
  const primaryAction = (() => {
    if (podeEnviar) {
      return (
        <Button
          disabled={isPending}
          onClick={() => enviar({ orcamentoId: data.id, solicitacaoId: data.solicitacao_id })}
        >
          {isPending && <Loader2 className="size-4 animate-spin" />}
          <Send className="h-4 w-4" />
          Enviar ao Cliente
        </Button>
      )
    }
    return null
  })()

  // ─── Ações do overflow "⋮" ─────────────────────────────────────────────
  const overflowActions = [
    canDownload && {
      label: 'Baixar PDF',
      icon: undefined,
      onClick: () => {/* handled by PdfDownloadButton below */},
    },
    podeEditar && {
      label: 'Editar Rascunho',
      icon: Pencil,
      onClick: () => navigate(`/prestador/orcamentos/${data.id}/editar`),
    },
    (podeExcluir || podeRetirar) && { separator: true },
    podeRetirar && {
      label: 'Retirar Orçamento',
      icon: XCircle,
      variant: 'destructive' as const,
      onClick: () => setConfirmDelete(true),
    },
    podeEditar && podeExcluir && {
      label: 'Excluir Rascunho',
      icon: Trash2,
      variant: 'destructive' as const,
      separator: !podeRetirar,
      onClick: () => setConfirmDelete(true),
    },
  ].filter(Boolean) as import('@/components/molecules/OverflowMenu').OverflowAction[]

  // PDF download goes in the actions slot (non-CTA)
  const headerActions = canDownload
    ? <PdfDownloadButton orcamento={data} itens={itens} prestador={prestador} />
    : null

  return (
    <div className="p-6 max-w-5xl pb-24 md:pb-6">
      <div className="mb-4">
        <BackButton to={isPrestador ? '/orcamentos' : '/orcamentos'} />
      </div>

      <PageHeader
        title={data.numero}
        actions={headerActions}
        primaryAction={primaryAction}
        overflowMenu={
          overflowActions.length > 0 ? (
            <OverflowMenu actions={overflowActions} />
          ) : undefined
        }
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
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 space-y-2 max-w-sm ml-auto">
          <div className="flex justify-between text-xs text-neutral-500">
            <span>Mão de Obra</span>
            <CurrencyDisplay value={servicoTotal} />
          </div>
          <div className="flex justify-between text-xs text-neutral-500">
            <span>Peças &amp; Materiais</span>
            <CurrencyDisplay value={produtoTotal} />
          </div>
          <div className="flex justify-between text-xs text-neutral-500">
            <span>Outros / Deslocamento</span>
            <CurrencyDisplay value={outrosTotal} />
          </div>
          <div className="border-t border-neutral-200 pt-2 flex justify-between text-sm font-semibold text-neutral-800">
            <span>Total</span>
            <CurrencyDisplay value={total} />
          </div>
        </div>
      </div>

      {/* Mobile: sticky apenas para a ação primária */}
      {primaryAction && (
        <StickyActionBar className="bottom-16">
          <div className="flex-1">{primaryAction}</div>
        </StickyActionBar>
      )}

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={data.status === 'rascunho' ? 'Excluir Rascunho' : 'Retirar Orçamento'}
        description={
          data.status === 'rascunho'
            ? 'Tem certeza que deseja excluir este rascunho de orçamento permanentemente?'
            : 'Tem certeza que deseja retirar/cancelar este orçamento enviado? O cliente não poderá mais visualizá-lo.'
        }
        confirmLabel="Sim, confirmar"
        cancelLabel="Voltar"
        loading={excluindo}
        onConfirm={() => {
          setConfirmDelete(false)
          excluir({ orcamentoId: data.id, solicitacaoId: data.solicitacao_id })
        }}
      />
    </div>
  )
}
