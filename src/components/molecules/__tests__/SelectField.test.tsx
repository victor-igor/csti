import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { useForm } from 'react-hook-form'
import { SelectField } from '../SelectField'

const OPTIONS = [
  { value: 'hardware', label: 'Hardware' },
  { value: 'software', label: 'Software' },
]

function Fixture({ defaultValue = '' }: { defaultValue?: string }) {
  const { control } = useForm({ defaultValues: { categoria: defaultValue } })
  return (
    <SelectField
      name="categoria"
      control={control}
      label="Categoria"
      options={OPTIONS}
      placeholder="Selecione"
    />
  )
}

describe('SelectField', () => {
  it('exibe o label', () => {
    render(<Fixture />)
    expect(screen.getByText('Categoria')).toBeInTheDocument()
  })

  it('exibe placeholder quando sem valor selecionado', () => {
    render(<Fixture />)
    expect(screen.getByText('Selecione')).toBeInTheDocument()
  })

  it('abre dropdown e exibe opções ao clicar no trigger', async () => {
    const user = userEvent.setup()
    render(<Fixture />)
    await user.click(screen.getByRole('button', { name: /selecione/i }))
    expect(screen.getByText('Hardware')).toBeInTheDocument()
    expect(screen.getByText('Software')).toBeInTheDocument()
  })

  it('exibe label do valor pré-selecionado no trigger', () => {
    render(<Fixture defaultValue="hardware" />)
    expect(screen.getByRole('button', { name: /hardware/i })).toBeInTheDocument()
  })
})
