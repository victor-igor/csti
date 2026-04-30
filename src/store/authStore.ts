import { create } from 'zustand'
import type { User, Session } from '@supabase/supabase-js'
import type { IProfile } from '@/types/domain'
import { supabase } from '@/lib/supabase'

interface AuthState {
  user: User | null
  profile: IProfile | null
  session: Session | null
  setSession: (user: User, profile: IProfile | null, session: Session) => void
  clearSession: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  session: null,
  setSession: (user, profile, session) => set({ user, profile, session }),
  clearSession: () => set({ user: null, profile: null, session: null }),
}))

// Singleton listener — runs once on module load
supabase.auth.onAuthStateChange(async (_event, session) => {
  if (session?.user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()
    useAuthStore.getState().setSession(session.user, profile, session)
  } else {
    useAuthStore.getState().clearSession()
  }
})
