// Medication service
import apiClient from './api'

export const medicationService = {
  // Get medications for a patient
  async getPatientMedications(patientId) {
    return apiClient.get(`/patients/${patientId}/medications`)
  },

  // Get single medication
  async getMedication(medicationId) {
    return apiClient.get(`/medications/${medicationId}`)
  },

  // Create new medication
  async createMedication(patientId, medicationData) {
    return apiClient.post(`/patients/${patientId}/medications`, medicationData)
  },

  // Update medication
  async updateMedication(medicationId, medicationData) {
    return apiClient.put(`/medications/${medicationId}`, medicationData)
  },

  // Delete medication
  async deleteMedication(medicationId) {
    return apiClient.delete(`/medications/${medicationId}`)
  },

  // Get medication schedule
  async getMedicationSchedule(medicationId) {
    return apiClient.get(`/medications/${medicationId}/schedule`)
  },

  // Update medication schedule
  async updateMedicationSchedule(medicationId, scheduleData) {
    return apiClient.put(`/medications/${medicationId}/schedule`, scheduleData)
  },

  // Search medications
  async searchMedications(query, filters = {}) {
    const params = {
      name: query,
      ...filters
    }
    return apiClient.get('/medications/search', params)
  },

  // Get medication history
  async getMedicationHistory(medicationId) {
    return apiClient.get(`/medications/${medicationId}/history`)
  },

  // Get adherence data
  async getMedicationAdherence(medicationId, period = '30') {
    return apiClient.get(`/medications/${medicationId}/adherence`, { period })
  }
}

export default medicationService 