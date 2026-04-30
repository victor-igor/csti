import { z } from 'zod'

export const CATEGORIAS = ['hardware', 'software', 'rede', 'segurança', 'suporte', 'outro'] as const

export const CreateSolicitacaoSchema = z.object({
  titulo: z
    .string()
    .min(3, 'Mínimo 3 caracteres')
    .max(100, 'Máximo 100 caracteres'),
  descricao: z
    .string()
    .min(10, 'Descreva o problema com pelo menos 10 caracteres')
    .max(2000, 'Máximo 2000 caracteres'),
  categoria: z.enum(CATEGORIAS, { error: 'Categoria inválida' }),
})

export type CreateSolicitacaoFormData = z.infer<typeof CreateSolicitacaoSchema>
