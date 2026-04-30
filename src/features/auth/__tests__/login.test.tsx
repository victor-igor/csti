import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

const mockNavigate = vi.fn()

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
    from: vi.fn(),
  },
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: null }),
  }
})

vi.mock('@/store/authStore', () => ({
  useAuthStore: vi.fn(() => null),
}))

import { supabase } from '@/lib/supabase'
import LoginPage from '../LoginPage'

function renderLoginPage() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  )
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('exibe erro de email inválido inline', async () => {
    renderLoginPage()

    fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'nao-e-email' } })
    fireEvent.change(screen.getByLabelText('Senha'), { target: { value: '12345678' } })
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }))

    await waitFor(() => {
      expect(screen.getByText('E-mail inválido')).toBeInTheDocument()
    })
  })

  it('exibe erro de senha curta inline', async () => {
    renderLoginPage()

    fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'user@test.com' } })
    fireEvent.change(screen.getByLabelText('Senha'), { target: { value: '123' } })
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }))

    await waitFor(() => {
      expect(screen.getByText('Mínimo 8 caracteres')).toBeInTheDocument()
    })
  })

  it('exibe erro de credenciais inválidas inline', async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: 'Invalid login credentials' } as never,
    })

    renderLoginPage()

    fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'user@test.com' } })
    fireEvent.change(screen.getByLabelText('Senha'), { target: { value: '12345678' } })
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }))

    await waitFor(() => {
      expect(screen.getByText('Credenciais inválidas. Tente novamente.')).toBeInTheDocument()
    })
  })

  it('redireciona para /dashboard após login bem-sucedido', async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
      data: { user: { id: 'u1' } as never, session: { access_token: 'tok' } as never },
      error: null,
    })

    renderLoginPage()

    fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'user@test.com' } })
    fireEvent.change(screen.getByLabelText('Senha'), { target: { value: '12345678' } })
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }))

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })
  })
})

describe('useAuth.login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('chama signInWithPassword com email e senha corretos', async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
      data: { user: { id: 'u1' } as never, session: { access_token: 'tok' } as never },
      error: null,
    })

    renderLoginPage()

    fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'user@test.com' } })
    fireEvent.change(screen.getByLabelText('Senha'), { target: { value: 'senha123' } })
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }))

    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'user@test.com',
        password: 'senha123',
      })
    })
  })

  it('chama setSession após login bem-sucedido — verifica navigate /dashboard chamado', async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
      data: { user: { id: 'u1' } as never, session: { access_token: 'tok' } as never },
      error: null,
    })

    renderLoginPage()

    fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'user@test.com' } })
    fireEvent.change(screen.getByLabelText('Senha'), { target: { value: 'senha123' } })
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }))

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })
  })
})
