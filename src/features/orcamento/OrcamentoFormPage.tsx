import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useForm, useFieldArray, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Loader2, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/molecules/PageHeader'
import { BackButton } from '@/components/molecules/BackButton'
import { FormField } from '@/components/molecules/FormField'
import { TextareaField } from '@/components/molecules/TextareaField'
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
  } = useForm<CreateOrcamentoFormData, unknown, CreateOrcamentoFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(CreateOrcamentoSchema) as any,
    defaultValues: {
      solicitacao_id: solicitacaoId,
      prazo_dias: '' as unknown as number,
      observacoes: '',
      itens: [{ descricao: '', quantidade: 1, valor_unitario: 0, tipo: 'servico' }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'itens' })
  const watchedItens = useWatch({ control, name: 'itens' })

  // Agrupamentos de custos por tipo de item
  const servicoTotal = (watchedItens ?? []).reduce(
    (sum, item) => sum + (item.tipo === 'servico' ? (item.quantidade ?? 0) * (item.valor_unitario ?? 0) : 0),
    0,
  )
  const produtoTotal = (watchedItens ?? []).reduce(
    (sum, item) => sum + (item.tipo === 'produto' ? (item.quantidade ?? 0) * (item.valor_unitario ?? 0) : 0),
    0,
  )
  const outrosTotal = (watchedItens ?? []).reduce(
    (sum, item) => sum + (item.tipo === 'outros' ? (item.quantidade ?? 0) * (item.valor_unitario ?? 0) : 0),
    0,
  )
  const total = servicoTotal + produtoTotal + outrosTotal

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
          tipo: i.tipo as 'servico' | 'produto' | 'outros',
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
                onClick={() => append({ descricao: '', quantidade: 1, valor_unitario: 0, tipo: 'servico' })}
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
              <div className="hidden md:grid grid-cols-[3fr_2fr_2fr_auto] gap-4 px-1 items-center mb-1">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">Descrição do Item / Serviço</span>
                <span className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">Tipo de Despesa</span>
                <span className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">Valor Cobrado</span>
                <span />
              </div>
            )}

            {fields.length === 0 && (
              <p className="py-4 text-center text-sm text-neutral-500">
                Nenhum item adicionado.
              </p>
            )}

            <div className="space-y-3">
              {fields.map((field, index) => {
                const tipoAtual = watchedItens?.[index]?.tipo || 'servico'
                const isServico = tipoAtual === 'servico'

                return (
                  <div key={field.id} className="grid grid-cols-1 md:grid-cols-[3fr_2fr_2fr_auto] gap-4 items-center rounded-xl border border-neutral-200 bg-neutral-50/50 p-4 shadow-sm hover:border-neutral-300 transition-colors">
                    <span className="md:hidden text-[11px] font-bold uppercase tracking-wide text-neutral-400">
                      Item #{index + 1}
                    </span>
                    
                    {/* Descrição */}
                    <FormField<CreateOrcamentoFormData>
                      name={`itens.${index}.descricao`}
                      control={control}
                      label=""
                      placeholder={isServico ? "Ex: Mão de obra para troca de HD" : "Ex: HD SSD 240GB Kingston"}
                      className="w-full"
                    />

                    {/* Tipo */}
                    <div className="w-full">
                      <select
                        {...register(`itens.${index}.tipo`)}
                        className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary h-[38px] bg-white text-neutral-700 shadow-sm transition-all cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%236b7280%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:0.65rem_auto] bg-[right_12px_center] bg-no-repeat pr-8"
                      >
                        <option value="servico">Mão de obra</option>
                        <option value="produto">Peça / Produto</option>
                        <option value="outros">Deslocamento / Taxa</option>
                      </select>
                    </div>

                    {/* Quantidade + Valor Unitário */}
                    <div className="flex gap-2 items-center w-full">
                      {tipoAtual === 'produto' ? (
                        <>
                          <div className="w-1/3 min-w-[60px]">
                            <FormField<CreateOrcamentoFormData>
                              name={`itens.${index}.quantidade`}
                              control={control}
                              label=""
                              type="number"
                              min={1}
                              className="w-full text-center"
                            />
                          </div>
                          <div className="w-2/3">
                            <FormField<CreateOrcamentoFormData>
                              name={`itens.${index}.valor_unitario`}
                              control={control}
                              label=""
                              type="number"
                              min={0.01}
                              step="0.01"
                              placeholder="0,00"
                              className="w-full"
                            />
                          </div>
                        </>
                      ) : (
                        <div className="w-full">
                          {/* Campo hidden para submeter quantidade = 1 para mão de obra ou deslocamento */}
                          <input type="hidden" value={1} {...register(`itens.${index}.quantidade`, { valueAsNumber: true })} />
                          <FormField<CreateOrcamentoFormData>
                            name={`itens.${index}.valor_unitario`}
                            control={control}
                            label=""
                            type="number"
                            min={0.01}
                            step="0.01"
                            placeholder={tipoAtual === 'servico' ? "Valor total do serviço" : "Valor do deslocamento / taxa"}
                            className="w-full"
                          />
                        </div>
                      )}
                    </div>

                    {/* Remover */}
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        disabled={fields.length <= 1}
                        onClick={() => remove(index)}
                        aria-label="Remover item"
                        className="text-neutral-400 hover:text-danger hover:bg-danger/10 rounded-lg p-1.5 transition-colors"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Coluna direita sticky */}
        <div className="lg:sticky lg:top-20 space-y-3">
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 space-y-2.5">
            <div className="flex justify-between text-xs text-neutral-500">
              <span>Mão de Obra</span>
              <CurrencyDisplay value={servicoTotal} />
            </div>
            <div className="flex justify-between text-xs text-neutral-500">
              <span>Peças & Materiais</span>
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

          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={isProcessing}
            onClick={() => { void handleSubmit(salvarRascunho)() }}
          >
            {criando && <Loader2 className="size-4 animate-spin" />}
            {isEditMode ? 'Salvar Alterações' : 'Salvar Rascunho'}
          </Button>
          {!isEditMode && (
            <Button
              type="button"
              className="w-full"
              disabled={isProcessing}
              onClick={() => { void handleSubmit(enviar)() }}
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
