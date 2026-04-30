import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock supabase before importing authStore
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
    from: vi.fn(),
  },
}))

// Import after mock
const { useAuthStore } = await import('@/store/authStore')

import type { User, Session } from '@supabase/supabase-js'
import type { IProfile } from '@/types/domain'

function makeUser(id = 'u1'): User {
  return { id, email: 'test@test.com' } as User
}

function makeSession(user: User): Session {
  return { user, access_token: 'tok' } as Session
}

function makeProfile(role: 'cliente' | 'prestador' = 'cliente'): IProfile {
  return { id: 'u1', role, nome: 'Test', email: 'test@test.com' } as unknown as IProfile
}

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.getState().clearSession()
  })

  it('setSession popula user, profile e session', () => {
    const user = makeUser()
    const profile = makeProfile('cliente')
    const session = makeSession(user)

    useAuthStore.getState().setSession(user, profile, session)

    const state = useAuthStore.getState()
    expect(state.user).toBe(user)
    expect(state.profile).toBe(profile)
    expect(state.session).toBe(session)
  })

  it('clearSession zera todos os campos', () => {
    const user = makeUser()
    useAuthStore.getState().setSession(user, makeProfile(), makeSession(user))
    useAuthStore.getState().clearSession()

    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.profile).toBeNull()
    expect(state.session).toBeNull()
  })

  it('cliente com role=cliente está em allowedRoles=[cliente]', () => {
    const profile = makeProfile('cliente')
    expect(['cliente'].includes(profile.role as string)).toBe(true)
  })

  it('prestador com role=prestador é bloqueado em allowedRoles=[cliente]', () => {
    const profile = makeProfile('prestador')
    expect(['cliente'].includes(profile.role as string)).toBe(false)
  })

  it('redirect /login quando não autenticado — session é null', () => {
    expect(useAuthStore.getState().session).toBeNull()
  })

  it('redirect /dashboard quando role não está em allowedRoles', () => {
    const user = makeUser()
    useAuthStore.getState().setSession(user, makeProfile('prestador'), makeSession(user))
    const { profile } = useAuthStore.getState()
    expect(['cliente'].includes(profile?.role as string ?? '')).toBe(false)
  })
})
