import { z } from 'zod'

export const CATEGORIAS = ['hardware', 'software', 'rede', 'segurança', 'suporte', 'outro'] as const
export const URGENCIAS = ['baixa', 'media', 'urgente'] as const
export type Urgencia = (typeof URGENCIAS)[number]

export const CreateSolicitacaoSchema = z.object({
  titulo: z
    .string()
    .min(1, 'Informe o título da solicitação')
    .min(3, 'Mínimo 3 caracteres')
    .max(100, 'Máximo 100 caracteres'),
  descricao: z
    .string()
    .min(1, 'Descreva o problema')
    .min(10, 'Descreva o problema com pelo menos 10 caracteres')
    .max(2000, 'Máximo 2000 caracteres'),
  categoria: z.enum(CATEGORIAS, { error: 'Categoria inválida' }),
  equipamento: z.string().max(200, 'Máximo 200 caracteres').optional(),
  urgencia: z.enum(URGENCIAS, { error: 'Selecione a urgência' }),
  prazo_desejado: z.string().optional(),
})

export type CreateSolicitacaoFormData = z.infer<typeof CreateSolicitacaoSchema>
