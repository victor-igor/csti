import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { parseApiError } from '@/lib/errorUtils'
import { track, trackError } from '@/lib/analytics'
import type { RegisterFormData, LoginFormData } from './authSchemas'
import { useAuthStore } from '@/store/authStore'
import type { IProfile } from '@/types/domain'

export function useAuth() {
  const navigate = useNavigate()

  async function register(data: RegisterFormData): Promise<void> {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.senha,
    })

    if (error) throw error

    if (authData.user) {
      // upsert: trigger may have already inserted a minimal profile row
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: authData.user.id,
        nome: data.nome,
        email: data.email,
        role: data.role,
        telefone: data.telefone ?? null,
        especialidade: data.especialidade ? [data.especialidade] : null,
      })
      if (profileError) throw profileError

      // Fetch the updated profile and save to the store to avoid race condition with auth state change
      const { data: profileData, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single()
      
      if (!fetchError && profileData) {
        useAuthStore.getState().setProfile(profileData as IProfile)
      }
    }

    const hasSession = useAuthStore.getState().session !== null
    if (hasSession) {
      navigate('/dashboard')
    } else {
      navigate('/login', { state: { message: 'Conta criada! Faça login.' } })
    }
  }

  async function login(data: LoginFormData): Promise<string | null> {
    const start = performance.now()
    track('login_attempt')
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.senha,
      })
      if (error) {
        trackError('login_error', error, { reason: 'invalid_credentials' })
        return parseApiError(error) || 'E-mail ou senha incorretos'
      }
      track('login_success', { time_ms: Math.round(performance.now() - start) })
      // Navegação fica a cargo do useEffect na LoginPage, que dispara quando o
      // onAuthStateChange (authStore) terminar de setar a session.
      return null
    } catch (err) {
      trackError('login_error', err, { reason: 'network_or_unknown' })
      return err instanceof Error
        ? (parseApiError(err) || 'Erro de conexão. Tente novamente.')
        : 'Erro de conexão. Tente novamente.'
    }
  }

  return { register, login }
}
