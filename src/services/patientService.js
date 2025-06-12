// Patient service
import { supabase } from '../lib/supabase'

export const patientService = {
  // Get all patients for the current user
  async getPatients() {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select(`
          *,
          patient_caregivers!inner(
            role,
            is_active
          )
        `)
        .eq('patient_caregivers.is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching patients:', error)
      return { data: null, error: error.message }
    }
  },

  // Get a specific patient by ID
  async getPatient(patientId) {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select(`
          *,
          patient_caregivers!inner(
            role,
            is_active,
            caregiver:profiles(name, email)
          )
        `)
        .eq('id', patientId)
        .eq('patient_caregivers.is_active', true)
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching patient:', error)
      return { data: null, error: error.message }
    }
  },

  // Create a new patient
  async createPatient(patientData) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Create patient
      const { data: patient, error: patientError } = await supabase
        .from('patients')
        .insert({
          ...patientData,
          created_by: user.id
        })
        .select()
        .single()

      if (patientError) throw patientError

      // Create caregiver relationship
      const { error: caregiverError } = await supabase
        .from('patient_caregivers')
        .insert({
          patient_id: patient.id,
          caregiver_id: user.id,
          role: 'primary',
          accepted_at: new Date().toISOString(),
          is_active: true
        })

      if (caregiverError) throw caregiverError

      return { data: patient, error: null }
    } catch (error) {
      console.error('Error creating patient:', error)
      return { data: null, error: error.message }
    }
  },

  // Update a patient
  async updatePatient(patientId, patientData) {
    try {
      const { data, error } = await supabase
        .from('patients')
        .update(patientData)
        .eq('id', patientId)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error updating patient:', error)
      return { data: null, error: error.message }
    }
  },

  // Delete a patient
  async deletePatient(patientId) {
    try {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', patientId)

      if (error) throw error
      return { data: true, error: null }
    } catch (error) {
      console.error('Error deleting patient:', error)
      return { data: null, error: error.message }
    }
  },

  // Search patients
  async searchPatients(query, filters = {}) {
    const params = {
      query,
      ...filters
    }
    return supabase.from('patients').select('*').ilike('name', `%${query}%`)
  },

  // Get patient caregivers
  async getPatientCaregivers(patientId) {
    return supabase.from('patient_caregivers').select('*').eq('patient_id', patientId)
  },

  // Add caregiver to patient
  async addCaregiver(patientId, caregiverData) {
    return supabase.from('patient_caregivers').insert(caregiverData).eq('patient_id', patientId)
  },

  // Update caregiver role/permissions
  async updateCaregiver(patientId, caregiverId, caregiverData) {
    return supabase.from('patient_caregivers').update(caregiverData).eq('patient_id', patientId).eq('id', caregiverId)
  },

  // Remove caregiver from patient
  async removeCaregiver(patientId, caregiverId) {
    return supabase.from('patient_caregivers').delete().eq('patient_id', patientId).eq('id', caregiverId)
  },

  // Get patient statistics
  async getPatientStats(patientId) {
    return supabase.from('patients').select('*').eq('id', patientId).single()
  },

  // Get patient activity timeline
  async getPatientActivity(patientId, limit = 10) {
    return supabase.from('patient_activities').select('*').eq('patient_id', patientId).order('created_at', { ascending: false }).limit(limit)
  },

  // Upload patient profile image
  async uploadProfileImage(patientId, file) {
    return supabase.storage.from('patient_images').upload(`${patientId}/profile-image`, file)
  }
}

export default patientService 