import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { authService } from '../../src/services/authService'
import { supabase } from '@/services/api'

// Mock supabase
vi.mock('../../src/lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getUser: vi.fn(),
      getSession: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
      onAuthStateChange: vi.fn(),
      refreshSession: vi.fn()
    }
  }
}))

const mockSupabase = vi.mocked(await import('../../src/lib/supabase')).supabase

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
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null
      })

      const result = await authService.signUp('test@example.com', 'password123', { fullName: 'Test User' })

      expect(result.success).toBe(true)
      expect(result.data.user).toEqual(mockUser)
      expect(result.data.session).toEqual(mockSession)
      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          data: {
            full_name: 'Test User',
            phone: undefined,
            date_of_birth: undefined,
            emergency_contact: undefined
          }
        }
      })
    })

    it('handles signup errors', async () => {
      mockSupabase.auth.signUp.mockResolvedValue({
        data: null,
        error: { message: 'Email already registered' }
      })

      const result = await authService.signUp('test@example.com', 'password123')

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
      mockSupabase.auth.signUp.mockRejectedValue(new Error('Network error'))

      const result = await authService.signUp('test@example.com', 'password123', {})

      expect(result.success).toBe(false)
      expect(result.error).toContain('Network error')
    })
  })

  describe('signIn', () => {
    it('signs in user successfully', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null
      })

      const result = await authService.signIn('test@example.com', 'password123')

      expect(result.success).toBe(true)
      expect(result.data.user).toEqual(mockUser)
      expect(result.data.session).toEqual(mockSession)
    })

    it('handles invalid credentials', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Invalid login credentials' }
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
      mockSupabase.auth.signInWithPassword.mockRejectedValue(new Error('Network error'))

      const result = await authService.signIn('test@example.com', 'password123')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Network error')
    })
  })

  describe('signOut', () => {
    it('signs out successfully', async () => {
      mockSupabase.auth.signOut.mockResolvedValue({ error: null })

      const result = await authService.signOut()

      expect(result.success).toBe(true)
      expect(mockSupabase.auth.signOut).toHaveBeenCalled()
    })

    it('handles signout errors', async () => {
      mockSupabase.auth.signOut.mockResolvedValue({
        error: { message: 'Signout failed' }
      })

      const result = await authService.signOut()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Signout failed')
    })

    it('handles network errors during signout', async () => {
      mockSupabase.auth.signOut.mockRejectedValue(new Error('Network error'))

      const result = await authService.signOut()

      expect(result.success).toBe(false)
      expect(result.error).toContain('Network error')
    })
  })

  describe('resetPassword', () => {
    it('sends reset email successfully', async () => {
      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({ error: null })

      const result = await authService.resetPassword('test@example.com')

      expect(result.success).toBe(true)
      expect(result.message).toContain('Password reset email sent')
      expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        { redirectTo: expect.stringContaining('/reset-password') }
      )
    })

    it('handles reset email errors', async () => {
      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({
        error: { message: 'Email not found' }
      })

      const result = await authService.resetPassword('test@example.com')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Email not found')
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
      mockSupabase.auth.verifyOtp.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null
      })

      const result = await authService.verifyOtp('test@example.com', '123456', 'signup')

      expect(result.success).toBe(true)
      expect(result.data.user).toEqual(mockUser)
      expect(mockSupabase.auth.verifyOtp).toHaveBeenCalledWith({
        email: 'test@example.com',
        token: '123456',
        type: 'signup'
      })
    })

    it('handles invalid OTP', async () => {
      const error = { message: 'Invalid OTP' }
      mockSupabase.auth.verifyOtp.mockResolvedValue({
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
      mockSupabase.auth.updateUser.mockResolvedValue({
        data: { user: { ...mockUser, user_metadata: updates.data } },
        error: null
      })

      const result = await authService.updateUser(updates)

      expect(result.success).toBe(true)
      expect(result.data.user.user_metadata.first_name).toBe('Updated Name')
      expect(mockSupabase.auth.updateUser).toHaveBeenCalledWith(updates)
    })

    it('handles update errors', async () => {
      const error = { message: 'Update failed' }
      mockSupabase.auth.updateUser.mockResolvedValue({
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

  describe('getCurrentSession', () => {
    it('gets current session successfully', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null
      })

      const result = await authService.getCurrentSession()

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockSession)
    })

    it('handles no session', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null
      })

      const result = await authService.getCurrentSession()

      expect(result.success).toBe(true)
      expect(result.data).toBeNull()
    })

    it('handles session errors', async () => {
      const error = { message: 'Session error' }
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error
      })

      const result = await authService.getCurrentSession()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Session error')
    })
  })

  describe('getCurrentUser', () => {
    it('gets current user successfully', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      const result = await authService.getCurrentUser()

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockUser)
    })

    it('handles no user', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null
      })

      const result = await authService.getCurrentUser()

      expect(result.success).toBe(true)
      expect(result.data).toBeNull()
    })

    it('handles user errors', async () => {
      const error = { message: 'User error' }
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error
      })

      const result = await authService.getCurrentUser()

      expect(result.success).toBe(false)
      expect(result.error).toBe('User error')
    })
  })

  describe('onAuthStateChange', () => {
    it('sets up auth state change listener', () => {
      const callback = vi.fn()
      mockSupabase.auth.onAuthStateChange.mockReturnValue({ data: { subscription: {} } })

      const result = authService.onAuthStateChange(callback)

      expect(mockSupabase.auth.onAuthStateChange).toHaveBeenCalledWith(callback)
      expect(result).toBeDefined()
    })

    it('handles callback errors', () => {
      const callback = vi.fn()
      const error = new Error('Callback setup failed')
      mockSupabase.auth.onAuthStateChange.mockImplementation(() => {
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
      mockSupabase.auth.refreshSession.mockResolvedValue({
        data: { session: newSession, user: mockUser },
        error: null
      })

      const result = await authService.refreshSession()

      expect(result.success).toBe(true)
      expect(result.data.session.access_token).toBe('new-token')
    })

    it('handles refresh errors', async () => {
      const error = { message: 'Refresh failed' }
      mockSupabase.auth.refreshSession.mockResolvedValue({
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
      mockSupabase.auth.signInWithPassword.mockImplementation(() => {
        throw new Error('Unexpected error')
      })

      const result = await authService.signIn('test@example.com', 'password123')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Unexpected error')
    })

    it('handles null/undefined responses', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue(null)

      const result = await authService.signIn('test@example.com', 'password123')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Unexpected response')
    })

    it('handles missing error messages', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
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