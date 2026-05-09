import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'

const mockSupabase = vi.hoisted(() => ({
  auth: {
    onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
  },
  from: vi.fn(),
  select: vi.fn(),
  eq: vi.fn(),
}))

vi.mock('@/lib/supabase', () => ({ supabase: mockSupabase }))

vi.mock('@/store/authStore', () => ({
  useAuthStore: vi.fn((selector: (s: { profile: { id: string } }) => unknown) =>
    selector({ profile: { id: 'user-123' } })
  ),
}))

import { useNotificacoesNaoLidas } from '../useNotificacoes'

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: qc }, children)
}

describe('useNotificacoesNaoLidas', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabase.from.mockReturnThis()
    mockSupabase.select.mockReturnThis()
  })

  it('retorna 0 quando não há notificações não lidas', async () => {
    mockSupabase.eq
      .mockReturnValueOnce(mockSupabase)
      .mockResolvedValueOnce({ count: 0, error: null })

    const { result } = renderHook(() => useNotificacoesNaoLidas(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toBe(0)
  })

  it('retorna a contagem de notificações não lidas', async () => {
    mockSupabase.eq
      .mockReturnValueOnce(mockSupabase)
      .mockResolvedValueOnce({ count: 3, error: null })

    const { result } = renderHook(() => useNotificacoesNaoLidas(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toBe(3)
  })
})
