import { describe, it, expect } from 'vitest'
import { STATUS_CONFIG, STATUS_LABELS } from '../constants'

describe('STATUS_CONFIG', () => {
  it('tem entrada para cada status de solicitação', () => {
    const statuses = ['aberta', 'aguardando_orcamento', 'orcamento_enviado', 'aprovado', 'cancelado']
    statuses.forEach(s => {
      expect(STATUS_CONFIG[s]).toBeDefined()
      expect(STATUS_CONFIG[s].label).toBeTruthy()
      expect(STATUS_CONFIG[s].icon).toBeDefined()
      expect(STATUS_CONFIG[s].className).toBeTruthy()
    })
  })

  it('STATUS_LABELS ainda funciona como alias', () => {
    expect(STATUS_LABELS['aprovado'].label).toBe('Aprovado')
  })
})
