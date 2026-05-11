import { useState } from 'react'
import { Dialog } from '@base-ui/react'
import { useParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { PageHeader } from '@/components/molecules/PageHeader'
import { BackButton } from '@/components/molecules/BackButton'
import { InfoCard } from '@/components/molecules/InfoCard'
import { ConfirmDialog } from '@/components/molecules/ConfirmDialog'
import { UserCard } from '@/components/molecules/UserCard'
import { LoadingSkeleton } from '@/components/atoms/LoadingSkeleton'
import { ErrorState } from '@/components/atoms/ErrorState'
import { StatusBadge } from '@/components/atoms/StatusBadge'
import { CurrencyDisplay } from '@/components/atoms/CurrencyDisplay'
import { ItemOrcamentoRow } from '@/components/organisms/ItemOrcamentoRow'
import { PdfDownloadButton } from '@/components/pdf/PdfDownloadButton'
import { Button } from '@/components/ui/button'
import type { IProfile } from '@/types/domain'
import { useGetOrcamento, useAprovarOrcamento, useRecusarOrcamento } from './useOrcamento'

export default function OrcamentoReviewPage() {
  const { id } = useParams<{ id: string }>()
  const [confirmAprovar, setConfirmAprovar] = useState(false)
  const [confirmRecusar, setConfirmRecusar] = useState(false)
  const [motivoRecusa, setMotivoRecusa] = useState('')

  const { data, isLoading, isError, refetch } = useGetOrcamento(id ?? '')
  const { mutate: aprovar, isPending: aprovando } = useAprovarOrcamento()
  const { mutate: recusar, isPending: recusando } = useRecusarOrcamento()

  const { data: prestador } = useQuery({
    queryKey: ['profile', data?.prestador_id],
    queryFn: async () => {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data!.prestador_id)
        .single()
      if (error) throw error
      return profile as IProfile
    },
    enabled: !!data?.prestador_id,
  })

  if (isLoading) return <div className="p-6"><LoadingSkeleton rows={6} /></div>
  if (isError || !data) return (
    <div className="p-6"><ErrorState message="Não foi possível carregar o orçamento. Verifique sua conexão e tente novamente." onRetry={refetch} /></div>
  )

  const itens = data.itens_orcamento ?? []
  const total = itens.reduce((sum, i) => sum + (i.quantidade ?? 0) * (i.valor_unitario ?? 0), 0)
  const canDownload = data.status === 'enviado' || data.status === 'aceito'
  const canAct = data.status === 'enviado'
  const isProcessing = aprovando || recusando

  const prestadorPdf = {
    nome: prestador?.nome ?? '',
    especialidade: prestador?.especialidade ?? null,
    telefone: prestador?.telefone ?? null,
  }

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-4"><BackButton to="/solicitacoes" /></div>

      <PageHeader
        title={`Orçamento ${data.numero}`}
        actions={canDownload ? <PdfDownloadButton orcamento={data} itens={itens} prestador={prestadorPdf} /> : null}
      />
      <div className="mb-1">
        <StatusBadge status={data.status} />
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6 items-start">

        {/* Coluna principal: tabela de itens + observações */}
        <div className="space-y-4">
          <div className="rounded-md border border-border overflow-hidden">
            {/* Header de colunas */}
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-2 bg-muted/40 px-4 py-2">
              <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Descrição</span>
              <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground text-right">Qtd</span>
              <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground text-right">Unit.</span>
              <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground text-right">Subtotal</span>
            </div>
            {/* Linhas de itens */}
            <div className="divide-y divide-border">
              {itens.map((item) => (
                <ItemOrcamentoRow key={item.id} item={item} />
              ))}
              {itens.length === 0 && (
                <p className="px-4 py-6 text-center text-sm text-muted-foreground">Nenhum item.</p>
              )}
            </div>
          </div>

          {data.observacoes && (
            <div className="rounded-md border border-border p-4">
              <h3 className="mb-1 text-sm font-semibold text-foreground">Observações</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{data.observacoes}</p>
            </div>
          )}

          {data.prazo_estimado_dias != null && (
            <InfoCard label="Prazo estimado" value={`${data.prazo_estimado_dias} dia(s)`} />
          )}
        </div>

        {/* Coluna direita sticky */}
        <div className="lg:sticky lg:top-20 space-y-4">
          {/* Box total destaque */}
          <div className="rounded-md border border-border bg-neutral-25 p-4">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Total do Orçamento
            </p>
            <CurrencyDisplay value={total} className="mt-1 text-2xl font-bold text-foreground" />
          </div>

          {/* UserCard prestador */}
          {prestador && (
            <div className="rounded-md border border-border p-4">
              <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Prestador</p>
              <UserCard
                name={prestador.nome}
                role={prestador.especialidade ?? 'Prestador'}
              />
            </div>
          )}

          {/* CTAs Aprovar / Recusar */}
          {canAct && (
            <div className="space-y-2">
              <Button
                className="w-full bg-green-600 text-white hover:bg-green-700"
                disabled={isProcessing}
                onClick={() => setConfirmAprovar(true)}
              >
                {aprovando && <Loader2 className="size-4 animate-spin" />}
                Aprovar
              </Button>
              <Button
                variant="outline"
                className="w-full border-danger text-danger hover:bg-danger/10"
                disabled={isProcessing}
                onClick={() => setConfirmRecusar(true)}
              >
                {recusando && <Loader2 className="size-4 animate-spin" />}
                Recusar
              </Button>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmAprovar}
        onOpenChange={setConfirmAprovar}
        title="Aprovar Orçamento"
        description="Ao aprovar, uma Ordem de Serviço será criada automaticamente. Confirmar?"
        confirmLabel="Aprovar"
        loading={aprovando}
        onConfirm={() => {
          setConfirmAprovar(false)
          aprovar(data.id)
        }}
      />

      <Dialog.Root open={confirmRecusar} onOpenChange={setConfirmRecusar}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 bg-black/40 z-[290]" />
          <Dialog.Popup className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[400] w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <Dialog.Title className="text-base font-semibold text-neutral-800">
              Recusar Orçamento
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-neutral-600">
              Deixe um motivo (opcional) para ajudar o prestador.
            </Dialog.Description>
            <textarea
              value={motivoRecusa}
              onChange={(e) => setMotivoRecusa(e.target.value)}
              maxLength={500}
              rows={4}
              placeholder="Motivo da recusa (opcional)"
              className="mt-4 w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" type="button" disabled={recusando} onClick={() => setConfirmRecusar(false)}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                disabled={recusando}
                onClick={() => {
                  setConfirmRecusar(false)
                  recusar({
                    orcamentoId: data.id,
                    solicitacaoId: data.solicitacao_id,
                    motivo: motivoRecusa,
                  })
                  setMotivoRecusa('')
                }}
              >
                Confirmar Recusa
              </Button>
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}
