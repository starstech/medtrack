// Notification service
import apiClient from './api'

export const notificationService = {
  // Get notifications for the current user
  async getNotifications(options = {}) {
    try {
      const data = await apiClient.get('/notifications', options)
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error.message }
    }
  },

  // Get notification by ID
  async getNotification(notificationId) {
    try {
      const { notification } = await apiClient.get(`/notifications/${notificationId}`)
      return { data: notification, error: null }
    } catch (error) {
      return { data: null, error: error.message }
    }
  },

  // Create a new notification (for system use)
  async createNotification(notificationData) {
    try {
      const { notification } = await apiClient.post('/notifications', notificationData)
      return { data: notification, error: null }
    } catch (error) {
      console.error('Error creating notification:', error)
      return { data: null, error: error.message }
    }
  },

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      await apiClient.post(`/notifications/${notificationId}/read`)
      return { data: true, error: null }
    } catch (error) {
      return { data: null, error: error.message }
    }
  },

  // Mark all notifications as read
  async markAllAsRead() {
    try {
      await apiClient.post('/notifications/read-all')
      return { data: true, error: null }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      return { data: null, error: error.message }
    }
  },

  // Delete a notification
  async deleteNotification(notificationId) {
    try {
      await apiClient.delete(`/notifications/${notificationId}`)
      return { data: true, error: null }
    } catch (error) {
      console.error('Error deleting notification:', error)
      return { data: null, error: error.message }
    }
  },

  // Bulk delete notifications
  async bulkDeleteNotifications(notificationIds) {
    try {
      await apiClient.post('/notifications/bulk-delete', { ids: notificationIds })
      return { data: true, error: null }
    } catch (error) {
      console.error('Error bulk deleting notifications:', error)
      return { data: null, error: error.message }
    }
  },

  // Get unread notification count
  async getUnreadCount() {
    try {
      const { count } = await apiClient.get('/notifications/unread-count')
      return { data: count, error: null }
    } catch (error) {
      console.error('Error fetching unread count:', error)
      return { data: null, error: error.message }
    }
  },

  // Get notification preferences
  async getNotificationPreferences() {
    try {
      const { preferences } = await apiClient.get('/notifications/preferences')
      return { data: preferences, error: null }
    } catch (error) {
      return { data: null, error: error.message }
    }
  },

  // Update notification preferences
  async updateNotificationPreferences(preferences) {
    try {
      const { preferences: updated } = await apiClient.post('/notifications/preferences', { preferences })
      return { data: updated, error: null }
    } catch (error) {
      return { data: null, error: error.message }
    }
  },

  // Subscribe to push notifications
  async subscribeToPush(subscription) {
    try {
      const data = await apiClient.post('/push/subscribe', { subscription })
      return { data, error: null }
    } catch (error) {
      console.error('Error subscribing to push:', error)
      return { data: null, error: error.message }
    }
  },

  // Unsubscribe from push notifications
  async unsubscribeFromPush(subscription) {
    try {
      const data = await apiClient.post('/push/unsubscribe', { subscription })
      return { data, error: null }
    } catch (error) {
      console.error('Error unsubscribing from push:', error)
      return { data: null, error: error.message }
    }
  },

  // Send push notification
  async sendPushNotification(notificationData) {
    try {
      const data = await apiClient.post('/push/test', notificationData)
      return { data, error: null }
    } catch (error) {
      console.error('Error sending test push:', error)
      return { data: null, error: error.message }
    }
  },

  // Send bulk push notifications
  async sendBulkPushNotifications(notifications) {
    try {
      const data = await apiClient.post('/push/bulk', { notifications })
      return { data, error: null }
    } catch (error) {
      console.error('Error sending bulk push notifications:', error)
      return { data: null, error: error.message }
    }
  },

  // Schedule notification
  async scheduleNotification(notificationData) {
    try {
      const data = await apiClient.post('/notifications/schedule', notificationData)
      return { data, error: null }
    } catch (error) {
      console.error('Error scheduling notification:', error)
      return { data: null, error: error.message }
    }
  },

  // Cancel scheduled notification
  async cancelScheduledNotification(notificationId) {
    try {
      const data = await apiClient.post(`/notifications/${notificationId}/cancel`)
      return { data, error: null }
    } catch (error) {
      console.error('Error cancelling scheduled notification:', error)
      return { data: null, error: error.message }
    }
  },

  // Test notification
  async testNotification(payload = {}) {
    try {
      const data = await apiClient.post('/push/test', payload)
      return { data, error: null }
    } catch (error) {
      console.error('Error testing notification:', error)
      return { data: null, error: error.message }
    }
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