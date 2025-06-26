import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as authService from '@/services/authService'
import { supabase } from '@/services/api'

// Mock supabase
vi.mock('@/services/api', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      verifyOtp: vi.fn(),
      updateUser: vi.fn(),
      getSession: vi.fn(),
      getUser: vi.fn(),
      onAuthStateChange: vi.fn(),
      refreshSession: vi.fn()
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn()
    }))
  }
}))

describe('authService', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    user_metadata: {
      full_name: 'Test User'
    },
    created_at: '2024-01-01T00:00:00.000Z'
  }

  const mockSession = {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    expires_in: 3600,
    user: mockUser
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('signUp', () => {
    it('signs up user successfully', async () => {
      supabase.auth.signUp.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null
      })

      const result = await authService.signUp('test@example.com', 'password123', {
        firstName: 'Test',
        lastName: 'User',
        phone: '+1234567890'
      })

      expect(result.success).toBe(true)
      expect(result.data.user).toEqual(mockUser)
      expect(result.data.session).toEqual(mockSession)
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          data: {
            first_name: 'Test',
            last_name: 'User',
            full_name: 'Test User',
            phone: '+1234567890'
          }
        }
      })
    })

    it('handles signup errors', async () => {
      const error = { message: 'Email already registered' }
      supabase.auth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error
      })

      const result = await authService.signUp('test@example.com', 'password123', {})

      expect(result.success).toBe(false)
      expect(result.error).toBe('Email already registered')
    })

    it('validates email format', async () => {
      const result = await authService.signUp('invalid-email', 'password123', {})

      expect(result.success).toBe(false)
      expect(result.error).toContain('valid email')
    })

    it('validates password strength', async () => {
      const result = await authService.signUp('test@example.com', '123', {})

      expect(result.success).toBe(false)
      expect(result.error).toContain('password')
    })

    it('validates required fields', async () => {
      const result = await authService.signUp('test@example.com', 'password123', {
        firstName: '',
        lastName: ''
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('required')
    })

    it('handles network errors', async () => {
      supabase.auth.signUp.mockRejectedValue(new Error('Network error'))

      const result = await authService.signUp('test@example.com', 'password123', {})

      expect(result.success).toBe(false)
      expect(result.error).toContain('Network error')
    })
  })

  describe('signIn', () => {
    it('signs in user successfully', async () => {
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null
      })

      const result = await authService.signIn('test@example.com', 'password123')

      expect(result.success).toBe(true)
      expect(result.data.user).toEqual(mockUser)
      expect(result.data.session).toEqual(mockSession)
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      })
    })

    it('handles invalid credentials', async () => {
      const error = { message: 'Invalid login credentials' }
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error
      })

      const result = await authService.signIn('test@example.com', 'wrongpassword')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid login credentials')
    })

    it('validates email format', async () => {
      const result = await authService.signIn('invalid-email', 'password123')

      expect(result.success).toBe(false)
      expect(result.error).toContain('valid email')
    })

    it('validates required fields', async () => {
      const result = await authService.signIn('', '')

      expect(result.success).toBe(false)
      expect(result.error).toContain('required')
    })

    it('handles network errors', async () => {
      supabase.auth.signInWithPassword.mockRejectedValue(new Error('Network error'))

      const result = await authService.signIn('test@example.com', 'password123')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Network error')
    })
  })

  describe('signOut', () => {
    it('signs out successfully', async () => {
      supabase.auth.signOut.mockResolvedValue({ error: null })

      const result = await authService.signOut()

      expect(result.success).toBe(true)
      expect(supabase.auth.signOut).toHaveBeenCalled()
    })

    it('handles signout errors', async () => {
      const error = { message: 'Signout failed' }
      supabase.auth.signOut.mockResolvedValue({ error })

      const result = await authService.signOut()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Signout failed')
    })

    it('handles network errors during signout', async () => {
      supabase.auth.signOut.mockRejectedValue(new Error('Network error'))

      const result = await authService.signOut()

      expect(result.success).toBe(false)
      expect(result.error).toContain('Network error')
    })
  })

  describe('resetPassword', () => {
    it('sends reset email successfully', async () => {
      supabase.auth.resetPasswordForEmail.mockResolvedValue({ error: null })

      const result = await authService.resetPassword('test@example.com')

      expect(result.success).toBe(true)
      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        { redirectTo: expect.stringContaining('/reset-password') }
      )
    })

    it('handles reset email errors', async () => {
      const error = { message: 'User not found' }
      supabase.auth.resetPasswordForEmail.mockResolvedValue({ error })

      const result = await authService.resetPassword('test@example.com')

      expect(result.success).toBe(false)
      expect(result.error).toBe('User not found')
    })

    it('validates email format', async () => {
      const result = await authService.resetPassword('invalid-email')

      expect(result.success).toBe(false)
      expect(result.error).toContain('valid email')
    })

    it('validates required email', async () => {
      const result = await authService.resetPassword('')

      expect(result.success).toBe(false)
      expect(result.error).toContain('required')
    })
  })

  describe('verifyOtp', () => {
    it('verifies OTP successfully', async () => {
      supabase.auth.verifyOtp.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null
      })

      const result = await authService.verifyOtp('test@example.com', '123456', 'signup')

      expect(result.success).toBe(true)
      expect(result.data.user).toEqual(mockUser)
      expect(supabase.auth.verifyOtp).toHaveBeenCalledWith({
        email: 'test@example.com',
        token: '123456',
        type: 'signup'
      })
    })

    it('handles invalid OTP', async () => {
      const error = { message: 'Invalid OTP' }
      supabase.auth.verifyOtp.mockResolvedValue({
        data: { user: null, session: null },
        error
      })

      const result = await authService.verifyOtp('test@example.com', '000000', 'signup')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid OTP')
    })

    it('validates OTP format', async () => {
      const result = await authService.verifyOtp('test@example.com', '123', 'signup')

      expect(result.success).toBe(false)
      expect(result.error).toContain('6 digits')
    })

    it('validates required fields', async () => {
      const result = await authService.verifyOtp('', '', 'signup')

      expect(result.success).toBe(false)
      expect(result.error).toContain('required')
    })
  })

  describe('updateUser', () => {
    it('updates user successfully', async () => {
      const updates = { data: { first_name: 'Updated Name' } }
      supabase.auth.updateUser.mockResolvedValue({
        data: { user: { ...mockUser, user_metadata: updates.data } },
        error: null
      })

      const result = await authService.updateUser(updates)

      expect(result.success).toBe(true)
      expect(result.data.user.user_metadata.first_name).toBe('Updated Name')
      expect(supabase.auth.updateUser).toHaveBeenCalledWith(updates)
    })

    it('handles update errors', async () => {
      const error = { message: 'Update failed' }
      supabase.auth.updateUser.mockResolvedValue({
        data: { user: null },
        error
      })

      const result = await authService.updateUser({ data: { first_name: 'Test' } })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Update failed')
    })

    it('validates update data', async () => {
      const result = await authService.updateUser({})

      expect(result.success).toBe(false)
      expect(result.error).toContain('update data')
    })
  })

  describe('getSession', () => {
    it('gets current session successfully', async () => {
      supabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null
      })

      const result = await authService.getSession()

      expect(result.success).toBe(true)
      expect(result.data.session).toEqual(mockSession)
    })

    it('handles no session', async () => {
      supabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null
      })

      const result = await authService.getSession()

      expect(result.success).toBe(true)
      expect(result.data.session).toBeNull()
    })

    it('handles session errors', async () => {
      const error = { message: 'Session error' }
      supabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error
      })

      const result = await authService.getSession()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Session error')
    })
  })

  describe('getUser', () => {
    it('gets current user successfully', async () => {
      supabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      const result = await authService.getUser()

      expect(result.success).toBe(true)
      expect(result.data.user).toEqual(mockUser)
    })

    it('handles no user', async () => {
      supabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null
      })

      const result = await authService.getUser()

      expect(result.success).toBe(true)
      expect(result.data.user).toBeNull()
    })

    it('handles user errors', async () => {
      const error = { message: 'User error' }
      supabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error
      })

      const result = await authService.getUser()

      expect(result.success).toBe(false)
      expect(result.error).toBe('User error')
    })
  })

  describe('onAuthStateChange', () => {
    it('sets up auth state change listener', () => {
      const callback = vi.fn()
      supabase.auth.onAuthStateChange.mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } }
      })

      const result = authService.onAuthStateChange(callback)

      expect(supabase.auth.onAuthStateChange).toHaveBeenCalledWith(callback)
      expect(result.data.subscription).toBeDefined()
    })

    it('handles callback errors', () => {
      const callback = vi.fn()
      const error = new Error('Callback setup failed')
      supabase.auth.onAuthStateChange.mockImplementation(() => {
        throw error
      })

      const result = authService.onAuthStateChange(callback)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Callback setup failed')
    })
  })

  describe('refreshSession', () => {
    it('refreshes session successfully', async () => {
      const newSession = { ...mockSession, access_token: 'new-token' }
      supabase.auth.refreshSession.mockResolvedValue({
        data: { session: newSession, user: mockUser },
        error: null
      })

      const result = await authService.refreshSession()

      expect(result.success).toBe(true)
      expect(result.data.session.access_token).toBe('new-token')
    })

    it('handles refresh errors', async () => {
      const error = { message: 'Refresh failed' }
      supabase.auth.refreshSession.mockResolvedValue({
        data: { session: null, user: null },
        error
      })

      const result = await authService.refreshSession()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Refresh failed')
    })
  })

  describe('Error Handling', () => {
    it('handles unexpected errors gracefully', async () => {
      supabase.auth.signInWithPassword.mockImplementation(() => {
        throw new Error('Unexpected error')
      })

      const result = await authService.signIn('test@example.com', 'password123')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Unexpected error')
    })

    it('handles null/undefined responses', async () => {
      supabase.auth.signInWithPassword.mockResolvedValue(null)

      const result = await authService.signIn('test@example.com', 'password123')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Unexpected response')
    })

    it('handles missing error messages', async () => {
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: {}
      })

      const result = await authService.signIn('test@example.com', 'password123')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Unknown error')
    })
  })

  describe('Validation Helpers', () => {
    it('validates email formats correctly', () => {
      const validEmails = [
        'test@example.com',
        'user+tag@domain.co.uk',
        'valid.email@test-domain.org'
      ]

      const invalidEmails = [
        'invalid-email',
        '@domain.com',
        'user@',
        'user space@domain.com'
      ]

      validEmails.forEach(email => {
        expect(authService.validateEmail(email)).toBe(true)
      })

      invalidEmails.forEach(email => {
        expect(authService.validateEmail(email)).toBe(false)
      })
    })

    it('validates password strength', () => {
      const strongPasswords = [
        'StrongPass123!',
        'Complex$Password1',
        'ValidP@ssw0rd'
      ]

      const weakPasswords = [
        '123',
        'password',
        'weak',
        '12345678'
      ]

      strongPasswords.forEach(password => {
        expect(authService.validatePassword(password)).toBe(true)
      })

      weakPasswords.forEach(password => {
        expect(authService.validatePassword(password)).toBe(false)
      })
    })
  })
}) 