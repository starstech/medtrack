// Patient service
import apiClient from './api'

export const patientService = {
  // Get all patients for the current user
  async getPatients(filters = {}) {
    try {
      const { patients } = await apiClient.get('/patients', filters)
      return { data: patients, error: null }
    } catch (error) {
      return { data: null, error: error.message }
    }
  },

  // Get a specific patient by ID
  async getPatient(patientId) {
    try {
      const { patient } = await apiClient.get(`/patients/${patientId}`)
      return { data: patient, error: null }
    } catch (error) {
      return { data: null, error: error.message }
    }
  },

  // Create a new patient
  async createPatient(patientData) {
    try {
      const { patient } = await apiClient.post('/patients', patientData)
      return { data: patient, error: null }
    } catch (error) {
      return { data: null, error: error.message }
    }
  },

  // Update a patient
  async updatePatient(patientId, patientData) {
    try {
      const { patient } = await apiClient.put(`/patients/${patientId}`, patientData)
      return { data: patient, error: null }
    } catch (error) {
      return { data: null, error: error.message }
    }
  },

  // Delete a patient
  async deletePatient(patientId) {
    try {
      await apiClient.delete(`/patients/${patientId}`)
      return { data: true, error: null }
    } catch (error) {
      return { data: null, error: error.message }
    }
  },

  // Search patients
  async searchPatients(query, filters = {}) {
    try {
      const data = await apiClient.get('/patients/search', { query, ...filters })
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error.message }
    }
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
    try {
      const data = await apiClient.put(`/patients/${patientId}/caregivers/${caregiverId}`, caregiverData)
      return { data, error: null }
    } catch (error) {
      console.error('Error updating caregiver:', error)
      return { data: null, error: error.message }
    }
  },

  // Remove caregiver from patient
  async removeCaregiver(patientId, caregiverId) {
    return apiClient.delete(`/patients/${patientId}/caregivers/${caregiverId}`)
  },

  // Get patient statistics
  async getPatientStats(patientId) {
    try {
      const { stats } = await apiClient.get(`/patients/${patientId}/stats`)
      return { data: stats, error: null }
    } catch (error) {
      console.error('Error fetching patient stats:', error)
      return { data: null, error: error.message }
    }
  },

  // Get patient activity timeline
  async getPatientActivity(patientId, limit = 10) {
    try {
      const { activity } = await apiClient.get(`/patients/${patientId}/activity`, { limit })
      return { data: activity, error: null }
    } catch (error) {
      console.error('Error fetching patient activity:', error)
      return { data: null, error: error.message }
    }
  },

  // Upload patient profile image
  async uploadProfileImage(patientId, file) {
    console.warn('uploadProfileImage: use fileService.upload')
    return { data: null, error: 'Not implemented' }
  }
}

export default patientService 