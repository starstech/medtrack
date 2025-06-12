// Notification service
import { supabase } from '../lib/supabase'

export const notificationService = {
  // Get notifications for the current user
  async getNotifications(options = {}) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (options.read !== undefined) {
        query = query.eq('read', options.read)
      }

      if (options.type) {
        query = query.eq('type', options.type)
      }

      if (options.limit) {
        query = query.limit(options.limit)
      }

      const { data, error } = await query

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching notifications:', error)
      return { data: null, error: error.message }
    }
  },

  // Get notification by ID
  async getNotification(notificationId) {
    return supabase.from('notifications').select('*').eq('id', notificationId).single()
  },

  // Create a new notification (for system use)
  async createNotification(notificationData) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert(notificationData)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error creating notification:', error)
      return { data: null, error: error.message }
    }
  },

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error marking notification as read:', error)
      return { data: null, error: error.message }
    }
  },

  // Mark all notifications as read
  async markAllAsRead() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false)
        .select()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      return { data: null, error: error.message }
    }
  },

  // Delete a notification
  async deleteNotification(notificationId) {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)

      if (error) throw error
      return { data: true, error: null }
    } catch (error) {
      console.error('Error deleting notification:', error)
      return { data: null, error: error.message }
    }
  },

  // Bulk delete notifications
  async bulkDeleteNotifications(notificationIds) {
    return supabase.from('notifications').delete().in('id', notificationIds)
  },

  // Get unread notification count
  async getUnreadCount() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false)

      if (error) throw error
      return { data: count, error: null }
    } catch (error) {
      console.error('Error fetching unread count:', error)
      return { data: 0, error: error.message }
    }
  },

  // Get notification preferences
  async getNotificationPreferences() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching notification preferences:', error)
      return { data: null, error: error.message }
    }
  },

  // Update notification preferences
  async updateNotificationPreferences(preferences) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          ...preferences
        })
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error updating notification preferences:', error)
      return { data: null, error: error.message }
    }
  },

  // Subscribe to push notifications
  async subscribeToPush(subscriptionData) {
    // Implementation needed
    throw new Error('Method not implemented')
  },

  // Unsubscribe from push notifications
  async unsubscribeFromPush(deviceToken) {
    // Implementation needed
    throw new Error('Method not implemented')
  },

  // Send push notification
  async sendPushNotification(notificationData) {
    // Implementation needed
    throw new Error('Method not implemented')
  },

  // Send bulk push notifications
  async sendBulkPushNotifications(notificationData) {
    // Implementation needed
    throw new Error('Method not implemented')
  },

  // Schedule notification
  async scheduleNotification(notificationData) {
    // Implementation needed
    throw new Error('Method not implemented')
  },

  // Cancel scheduled notification
  async cancelScheduledNotification(notificationId) {
    // Implementation needed
    throw new Error('Method not implemented')
  },

  // Test notification
  async testNotification(type) {
    // Implementation needed
    throw new Error('Method not implemented')
  }
}

// Firebase Push Notification utilities
export const pushNotificationUtils = {
  // Request notification permission
  async requestPermission() {
    if (!('Notification' in window)) {
      throw new Error('This browser does not support notifications')
    }

    const permission = await Notification.requestPermission()
    return permission === 'granted'
  },

  // Check if notifications are supported
  isSupported() {
    return 'Notification' in window && 'serviceWorker' in navigator
  },

  // Get permission status
  getPermissionStatus() {
    return Notification.permission
  },

  // Show local notification
  showLocalNotification(title, options = {}) {
    if (Notification.permission === 'granted') {
      return new Notification(title, {
        icon: '/favicon.ico',
        badge: '/notification-badge.png',
        ...options
      })
    }
  }
}

export default notificationService 