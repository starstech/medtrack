import { describe, it, expect, vi, beforeEach } from 'vitest'
import { patientService } from '../../src/services/patientService'
import { createSupabaseMock, createMockPatient } from '../helpers/testUtils'

// Mock the entire supabase module
vi.mock('../../src/lib/supabase', () => {
  const mockSupabase = createSupabaseMock()
  return {
    supabase: mockSupabase
  }
})

// Import the mocked supabase
const { supabase } = await import('../../src/lib/supabase')

describe('patientService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getPatients', () => {
    it('fetches patients successfully', async () => {
      const mockPatients = [createMockPatient()]
      const mockResponse = { data: mockPatients, error: null }

      // Set up the mock chain properly
      const fromSpy = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue(mockResponse)
          })
        })
      })
      supabase.from = fromSpy

      const result = await patientService.getPatients()

      expect(fromSpy).toHaveBeenCalledWith('patients')
      expect(result).toEqual(mockResponse)
      expect(result.data).toHaveLength(1)
    })

    it('handles fetch error', async () => {
      const mockError = { message: 'Database error' }
      const mockResponse = { data: null, error: mockError }

      const fromSpy = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue(mockResponse)
          })
        })
      })
      supabase.from = fromSpy

      const result = await patientService.getPatients()

      expect(result.data).toBeNull()
      expect(result.error).toBe(mockError.message)
    })
  })

  describe('getPatient', () => {
    it('fetches single patient successfully', async () => {
      const mockPatient = createMockPatient()
      const mockResponse = { data: mockPatient, error: null }

      const fromSpy = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(mockResponse)
          })
        })
      })
      supabase.from = fromSpy

      const result = await patientService.getPatient('patient-1')

      expect(fromSpy).toHaveBeenCalledWith('patients')
      expect(result).toEqual(mockResponse)
      expect(result.data.id).toBe('patient-1')
    })

    it('handles not found error', async () => {
      const mockError = { message: 'No rows returned' }
      const mockResponse = { data: null, error: mockError }

      const fromSpy = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(mockResponse)
          })
        })
      })
      supabase.from = fromSpy

      const result = await patientService.getPatient('nonexistent')

      expect(result.data).toBeNull()
      expect(result.error).toBe(mockError.message)
    })
  })

  describe('createPatient', () => {
    it('creates patient successfully', async () => {
      const newPatient = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        phone: '+1234567890'
      }
      const createdPatient = createMockPatient(newPatient)
      const mockResponse = { data: createdPatient, error: null }

      // Mock auth.getUser
      supabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null
      })

      // Mock the patient creation chain
      const fromSpy = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(mockResponse)
          })
        })
      })
      supabase.from = fromSpy

      // Mock the caregiver relationship creation (separate call)
      fromSpy.mockReturnValueOnce({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(mockResponse)
          })
        })
      }).mockReturnValueOnce({
        insert: vi.fn().mockResolvedValue({ error: null })
      })

      const result = await patientService.createPatient(newPatient)

      expect(supabase.auth.getUser).toHaveBeenCalled()
      expect(result.data).toEqual(createdPatient)
      expect(result.error).toBeNull()
    })

    it('handles creation error', async () => {
      const mockError = { message: 'Validation error' }
      const newPatient = { first_name: 'John' }

      supabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null
      })

      const fromSpy = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: mockError })
          })
        })
      })
      supabase.from = fromSpy

      const result = await patientService.createPatient(newPatient)

      expect(result.data).toBeNull()
      expect(result.error).toBe(mockError.message)
    })
  })

  describe('updatePatient', () => {
    it('updates patient successfully', async () => {
      const updates = { first_name: 'Updated' }
      const updatedPatient = createMockPatient(updates)
      const mockResponse = { data: updatedPatient, error: null }

      const fromSpy = vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue(mockResponse)
            })
          })
        })
      })
      supabase.from = fromSpy

      const result = await patientService.updatePatient('patient-1', updates)

      expect(result.data).toEqual(updatedPatient)
      expect(result.error).toBeNull()
    })

    it('handles update error', async () => {
      const mockError = { message: 'Update failed' }
      const mockResponse = { data: null, error: mockError }

      const fromSpy = vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue(mockResponse)
            })
          })
        })
      })
      supabase.from = fromSpy

      const result = await patientService.updatePatient('patient-1', {})

      expect(result.data).toBeNull()
      expect(result.error).toBe(mockError.message)
    })
  })

  describe('deletePatient', () => {
    it('deletes patient successfully', async () => {
      const mockResponse = { error: null }

      const fromSpy = vi.fn().mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue(mockResponse)
        })
      })
      supabase.from = fromSpy

      const result = await patientService.deletePatient('patient-1')

      expect(result.data).toBe(true)
      expect(result.error).toBeNull()
    })

    it('handles deletion error', async () => {
      const mockError = { message: 'Delete failed' }
      const mockResponse = { error: mockError }

      const fromSpy = vi.fn().mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue(mockResponse)
        })
      })
      supabase.from = fromSpy

      const result = await patientService.deletePatient('patient-1')

      expect(result.data).toBeNull()
      expect(result.error).toBe(mockError.message)
    })
  })

  describe('searchPatients', () => {
    it('searches patients by name', async () => {
      const mockPatients = [createMockPatient({ first_name: 'John' })]
      const mockResponse = { data: mockPatients, error: null }

      const fromSpy = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          ilike: vi.fn().mockResolvedValue(mockResponse)
        })
      })
      supabase.from = fromSpy

      const result = await patientService.searchPatients('john')

      expect(fromSpy).toHaveBeenCalledWith('patients')
      expect(result.data).toEqual(mockPatients)
    })

    it('handles empty search results', async () => {
      const mockResponse = { data: [], error: null }

      const fromSpy = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          ilike: vi.fn().mockResolvedValue(mockResponse)
        })
      })
      supabase.from = fromSpy

      const result = await patientService.searchPatients('nonexistent')

      expect(result.data).toEqual([])
    })
  })

  describe('getPatientCaregivers', () => {
    it('fetches patient caregivers', async () => {
      const mockCaregivers = [{ id: 'caregiver-1', role: 'primary' }]
      const mockResponse = { data: mockCaregivers, error: null }

      const fromSpy = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue(mockResponse)
        })
      })
      supabase.from = fromSpy

      const result = await patientService.getPatientCaregivers('patient-1')

      expect(fromSpy).toHaveBeenCalledWith('patient_caregivers')
      expect(result.data).toEqual(mockCaregivers)
    })
  })

  describe('addCaregiver', () => {
    it('adds caregiver to patient', async () => {
      const caregiverData = { caregiver_id: 'caregiver-2', role: 'secondary' }
      const mockResponse = { data: caregiverData, error: null }

      const fromSpy = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue(mockResponse)
        })
      })
      supabase.from = fromSpy

      const result = await patientService.addCaregiver('patient-1', caregiverData)

      expect(result.data).toEqual(caregiverData)
    })
  })

  describe('updateCaregiver', () => {
    it('updates caregiver role/permissions', async () => {
      const updates = { role: 'primary' }
      const mockResponse = { data: updates, error: null }

      const fromSpy = vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue(mockResponse)
          })
        })
      })
      supabase.from = fromSpy

      const result = await patientService.updateCaregiver('patient-1', 'caregiver-1', updates)

      expect(result.data).toEqual(updates)
    })
  })

  describe('removeCaregiver', () => {
    it('removes caregiver from patient', async () => {
      const mockResponse = { error: null }

      const fromSpy = vi.fn().mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue(mockResponse)
          })
        })
      })
      supabase.from = fromSpy

      const result = await patientService.removeCaregiver('patient-1', 'caregiver-1')

      expect(result.error).toBeNull()
    })
  })

  describe('getPatientStats', () => {
    it('fetches patient statistics', async () => {
      const mockStats = createMockPatient()
      const mockResponse = { data: mockStats, error: null }

      const fromSpy = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(mockResponse)
          })
        })
      })
      supabase.from = fromSpy

      const result = await patientService.getPatientStats('patient-1')

      expect(result.data).toEqual(mockStats)
    })
  })

  describe('getPatientActivity', () => {
    it('fetches patient activity timeline', async () => {
      const mockActivity = [{ id: 'activity-1', type: 'medication_taken' }]
      const mockResponse = { data: mockActivity, error: null }

      const fromSpy = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue(mockResponse)
            })
          })
        })
      })
      supabase.from = fromSpy

      const result = await patientService.getPatientActivity('patient-1')

      expect(result.data).toEqual(mockActivity)
    })
  })

  describe('uploadProfileImage', () => {
    it('uploads patient profile image', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      const mockResponse = { data: { path: 'patient-1/profile-image' }, error: null }

      supabase.storage.from.mockReturnValue({
        upload: vi.fn().mockResolvedValue(mockResponse)
      })

      const result = await patientService.uploadProfileImage('patient-1', file)

      expect(supabase.storage.from).toHaveBeenCalledWith('patient_images')
      expect(result.data.path).toBe('patient-1/profile-image')
    })
  })
}) 