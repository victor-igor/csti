import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { relativeDate } from '../dateUtils'

describe('relativeDate', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-08T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('retorna "hoje" para datas do mesmo dia', () => {
    expect(relativeDate('2026-05-08T08:00:00Z')).toBe('hoje')
  })

  it('retorna "ontem" para datas de 1 dia atrás', () => {
    expect(relativeDate('2026-05-07T08:00:00Z')).toBe('ontem')
  })

  it('retorna "há N dias" para datas recentes', () => {
    expect(relativeDate('2026-05-05T08:00:00Z')).toBe('há 3 dias')
  })

  it('retorna data formatada para datas com mais de 30 dias', () => {
    expect(relativeDate('2026-03-01T08:00:00Z')).toBe('01/03/2026')
  })
})
