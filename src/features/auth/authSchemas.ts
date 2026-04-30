import { z } from 'zod'

export const RegisterSchema = z
  .object({
    nome: z
      .string()
      .min(1, 'Nome obrigatório')
      .min(2, 'Mínimo 2 caracteres'),
    email: z.string().min(1, 'E-mail obrigatório').email('E-mail inválido'),
    senha: z.string().min(8, 'Mínimo 8 caracteres'),
    confirmar_senha: z.string(),
    role: z.enum(['cliente', 'prestador'], {
      error: 'Selecione um perfil válido',
    }),
    telefone: z.string().optional(),
    especialidade: z.string().optional(),
  })
  .refine((data) => data.senha === data.confirmar_senha, {
    message: 'Senhas não conferem',
    path: ['confirmar_senha'],
  })

export type RegisterFormData = z.infer<typeof RegisterSchema>
