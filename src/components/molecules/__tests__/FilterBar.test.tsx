import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { FilterBar } from '../FilterBar'

describe('FilterBar', () => {
  it('renderiza input de busca', () => {
    render(<FilterBar search="" onSearchChange={vi.fn()} />)
    expect(screen.getByPlaceholderText('Buscar...')).toBeInTheDocument()
  })

  it('chama onSearchChange ao digitar', async () => {
    const onSearchChange = vi.fn()
    render(<FilterBar search="" onSearchChange={onSearchChange} />)
    await userEvent.type(screen.getByRole('searchbox'), 'test')
    expect(onSearchChange).toHaveBeenCalled()
  })

  it('exibe contador quando resultCount e totalCount fornecidos', () => {
    render(
      <FilterBar search="" onSearchChange={vi.fn()} resultCount={3} totalCount={10} />
    )
    expect(screen.getByText('Mostrando 3 de 10')).toBeInTheDocument()
  })

  it('não exibe contador quando resultCount não fornecido', () => {
    render(<FilterBar search="" onSearchChange={vi.fn()} />)
    expect(screen.queryByText(/Mostrando/)).not.toBeInTheDocument()
  })

  it('renderiza filters children quando fornecidos', () => {
    render(
      <FilterBar search="" onSearchChange={vi.fn()} filters={<span>chip-test</span>} />
    )
    expect(screen.getByText('chip-test')).toBeInTheDocument()
  })
})
