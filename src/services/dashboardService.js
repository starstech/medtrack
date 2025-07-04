// Dashboard service
import apiClient from './api'

export const dashboardService = {
  // Get dashboard overview data
  async getDashboardOverview(patientId = null) {
    try {
      const params = patientId ? { patientId } : {}
      const data = await apiClient.get('/dashboard/quick-stats', params)
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error.message }
    }
  },

  // Get recent activity (doses + measurements)
  async getRecentActivity(patientId = null, limit = 10) {
    try {
      const params = { limit }
      if (patientId) params.patientId = patientId
      const data = await apiClient.get('/dashboard/recent-activity', params)
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching recent activity:', error)
      return { data: null, error: error.message }
    }
  },

  // Get upcoming doses for today
  async getUpcomingDoses(patientId = null, limit = 5) {
    try {
      const params = { days: 1, limit } // backend expects days param but limit too.
      if (patientId) params.patientId = patientId
      const data = await apiClient.get('/dashboard/upcoming-doses', params)
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching upcoming doses:', error)
      return { data: null, error: error.message }
    }
  },

  // Get medication overview
  async getMedicationOverview(patientId = null) {
    const params = patientId ? { patientId } : {}
    return apiClient.get('/dashboard/medication-overview', params)
  },

  // Get alerts and notifications
  async getDashboardAlerts(patientId = null) {
    const params = patientId ? { patientId } : {}
    return apiClient.get('/dashboard/alerts', params)
  },

  // Get adherence trends
  async getAdherenceTrends(patientId = null, period = '30') {
    const params = { period }
    if (patientId) params.patientId = patientId
    return apiClient.get('/dashboard/adherence-trends', params)
  },

  // Get upcoming events
  async getUpcomingEvents(patientId = null, days = 7) {
    const params = { days }
    if (patientId) params.patientId = patientId
    return apiClient.get('/dashboard/upcoming-events', params)
  },

  // Get health metrics summary
  async getHealthMetrics(patientId = null, period = '30') {
    const params = { period }
    if (patientId) params.patientId = patientId
    return apiClient.get('/dashboard/health-metrics', params)
  },

  // Get care team activity
  async getCareTeamActivity(patientId = null, limit = 5) {
    const params = { limit }
    if (patientId) params.patientId = patientId
    return apiClient.get('/dashboard/care-team-activity', params)
  },

  // Get critical alerts
  async getCriticalAlerts(patientId = null) {
    const params = patientId ? { patientId } : {}
    return apiClient.get('/dashboard/critical-alerts', params)
  }
}

export default dashboardService 