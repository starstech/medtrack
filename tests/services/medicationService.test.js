import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as medicationService from '@/services/medicationService'
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

describe('medicationService', () => {
  const mockMedication = {
    id: '1',
    name: 'Aspirin',
    dosage: '100mg',
    frequency: 'Daily',
    patient_id: 'patient-1',
    instructions: 'Take with food',
    active: true
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getMedications', () => {
    it('fetches medications successfully', async () => {
      const mockResponse = {
        data: [mockMedication],
        error: null
      }

      supabase.from().select().eq().order().mockResolvedValue(mockResponse)

      const result = await medicationService.getMedications('patient-1')

      expect(supabase.from).toHaveBeenCalledWith('medications')
      expect(result).toEqual([mockMedication])
    })

    it('handles fetch error', async () => {
      const mockError = { message: 'Database error' }
      supabase.from().select().eq().order().mockResolvedValue({
        data: null,
        error: mockError
      })

      await expect(medicationService.getMedications('patient-1')).rejects.toThrow('Database error')
    })

    it('filters by patient_id correctly', async () => {
      const mockResponse = { data: [mockMedication], error: null }
      supabase.from().select().eq().order().mockResolvedValue(mockResponse)

      await medicationService.getMedications('patient-1')

      expect(supabase.from().select().eq).toHaveBeenCalledWith('patient_id', 'patient-1')
    })
  })

  describe('createMedication', () => {
    it('creates medication successfully', async () => {
      const newMedication = {
        name: 'Ibuprofen',
        dosage: '200mg',
        frequency: 'Twice daily',
        patient_id: 'patient-1'
      }

      const mockResponse = {
        data: { ...newMedication, id: '2' },
        error: null
      }

      supabase.from().insert().select().single().mockResolvedValue(mockResponse)

      const result = await medicationService.createMedication(newMedication)

      expect(supabase.from).toHaveBeenCalledWith('medications')
      expect(supabase.from().insert).toHaveBeenCalledWith(newMedication)
      expect(result).toEqual({ ...newMedication, id: '2' })
    })

    it('handles creation error', async () => {
      const mockError = { message: 'Validation error' }
      supabase.from().insert().select().single().mockResolvedValue({
        data: null,
        error: mockError
      })

      await expect(medicationService.createMedication({})).rejects.toThrow('Validation error')
    })

    it('validates required fields', async () => {
      const incompleteMedication = {
        name: 'Medication',
        // missing required fields
      }

      await expect(medicationService.createMedication(incompleteMedication))
        .rejects.toThrow(/required field/i)
    })
  })

  describe('updateMedication', () => {
    it('updates medication successfully', async () => {
      const updates = { dosage: '150mg', frequency: 'Twice daily' }
      const mockResponse = {
        data: { ...mockMedication, ...updates },
        error: null
      }

      supabase.from().update().eq().select().single().mockResolvedValue(mockResponse)

      const result = await medicationService.updateMedication('1', updates)

      expect(supabase.from).toHaveBeenCalledWith('medications')
      expect(supabase.from().update).toHaveBeenCalledWith(updates)
      expect(supabase.from().update().eq).toHaveBeenCalledWith('id', '1')
      expect(result).toEqual({ ...mockMedication, ...updates })
    })

    it('handles update error', async () => {
      const mockError = { message: 'Update failed' }
      supabase.from().update().eq().select().single().mockResolvedValue({
        data: null,
        error: mockError
      })

      await expect(medicationService.updateMedication('1', {})).rejects.toThrow('Update failed')
    })
  })

  describe('deleteMedication', () => {
    it('deletes medication successfully', async () => {
      const mockResponse = { error: null }
      supabase.from().delete().eq().mockResolvedValue(mockResponse)

      await medicationService.deleteMedication('1')

      expect(supabase.from).toHaveBeenCalledWith('medications')
      expect(supabase.from().delete().eq).toHaveBeenCalledWith('id', '1')
    })

    it('handles deletion error', async () => {
      const mockError = { message: 'Delete failed' }
      supabase.from().delete().eq().mockResolvedValue({ error: mockError })

      await expect(medicationService.deleteMedication('1')).rejects.toThrow('Delete failed')
    })
  })

  describe('getMedicationById', () => {
    it('fetches single medication successfully', async () => {
      const mockResponse = {
        data: mockMedication,
        error: null
      }

      supabase.from().select().eq().single().mockResolvedValue(mockResponse)

      const result = await medicationService.getMedicationById('1')

      expect(supabase.from).toHaveBeenCalledWith('medications')
      expect(supabase.from().select().eq).toHaveBeenCalledWith('id', '1')
      expect(result).toEqual(mockMedication)
    })

    it('handles not found error', async () => {
      const mockError = { message: 'No rows returned' }
      supabase.from().select().eq().single().mockResolvedValue({
        data: null,
        error: mockError
      })

      await expect(medicationService.getMedicationById('999')).rejects.toThrow('No rows returned')
    })
  })

  describe('searchMedications', () => {
    it('searches medications by name', async () => {
      const searchResults = [mockMedication]
      const mockResponse = {
        data: searchResults,
        error: null
      }

      supabase.from().select().ilike().eq().mockResolvedValue(mockResponse)

      const result = await medicationService.searchMedications('patient-1', 'aspirin')

      expect(supabase.from).toHaveBeenCalledWith('medications')
      expect(result).toEqual(searchResults)
    })

    it('handles empty search results', async () => {
      const mockResponse = {
        data: [],
        error: null
      }

      supabase.from().select().ilike().eq().mockResolvedValue(mockResponse)

      const result = await medicationService.searchMedications('patient-1', 'nonexistent')

      expect(result).toEqual([])
    })
  })
}) 