// Measurement service for health vitals and measurements
import apiClient from './api'

export const measurementService = {
  // Get measurements for a patient
  async getPatientMeasurements(patientId, filters = {}) {
    return apiClient.get(`/patients/${patientId}/measurements`, filters)
  },

  // Get single measurement
  async getMeasurement(measurementId) {
    return apiClient.get(`/measurements/${measurementId}`)
  },

  // Create new measurement
  async createMeasurement(patientId, measurementData) {
    return apiClient.post(`/patients/${patientId}/measurements`, measurementData)
  },

  // Update measurement
  async updateMeasurement(measurementId, measurementData) {
    return apiClient.put(`/measurements/${measurementId}`, measurementData)
  },

  // Delete measurement
  async deleteMeasurement(measurementId) {
    return apiClient.delete(`/measurements/${measurementId}`)
  },

  // Get measurement trends
  async getMeasurementTrends(patientId, type, period = '30') {
    return apiClient.get(`/patients/${patientId}/measurements/trends`, { type, period })
  },

  // Get measurement alerts
  async getMeasurementAlerts(patientId) {
    return apiClient.get(`/patients/${patientId}/measurements/alerts`)
  },

  // Get measurements by type
  async getMeasurementsByType(patientId, type, limit = 50) {
    return apiClient.get(`/patients/${patientId}/measurements`, { type, limit })
  },

  // Get latest measurements
  async getLatestMeasurements(patientId) {
    return apiClient.get(`/patients/${patientId}/measurements/latest`)
  },

  // Get measurement statistics
  async getMeasurementStats(patientId, type, period = '30') {
    return apiClient.get(`/patients/${patientId}/measurements/stats`, { type, period })
  },

  // Bulk create measurements
  async bulkCreateMeasurements(patientId, measurements) {
    return apiClient.post(`/patients/${patientId}/measurements/bulk`, { measurements })
  },

  // Get measurement ranges for a patient
  async getMeasurementRanges(patientId, type) {
    return apiClient.get(`/patients/${patientId}/measurements/ranges`, { type })
  },

  // Update measurement ranges
  async updateMeasurementRanges(patientId, type, ranges) {
    return apiClient.put(`/patients/${patientId}/measurements/ranges`, { type, ranges })
  }
}

export default measurementService 