// Caregiver service for managing caregiver relationships and collaboration
import apiClient from './api'

export const caregiverService = {
  // Get all caregivers for current user
  async getCaregivers() {
    try {
      const data = await apiClient.get('/caregivers')
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error.message }
    }
  },

  // Get caregiver relationship by ID
  async getCaregiver(caregiverId) {
    try {
      const data = await apiClient.get(`/caregivers/${caregiverId}`)
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error.message }
    }
  },

  // Update caregiver relationship (role/permissions)
  async updateCaregiver(caregiverId, caregiverData) {
    try {
      const data = await apiClient.put(`/caregivers/${caregiverId}`, caregiverData)
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error.message }
    }
  },

  // Remove caregiver relationship
  async removeCaregiver(caregiverId) {
    try {
      await apiClient.delete(`/caregivers/${caregiverId}`)
      return { data: true, error: null }
    } catch (error) {
      return { data: null, error: error.message }
    }
  },

  // Invite caregiver
  async inviteCaregiver(invitationData) {
    try {
      const { invitation } = await apiClient.post('/caregivers/invite', invitationData)
      return { data: invitation, error: null }
    } catch (error) {
      return { data: null, error: error.message }
    }
  },

  // Get pending invitations (sent by current user)
  async getPendingInvitations() {
    try {
      const data = await apiClient.get('/caregivers/invitations')
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching pending invitations:', error)
      return { data: null, error: error.message }
    }
  },

  // Accept caregiver invitation
  async acceptInvitation(invitationId) {
    try {
      await apiClient.post(`/caregivers/invitations/${invitationId}/accept`)
      return { data: true, error: null }
    } catch (error) {
      console.error('Error accepting invitation:', error)
      return { data: null, error: error.message }
    }
  },

  // Decline caregiver invitation
  async declineInvitation(invitationId, reason = '') {
    try {
      await apiClient.post(`/caregivers/invitations/${invitationId}/decline`, { reason })
      return { data: true, error: null }
    } catch (error) {
      console.error('Error declining invitation:', error)
      return { data: null, error: error.message }
    }
  },

  // Get received invitations (for current user)
  async getReceivedInvitations() {
    try {
      const data = await apiClient.get('/caregivers/invitations/received')
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching received invitations:', error)
      return { data: null, error: error.message }
    }
  },

  // Cancel invitation
  async cancelInvitation(invitationId) {
    try {
      await apiClient.delete(`/caregivers/invitations/${invitationId}`)
      return { data: true, error: null }
    } catch (error) {
      console.error('Error canceling invitation:', error)
      return { data: null, error: error.message }
    }
  },

  // Resend invitation
  async resendInvitation(invitationId) {
    try {
      await apiClient.post(`/caregivers/invitations/${invitationId}/resend`)
      return { data: true, error: null }
    } catch (error) {
      console.error('Error resending invitation:', error)
      return { data: null, error: error.message }
    }
  },

  // Get caregiver permissions
  async getCaregiverPermissions(caregiverId, patientId) {
    try {
      const params = patientId ? { patientId } : {}
      const data = await apiClient.get(`/caregivers/${caregiverId}/permissions`, params)
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching caregiver permissions:', error)
      return { data: null, error: error.message }
    }
  },

  // Update caregiver permissions
  async updateCaregiverPermissions(caregiverId, patientId, permissions) {
    try {
      const data = await apiClient.put(`/caregivers/${caregiverId}/permissions`, { patientId, permissions })
      return { data, error: null }
    } catch (error) {
      console.error('Error updating caregiver permissions:', error)
      return { data: null, error: error.message }
    }
  },

  // Get caregiver activity
  async getCaregiverActivity(caregiverId, patientId = null, limit = 10) {
    try {
      const params = { limit }
      if (patientId) params.patientId = patientId
      const data = await apiClient.get(`/caregivers/${caregiverId}/activity`, params)
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching caregiver activity:', error)
      return { data: null, error: error.message }
    }
  },

  // Get patients shared with caregiver
  async getSharedPatients() {
    try {
      const data = await apiClient.get('/caregivers/shared-patients')
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching shared patients:', error)
      return { data: null, error: error.message }
    }
  },

  // Share patient with caregiver
  async sharePatientWithCaregiver(patientId, caregiverId, role, permissions = {}) {
    console.warn('sharePatientWithCaregiver: not implemented')
    return { data: null, error: 'Not implemented' }
  },

  // Unshare patient from caregiver
  async unsharePatientFromCaregiver(patientId, caregiverId) {
    console.warn('unsharePatientFromCaregiver: not implemented')
    return { data: null, error: 'Not implemented' }
  },

  // Get caregiver notification preferences
  async getCaregiverNotificationPreferences(caregiverId) {
    console.warn('getCaregiverNotificationPreferences: not implemented')
    return { data: null, error: 'Not implemented' }
  },

  // Update caregiver notification preferences
  async updateCaregiverNotificationPreferences(caregiverId, preferences) {
    console.warn('updateCaregiverNotificationPreferences: not implemented')
    return { data: null, error: 'Not implemented' }
  },

  // Send message to caregiver
  async sendMessageToCaregiver(caregiverId, messageData) {
    console.warn('sendMessageToCaregiver: not implemented')
    return { data: null, error: 'Not implemented' }
  },

  // Get messages with caregiver
  async getMessagesWithCaregiver(caregiverId, limit = 50) {
    console.warn('getMessagesWithCaregiver: not implemented')
    return { data: [], error: 'Not implemented' }
  },

  // Get care team for patient
  async getPatientCareTeam(patientId) {
    return apiClient.get(`/patients/${patientId}/caregivers`)
  },

  // Add caregiver to care team
  async addToCareTeam(patientId, caregiverData) {
    return apiClient.post(`/patients/${patientId}/caregivers`, caregiverData)
  },

  // Remove from care team
  async removeFromCareTeam(patientId, caregiverId) {
    return apiClient.delete(`/patients/${patientId}/caregivers/${caregiverId}`)
  },

  // Get caregiver schedule
  async getCaregiverSchedule(caregiverId, patientId = null) {
    console.warn('getCaregiverSchedule: not implemented')
    return { data: null, error: 'Not implemented' }
  },

  // Update caregiver schedule
  async updateCaregiverSchedule(caregiverId, scheduleData) {
    console.warn('updateCaregiverSchedule: not implemented')
    return { data: null, error: 'Not implemented' }
  },

  // Get caregiver statistics
  async getCaregiverStats(caregiverId, period = '30') {
    console.warn('getCaregiverStats: not implemented')
    return { data: null, error: 'Not implemented' }
  }
}

export default caregiverService 