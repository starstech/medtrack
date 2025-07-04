// Daily log service for observations, incidents, and activities
import apiClient from './api'

export const dailyLogService = {
  // Get daily logs for a patient
  async getPatientLogs(patientId, filters = {}) {
    try {
      const data = await apiClient.get(`/patients/${patientId}/logs`, filters)
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error.message }
    }
  },

  // Get single log entry
  async getLog(logId) {
    try {
      const { log } = await apiClient.get(`/logs/${logId}`)
      return { data: log, error: null }
    } catch (error) {
      return { data: null, error: error.message }
    }
  },

  // Create new log entry
  async createLog(patientId, logData) {
    try {
      const { log } = await apiClient.post(`/patients/${patientId}/logs`, logData)
      return { data: log, error: null }
    } catch (error) {
      return { data: null, error: error.message }
    }
  },

  // Update log entry
  async updateLog(logId, logData) {
    try {
      const { log } = await apiClient.put(`/logs/${logId}`, logData)
      return { data: log, error: null }
    } catch (error) {
      return { data: null, error: error.message }
    }
  },

  // Delete log entry
  async deleteLog(logId) {
    try {
      await apiClient.delete(`/logs/${logId}`)
      return { data: true, error: null }
    } catch (error) {
      return { data: null, error: error.message }
    }
  },

  // Get logs by type
  async getLogsByType(patientId, type, filters = {}) {
    return this.getPatientLogs(patientId, { type, ...filters })
  },

  // Get logs by date range
  async getLogsByDateRange(patientId, startDate, endDate, filters = {}) {
    return this.getPatientLogs(patientId, { startDate, endDate, ...filters })
  },

  // Search logs
  async searchLogs(patientId, query, filters = {}) {
    return this.getPatientLogs(patientId, { ...filters, search: query })
  },

  // Get recent logs
  async getRecentLogs(patientId, limit = 10) {
    return this.getPatientLogs(patientId, { limit })
  },

  // Get logs by severity
  async getLogsBySeverity(patientId, severity, filters = {}) {
    return this.getPatientLogs(patientId, { severity, ...filters })
  },

  // Bulk create logs
  async bulkCreateLogs(patientId, logs) {
    return Promise.all(logs.map(l => this.createLog(patientId, l)))
  },

  // Add attachment to log (using Supabase Storage)
  async addLogAttachment(logId, file, description = '') {
    try {
      const formData = { type: 'log', logId, description }
      const data = await apiClient.uploadFile(`/logs/${logId}/attachments`, file, formData)
      return { data, error: null }
    } catch (error) {
      console.error('Error adding log attachment:', error)
      return { data: null, error: error.message }
    }
  },

  // Delete log attachment
  async deleteLogAttachment(logId, attachmentId) {
    try {
      await apiClient.delete(`/logs/attachments/${attachmentId}`)
      return { data: true, error: null }
    } catch (error) {
      console.error('Error deleting log attachment:', error)
      return { data: null, error: error.message }
    }
  },

  // Get log attachments
  async getLogAttachments(logId) {
    try {
      const data = await apiClient.get(`/logs/${logId}/attachments`)
      return { data, error: null }
    } catch (error) {
      console.error('Error getting log attachments:', error)
      return { data: null, error: error.message }
    }
  },

  // Get log statistics
  async getLogStats(patientId, period = '30') {
    try {
      const { stats } = await apiClient.get(`/patients/${patientId}/logs/stats`, { period })
      return { data: stats, error: null }
    } catch (error) {
      console.error('Error fetching log stats:', error)
      return { data: null, error: error.message }
    }
  },

  // Get log trends
  async getLogTrends(patientId, type, period = '30') {
    try {
      const { trends } = await apiClient.get(`/patients/${patientId}/logs/trends`, { type, period })
      return { data: trends, error: null }
    } catch (error) {
      console.error('Error fetching log trends:', error)
      return { data: null, error: error.message }
    }
  },

  // Export logs
  async exportLogs(patientId, format = 'pdf', filters = {}) {
    try {
      const params = { patientId, format, ...filters }
      const data = await apiClient.get('/export/logs', params)
      return { data, error: null }
    } catch (error) {
      console.error('Error exporting logs:', error)
      return { data: null, error: error.message }
    }
  },

  // Get log templates
  async getLogTemplates(type = null) {
    try {
      const params = type ? { type } : {}
      const data = await apiClient.get('/logs/templates', params)
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching log templates:', error)
      return { data: null, error: error.message }
    }
  },

  // Create log from template
  async createLogFromTemplate(patientId, templateId, data = {}) {
    try {
      const { log } = await apiClient.post('/logs/from-template', { patientId, templateId, data })
      return { data: log, error: null }
    } catch (error) {
      console.error('Error creating log from template:', error)
      return { data: null, error: error.message }
    }
  }
}

export default dailyLogService 