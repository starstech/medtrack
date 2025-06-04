// Sync service for offline support and real-time updates
import apiClient from './api'

export const syncService = {
  // Get patient data for sync
  async getPatientDataForSync(patientId, lastSync = null) {
    const params = lastSync ? { lastSync } : {}
    return apiClient.get(`/sync/patient-data/${patientId}`, params)
  },

  // Get all user data for sync
  async getAllDataForSync(lastSync = null) {
    const params = lastSync ? { lastSync } : {}
    return apiClient.get('/sync/user-data', params)
  },

  // Bulk update data (for offline sync)
  async bulkUpdateData(updates) {
    return apiClient.post('/sync/bulk-update', { updates })
  },

  // Get sync status
  async getSyncStatus() {
    return apiClient.get('/sync/status')
  },

  // Force full sync
  async forceFullSync() {
    return apiClient.post('/sync/force-full')
  },

  // Get pending sync operations
  async getPendingSyncOperations() {
    return apiClient.get('/sync/pending')
  },

  // Mark sync operation as completed
  async markSyncOperationCompleted(operationId) {
    return apiClient.patch(`/sync/operations/${operationId}/complete`)
  },

  // Get conflict resolution data
  async getConflicts() {
    return apiClient.get('/sync/conflicts')
  },

  // Resolve sync conflict
  async resolveConflict(conflictId, resolution) {
    return apiClient.post(`/sync/conflicts/${conflictId}/resolve`, resolution)
  },

  // Register device for sync
  async registerDevice(deviceInfo) {
    return apiClient.post('/sync/devices', deviceInfo)
  },

  // Unregister device
  async unregisterDevice(deviceId) {
    return apiClient.delete(`/sync/devices/${deviceId}`)
  },

  // Get device sync history
  async getDeviceSyncHistory(deviceId, limit = 50) {
    return apiClient.get(`/sync/devices/${deviceId}/history`, { limit })
  }
}

// Real-time service for Supabase subscriptions
export const realTimeService = {
  // Store active subscriptions
  subscriptions: new Map(),

  // Subscribe to patient changes
  subscribeToPatient(patientId, callback) {
    // This would integrate with Supabase real-time
    const channel = `patient:${patientId}`
    
    // Store subscription for cleanup
    this.subscriptions.set(channel, {
      type: 'patient',
      patientId,
      callback
    })

    // Return unsubscribe function
    return () => this.unsubscribe(channel)
  },

  // Subscribe to dose changes
  subscribeToDoses(patientId, callback) {
    const channel = `doses:${patientId}`
    
    this.subscriptions.set(channel, {
      type: 'doses',
      patientId,
      callback
    })

    return () => this.unsubscribe(channel)
  },

  // Subscribe to notifications
  subscribeToNotifications(userId, callback) {
    const channel = `notifications:${userId}`
    
    this.subscriptions.set(channel, {
      type: 'notifications',
      userId,
      callback
    })

    return () => this.unsubscribe(channel)
  },

  // Subscribe to caregiver activity
  subscribeToCaregiverActivity(patientId, callback) {
    const channel = `caregiver_activity:${patientId}`
    
    this.subscriptions.set(channel, {
      type: 'caregiver_activity',
      patientId,
      callback
    })

    return () => this.unsubscribe(channel)
  },

  // Subscribe to appointments
  subscribeToAppointments(patientId, callback) {
    const channel = `appointments:${patientId}`
    
    this.subscriptions.set(channel, {
      type: 'appointments',
      patientId,
      callback
    })

    return () => this.unsubscribe(channel)
  },

  // Unsubscribe from channel
  unsubscribe(channel) {
    if (this.subscriptions.has(channel)) {
      // Clean up Supabase subscription here
      this.subscriptions.delete(channel)
    }
  },

  // Unsubscribe from all channels
  unsubscribeAll() {
    this.subscriptions.forEach((_, channel) => {
      this.unsubscribe(channel)
    })
    this.subscriptions.clear()
  },

  // Get active subscriptions
  getActiveSubscriptions() {
    return Array.from(this.subscriptions.keys())
  }
}

// Device management for mobile apps
export const deviceService = {
  // Register device
  async registerDevice(deviceInfo) {
    return apiClient.post('/devices/register', deviceInfo)
  },

  // Update device token (for push notifications)
  async updateDeviceToken(deviceId, token) {
    return apiClient.put(`/devices/${deviceId}/token`, { token })
  },

  // Unregister device
  async unregisterDevice(deviceId) {
    return apiClient.delete(`/devices/${deviceId}`)
  },

  // Get device info
  async getDeviceInfo(deviceId) {
    return apiClient.get(`/devices/${deviceId}`)
  },

  // Get user devices
  async getUserDevices() {
    return apiClient.get('/devices')
  },

  // Update device settings
  async updateDeviceSettings(deviceId, settings) {
    return apiClient.put(`/devices/${deviceId}/settings`, settings)
  }
}

export default syncService 