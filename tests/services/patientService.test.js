import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as patientService from '@/services/patientService'
import { supabase } from '@/services/api'

// Mock supabase
vi.mock('@/services/api', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn(),
    }))
  }
}))

describe('patientService', () => {
  const mockPatient = {
    id: 'patient-1',
    first_name: 'John',
    last_name: 'Doe',
    date_of_birth: '1990-01-01',
    phone: '+1234567890',
    email: 'john.doe@example.com',
    emergency_contact: '+0987654321',
    medical_conditions: ['Hypertension'],
    allergies: ['Penicillin'],
    caregiver_id: 'caregiver-1'
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getPatients', () => {
    it('fetches patients successfully', async () => {
      const mockResponse = {
        data: [mockPatient],
        error: null
      }

      supabase.from().select().eq().order().mockResolvedValue(mockResponse)

      const result = await patientService.getPatients('caregiver-1')

      expect(supabase.from).toHaveBeenCalledWith('patients')
      expect(result).toEqual([mockPatient])
    })

    it('handles fetch error', async () => {
      const mockError = { message: 'Database error' }
      supabase.from().select().eq().order().mockResolvedValue({
        data: null,
        error: mockError
      })

      await expect(patientService.getPatients('caregiver-1')).rejects.toThrow('Database error')
    })

    it('filters by caregiver_id correctly', async () => {
      const mockResponse = { data: [mockPatient], error: null }
      supabase.from().select().eq().order().mockResolvedValue(mockResponse)

      await patientService.getPatients('caregiver-1')

      expect(supabase.from().select().eq).toHaveBeenCalledWith('caregiver_id', 'caregiver-1')
    })
  })

  describe('createPatient', () => {
    it('creates patient successfully', async () => {
      const newPatient = {
        first_name: 'Jane',
        last_name: 'Smith',
        date_of_birth: '1985-05-15',
        phone: '+1987654321',
        caregiver_id: 'caregiver-1'
      }

      const mockResponse = {
        data: { ...newPatient, id: 'patient-2' },
        error: null
      }

      supabase.from().insert().select().single().mockResolvedValue(mockResponse)

      const result = await patientService.createPatient(newPatient)

      expect(supabase.from).toHaveBeenCalledWith('patients')
      expect(supabase.from().insert).toHaveBeenCalledWith(newPatient)
      expect(result).toEqual({ ...newPatient, id: 'patient-2' })
    })

    it('handles creation error', async () => {
      const mockError = { message: 'Validation error' }
      supabase.from().insert().select().single().mockResolvedValue({
        data: null,
        error: mockError
      })

      await expect(patientService.createPatient({})).rejects.toThrow('Validation error')
    })

    it('validates required fields', async () => {
      const incompletePatient = {
        first_name: 'John',
        // missing required fields
      }

      await expect(patientService.createPatient(incompletePatient))
        .rejects.toThrow(/required field/i)
    })

    it('validates phone number format', async () => {
      const invalidPatient = {
        ...mockPatient,
        phone: 'invalid-phone'
      }

      await expect(patientService.createPatient(invalidPatient))
        .rejects.toThrow(/invalid phone/i)
    })

    it('validates email format', async () => {
      const invalidPatient = {
        ...mockPatient,
        email: 'invalid-email'
      }

      await expect(patientService.createPatient(invalidPatient))
        .rejects.toThrow(/invalid email/i)
    })
  })

  describe('updatePatient', () => {
    it('updates patient successfully', async () => {
      const updates = { 
        phone: '+1555666777',
        emergency_contact: '+1555999888'
      }
      const mockResponse = {
        data: { ...mockPatient, ...updates },
        error: null
      }

      supabase.from().update().eq().select().single().mockResolvedValue(mockResponse)

      const result = await patientService.updatePatient('patient-1', updates)

      expect(supabase.from).toHaveBeenCalledWith('patients')
      expect(supabase.from().update).toHaveBeenCalledWith(updates)
      expect(supabase.from().update().eq).toHaveBeenCalledWith('id', 'patient-1')
      expect(result).toEqual({ ...mockPatient, ...updates })
    })

    it('handles update error', async () => {
      const mockError = { message: 'Update failed' }
      supabase.from().update().eq().select().single().mockResolvedValue({
        data: null,
        error: mockError
      })

      await expect(patientService.updatePatient('patient-1', {})).rejects.toThrow('Update failed')
    })

    it('validates phone number on update', async () => {
      const invalidUpdates = { phone: 'invalid' }

      await expect(patientService.updatePatient('patient-1', invalidUpdates))
        .rejects.toThrow(/invalid phone/i)
    })
  })

  describe('deletePatient', () => {
    it('deletes patient successfully', async () => {
      const mockResponse = { error: null }
      supabase.from().delete().eq().mockResolvedValue(mockResponse)

      await patientService.deletePatient('patient-1')

      expect(supabase.from).toHaveBeenCalledWith('patients')
      expect(supabase.from().delete().eq).toHaveBeenCalledWith('id', 'patient-1')
    })

    it('handles deletion error', async () => {
      const mockError = { message: 'Delete failed' }
      supabase.from().delete().eq().mockResolvedValue({ error: mockError })

      await expect(patientService.deletePatient('patient-1')).rejects.toThrow('Delete failed')
    })
  })

  describe('getPatientById', () => {
    it('fetches single patient successfully', async () => {
      const mockResponse = {
        data: mockPatient,
        error: null
      }

      supabase.from().select().eq().single().mockResolvedValue(mockResponse)

      const result = await patientService.getPatientById('patient-1')

      expect(supabase.from).toHaveBeenCalledWith('patients')
      expect(supabase.from().select().eq).toHaveBeenCalledWith('id', 'patient-1')
      expect(result).toEqual(mockPatient)
    })

    it('handles not found error', async () => {
      const mockError = { message: 'No rows returned' }
      supabase.from().select().eq().single().mockResolvedValue({
        data: null,
        error: mockError
      })

      await expect(patientService.getPatientById('999')).rejects.toThrow('No rows returned')
    })
  })

  describe('searchPatients', () => {
    it('searches patients by name', async () => {
      const searchResults = [mockPatient]
      const mockResponse = {
        data: searchResults,
        error: null
      }

      supabase.from().select().or().eq().mockResolvedValue(mockResponse)

      const result = await patientService.searchPatients('caregiver-1', 'john')

      expect(supabase.from).toHaveBeenCalledWith('patients')
      expect(result).toEqual(searchResults)
    })

    it('handles empty search results', async () => {
      const mockResponse = {
        data: [],
        error: null
      }

      supabase.from().select().or().eq().mockResolvedValue(mockResponse)

      const result = await patientService.searchPatients('caregiver-1', 'nonexistent')

      expect(result).toEqual([])
    })
  })

  describe('getPatientStats', () => {
    it('calculates patient statistics', async () => {
      const mockStats = {
        totalPatients: 5,
        activePatients: 4,
        patientsWithUpcomingAppointments: 2,
        patientsWithCriticalAlerts: 1
      }

      const result = await patientService.getPatientStats('caregiver-1')

      expect(result).toHaveProperty('totalPatients')
      expect(result).toHaveProperty('activePatients')
      expect(result).toHaveProperty('patientsWithUpcomingAppointments')
      expect(result).toHaveProperty('patientsWithCriticalAlerts')
    })
  })
}) 