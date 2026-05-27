import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { parseApiError } from '@/lib/errorUtils'

const BG_VIDEO_URL = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_145119_f4ec4d9f-3ecd-4116-baa3-26e8cf2df976.mp4'

export default function RedefinirSenhaPage() {
  const navigate = useNavigate()
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)
  const [hasSession, setHasSession] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)

  // Supabase envia o token de recovery no hash da URL.
  // O listener onAuthStateChange captura o evento PASSWORD_RECOVERY
  // e estabelece a sessão automaticamente.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setHasSession(!!data.session)
      setCheckingSession(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setHasSession(true)
        setCheckingSession(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFieldError(null)
    setServerError(null)

    if (novaSenha.length < 8) {
      setFieldError('A senha deve ter no mínimo 8 caracteres')
      return
    }
    if (novaSenha !== confirmarSenha) {
      setFieldError('As senhas não coincidem')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password: novaSenha })
    setLoading(false)

    if (error) {
      setServerError(parseApiError(error) || 'Erro ao redefinir senha. Tente novamente.')
      return
    }

    // Logout para forçar novo login com a senha atualizada
    await supabase.auth.signOut()
    navigate('/login', { state: { message: 'Senha redefinida com sucesso! Faça login com sua nova senha.' } })
  }

  const inputCls = 'w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50'

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

        {checkingSession ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
          </div>

        ) : !hasSession ? (
          /* Link expirado ou inválido */
          <div className="flex flex-col items-center text-center gap-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-danger/10">
              <ShieldCheck className="h-7 w-7 text-danger" />
            </div>
            <h1 className="text-xl font-semibold text-neutral-900">Link inválido ou expirado</h1>
            <p className="text-sm text-neutral-500">
              O link de recuperação expirou ou já foi utilizado.
              Solicite um novo link e tente novamente.
            </p>
            <Button className="w-full mt-2" onClick={() => navigate('/recuperar-senha')}>
              Solicitar novo link
            </Button>
          </div>

        ) : (
          /* Formulário de nova senha */
          <>
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mx-auto mb-4">
              <ShieldCheck className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-2xl font-semibold text-neutral-900 mb-2 text-center">Redefinir senha</h1>
            <p className="text-sm text-neutral-500 mb-6 text-center">
              Escolha uma nova senha para sua conta.
            </p>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="novaSenha" className="text-sm font-medium text-foreground">
                  Nova senha
                </label>
                <input
                  id="novaSenha"
                  type="password"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                  disabled={loading}
                  className={inputCls}
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="confirmarSenha" className="text-sm font-medium text-foreground">
                  Confirmar nova senha
                </label>
                <input
                  id="confirmarSenha"
                  type="password"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  placeholder="Repita a senha"
                  autoComplete="new-password"
                  disabled={loading}
                  className={inputCls}
                />
              </div>

              {fieldError && <p className="text-sm text-danger">{fieldError}</p>}
              {serverError && <p className="text-sm text-danger">{serverError}</p>}

              <Button
                type="submit"
                disabled={loading || !novaSenha || !confirmarSenha}
                className="w-full h-11 text-base"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Salvar nova senha
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
