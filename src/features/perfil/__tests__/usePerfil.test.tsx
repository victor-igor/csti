import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'

vi.mock('@/features/perfil/usePerfil', () => ({
  useGetPerfil: vi.fn(),
  useUpdatePerfil: vi.fn(),
}))

vi.mock('@/store/authStore', () => ({
  useAuthStore: vi.fn(() => ({
    user: { id: 'user-123' },
    profile: {
      id: 'user-123',
      nome: 'João Silva',
      email: 'joao@test.com',
      role: 'cliente',
      telefone: null,
      especialidade: null,
    },
  })),
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
  Toaster: () => null,
}))

import { useGetPerfil, useUpdatePerfil } from '@/features/perfil/usePerfil'
import { useAuthStore } from '@/store/authStore'
import PerfilPage from '@/pages/PerfilPage'

function renderPerfilPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <PerfilPage />
      </QueryClientProvider>
    </MemoryRouter>,
  )
}

const mockProfileCliente = {
  id: 'user-123',
  nome: 'João Silva',
  email: 'joao@test.com',
  role: 'cliente' as const,
  telefone: null,
  especialidade: null,
  documento: null,
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
}

const mockProfilePrestador = {
  ...mockProfileCliente,
  role: 'prestador' as const,
  especialidade: 'Redes',
}

describe('PerfilPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useUpdatePerfil).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as never)
  })

  it('exibe UserCard com dados do perfil', () => {
    vi.mocked(useGetPerfil).mockReturnValue({
      data: mockProfileCliente,
      isLoading: false,
    } as never)

    renderPerfilPage()

    expect(screen.getByText('João Silva')).toBeInTheDocument()
    expect(screen.getByText('cliente')).toBeInTheDocument()
  })

  it('campo especialidade não aparece para role=cliente', () => {
    vi.mocked(useGetPerfil).mockReturnValue({
      data: mockProfileCliente,
      isLoading: false,
    } as never)

    renderPerfilPage()

    expect(screen.queryByLabelText('Especialidade')).not.toBeInTheDocument()
  })

  it('campo especialidade aparece para role=prestador', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: { id: 'user-123' },
      profile: mockProfilePrestador,
    } as never)

    vi.mocked(useGetPerfil).mockReturnValue({
      data: mockProfilePrestador,
      isLoading: false,
    } as never)

    renderPerfilPage()

    expect(screen.getByLabelText('Especialidade')).toBeInTheDocument()
  })

  it('abre ConfirmDialog ao clicar Salvar', async () => {
    vi.mocked(useGetPerfil).mockReturnValue({
      data: mockProfileCliente,
      isLoading: false,
    } as never)

    renderPerfilPage()

    fireEvent.click(screen.getByRole('button', { name: /salvar/i }))

    await waitFor(() => {
      expect(screen.getByText('Salvar alterações')).toBeInTheDocument()
    })
  })
})
