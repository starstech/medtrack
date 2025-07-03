import { describe, it, expect, vi, beforeEach } from 'vitest'
import { medicationService } from '../../src/services/medicationService'
import { createSupabaseMock, createMockMedication } from '../helpers/testUtils'

// Mock the entire supabase module
vi.mock('../../src/lib/supabase', () => {
  const mockSupabase = createSupabaseMock()
  return {
    supabase: mockSupabase
  }
})

// Import the mocked supabase
const { supabase } = await import('../../src/lib/supabase')

describe('medicationService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getMedications', () => {
    it('fetches medications successfully', async () => {
      const mockMedications = [createMockMedication()]
      const mockResponse = { data: mockMedications, error: null }

      const fromSpy = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue(mockResponse)
            })
          })
        })
      })
      supabase.from = fromSpy

      const result = await medicationService.getMedications('patient-1')

      expect(fromSpy).toHaveBeenCalledWith('medications')
      expect(result).toEqual(mockResponse)
      expect(result.data).toHaveLength(1)
    })

    it('handles fetch error', async () => {
      const mockError = { message: 'Database error' }
      const mockResponse = { data: null, error: mockError }

      const fromSpy = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue(mockResponse)
            })
          })
        })
      })
      supabase.from = fromSpy

      const result = await medicationService.getMedications('patient-1')

      expect(result.data).toBeNull()
      expect(result.error).toBe(mockError.message)
    })
  })

  describe('getMedication', () => {
    it('fetches single medication successfully', async () => {
      const mockMedication = createMockMedication()
      const mockResponse = { data: mockMedication, error: null }

      const fromSpy = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(mockResponse)
          })
        })
      })
      supabase.from = fromSpy

      const result = await medicationService.getMedication('medication-1')

      expect(fromSpy).toHaveBeenCalledWith('medications')
      expect(result).toEqual(mockResponse)
      expect(result.data.id).toBe('medication-1')
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

      const result = await medicationService.getMedication('nonexistent')

      expect(result.data).toBeNull()
      expect(result.error).toBe(mockError.message)
    })
  })

  describe('createMedication', () => {
    it('creates medication successfully', async () => {
      const newMedication = {
        patient_id: 'patient-1',
        name: 'Aspirin',
        dosage: '100mg',
        frequency: 'Daily'
      }
      const createdMedication = createMockMedication(newMedication)
      const mockResponse = { data: createdMedication, error: null }

      // Mock auth.getUser
      supabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null
      })

      const fromSpy = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(mockResponse)
          })
        })
      })
      supabase.from = fromSpy

      const result = await medicationService.createMedication(newMedication)

      expect(supabase.auth.getUser).toHaveBeenCalled()
      expect(result.data).toEqual(createdMedication)
      expect(result.error).toBeNull()
    })

    it('handles creation error', async () => {
      const mockError = { message: 'Validation error' }
      const newMedication = { name: 'Test Med' }

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

      const result = await medicationService.createMedication(newMedication)

      expect(result.data).toBeNull()
      expect(result.error).toBe(mockError.message)
    })
  })

  describe('updateMedication', () => {
    it('updates medication successfully', async () => {
      const updates = { dosage: '200mg' }
      const updatedMedication = createMockMedication(updates)
      const mockResponse = { data: updatedMedication, error: null }

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

      const result = await medicationService.updateMedication('medication-1', updates)

      expect(result.data).toEqual(updatedMedication)
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

      const result = await medicationService.updateMedication('medication-1', {})

      expect(result.data).toBeNull()
      expect(result.error).toBe(mockError.message)
    })
  })

  describe('deleteMedication', () => {
    it('soft deletes medication successfully', async () => {
      const mockMedication = createMockMedication({ is_active: false })
      const mockResponse = { data: mockMedication, error: null }

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

      const result = await medicationService.deleteMedication('medication-1')

      expect(result.data).toEqual(mockMedication)
      expect(result.error).toBeNull()
    })

    it('handles deletion error', async () => {
      const mockError = { message: 'Delete failed' }
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

      const result = await medicationService.deleteMedication('medication-1')

      expect(result.data).toBeNull()
      expect(result.error).toBe(mockError.message)
    })
  })

  describe('getMedicationSchedule', () => {
    it('fetches medication schedule', async () => {
      const mockSchedule = { times: ['08:00', '20:00'], days: ['Mon', 'Tue', 'Wed'] }
      const mockResponse = { data: { schedule: mockSchedule }, error: null }

      const fromSpy = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(mockResponse)
          })
        })
      })
      supabase.from = fromSpy

      const result = await medicationService.getMedicationSchedule('medication-1')

      expect(result.data.schedule).toEqual(mockSchedule)
    })
  })

  describe('updateMedicationSchedule', () => {
    it('updates medication schedule', async () => {
      const scheduleData = { times: ['09:00', '21:00'] }
      const mockResponse = { data: { schedule: scheduleData }, error: null }

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

      const result = await medicationService.updateMedicationSchedule('medication-1', scheduleData)

      expect(result.data.schedule).toEqual(scheduleData)
    })
  })

  describe('searchMedications', () => {
    it('searches medications by name', async () => {
      const mockMedications = [createMockMedication({ name: 'Aspirin' })]
      const mockResponse = { data: mockMedications, error: null }

      const fromSpy = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          ilike: vi.fn().mockResolvedValue(mockResponse)
        })
      })
      supabase.from = fromSpy

      const result = await medicationService.searchMedications('aspirin')

      expect(fromSpy).toHaveBeenCalledWith('medications')
      expect(result.data).toEqual(mockMedications)
    })

    it('handles empty search results', async () => {
      const mockResponse = { data: [], error: null }

      const fromSpy = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          ilike: vi.fn().mockResolvedValue(mockResponse)
        })
      })
      supabase.from = fromSpy

      const result = await medicationService.searchMedications('nonexistent')

      expect(result.data).toEqual([])
    })
  })

  describe('getMedicationHistory', () => {
    it('fetches medication history', async () => {
      const mockHistory = { changes: [{ date: '2024-01-01', change: 'Dosage increased' }] }
      const mockResponse = { data: { history: mockHistory }, error: null }

      const fromSpy = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(mockResponse)
          })
        })
      })
      supabase.from = fromSpy

      const result = await medicationService.getMedicationHistory('medication-1')

      expect(result.data.history).toEqual(mockHistory)
    })
  })

  describe('getMedicationAdherence', () => {
    it('fetches medication adherence data', async () => {
      const mockAdherence = { percentage: 85, missed_doses: 3 }
      const mockResponse = { data: { adherence: mockAdherence }, error: null }

      const fromSpy = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(mockResponse)
          })
        })
      })
      supabase.from = fromSpy

      const result = await medicationService.getMedicationAdherence('medication-1', '30')

      expect(result.data.adherence).toEqual(mockAdherence)
    })
  })
}) 