import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getGreeting } from '../greeting'

describe('getGreeting', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it('retorna "Bom dia" às 8h', () => {
    vi.setSystemTime(new Date('2026-05-08T08:00:00'))
    expect(getGreeting('Victor Hugo')).toBe('Bom dia, Victor!')
  })

  it('retorna "Bom dia" às 0h (meia-noite)', () => {
    vi.setSystemTime(new Date('2026-05-08T00:00:00'))
    expect(getGreeting('Ana')).toBe('Bom dia, Ana!')
  })

  it('retorna "Bom dia" às 11h (última hora da manhã)', () => {
    vi.setSystemTime(new Date('2026-05-08T11:00:00'))
    expect(getGreeting('Ana')).toBe('Bom dia, Ana!')
  })

  it('retorna "Boa tarde" às 12h (primeira hora da tarde)', () => {
    vi.setSystemTime(new Date('2026-05-08T12:00:00'))
    expect(getGreeting('Ana')).toBe('Boa tarde, Ana!')
  })

  it('retorna "Boa tarde" às 15h', () => {
    vi.setSystemTime(new Date('2026-05-08T15:00:00'))
    expect(getGreeting('Ana')).toBe('Boa tarde, Ana!')
  })

  it('retorna "Boa tarde" às 17h (última hora da tarde)', () => {
    vi.setSystemTime(new Date('2026-05-08T17:00:00'))
    expect(getGreeting('Ana')).toBe('Boa tarde, Ana!')
  })

  it('retorna "Boa noite" às 18h (primeira hora da noite)', () => {
    vi.setSystemTime(new Date('2026-05-08T18:00:00'))
    expect(getGreeting('João')).toBe('Boa noite, João!')
  })

  it('retorna "Boa noite" às 20h', () => {
    vi.setSystemTime(new Date('2026-05-08T20:00:00'))
    expect(getGreeting('João')).toBe('Boa noite, João!')
  })

  it('usa apenas o primeiro nome para nome composto', () => {
    vi.setSystemTime(new Date('2026-05-08T08:00:00'))
    expect(getGreeting('Maria Fernanda Santos')).toBe('Bom dia, Maria!')
  })

  it('retorna saudação sem nome quando nome é string vazia', () => {
    vi.setSystemTime(new Date('2026-05-08T08:00:00'))
    expect(getGreeting('')).toBe('Bom dia!')
  })

  it('retorna saudação sem nome quando nome é só espaços', () => {
    vi.setSystemTime(new Date('2026-05-08T08:00:00'))
    expect(getGreeting('   ')).toBe('Bom dia!')
  })
})
