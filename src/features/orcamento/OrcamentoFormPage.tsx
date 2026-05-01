import { useParams } from 'react-router-dom'
import { useForm, useFieldArray, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Loader2 } from 'lucide-react'
import { PageHeader } from '@/components/molecules/PageHeader'
import { BackButton } from '@/components/molecules/BackButton'
import { FormField } from '@/components/molecules/FormField'
import { TextareaField } from '@/components/molecules/TextareaField'
import { TotalSummary } from '@/components/molecules/TotalSummary'
import { Button } from '@/components/ui/button'
import { LoadingSkeleton } from '@/components/atoms/LoadingSkeleton'
import { ErrorState } from '@/components/atoms/ErrorState'
import { useGetSolicitacao } from '@/features/solicitacao/useSolicitacao'
import {
  CreateOrcamentoSchema,
  type CreateOrcamentoFormData,
} from './orcamentoSchemas'
import { useCreateOrcamento, useEnviarOrcamento } from './useOrcamento'

export default function OrcamentoFormPage() {
  const { solicitacaoId } = useParams<{ solicitacaoId: string }>()
  const { data: solicitacao, isLoading, isError, refetch } = useGetSolicitacao(solicitacaoId ?? '')
  const { mutate: criarOrcamento, isPending: criando } = useCreateOrcamento()
  const { mutateAsync: enviarOrcamento, isPending: enviando } = useEnviarOrcamento()

  const {
    control,
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<CreateOrcamentoFormData>({
    resolver: zodResolver(CreateOrcamentoSchema),
    defaultValues: {
      solicitacao_id: solicitacaoId ?? '',
      prazo_dias: undefined,
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

  function salvarRascunho(data: CreateOrcamentoFormData) {
    criarOrcamento(data)
  }

  async function enviar(data: CreateOrcamentoFormData) {
    // create as rascunho first, then send
    await new Promise<void>((resolve, reject) => {
      criarOrcamento(data, {
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

  if (isLoading) return <div className="p-6"><LoadingSkeleton rows={6} /></div>
  if (isError || !solicitacao) return (
    <div className="p-6">
      <ErrorState message="Solicitação não encontrada" onRetry={refetch} />
    </div>
  )

  const isProcessing = criando || enviando

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-4">
        <BackButton to="/solicitacoes" />
      </div>
      <PageHeader title="Novo Orçamento" />

      {/* Solicitação readonly */}
      <div className="mt-4 rounded-lg border border-border bg-muted/30 p-4">
        <p className="text-xs font-medium text-muted-foreground">Solicitação</p>
        <p className="mt-0.5 font-mono text-xs text-muted-foreground">{solicitacao.numero}</p>
        <p className="mt-1 text-sm font-medium text-foreground">{solicitacao.titulo}</p>
        {solicitacao.descricao && (
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{solicitacao.descricao}</p>
        )}
      </div>

      <form className="mt-6 space-y-6" noValidate>
        {/* Hidden solicitacao_id */}
        <input type="hidden" {...register('solicitacao_id')} />

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

        {/* Itens */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground">Itens do Orçamento</h2>
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
            <p className="mb-2 text-xs text-destructive">{errors.itens.root.message}</p>
          )}
          {errors.itens?.message && (
            <p className="mb-2 text-xs text-destructive">{errors.itens.message}</p>
          )}

          {fields.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Nenhum item adicionado.
            </p>
          )}

          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="rounded-lg border border-border p-3 space-y-2">
                <FormField<CreateOrcamentoFormData>
                  name={`itens.${index}.descricao`}
                  control={control}
                  label="Descrição"
                  placeholder="Ex: Troca de HD"
                />
                <div className="grid grid-cols-2 gap-3">
                  <FormField<CreateOrcamentoFormData>
                    name={`itens.${index}.quantidade`}
                    control={control}
                    label="Quantidade"
                    type="number"
                    min={1}
                  />
                  <FormField<CreateOrcamentoFormData>
                    name={`itens.${index}.valor_unitario`}
                    control={control}
                    label="Valor unitário (R$)"
                    type="number"
                    min={0.01}
                    step="0.01"
                  />
                </div>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => remove(index)}
                  >
                    Remover item
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        <TotalSummary subtotal={total} total={total} />

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            disabled={isProcessing}
            onClick={handleSubmit(salvarRascunho)}
          >
            {criando && <Loader2 className="size-4 animate-spin" />}
            Salvar Rascunho
          </Button>
          <Button
            type="button"
            className="flex-1"
            disabled={isProcessing}
            onClick={handleSubmit(enviar)}
          >
            {enviando && <Loader2 className="size-4 animate-spin" />}
            Enviar Orçamento
          </Button>
        </div>
      </form>
    </div>
  )
}
