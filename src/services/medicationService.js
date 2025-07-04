// Medication service
import apiClient from './api'

export const medicationService = {
  // Get all medications for a patient
  async getMedications(patientId, filters = {}) {
    try {
      const data = await apiClient.get(`/patients/${patientId}/medications`, filters)
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error.message }
    }
  },

  // Get a specific medication by ID
  async getMedication(medicationId) {
    try {
      const { medication } = await apiClient.get(`/medications/${medicationId}`)
      return { data: medication, error: null }
    } catch (error) {
      return { data: null, error: error.message }
    }
  },

  // Create a new medication
  async createMedication(patientId, medicationData) {
    try {
      const { medication } = await apiClient.post(`/patients/${patientId}/medications`, medicationData)
      return { data: medication, error: null }
    } catch (error) {
      return { data: null, error: error.message }
    }
  },

  // Update a medication
  async updateMedication(medicationId, medicationData) {
    try {
      const { medication } = await apiClient.put(`/medications/${medicationId}`, medicationData)
      return { data: medication, error: null }
    } catch (error) {
      return { data: null, error: error.message }
    }
  },

  // Delete a medication (soft delete)
  async deleteMedication(medicationId) {
    try {
      await apiClient.delete(`/medications/${medicationId}`)
      return { data: true, error: null }
    } catch (error) {
      return { data: null, error: error.message }
    }
  },

  // Get medication schedule
  async getMedicationSchedule(medicationId) {
    try {
      const { schedule } = await apiClient.get(`/medications/${medicationId}/schedule`)
      return { data: schedule, error: null }
    } catch (error) {
      return { data: null, error: error.message }
    }
  },

  // Update medication schedule
  async updateMedicationSchedule(medicationId, scheduleData) {
    try {
      const { medication } = await apiClient.put(`/medications/${medicationId}/schedule`, { schedule: scheduleData })
      return { data: medication, error: null }
    } catch (error) {
      return { data: null, error: error.message }
    }
  },

  // Search medications
  async searchMedications(query, filters = {}) {
    return apiClient.get('/patients/medications/search', { query, ...filters })
  },

  // Get medication history
  async getMedicationHistory(medicationId) {
    console.warn('getMedicationHistory: backend endpoint pending')
    return { data: null, error: 'Not implemented' }
  },

  // Get adherence data
  async getMedicationAdherence(medicationId, period = '30') {
    try {
      const { adherence } = await apiClient.get(`/medications/${medicationId}/adherence`, { period })
      return { data: adherence, error: null }
    } catch (error) {
      return { data: null, error: error.message }
    }
  }
}

export default medicationService 