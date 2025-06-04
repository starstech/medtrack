// Appointment service for calendar and appointment management
import apiClient from './api'

export const appointmentService = {
  // Get all appointments
  async getAppointments(filters = {}) {
    return apiClient.get('/appointments', filters)
  },

  // Get appointment by ID
  async getAppointment(appointmentId) {
    return apiClient.get(`/appointments/${appointmentId}`)
  },

  // Create new appointment
  async createAppointment(appointmentData) {
    return apiClient.post('/appointments', appointmentData)
  },

  // Update appointment
  async updateAppointment(appointmentId, appointmentData) {
    return apiClient.put(`/appointments/${appointmentId}`, appointmentData)
  },

  // Delete appointment
  async deleteAppointment(appointmentId) {
    return apiClient.delete(`/appointments/${appointmentId}`)
  },

  // Get calendar appointments (with date range)
  async getCalendarAppointments(startDate, endDate, patientId = null) {
    const params = { start: startDate, end: endDate }
    if (patientId) params.patientId = patientId
    return apiClient.get('/appointments/calendar', params)
  },

  // Get upcoming appointments
  async getUpcomingAppointments(days = 7, patientId = null) {
    const params = { days }
    if (patientId) params.patientId = patientId
    return apiClient.get('/appointments/upcoming', params)
  },

  // Get appointments by patient
  async getPatientAppointments(patientId, filters = {}) {
    return apiClient.get('/appointments', { patientId, ...filters })
  },

  // Get appointments by type
  async getAppointmentsByType(type, filters = {}) {
    return apiClient.get('/appointments', { type, ...filters })
  },

  // Get appointments by date range
  async getAppointmentsByDateRange(startDate, endDate, filters = {}) {
    return apiClient.get('/appointments', { 
      startDate, 
      endDate, 
      ...filters 
    })
  },

  // Search appointments
  async searchAppointments(query, filters = {}) {
    return apiClient.get('/appointments/search', { query, ...filters })
  },

  // Get appointment conflicts
  async checkAppointmentConflicts(appointmentData) {
    return apiClient.post('/appointments/check-conflicts', appointmentData)
  },

  // Get appointment reminders
  async getAppointmentReminders(appointmentId) {
    return apiClient.get(`/appointments/${appointmentId}/reminders`)
  },

  // Set appointment reminder
  async setAppointmentReminder(appointmentId, reminderData) {
    return apiClient.post(`/appointments/${appointmentId}/reminders`, reminderData)
  },

  // Cancel appointment reminder
  async cancelAppointmentReminder(appointmentId, reminderId) {
    return apiClient.delete(`/appointments/${appointmentId}/reminders/${reminderId}`)
  },

  // Mark appointment as completed
  async markAppointmentCompleted(appointmentId, notes = '') {
    return apiClient.patch(`/appointments/${appointmentId}/complete`, { notes })
  },

  // Mark appointment as missed
  async markAppointmentMissed(appointmentId, reason = '') {
    return apiClient.patch(`/appointments/${appointmentId}/missed`, { reason })
  },

  // Reschedule appointment
  async rescheduleAppointment(appointmentId, newDateTime, reason = '') {
    return apiClient.patch(`/appointments/${appointmentId}/reschedule`, {
      newDateTime,
      reason
    })
  },

  // Get recurring appointment instances
  async getRecurringInstances(appointmentId) {
    return apiClient.get(`/appointments/${appointmentId}/instances`)
  },

  // Update recurring appointment series
  async updateRecurringSeries(appointmentId, appointmentData, updateType = 'series') {
    return apiClient.put(`/appointments/${appointmentId}/recurring`, {
      ...appointmentData,
      updateType
    })
  },

  // Cancel recurring appointment series
  async cancelRecurringSeries(appointmentId, cancelType = 'series') {
    return apiClient.delete(`/appointments/${appointmentId}/recurring`, {
      data: { cancelType }
    })
  },

  // Get appointment statistics
  async getAppointmentStats(patientId = null, period = '30') {
    const params = { period }
    if (patientId) params.patientId = patientId
    return apiClient.get('/appointments/stats', params)
  },

  // Export appointments
  async exportAppointments(format = 'ical', filters = {}) {
    return apiClient.get('/appointments/export', { format, ...filters })
  },

  // Get available time slots
  async getAvailableTimeSlots(providerId, date, duration = 30) {
    return apiClient.get('/appointments/available-slots', {
      providerId,
      date,
      duration
    })
  },

  // Send appointment invitation
  async sendAppointmentInvitation(appointmentId, emails) {
    return apiClient.post(`/appointments/${appointmentId}/invite`, { emails })
  }
}

export default appointmentService 