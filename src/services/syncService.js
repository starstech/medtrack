// Sync service for offline support and real-time updates
import { supabase } from '../lib/supabase'

export const syncService = {
  // Get patient data for sync
  async getPatientDataForSync(patientId, lastSync = null) {
    try {
      const tables = ['medications', 'doses', 'measurements', 'daily_logs']
      const data = {}

      for (const table of tables) {
        let query = supabase
          .from(table)
          .select('*')
          .eq('patient_id', patientId)

        if (lastSync) {
          query = query.gte('updated_at', lastSync)
        }

        const { data: tableData, error } = await query
        if (error) throw error
        data[table] = tableData
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error getting patient data for sync:', error)
      return { data: null, error: error.message }
    }
  },

  // Get all user data for sync
  async getAllDataForSync(lastSync = null) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const tables = ['patients', 'medications', 'doses', 'measurements', 'daily_logs', 'notifications']
      const data = {}

      for (const table of tables) {
        let query = supabase.from(table).select('*')

        // Add user-specific filters
        if (table === 'patients') {
          query = query.eq('patient_caregivers.caregiver_id', user.id)
        } else if (table === 'notifications') {
          query = query.eq('user_id', user.id)
        }

        if (lastSync) {
          query = query.gte('updated_at', lastSync)
        }

        const { data: tableData, error } = await query
        if (error) throw error
        data[table] = tableData
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error getting all data for sync:', error)
      return { data: null, error: error.message }
    }
  },

  // Bulk update data (for offline sync)
  async bulkUpdateData(updates) {
    return supabase.from('sync').upsert(updates).select()
  },

  // Get sync status
  async getSyncStatus() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Get last sync timestamp from user devices
      const { data, error } = await supabase
        .from('user_devices')
        .select('last_sync')
        .eq('user_id', user.id)
        .order('last_sync', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows returned

      return { 
        data: { 
          lastSync: data?.last_sync || null,
          status: 'connected'
        }, 
        error: null 
      }
    } catch (error) {
      console.error('Error getting sync status:', error)
      return { data: null, error: error.message }
    }
  },

  // Force full sync
  async forceFullSync() {
    return supabase.from('sync').upsert({}).select()
  },

  // Get pending sync operations
  async getPendingSyncOperations() {
    return supabase.from('sync').select('*')
  },

  // Mark sync operation as completed
  async markSyncOperationCompleted(operationId) {
    return supabase.from('sync').update({ completed: true }).eq('id', operationId).select()
  },

  // Get conflict resolution data
  async getConflicts() {
    return supabase.from('sync_conflicts').select('*')
  },

  // Resolve sync conflict
  async resolveConflict(conflictId, resolution) {
    return supabase.from('sync_conflicts').update({ resolution }).eq('id', conflictId).select()
  },

  // Register device for sync
  async registerDevice(deviceInfo) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('user_devices')
        .upsert({
          user_id: user.id,
          device_id: deviceInfo.device_id,
          device_type: deviceInfo.device_type,
          device_name: deviceInfo.device_name,
          push_token: deviceInfo.push_token,
          last_sync: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error registering device:', error)
      return { data: null, error: error.message }
    }
  },

  // Unregister device
  async unregisterDevice(deviceId) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('user_devices')
        .delete()
        .eq('user_id', user.id)
        .eq('device_id', deviceId)

      if (error) throw error
      return { data: true, error: null }
    } catch (error) {
      console.error('Error unregistering device:', error)
      return { data: null, error: error.message }
    }
  },

  // Get device sync history
  async getDeviceSyncHistory(deviceId, limit = 50) {
    return supabase.from('user_devices').select('*').eq('device_id', deviceId).order('last_sync', { ascending: false }).limit(limit)
  }
}

