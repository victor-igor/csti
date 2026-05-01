import { z } from 'zod'

export const ItemOrcamentoSchema = z.object({
  descricao: z.string().min(1, 'Descrição obrigatória'),
  quantidade: z.number().int().positive('Deve ser > 0'),
  valor_unitario: z.number().positive('Deve ser > 0'),
})

export const CreateOrcamentoSchema = z.object({
  solicitacao_id: z.string().uuid(),
  prazo_dias: z
    .number()
    .int()
    .positive('Deve ser maior que zero')
    .max(365, 'Máximo 365 dias'),
  observacoes: z.string().optional(),
  itens: z.array(ItemOrcamentoSchema).min(1, 'Adicione pelo menos 1 item'),
})

export type CreateOrcamentoFormData = z.infer<typeof CreateOrcamentoSchema>
export type ItemOrcamentoFormData = z.infer<typeof ItemOrcamentoSchema>
