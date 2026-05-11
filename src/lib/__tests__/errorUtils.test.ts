import { describe, it, expect } from 'vitest'
import { parseApiError } from '../errorUtils'

describe('parseApiError', () => {
  it('Test 1: retorna mensagem amigável para code 23505 (email duplicado)', () => {
    expect(parseApiError({ code: '23505' })).toBe('Este e-mail já está cadastrado')
  })

  it('Test 2: retorna mensagem amigável para code 42501 (sem permissão)', () => {
    expect(parseApiError({ code: '42501' })).toBe('Você não tem permissão para realizar esta ação')
  })

  it('Test 3: retorna mensagem amigável para message "permission denied for table users"', () => {
    expect(parseApiError({ message: 'permission denied for table users' })).toBe(
      'Você não tem permissão para realizar esta ação'
    )
  })

  it('Test 4: retorna mensagem de conexão para message "Failed to fetch"', () => {
    expect(parseApiError({ message: 'Failed to fetch' })).toBe(
      'Verifique sua conexão e tente novamente'
    )
  })

  it('Test 5: retorna empty string para Error aleatório (caller usa fallback contextual)', () => {
    expect(parseApiError(new Error('something random'))).toBe('')
  })

  it('Test 6: retorna empty string para null (não quebra)', () => {
    expect(parseApiError(null)).toBe('')
  })

  it('Test 7: retorna empty string para undefined (não quebra)', () => {
    expect(parseApiError(undefined)).toBe('')
  })

  it('Test 8: retorna empty string para código não mapeado', () => {
    expect(parseApiError({ code: '99999' })).toBe('')
  })
})
