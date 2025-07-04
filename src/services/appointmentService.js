// Appointment service for calendar and appointment management
import apiClient, { buildQueryString } from './api'

// Note: This service assumes an 'appointments' table exists in the database
// If not implemented yet, these methods will return appropriate errors
export const appointmentService = {
  // Get all appointments
  async getAppointments(filters = {}) {
    try {
      const data = await apiClient.get('/appointments', filters)
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching appointments:', error)
      return { data: null, error: error.message }
    }
  },

  // Get appointment by ID
  async getAppointment(appointmentId) {
    try {
      const { appointment } = await apiClient.get(`/appointments/${appointmentId}`)
      return { data: appointment, error: null }
    } catch (error) {
      console.error('Error fetching appointment:', error)
      return { data: null, error: error.message }
    }
  },

  // Create new appointment
  async createAppointment(appointmentData) {
    try {
      const { appointment } = await apiClient.post('/appointments', appointmentData)
      return { data: appointment, error: null }
    } catch (error) {
      console.error('Error creating appointment:', error)
      return { data: null, error: error.message }
    }
  },

  // Update appointment
  async updateAppointment(appointmentId, appointmentData) {
    try {
      const { appointment } = await apiClient.put(`/appointments/${appointmentId}`, appointmentData)
      return { data: appointment, error: null }
    } catch (error) {
      console.error('Error updating appointment:', error)
      return { data: null, error: error.message }
    }
  },

  // Delete appointment
  async deleteAppointment(appointmentId) {
    try {
      await apiClient.delete(`/appointments/${appointmentId}`)
      return { data: true, error: null }
    } catch (error) {
      console.error('Error deleting appointment:', error)
      return { data: null, error: error.message }
    }
  },

  // Get calendar appointments (with date range)
  async getCalendarAppointments(startDate, endDate, patientId = null) {
    const filters = { startDate, endDate }
    if (patientId) filters.patientId = patientId
    return this.getAppointments(filters)
  },

  // Get upcoming appointments
  async getUpcomingAppointments(days = 7, patientId = null) {
    const startDate = new Date().toISOString()
    const endDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
    
    const filters = { startDate, endDate, status: 'scheduled' }
    if (patientId) filters.patientId = patientId
    
    return this.getAppointments(filters)
  },

  // Get appointments by patient
  async getPatientAppointments(patientId, filters = {}) {
    return this.getAppointments({ patientId, ...filters })
  },

  // Get appointments by type
  async getAppointmentsByType(type, filters = {}) {
    return this.getAppointments({ type, ...filters })
  },

  // Get appointments by date range
  async getAppointmentsByDateRange(startDate, endDate, filters = {}) {
    return this.getAppointments({ startDate, endDate, ...filters })
  },

  // Search appointments
  async searchAppointments(query, filters = {}) {
    return this.getAppointments({ ...filters, search: query })
  },

  // Get appointment conflicts
  async checkAppointmentConflicts(appointmentData) {
    // Implementation needed
    throw new Error('Method not implemented')
  },

  // Get appointment reminders
  async getAppointmentReminders(appointmentId) {
    // Implementation needed
    throw new Error('Method not implemented')
  },

  // Set appointment reminder
  async setAppointmentReminder(appointmentId, reminderData) {
    // Implementation needed
    throw new Error('Method not implemented')
  },

  // Cancel appointment reminder
  async cancelAppointmentReminder(appointmentId, reminderId) {
    // Implementation needed
    throw new Error('Method not implemented')
  },

  // Mark appointment as completed
  async markAppointmentCompleted(appointmentId, notes = '') {
    return this.updateAppointment(appointmentId, { 
      status: 'completed', 
      notes: notes,
      completed_at: new Date().toISOString()
    })
  },

  // Mark appointment as missed
  async markAppointmentMissed(appointmentId, reason = '') {
    return this.updateAppointment(appointmentId, { 
      status: 'missed', 
      missed_reason: reason,
      missed_at: new Date().toISOString()
    })
  },

  // Reschedule appointment
  async rescheduleAppointment(appointmentId, newDateTime, reason = '') {
    return this.updateAppointment(appointmentId, { 
      appointment_date: newDateTime,
      reschedule_reason: reason,
      rescheduled_at: new Date().toISOString()
    })
  },

  // Get recurring appointment instances
  async getRecurringInstances(appointmentId) {
    // Implementation needed
    throw new Error('Method not implemented')
  },

  // Update recurring appointment series
  async updateRecurringSeries(appointmentId, appointmentData, updateType = 'series') {
    // Implementation needed
    throw new Error('Method not implemented')
  },

  // Cancel recurring appointment series
  async cancelRecurringSeries(appointmentId, cancelType = 'series') {
    // Implementation needed
    throw new Error('Method not implemented')
  },

  // Get appointment statistics
  async getAppointmentStats(patientId = null, period = '30') {
    try {
      const params = { period }
      if (patientId) params.patientId = patientId
      const { stats } = await apiClient.get('/appointments/stats', params)
      return { data: stats, error: null }
    } catch (error) {
      console.error('Error getting appointment stats:', error)
      return { data: null, error: error.message }
    }
  },

  // Export appointments
  async exportAppointments(format = 'ical', filters = {}) {
    // Implementation needed
    throw new Error('Method not implemented')
  },

  // Get available time slots
  async getAvailableTimeSlots(providerId, date, duration = 30) {
    // Implementation needed
    throw new Error('Method not implemented')
  },

  // Send appointment invitation
  async sendAppointmentInvitation(appointmentId, emails) {
    // Implementation needed
    throw new Error('Method not implemented')
  }
}

export default appointmentService 