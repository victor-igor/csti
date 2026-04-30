import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
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
      const { error: profileError } = await supabase.from('profiles').insert({
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
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.senha,
    })
    if (error) return error.message
    navigate('/dashboard')
    return null
  }

  return { register, login }
}
