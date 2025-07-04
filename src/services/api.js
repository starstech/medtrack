// Base API configuration and utilities
import { message } from 'antd'

// Base URL for Express backend (defaults to localhost:4000) – can be overridden in env variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'
// If your backend exposes versioned routes (e.g., /v1), set the version via env. Leave blank for unversioned routes.
const API_VERSION = import.meta.env.VITE_API_VERSION || ''

// API Client class
class ApiClient {
  constructor() {
    // Construct base URL gracefully, avoiding double slashes when API_VERSION is empty
    this.baseURL = API_VERSION ? `${API_BASE_URL}/${API_VERSION}` : API_BASE_URL
    this.token = localStorage.getItem('auth_token')

    // Refresh lock & offline flag
    this.isRefreshing = false
    this.refreshPromise = null
    this.isOffline = !navigator.onLine

    // Listen to browser online/offline events
    window.addEventListener('online', () => {
      this.isOffline = false
    })
    window.addEventListener('offline', () => {
      this.isOffline = true
    })
  }

  // Set auth token
  setToken(token) {
    this.token = token
    if (token) {
      localStorage.setItem('auth_token', token)
    } else {
      localStorage.removeItem('auth_token')
    }
  }

  // Get default headers
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    return headers
  }

  // Handle API responses
  async handleResponse(response) {
    if (!response.ok) {
      let error = { message: 'Network error occurred' }
      
      // Try to parse JSON error response, fallback to generic error
      try {
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          error = await response.json()
        } else {
          // If it's not JSON (like HTML 404 page), use status-specific message
          error = { 
            message: `API endpoint not available (${response.status})`
          }
        }
      } catch (parseError) {
        console.warn('Failed to parse error response:', parseError)
        error = { 
          message: `API endpoint not available (${response.status})`
        }
      }
      
      // Handle specific HTTP status codes (but don't show messages for API unavailable)
      switch (response.status) {
        case 401:
          this.setToken(null)
          message.error('Session expired. Please login again.')
          window.location.href = '/login'
          break
        case 403:
          message.error('You do not have permission to perform this action.')
          break
        case 404:
          // Don't show error message for 404 - let the service handle fallback
          console.warn(`API endpoint not found: ${response.url}`)
          break
        case 500:
          message.error('Server error occurred. Please try again later.')
          break
        default:
          // Don't show generic errors - let the service handle them
          console.warn(`API error ${response.status}:`, error.message)
      }
      
      throw new Error(error.message || `HTTP ${response.status}`)
    }

    // Parse successful response
    try {
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        return await response.json()
      } else {
        return await response.text()
      }
    } catch (parseError) {
      console.error('Failed to parse response:', parseError)
      throw new Error('Invalid response format')
    }
  }

  // GET request
  async get(endpoint, params = {}) {
    const url = new URL(`${this.baseURL}${endpoint}`)
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, params[key])
      }
    })

    try {
      const response = await this.fetchWithAuth(url, {
        method: 'GET',
        headers: this.getHeaders(),
      })
      return this.handleResponse(response)
    } catch (error) {
      console.error(`GET ${endpoint} failed:`, error)
      throw error
    }
  }

  // POST request
  async post(endpoint, data = {}) {
    try {
      const response = await this.fetchWithAuth(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      })
      return this.handleResponse(response)
    } catch (error) {
      console.error(`POST ${endpoint} failed:`, error)
      throw error
    }
  }

  // PUT request
  async put(endpoint, data = {}) {
    try {
      const response = await this.fetchWithAuth(`${this.baseURL}${endpoint}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      })
      return this.handleResponse(response)
    } catch (error) {
      console.error(`PUT ${endpoint} failed:`, error)
      throw error
    }
  }

  // PATCH request
  async patch(endpoint, data = {}) {
    try {
      const response = await this.fetchWithAuth(`${this.baseURL}${endpoint}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      })
      return this.handleResponse(response)
    } catch (error) {
      console.error(`PATCH ${endpoint} failed:`, error)
      throw error
    }
  }

  // DELETE request
  async delete(endpoint) {
    try {
      const response = await this.fetchWithAuth(`${this.baseURL}${endpoint}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      })
      return this.handleResponse(response)
    } catch (error) {
      console.error(`DELETE ${endpoint} failed:`, error)
      throw error
    }
  }

  // File upload
  async uploadFile(endpoint, file, additionalData = {}, attempts = 0) {
    const formData = new FormData()
    formData.append('file', file)
    
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key])
    })

    try {
      const headers = {}
      if (this.token) {
        headers.Authorization = `Bearer ${this.token}`
      }

      const response = await this.fetchWithAuth(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData,
      })
      return this.handleResponse(response)
    } catch (error) {
      console.error(`File upload to ${endpoint} failed:`, error)

      // Retry logic for file uploads (up to 2 retries)
      if (!navigator.onLine) this.isOffline = true

      if (attempts < 2) {
        const nextAttempt = attempts + 1
        const delay = 2000 * nextAttempt // exponential backoff
        await new Promise(res => setTimeout(res, delay))
        console.warn(`Retrying upload (${nextAttempt})...`)
        return this.uploadFile(endpoint, file, additionalData, nextAttempt)
      }

      throw error
    }
  }

  // Attempt to refresh JWT token using stored refresh_token. Returns true if successful.
  async refreshTokenIfNeeded() {
    const refreshToken = localStorage.getItem('refresh_token')
    if (!refreshToken) return false

    if (this.isRefreshing) {
      // Wait for ongoing refresh attempt
      try {
        await this.refreshPromise
        return !!this.token // token should be set by handleToken inside authService
      } catch {
        return false
      }
    }

    this.isRefreshing = true
    const { default: authService } = await import('./authService.js')
    this.refreshPromise = authService.refreshSession(refreshToken)

    try {
      const { success } = await this.refreshPromise
      return success
    } finally {
      this.isRefreshing = false
      this.refreshPromise = null
    }
  }

  // Helper to perform fetch with automatic 401 refresh retry (once)
  async fetchWithAuth(url, options, retry = false) {
    try {
      const response = await fetch(url, options)
      if (response.status === 401 && !retry) {
        const refreshed = await this.refreshTokenIfNeeded()
        if (refreshed) {
          // Update Authorization header with new token and retry once
          const newOptions = {
            ...options,
            headers: {
              ...options.headers,
              Authorization: `Bearer ${this.token}`
            }
          }
          return await this.fetchWithAuth(url, newOptions, true)
        }
      }
      return response
    } catch (error) {
      // Detect offline state
      if (!navigator.onLine) {
        this.isOffline = true
      }
      throw error
    }
  }
}

// Create singleton instance
const apiClient = new ApiClient()

export default apiClient

// Export utility functions
export const setAuthToken = (token) => apiClient.setToken(token)
export const clearAuthToken = () => apiClient.setToken(null)

// API Response wrapper for consistent error handling
export const apiCall = async (apiFunction) => {
  try {
    const response = await apiFunction()
    return { data: response, error: null }
  } catch (error) {
    console.error('API call failed:', error)
    return { data: null, error: error.message }
  }
}

// Common API utilities
export const buildQueryString = (params) => {
  const filtered = Object.entries(params).filter(([_, value]) => 
    value !== undefined && value !== null && value !== ''
  )
  return new URLSearchParams(filtered).toString()
}

export const formatApiError = (error) => {
  if (typeof error === 'string') return error
  if (error.message) return error.message
  return 'An unexpected error occurred'
} 