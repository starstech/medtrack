// Dose service
import apiClient from './api'

export const doseService = {
  // Get today's doses for a patient
  async getTodaysDoses(patientId = null) {
    const params = patientId ? { patientId } : {}
    return apiClient.get('/doses/today', params)
  },

  // Get doses for a patient with filters
  async getPatientDoses(patientId, filters = {}) {
    return apiClient.get(`/patients/${patientId}/doses`, filters)
  },

  // Get dose by ID
  async getDose(doseId) {
    return apiClient.get(`/doses/${doseId}`)
  },

  // Mark dose as taken/missed/skipped
  async markDose(doseId, status, notes = '', takenAt = null) {
    const data = {
      status,
      notes,
      takenAt: takenAt || new Date().toISOString()
    }
    return apiClient.post(`/doses/${doseId}/mark`, data)
  },

  // Update dose status
  async updateDoseStatus(doseId, status, notes = '') {
    const data = { status, notes }
    return apiClient.put(`/doses/${doseId}/status`, data)
  },

  // Get dose history
  async getDoseHistory(doseId) {
    return apiClient.get(`/doses/${doseId}/history`)
  },

  // Get adherence data for a patient
  async getPatientAdherence(patientId, period = '30') {
    return apiClient.get(`/patients/${patientId}/doses/adherence`, { period })
  },

  // Get dose patterns for a patient
  async getDosePatterns(patientId, period = '30') {
    return apiClient.get(`/patients/${patientId}/doses/patterns`, { period })
  },

  // Get overdue doses
  async getOverdueDoses(patientId = null) {
    const params = patientId ? { patientId } : {}
    return apiClient.get('/doses/overdue', params)
  },

  // Get upcoming doses
  async getUpcomingDoses(patientId = null, hours = 24) {
    const params = { hours }
    if (patientId) params.patientId = patientId
    return apiClient.get('/doses/upcoming', params)
  },

  // Snooze dose reminder
  async snoozeDose(doseId, minutes = 15) {
    return apiClient.post(`/doses/${doseId}/snooze`, { minutes })
  },

  // Bulk mark doses
  async bulkMarkDoses(doseIds, status, notes = '') {
    const data = {
      doseIds,
      status,
      notes,
      takenAt: new Date().toISOString()
    }
    return apiClient.post('/doses/bulk-mark', data)
  }
}

export default doseService 