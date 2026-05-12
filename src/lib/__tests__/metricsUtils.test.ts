import { describe, it, expect } from 'vitest'
import { groupOrcamentosByMonth, calcApprovalRate } from '../metricsUtils'

describe('groupOrcamentosByMonth', () => {
  it('retorna 6 meses mesmo sem dados', () => {
    const result = groupOrcamentosByMonth([])
    expect(result).toHaveLength(6)
    result.forEach((m) => {
      expect(m.enviados).toBe(0)
      expect(m.aprovados).toBe(0)
    })
  })

  it('conta enviado, aceito e recusado como enviados', () => {
    const now = new Date().toISOString()
    const orcamentos = [
      { created_at: now, status: 'enviado' },
      { created_at: now, status: 'aceito' },
      { created_at: now, status: 'recusado' },
    ]
    const result = groupOrcamentosByMonth(orcamentos)
    const last = result.at(-1)!
    expect(last.enviados).toBe(3)
    expect(last.aprovados).toBe(1)
  })

  it('ignora status fora do funil (rascunho)', () => {
    const now = new Date().toISOString()
    const orcamentos = [{ created_at: now, status: 'rascunho' }]
    const result = groupOrcamentosByMonth(orcamentos)
    const last = result.at(-1)!
    expect(last.enviados).toBe(0)
  })

  it('ignora datas fora dos últimos 6 meses', () => {
    const old = new Date()
    old.setMonth(old.getMonth() - 7)
    const orcamentos = [{ created_at: old.toISOString(), status: 'aceito' }]
    const result = groupOrcamentosByMonth(orcamentos)
    expect(result.every((m) => m.aprovados === 0)).toBe(true)
  })
})

describe('calcApprovalRate', () => {
  it('retorna 0% quando enviados é zero', () => {
    const data = Array(6).fill({ mes: 'Jan', enviados: 0, aprovados: 0 })
    expect(calcApprovalRate(data).rate).toBe(0)
  })

  it('calcula taxa do último mês corretamente', () => {
    const data = [
      ...Array(4).fill({ mes: 'Jan', enviados: 0, aprovados: 0 }),
      { mes: 'Abr', enviados: 4, aprovados: 2 },
      { mes: 'Mai', enviados: 3, aprovados: 3 },
    ]
    const { rate, delta } = calcApprovalRate(data)
    expect(rate).toBe(100)
    expect(delta).toBe(50)
  })
})
