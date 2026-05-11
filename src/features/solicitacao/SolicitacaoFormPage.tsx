import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { FormField } from '@/components/molecules/FormField'
import { TextareaField } from '@/components/molecules/TextareaField'
import { SelectField } from '@/components/molecules/SelectField'
import { PageHeader } from '@/components/molecules/PageHeader'
import { BackButton } from '@/components/molecules/BackButton'
import { CreateSolicitacaoSchema, type CreateSolicitacaoFormData } from './solicitacaoSchemas'
import { useCreateSolicitacao } from './useSolicitacao'

const CATEGORIA_OPTIONS = [
  { value: 'hardware', label: 'Hardware' },
  { value: 'software', label: 'Software' },
  { value: 'rede', label: 'Rede' },
  { value: 'segurança', label: 'Segurança' },
  { value: 'suporte', label: 'Suporte' },
  { value: 'outro', label: 'Outro' },
]

export default function SolicitacaoFormPage() {
  const { mutate, isPending } = useCreateSolicitacao()
  const { control, handleSubmit, formState: { isSubmitting } } = useForm<CreateSolicitacaoFormData>({
    resolver: zodResolver(CreateSolicitacaoSchema),
    defaultValues: {
      titulo: '',
      descricao: '',
      categoria: '' as CreateSolicitacaoFormData['categoria'],
      equipamento: '',
      urgencia: 'media',
      prazo_desejado: '',
    },
  })

  function onSubmit(data: CreateSolicitacaoFormData) {
    mutate(data)
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-4">
        <BackButton to="/solicitacoes" />
      </div>
      <PageHeader title="Nova Solicitação" />
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4 mt-4">
        <FormField<CreateSolicitacaoFormData>
          name="titulo"
          control={control}
          label="Título"
          placeholder="Descreva brevemente o problema"
          maxLength={100}
        />
        <SelectField<CreateSolicitacaoFormData>
          name="categoria"
          control={control}
          label="Categoria"
          options={CATEGORIA_OPTIONS}
          placeholder="Selecione uma categoria"
        />
        <FormField<CreateSolicitacaoFormData>
          name="equipamento"
          control={control}
          label="Equipamento / Dispositivo (opcional)"
          placeholder="Ex: Notebook Dell Inspiron, Roteador TP-Link..."
          maxLength={200}
        />
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Urgência</label>
          <div className="flex gap-2">
            {[
              { value: 'baixa', label: 'Baixa', color: 'border-green-500 text-green-700 data-[checked=true]:bg-green-50' },
              { value: 'media', label: 'Média', color: 'border-amber-500 text-amber-700 data-[checked=true]:bg-amber-50' },
              { value: 'urgente', label: 'Urgente', color: 'border-red-500 text-red-700 data-[checked=true]:bg-red-50' },
            ].map((opt) => (
              <Controller
                key={opt.value}
                name="urgencia"
                control={control}
                render={({ field }) => (
                  <button
                    type="button"
                    data-checked={field.value === opt.value}
                    onClick={() => field.onChange(opt.value)}
                    className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${opt.color}`}
                  >
                    {opt.label}
                  </button>
                )}
              />
            ))}
          </div>
        </div>
        <Controller
          name="prazo_desejado"
          control={control}
          render={({ field }) => (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Prazo Desejado <span className="text-xs text-muted-foreground font-normal">(opcional)</span>
              </label>
              <input
                type="date"
                value={field.value ?? ''}
                onChange={(e) => field.onChange(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
          )}
        />
        <TextareaField<CreateSolicitacaoFormData>
          name="descricao"
          control={control}
          label="Descrição"
          placeholder="Descreva o problema com detalhes (mín. 10 caracteres)"
          rows={5}
          maxLength={2000}
        />
        <button
          type="submit"
          disabled={isPending || isSubmitting}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60 transition-opacity"
        >
          {(isPending || isSubmitting) && <Loader2 className="h-4 w-4 animate-spin" />}
          Enviar Solicitação
        </button>
      </form>
    </div>
  )
}
