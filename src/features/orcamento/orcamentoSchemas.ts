import { z } from 'zod'

export const ItemOrcamentoSchema = z.object({
  descricao: z.string().min(1, 'Informe a descrição do item'),
  quantidade: z
    .coerce
    .number({ invalid_type_error: 'Digite apenas números' })
    .int('Deve ser um número inteiro')
    .positive('Deve ser maior que zero'),
  valor_unitario: z
    .coerce
    .number({ invalid_type_error: 'Digite apenas números' })
    .positive('Deve ser maior que zero'),
})

export const CreateOrcamentoSchema = z.object({
  solicitacao_id: z.string().uuid(),
  prazo_dias: z
    .coerce
    .number({ invalid_type_error: 'Digite apenas números' })
    .int('Deve ser um número inteiro')
    .positive('Deve ser maior que zero')
    .max(365, 'Máximo 365 dias'),
  observacoes: z.string().optional(),
  itens: z.array(ItemOrcamentoSchema).min(1, 'Adicione pelo menos 1 item'),
})

export type CreateOrcamentoFormData = z.infer<typeof CreateOrcamentoSchema>
export type ItemOrcamentoFormData = z.infer<typeof ItemOrcamentoSchema>
