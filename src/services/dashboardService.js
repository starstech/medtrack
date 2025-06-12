// Dashboard service
import { supabase } from '../lib/supabase'

export const dashboardService = {
  // Get dashboard overview data
  async getDashboardOverview() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Get patients count
      const { count: patientsCount } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true })
        .eq('patient_caregivers.caregiver_id', user.id)
        .eq('patient_caregivers.is_active', true)

      // Get upcoming doses count
      const { count: upcomingDosesCount } = await supabase
        .from('doses')
        .select(`
          *,
          medication:medications!inner(
            patient_id,
            patient:patients!inner(
              patient_caregivers!inner(caregiver_id, is_active)
            )
          )
        `, { count: 'exact', head: true })
        .eq('status', 'pending')
        .eq('medication.patient.patient_caregivers.caregiver_id', user.id)
        .eq('medication.patient.patient_caregivers.is_active', true)
        .gte('scheduled_time', new Date().toISOString())
        .lte('scheduled_time', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString())

      // Get overdue doses count
      const { count: overdueDosesCount } = await supabase
        .from('doses')
        .select(`
          *,
          medication:medications!inner(
            patient_id,
            patient:patients!inner(
              patient_caregivers!inner(caregiver_id, is_active)
            )
          )
        `, { count: 'exact', head: true })
        .eq('status', 'pending')
        .eq('medication.patient.patient_caregivers.caregiver_id', user.id)
        .eq('medication.patient.patient_caregivers.is_active', true)
        .lt('scheduled_time', new Date().toISOString())

      // Get recent measurements count
      const { count: recentMeasurementsCount } = await supabase
        .from('measurements')
        .select(`
          *,
          patient:patients!inner(
            patient_caregivers!inner(caregiver_id, is_active)
          )
        `, { count: 'exact', head: true })
        .eq('patient.patient_caregivers.caregiver_id', user.id)
        .eq('patient.patient_caregivers.is_active', true)
        .gte('recorded_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

      return {
        data: {
          patientsCount: patientsCount || 0,
          upcomingDosesCount: upcomingDosesCount || 0,
          overdueDosesCount: overdueDosesCount || 0,
          recentMeasurementsCount: recentMeasurementsCount || 0
        },
        error: null
      }
    } catch (error) {
      console.error('Error fetching dashboard overview:', error)
      return { data: null, error: error.message }
    }
  },

  // Get recent activity
  async getRecentActivity(limit = 10) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Get recent doses
      const { data: recentDoses } = await supabase
        .from('doses')
        .select(`
          *,
          medication:medications!inner(
            name,
            patient:patients!inner(
              name,
              patient_caregivers!inner(caregiver_id, is_active)
            )
          )
        `)
        .eq('medication.patient.patient_caregivers.caregiver_id', user.id)
        .eq('medication.patient.patient_caregivers.is_active', true)
        .in('status', ['taken', 'missed', 'skipped'])
        .order('taken_at', { ascending: false })
        .limit(limit)

      // Get recent measurements
      const { data: recentMeasurements } = await supabase
        .from('measurements')
        .select(`
          *,
          patient:patients!inner(
            name,
            patient_caregivers!inner(caregiver_id, is_active)
          )
        `)
        .eq('patient.patient_caregivers.caregiver_id', user.id)
        .eq('patient.patient_caregivers.is_active', true)
        .order('recorded_at', { ascending: false })
        .limit(limit)

      // Combine and sort by timestamp
      const activities = [
        ...(recentDoses || []).map(dose => ({
          type: 'dose',
          timestamp: dose.taken_at || dose.created_at,
          data: dose
        })),
        ...(recentMeasurements || []).map(measurement => ({
          type: 'measurement',
          timestamp: measurement.recorded_at,
          data: measurement
        }))
      ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, limit)

      return { data: activities, error: null }
    } catch (error) {
      console.error('Error fetching recent activity:', error)
      return { data: null, error: error.message }
    }
  },

  // Get upcoming doses for today
  async getUpcomingDoses(limit = 5) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('doses')
        .select(`
          *,
          medication:medications!inner(
            name,
            dosage,
            patient:patients!inner(
              name,
              patient_caregivers!inner(caregiver_id, is_active)
            )
          )
        `)
        .eq('status', 'pending')
        .eq('medication.patient.patient_caregivers.caregiver_id', user.id)
        .eq('medication.patient.patient_caregivers.is_active', true)
        .gte('scheduled_time', new Date().toISOString())
        .lte('scheduled_time', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString())
        .order('scheduled_time', { ascending: true })
        .limit(limit)

      if (error) throw error
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

  // Get quick stats for widgets
  async getQuickStats(patientId = null) {
    const params = patientId ? { patientId } : {}
    return apiClient.get('/dashboard/quick-stats', params)
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