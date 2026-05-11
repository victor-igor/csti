import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { StickyActionBar } from '../StickyActionBar'

describe('StickyActionBar', () => {
  it('renderiza children', () => {
    render(<StickyActionBar><button>Salvar</button></StickyActionBar>)
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeInTheDocument()
  })

  it('tem data-testid sticky-action-bar', () => {
    render(<StickyActionBar><button>OK</button></StickyActionBar>)
    expect(screen.getByTestId('sticky-action-bar')).toBeInTheDocument()
  })
})
