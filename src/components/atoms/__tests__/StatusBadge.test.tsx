import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { StatusBadge } from '../StatusBadge'

describe('StatusBadge', () => {
  it.each([
    ['aguardando_orcamento', 'Aguardando Orçamento'],
    ['orcamento_enviado',    'Orçamento Enviado'],
    ['aprovado',             'Aprovado'],
    ['cancelado',            'Cancelado'],
    ['recusado',             'Recusado'],
    ['concluido',            'Concluído'],
    ['concluida',            'Concluída'],
    ['rascunho',             'Rascunho'],
    ['enviado',              'Enviado'],
    ['aberta',               'Aberta'],
    ['em_andamento',         'Em Andamento'],
  ])('renderiza label correta para status "%s"', (status, label) => {
    render(<StatusBadge status={status} />)
    expect(screen.getByText(label)).toBeInTheDocument()
  })

  it('renderiza um ícone svg junto ao label', () => {
    const { container } = render(<StatusBadge status="aprovado" />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('renderiza fallback para status desconhecido', () => {
    render(<StatusBadge status="status_invalido" />)
    expect(screen.getByText('status_invalido')).toBeInTheDocument()
  })
})
