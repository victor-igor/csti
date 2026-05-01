import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { PageHeader } from '@/components/molecules/PageHeader'
import { BackButton } from '@/components/molecules/BackButton'
import { InfoCard } from '@/components/molecules/InfoCard'
import { TotalSummary } from '@/components/molecules/TotalSummary'
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
    <div className="p-6"><ErrorState message="Orçamento não encontrado" onRetry={refetch} /></div>
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
    <div className="p-6 max-w-3xl">
      <div className="mb-4"><BackButton to="/solicitacoes" /></div>

      <div className="flex items-start justify-between gap-4">
        <PageHeader title={`Orçamento ${data.numero}`} />
        {canDownload && (
          <PdfDownloadButton orcamento={data} itens={itens} prestador={prestadorPdf} />
        )}
      </div>

      {/* Prestador */}
      {prestador && (
        <div className="mt-4 rounded-lg border border-border bg-card p-4">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Prestador</p>
          <UserCard
            name={prestador.nome}
            role={prestador.especialidade ?? 'Prestador'}
          />
        </div>
      )}

      {/* InfoCards */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <InfoCard label="Status" value={<StatusBadge status={data.status} />} />
        {data.prazo_estimado_dias != null && (
          <InfoCard label="Prazo" value={`${data.prazo_estimado_dias} dia(s)`} />
        )}
        <InfoCard
          label="Valor total"
          value={<CurrencyDisplay value={total} className="font-semibold" />}
        />
      </div>

      {/* Itens */}
      <div className="mt-6">
        <h2 className="mb-3 text-sm font-semibold text-foreground">Itens ({itens.length})</h2>
        <div className="space-y-2">
          {itens.map((item) => (
            <ItemOrcamentoRow key={item.id} item={item} />
          ))}
        </div>
      </div>

      {data.observacoes && (
        <div className="mt-6">
          <h2 className="mb-1 text-sm font-semibold text-foreground">Observações</h2>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{data.observacoes}</p>
        </div>
      )}

      <div className="mt-6">
        <TotalSummary subtotal={total} total={total} />
      </div>

      {canAct && (
        <div className="mt-6 flex gap-3">
          <Button
            variant="outline"
            className="flex-1 border-destructive text-destructive hover:bg-destructive/10"
            disabled={isProcessing}
            onClick={() => setConfirmRecusar(true)}
          >
            {recusando && <Loader2 className="size-4 animate-spin" />}
            Recusar
          </Button>
          <Button
            className="flex-1 bg-green-600 text-white hover:bg-green-700"
            disabled={isProcessing}
            onClick={() => setConfirmAprovar(true)}
          >
            {aprovando && <Loader2 className="size-4 animate-spin" />}
            Aprovar
          </Button>
        </div>
      )}

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

      <ConfirmDialog
        open={confirmRecusar}
        onOpenChange={setConfirmRecusar}
        title="Recusar Orçamento"
        description="Tem certeza que deseja recusar este orçamento?"
        confirmLabel="Recusar"
        loading={recusando}
        onConfirm={() => {
          setConfirmRecusar(false)
          recusar({ orcamentoId: data.id, solicitacaoId: data.solicitacao_id })
        }}
      />
    </div>
  )
}
