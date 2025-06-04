// Caregiver service for managing caregiver relationships and collaboration
import apiClient from './api'

export const caregiverService = {
  // Get all caregivers for current user
  async getCaregivers() {
    return apiClient.get('/caregivers')
  },

  // Get caregiver by ID
  async getCaregiver(caregiverId) {
    return apiClient.get(`/caregivers/${caregiverId}`)
  },

  // Update caregiver information
  async updateCaregiver(caregiverId, caregiverData) {
    return apiClient.put(`/caregivers/${caregiverId}`, caregiverData)
  },

  // Remove caregiver
  async removeCaregiver(caregiverId) {
    return apiClient.delete(`/caregivers/${caregiverId}`)
  },

  // Invite caregiver
  async inviteCaregiver(invitationData) {
    return apiClient.post('/caregivers/invite', invitationData)
  },

  // Accept caregiver invitation
  async acceptInvitation(token) {
    return apiClient.post('/caregivers/accept-invitation', { token })
  },

  // Decline caregiver invitation
  async declineInvitation(token, reason = '') {
    return apiClient.post('/caregivers/decline-invitation', { token, reason })
  },

  // Get pending invitations (sent by current user)
  async getPendingInvitations() {
    return apiClient.get('/caregivers/pending-invitations')
  },

  // Get received invitations (for current user)
  async getReceivedInvitations() {
    return apiClient.get('/caregivers/received-invitations')
  },

  // Cancel invitation
  async cancelInvitation(invitationId) {
    return apiClient.delete(`/caregivers/invitations/${invitationId}`)
  },

  // Resend invitation
  async resendInvitation(invitationId) {
    return apiClient.post(`/caregivers/invitations/${invitationId}/resend`)
  },

  // Get caregiver permissions
  async getCaregiverPermissions(caregiverId, patientId) {
    return apiClient.get(`/caregivers/${caregiverId}/permissions`, { patientId })
  },

  // Update caregiver permissions
  async updateCaregiverPermissions(caregiverId, patientId, permissions) {
    return apiClient.put(`/caregivers/${caregiverId}/permissions`, {
      patientId,
      permissions
    })
  },

  // Get caregiver activity
  async getCaregiverActivity(caregiverId, patientId = null, limit = 10) {
    const params = { limit }
    if (patientId) params.patientId = patientId
    return apiClient.get(`/caregivers/${caregiverId}/activity`, params)
  },

  // Get patients shared with caregiver
  async getSharedPatients(caregiverId) {
    return apiClient.get(`/caregivers/${caregiverId}/patients`)
  },

  // Share patient with caregiver
  async sharePatientWithCaregiver(patientId, caregiverId, role, permissions = {}) {
    return apiClient.post(`/patients/${patientId}/share`, {
      caregiverId,
      role,
      permissions
    })
  },

  // Unshare patient from caregiver
  async unsharePatientFromCaregiver(patientId, caregiverId) {
    return apiClient.delete(`/patients/${patientId}/caregivers/${caregiverId}`)
  },

  // Get caregiver notifications preferences
  async getCaregiverNotificationPreferences(caregiverId) {
    return apiClient.get(`/caregivers/${caregiverId}/notification-preferences`)
  },

  // Update caregiver notification preferences
  async updateCaregiverNotificationPreferences(caregiverId, preferences) {
    return apiClient.put(`/caregivers/${caregiverId}/notification-preferences`, preferences)
  },

  // Send message to caregiver
  async sendMessageToCaregiver(caregiverId, messageData) {
    return apiClient.post(`/caregivers/${caregiverId}/messages`, messageData)
  },

  // Get messages with caregiver
  async getMessagesWithCaregiver(caregiverId, limit = 50) {
    return apiClient.get(`/caregivers/${caregiverId}/messages`, { limit })
  },

  // Get care team for patient
  async getPatientCareTeam(patientId) {
    return apiClient.get(`/patients/${patientId}/care-team`)
  },

  // Add caregiver to care team
  async addToCareTeam(patientId, caregiverData) {
    return apiClient.post(`/patients/${patientId}/care-team`, caregiverData)
  },

  // Remove from care team
  async removeFromCareTeam(patientId, caregiverId) {
    return apiClient.delete(`/patients/${patientId}/care-team/${caregiverId}`)
  },

  // Get caregiver schedule
  async getCaregiverSchedule(caregiverId, patientId = null) {
    const params = patientId ? { patientId } : {}
    return apiClient.get(`/caregivers/${caregiverId}/schedule`, params)
  },

  // Update caregiver schedule
  async updateCaregiverSchedule(caregiverId, scheduleData) {
    return apiClient.put(`/caregivers/${caregiverId}/schedule`, scheduleData)
  },

  // Get caregiver statistics
  async getCaregiverStats(caregiverId, period = '30') {
    return apiClient.get(`/caregivers/${caregiverId}/stats`, { period })
  }
}

export default caregiverService 