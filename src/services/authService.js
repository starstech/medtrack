// Authentication service
import apiClient, { setAuthToken, clearAuthToken } from './api'

export const authService = {
  // Register new user
  async register(userData) {
    const response = await apiClient.post('/auth/register', userData)
    if (response.token) {
      setAuthToken(response.token)
    }
    return response
  },

  // Login user
  async login(credentials) {
    const response = await apiClient.post('/auth/login', credentials)
    if (response.token) {
      setAuthToken(response.token)
    }
    return response
  },

  // Logout user
  async logout() {
    try {
      await apiClient.post('/auth/logout')
    } catch (error) {
      // Continue with logout even if API call fails
      console.warn('Logout API call failed:', error)
    } finally {
      clearAuthToken()
    }
  },

  // Refresh authentication token
  async refreshToken() {
    const response = await apiClient.post('/auth/refresh')
    if (response.token) {
      setAuthToken(response.token)
    }
    return response
  },

  // Get current user profile
  async getProfile() {
    return apiClient.get('/auth/profile')
  },

  // Update user profile
  async updateProfile(profileData) {
    return apiClient.put('/auth/profile', profileData)
  },

  // Upload user avatar
  async uploadAvatar(file) {
    return apiClient.uploadFile('/users/upload-avatar', file)
  },

  // Change password
  async changePassword(passwordData) {
    return apiClient.put('/auth/change-password', passwordData)
  },

  // Request password reset
  async requestPasswordReset(email) {
    return apiClient.post('/auth/request-password-reset', { email })
  },

  // Reset password with token
  async resetPassword(resetData) {
    return apiClient.post('/auth/reset-password', resetData)
  },

  // Verify email
  async verifyEmail(token) {
    return apiClient.post('/auth/verify-email', { token })
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('auth_token')
  },

  // Get stored auth token
  getToken() {
    return localStorage.getItem('auth_token')
  }
}

export default authService 