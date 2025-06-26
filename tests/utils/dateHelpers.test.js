import { vi, describe, it, expect, beforeEach } from 'vitest'
import * as dateHelpers from '@/utils/dateHelpers'

describe('dateHelpers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset timezone to UTC for consistent testing
    vi.setSystemTime(new Date('2024-01-15T10:00:00.000Z'))
  })

  describe('formatDate', () => {
    it('formats date to default format', () => {
      const date = new Date('2024-01-15T10:30:00.000Z')
      expect(dateHelpers.formatDate(date)).toBe('Jan 15, 2024')
    })

    it('formats date with custom format', () => {
      const date = new Date('2024-01-15T10:30:00.000Z')
      expect(dateHelpers.formatDate(date, 'yyyy-MM-dd')).toBe('2024-01-15')
    })

    it('handles null date', () => {
      expect(dateHelpers.formatDate(null)).toBe('')
    })

    it('handles invalid date', () => {
      expect(dateHelpers.formatDate(new Date('invalid'))).toBe('Invalid Date')
    })
  })

  describe('formatTime', () => {
    it('formats time in 12-hour format', () => {
      const date = new Date('2024-01-15T14:30:00.000Z')
      expect(dateHelpers.formatTime(date)).toBe('2:30 PM')
    })

    it('formats time in 24-hour format', () => {
      const date = new Date('2024-01-15T14:30:00.000Z')
      expect(dateHelpers.formatTime(date, true)).toBe('14:30')
    })

    it('handles midnight correctly', () => {
      const date = new Date('2024-01-15T00:00:00.000Z')
      expect(dateHelpers.formatTime(date)).toBe('12:00 AM')
    })

    it('handles noon correctly', () => {
      const date = new Date('2024-01-15T12:00:00.000Z')
      expect(dateHelpers.formatTime(date)).toBe('12:00 PM')
    })
  })

  describe('formatDateTime', () => {
    it('formats full date and time', () => {
      const date = new Date('2024-01-15T14:30:00.000Z')
      expect(dateHelpers.formatDateTime(date)).toBe('Jan 15, 2024 at 2:30 PM')
    })

    it('formats with custom separator', () => {
      const date = new Date('2024-01-15T14:30:00.000Z')
      expect(dateHelpers.formatDateTime(date, ' - ')).toBe('Jan 15, 2024 - 2:30 PM')
    })
  })

  describe('getRelativeTime', () => {
    it('returns "now" for current time', () => {
      const now = new Date()
      expect(dateHelpers.getRelativeTime(now)).toBe('now')
    })

    it('returns minutes ago', () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
      expect(dateHelpers.getRelativeTime(fiveMinutesAgo)).toBe('5 minutes ago')
    })

    it('returns hours ago', () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)
      expect(dateHelpers.getRelativeTime(twoHoursAgo)).toBe('2 hours ago')
    })

    it('returns days ago', () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      expect(dateHelpers.getRelativeTime(threeDaysAgo)).toBe('3 days ago')
    })

    it('returns future time', () => {
      const inTwoHours = new Date(Date.now() + 2 * 60 * 60 * 1000)
      expect(dateHelpers.getRelativeTime(inTwoHours)).toBe('in 2 hours')
    })
  })

  describe('isToday', () => {
    it('returns true for today', () => {
      const today = new Date()
      expect(dateHelpers.isToday(today)).toBe(true)
    })

    it('returns false for yesterday', () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
      expect(dateHelpers.isToday(yesterday)).toBe(false)
    })

    it('returns false for tomorrow', () => {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
      expect(dateHelpers.isToday(tomorrow)).toBe(false)
    })
  })

  describe('isTomorrow', () => {
    it('returns true for tomorrow', () => {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
      expect(dateHelpers.isTomorrow(tomorrow)).toBe(true)
    })

    it('returns false for today', () => {
      const today = new Date()
      expect(dateHelpers.isTomorrow(today)).toBe(false)
    })
  })

  describe('isYesterday', () => {
    it('returns true for yesterday', () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
      expect(dateHelpers.isYesterday(yesterday)).toBe(true)
    })

    it('returns false for today', () => {
      const today = new Date()
      expect(dateHelpers.isYesterday(today)).toBe(false)
    })
  })

  describe('addDays', () => {
    it('adds positive days', () => {
      const date = new Date('2024-01-15')
      const result = dateHelpers.addDays(date, 5)
      expect(result.getDate()).toBe(20)
    })

    it('subtracts days with negative input', () => {
      const date = new Date('2024-01-15')
      const result = dateHelpers.addDays(date, -5)
      expect(result.getDate()).toBe(10)
    })

    it('handles month boundary', () => {
      const date = new Date('2024-01-30')
      const result = dateHelpers.addDays(date, 5)
      expect(result.getMonth()).toBe(1) // February
      expect(result.getDate()).toBe(4)
    })
  })

  describe('startOfDay', () => {
    it('sets time to beginning of day', () => {
      const date = new Date('2024-01-15T14:30:45.123Z')
      const result = dateHelpers.startOfDay(date)
      
      expect(result.getHours()).toBe(0)
      expect(result.getMinutes()).toBe(0)
      expect(result.getSeconds()).toBe(0)
      expect(result.getMilliseconds()).toBe(0)
    })
  })

  describe('endOfDay', () => {
    it('sets time to end of day', () => {
      const date = new Date('2024-01-15T14:30:45.123Z')
      const result = dateHelpers.endOfDay(date)
      
      expect(result.getHours()).toBe(23)
      expect(result.getMinutes()).toBe(59)
      expect(result.getSeconds()).toBe(59)
      expect(result.getMilliseconds()).toBe(999)
    })
  })

  describe('getDaysBetween', () => {
    it('calculates days between dates', () => {
      const start = new Date('2024-01-15')
      const end = new Date('2024-01-20')
      expect(dateHelpers.getDaysBetween(start, end)).toBe(5)
    })

    it('returns negative for past dates', () => {
      const start = new Date('2024-01-20')
      const end = new Date('2024-01-15')
      expect(dateHelpers.getDaysBetween(start, end)).toBe(-5)
    })

    it('returns 0 for same date', () => {
      const date = new Date('2024-01-15')
      expect(dateHelpers.getDaysBetween(date, date)).toBe(0)
    })
  })

  describe('getWeekStart', () => {
    it('returns start of week (Sunday)', () => {
      const wednesday = new Date('2024-01-17') // Wednesday
      const weekStart = dateHelpers.getWeekStart(wednesday)
      expect(weekStart.getDay()).toBe(0) // Sunday
      expect(weekStart.getDate()).toBe(14)
    })

    it('returns start of week (Monday)', () => {
      const wednesday = new Date('2024-01-17') // Wednesday
      const weekStart = dateHelpers.getWeekStart(wednesday, 1) // Monday as start
      expect(weekStart.getDay()).toBe(1) // Monday
      expect(weekStart.getDate()).toBe(15)
    })
  })

  describe('parseDate', () => {
    it('parses ISO date string', () => {
      const result = dateHelpers.parseDate('2024-01-15T14:30:00.000Z')
      expect(result).toBeInstanceOf(Date)
      expect(result.getFullYear()).toBe(2024)
    })

    it('parses date string', () => {
      const result = dateHelpers.parseDate('2024-01-15')
      expect(result).toBeInstanceOf(Date)
      expect(result.getFullYear()).toBe(2024)
    })

    it('returns null for invalid date', () => {
      expect(dateHelpers.parseDate('invalid-date')).toBeNull()
    })

    it('returns null for null input', () => {
      expect(dateHelpers.parseDate(null)).toBeNull()
    })
  })

  describe('isValidDate', () => {
    it('returns true for valid date', () => {
      expect(dateHelpers.isValidDate(new Date())).toBe(true)
    })

    it('returns false for invalid date', () => {
      expect(dateHelpers.isValidDate(new Date('invalid'))).toBe(false)
    })

    it('returns false for null', () => {
      expect(dateHelpers.isValidDate(null)).toBe(false)
    })
  })
}) 