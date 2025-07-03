import { describe, it, expect, beforeEach, vi } from 'vitest'
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
  // Use a consistent date for testing - avoid timezone issues by using local time
  const testDate = new Date('2024-01-15T14:30:00')

  beforeEach(() => {
    // Mock the current time to avoid date-dependent test failures
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-15T12:00:00'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

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
      expect(result).toBe('')
    })

    it('handles invalid date', () => {
      const result = formatDate('invalid')
      expect(result).toBe('Invalid Date')
    })
  })

  describe('formatTime', () => {
    it('formats time to default format', () => {
      const result = formatTime(testDate)
      expect(result).toMatch(/\d{1,2}:\d{2}\s?(AM|PM)/)
    })

    it('handles midnight correctly', () => {
      // Use local midnight to avoid timezone issues
      const midnight = new Date('2024-01-15T00:00:00')
      const result = formatTime(midnight)
      expect(result).toMatch(/12:00\s?AM/)
    })

    it('handles noon correctly', () => {
      // Use local noon to avoid timezone issues
      const noon = new Date('2024-01-15T12:00:00')
      const result = formatTime(noon)
      expect(result).toMatch(/12:00\s?PM/)
    })
  })

  describe('formatDateTime', () => {
    it('formats date and time together', () => {
      const result = formatDateTime(testDate)
      expect(result).toMatch(/Jan 15, 2024,?\s+\d{1,2}:\d{2}\s?(AM|PM)/)
    })

    it('formats with custom format', () => {
      // Use a format that doesn't depend on timezone
      const result = formatDateTime(testDate, 'YYYY-MM-DD HH:mm')
      expect(result).toBe('2024-01-15 14:30')
    })
  })

  describe('formatRelativeTime', () => {
    it('formats relative time from now', () => {
      const futureDate = new Date('2024-01-15T13:00:00') // 1 hour from now
      const result = formatRelativeTime(futureDate)
      expect(result).toMatch(/in (an? )?hour|1 hour/)
    })

    it('handles past dates', () => {
      const pastDate = new Date('2024-01-15T11:00:00') // 1 hour ago
      const result = formatRelativeTime(pastDate)
      expect(result).toMatch(/(an? )?hour ago|1 hour ago/)
    })
  })

  describe('isToday', () => {
    it('returns true for today\'s date', () => {
      const today = new Date('2024-01-15T16:00:00')
      expect(isToday(today)).toBe(true)
    })

    it('returns false for yesterday', () => {
      const yesterday = new Date('2024-01-14T12:00:00')
      expect(isToday(yesterday)).toBe(false)
    })

    it('returns false for tomorrow', () => {
      const tomorrow = new Date('2024-01-16T12:00:00')
      expect(isToday(tomorrow)).toBe(false)
    })
  })

  describe('isYesterday', () => {
    it('returns true for yesterday\'s date', () => {
      const yesterday = new Date('2024-01-14T12:00:00')
      expect(isYesterday(yesterday)).toBe(true)
    })

    it('returns false for today', () => {
      const today = new Date('2024-01-15T12:00:00')
      expect(isYesterday(today)).toBe(false)
    })
  })

  describe('isTomorrow', () => {
    it('returns true for tomorrow\'s date', () => {
      const tomorrow = new Date('2024-01-16T12:00:00')
      expect(isTomorrow(tomorrow)).toBe(true)
    })

    it('returns false for today', () => {
      const today = new Date('2024-01-15T12:00:00')
      expect(isTomorrow(today)).toBe(false)
    })
  })

  describe('isPast', () => {
    it('returns true for past dates', () => {
      const pastDate = new Date('2024-01-15T11:00:00')
      expect(isPast(pastDate)).toBe(true)
    })

    it('returns false for future dates', () => {
      const futureDate = new Date('2024-01-15T13:00:00')
      expect(isPast(futureDate)).toBe(false)
    })
  })

  describe('isFuture', () => {
    it('returns true for future dates', () => {
      const futureDate = new Date('2024-01-15T13:00:00')
      expect(isFuture(futureDate)).toBe(true)
    })

    it('returns false for past dates', () => {
      const pastDate = new Date('2024-01-15T11:00:00')
      expect(isFuture(pastDate)).toBe(false)
    })
  })

  describe('addTime', () => {
    it('adds hours', () => {
      const result = addTime(testDate, 2, 'hours')
      expect(result).toBeInstanceOf(Date)
      // Check that 2 hours were added
      expect(result.getTime() - testDate.getTime()).toBe(2 * 60 * 60 * 1000)
    })

    it('handles month boundary', () => {
      const endOfMonth = new Date('2024-01-31T12:00:00')
      const result = addTime(endOfMonth, 1, 'day')
      expect(result).toBeInstanceOf(Date)
      expect(result.getMonth()).toBe(1) // February (0-indexed)
    })
  })

  describe('subtractTime', () => {
    it('subtracts hours', () => {
      const result = subtractTime(testDate, 2, 'hours')
      expect(result).toBeInstanceOf(Date)
      // Check that 2 hours were subtracted
      expect(testDate.getTime() - result.getTime()).toBe(2 * 60 * 60 * 1000)
    })
  })

  describe('getStartOfToday', () => {
    it('sets time to beginning of day', () => {
      const result = getStartOfToday()
      expect(result).toBeInstanceOf(Date)
      expect(result.getHours()).toBe(0)
      expect(result.getMinutes()).toBe(0)
      expect(result.getSeconds()).toBe(0)
    })

    it('returns today\'s date', () => {
      const result = getStartOfToday()
      const today = new Date()
      expect(result.getDate()).toBe(today.getDate())
      expect(result.getMonth()).toBe(today.getMonth())
      expect(result.getFullYear()).toBe(today.getFullYear())
    })
  })

  describe('getEndOfToday', () => {
    it('sets time to end of day', () => {
      const result = getEndOfToday()
      expect(result).toBeInstanceOf(Date)
      expect(result.getHours()).toBe(23)
      expect(result.getMinutes()).toBe(59)
      expect(result.getSeconds()).toBe(59)
    })
  })

  describe('getStartOfWeek', () => {
    it('returns start of week (Sunday)', () => {
      const result = getStartOfWeek(testDate)
      expect(result).toBeInstanceOf(Date)
      expect(result.getDay()).toBe(0) // Sunday
    })

    it('handles different week start', () => {
      const result = getStartOfWeek(testDate)
      expect(result).toBeInstanceOf(Date)
      expect(result.getHours()).toBe(0)
      expect(result.getMinutes()).toBe(0)
    })
  })

  describe('getEndOfWeek', () => {
    it('returns end of week (Saturday)', () => {
      const result = getEndOfWeek(testDate)
      expect(result).toBeInstanceOf(Date)
      expect(result.getDay()).toBe(6) // Saturday
    })
  })

  describe('getDaysBetween', () => {
    it('calculates days between dates', () => {
      const date1 = new Date('2024-01-15')
      const date2 = new Date('2024-01-20')
      const result = getDaysBetween(date1, date2)
      expect(result).toBe(5)
    })

    it('handles negative differences', () => {
      const date1 = new Date('2024-01-20')
      const date2 = new Date('2024-01-15')
      const result = getDaysBetween(date1, date2)
      expect(result).toBe(-5)
    })
  })

  describe('getAge', () => {
    it('calculates age correctly', () => {
      const birthDate = new Date('1990-01-15')
      const age = getAge(birthDate)
      expect(age).toBe(34) // Based on our mocked current date
    })

    it('handles birthday not yet reached this year', () => {
      const birthDate = new Date('1990-06-15') // Birthday later in the year
      const age = getAge(birthDate)
      expect(age).toBe(33)
    })
  })

  describe('formatDuration', () => {
    it('formats duration in milliseconds', () => {
      const duration = 2 * 60 * 60 * 1000 // 2 hours
      const result = formatDuration(duration)
      expect(result).toMatch(/2\s*hours?/)
    })

    it('formats duration in minutes', () => {
      const duration = 30 * 60 * 1000 // 30 minutes
      const result = formatDuration(duration)
      expect(result).toMatch(/30\s*minutes?/)
    })
  })

  describe('getSmartDateLabel', () => {
    it('returns "Today" for today\'s date', () => {
      const today = new Date('2024-01-15T16:00:00')
      const result = getSmartDateLabel(today)
      expect(result).toBe('Today')
    })

    it('returns "Yesterday" for yesterday\'s date', () => {
      const yesterday = new Date('2024-01-14T12:00:00')
      const result = getSmartDateLabel(yesterday)
      expect(result).toBe('Yesterday')
    })

    it('returns formatted date for other dates', () => {
      const otherDate = new Date('2024-01-10T12:00:00')
      const result = getSmartDateLabel(otherDate)
      expect(result).toMatch(/Jan 10/)
    })
  })

  describe('getTimeUntil', () => {
    it('calculates time until future date', () => {
      const futureDate = new Date('2024-01-15T14:00:00') // 2 hours from mocked time
      const result = getTimeUntil(futureDate)
      expect(result).toMatch(/2\s*hours?/)
    })

    it('handles past dates', () => {
      const pastDate = new Date('2024-01-15T10:00:00')
      const result = getTimeUntil(pastDate)
      expect(result).toMatch(/ago/)
    })
  })

  describe('isSameDay', () => {
    it('returns true for same day', () => {
      const date1 = new Date('2024-01-15T10:00:00')
      const date2 = new Date('2024-01-15T20:00:00')
      expect(isSameDay(date1, date2)).toBe(true)
    })

    it('returns false for different days', () => {
      const date1 = new Date('2024-01-15T10:00:00')
      const date2 = new Date('2024-01-16T10:00:00')
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