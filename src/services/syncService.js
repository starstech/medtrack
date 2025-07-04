// Sync service for offline support and real-time updates
import apiClient from './api'

export const syncService = {
  // Get patient data for sync
  async getPatientDataForSync(patientId, lastSync = null) {
    try {
      const params = lastSync ? { lastSync } : {}
      const data = await apiClient.get(`/sync/patient/${patientId}`, params)
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching patient sync data:', error)
      return { data: null, error: error.message }
    }
  },

  // Get all user data for sync
  async getAllDataForSync(lastSync = null) {
    try {
      const params = lastSync ? { lastSync } : {}
      const data = await apiClient.get('/sync/all', params)
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error.message }
    }
  },

  // Bulk update data (placeholder)
  async bulkUpdateData(updates) {
    try {
      const data = await apiClient.post('/sync/bulk', { updates })
      return { data, error: null }
    } catch (error) {
      console.error('Error sending bulk sync data:', error)
      return { data: null, error: error.message }
    }
  },

  // Get sync status
  async getSyncStatus() {
    try {
      const data = await apiClient.get('/sync/status')
      return { data, error: null }
    } catch (error) {
      console.error('Error getting sync status:', error)
      return { data: null, error: error.message }
    }
  },

  // Force full sync
  async forceFullSync() {
    try {
      const data = await apiClient.post('/sync/force')
      return { data, error: null }
    } catch (error) {
      console.error('Error forcing full sync:', error)
      return { data: null, error: error.message }
    }
  },

  // Get pending sync operations
  async getPendingSyncOperations() {
    try {
      const data = await apiClient.get('/sync/pending')
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching pending sync ops:', error)
      return { data: null, error: error.message }
    }
  },

  // Mark sync operation as completed
  async markSyncOperationCompleted(operationId) {
    try {
      const data = await apiClient.patch(`/sync/pending/${operationId}`, { completed: true })
      return { data, error: null }
    } catch (error) {
      console.error('Error marking sync op completed:', error)
      return { data: null, error: error.message }
    }
  },

  // Get conflict resolution data
  async getConflicts() {
    try {
      const data = await apiClient.get('/sync/conflicts')
      return { data, error: null }
    } catch (error) {
      console.error('Error getting sync conflicts:', error)
      return { data: null, error: error.message }
    }
  },

  // Resolve sync conflict
  async resolveConflict(conflictId, resolution) {
    try {
      const data = await apiClient.post(`/sync/conflicts/${conflictId}/resolve`, { resolution })
      return { data, error: null }
    } catch (error) {
      console.error('Error resolving conflict:', error)
      return { data: null, error: error.message }
    }
  },

  // Register device for sync
  async registerDevice(deviceInfo) {
    try {
      const data = await apiClient.post('/devices', deviceInfo)
      return { data, error: null }
    } catch (error) {
      console.error('Error registering device:', error)
      return { data: null, error: error.message }
    }
  },

  // Unregister device
  async unregisterDevice(deviceId) {
    try {
      await apiClient.delete(`/devices/${deviceId}`)
      return { data: true, error: null }
    } catch (error) {
      console.error('Error unregistering device:', error)
      return { data: null, error: error.message }
    }
  },

  // Get device sync history
  async getDeviceSyncHistory(deviceId, limit = 50) {
    try {
      const data = await apiClient.get(`/devices/${deviceId}/history`, { limit })
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching device sync history:', error)
      return { data: null, error: error.message }
    }
  }
}

// Real-time service placeholder (Supabase removed)
export const realTimeService = {
  subscriptions: new Map(),
  subscribe() {
    console.warn('Realtime subscriptions are disabled until backend socket endpoints are available.')
    return () => {}
  },
  unsubscribe() {
    /* no-op */
  },
  unsubscribeAll() {
    this.subscriptions.clear()
  },
  getActiveSubscriptions() {
    return []
  }
}

// Device management for mobile apps
export const deviceService = {
  async registerDevice(deviceInfo) {
    return syncService.registerDevice(deviceInfo)
  },
  async updateDeviceToken(deviceId, pushToken) {
    try {
      const data = await apiClient.patch(`/devices/${deviceId}`, { pushToken })
      return { data, error: null }
    } catch (error) {
      console.error('Error updating device token:', error)
      return { data: null, error: error.message }
    }
  },
  async unregisterDevice(deviceId) {
    return syncService.unregisterDevice(deviceId)
  },
  async getDeviceInfo(deviceId) {
    try {
      const data = await apiClient.get(`/devices/${deviceId}`)
      return { data, error: null }
    } catch (error) {
      console.error('Error getting device info:', error)
      return { data: null, error: error.message }
    }
  },
  async getUserDevices() {
    try {
      const data = await apiClient.get('/devices')
      return { data, error: null }
    } catch (error) {
      console.error('Error getting user devices:', error)
      return { data: null, error: error.message }
    }
  },
  async updateDeviceSettings(deviceId, settings) {
    try {
      const data = await apiClient.put(`/devices/${deviceId}`, settings)
      return { data, error: null }
    } catch (error) {
      console.error('Error updating device settings:', error)
      return { data: null, error: error.message }
    }
  }
}

export default syncService 