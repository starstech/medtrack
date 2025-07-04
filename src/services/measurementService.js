// Measurement service for health vitals and measurements
import apiClient from './api'

export const measurementService = {
  // Get measurements for a patient
  async getMeasurements(patientId, options = {}) {
    try {
      const data = await apiClient.get(`/patients/${patientId}/measurements`, options)
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error.message }
    }
  },

  // Get single measurement
  async getMeasurement(measurementId) {
    try {
      const { measurement } = await apiClient.get(`/measurements/${measurementId}`)
      return { data: measurement, error: null }
    } catch (error) {
      return { data: null, error: error.message }
    }
  },

  // Create a new measurement
  async createMeasurement(patientId, measurementData) {
    try {
      const { measurement } = await apiClient.post(`/patients/${patientId}/measurements`, measurementData)
      return { data: measurement, error: null }
    } catch (error) {
      return { data: null, error: error.message }
    }
  },

  // Update a measurement
  async updateMeasurement(measurementId, measurementData) {
    try {
      const { measurement } = await apiClient.put(`/measurements/${measurementId}`, measurementData)
      return { data: measurement, error: null }
    } catch (error) {
      return { data: null, error: error.message }
    }
  },

  // Delete a measurement
  async deleteMeasurement(measurementId) {
    try {
      await apiClient.delete(`/measurements/${measurementId}`)
      return { data: true, error: null }
    } catch (error) {
      return { data: null, error: error.message }
    }
  },

  // Get measurement trends
  async getMeasurementTrends(patientId, type, period = '30') {
    return this.getMeasurements(patientId, { type, period })
  },

  // Get measurement alerts
  async getMeasurementAlerts(patientId) {
    try {
      const data = await apiClient.get('/measurements/alerts', { patientId })
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching measurement alerts:', error)
      return { data: null, error: error.message }
    }
  },

  // Get measurements by type
  async getMeasurementsByType(patientId, type, limit = 50) {
    return this.getMeasurements(patientId, { type, limit })
  },

  // Get latest measurements
  async getLatestMeasurements(patientId) {
    return this.getMeasurements(patientId, { limit: 1 })
  },

  // Get measurement statistics
  async getMeasurementStats(patientId, type, period = '30') {
    try {
      const params = { patientId, type, period }
      const { stats } = await apiClient.get('/measurements/stats', params)
      return { data: stats, error: null }
    } catch (error) {
      console.error('Error fetching measurement stats:', error)
      return { data: null, error: error.message }
    }
  },

  // Bulk create measurements
  async bulkCreateMeasurements(patientId, measurements) {
    // Client-side batch: POST each; could use backend bulk endpoint when available
    return Promise.all(measurements.map(m => this.createMeasurement(patientId, m)))
  },

  // Get measurement ranges for a patient
  async getMeasurementRanges(patientId, type) {
    try {
      const data = await apiClient.get('/measurements/ranges', { patientId, type })
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching measurement ranges:', error)
      return { data: null, error: error.message }
    }
  },

  // Update measurement ranges
  async updateMeasurementRanges(patientId, type, ranges) {
    try {
      const data = await apiClient.put('/measurements/ranges', { patientId, type, ranges })
      return { data, error: null }
    } catch (error) {
      console.error('Error updating measurement ranges:', error)
      return { data: null, error: error.message }
    }
  },

  // Get measurement types for a patient
  async getMeasurementTypes(patientId) {
    try {
      const data = await apiClient.get(`/patients/${patientId}/measurements`, { limit: 1000 })
      const uniqueTypes = [...new Set(data.map(m => m.type))]
      return { data: uniqueTypes, error: null }
    } catch (error) {
      return { data: null, error: error.message }
    }
  }
}

export default measurementService 