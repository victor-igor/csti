import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { UrgenciaBadge } from '../UrgenciaBadge'

describe('UrgenciaBadge', () => {
  it.each([
    ['urgente', 'Urgente'],
    ['media', 'Normal'],
    ['baixa', 'Baixa'],
  ])('renderiza label correta para urgencia "%s"', (urgencia, label) => {
    render(<UrgenciaBadge urgencia={urgencia} />)
    expect(screen.getByText(label)).toBeInTheDocument()
  })

  it('não renderiza nada quando urgencia é undefined', () => {
    const { container } = render(<UrgenciaBadge urgencia={undefined} />)
    expect(container.firstChild).toBeNull()
  })

  it('aplica className de danger para urgente', () => {
    const { container } = render(<UrgenciaBadge urgencia="urgente" />)
    expect(container.firstChild).toHaveClass('text-danger')
  })
})
