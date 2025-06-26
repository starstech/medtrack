// Comprehensive Test Setup for MedTrack
// This file sets up the testing environment for ALL tests

import { vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock Supabase
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signUp: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(),
      getSession: vi.fn(),
      getUser: vi.fn(),
      updateUser: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      verifyOtp: vi.fn()
    },
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
      not: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      and: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockReturnThis(),
      then: vi.fn().mockReturnThis()
    })),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(),
        download: vi.fn(),
        remove: vi.fn(),
        list: vi.fn(),
        createSignedUrl: vi.fn(),
        getPublicUrl: vi.fn()
      }))
    },
    rpc: vi.fn(),
    functions: {
      invoke: vi.fn()
    }
  }))
}))

// Mock Ant Design
vi.mock('antd', async () => {
  const actual = await vi.importActual('antd')
  return {
    ...actual,
    message: {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
      info: vi.fn(),
      loading: vi.fn()
    },
    notification: {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
      info: vi.fn()
    },
    Modal: {
      ...actual.Modal,
      confirm: vi.fn(),
      warning: vi.fn(),
      info: vi.fn(),
      success: vi.fn(),
      error: vi.fn()
    }
  }
})

// Mock antd-phone-input
vi.mock('antd-phone-input', () => ({
  default: vi.fn(({ value, onChange, ...props }) => {
    return {
      type: 'input',
      value,
      onChange,
      ...props,
      'data-testid': 'phone-input'
    }
  })
}))

// Mock React Router
vi.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => children,
  Routes: ({ children }) => children,
  Route: ({ children }) => children,
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: '/', search: '', hash: '', state: null }),
  useParams: () => ({}),
  Link: ({ children, to }) => ({ type: 'a', href: to, children }),
  NavLink: ({ children, to }) => ({ type: 'a', href: to, children }),
  Outlet: () => null,
  Navigate: ({ to }) => ({ type: 'div', 'data-testid': 'navigate', to })
}))

// Mock React Hook Form
vi.mock('react-hook-form', () => ({
  useForm: vi.fn(() => ({
    register: vi.fn(),
    handleSubmit: vi.fn((fn) => fn),
    watch: vi.fn(),
    setValue: vi.fn(),
    getValues: vi.fn(),
    reset: vi.fn(),
    formState: {
      errors: {},
      isSubmitting: false,
      isValid: true,
      isDirty: false,
      touchedFields: {},
      dirtyFields: {}
    },
    control: {}
  })),
  Controller: ({ render }) => render({ field: { onChange: vi.fn(), value: '' } })
}))

// Mock date-fns
vi.mock('date-fns', () => ({
  format: vi.fn((date, format) => '2024-01-01'),
  parseISO: vi.fn((date) => new Date(date)),
  isToday: vi.fn(() => true),
  isYesterday: vi.fn(() => false),
  isTomorrow: vi.fn(() => false),
  addDays: vi.fn((date, days) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000)),
  subDays: vi.fn((date, days) => new Date(date.getTime() - days * 24 * 60 * 60 * 1000)),
  startOfDay: vi.fn((date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())),
  endOfDay: vi.fn((date) => new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999)),
  startOfWeek: vi.fn((date) => new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay())),
  endOfWeek: vi.fn((date) => new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() + 6)),
  startOfMonth: vi.fn((date) => new Date(date.getFullYear(), date.getMonth(), 1)),
  endOfMonth: vi.fn((date) => new Date(date.getFullYear(), date.getMonth() + 1, 0)),
  differenceInDays: vi.fn(() => 0),
  differenceInHours: vi.fn(() => 0),
  differenceInMinutes: vi.fn(() => 0),
  isSameDay: vi.fn(() => true),
  isSameMonth: vi.fn(() => true),
  isSameYear: vi.fn(() => true)
}))

