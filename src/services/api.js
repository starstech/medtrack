// Base API configuration and utilities
import { message } from 'antd'

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
const API_VERSION = 'v1'

// API Client class
class ApiClient {
  constructor() {
    this.baseURL = `${API_BASE_URL}/${API_VERSION}`
    this.token = localStorage.getItem('auth_token')
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
      const response = await fetch(url, {
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
      const response = await fetch(`${this.baseURL}${endpoint}`, {
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
      const response = await fetch(`${this.baseURL}${endpoint}`, {
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
      const response = await fetch(`${this.baseURL}${endpoint}`, {
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
      const response = await fetch(`${this.baseURL}${endpoint}`, {
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
  async uploadFile(endpoint, file, additionalData = {}) {
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

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData,
      })
      return this.handleResponse(response)
    } catch (error) {
      console.error(`File upload to ${endpoint} failed:`, error)
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