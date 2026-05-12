import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LoginSchema, type LoginFormData } from './authSchemas'
import { useAuth } from './useAuth'
import { useAuthStore } from '@/store/authStore'
import { FormField } from '@/components/molecules/FormField'

const BG_VIDEO_URL = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_145119_f4ec4d9f-3ecd-4116-baa3-26e8cf2df976.mp4'

export default function LoginPage() {
  const { login } = useAuth()
  const session = useAuthStore((s) => s.session)
  const navigate = useNavigate()
  const location = useLocation()
  const [serverError, setServerError] = useState<string | null>(null)

  const successMessage = (location.state as { message?: string } | null)?.message ?? null

  useEffect(() => {
    if (session) navigate('/dashboard')
  }, [session, navigate])

  const { control, handleSubmit, formState: { isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: '', senha: '' },
  })

  async function onSubmit(data: LoginFormData) {
    setServerError(null)
    const error = await login(data)
    if (error) setServerError('Credenciais inválidas. Tente novamente.')
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
      {/* Vídeo de fundo em tela cheia */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src={BG_VIDEO_URL}
        autoPlay
        loop
        muted
        playsInline
      />
      {/* Overlay sutil sobre o vídeo */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Logo no canto superior esquerdo */}
      <div className="absolute top-6 left-8 z-20">
        <img src="/logo+texto.png" alt="OrçaFácil" className="h-12 object-contain brightness-0 invert" />
      </div>

      {/* Card de login centralizado */}
      <div className="relative z-10 w-full max-w-md mx-4 bg-white rounded-2xl p-8 shadow-2xl">
        <h1 className="text-2xl font-semibold text-neutral-900 mb-6">Acesse sua conta</h1>

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

          <div className="space-y-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-foreground">Senha</span>
              <Link
                to="/recuperar-senha"
                className="text-sm text-primary font-medium hover:underline"
              >
                Esqueceu sua senha?
              </Link>
            </div>
            <FormField<LoginFormData>
              name="senha"
              control={control}
              label=""
              type="password"
              placeholder="Mínimo 8 caracteres"
            />
          </div>

          {serverError && (
            <p className="text-sm text-danger">{serverError}</p>
          )}

          <Button type="submit" disabled={isSubmitting} className="w-full h-11 text-base">
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Entrar
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          Não tem conta ainda?{' '}
          <Link to="/cadastro" className="text-primary font-medium hover:underline">
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  )
}
