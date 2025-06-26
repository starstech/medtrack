import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as phoneValidation from '@/utils/phoneValidation'

describe('phoneValidation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createPhoneValidationRules', () => {
    it('creates validation rules for required fields', () => {
      const rules = phoneValidation.createPhoneValidationRules('US', true)
      
      expect(rules).toHaveLength(2)
      expect(rules[0]).toHaveProperty('required', true)
      expect(rules[0]).toHaveProperty('message', 'Please enter a phone number')
      expect(rules[1]).toHaveProperty('validator')
    })

    it('creates validation rules for optional fields', () => {
      const rules = phoneValidation.createPhoneValidationRules('US', false)
      
      expect(rules).toHaveLength(1)
      expect(rules[0]).toHaveProperty('validator')
    })
  })

  describe('createPhoneValidationRulesSync', () => {
    it('creates synchronous validation rules', () => {
      const rules = phoneValidation.createPhoneValidationRulesSync('US', true)
      
      expect(rules).toHaveLength(2)
      expect(rules[0]).toHaveProperty('required', true)
      expect(rules[1]).toHaveProperty('validator')
    })

    it('validates phone input correctly', async () => {
      const rules = phoneValidation.createPhoneValidationRulesSync('US', false)
      const validator = rules[0].validator
      
      // Valid phone input
      const validInput = { phone: '1234567890', countryCode: '1' }
      await expect(validator(null, validInput)).resolves.toBeUndefined()
      
      // Invalid phone input
      const invalidInput = { phone: '123' }
      await expect(validator(null, invalidInput)).rejects.toThrow('Please enter a valid phone number')
      
      // Empty input (should pass for optional field)
      await expect(validator(null, null)).resolves.toBeUndefined()
    })
  })

  describe('validateEmergencyContact', () => {
    it('validates complete emergency contact', () => {
      const contact = {
        name: 'John Doe',
        phone: { phone: '1234567890', countryCode: '1' },
        relationship: 'Spouse',
        email: 'john@example.com'
      }
      
      const result = phoneValidation.validateEmergencyContact(contact)
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toEqual({})
    })

    it('validates missing emergency contact as optional', () => {
      const result = phoneValidation.validateEmergencyContact(null)
      
      expect(result.isValid).toBe(true)
      expect(result.warnings).toContain('No emergency contact provided - consider adding one for safety')
    })

    it('validates incomplete emergency contact', () => {
      const contact = {
        name: '',
        phone: '',
        relationship: ''
      }
      
      const result = phoneValidation.validateEmergencyContact(contact)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveProperty('name')
      expect(result.errors).toHaveProperty('phone')
      expect(result.errors).toHaveProperty('relationship')
    })

    it('validates phone number in object format', () => {
      const contact = {
        name: 'John Doe',
        phone: { phone: '123', countryCode: '1' },
        relationship: 'Spouse'
      }
      
      const result = phoneValidation.validateEmergencyContact(contact)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveProperty('phone')
    })

    it('validates phone number in string format', () => {
      const contact = {
        name: 'John Doe',
        phone: '1234567890',
        relationship: 'Spouse'
      }
      
      const result = phoneValidation.validateEmergencyContact(contact)
      
      expect(result.isValid).toBe(true)
    })
  })

  describe('getDefaultEmergencyContact', () => {
    it('returns default emergency contact template', () => {
      const defaultContact = phoneValidation.getDefaultEmergencyContact()
      
      expect(defaultContact).toEqual({
        name: '',
        phone: '',
        relationship: '',
        email: ''
      })
    })
  })

  describe('formatPhoneForStorage', () => {
    it('formats phone object for storage', () => {
      const phoneObject = { phone: '1234567890', countryCode: '1' }
      const result = phoneValidation.formatPhoneForStorage(phoneObject)
      
      expect(result).toBe('+11234567890')
    })

    it('handles string input', () => {
      const phoneString = '+1234567890'
      const result = phoneValidation.formatPhoneForStorage(phoneString)
      
      expect(result).toBe('+1234567890')
    })

    it('handles null input', () => {
      const result = phoneValidation.formatPhoneForStorage(null)
      
      expect(result).toBe('')
    })

    it('handles empty object', () => {
      const result = phoneValidation.formatPhoneForStorage({})
      
      expect(result).toBe('')
    })
  })

  describe('parsePhoneFromStorage', () => {
    it('parses stored phone string', () => {
      const storedPhone = '+1234567890'
      const result = phoneValidation.parsePhoneFromStorage(storedPhone)
      
      expect(result).toBe('+1234567890')
    })

    it('handles object input', () => {
      const phoneObject = { phone: '1234567890', countryCode: '1' }
      const result = phoneValidation.parsePhoneFromStorage(phoneObject)
      
      expect(result).toEqual(phoneObject)
    })

    it('handles null input', () => {
      const result = phoneValidation.parsePhoneFromStorage(null)
      
      expect(result).toBe('')
    })
  })

  describe('getDefaultPhoneCountry', () => {
    it('returns fallback when country detection fails', async () => {
      const result = await phoneValidation.getDefaultPhoneCountry('CA')
      expect(['US', 'CA', 'GB', 'FR', 'DE', 'AU', 'us', 'ca', 'gb', 'fr', 'de', 'au']).toContain(result)
    })
  })

  describe('getDefaultPhoneCountrySync', () => {
    it('returns fallback when country detection fails', () => {
      const result = phoneValidation.getDefaultPhoneCountrySync('CA')
      expect(['US', 'CA', 'GB', 'FR', 'DE', 'AU', 'us', 'ca', 'gb', 'fr', 'de', 'au']).toContain(result)
    })
  })
}) 