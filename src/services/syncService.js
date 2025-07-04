// Sync service for offline support and real-time updates
import apiClient from './api'

export const syncService = {
  // Get patient data for sync
  async getPatientDataForSync(patientId, lastSync = null) {
    console.warn('getPatientDataForSync: backend endpoint pending')
    return { data: null, error: 'Not implemented' }
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
    console.warn('bulkUpdateData: backend endpoint pending')
    return { data: null, error: 'Not implemented' }
  },

  // Get sync status
  async getSyncStatus() {
    console.warn('getSyncStatus: backend endpoint pending')
    return { data: { lastSync: null, status: 'unknown' }, error: null }
  },

  // Force full sync
  async forceFullSync() {
    console.warn('forceFullSync: not implemented')
    return { data: null, error: 'Not implemented' }
  },

  // Get pending sync operations
  async getPendingSyncOperations() {
    console.warn('getPendingSyncOperations: not implemented')
    return { data: [], error: 'Not implemented' }
  },

  // Mark sync operation as completed
  async markSyncOperationCompleted() {
    console.warn('markSyncOperationCompleted: not implemented')
    return { data: null, error: 'Not implemented' }
  },

  // Get conflict resolution data
  async getConflicts() {
    console.warn('getConflicts: not implemented')
    return { data: [], error: 'Not implemented' }
  },

  // Resolve sync conflict
  async resolveConflict() {
    console.warn('resolveConflict: not implemented')
    return { data: null, error: 'Not implemented' }
  },

  // Register device for sync
  async registerDevice() {
    console.warn('registerDevice: not implemented')
    return { data: null, error: 'Not implemented' }
  },

  // Unregister device
  async unregisterDevice() {
    console.warn('unregisterDevice: not implemented')
    return { data: null, error: 'Not implemented' }
  },

  // Get device sync history
  async getDeviceSyncHistory() {
    console.warn('getDeviceSyncHistory: not implemented')
    return { data: [], error: 'Not implemented' }
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
  async registerDevice() {
    console.warn('deviceService.registerDevice: not implemented')
    return { data: null, error: 'Not implemented' }
  },
  async updateDeviceToken() {
    console.warn('deviceService.updateDeviceToken: not implemented')
    return { data: null, error: 'Not implemented' }
  },
  async unregisterDevice() {
    console.warn('deviceService.unregisterDevice: not implemented')
    return { data: null, error: 'Not implemented' }
  },
  async getDeviceInfo() {
    console.warn('deviceService.getDeviceInfo: not implemented')
    return { data: null, error: 'Not implemented' }
  },
  async getUserDevices() {
    console.warn('deviceService.getUserDevices: not implemented')
    return { data: [], error: 'Not implemented' }
  },
  async updateDeviceSettings() {
    console.warn('deviceService.updateDeviceSettings: not implemented')
    return { data: null, error: 'Not implemented' }
  }
}

export default syncService 