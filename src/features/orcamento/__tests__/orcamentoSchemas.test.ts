import { describe, it, expect } from 'vitest'
import { CreateOrcamentoSchema } from '../orcamentoSchemas'

const validItem = { descricao: 'Servico', quantidade: 1, valor_unitario: 100 }
const validBase = {
  solicitacao_id: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
  prazo_dias: 10,
  itens: [validItem],
}

describe('CreateOrcamentoSchema', () => {
  it('aceita dados validos', () => {
    const result = CreateOrcamentoSchema.safeParse(validBase)
    expect(result.success).toBe(true)
  })

  it('rejeita itens array vazio', () => {
    const result = CreateOrcamentoSchema.safeParse({ ...validBase, itens: [] })
    expect(result.success).toBe(false)
    expect(JSON.stringify(result.error?.issues)).toContain('item')
  })

  it('rejeita prazo_dias = 0', () => {
    const result = CreateOrcamentoSchema.safeParse({ ...validBase, prazo_dias: 0 })
    expect(result.success).toBe(false)
  })

  it('rejeita prazo_dias = 400 (max 365)', () => {
    const result = CreateOrcamentoSchema.safeParse({ ...validBase, prazo_dias: 400 })
    expect(result.success).toBe(false)
    expect(JSON.stringify(result.error?.issues)).toContain('365')
  })

  it('rejeita valor_unitario negativo', () => {
    const result = CreateOrcamentoSchema.safeParse({
      ...validBase,
      itens: [{ ...validItem, valor_unitario: -1 }],
    })
    expect(result.success).toBe(false)
  })

  it('rejeita valor_unitario = 0', () => {
    const result = CreateOrcamentoSchema.safeParse({
      ...validBase,
      itens: [{ ...validItem, valor_unitario: 0 }],
    })
    expect(result.success).toBe(false)
  })

  it('rejeita descricao vazia', () => {
    const result = CreateOrcamentoSchema.safeParse({
      ...validBase,
      itens: [{ ...validItem, descricao: '' }],
    })
    expect(result.success).toBe(false)
    expect(JSON.stringify(result.error?.issues)).toContain('descri')
  })
})
