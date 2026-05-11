import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import { ListPageShell } from '../ListPageShell'

function Wrapper({ children }: { children: React.ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>
}

describe('ListPageShell', () => {
  it('exibe o título', () => {
    render(
      <ListPageShell title="Minhas Solicitações" search="" onSearchChange={vi.fn()} resultCount={3} totalCount={5}>
        <p>card</p>
      </ListPageShell>,
      { wrapper: Wrapper },
    )
    expect(screen.getByText('Minhas Solicitações')).toBeInTheDocument()
  })

  it('exibe subtitle quando fornecido', () => {
    render(
      <ListPageShell title="Lista" subtitle="3 abertas" search="" onSearchChange={vi.fn()} resultCount={3} totalCount={3}>
        <p>x</p>
      </ListPageShell>,
      { wrapper: Wrapper },
    )
    expect(screen.getByText('3 abertas')).toBeInTheDocument()
  })

  it('renderiza children', () => {
    render(
      <ListPageShell title="Lista" search="" onSearchChange={vi.fn()} resultCount={1} totalCount={1}>
        <p>item da lista</p>
      </ListPageShell>,
      { wrapper: Wrapper },
    )
    expect(screen.getByText('item da lista')).toBeInTheDocument()
  })
})
