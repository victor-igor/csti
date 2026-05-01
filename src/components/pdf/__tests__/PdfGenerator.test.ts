import { vi, describe, it, expect, beforeEach } from 'vitest'

const mocks = vi.hoisted(() => ({
  save: vi.fn(),
  text: vi.fn(),
  line: vi.fn(),
  setFontSize: vi.fn(),
  setFont: vi.fn(),
  setTextColor: vi.fn(),
  setGState: vi.fn(),
  GState: vi.fn((opts: unknown) => opts),
}))

vi.mock('jspdf', () => {
  // Must use regular function (not arrow) so `new jsPDF()` works as a constructor
  function MockJsPDF() {
    return {
      save: mocks.save,
      text: mocks.text,
      line: mocks.line,
      setFontSize: mocks.setFontSize,
      setFont: mocks.setFont,
      setTextColor: mocks.setTextColor,
      setGState: mocks.setGState,
      GState: mocks.GState,
      internal: {
        pageSize: { getWidth: () => 210, getHeight: () => 297 },
      },
    }
  }
  return { default: MockJsPDF }
})

import { generateOrcamentoPdf } from '../PdfGenerator'
import type { IOrcamento, IItemOrcamento, IProfile } from '@/types/domain'

const baseOrcamento: IOrcamento = {
  id: 'orc-1',
  numero: 'ORC-2026-0001',
  status: 'aceito',
  solicitacao_id: 'sol-1',
  prestador_id: 'prest-1',
  observacoes: null,
  prazo_estimado_dias: 5,
  validade_ate: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  deleted_at: null,
}

const itens: IItemOrcamento[] = [
  {
    id: 'item-1',
    orcamento_id: 'orc-1',
    descricao: 'Formatacao',
    quantidade: 2,
    valor_unitario: 150,
    valor_total: 300,
    created_at: '2026-01-01T00:00:00Z',
  },
]

const prestador: Pick<IProfile, 'nome' | 'especialidade' | 'telefone'> = {
  nome: 'Joao Silva',
  especialidade: 'TI',
  telefone: '11999999999',
}

describe('generateOrcamentoPdf', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('salva PDF com nome correto', () => {
    generateOrcamentoPdf(baseOrcamento, itens, prestador)
    expect(mocks.save).toHaveBeenCalledWith('orcamento-ORC-2026-0001.pdf')
  })

  it("adiciona marca dagua apenas para status=enviado", () => {
    const orcamentoEnviado: IOrcamento = { ...baseOrcamento, status: 'enviado' }
    generateOrcamentoPdf(orcamentoEnviado, itens, prestador)
    expect(mocks.setTextColor).toHaveBeenCalledWith(220, 50, 50)
    expect(mocks.setGState).toHaveBeenCalled()
  })

  it("nao adiciona marca dagua para status=aceito", () => {
    generateOrcamentoPdf(baseOrcamento, itens, prestador)
    expect(mocks.setTextColor).not.toHaveBeenCalled()
  })
})
