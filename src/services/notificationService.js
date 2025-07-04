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
    console.warn('createNotification: not implemented for client')
    return { data: null, error: 'Not implemented' }
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
    console.warn('markAllAsRead: backend endpoint pending')
    return { data: null, error: 'Not implemented' }
  },

  // Delete a notification
  async deleteNotification(notificationId) {
    console.warn('deleteNotification: not implemented')
    return { data: null, error: 'Not implemented' }
  },

  // Bulk delete notifications
  async bulkDeleteNotifications(notificationIds) {
    console.warn('bulkDeleteNotifications: not implemented')
    return { data: null, error: 'Not implemented' }
  },

  // Get unread notification count
  async getUnreadCount() {
    console.warn('getUnreadCount: backend endpoint pending')
    return { data: 0, error: 'Not implemented' }
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
  async subscribeToPush() {
    console.warn('subscribeToPush: not implemented')
    return { data: null, error: 'Not implemented' }
  },

  // Unsubscribe from push notifications
  async unsubscribeFromPush() {
    console.warn('unsubscribeFromPush: not implemented')
    return { data: null, error: 'Not implemented' }
  },

  // Send push notification
  async sendPushNotification() {
    console.warn('sendPushNotification: not implemented')
    return { data: null, error: 'Not implemented' }
  },

  // Send bulk push notifications
  async sendBulkPushNotifications() {
    console.warn('sendBulkPushNotifications: not implemented')
    return { data: null, error: 'Not implemented' }
  },

  // Schedule notification
  async scheduleNotification() {
    console.warn('scheduleNotification: not implemented')
    return { data: null, error: 'Not implemented' }
  },

  // Cancel scheduled notification
  async cancelScheduledNotification() {
    console.warn('cancelScheduledNotification: not implemented')
    return { data: null, error: 'Not implemented' }
  },

  // Test notification
  async testNotification() {
    console.warn('testNotification: not implemented')
    return { data: null, error: 'Not implemented' }
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