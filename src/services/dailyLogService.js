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
    console.warn('addLogAttachment: implement via /api/files/upload')
    return { data: null, error: 'Not implemented' }
  },

  // Delete log attachment
  async deleteLogAttachment(logId, attachmentId) {
    console.warn('deleteLogAttachment: not implemented')
    return { data: null, error: 'Not implemented' }
  },

  // Get log attachments
  async getLogAttachments(logId) {
    console.warn('getLogAttachments: not implemented')
    return { data: [], error: 'Not implemented' }
  },

  // Get log statistics
  async getLogStats(patientId, period = '30') {
    console.warn('getLogStats: backend endpoint pending')
    return { data: null, error: 'Not implemented' }
  },

  // Get log trends
  async getLogTrends(patientId, type, period = '30') {
    console.warn('getLogTrends: backend endpoint pending')
    return { data: null, error: 'Not implemented' }
  },

  // Export logs
  async exportLogs(patientId, format = 'pdf', filters = {}) {
    console.warn('exportLogs: not implemented')
    return { data: null, error: 'Not implemented' }
  },

  // Get log templates
  async getLogTemplates(type = null) {
    console.warn('getLogTemplates: not implemented')
    return { data: [], error: 'Not implemented' }
  },

  // Create log from template
  async createLogFromTemplate(patientId, templateId, data = {}) {
    console.warn('createLogFromTemplate: not implemented')
    return { data: null, error: 'Not implemented' }
  }
}

export default dailyLogService 