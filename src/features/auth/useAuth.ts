import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { parseApiError } from '@/lib/errorUtils'
import type { RegisterFormData, LoginFormData } from './authSchemas'

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
        especialidade: data.especialidade ?? null,
      })
      if (profileError) throw profileError
    }

    navigate('/login', { state: { message: 'Conta criada! Faça login.' } })
  }

  async function login(data: LoginFormData): Promise<string | null> {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.senha,
      })
      if (error) return parseApiError(error) || 'E-mail ou senha incorretos'
      // Navegação fica a cargo do useEffect na LoginPage, que dispara quando o
      // onAuthStateChange (authStore) terminar de buscar o profile e setar a session.
      // Navegar aqui causaria race: ProtectedRoute leria session=null e mandaria pra /login.
      return null
    } catch (err) {
      return err instanceof Error
        ? (parseApiError(err) || 'Erro de conexão. Tente novamente.')
        : 'Erro de conexão. Tente novamente.'
    }
  }

  return { register, login }
}
