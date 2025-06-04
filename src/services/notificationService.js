// Notification service
import apiClient from './api'

export const notificationService = {
  // Get all notifications for current user
  async getNotifications(filters = {}) {
    return apiClient.get('/notifications', filters)
  },

  // Get notification by ID
  async getNotification(notificationId) {
    return apiClient.get(`/notifications/${notificationId}`)
  },

  // Create new notification
  async createNotification(notificationData) {
    return apiClient.post('/notifications', notificationData)
  },

  // Mark notification as read
  async markAsRead(notificationId) {
    return apiClient.put(`/notifications/${notificationId}/read`)
  },

  // Mark all notifications as read
  async markAllAsRead() {
    return apiClient.put('/notifications/mark-all-read')
  },

  // Delete notification
  async deleteNotification(notificationId) {
    return apiClient.delete(`/notifications/${notificationId}`)
  },

  // Bulk delete notifications
  async bulkDeleteNotifications(notificationIds) {
    return apiClient.post('/notifications/bulk-delete', { notificationIds })
  },

  // Get notification preferences
  async getNotificationPreferences(userId) {
    return apiClient.get(`/users/${userId}/notification-preferences`)
  },

  // Update notification preferences
  async updateNotificationPreferences(userId, preferences) {
    return apiClient.put(`/users/${userId}/notification-preferences`, preferences)
  },

  // Subscribe to push notifications
  async subscribeToPush(subscriptionData) {
    return apiClient.post('/notifications/subscribe', subscriptionData)
  },

  // Unsubscribe from push notifications
  async unsubscribeFromPush(deviceToken) {
    return apiClient.post('/notifications/unsubscribe', { deviceToken })
  },

  // Send push notification
  async sendPushNotification(notificationData) {
    return apiClient.post('/notifications/send', notificationData)
  },

  // Send bulk push notifications
  async sendBulkPushNotifications(notificationData) {
    return apiClient.post('/notifications/send-bulk', notificationData)
  },

  // Schedule notification
  async scheduleNotification(notificationData) {
    return apiClient.post('/notifications/schedule', notificationData)
  },

  // Cancel scheduled notification
  async cancelScheduledNotification(notificationId) {
    return apiClient.delete(`/notifications/scheduled/${notificationId}`)
  },

  // Get unread count
  async getUnreadCount() {
    return apiClient.get('/notifications/unread-count')
  },

  // Test notification
  async testNotification(type) {
    return apiClient.post('/notifications/test', { type })
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