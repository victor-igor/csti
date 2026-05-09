import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getGreeting } from '../greeting'

describe('getGreeting', () => {
  // Mock the Date object
  const mockDate = (hour: number) => {
    const date = new Date()
    date.setHours(hour)
    return date
  }

  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('period detection', () => {
    it('should return "Bom dia" for hour 0 (midnight)', () => {
      vi.setSystemTime(mockDate(0))
      expect(getGreeting('João')).toBe('Bom dia, João!')
    })

    it('should return "Bom dia" for hour 8 (morning)', () => {
      vi.setSystemTime(mockDate(8))
      expect(getGreeting('Maria')).toBe('Bom dia, Maria!')
    })

    it('should return "Bom dia" for hour 11 (boundary before noon)', () => {
      vi.setSystemTime(mockDate(11))
      expect(getGreeting('Ana')).toBe('Bom dia, Ana!')
    })

    it('should return "Boa tarde" for hour 12 (noon)', () => {
      vi.setSystemTime(mockDate(12))
      expect(getGreeting('Carlos')).toBe('Boa tarde, Carlos!')
    })

    it('should return "Boa tarde" for hour 15 (afternoon)', () => {
      vi.setSystemTime(mockDate(15))
      expect(getGreeting('Pedro')).toBe('Boa tarde, Pedro!')
    })

    it('should return "Boa tarde" for hour 17 (boundary before evening)', () => {
      vi.setSystemTime(mockDate(17))
      expect(getGreeting('Lucas')).toBe('Boa tarde, Lucas!')
    })

    it('should return "Boa noite" for hour 18 (evening)', () => {
      vi.setSystemTime(mockDate(18))
      expect(getGreeting('Sofia')).toBe('Boa noite, Sofia!')
    })

    it('should return "Boa noite" for hour 20 (night)', () => {
      vi.setSystemTime(mockDate(20))
      expect(getGreeting('Roberto')).toBe('Boa noite, Roberto!')
    })

    it('should return "Boa noite" for hour 23 (late night)', () => {
      vi.setSystemTime(mockDate(23))
      expect(getGreeting('Fernanda')).toBe('Boa noite, Fernanda!')
    })
  })

  describe('name handling', () => {
    beforeEach(() => {
      vi.setSystemTime(mockDate(10)) // Morning time
    })

    it('should extract first name from full name', () => {
      expect(getGreeting('João da Silva')).toBe('Bom dia, João!')
    })

    it('should handle single name', () => {
      expect(getGreeting('Maria')).toBe('Bom dia, Maria!')
    })

    it('should handle empty string gracefully', () => {
      expect(getGreeting('')).toBe('Bom dia!')
    })

    it('should handle whitespace-only string gracefully', () => {
      expect(getGreeting('   ')).toBe('Bom dia!')
    })

    it('should handle name with leading/trailing spaces', () => {
      expect(getGreeting('  Ana  ')).toBe('Bom dia, Ana!')
    })

    it('should handle name with multiple spaces between words', () => {
      expect(getGreeting('Carlos  Alberto')).toBe('Bom dia, Carlos!')
    })

    it('should handle name with tabs', () => {
      expect(getGreeting('\tPedro\t')).toBe('Bom dia, Pedro!')
    })
  })
})
