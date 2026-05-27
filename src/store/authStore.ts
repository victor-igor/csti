import { create } from 'zustand'
import type { User, Session } from '@supabase/supabase-js'
import type { IProfile } from '@/types/domain'
import { supabase } from '@/lib/supabase'
import { track, trackError } from '@/lib/analytics'

interface AuthState {
  user: User | null
  profile: IProfile | null
  profileError: string | null
  session: Session | null
  setSession: (user: User, profile: IProfile | null, session: Session) => void
  setProfile: (profile: IProfile) => void
  setProfileError: (error: string) => void
  clearSession: () => void
  retryProfileLoad: () => void
}

const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> =>
  Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Profile fetch timed out')), ms)
    ),
  ])

function fetchProfileInBackground(userId: string) {
  const profileStart = performance.now()
  void withTimeout(
    Promise.resolve(
      supabase.from('profiles').select('*').eq('id', userId).single()
    ),
    10_000
  )
    .then(({ data, error }) => {
      if (error) {
        console.error('[authStore] profile fetch failed:', error.message, error.code)
        trackError('profile_load_failed', error, { code: error.code })
        useAuthStore.getState().setProfileError(error.message || 'Falha ao carregar perfil')
        return
      }
      if (data) {
        useAuthStore.getState().setProfile(data as IProfile)
        track('profile_loaded', { time_ms: Math.round(performance.now() - profileStart) })
      }
    })
    .catch((err) => {
      console.error('[authStore] profile fetch threw:', err)
      trackError('profile_load_failed', err)
      useAuthStore.getState().setProfileError(err?.message || 'Falha ao carregar perfil')
    })
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  profileError: null,
  session: null,
  setSession: (user, profile, session) => set({ user, profile, profileError: null, session }),
  setProfile: (profile) => set({ profile, profileError: null }),
  setProfileError: (error) => set({ profileError: error }),
  clearSession: () => set({ user: null, profile: null, profileError: null, session: null }),
  retryProfileLoad: () => {
    const { user } = get()
    if (!user) return
    set({ profileError: null })
    fetchProfileInBackground(user.id)
  },
}))

// Singleton listener — runs once on module load.
// Padrão: setar a session IMEDIATAMENTE quando o auth event chega, sem esperar pelo
// profile fetch. Motivo: o cliente supabase-js dispara SIGNED_IN no page reload (com
// sessão em cache) ANTES do HTTP client estar pronto para PostgREST — a primeira query
// trava sem responder. Esperar o profile bloqueia o app por segundos (ou indefinidamente),
// causando bounce do ProtectedRoute pra /login. Solução: liberar a UI imediatamente,
// buscar o profile em background e atualizar o store quando chegar.
supabase.auth.onAuthStateChange((event, session) => {
  if (session?.user) {
    useAuthStore.getState().setSession(session.user, null, session)
    track('session_ready', { event })
    fetchProfileInBackground(session.user.id)
  } else {
    if (event === 'SIGNED_OUT') track('logout')
    useAuthStore.getState().clearSession()
  }
})
