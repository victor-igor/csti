import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Dialog } from '@base-ui/react'
import { Button } from '@/components/ui/button'
import { FormField } from '@/components/molecules/FormField'
import { TextareaField } from '@/components/molecules/TextareaField'
import { SelectField } from '@/components/molecules/SelectField'
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

export default function SolicitacaoFormDialog() {
  const navigate = useNavigate()
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

  function onClose() {
    navigate('/solicitacoes')
  }

  function onSubmit(data: CreateSolicitacaoFormData) {
    mutate(data)
  }

  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[300]" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[400] w-[calc(100%-2rem)] max-w-xl rounded-xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 shrink-0">
            <Dialog.Title className="text-base font-semibold text-neutral-900">
              Nova Solicitação
            </Dialog.Title>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
              aria-label="Fechar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Scrollable body */}
          <form
            id="form-nova-solicitacao"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="flex-1 overflow-y-auto px-6 py-5 space-y-4"
          >
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
                    Prazo Desejado{' '}
                    <span className="text-xs text-muted-foreground font-normal">(opcional)</span>
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
          </form>

          {/* Footer — Stripe-style sticky */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-100 shrink-0">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              form="form-nova-solicitacao"
              type="submit"
              disabled={isSubmitting || isPending}
            >
              {(isSubmitting || isPending) && (
                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
              )}
              Enviar Solicitação
            </Button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
