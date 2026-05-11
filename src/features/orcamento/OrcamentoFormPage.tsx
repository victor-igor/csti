import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useForm, useFieldArray, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Loader2, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/molecules/PageHeader'
import { BackButton } from '@/components/molecules/BackButton'
import { FormField } from '@/components/molecules/FormField'
import { TextareaField } from '@/components/molecules/TextareaField'
import { TotalSummary } from '@/components/molecules/TotalSummary'
import { Button } from '@/components/ui/button'
import { LoadingSkeleton } from '@/components/atoms/LoadingSkeleton'
import { ErrorState } from '@/components/atoms/ErrorState'
import { CurrencyDisplay } from '@/components/atoms/CurrencyDisplay'
import { useGetSolicitacao } from '@/features/solicitacao/useSolicitacao'
import {
  CreateOrcamentoSchema,
  type CreateOrcamentoFormData,
} from './orcamentoSchemas'
import { useCreateOrcamento, useEnviarOrcamento, useUpdateOrcamento, useGetOrcamento } from './useOrcamento'

export default function OrcamentoFormPage() {
  const params = useParams<{ solicitacaoId?: string; id?: string }>()
  const isEditMode = !!params.id
  const orcamentoId = params.id ?? ''
  const solicitacaoId = params.solicitacaoId ?? ''

  const { data: solicitacao, isLoading: loadingSol, isError: errorSol, refetch: refetchSol } = useGetSolicitacao(solicitacaoId)
  const { data: orcamentoExistente, isLoading: loadingOrc, isError: errorOrc, refetch: refetchOrc } = useGetOrcamento(orcamentoId)

  const createMutation = useCreateOrcamento()
  const updateMutation = useUpdateOrcamento(orcamentoId)
  const { mutate: criarOuAtualizar, isPending: criando } = isEditMode ? updateMutation : createMutation
  const { mutateAsync: enviarOrcamento, isPending: enviando } = useEnviarOrcamento()

  const {
    control,
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm<CreateOrcamentoFormData>({
    resolver: zodResolver(CreateOrcamentoSchema),
    defaultValues: {
      solicitacao_id: solicitacaoId,
      prazo_dias: '' as unknown as number,
      observacoes: '',
      itens: [{ descricao: '', quantidade: 1, valor_unitario: 0 }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'itens' })
  const watchedItens = useWatch({ control, name: 'itens' })

  const total = (watchedItens ?? []).reduce(
    (sum, item) => sum + (item.quantidade ?? 0) * (item.valor_unitario ?? 0),
    0,
  )

  useEffect(() => {
    if (isEditMode && orcamentoExistente) {
      reset({
        solicitacao_id: orcamentoExistente.solicitacao_id,
        prazo_dias: orcamentoExistente.prazo_estimado_dias ?? ('' as unknown as number),
        observacoes: orcamentoExistente.observacoes ?? '',
        itens: (orcamentoExistente.itens_orcamento ?? []).map((i) => ({
          descricao: i.descricao,
          quantidade: i.quantidade,
          valor_unitario: i.valor_unitario,
        })),
      })
    }
  }, [isEditMode, orcamentoExistente, reset])

  function salvarRascunho(data: CreateOrcamentoFormData) {
    criarOuAtualizar(data)
  }

  async function enviar(data: CreateOrcamentoFormData) {
    await new Promise<void>((resolve, reject) => {
      createMutation.mutate(data, {
        onSuccess: async (id) => {
          try {
            await enviarOrcamento({ orcamentoId: id as string, solicitacaoId: data.solicitacao_id })
          } catch (e) {
            reject(e)
          }
          resolve()
        },
        onError: reject,
      })
    })
  }

  const isLoading = isEditMode ? loadingOrc : loadingSol
  const isError = isEditMode ? errorOrc : errorSol
  const refetch = isEditMode ? refetchOrc : refetchSol

  if (isLoading) return <div className="p-6"><LoadingSkeleton rows={6} /></div>
  if (isError || (!isEditMode && !solicitacao) || (isEditMode && !orcamentoExistente)) return (
    <div className="p-6">
      <ErrorState message={isEditMode ? 'Orçamento não encontrado' : 'Solicitação não encontrada'} onRetry={refetch} />
    </div>
  )

  const isProcessing = criando || enviando

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-4">
        <BackButton to={isEditMode ? `/prestador/orcamentos/${orcamentoId}` : '/solicitacoes'} />
      </div>
      <PageHeader title={isEditMode ? 'Editar Rascunho' : `Orçamento para ${solicitacao!.numero}`} />

      {/* Solicitação readonly — só em modo criação */}
      {!isEditMode && solicitacao && (
        <div className="mt-4 rounded-lg border border-border bg-muted/30 p-4">
          <p className="text-xs font-medium text-muted-foreground">Solicitação</p>
          <p className="mt-0.5 font-mono text-xs text-muted-foreground">{solicitacao.numero}</p>
          <p className="mt-1 text-sm font-medium text-foreground">{solicitacao.titulo}</p>
          {solicitacao.descricao && (
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{solicitacao.descricao}</p>
          )}
        </div>
      )}

      <form className="mt-6 grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6 items-start" noValidate>
        {/* Hidden solicitacao_id */}
        <input type="hidden" {...register('solicitacao_id')} />

        {/* Coluna principal */}
        <div className="space-y-6">
          {/* Detalhes */}
          <div className="rounded-md border border-border p-4 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Detalhes</h3>

            <FormField<CreateOrcamentoFormData>
              name="prazo_dias"
              control={control}
              label="Prazo estimado (dias)"
              type="number"
              min={1}
              max={365}
              placeholder="Ex: 7"
            />

            <TextareaField<CreateOrcamentoFormData>
              name="observacoes"
              control={control}
              label="Observações (opcional)"
              rows={3}
            />
          </div>

          {/* Itens */}
          <div className="rounded-md border border-border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Itens do Orçamento</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ descricao: '', quantidade: 1, valor_unitario: 0 })}
              >
                <Plus className="size-4" />
                Adicionar Item
              </Button>
            </div>

            {errors.itens?.root && (
              <p className="text-xs text-danger">{errors.itens.root.message}</p>
            )}
            {errors.itens?.message && (
              <p className="text-xs text-danger">{errors.itens.message}</p>
            )}

            {/* Header de colunas — só em desktop */}
            {fields.length > 0 && (
              <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_auto] gap-2 px-1">
                <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Descrição</span>
                <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Qtd</span>
                <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Unit. (R$)</span>
                <span />
              </div>
            )}

            {fields.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Nenhum item adicionado.
              </p>
            )}

            <div className="space-y-2">
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_auto] gap-2 items-start rounded-md border border-border p-2">
                  <span className="md:hidden text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Item #{index + 1}
                  </span>
                  <FormField<CreateOrcamentoFormData>
                    name={`itens.${index}.descricao`}
                    control={control}
                    label=""
                    placeholder="Ex: Troca de HD"
                  />
                  <FormField<CreateOrcamentoFormData>
                    name={`itens.${index}.quantidade`}
                    control={control}
                    label=""
                    type="number"
                    min={1}
                  />
                  <FormField<CreateOrcamentoFormData>
                    name={`itens.${index}.valor_unitario`}
                    control={control}
                    label=""
                    type="number"
                    min={0.01}
                    step="0.01"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={fields.length <= 1}
                    onClick={() => remove(index)}
                    aria-label="Remover item"
                    className="mt-1 text-muted-foreground hover:text-danger"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Coluna direita sticky */}
        <div className="lg:sticky lg:top-20 space-y-3">
          <TotalSummary subtotal={total} total={total} />

          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={isProcessing}
            onClick={handleSubmit(salvarRascunho)}
          >
            {criando && <Loader2 className="size-4 animate-spin" />}
            {isEditMode ? 'Salvar Alterações' : 'Salvar Rascunho'}
          </Button>
          {!isEditMode && (
            <Button
              type="button"
              className="w-full"
              disabled={isProcessing}
              onClick={handleSubmit(enviar)}
            >
              {enviando && <Loader2 className="size-4 animate-spin" />}
              Enviar Orçamento
            </Button>
          )}
        </div>
      </form>

      {/* F-08 — Barra fixa em mobile (acima do BottomNav) */}
      <div className="fixed bottom-16 left-0 right-0 lg:hidden bg-background border-t border-border p-3 flex justify-between items-center z-10">
        <span className="text-sm text-muted-foreground">Total</span>
        <CurrencyDisplay value={total} className="text-base font-bold" />
      </div>
    </div>
  )
}
