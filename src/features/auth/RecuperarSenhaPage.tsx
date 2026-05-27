import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, ArrowLeft, MailCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'

const BG_VIDEO_URL = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_145119_f4ec4d9f-3ecd-4116-baa3-26e8cf2df976.mp4'

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return

    setLoading(true)
    setError(null)

    const { error: authError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    })

    setLoading(false)

    if (authError) {
      // Não expor se o e-mail existe ou não — mensagem genérica
      setError('Não foi possível processar a solicitação. Tente novamente.')
      return
    }

    setSent(true)
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
      {/* Vídeo de fundo */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src={BG_VIDEO_URL}
        autoPlay
        loop
        muted
        playsInline
      />
      <div className="absolute inset-0 bg-black/20" />

      {/* Logo */}
      <div className="absolute top-6 left-8 z-20">
        <img src="/logo+texto.png" alt="CSTI" className="h-40 object-contain brightness-0" />
      </div>

      <div className="relative z-10 w-full max-w-md mx-4 bg-white rounded-2xl p-8 shadow-2xl">
        {sent ? (
          /* Estado de sucesso */
          <div className="flex flex-col items-center text-center gap-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-green-100">
              <MailCheck className="h-7 w-7 text-green-600" />
            </div>
            <h1 className="text-xl font-semibold text-neutral-900">Verifique seu e-mail</h1>
            <p className="text-sm text-neutral-500">
              Se o endereço <strong className="text-neutral-700">{email}</strong> estiver cadastrado,
              você receberá um link para redefinir sua senha em breve.
            </p>
            <p className="text-xs text-neutral-400">
              Não recebeu? Verifique a pasta de spam ou tente novamente.
            </p>
            <div className="flex flex-col gap-2 w-full mt-2">
              <Button variant="outline" className="w-full" onClick={() => setSent(false)}>
                Tentar com outro e-mail
              </Button>
              <Link
                to="/login"
                className="text-sm text-center text-primary font-medium hover:underline"
              >
                Voltar para o login
              </Link>
            </div>
          </div>
        ) : (
          /* Formulário */
          <>
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-800 mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para o login
            </Link>

            <h1 className="text-2xl font-semibold text-neutral-900 mb-2">Recuperar senha</h1>
            <p className="text-sm text-neutral-500 mb-6">
              Informe seu e-mail e enviaremos um link para redefinir sua senha.
            </p>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  E-mail
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                  autoComplete="email"
                  required
                  disabled={loading}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
                />
              </div>

              {error && <p className="text-sm text-danger">{error}</p>}

              <Button type="submit" disabled={loading || !email.trim()} className="w-full h-11 text-base">
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Enviar link de recuperação
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
