import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { PageContainer } from '../PageContainer'

describe('PageContainer', () => {
  it('renderiza children', () => {
    render(<PageContainer><p>conteúdo</p></PageContainer>)
    expect(screen.getByText('conteúdo')).toBeInTheDocument()
  })

  it('aplica max-w-lg quando maxWidth="lg"', () => {
    const { container } = render(<PageContainer maxWidth="lg"><p>x</p></PageContainer>)
    expect(container.firstChild).toHaveClass('max-w-lg')
  })

  it('não aplica max-w quando maxWidth não fornecido', () => {
    const { container } = render(<PageContainer><p>x</p></PageContainer>)
    expect(container.firstChild).not.toHaveClass('max-w-lg')
    expect(container.firstChild).not.toHaveClass('max-w-sm')
  })
})
