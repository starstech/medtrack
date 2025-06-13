// Phone validation utilities for antd-phone-input
// This provides validation rules and helpers for international phone numbers

import { detectUserCountry, getUserCountrySync } from './countryDetection'

/**
 * Creates a phone validation rule for Ant Design forms
 * @param {string} defaultCountry - Default country code (optional, will auto-detect if not provided)
 * @param {boolean} required - Whether the field is required
 * @returns {Array} - Ant Design validation rules
 */
export const createPhoneValidationRules = (defaultCountry, required = false) => {
  const rules = []
  
  if (required) {
    rules.push({
      required: true,
      message: 'Please enter a phone number'
    })
  }
  
  rules.push({
    validator: async (_, value) => {
      if (!value && !required) {
        return Promise.resolve()
      }
      
      // Get the country to use for validation
      const countryToUse = defaultCountry || await detectUserCountry()
      
      // antd-phone-input provides its own validation
      // We just check if the value exists and has a phone property
      if (value && value.phone && value.phone.length >= 7) {
        return Promise.resolve()
      }
      
      return Promise.reject(new Error('Please enter a valid phone number'))
    }
  })
  
  return rules
}

/**
 * Creates phone validation rules with synchronous country detection
 * Use this when you need immediate validation without async operations
 * @param {string} defaultCountry - Default country code (optional)
 * @param {boolean} required - Whether the field is required
 * @returns {Array} - Ant Design validation rules
 */
export const createPhoneValidationRulesSync = (defaultCountry, required = false) => {
  const rules = []
  
  if (required) {
    rules.push({
      required: true,
      message: 'Please enter a phone number'
    })
  }
  
  rules.push({
    validator: (_, value) => {
      if (!value && !required) {
        return Promise.resolve()
      }
      
      // Get the country to use for validation (synchronous)
      const countryToUse = defaultCountry || getUserCountrySync()
      
      // antd-phone-input provides its own validation
      // We just check if the value exists and has a phone property
      if (value && value.phone && value.phone.length >= 7) {
        return Promise.resolve()
      }
      
      return Promise.reject(new Error('Please enter a valid phone number'))
    }
  })
  
  return rules
}

/**
 * Emergency contact validation - allows for optional fields
 * @param {Object} emergencyContact - Emergency contact object
 * @returns {Object} - Validation result
 */
export const validateEmergencyContact = (emergencyContact) => {
  if (!emergencyContact) {
    return {
      isValid: true, // Emergency contact is optional
      errors: {},
      warnings: ['No emergency contact provided - consider adding one for safety']
    }
  }

  const errors = {}
  const warnings = []

  // Name validation
  if (!emergencyContact.name || emergencyContact.name.trim() === '') {
    errors.name = 'Emergency contact name is required'
  }

  // Phone validation for antd-phone-input format
  if (!emergencyContact.phone) {
    errors.phone = 'Emergency contact phone number is required'
  } else if (typeof emergencyContact.phone === 'object') {
    // antd-phone-input returns an object with phone and countryCode
    if (!emergencyContact.phone.phone || emergencyContact.phone.phone.length < 7) {
      errors.phone = 'Please enter a valid phone number'
    }
  } else if (typeof emergencyContact.phone === 'string') {
    // Handle string format
    if (emergencyContact.phone.trim() === '' || emergencyContact.phone.length < 7) {
      errors.phone = 'Please enter a valid phone number'
    }
  }

  // Relationship validation
  if (!emergencyContact.relationship || emergencyContact.relationship.trim() === '') {
    errors.relationship = 'Relationship to patient is required'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings
  }
}

/**
 * Default emergency contact template
 */
export const getDefaultEmergencyContact = () => ({
  name: '',
  phone: '',
  relationship: '',
  email: '' // Optional field
})

/**
 * Format phone number from antd-phone-input for storage
 * @param {Object|string} phoneValue - Phone value from antd-phone-input
 * @returns {string} - Formatted phone number for storage
 */
export const formatPhoneForStorage = (phoneValue) => {
  if (!phoneValue) return ''
  
  if (typeof phoneValue === 'object' && phoneValue.phone) {
    // antd-phone-input format: { phone: "1234567890", countryCode: "1" }
    return `+${phoneValue.countryCode}${phoneValue.phone}`
  }
  
  if (typeof phoneValue === 'string') {
    return phoneValue
  }
  
  return ''
}

/**
 * Parse phone number for antd-phone-input from stored format
 * @param {string} storedPhone - Phone number from database
 * @returns {Object|string} - Phone value for antd-phone-input
 */
export const parsePhoneFromStorage = (storedPhone) => {
  if (!storedPhone) return ''
  
  // If it's already in the correct format, return as is
  if (typeof storedPhone === 'object') return storedPhone
  
  // For string format, just return the string
  // antd-phone-input will handle parsing
  return storedPhone
}

/**
 * Get the default country for phone validation
 * @param {string} fallbackCountry - Fallback country if detection fails
 * @returns {Promise<string>} - Country code
 */
export const getDefaultPhoneCountry = async (fallbackCountry = 'ca') => {
  try {
    return await detectUserCountry()
  } catch (error) {
    console.warn('Failed to detect country for phone validation:', error)
    return fallbackCountry
  }
}

/**
 * Get the default country for phone validation (synchronous)
 * @param {string} fallbackCountry - Fallback country if detection fails
 * @returns {string} - Country code
 */
export const getDefaultPhoneCountrySync = (fallbackCountry = 'ca') => {
  try {
    return getUserCountrySync()
  } catch (error) {
    console.warn('Failed to detect country for phone validation:', error)
    return fallbackCountry
  }
} 