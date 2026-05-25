import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Button } from '../../ui/button'

describe('Button', () => {
  it('renderiza children', () => {
    render(<Button>Salvar</Button>)
    expect(screen.getByText('Salvar')).toBeInTheDocument()
  })

  it('chama onClick ao clicar', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Clicar</Button>)
    await userEvent.click(screen.getByRole('button', { name: 'Clicar' }))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('desabilita o botão quando disabled=true', () => {
    render(<Button disabled>Desabilitado</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('desabilita e mostra spinner quando loading=true', () => {
    const { container } = render(<Button loading>Enviando</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('renderiza variant secondary sem alterar texto', () => {
    render(<Button variant="secondary">Cancelar</Button>)
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument()
  })

  it('renderiza size sm com classe px-2.5', () => {
    const { container } = render(<Button size="sm">Pequeno</Button>)
    expect(container.firstChild).toHaveClass('px-2.5')
  })
})
