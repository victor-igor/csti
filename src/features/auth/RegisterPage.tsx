import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { RegisterSchema, type RegisterFormData } from './authSchemas'
import { useAuth } from './useAuth'
import { FormField } from '@/components/molecules/FormField'
import { SelectField } from '@/components/molecules/SelectField'
import { formatPhone } from '@/lib/utils'

const ROLE_OPTIONS = [
  { value: 'cliente', label: 'Cliente' },
  { value: 'prestador', label: 'Prestador' },
]

export default function RegisterPage() {
  const { register: registerUser } = useAuth()
  const [serverError, setServerError] = useState<string | null>(null)

  const { control, handleSubmit, watch, formState: { isSubmitting } } = useForm<RegisterFormData>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: { nome: '', email: '', senha: '', confirmar_senha: '', telefone: '', especialidade: '', role: 'cliente', aceita_termos: false },
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
      <div className="w-full max-w-md bg-card rounded-lg border border-border p-8 shadow-card">
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

          <Controller
            name="telefone"
            control={control}
            render={({ field, fieldState }) => (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Telefone <span className="text-xs text-muted-foreground font-normal">(opcional)</span>
                </label>
                <input
                  type="tel"
                  inputMode="tel"
                  placeholder="(11) 99999-9999"
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(formatPhone(e.target.value))}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
                {fieldState.error && (
                  <p className="mt-1 text-xs text-danger">{fieldState.error.message}</p>
                )}
              </div>
            )}
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

          <Controller
            name="aceita_termos"
            control={control}
            render={({ field, fieldState }) => (
              <div>
                <label className="flex items-start gap-2 text-sm text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={field.value === true}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="mt-0.5"
                  />
                  <span>
                    Li e aceito os{' '}
                    <Link to="/termos" className="text-primary hover:underline" target="_blank" rel="noopener">
                      Termos de Uso e Política de Privacidade
                    </Link>
                  </span>
                </label>
                {fieldState.error && (
                  <p className="mt-1 text-xs text-danger">{fieldState.error.message}</p>
                )}
              </div>
            )}
          />

          {serverError && (
            <p className="text-sm text-danger">{serverError}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60 transition-opacity"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Criar Conta
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Já tem uma conta?{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
