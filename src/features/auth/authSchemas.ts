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
    role: z.enum(['cliente', 'prestador', 'admin', 'super_admin'], {
      error: 'Selecione um perfil válido',
    }),
    telefone: z.string().optional(),
    especialidade: z.string().optional(),
    aceita_termos: z.boolean().refine((v) => v === true, {
      message: 'Você precisa aceitar os Termos de Uso',
    }),
  })
  .refine((data) => data.senha === data.confirmar_senha, {
    message: 'Senhas não conferem',
    path: ['confirmar_senha'],
  })

export type RegisterFormData = z.infer<typeof RegisterSchema>

export const LoginSchema = z.object({
  email: z.string().min(1, 'E-mail obrigatório').email('E-mail inválido'),
  senha: z.string().min(8, 'Mínimo 8 caracteres'),
})

export type LoginFormData = z.infer<typeof LoginSchema>
