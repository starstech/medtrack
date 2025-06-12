// Daily log service for observations, incidents, and activities
import { supabase } from '../lib/supabase'

export const dailyLogService = {
  // Get daily logs for a patient
  async getPatientLogs(patientId, filters = {}) {
    try {
      let query = supabase
        .from('daily_logs')
        .select('*')
        .eq('patient_id', patientId)
        .order('timestamp', { ascending: false })

      if (filters.type) {
        query = query.eq('type', filters.type)
      }

      if (filters.severity) {
        query = query.eq('severity', filters.severity)
      }

      if (filters.startDate) {
        query = query.gte('timestamp', filters.startDate)
      }

      if (filters.endDate) {
        query = query.lte('timestamp', filters.endDate)
      }

      if (filters.limit) {
        query = query.limit(filters.limit)
      }

      const { data, error } = await query

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching patient logs:', error)
      return { data: null, error: error.message }
    }
  },

  // Get single log entry
  async getLog(logId) {
    try {
      const { data, error } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('id', logId)
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching log:', error)
      return { data: null, error: error.message }
    }
  },

  // Create new log entry
  async createLog(patientId, logData) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('daily_logs')
        .insert({
          ...logData,
          patient_id: patientId,
          recorded_by: user.id,
          timestamp: logData.timestamp || new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error creating log:', error)
      return { data: null, error: error.message }
    }
  },

  // Update log entry
  async updateLog(logId, logData) {
    try {
      const { data, error } = await supabase
        .from('daily_logs')
        .update(logData)
        .eq('id', logId)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error updating log:', error)
      return { data: null, error: error.message }
    }
  },

  // Delete log entry
  async deleteLog(logId) {
    try {
      const { error } = await supabase
        .from('daily_logs')
        .delete()
        .eq('id', logId)

      if (error) throw error
      return { data: true, error: null }
    } catch (error) {
      console.error('Error deleting log:', error)
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
    try {
      let supabaseQuery = supabase
        .from('daily_logs')
        .select('*')
        .eq('patient_id', patientId)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .order('timestamp', { ascending: false })

      if (filters.type) {
        supabaseQuery = supabaseQuery.eq('type', filters.type)
      }

      if (filters.limit) {
        supabaseQuery = supabaseQuery.limit(filters.limit)
      }

      const { data, error } = await supabaseQuery

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error searching logs:', error)
      return { data: null, error: error.message }
    }
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
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const logsWithMetadata = logs.map(log => ({
        ...log,
        patient_id: patientId,
        recorded_by: user.id,
        timestamp: log.timestamp || new Date().toISOString()
      }))

      const { data, error } = await supabase
        .from('daily_logs')
        .insert(logsWithMetadata)
        .select()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error bulk creating logs:', error)
      return { data: null, error: error.message }
    }
  },

  // Add attachment to log (using Supabase Storage)
  async addLogAttachment(logId, file, description = '') {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Upload file to storage
      const fileName = `${logId}/${Date.now()}_${file.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('medtrack-attachments')
        .upload(`${user.id}/logs/${fileName}`, file)

      if (uploadError) throw uploadError

      // Update log with attachment info
      const { data: log, error: logError } = await supabase
        .from('daily_logs')
        .select('attachments')
        .eq('id', logId)
        .single()

      if (logError) throw logError

      const attachments = log.attachments || []
      attachments.push({
        id: Date.now().toString(),
        filename: file.name,
        path: uploadData.path,
        description,
        uploaded_at: new Date().toISOString()
      })

      const { data, error } = await supabase
        .from('daily_logs')
        .update({ attachments })
        .eq('id', logId)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error adding log attachment:', error)
      return { data: null, error: error.message }
    }
  },

  // Delete log attachment
  async deleteLogAttachment(logId, attachmentId) {
    try {
      const { data: log, error: logError } = await supabase
        .from('daily_logs')
        .select('attachments')
        .eq('id', logId)
        .single()

      if (logError) throw logError

      const attachments = (log.attachments || []).filter(att => att.id !== attachmentId)

      const { data, error } = await supabase
        .from('daily_logs')
        .update({ attachments })
        .eq('id', logId)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error deleting log attachment:', error)
      return { data: null, error: error.message }
    }
  },

  // Get log attachments
  async getLogAttachments(logId) {
    try {
      const { data, error } = await supabase
        .from('daily_logs')
        .select('attachments')
        .eq('id', logId)
        .single()

      if (error) throw error
      return { data: data.attachments || [], error: null }
    } catch (error) {
      console.error('Error fetching log attachments:', error)
      return { data: null, error: error.message }
    }
  },

  // Get log statistics
  async getLogStats(patientId, period = '30') {
    return apiClient.get(`/patients/${patientId}/logs/stats`, { period })
  },

  // Get log trends
  async getLogTrends(patientId, type, period = '30') {
    return apiClient.get(`/patients/${patientId}/logs/trends`, { type, period })
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