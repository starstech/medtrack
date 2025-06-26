import { vi } from 'vitest'
import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'

// Mock data factories
export const createMockPatient = (overrides = {}) => ({
  id: 'patient-1',
  first_name: 'John',
  last_name: 'Doe',
  date_of_birth: '1990-01-01',
  phone: '+1234567890',
  email: 'john.doe@example.com',
  emergency_contact: '+0987654321',
  medical_conditions: ['Hypertension'],
  allergies: ['Penicillin'],
  caregiver_id: 'caregiver-1',
  active: true,
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
  ...overrides
})

export const createMockMedication = (overrides = {}) => ({
  id: 'medication-1',
  name: 'Aspirin',
  dosage: '100mg',
  frequency: 'Daily',
  patient_id: 'patient-1',
  instructions: 'Take with food',
  active: true,
  start_date: '2024-01-01',
  end_date: null,
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
  ...overrides
})

export const createMockDose = (overrides = {}) => ({
  id: 'dose-1',
  medication_id: 'medication-1',
  patient_id: 'patient-1',
  scheduled_time: '2024-01-15T08:00:00.000Z',
  taken_at: null,
  status: 'pending',
  notes: '',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
  ...overrides
})

export const createMockAppointment = (overrides = {}) => ({
  id: 'appointment-1',
  patient_id: 'patient-1',
  title: 'Annual Checkup',
  date: '2024-02-15',
  time: '10:00',
  doctor: 'Dr. Johnson',
  location: 'Main Clinic',
  notes: '',
  status: 'scheduled',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
  ...overrides
})

export const createMockCaregiver = (overrides = {}) => ({
  id: 'caregiver-1',
  first_name: 'Jane',
  last_name: 'Smith',
  email: 'jane.smith@example.com',
  phone: '+1987654321',
  role: 'primary',
  active: true,
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
  ...overrides
})

// Mock API responses
export const createMockApiResponse = (data, error = null) => ({
  data,
  error,
  status: error ? 'error' : 'success'
})

export const createMockSupabaseResponse = (data, error = null) => ({
  data: error ? null : data,
  error: error ? { message: error } : null
})

// Supabase mock helpers
export const createMockSupabaseClient = () => ({
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    gt: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    like: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    single: vi.fn(),
    or: vi.fn().mockReturnThis(),
    and: vi.fn().mockReturnThis()
  })),
  auth: {
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    resetPasswordForEmail: vi.fn(),
    getUser: vi.fn(),
    getSession: vi.fn(),
    onAuthStateChange: vi.fn()
  },
  storage: {
    from: vi.fn(() => ({
      upload: vi.fn(),
      download: vi.fn(),
      remove: vi.fn(),
      getPublicUrl: vi.fn()
    }))
  }
})

// React Testing Library helpers
export const renderWithRouter = (component, { route = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route)
  
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

export const renderWithProviders = (component, { providers = [] } = {}) => {
  const AllProviders = ({ children }) => {
    return providers.reduceRight(
      (acc, Provider) => <Provider>{acc}</Provider>,
      children
    )
  }

  return render(<AllProviders>{component}</AllProviders>)
}

// Date helpers for testing
export const mockDate = (dateString) => {
  const mockDate = new Date(dateString)
  vi.setSystemTime(mockDate)
  return mockDate
}

export const restoreDate = () => {
  vi.useRealTimers()
}

// Common test utilities
export const waitForElement = async (element) => {
  return new Promise((resolve) => {
    const observer = new MutationObserver(() => {
      if (element) {
        observer.disconnect()
        resolve(element)
      }
    })
    observer.observe(document.body, { childList: true, subtree: true })
  })
}

export const createFormData = (data) => {
  const formData = new FormData()
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value)
  })
  return formData
}

// Custom matchers
export const customMatchers = {
  toBeValidPhoneNumber: (received) => {
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/
    const pass = phoneRegex.test(received)
    
    return {
      message: () => 
        pass
          ? `expected ${received} not to be a valid phone number`
          : `expected ${received} to be a valid phone number`,
      pass
    }
  },

  toBeValidEmail: (received) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const pass = emailRegex.test(received)
    
    return {
      message: () =>
        pass
          ? `expected ${received} not to be a valid email`
          : `expected ${received} to be a valid email`,
      pass
    }
  },

  toBeValidDate: (received) => {
    const date = new Date(received)
    const pass = !isNaN(date.getTime())
    
    return {
      message: () =>
        pass
          ? `expected ${received} not to be a valid date`
          : `expected ${received} to be a valid date`,
      pass
    }
  }
}

// Error simulation helpers
export const simulateNetworkError = () => {
  return Promise.reject(new Error('Network Error'))
}

export const simulateValidationError = (field) => {
  return Promise.reject(new Error(`Validation error: ${field} is required`))
}

export const simulatePermissionError = () => {
  return Promise.reject(new Error('Permission denied'))
}

// Mock localStorage
export const createMockLocalStorage = () => {
  let store = {}
  
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString()
    }),
    removeItem: vi.fn((key) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
    key: vi.fn((index) => {
      const keys = Object.keys(store)
      return keys[index] || null
    }),
    get length() {
      return Object.keys(store).length
    }
  }
}

// Console helpers for testing
export const mockConsole = () => {
  const originalConsole = global.console
  global.console = {
    ...originalConsole,
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn()
  }
  
  return {
    restore: () => {
      global.console = originalConsole
    },
    getLogs: () => global.console.log.mock.calls,
    getWarnings: () => global.console.warn.mock.calls,
    getErrors: () => global.console.error.mock.calls
  }
}

// Async testing helpers
export const flushPromises = () => {
  return new Promise(setImmediate)
}

export const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms))
} 