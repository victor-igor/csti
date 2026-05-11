import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { SolicitacaoCard } from '../SolicitacaoCard'
import type { ISolicitacao } from '@/types/domain'

const mockSolicitacao: ISolicitacao = {
  id: 'abc-123',
  numero: 'SOL-2026-0001',
  titulo: 'Manutenção do servidor principal',
  status: 'aguardando_orcamento',
  categoria: 'hardware',
  equipamento: 'Dell PowerEdge R740',
  descricao: 'Servidor com falha no RAID',
  cliente_id: 'user-1',
  created_at: '2026-05-06T10:00:00Z',
  updated_at: '2026-05-06T10:00:00Z',
  deleted_at: null,
}

describe('SolicitacaoCard', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-08T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('exibe o título da solicitação', () => {
    render(<SolicitacaoCard solicitacao={mockSolicitacao} onClick={vi.fn()} />)
    expect(screen.getByText('Manutenção do servidor principal')).toBeInTheDocument()
  })

  it('exibe a categoria como chip', () => {
    render(<SolicitacaoCard solicitacao={mockSolicitacao} onClick={vi.fn()} />)
    expect(screen.getByText('hardware')).toBeInTheDocument()
  })

  it('exibe o equipamento', () => {
    render(<SolicitacaoCard solicitacao={mockSolicitacao} onClick={vi.fn()} />)
    expect(screen.getByText('Dell PowerEdge R740')).toBeInTheDocument()
  })

  it('exibe data relativa "há 2 dias"', () => {
    render(<SolicitacaoCard solicitacao={mockSolicitacao} onClick={vi.fn()} />)
    expect(screen.getByText('há 2 dias')).toBeInTheDocument()
  })

  it('exibe o número da solicitação', () => {
    render(<SolicitacaoCard solicitacao={mockSolicitacao} onClick={vi.fn()} />)
    expect(screen.getByText('SOL-2026-0001')).toBeInTheDocument()
  })

  it('chama onClick ao ser clicado', () => {
    const onClick = vi.fn()
    render(<SolicitacaoCard solicitacao={mockSolicitacao} onClick={onClick} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('não exibe categoria quando ausente', () => {
    const sem = { ...mockSolicitacao, categoria: null }
    render(<SolicitacaoCard solicitacao={sem} onClick={vi.fn()} />)
    expect(screen.queryByTestId('categoria-chip')).not.toBeInTheDocument()
  })

  it('exibe badge "novo" para cards criados hoje', () => {
    const hoje = { ...mockSolicitacao, created_at: '2026-05-08T08:00:00Z' }
    render(<SolicitacaoCard solicitacao={hoje} onClick={vi.fn()} />)
    expect(screen.getByTestId('badge-novo')).toBeInTheDocument()
  })
})

describe('SolicitacaoCard — variant prestador', () => {
  it('exibe nome do cliente quando variant="prestador" e cliente_nome fornecido', () => {
    const comCliente = { ...mockSolicitacao, cliente_nome: 'João Silva' }
    render(<SolicitacaoCard solicitacao={comCliente} onClick={vi.fn()} variant="prestador" />)
    expect(screen.getByText('João Silva')).toBeInTheDocument()
  })

  it('não exibe nome do cliente quando variant="cliente"', () => {
    const comCliente = { ...mockSolicitacao, cliente_nome: 'João Silva' }
    render(<SolicitacaoCard solicitacao={comCliente} onClick={vi.fn()} variant="cliente" />)
    expect(screen.queryByText('João Silva')).not.toBeInTheDocument()
  })

  it('não exibe data-testid cliente-nome quando cliente_nome é null', () => {
    const semCliente = { ...mockSolicitacao, cliente_nome: null }
    render(<SolicitacaoCard solicitacao={semCliente} onClick={vi.fn()} variant="prestador" />)
    expect(screen.queryByTestId('cliente-nome')).not.toBeInTheDocument()
  })
})
