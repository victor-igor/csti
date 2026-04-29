import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CurrencyDisplay } from '../CurrencyDisplay'

describe('CurrencyDisplay', () => {
  it('formata 1234.56 como R$ 1.234,56', () => {
    render(<CurrencyDisplay value={1234.56} />)
    expect(screen.getByText(/R\$\s*1\.234,56/)).toBeInTheDocument()
  })
})
