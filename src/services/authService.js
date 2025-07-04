// Authentication service
import apiClient, { setAuthToken, clearAuthToken } from './api'

// Helper to persist and propagate JWT & refresh tokens
const handleToken = (token, refreshToken = null) => {
  if (token) {
    setAuthToken(token)
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken)
    }
  } else {
    clearAuthToken()
    localStorage.removeItem('refresh_token')
  }
}

export const authService = {
  // Sign up via backend
  async signUp(email, password, userData = {}) {
    try {
      const payload = {
        email,
        password,
        name: userData.fullName || userData.name,
      }

      const response = await apiClient.post('/auth/register', payload)

      // Backend may return token immediately or require verification
      if (response.token) {
        handleToken(response.token, response.refreshToken)
      }

      return {
        success: true,
        data: response,
        message: response.requiresVerification
          ? 'Please check your email to confirm your account.'
          : 'Account created successfully!'
      }
    } catch (error) {
      console.error('Sign up error:', error)
      return {
        success: false,
        error: error.message || error
      }
    }
  },

  // Sign in with email and password
  async signIn(email, password) {
    try {
      const response = await apiClient.post('/auth/login', { email, password })

      if (response.token) {
        handleToken(response.token, response.refreshToken)
      }

      return {
        success: true,
        data: response
      }
    } catch (error) {
      console.error('Sign in error:', error)
      return {
        success: false,
        error: error.message || error
      }
    }
  },

  // Sign out
  async signOut() {
    try {
      await apiClient.post('/auth/logout')
      handleToken(null)
      return { success: true }
    } catch (error) {
      console.error('Sign out error:', error)
      return { success: false, error: error.message || error }
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const data = await apiClient.get('/auth/profile')
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message || error }
    }
  },

  // Get current session
  async getCurrentSession() {
    // On our backend, we rely solely on JWT; return user profile if still valid
    return this.getCurrentUser()
  },

  // Reset password
  async resetPassword(email) {
    try {
      await apiClient.post('/auth/reset-password', { email })
      return { success: true, message: 'Password reset email sent. Please check your inbox.' }
    } catch (error) {
      return { success: false, error: error.message || error }
    }
  },

  // Update password
  async updatePassword(newPassword) {
    try {
      await apiClient.post('/auth/update-password', { password: newPassword })
      return { success: true, message: 'Password updated successfully' }
    } catch (error) {
      return { success: false, error: error.message || error }
    }
  },

  // Update user profile
  async updateProfile(updates) {
    try {
      const data = await apiClient.put('/auth/profile', updates)
      return { success: true, data, message: 'Profile updated successfully' }
    } catch (error) {
      return { success: false, error: error.message || error }
    }
  },

  // Listen to auth state changes
  onAuthStateChange(callback) {
    console.warn('[authService] onAuthStateChange is deprecated with the new backend auth flow.')
    return { data: null, error: null }
  },

  // Refresh session
  async refreshSession(refreshToken) {
    try {
      const data = await apiClient.post('/auth/refresh', { refreshToken })
      if (data.token) handleToken(data.token, data.refreshToken)
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message || error }
    }
  },

  async verifyEmail(token) {
    try {
      await apiClient.post('/auth/verify-email', { token })
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message || error }
    }
  }
}

export default authService 