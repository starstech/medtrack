// Medication service
import { supabase } from '../lib/supabase'

export const medicationService = {
  // Get all medications for a patient
  async getMedications(patientId) {
    try {
      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .eq('patient_id', patientId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching medications:', error)
      return { data: null, error: error.message }
    }
  },

  // Get a specific medication by ID
  async getMedication(medicationId) {
    try {
      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .eq('id', medicationId)
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching medication:', error)
      return { data: null, error: error.message }
    }
  },

  // Create a new medication
  async createMedication(medicationData) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('medications')
        .insert({
          ...medicationData,
          created_by: user.id
        })
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error creating medication:', error)
      return { data: null, error: error.message }
    }
  },

  // Update a medication
  async updateMedication(medicationId, medicationData) {
    try {
      const { data, error } = await supabase
        .from('medications')
        .update(medicationData)
        .eq('id', medicationId)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error updating medication:', error)
      return { data: null, error: error.message }
    }
  },

  // Delete a medication (soft delete by setting is_active to false)
  async deleteMedication(medicationId) {
    try {
      const { data, error } = await supabase
        .from('medications')
        .update({ is_active: false })
        .eq('id', medicationId)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error deleting medication:', error)
      return { data: null, error: error.message }
    }
  },

  // Get medication schedule
  async getMedicationSchedule(medicationId) {
    return supabase.from('medications').select('schedule').eq('id', medicationId).single()
  },

  // Update medication schedule
  async updateMedicationSchedule(medicationId, scheduleData) {
    return supabase.from('medications').update({ schedule: scheduleData }).eq('id', medicationId).select().single()
  },

  // Search medications
  async searchMedications(query, filters = {}) {
    const params = {
      name: query,
      ...filters
    }
    return supabase.from('medications').select('*').ilike('name', `%${params.name}%`)
  },

  // Get medication history
  async getMedicationHistory(medicationId) {
    return supabase.from('medications').select('history').eq('id', medicationId).single()
  },

  // Get adherence data
  async getMedicationAdherence(medicationId, period = '30') {
    return supabase.from('medications').select('adherence').eq('id', medicationId).single()
  }
}

export default medicationService 