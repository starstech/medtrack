import { vi } from 'vitest'
import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'

// =====================================
// SUPABASE MOCK FACTORY
// =====================================

export const createSupabaseMock = () => {
  // Create chainable mock methods
  const createChainableMock = (finalMethod = 'mockResolvedValue') => {
    const chain = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      gt: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lt: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      like: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      contains: vi.fn().mockReturnThis(),
      containedBy: vi.fn().mockReturnThis(),
      rangeGt: vi.fn().mockReturnThis(),
      rangeGte: vi.fn().mockReturnThis(),
      rangeLt: vi.fn().mockReturnThis(),
      rangeLte: vi.fn().mockReturnThis(),
      rangeAdjacent: vi.fn().mockReturnThis(),
      overlaps: vi.fn().mockReturnThis(),
      textSearch: vi.fn().mockReturnThis(),
      match: vi.fn().mockReturnThis(),
      not: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      filter: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockReturnThis(),
      csv: vi.fn().mockReturnThis(),
      geojson: vi.fn().mockReturnThis(),
      explain: vi.fn().mockReturnThis(),
      rollback: vi.fn().mockReturnThis(),
      returns: vi.fn().mockReturnThis(),
    }

    // Add the final method that actually resolves
    if (finalMethod === 'mockResolvedValue') {
      chain.mockResolvedValue = vi.fn()
      chain.then = vi.fn()
    }

    // Make all methods return the chain for chaining
    Object.keys(chain).forEach(key => {
      if (key !== 'mockResolvedValue' && key !== 'then') {
        chain[key].mockReturnValue(chain)
      }
    })

    return chain
  }

  // Auth mock
  const authMock = {
    getUser: vi.fn().mockResolvedValue({
      data: { user: { id: 'test-user-id', email: 'test@example.com' } },
      error: null
    }),
    getSession: vi.fn().mockResolvedValue({
      data: { session: { user: { id: 'test-user-id' } } },
      error: null
    }),
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    resetPasswordForEmail: vi.fn(),
    updateUser: vi.fn(),
    onAuthStateChange: vi.fn(),
    refreshSession: vi.fn()
  }

  // Storage mock
  const storageMock = {
    from: vi.fn().mockReturnValue({
      upload: vi.fn().mockResolvedValue({ data: null, error: null }),
      download: vi.fn().mockResolvedValue({ data: null, error: null }),
      remove: vi.fn().mockResolvedValue({ data: null, error: null }),
      list: vi.fn().mockResolvedValue({ data: [], error: null }),
      getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'test-url' } })
    })
  }

  // Main Supabase mock
  const supabaseMock = {
    from: vi.fn().mockImplementation((table) => createChainableMock()),
    auth: authMock,
    storage: storageMock,
    channel: vi.fn().mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
      unsubscribe: vi.fn().mockReturnThis()
    }),
    removeChannel: vi.fn(),
    removeAllChannels: vi.fn(),
    getChannels: vi.fn().mockReturnValue([])
  }

  return supabaseMock
}

// Helper function to set up mock responses for specific operations
export const setupSupabaseMockResponse = (supabaseMock, operation, response) => {
  const chain = supabaseMock.from()
  
  // Configure the chain based on operation type
  switch (operation) {
    case 'select':
      chain.select().mockResolvedValue(response)
      break
    case 'insert':
      chain.insert().select().single().mockResolvedValue(response)
      break
    case 'update':
      chain.update().eq().select().single().mockResolvedValue(response)
      break
    case 'delete':
      chain.delete().eq().mockResolvedValue(response)
      break
    case 'selectSingle':
      chain.select().eq().single().mockResolvedValue(response)
      break
    case 'selectWithFilter':
      chain.select().eq().order().mockResolvedValue(response)
      break
    case 'search':
      chain.select().ilike().eq().mockResolvedValue(response)
      break
    default:
      chain.mockResolvedValue(response)
  }
  
  return chain
}

// =====================================
// MOCK DATA FACTORIES
// =====================================

export const createMockPatient = (overrides = {}) => ({
  id: 'patient-1',
  first_name: 'John',
  last_name: 'Doe',
  date_of_birth: '1990-01-15',
  phone: '+1234567890',
  email: 'john.doe@example.com',
  emergency_contact: 'Jane Doe +1234567891',
  medical_conditions: ['Diabetes', 'Hypertension'],
  allergies: ['Penicillin'],
  notes: 'Test patient notes',
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  created_by: 'caregiver-1',
  ...overrides
})

