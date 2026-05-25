import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FormField } from '@/components/molecules/FormField'
import { TextareaField } from '@/components/molecules/TextareaField'
import { SelectField } from '@/components/molecules/SelectField'
import { DatePickerField } from '@/components/molecules/DatePickerField'
import { CreateSolicitacaoSchema, type CreateSolicitacaoFormData } from '../solicitacaoSchemas'
import { useUpdateSolicitacao } from '../useSolicitacao'
import type { ISolicitacao } from '@/types/domain'

const CATEGORIA_OPTIONS = [
  { value: 'hardware', label: 'Hardware' },
  { value: 'software', label: 'Software' },
  { value: 'rede', label: 'Rede' },
  { value: 'segurança', label: 'Segurança' },
  { value: 'suporte', label: 'Suporte' },
  { value: 'outro', label: 'Outro' },
]

interface EditSolicitacaoFormProps {
  solicitacao: ISolicitacao
  onCancel: () => void
  onSuccess: () => void
}

export function EditSolicitacaoForm({ solicitacao, onCancel, onSuccess }: EditSolicitacaoFormProps) {
  const { mutate, isPending } = useUpdateSolicitacao(solicitacao.id)

  const { control, handleSubmit, formState: { isSubmitting } } = useForm<CreateSolicitacaoFormData>({
    resolver: zodResolver(CreateSolicitacaoSchema),
    defaultValues: {
      titulo: solicitacao.titulo,
      descricao: solicitacao.descricao,
      categoria: solicitacao.categoria as any,
      equipamento: solicitacao.equipamento ?? '',
      urgencia: (solicitacao.urgencia ?? 'media') as any,
      prazo_desejado: solicitacao.prazo_desejado ? new Date(solicitacao.prazo_desejado).toISOString().split('T')[0] : '',
    },
  })

  function onSubmit(data: CreateSolicitacaoFormData) {
    mutate(data, {
      onSuccess: () => {
        onSuccess()
      },
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
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
          {([
            { value: 'baixa',   label: 'Baixa',   color: 'border-green-500 text-green-700 data-[checked=true]:bg-green-50' },
            { value: 'media',   label: 'Média',   color: 'border-amber-500 text-amber-700 data-[checked=true]:bg-amber-50' },
            { value: 'urgente', label: 'Urgente', color: 'border-red-500   text-red-700   data-[checked=true]:bg-red-50' },
          ] as const).map((opt) => (
            <Controller
              key={opt.value}
              name="urgencia"
              control={control}
              render={({ field }) => (
                <button
                  type="button"
                  data-checked={field.value === opt.value}
                  onClick={() => field.onChange(opt.value)}
                  className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${opt.color}`}
                >
                  {opt.label}
                </button>
              )}
            />
          ))}
        </div>
      </div>

      <DatePickerField<CreateSolicitacaoFormData>
        name="prazo_desejado"
        control={control}
        label="Prazo Desejado"
        placeholder="Selecione uma data"
        optional
      />

      <TextareaField<CreateSolicitacaoFormData>
        name="descricao"
        control={control}
        label="Descrição"
        placeholder="Descreva o problema com detalhes (mín. 10 caracteres)"
        rows={5}
        maxLength={2000}
      />

      <div className="flex justify-end gap-3 pt-3 border-t border-neutral-100">
        <Button variant="outline" type="button" onClick={onCancel} disabled={isSubmitting || isPending}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting || isPending}>
          {(isSubmitting || isPending) && <Loader2 className="h-4 w-4 animate-spin mr-1.5" />}
          Salvar Alterações
        </Button>
      </div>
    </form>
  )
}
