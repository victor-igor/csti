import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import SolicitacaoDetailPage from '../SolicitacaoDetailPage'

const mockSupabase = vi.hoisted(() => ({
  auth: {
    onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
  },
  from: vi.fn(),
  select: vi.fn(),
  is: vi.fn(),
  eq: vi.fn(),
  order: vi.fn(),
  single: vi.fn(),
  maybeSingle: vi.fn(),
}))

vi.mock('@/lib/supabase', () => ({
  supabase: mockSupabase,
}))

// Mock do window.HTMLElement.prototype.scrollIntoView que não existe no jsdom
window.HTMLElement.prototype.scrollIntoView = vi.fn()

vi.mock('../useSolicitacao', () => ({
  useGetSolicitacao: () => ({
    data: mockSolicitacao,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
  useCancelSolicitacao: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
  useListMensagensSolicitacao: () => ({
    data: [],
    isLoading: false,
  }),
  useEnviarMensagemSolicitacao: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}))

const mockSolicitacao = {
  id: 'sol-1',
  numero: 'SOL-2026-0001',
  titulo: 'Manutenção',
  descricao: 'Desc',
  status: 'orcamento_enviado',
  categoria: 'hardware',
  equipamento: null,
  cliente_id: 'user-1',
  created_at: '2026-05-01T10:00:00Z',
  updated_at: '2026-05-01T10:00:00Z',
  deleted_at: null,
}

const mockOrcamento = { id: 'orc-123', status: 'enviado' }

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={['/solicitacoes/sol-1']}>
        <Routes>
          <Route path="/solicitacoes/:id" element={<SolicitacaoDetailPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('SolicitacaoDetailPage', () => {
  it('exibe link "Ver Orçamento" apontando para o orçamento específico quando status é orcamento_enviado', async () => {
    mockSupabase.from.mockReturnThis()
    mockSupabase.select.mockReturnThis()
    mockSupabase.eq.mockReturnThis()
    mockSupabase.is.mockReturnThis()
    mockSupabase.single.mockResolvedValueOnce({ data: mockOrcamento, error: null })

    renderPage()
    const links = await screen.findAllByRole('link', { name: /ver orçamento/i })
    expect(links[0]).toHaveAttribute('href', '/orcamentos/orc-123/revisar')
  })
})