export const createMockMedication = (overrides = {}) => ({
  id: 'medication-1',
  patient_id: 'patient-1',
  name: 'Metformin',
  dosage: '500mg',
  frequency: 'Twice daily',
  instructions: 'Take with meals',
  start_date: '2024-01-01',
  end_date: null,
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  created_by: 'caregiver-1',
  ...overrides
})

export const createMockUser = (overrides = {}) => ({
  id: 'user-1',
  email: 'test@example.com',
  full_name: 'Test User',
  phone: '+1234567890',
  role: 'caregiver',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides
})

export const createMockDose = (overrides = {}) => ({
  id: 'dose-1',
  medication_id: 'medication-1',
  scheduled_time: '2024-01-01T08:00:00Z',
  actual_time: null,
  status: 'pending',
  notes: '',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides
})

// =====================================
// TEST UTILITIES
// =====================================

// Mock localStorage
export const mockLocalStorage = () => {
  const store = new Map()
  
  return {
    getItem: vi.fn((key) => store.get(key) || null),
    setItem: vi.fn((key, value) => store.set(key, value)),
    removeItem: vi.fn((key) => store.delete(key)),
    clear: vi.fn(() => store.clear()),
    length: store.size,
    key: vi.fn((index) => Array.from(store.keys())[index] || null)
  }
}

// Mock fetch
export const mockFetch = (responses = []) => {
  const mockResponses = responses.map(response => ({
    ok: response.ok ?? true,
    status: response.status ?? 200,
    json: vi.fn().mockResolvedValue(response.data ?? {}),
    text: vi.fn().mockResolvedValue(response.text ?? ''),
    blob: vi.fn().mockResolvedValue(response.blob ?? new Blob()),
    headers: new Headers(response.headers ?? {}),
    ...response
  }))

  let callCount = 0
  return vi.fn().mockImplementation(() => {
    const response = mockResponses[callCount] || mockResponses[mockResponses.length - 1] || {
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({}),
      text: vi.fn().mockResolvedValue(''),
      blob: vi.fn().mockResolvedValue(new Blob()),
      headers: new Headers()
    }
    callCount++
    return Promise.resolve(response)
  })
}

// Console helpers
export const mockConsole = () => ({
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  debug: vi.fn()
})

// Error simulation helpers
export const simulateNetworkError = () => {
  return new Error('Network request failed')
}

export const simulateAuthError = () => {
  return { data: null, error: { message: 'Authentication required' } }
}

export const simulateValidationError = (field) => {
  return { data: null, error: { message: `Validation error: ${field} is required` } }
}

// Custom matchers
export const customMatchers = {
  toBeValidEmail: (email) => {
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    return {
      pass: isValid,
      message: () => `Expected ${email} to be a valid email address`
    }
  },
  
  toBeValidPhone: (phone) => {
    const isValid = /^\+?[\d\s\-\(\)]+$/.test(phone)
    return {
      pass: isValid,
      message: () => `Expected ${phone} to be a valid phone number`
    }
  },
  
  toBeISODate: (date) => {
    const isValid = !isNaN(Date.parse(date))
    return {
      pass: isValid,
      message: () => `Expected ${date} to be a valid ISO date string`
    }
  }
}

// Helper to setup test environment
export const setupTestEnvironment = () => {
  // Mock localStorage
  const localStorage = mockLocalStorage()
  Object.defineProperty(window, 'localStorage', { value: localStorage })
  
  // Mock console to avoid noise in tests
  const console = mockConsole()
  Object.defineProperty(global, 'console', { value: console })
  
  return { localStorage, console }
}

// Helper to render components with providers
export const renderWithProviders = (component, { providers = [] } = {}) => {
  const AllProviders = ({ children }) => {
    return providers.reduce(
      (acc, Provider) => <Provider>{acc}</Provider>,
      children
    )
  }
  
  return render(<AllProviders>{component}</AllProviders>)
}

// Test data cleanup helper
export const cleanup = () => {
  vi.clearAllMocks()
  vi.resetAllMocks()
}

export default {
  createSupabaseMock,
  setupSupabaseMockResponse,
  createMockPatient,
  createMockMedication,
  createMockUser,
  createMockDose,
  mockLocalStorage,
  mockFetch,
  mockConsole,
  simulateNetworkError,
  simulateAuthError,
  simulateValidationError,
  customMatchers,
  setupTestEnvironment,
  renderWithProviders,
  cleanup
} 