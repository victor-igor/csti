import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useListSolicitacoes, useGetSolicitacao, useListSolicitacoesParaPrestador } from '../useSolicitacao'

const mockSupabase = vi.hoisted(() => ({
  auth: {
    onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
  },
  from: vi.fn(),
  select: vi.fn(),
  is: vi.fn(),
  order: vi.fn(),
  eq: vi.fn(),
  single: vi.fn(),
}))

vi.mock('@/lib/supabase', () => ({
  supabase: mockSupabase,
}))

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useListSolicitacoes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabase.from.mockReturnThis()
    mockSupabase.select.mockReturnThis()
    mockSupabase.is.mockReturnThis()
    mockSupabase.eq.mockReturnThis()
    mockSupabase.order.mockReturnThis()
  })

  it('retorna lista quando supabase retorna dados', async () => {
    const mockData = [
      { id: '1', titulo: 'Solicitacao 1', status: 'aberta' },
      { id: '2', titulo: 'Solicitacao 2', status: 'aguardando_orcamento' },
    ]

    mockSupabase.order.mockResolvedValueOnce({ data: mockData, error: null })

    const { result } = renderHook(() => useListSolicitacoes(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockData)
  })

  it('filtra por status quando filtro é passado', async () => {
    const mockData = [{ id: '1', titulo: 'Solicitacao 1', status: 'aberta' }]

    // With filter: chain is from→select→is→order→eq→await, so eq must resolve
    mockSupabase.eq.mockResolvedValueOnce({ data: mockData, error: null })

    const { result } = renderHook(() => useListSolicitacoes({ status: 'aberta' }), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockSupabase.eq).toHaveBeenCalledWith('status', 'aberta')
    expect(result.current.data).toEqual(mockData)
  })

  it('retorna lista vazia quando supabase retorna array vazio', async () => {
    mockSupabase.order.mockResolvedValueOnce({ data: [], error: null })

    const { result } = renderHook(() => useListSolicitacoes(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([])
  })
})

describe('useGetSolicitacao', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabase.from.mockReturnThis()
    mockSupabase.select.mockReturnThis()
    mockSupabase.is.mockReturnThis()
    mockSupabase.eq.mockReturnThis()
    mockSupabase.order.mockReturnThis()
    mockSupabase.single.mockReturnThis()
  })

  it('retorna solicitação quando id é válido', async () => {
    const mockSolicitacao = { id: 'abc-123', titulo: 'Solicitacao Teste', status: 'aberta' }

    mockSupabase.single.mockResolvedValueOnce({ data: mockSolicitacao, error: null })

    const { result } = renderHook(() => useGetSolicitacao('abc-123'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockSolicitacao)
  })

  it('não executa query quando id está vazio', () => {
    const { result } = renderHook(() => useGetSolicitacao(''), {
      wrapper: createWrapper(),
    })

    expect(result.current.fetchStatus).toBe('idle')
  })
})

describe('useListSolicitacoesParaPrestador', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabase.from.mockReturnThis()
    mockSupabase.select.mockReturnThis()
    mockSupabase.is.mockReturnThis()
    mockSupabase.eq.mockReturnThis()
    mockSupabase.order.mockReturnThis()
  })

  it('retorna apenas solicitações aguardando_orcamento', async () => {
    const mockData = [
      { id: '1', titulo: 'Solicitacao 1', status: 'aguardando_orcamento' },
      { id: '2', titulo: 'Solicitacao 2', status: 'aguardando_orcamento' },
    ]

    mockSupabase.order.mockResolvedValueOnce({ data: mockData, error: null })

    const { result } = renderHook(() => useListSolicitacoesParaPrestador(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockSupabase.eq).toHaveBeenCalledWith('status', 'aguardando_orcamento')
    expect(mockSupabase.is).toHaveBeenCalledWith('deleted_at', null)
    expect(result.current.data).toEqual(mockData)
  })
})
