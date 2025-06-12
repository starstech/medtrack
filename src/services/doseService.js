// Dose service
import { supabase } from '../lib/supabase'

export const doseService = {
  // Get today's doses for a patient
  async getTodaysDoses(patientId = null) {
    const params = patientId ? { patientId } : {}
    return supabase.from('doses').select('*').eq('status', 'pending').eq('scheduled_time', new Date().toISOString()).order('scheduled_time', { ascending: true })
  },

  // Get doses for a patient with filters
  async getPatientDoses(patientId, filters = {}) {
    return supabase.from('doses').select('*').eq('patient_id', patientId).order('scheduled_time', { ascending: false })
  },

  // Get dose by ID
  async getDose(doseId) {
    return supabase.from('doses').select('*').eq('id', doseId).single()
  },

  // Mark dose as taken/missed/skipped
  async markDose(doseId, status, notes = '', takenAt = null) {
    const data = {
      status,
      notes,
      takenAt: takenAt || new Date().toISOString()
    }
    return supabase.from('doses').update(data).eq('id', doseId).select().single()
  },

  // Update dose status
  async updateDoseStatus(doseId, status, notes = '') {
    const data = { status, notes }
    return supabase.from('doses').update(data).eq('id', doseId).select().single()
  },

  // Get dose history
  async getDoseHistory(doseId) {
    return supabase.from('doses').select('*').eq('id', doseId).single()
  },

  // Get adherence data for a patient
  async getPatientAdherence(patientId, period = '30') {
    return supabase.from('doses').select('*').eq('patient_id', patientId).gte('scheduled_time', new Date(new Date().getTime() - period * 24 * 60 * 60 * 1000).toISOString()).order('scheduled_time', { ascending: true })
  },

  // Get dose patterns for a patient
  async getDosePatterns(patientId, period = '30') {
    return supabase.from('doses').select('*').eq('patient_id', patientId).gte('scheduled_time', new Date(new Date().getTime() - period * 24 * 60 * 60 * 1000).toISOString()).order('scheduled_time', { ascending: true })
  },

  // Get overdue doses
  async getOverdueDoses(patientId = null) {
    const params = patientId ? { patientId } : {}
    return supabase.from('doses').select('*').eq('status', 'pending').gte('scheduled_time', new Date().toISOString()).order('scheduled_time', { ascending: true })
  },

  // Get upcoming doses
  async getUpcomingDoses(patientId, limit = 10) {
    return supabase.from('doses').select('*').eq('patient_id', patientId).eq('status', 'pending').gte('scheduled_time', new Date().toISOString()).order('scheduled_time', { ascending: true }).limit(limit)
  },

  // Snooze dose reminder
  async snoozeDose(doseId, minutes = 15) {
    return supabase.from('doses').update({
      status: 'pending',
      scheduled_time: new Date(new Date().getTime() + minutes * 60 * 1000).toISOString()
    }).eq('id', doseId).select().single()
  },

  // Bulk mark doses
  async bulkMarkDoses(doseIds, status, notes = '') {
    const data = {
      status,
      notes,
      takenAt: new Date().toISOString()
    }
    return supabase.from('doses').update(data).in('id', doseIds).select()
  },

  // Get doses for a medication
  async getDoses(medicationId, options = {}) {
    try {
      let query = supabase
        .from('doses')
        .select(`
          *,
          medication:medications(name, dosage)
        `)
        .eq('medication_id', medicationId)
        .order('scheduled_time', { ascending: false })

      if (options.status) {
        query = query.eq('status', options.status)
      }

      if (options.limit) {
        query = query.limit(options.limit)
      }

      const { data, error } = await query

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching doses:', error)
      return { data: null, error: error.message }
    }
  },

  // Mark dose as taken
  async markDoseTaken(doseId, notes = '') {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('doses')
        .update({
          status: 'taken',
          taken_at: new Date().toISOString(),
          notes: notes,
          marked_by: user.id
        })
        .eq('id', doseId)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error marking dose as taken:', error)
      return { data: null, error: error.message }
    }
  },

  // Mark dose as missed
  async markDoseMissed(doseId, notes = '') {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('doses')
        .update({
          status: 'missed',
          notes: notes,
          marked_by: user.id
        })
        .eq('id', doseId)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error marking dose as missed:', error)
      return { data: null, error: error.message }
    }
  },

  // Mark dose as skipped
  async markDoseSkipped(doseId, notes = '') {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('doses')
        .update({
          status: 'skipped',
          notes: notes,
          marked_by: user.id
        })
        .eq('id', doseId)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error marking dose as skipped:', error)
      return { data: null, error: error.message }
    }
  },

  // Get dose history for a patient
  async getDoseHistory(patientId, options = {}) {
    try {
      let query = supabase
        .from('doses')
        .select(`
          *,
          medication:medications!inner(
            name,
            dosage,
            patient_id
          )
        `)
        .eq('medication.patient_id', patientId)
        .order('scheduled_time', { ascending: false })

      if (options.startDate) {
        query = query.gte('scheduled_time', options.startDate)
      }

      if (options.endDate) {
        query = query.lte('scheduled_time', options.endDate)
      }

      if (options.limit) {
        query = query.limit(options.limit)
      }

      const { data, error } = await query

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching dose history:', error)
      return { data: null, error: error.message }
    }
  }
}

export default doseService 