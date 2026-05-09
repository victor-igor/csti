import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getGreeting } from '../greeting'

describe('getGreeting', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('retorna "Bom dia" para horas entre 0 e 11', () => {
    vi.setSystemTime(new Date('2026-05-08T08:00:00'))
    expect(getGreeting('Victor Hugo')).toBe('Bom dia, Victor!')
  })

  it('retorna "Boa tarde" para horas entre 12 e 17', () => {
    vi.setSystemTime(new Date('2026-05-08T15:00:00'))
    expect(getGreeting('Ana')).toBe('Boa tarde, Ana!')
  })

  it('retorna "Boa noite" para horas entre 18 e 23', () => {
    vi.setSystemTime(new Date('2026-05-08T20:00:00'))
    expect(getGreeting('João')).toBe('Boa noite, João!')
  })

  it('usa apenas o primeiro nome quando nome tem múltiplas palavras', () => {
    vi.setSystemTime(new Date('2026-05-08T08:00:00'))
    expect(getGreeting('Maria Fernanda Santos')).toBe('Bom dia, Maria!')
  })
})
