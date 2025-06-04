// Daily log service for observations, incidents, and activities
import apiClient from './api'

export const dailyLogService = {
  // Get daily logs for a patient
  async getPatientLogs(patientId, filters = {}) {
    return apiClient.get(`/patients/${patientId}/logs`, filters)
  },

  // Get single log entry
  async getLog(logId) {
    return apiClient.get(`/logs/${logId}`)
  },

  // Create new log entry
  async createLog(patientId, logData) {
    return apiClient.post(`/patients/${patientId}/logs`, logData)
  },

  // Update log entry
  async updateLog(logId, logData) {
    return apiClient.put(`/logs/${logId}`, logData)
  },

  // Delete log entry
  async deleteLog(logId) {
    return apiClient.delete(`/logs/${logId}`)
  },

  // Get logs by type
  async getLogsByType(patientId, type, filters = {}) {
    return apiClient.get(`/patients/${patientId}/logs`, { type, ...filters })
  },

  // Get logs by date range
  async getLogsByDateRange(patientId, startDate, endDate, filters = {}) {
    return apiClient.get(`/patients/${patientId}/logs`, { 
      startDate, 
      endDate, 
      ...filters 
    })
  },

  // Search logs
  async searchLogs(patientId, query, filters = {}) {
    return apiClient.get(`/patients/${patientId}/logs/search`, { 
      query, 
      ...filters 
    })
  },

  // Add attachment to log
  async addLogAttachment(logId, file, description = '') {
    return apiClient.uploadFile(`/logs/${logId}/attachments`, file, { description })
  },

  // Delete log attachment
  async deleteLogAttachment(logId, attachmentId) {
    return apiClient.delete(`/logs/${logId}/attachments/${attachmentId}`)
  },

  // Get log attachments
  async getLogAttachments(logId) {
    return apiClient.get(`/logs/${logId}/attachments`)
  },

  // Get log statistics
  async getLogStats(patientId, period = '30') {
    return apiClient.get(`/patients/${patientId}/logs/stats`, { period })
  },

  // Get log trends
  async getLogTrends(patientId, type, period = '30') {
    return apiClient.get(`/patients/${patientId}/logs/trends`, { type, period })
  },

  // Bulk create logs
  async bulkCreateLogs(patientId, logs) {
    return apiClient.post(`/patients/${patientId}/logs/bulk`, { logs })
  },

  // Get recent logs
  async getRecentLogs(patientId, limit = 10) {
    return apiClient.get(`/patients/${patientId}/logs/recent`, { limit })
  },

  // Get logs by severity
  async getLogsBySeverity(patientId, severity, filters = {}) {
    return apiClient.get(`/patients/${patientId}/logs`, { severity, ...filters })
  },

  // Export logs
  async exportLogs(patientId, format = 'pdf', filters = {}) {
    return apiClient.get(`/patients/${patientId}/logs/export`, { 
      format, 
      ...filters 
    })
  },

  // Get log templates
  async getLogTemplates(type = null) {
    const params = type ? { type } : {}
    return apiClient.get('/logs/templates', params)
  },

  // Create log from template
  async createLogFromTemplate(patientId, templateId, data = {}) {
    return apiClient.post(`/patients/${patientId}/logs/from-template`, {
      templateId,
      data
    })
  }
}

export default dailyLogService 