// Real-time service for Supabase subscriptions
export const realTimeService = {
  // Store active subscriptions
  subscriptions: new Map(),

  // Subscribe to patient changes
  subscribeToPatient(patientId, callback) {
    const channel = supabase
      .channel(`patient:${patientId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'api',
          table: 'patients',
          filter: `id=eq.${patientId}`
        },
        callback
      )
      .subscribe()

    this.subscriptions.set(`patient:${patientId}`, channel)

    // Return unsubscribe function
    return () => this.unsubscribe(`patient:${patientId}`)
  },

  // Subscribe to dose changes
  subscribeToDoses(patientId, callback) {
    const channel = supabase
      .channel(`doses:${patientId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'api',
          table: 'doses',
          filter: `medication_id=in.(select id from medications where patient_id=eq.${patientId})`
        },
        callback
      )
      .subscribe()

    this.subscriptions.set(`doses:${patientId}`, channel)

    return () => this.unsubscribe(`doses:${patientId}`)
  },

  // Subscribe to notifications
  subscribeToNotifications(userId, callback) {
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'api',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe()

    this.subscriptions.set(`notifications:${userId}`, channel)

    return () => this.unsubscribe(`notifications:${userId}`)
  },

  // Subscribe to caregiver activity
  subscribeToCaregiverActivity(patientId, callback) {
    const channel = supabase
      .channel(`caregiver_activity:${patientId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'api',
          table: 'patient_caregivers',
          filter: `patient_id=eq.${patientId}`
        },
        callback
      )
      .subscribe()

    this.subscriptions.set(`caregiver_activity:${patientId}`, channel)

    return () => this.unsubscribe(`caregiver_activity:${patientId}`)
  },

  // Subscribe to measurements
  subscribeToMeasurements(patientId, callback) {
    const channel = supabase
      .channel(`measurements:${patientId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'api',
          table: 'measurements',
          filter: `patient_id=eq.${patientId}`
        },
        callback
      )
      .subscribe()

    this.subscriptions.set(`measurements:${patientId}`, channel)

    return () => this.unsubscribe(`measurements:${patientId}`)
  },

  // Subscribe to daily logs
  subscribeToDailyLogs(patientId, callback) {
    const channel = supabase
      .channel(`daily_logs:${patientId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'api',
          table: 'daily_logs',
          filter: `patient_id=eq.${patientId}`
        },
        callback
      )
      .subscribe()

    this.subscriptions.set(`daily_logs:${patientId}`, channel)

    return () => this.unsubscribe(`daily_logs:${patientId}`)
  },

  // Unsubscribe from channel
  unsubscribe(channelName) {
    const channel = this.subscriptions.get(channelName)
    if (channel) {
      supabase.removeChannel(channel)
      this.subscriptions.delete(channelName)
    }
  },

  // Unsubscribe from all channels
  unsubscribeAll() {
    this.subscriptions.forEach((channel, channelName) => {
      supabase.removeChannel(channel)
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
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('user_devices')
        .upsert({
          user_id: user.id,
          device_id: deviceInfo.device_id,
          device_type: deviceInfo.device_type,
          device_name: deviceInfo.device_name,
          push_token: deviceInfo.push_token,
          is_active: true
        })
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error registering device:', error)
      return { data: null, error: error.message }
    }
  },

  // Update device token (for push notifications)
  async updateDeviceToken(deviceId, token) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('user_devices')
        .update({ push_token: token })
        .eq('user_id', user.id)
        .eq('device_id', deviceId)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error updating device token:', error)
      return { data: null, error: error.message }
    }
  },

  // Unregister device
  async unregisterDevice(deviceId) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('user_devices')
        .update({ is_active: false })
        .eq('user_id', user.id)
        .eq('device_id', deviceId)

      if (error) throw error
      return { data: true, error: null }
    } catch (error) {
      console.error('Error unregistering device:', error)
      return { data: null, error: error.message }
    }
  },

  // Get device info
  async getDeviceInfo(deviceId) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('user_devices')
        .select('*')
        .eq('user_id', user.id)
        .eq('device_id', deviceId)
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error getting device info:', error)
      return { data: null, error: error.message }
    }
  },

  // Get user devices
  async getUserDevices() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('user_devices')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error getting user devices:', error)
      return { data: null, error: error.message }
    }
  },

  // Update device settings
  async updateDeviceSettings(deviceId, settings) {
    return supabase.from('user_devices').update(settings).eq('device_id', deviceId).select()
  }
}

export default syncService 