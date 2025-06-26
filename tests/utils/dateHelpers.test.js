import { describe, it, expect } from 'vitest'
import {
  formatDate,
  formatTime,
  formatDateTime,
  formatRelativeTime,
  isToday,
  isYesterday,
  isTomorrow,
  isPast,
  isFuture,
  getStartOfToday,
  getEndOfToday,
  getStartOfWeek,
  getEndOfWeek,
  getDaysBetween,
  addTime,
  subtractTime,
  getAge,
  formatDuration,
  getSmartDateLabel,
  getTimeUntil,
  isSameDay,
  isDateInRange
} from '../../src/utils/dateHelpers'

describe('dateHelpers', () => {
  const testDate = new Date('2024-01-15T14:30:00Z')

  describe('formatDate', () => {
    it('formats date to default format', () => {
      const result = formatDate(testDate)
      expect(result).toBe('Jan 15, 2024')
    })

    it('formats date with custom format', () => {
      const result = formatDate(testDate, 'YYYY-MM-DD')
      expect(result).toBe('2024-01-15')
    })

    it('handles null date', () => {
      const result = formatDate(null)
      expect(result).toBe('Invalid Date')
    })

    it('handles invalid date', () => {
      const result = formatDate('invalid')
      expect(result).toBe('Invalid Date')
    })
  })

  describe('formatTime', () => {
    it('formats time in 12-hour format', () => {
      const result = formatTime(testDate)
      expect(result).toMatch(/\d{1,2}:\d{2}\s?(AM|PM)/)
    })

    it('formats time in 24-hour format', () => {
      const result = formatTime(testDate, 'HH:mm')
      expect(result).toMatch(/\d{2}:\d{2}/)
    })

    it('handles midnight correctly', () => {
      const midnight = new Date('2024-01-15T00:00:00Z')
      const result = formatTime(midnight)
      expect(result).toMatch(/12:00\s?AM/)
    })

    it('handles noon correctly', () => {
      const noon = new Date('2024-01-15T12:00:00Z')
      const result = formatTime(noon)
      expect(result).toMatch(/12:00\s?PM/)
    })
  })

  describe('formatDateTime', () => {
    it('formats full date and time', () => {
      const result = formatDateTime(testDate)
      expect(result).toMatch(/Jan 15, 2024\s\d{1,2}:\d{2}\s?(AM|PM)/)
    })

    it('formats with custom format', () => {
      const result = formatDateTime(testDate, 'YYYY-MM-DD HH:mm')
      expect(result).toBe('2024-01-15 14:30')
    })
  })

  describe('formatRelativeTime', () => {
    it('returns relative time for past', () => {
      const pastDate = new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      const result = formatRelativeTime(pastDate)
      expect(result).toContain('ago')
    })

    it('returns relative time for future', () => {
      const futureDate = new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours from now
      const result = formatRelativeTime(futureDate)
      expect(result).toContain('in')
    })
  })

  describe('isToday', () => {
    it('returns true for today', () => {
      const today = new Date()
      expect(isToday(today)).toBe(true)
    })

    it('returns false for yesterday', () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
      expect(isToday(yesterday)).toBe(false)
    })

    it('returns false for tomorrow', () => {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
      expect(isToday(tomorrow)).toBe(false)
    })
  })

  describe('isTomorrow', () => {
    it('returns true for tomorrow', () => {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
      expect(isTomorrow(tomorrow)).toBe(true)
    })

    it('returns false for today', () => {
      const today = new Date()
      expect(isTomorrow(today)).toBe(false)
    })
  })

  describe('isYesterday', () => {
    it('returns true for yesterday', () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
      expect(isYesterday(yesterday)).toBe(true)
    })

    it('returns false for today', () => {
      const today = new Date()
      expect(isYesterday(today)).toBe(false)
    })
  })

  describe('isPast', () => {
    it('returns true for past date', () => {
      const pastDate = new Date(Date.now() - 60 * 60 * 1000)
      expect(isPast(pastDate)).toBe(true)
    })

    it('returns false for future date', () => {
      const futureDate = new Date(Date.now() + 60 * 60 * 1000)
      expect(isPast(futureDate)).toBe(false)
    })
  })

  describe('isFuture', () => {
    it('returns true for future date', () => {
      const futureDate = new Date(Date.now() + 60 * 60 * 1000)
      expect(isFuture(futureDate)).toBe(true)
    })

    it('returns false for past date', () => {
      const pastDate = new Date(Date.now() - 60 * 60 * 1000)
      expect(isFuture(pastDate)).toBe(false)
    })
  })

  describe('addTime', () => {
    it('adds positive days', () => {
      const result = addTime(testDate, 5, 'days')
      expect(result.toISOString()).toContain('2024-01-20')
    })

    it('adds hours', () => {
      const result = addTime(testDate, 2, 'hours')
      expect(result.getHours()).toBe(testDate.getHours() + 2)
    })

    it('handles month boundary', () => {
      const endOfMonth = new Date('2024-01-31T12:00:00Z')
      const result = addTime(endOfMonth, 1, 'day')
      expect(result.getMonth()).toBe(1) // February (0-indexed)
    })
  })

  describe('subtractTime', () => {
    it('subtracts days', () => {
      const result = subtractTime(testDate, 5, 'days')
      expect(result.toISOString()).toContain('2024-01-10')
    })

    it('subtracts hours', () => {
      const result = subtractTime(testDate, 2, 'hours')
      expect(result.getHours()).toBe(testDate.getHours() - 2)
    })
  })

  describe('getStartOfToday', () => {
    it('sets time to beginning of day', () => {
      const result = getStartOfToday()
      expect(result.getHours()).toBe(0)
      expect(result.getMinutes()).toBe(0)
      expect(result.getSeconds()).toBe(0)
    })
  })

  describe('getEndOfToday', () => {
    it('sets time to end of day', () => {
      const result = getEndOfToday()
      expect(result.getHours()).toBe(23)
      expect(result.getMinutes()).toBe(59)
      expect(result.getSeconds()).toBe(59)
    })
  })

  describe('getDaysBetween', () => {
    it('calculates days between dates', () => {
      const startDate = new Date('2024-01-15')
      const endDate = new Date('2024-01-20')
      const result = getDaysBetween(startDate, endDate)
      expect(result).toBe(5)
    })

    it('returns negative for past dates', () => {
      const startDate = new Date('2024-01-20')
      const endDate = new Date('2024-01-15')
      const result = getDaysBetween(startDate, endDate)
      expect(result).toBe(-5)
    })

    it('returns 0 for same date', () => {
      const date = new Date('2024-01-15')
      const result = getDaysBetween(date, date)
      expect(result).toBe(0)
    })
  })

  describe('getStartOfWeek', () => {
    it('returns start of week (Sunday)', () => {
      const result = getStartOfWeek(testDate)
      expect(result.getDay()).toBe(0) // Sunday
    })

    it('handles different week start', () => {
      const result = getStartOfWeek(testDate)
      expect(result.getHours()).toBe(0)
      expect(result.getMinutes()).toBe(0)
    })
  })

  describe('getAge', () => {
    it('calculates age correctly', () => {
      const birthDate = new Date('1990-01-15')
      const age = getAge(birthDate)
      expect(age).toBeGreaterThan(30)
    })

    it('handles birthday not yet occurred this year', () => {
      const birthDate = new Date('1990-12-31')
      const age = getAge(birthDate)
      expect(typeof age).toBe('number')
    })
  })

  describe('formatDuration', () => {
    it('formats minutes correctly', () => {
      expect(formatDuration(30)).toBe('30 min')
    })

    it('formats hours correctly', () => {
      expect(formatDuration(90)).toBe('1h 30m')
    })

    it('formats hours without minutes', () => {
      expect(formatDuration(120)).toBe('2 hours')
    })
  })

  describe('getSmartDateLabel', () => {
    it('returns smart label for today', () => {
      const today = new Date()
      const result = getSmartDateLabel(today)
      expect(result).toBe('Today')
    })

    it('returns smart label for yesterday', () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
      const result = getSmartDateLabel(yesterday)
      expect(result).toBe('Yesterday')
    })
  })

  describe('isSameDay', () => {
    it('returns true for same day', () => {
      const date1 = new Date('2024-01-15T10:00:00Z')
      const date2 = new Date('2024-01-15T14:00:00Z')
      expect(isSameDay(date1, date2)).toBe(true)
    })

    it('returns false for different days', () => {
      const date1 = new Date('2024-01-15T10:00:00Z')
      const date2 = new Date('2024-01-16T10:00:00Z')
      expect(isSameDay(date1, date2)).toBe(false)
    })
  })

  describe('isDateInRange', () => {
    it('returns true for date in range', () => {
      const date = new Date('2024-01-15')
      const start = new Date('2024-01-10')
      const end = new Date('2024-01-20')
      expect(isDateInRange(date, start, end)).toBe(true)
    })

    it('returns false for date outside range', () => {
      const date = new Date('2024-01-25')
      const start = new Date('2024-01-10')
      const end = new Date('2024-01-20')
      expect(isDateInRange(date, start, end)).toBe(false)
    })
  })
}) 