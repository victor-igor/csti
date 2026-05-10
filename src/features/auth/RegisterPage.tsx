import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { RegisterSchema, type RegisterFormData } from './authSchemas'
import { useAuth } from './useAuth'
import { FormField } from '@/components/molecules/FormField'
import { SelectField } from '@/components/molecules/SelectField'

const ROLE_OPTIONS = [
  { value: 'cliente', label: 'Cliente' },
  { value: 'prestador', label: 'Prestador' },
]

export default function RegisterPage() {
  const { register: registerUser } = useAuth()
  const [serverError, setServerError] = useState<string | null>(null)

  const { control, handleSubmit, watch, formState: { isSubmitting } } = useForm<RegisterFormData>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: { nome: '', email: '', senha: '', confirmar_senha: '', telefone: '', especialidade: '', role: 'cliente' },
  })

  const role = watch('role')

  async function onSubmit(data: RegisterFormData) {
    setServerError(null)
    try {
      await registerUser(data)
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Erro ao criar conta.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-md bg-white rounded-xl border border-neutral-200 p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-neutral-800 mb-6">Criar Conta</h1>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <FormField<RegisterFormData>
            name="nome"
            control={control}
            label="Nome"
            placeholder="Seu nome completo"
          />

          <FormField<RegisterFormData>
            name="email"
            control={control}
            label="E-mail"
            type="email"
            placeholder="email@exemplo.com"
          />

          <SelectField<RegisterFormData>
            name="role"
            control={control}
            label="Perfil"
            options={ROLE_OPTIONS}
            placeholder="Selecione um perfil"
          />

          {role === 'prestador' && (
            <FormField<RegisterFormData>
              name="especialidade"
              control={control}
              label="Especialidade"
              placeholder="Ex: Redes, Hardware, Suporte"
            />
          )}

          <FormField<RegisterFormData>
            name="telefone"
            control={control}
            label="Telefone (opcional)"
            type="tel"
            placeholder="(11) 99999-9999"
          />

          <FormField<RegisterFormData>
            name="senha"
            control={control}
            label="Senha"
            type="password"
            placeholder="Mínimo 8 caracteres"
          />

          <FormField<RegisterFormData>
            name="confirmar_senha"
            control={control}
            label="Confirmar senha"
            type="password"
            placeholder="Repita a senha"
          />

          {serverError && (
            <p className="text-sm text-danger">{serverError}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 rounded-md bg-primary py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60 transition-opacity"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Criar Conta
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-neutral-500">
          Já tenho conta{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">
            → Login
          </Link>
        </p>
      </div>
    </div>
  )
}
