import { vi, describe, it, expect, beforeEach } from 'vitest'
import * as phoneValidation from '@/utils/phoneValidation'

describe('phoneValidation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('validatePhoneNumber', () => {
    it('validates US phone numbers correctly', () => {
      const validNumbers = [
        '+1234567890',
        '+1 (234) 567-8900',
        '+1-234-567-8900',
        '(234) 567-8900',
        '234-567-8900',
        '2345678900'
      ]

      validNumbers.forEach(number => {
        expect(phoneValidation.validatePhoneNumber(number, 'US')).toBe(true)
      })
    })

    it('validates international phone numbers correctly', () => {
      const validNumbers = [
        '+44 20 7946 0958', // UK
        '+33 1 42 68 53 00', // France
        '+49 30 26005000', // Germany
        '+86 138 0013 8000' // China
      ]

      validNumbers.forEach(number => {
        expect(phoneValidation.validatePhoneNumber(number)).toBe(true)
      })
    })

    it('rejects invalid phone numbers', () => {
      const invalidNumbers = [
        '',
        '123',
        '123456',
        'abc123456789',
        '+1234',
        '00000000000',
        '+999999999999999'
      ]

      invalidNumbers.forEach(number => {
        expect(phoneValidation.validatePhoneNumber(number)).toBe(false)
      })
    })

    it('handles null and undefined inputs', () => {
      expect(phoneValidation.validatePhoneNumber(null)).toBe(false)
      expect(phoneValidation.validatePhoneNumber(undefined)).toBe(false)
    })
  })

  describe('formatPhoneNumber', () => {
    it('formats US phone numbers correctly', () => {
      expect(phoneValidation.formatPhoneNumber('2345678900', 'US'))
        .toBe('+1 (234) 567-8900')
      
      expect(phoneValidation.formatPhoneNumber('1234567890', 'US'))
        .toBe('+1 (123) 456-7890')
    })

    it('formats international phone numbers', () => {
      expect(phoneValidation.formatPhoneNumber('447946000000', 'GB'))
        .toBe('+44 7946 000000')
      
      expect(phoneValidation.formatPhoneNumber('33142685300', 'FR'))
        .toBe('+33 1 42 68 53 00')
    })

    it('handles already formatted numbers', () => {
      const formattedNumber = '+1 (234) 567-8900'
      expect(phoneValidation.formatPhoneNumber(formattedNumber, 'US'))
        .toBe(formattedNumber)
    })

    it('returns original for invalid numbers', () => {
      const invalidNumber = 'invalid'
      expect(phoneValidation.formatPhoneNumber(invalidNumber, 'US'))
        .toBe(invalidNumber)
    })
  })

  describe('parsePhoneNumber', () => {
    it('parses phone number into components', () => {
      const result = phoneValidation.parsePhoneNumber('+1234567890')
      
      expect(result).toHaveProperty('countryCode', '1')
      expect(result).toHaveProperty('nationalNumber', '234567890')
      expect(result).toHaveProperty('country', 'US')
      expect(result).toHaveProperty('valid', true)
    })

    it('handles international numbers', () => {
      const result = phoneValidation.parsePhoneNumber('+44 20 7946 0958')
      
      expect(result).toHaveProperty('countryCode', '44')
      expect(result).toHaveProperty('country', 'GB')
      expect(result).toHaveProperty('valid', true)
    })

    it('returns null for invalid numbers', () => {
      expect(phoneValidation.parsePhoneNumber('invalid')).toBeNull()
      expect(phoneValidation.parsePhoneNumber('')).toBeNull()
    })
  })

  describe('getCountryFromPhoneNumber', () => {
    it('detects country from phone number', () => {
      expect(phoneValidation.getCountryFromPhoneNumber('+1234567890')).toBe('US')
      expect(phoneValidation.getCountryFromPhoneNumber('+44 20 7946 0958')).toBe('GB')
      expect(phoneValidation.getCountryFromPhoneNumber('+33 1 42 68 53 00')).toBe('FR')
    })

    it('returns null for invalid numbers', () => {
      expect(phoneValidation.getCountryFromPhoneNumber('invalid')).toBeNull()
      expect(phoneValidation.getCountryFromPhoneNumber('')).toBeNull()
    })
  })

  describe('isValidForCountry', () => {
    it('validates numbers for specific countries', () => {
      expect(phoneValidation.isValidForCountry('+1234567890', 'US')).toBe(true)
      expect(phoneValidation.isValidForCountry('+44 20 7946 0958', 'GB')).toBe(true)
      expect(phoneValidation.isValidForCountry('+1234567890', 'GB')).toBe(false)
    })

    it('handles edge cases', () => {
      expect(phoneValidation.isValidForCountry('', 'US')).toBe(false)
      expect(phoneValidation.isValidForCountry('+1234567890', '')).toBe(false)
    })
  })

  describe('getPhoneNumberExample', () => {
    it('returns example numbers for countries', () => {
      const usExample = phoneValidation.getPhoneNumberExample('US')
      expect(usExample).toMatch(/^\+1/)
      
      const gbExample = phoneValidation.getPhoneNumberExample('GB')
      expect(gbExample).toMatch(/^\+44/)
    })

    it('returns null for invalid country codes', () => {
      expect(phoneValidation.getPhoneNumberExample('INVALID')).toBeNull()
      expect(phoneValidation.getPhoneNumberExample('')).toBeNull()
    })
  })

  describe('normalizePhoneNumber', () => {
    it('normalizes phone numbers to E.164 format', () => {
      expect(phoneValidation.normalizePhoneNumber('(234) 567-8900', 'US'))
        .toBe('+12345678900')
      
      expect(phoneValidation.normalizePhoneNumber('07946 000000', 'GB'))
        .toBe('+447946000000')
    })

    it('handles already normalized numbers', () => {
      expect(phoneValidation.normalizePhoneNumber('+12345678900', 'US'))
        .toBe('+12345678900')
    })

    it('returns null for invalid inputs', () => {
      expect(phoneValidation.normalizePhoneNumber('invalid', 'US')).toBeNull()
      expect(phoneValidation.normalizePhoneNumber('', 'US')).toBeNull()
    })
  })
}) 