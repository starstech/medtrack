// API Integration Tests for MedTrack
// Tests frontend services + backend + RLS without UI

import { describe, test, expect, beforeAll, afterAll } from 'vitest'
import { createClient } from '@supabase/supabase-js'
import { patientService } from '../src/services/patientService'
import { authService } from '../src/services/authService'

const supabaseUrl = 'http://localhost:54321'
const supabaseAnonKey = 'your-anon-key-here'

describe('MedTrack API Integration Tests', () => {
  let testUser = null
  let testPatient = null
  
  beforeAll(async () => {
    // Create test user
    const signUpResult = await authService.signUp(
      'test@example.com',
      'testpassword123',
      { fullName: 'Test User' }
    )
    
    if (signUpResult.success) {
      testUser = signUpResult.data.user
    }
  })

  afterAll(async () => {
    // Cleanup test data
    if (testPatient) {
      await patientService.deletePatient(testPatient.id)
    }
    // Note: User cleanup would need admin privileges
  })

  describe('Authentication', () => {
    test('should sign up new user', async () => {
      const result = await authService.signUp(
        'newuser@example.com',
        'password123',
        { fullName: 'New User' }
      )
      
      expect(result.success).toBe(true)
      expect(result.data.user).toBeDefined()
      expect(result.data.user.email).toBe('newuser@example.com')
    })

    test('should sign in existing user', async () => {
      const result = await authService.signIn('test@example.com', 'testpassword123')
      
      expect(result.success).toBe(true)
      expect(result.data.user).toBeDefined()
      expect(result.data.session).toBeDefined()
    })

    test('should handle invalid credentials', async () => {
      const result = await authService.signIn('test@example.com', 'wrongpassword')
      
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('Patient Management', () => {
    test('should create patient with valid data', async () => {
      const patientData = {
        name: 'John Doe',
        dateOfBirth: '1990-01-01',
        gender: 'male',
        emergencyContact: {
          name: 'Jane Doe',
          phone: '+1234567890',
          relationship: 'spouse',
          email: 'jane@example.com'
        }
      }

      const result = await patientService.createPatient(patientData)
      
      expect(result.error).toBeNull()
      expect(result.data).toBeDefined()
      expect(result.data.name).toBe('John Doe')
      expect(result.data.emergency_contact.name).toBe('Jane Doe')
      
      testPatient = result.data
    })

    test('should validate phone number formats', async () => {
      const patientData = {
        name: 'Test Patient',
        dateOfBirth: '1990-01-01',
        gender: 'female',
        emergencyContact: {
          name: 'Emergency Contact',
          phone: '+971501234567', // UAE format
          relationship: 'parent'
        }
      }

      const result = await patientService.createPatient(patientData)
      
      expect(result.error).toBeNull()
      expect(result.data.emergency_contact.phone).toBe('+971501234567')
    })

    test('should reject invalid phone formats', async () => {
      const patientData = {
        name: 'Test Patient',
        dateOfBirth: '1990-01-01',
        gender: 'male',
        emergencyContact: {
          name: 'Emergency Contact',
          phone: '123', // Invalid format
          relationship: 'parent'
        }
      }

      const result = await patientService.createPatient(patientData)
      
      expect(result.error).toBeDefined()
      expect(result.error).toContain('phone')
    })

    test('should update patient data', async () => {
      if (!testPatient) return

      const updateData = {
        name: 'John Updated Doe',
        emergencyContact: {
          ...testPatient.emergency_contact,
          phone: '+971509876543'
        }
      }

      const result = await patientService.updatePatient(testPatient.id, updateData)
      
      expect(result.error).toBeNull()
      expect(result.data.name).toBe('John Updated Doe')
      expect(result.data.emergency_contact.phone).toBe('+971509876543')
    })

    test('should enforce RLS - user can only see their patients', async () => {
      // This would require creating another user and testing isolation
      const result = await patientService.getPatients()
      
      expect(result.error).toBeNull()
      expect(Array.isArray(result.data)).toBe(true)
      // All patients should belong to current user
      result.data.forEach(patient => {
        expect(patient.created_by).toBe(testUser.id)
      })
    })
  })

  describe('Phone Number Validation', () => {
    test('should accept international formats', () => {
      const testCases = [
        '+1234567890',      // US
        '+971501234567',    // UAE
        '+442071234567',    // UK
        '+33123456789',     // France
        '+49301234567'      // Germany
      ]

      testCases.forEach(phone => {
        // Test your phone validation function
        const isValid = phone.match(/^\+?[\d\s\-\(\)\.]{7,20}$/) && 
                       phone.replace(/[^\d]/g, '').length >= 7 && 
                       phone.replace(/[^\d]/g, '').length <= 15
        expect(isValid).toBe(true)
      })
    })

    test('should reject invalid formats', () => {
      const invalidCases = [
        '123',              // Too short
        'abc123',           // Contains letters
        '+123456789012345678', // Too long
        ''                  // Empty
      ]

      invalidCases.forEach(phone => {
        const isValid = phone.match(/^\+?[\d\s\-\(\)\.]{7,20}$/) && 
                       phone.replace(/[^\d]/g, '').length >= 7 && 
                       phone.replace(/[^\d]/g, '').length <= 15
        expect(isValid).toBe(false)
      })
    })
  })

  describe('Country Detection', () => {
    test('should detect country from IP', async () => {
      // Mock or test actual detection
      const mockFetch = global.fetch
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ country_code: 'AE' })
        })
      )

      const { detectUserCountry } = await import('../src/utils/countryDetection')
      const country = await detectUserCountry()
      
      expect(country).toBe('ae')
      
      global.fetch = mockFetch
    })

    test('should fallback to locale detection', () => {
      // Test locale detection
      const originalLanguage = navigator.language
      Object.defineProperty(navigator, 'language', {
        value: 'en-CA',
        configurable: true
      })

      const { getUserCountrySync } = require('../src/utils/countryDetection')
      const country = getUserCountrySync()
      
      expect(country).toBe('ca')
      
      Object.defineProperty(navigator, 'language', {
        value: originalLanguage,
        configurable: true
      })
    })
  })

  describe('Database Constraints', () => {
    test('should enforce required fields', async () => {
      const invalidPatient = {
        // Missing required name field
        dateOfBirth: '1990-01-01'
      }

      const result = await patientService.createPatient(invalidPatient)
      
      expect(result.error).toBeDefined()
      expect(result.error).toContain('name')
    })

    test('should validate date ranges', async () => {
      const futurePatient = {
        name: 'Future Patient',
        dateOfBirth: '2030-01-01', // Future date
        gender: 'male'
      }

      const result = await patientService.createPatient(futurePatient)
      
      expect(result.error).toBeDefined()
      expect(result.error).toContain('date')
    })
  })
})

// Performance Tests
describe('Performance Tests', () => {
  test('should load patients quickly', async () => {
    const startTime = Date.now()
    const result = await patientService.getPatients()
    const endTime = Date.now()
    
    expect(result.error).toBeNull()
    expect(endTime - startTime).toBeLessThan(1000) // Should load in under 1 second
  })

  test('should handle concurrent requests', async () => {
    const promises = Array(10).fill().map(() => patientService.getPatients())
    const results = await Promise.all(promises)
    
    results.forEach(result => {
      expect(result.error).toBeNull()
    })
  })
}) 