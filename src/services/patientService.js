// Patient service
import apiClient from './api'

export const patientService = {
  // Get all patients for current user
  async getPatients() {
    return apiClient.get('/patients')
  },

  // Get patient by ID
  async getPatient(patientId) {
    return apiClient.get(`/patients/${patientId}`)
  },

  // Create new patient
  async createPatient(patientData) {
    return apiClient.post('/patients', patientData)
  },

  // Update patient
  async updatePatient(patientId, patientData) {
    return apiClient.put(`/patients/${patientId}`, patientData)
  },

  // Delete patient
  async deletePatient(patientId) {
    return apiClient.delete(`/patients/${patientId}`)
  },

  // Search patients
  async searchPatients(query, filters = {}) {
    const params = {
      query,
      ...filters
    }
    return apiClient.get('/patients/search', params)
  },

  // Get patient caregivers
  async getPatientCaregivers(patientId) {
    return apiClient.get(`/patients/${patientId}/caregivers`)
  },

  // Add caregiver to patient
  async addCaregiver(patientId, caregiverData) {
    return apiClient.post(`/patients/${patientId}/caregivers`, caregiverData)
  },

  // Update caregiver role/permissions
  async updateCaregiver(patientId, caregiverId, caregiverData) {
    return apiClient.put(`/patients/${patientId}/caregivers/${caregiverId}`, caregiverData)
  },

  // Remove caregiver from patient
  async removeCaregiver(patientId, caregiverId) {
    return apiClient.delete(`/patients/${patientId}/caregivers/${caregiverId}`)
  },

  // Get patient statistics
  async getPatientStats(patientId) {
    return apiClient.get(`/patients/${patientId}/stats`)
  },

  // Get patient activity timeline
  async getPatientActivity(patientId, limit = 10) {
    return apiClient.get(`/patients/${patientId}/activity`, { limit })
  },

  // Upload patient profile image
  async uploadProfileImage(patientId, file) {
    return apiClient.uploadFile(`/patients/${patientId}/profile-image`, file)
  }
}

export default patientService 