// Mock React Query
vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(() => ({
    data: null,
    isLoading: false,
    error: null,
    refetch: vi.fn()
  })),
  useMutation: vi.fn(() => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    isLoading: false,
    error: null,
    data: null,
    reset: vi.fn()
  })),
  useQueryClient: vi.fn(() => ({
    invalidateQueries: vi.fn(),
    setQueryData: vi.fn(),
    getQueryData: vi.fn(),
    removeQueries: vi.fn()
  }))
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  key: vi.fn(),
  length: 0
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  key: vi.fn(),
  length: 0
}
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock
})

// Mock fetch
global.fetch = vi.fn()

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}))

// Mock ResizeObserver
global.ResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}))

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
})

// Mock navigator
Object.defineProperty(navigator, 'language', {
  value: 'en-US',
  configurable: true
})

Object.defineProperty(navigator, 'languages', {
  value: ['en-US', 'en'],
  configurable: true
})

Object.defineProperty(navigator, 'userAgent', {
  value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  configurable: true
})

// Mock Intl
global.Intl = {
  DateTimeFormat: vi.fn(() => ({
    format: vi.fn(() => '1/1/2024')
  })),
  NumberFormat: vi.fn(() => ({
    format: vi.fn(() => '1,234.56')
  }))
}

// Mock console methods to reduce noise in tests
const originalConsole = { ...console }
beforeAll(() => {
  console.log = vi.fn()
  console.warn = vi.fn()
  console.error = vi.fn()
})

afterAll(() => {
  console.log = originalConsole.log
  console.warn = originalConsole.warn
  console.error = originalConsole.error
})

// Cleanup after each test
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  localStorageMock.clear()
  sessionStorageMock.clear()
})

// Global test utilities
global.testUtils = {
  // Mock data generators
  createMockUser: (overrides = {}) => ({
    id: 'test-user-id',
    email: 'test@example.com',
    full_name: 'Test User',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    ...overrides
  }),

  createMockPatient: (overrides = {}) => ({
    id: 'test-patient-id',
    name: 'Test Patient',
    date_of_birth: '1990-01-01',
    gender: 'male',
    emergency_contact: {
      name: 'Emergency Contact',
      phone: '+1234567890',
      relationship: 'parent',
      email: 'emergency@example.com'
    },
    created_by: 'test-user-id',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    ...overrides
  }),

  createMockMedication: (overrides = {}) => ({
    id: 'test-medication-id',
    name: 'Test Medication',
    dosage: '10mg',
    frequency: 'daily',
    instructions: 'Take with food',
    patient_id: 'test-patient-id',
    created_by: 'test-user-id',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    ...overrides
  }),

  createMockDose: (overrides = {}) => ({
    id: 'test-dose-id',
    medication_id: 'test-medication-id',
    patient_id: 'test-patient-id',
    scheduled_time: '2024-01-01T08:00:00Z',
    taken_time: null,
    status: 'scheduled',
    notes: '',
    created_by: 'test-user-id',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    ...overrides
  }),

  // Mock Supabase responses
  mockSupabaseResponse: (data = null, error = null) => ({
    data,
    error,
    count: null,
    status: error ? 400 : 200,
    statusText: error ? 'Bad Request' : 'OK'
  }),

  // Mock fetch responses
  mockFetchResponse: (data = null, error = null, status = 200) => {
    if (error) {
      return Promise.reject(new Error(error))
    }
    return Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      statusText: status >= 200 && status < 300 ? 'OK' : 'Error',
      json: () => Promise.resolve(data),
      text: () => Promise.resolve(JSON.stringify(data))
    })
  },

  // Wait for async operations
  waitFor: (ms = 100) => new Promise(resolve => setTimeout(resolve, ms)),

  // Mock file upload
  createMockFile: (name = 'test.jpg', type = 'image/jpeg', size = 1024) => {
    const file = new File(['test content'], name, { type })
    Object.defineProperty(file, 'size', { value: size })
    return file
  }
}

// Export test utilities for use in tests
export { global } 