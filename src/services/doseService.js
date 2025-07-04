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
    const body = { status, notes, takenAt: takenAt || new Date().toISOString() }
    return apiClient.post(`/doses/${doseId}/mark`, body)
  },

  // Update dose status
  async updateDoseStatus(doseId, status, notes = '') {
    return this.markDose(doseId, status, notes)
  },

  // Get dose history
  async getDoseHistory(doseId) {
    return apiClient.get(`/doses/${doseId}/history`)
  },

  // Get adherence data for a patient
  async getPatientAdherence(patientId, period = '30') {
    return apiClient.get(`/medications/${patientId}/adherence`, { period })
  },

  // Get dose patterns for a patient
  async getDosePatterns(patientId, period = '30') {
    // Not available in backend yet – fetch doses over period
    return this.getPatientDoses(patientId, { period })
  },

  // Get overdue doses
  async getOverdueDoses(patientId = null) {
    const params = patientId ? { patientId } : {}
    params.status = 'overdue'
    return apiClient.get('/patients/doses', params)
  },

  // Get upcoming doses
  async getUpcomingDoses(patientId, limit = 10) {
    return apiClient.get(`/patients/${patientId}/doses`, { status: 'pending', limit })
  },

  // Snooze dose reminder
  async snoozeDose(doseId, minutes = 15) {
    const newTime = new Date(Date.now() + minutes * 60 * 1000).toISOString()
    return this.updateDoseStatus(doseId, 'pending', `Snoozed until ${newTime}`)
  },

  // Bulk mark doses
  async bulkMarkDoses(doseIds, status, notes = '') {
    return Promise.all(doseIds.map(id => this.markDose(id, status, notes)))
  },

  // Get doses for a medication
  async getDoses(medicationId, options = {}) {
    try {
      const params = { ...options }
      const data = await apiClient.get(`/medications/${medicationId}/doses`, params)
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error.message }
    }
  },

  // Mark dose as taken
  async markDoseTaken(doseId, notes = '') {
    return this.markDose(doseId, 'taken', notes)
  },

  // Mark dose as missed
  async markDoseMissed(doseId, notes = '') {
    return this.markDose(doseId, 'missed', notes)
  },

  // Mark dose as skipped
  async markDoseSkipped(doseId, notes = '') {
    return this.markDose(doseId, 'skipped', notes)
  },

  // Get dose history for a patient
  async getDoseHistory(patientId, options = {}) {
    try {
      const params = { ...options }
      const data = await apiClient.get(`/patients/${patientId}/doses`, params)
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching dose history:', error)
      return { data: null, error: error.message }
    }
  }
}

export default doseService 