import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { LoginSchema, type LoginFormData } from './authSchemas'
import { useAuth } from './useAuth'
import { useAuthStore } from '@/store/authStore'
import { FormField } from '@/components/molecules/FormField'

export default function LoginPage() {
  const { login } = useAuth()
  const session = useAuthStore((s) => s.session)
  const navigate = useNavigate()
  const location = useLocation()
  const [serverError, setServerError] = useState<string | null>(null)

  const successMessage = (location.state as { message?: string } | null)?.message ?? null

  useEffect(() => {
    if (session) {
      navigate('/dashboard')
    }
  }, [session, navigate])

  const { control, handleSubmit, formState: { isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: '', senha: '' },
  })

  async function onSubmit(data: LoginFormData) {
    setServerError(null)
    const error = await login(data)
    if (error) {
      setServerError('Credenciais inválidas. Tente novamente.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-md bg-white rounded-xl border border-neutral-200 p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-neutral-800 mb-6">Login</h1>

        {successMessage && (
          <p className="mb-4 text-sm text-green-600">{successMessage}</p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <FormField<LoginFormData>
            name="email"
            control={control}
            label="E-mail"
            type="email"
            placeholder="email@exemplo.com"
          />

          <FormField<LoginFormData>
            name="senha"
            control={control}
            label="Senha"
            type="password"
            placeholder="Mínimo 8 caracteres"
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
            Entrar
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-neutral-500">
          Não tenho conta{' '}
          <Link to="/cadastro" className="text-primary font-medium hover:underline">
            → Cadastro
          </Link>
        </p>
      </div>
    </div>
  )
}
