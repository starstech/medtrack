import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as doseService from '@/services/doseService'
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
      neq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn(),
      maybeSingle: vi.fn()
    }))
  }
}))

describe('doseService', () => {
  const mockDose = {
    id: 'dose-123',
    patient_id: 'patient-123',
    medication_id: 'med-123',
    scheduled_time: '2024-01-01T09:00:00.000Z',
    actual_time: null,
    status: 'pending',
    notes: '',
    created_by: 'user-123',
    created_at: '2024-01-01T00:00:00.000Z',
    medication: {
      id: 'med-123',
      name: 'Test Medication',
      dosage: '10mg',
      form: 'tablet'
    }
  }

  const mockPatient = {
    id: 'patient-123',
    name: 'Test Patient',
    date_of_birth: '1990-01-01'
  }

  let mockSupabaseChain

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Create a mock chain that can be chained
    mockSupabaseChain = {
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn(),
      maybeSingle: vi.fn()
    }
    
    supabase.from.mockReturnValue(mockSupabaseChain)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getDoses', () => {
    it('gets doses for patient successfully', async () => {
      const mockDoses = [mockDose]
      mockSupabaseChain.select.mockResolvedValue({
        data: mockDoses,
        error: null
      })

      const result = await doseService.getDoses('patient-123')

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockDoses)
      expect(supabase.from).toHaveBeenCalledWith('doses')
      expect(mockSupabaseChain.eq).toHaveBeenCalledWith('patient_id', 'patient-123')
    })

    it('gets doses for date range', async () => {
      const mockDoses = [mockDose]
      mockSupabaseChain.select.mockResolvedValue({
        data: mockDoses,
        error: null
      })

      const startDate = '2024-01-01'
      const endDate = '2024-01-02'

      const result = await doseService.getDoses('patient-123', { startDate, endDate })

      expect(result.success).toBe(true)
      expect(mockSupabaseChain.gte).toHaveBeenCalledWith('scheduled_time', startDate)
      expect(mockSupabaseChain.lte).toHaveBeenCalledWith('scheduled_time', endDate)
    })

    it('filters doses by status', async () => {
      const mockDoses = [mockDose]
      mockSupabaseChain.select.mockResolvedValue({
        data: mockDoses,
        error: null
      })

      const result = await doseService.getDoses('patient-123', { status: 'pending' })

      expect(result.success).toBe(true)
      expect(mockSupabaseChain.eq).toHaveBeenCalledWith('status', 'pending')
    })

    it('gets doses for specific medication', async () => {
      const mockDoses = [mockDose]
      mockSupabaseChain.select.mockResolvedValue({
        data: mockDoses,
        error: null
      })

      const result = await doseService.getDoses('patient-123', { medicationId: 'med-123' })

      expect(result.success).toBe(true)
      expect(mockSupabaseChain.eq).toHaveBeenCalledWith('medication_id', 'med-123')
    })

    it('handles errors when getting doses', async () => {
      const error = { message: 'Database error' }
      mockSupabaseChain.select.mockResolvedValue({
        data: null,
        error
      })

      const result = await doseService.getDoses('patient-123')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Database error')
    })

    it('validates patient ID', async () => {
      const result = await doseService.getDoses('')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Patient ID is required')
    })
  })

  describe('getTodaysDoses', () => {
    it('gets today\'s doses successfully', async () => {
      const mockDoses = [mockDose]
      mockSupabaseChain.select.mockResolvedValue({
        data: mockDoses,
        error: null
      })

      const result = await doseService.getTodaysDoses('patient-123')

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockDoses)
      
      // Should filter by today's date
      const today = new Date().toISOString().split('T')[0]
      expect(mockSupabaseChain.gte).toHaveBeenCalledWith('scheduled_time', today)
      expect(mockSupabaseChain.lte).toHaveBeenCalledWith('scheduled_time', `${today}T23:59:59.999Z`)
    })

    it('orders doses by scheduled time', async () => {
      const mockDoses = [mockDose]
      mockSupabaseChain.select.mockResolvedValue({
        data: mockDoses,
        error: null
      })

      await doseService.getTodaysDoses('patient-123')

      expect(mockSupabaseChain.order).toHaveBeenCalledWith('scheduled_time', { ascending: true })
    })

    it('includes medication details', async () => {
      const mockDoses = [mockDose]
      mockSupabaseChain.select.mockResolvedValue({
        data: mockDoses,
        error: null
      })

      await doseService.getTodaysDoses('patient-123')

      expect(mockSupabaseChain.select).toHaveBeenCalledWith(`
        *,
        medication:medications(*)
      `)
    })
  })

  describe('createDose', () => {
    const doseData = {
      patient_id: 'patient-123',
      medication_id: 'med-123',
      scheduled_time: '2024-01-01T09:00:00.000Z',
      dosage: '1 tablet',
      notes: 'Take with food'
    }

    it('creates dose successfully', async () => {
      mockSupabaseChain.insert.mockResolvedValue({
        data: [mockDose],
        error: null
      })

      const result = await doseService.createDose(doseData)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockDose)
      expect(supabase.from).toHaveBeenCalledWith('doses')
      expect(mockSupabaseChain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          ...doseData,
          status: 'pending',
          created_at: expect.any(String)
        })
      )
    })

    it('validates required fields', async () => {
      const result = await doseService.createDose({})

      expect(result.success).toBe(false)
      expect(result.error).toContain('required')
    })

    it('validates scheduled time format', async () => {
      const result = await doseService.createDose({
        ...doseData,
        scheduled_time: 'invalid-date'
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('valid date')
    })

    it('validates scheduled time is not in the past', async () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      const result = await doseService.createDose({
        ...doseData,
        scheduled_time: pastDate
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('future')
    })

    it('handles creation errors', async () => {
      const error = { message: 'Creation failed' }
      mockSupabaseChain.insert.mockResolvedValue({
        data: null,
        error
      })

      const result = await doseService.createDose(doseData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Creation failed')
    })
  })

  describe('updateDose', () => {
    const updates = {
      notes: 'Updated notes',
      dosage: '2 tablets'
    }

    it('updates dose successfully', async () => {
      const updatedDose = { ...mockDose, ...updates }
      mockSupabaseChain.update.mockResolvedValue({
        data: [updatedDose],
        error: null
      })

      const result = await doseService.updateDose('dose-123', updates)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(updatedDose)
      expect(supabase.from).toHaveBeenCalledWith('doses')
      expect(mockSupabaseChain.eq).toHaveBeenCalledWith('id', 'dose-123')
      expect(mockSupabaseChain.update).toHaveBeenCalledWith(
        expect.objectContaining({
          ...updates,
          updated_at: expect.any(String)
        })
      )
    })

    it('validates dose ID', async () => {
      const result = await doseService.updateDose('', updates)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Dose ID is required')
    })

    it('validates update data', async () => {
      const result = await doseService.updateDose('dose-123', {})

      expect(result.success).toBe(false)
      expect(result.error).toContain('update data')
    })

    it('handles update errors', async () => {
      const error = { message: 'Update failed' }
      mockSupabaseChain.update.mockResolvedValue({
        data: null,
        error
      })

      const result = await doseService.updateDose('dose-123', updates)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Update failed')
    })

    it('prevents updating immutable fields', async () => {
      const result = await doseService.updateDose('dose-123', {
        id: 'new-id',
        created_at: '2024-01-01T00:00:00.000Z'
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('cannot be updated')
    })
  })

  describe('markDose', () => {
    it('marks dose as taken successfully', async () => {
      const markedDose = {
        ...mockDose,
        status: 'taken',
        actual_time: expect.any(String),
        notes: 'Taken as scheduled'
      }
      
      mockSupabaseChain.update.mockResolvedValue({
        data: [markedDose],
        error: null
      })

      const result = await doseService.markDose('dose-123', 'taken', {
        notes: 'Taken as scheduled',
        actualTime: new Date().toISOString()
      })

      expect(result.success).toBe(true)
      expect(result.data.status).toBe('taken')
      expect(mockSupabaseChain.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'taken',
          actual_time: expect.any(String),
          notes: 'Taken as scheduled'
        })
      )
    })

    it('marks dose as skipped', async () => {
      const skippedDose = {
        ...mockDose,
        status: 'skipped',
        notes: 'Patient feeling unwell'
      }
      
      mockSupabaseChain.update.mockResolvedValue({
        data: [skippedDose],
        error: null
      })

      const result = await doseService.markDose('dose-123', 'skipped', {
        notes: 'Patient feeling unwell'
      })

      expect(result.success).toBe(true)
      expect(result.data.status).toBe('skipped')
    })

    it('marks dose as missed', async () => {
      const missedDose = {
        ...mockDose,
        status: 'missed'
      }
      
      mockSupabaseChain.update.mockResolvedValue({
        data: [missedDose],
        error: null
      })

      const result = await doseService.markDose('dose-123', 'missed')

      expect(result.success).toBe(true)
      expect(result.data.status).toBe('missed')
    })

    it('validates dose ID', async () => {
      const result = await doseService.markDose('', 'taken')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Dose ID is required')
    })

    it('validates status', async () => {
      const result = await doseService.markDose('dose-123', 'invalid-status')

      expect(result.success).toBe(false)
      expect(result.error).toContain('valid status')
    })

    it('requires actual time for taken status', async () => {
      const result = await doseService.markDose('dose-123', 'taken', {})

      expect(result.success).toBe(false)
      expect(result.error).toContain('actual time')
    })

    it('handles marking errors', async () => {
      const error = { message: 'Failed to mark dose' }
      mockSupabaseChain.update.mockResolvedValue({
        data: null,
        error
      })

      const result = await doseService.markDose('dose-123', 'taken', {
        actualTime: new Date().toISOString()
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to mark dose')
    })
  })

  describe('deleteDose', () => {
    it('deletes dose successfully', async () => {
      mockSupabaseChain.delete.mockResolvedValue({
        error: null
      })

      const result = await doseService.deleteDose('dose-123')

      expect(result.success).toBe(true)
      expect(supabase.from).toHaveBeenCalledWith('doses')
      expect(mockSupabaseChain.eq).toHaveBeenCalledWith('id', 'dose-123')
    })

    it('validates dose ID', async () => {
      const result = await doseService.deleteDose('')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Dose ID is required')
    })

    it('handles deletion errors', async () => {
      const error = { message: 'Deletion failed' }
      mockSupabaseChain.delete.mockResolvedValue({ error })

      const result = await doseService.deleteDose('dose-123')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Deletion failed')
    })

    it('prevents deletion of taken doses', async () => {
      // First check if dose is taken
      mockSupabaseChain.single.mockResolvedValue({
        data: { ...mockDose, status: 'taken' },
        error: null
      })

      const result = await doseService.deleteDose('dose-123')

      expect(result.success).toBe(false)
      expect(result.error).toContain('cannot delete taken doses')
    })
  })

  describe('getDoseStatistics', () => {
    it('calculates dose statistics successfully', async () => {
      const mockStats = [
        { status: 'taken', count: 15 },
        { status: 'missed', count: 2 },
        { status: 'skipped', count: 1 }
      ]
      
      mockSupabaseChain.select.mockResolvedValue({
        data: mockStats,
        error: null
      })

      const result = await doseService.getDoseStatistics('patient-123', {
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      })

      expect(result.success).toBe(true)
      expect(result.data).toEqual({
        taken: 15,
        missed: 2,
        skipped: 1,
        total: 18,
        adherenceRate: expect.closeTo(83.33, 2)
      })
    })

    it('handles empty statistics', async () => {
      mockSupabaseChain.select.mockResolvedValue({
        data: [],
        error: null
      })

      const result = await doseService.getDoseStatistics('patient-123')

      expect(result.success).toBe(true)
      expect(result.data).toEqual({
        taken: 0,
        missed: 0,
        skipped: 0,
        total: 0,
        adherenceRate: 0
      })
    })

    it('validates date range', async () => {
      const result = await doseService.getDoseStatistics('patient-123', {
        startDate: '2024-01-31',
        endDate: '2024-01-01'
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('start date must be before end date')
    })
  })

  describe('getUpcomingDoses', () => {
    it('gets upcoming doses successfully', async () => {
      const upcomingDoses = [mockDose]
      mockSupabaseChain.select.mockResolvedValue({
        data: upcomingDoses,
        error: null
      })

      const result = await doseService.getUpcomingDoses('patient-123', 24)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(upcomingDoses)
      
      // Should filter for future dates and pending status
      expect(mockSupabaseChain.gte).toHaveBeenCalledWith('scheduled_time', expect.any(String))
      expect(mockSupabaseChain.eq).toHaveBeenCalledWith('status', 'pending')
    })

    it('limits results by hours parameter', async () => {
      const upcomingDoses = [mockDose]
      mockSupabaseChain.select.mockResolvedValue({
        data: upcomingDoses,
        error: null
      })

      await doseService.getUpcomingDoses('patient-123', 12)

      // Should limit to next 12 hours
      const maxTime = new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString()
      expect(mockSupabaseChain.lte).toHaveBeenCalledWith('scheduled_time', maxTime)
    })

    it('orders by scheduled time', async () => {
      const upcomingDoses = [mockDose]
      mockSupabaseChain.select.mockResolvedValue({
        data: upcomingDoses,
        error: null
      })

      await doseService.getUpcomingDoses('patient-123')

      expect(mockSupabaseChain.order).toHaveBeenCalledWith('scheduled_time', { ascending: true })
    })
  })

  describe('getOverdueDoses', () => {
    it('gets overdue doses successfully', async () => {
      const overdueDoses = [{ ...mockDose, scheduled_time: '2024-01-01T08:00:00.000Z' }]
      mockSupabaseChain.select.mockResolvedValue({
        data: overdueDoses,
        error: null
      })

      const result = await doseService.getOverdueDoses('patient-123')

      expect(result.success).toBe(true)
      expect(result.data).toEqual(overdueDoses)
      
      // Should filter for past dates and pending status
      expect(mockSupabaseChain.lte).toHaveBeenCalledWith('scheduled_time', expect.any(String))
      expect(mockSupabaseChain.eq).toHaveBeenCalledWith('status', 'pending')
    })

    it('orders by scheduled time descending', async () => {
      const overdueDoses = [mockDose]
      mockSupabaseChain.select.mockResolvedValue({
        data: overdueDoses,
        error: null
      })

      await doseService.getOverdueDoses('patient-123')

      expect(mockSupabaseChain.order).toHaveBeenCalledWith('scheduled_time', { ascending: false })
    })
  })

  describe('createRecurringDoses', () => {
    const recurringData = {
      patient_id: 'patient-123',
      medication_id: 'med-123',
      start_date: '2024-01-01',
      end_date: '2024-01-07',
      times: ['09:00', '21:00'],
      dosage: '1 tablet'
    }

    it('creates recurring doses successfully', async () => {
      const createdDoses = [
        { ...mockDose, scheduled_time: '2024-01-01T09:00:00.000Z' },
        { ...mockDose, scheduled_time: '2024-01-01T21:00:00.000Z' },
        { ...mockDose, scheduled_time: '2024-01-02T09:00:00.000Z' },
        { ...mockDose, scheduled_time: '2024-01-02T21:00:00.000Z' }
      ]
      
      mockSupabaseChain.insert.mockResolvedValue({
        data: createdDoses,
        error: null
      })

      const result = await doseService.createRecurringDoses(recurringData)

      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(14) // 7 days * 2 times per day
      expect(mockSupabaseChain.insert).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            patient_id: 'patient-123',
            medication_id: 'med-123',
            dosage: '1 tablet',
            status: 'pending'
          })
        ])
      )
    })

    it('validates recurring dose data', async () => {
      const result = await doseService.createRecurringDoses({
        ...recurringData,
        times: []
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('at least one time')
    })

    it('validates date range for recurring doses', async () => {
      const result = await doseService.createRecurringDoses({
        ...recurringData,
        start_date: '2024-01-07',
        end_date: '2024-01-01'
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('start date must be before end date')
    })

    it('validates time format', async () => {
      const result = await doseService.createRecurringDoses({
        ...recurringData,
        times: ['invalid-time']
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('valid time format')
    })
  })
}) 