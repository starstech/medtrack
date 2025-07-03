import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { authService } from '../../src/services/authService'
import { supabase } from '@/services/api'
import { createSupabaseMock, createMockUser } from '../helpers/testUtils'

// Mock supabase
vi.mock('../../src/lib/supabase', () => {
  const mockSupabase = createSupabaseMock()
  return {
    supabase: mockSupabase
  }
})

// Import the mocked supabase
const { supabase } = await import('../../src/lib/supabase')

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
      const mockUser = createMockUser()
      const mockResponse = {
        data: { user: mockUser, session: null },
        error: null
      }

      supabase.auth.signUp.mockResolvedValue(mockResponse)

      const result = await authService.signUp('test@example.com', 'password123', {
        fullName: 'Test User',
        phone: '+1234567890'
      })

      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          data: {
            full_name: 'Test User',
            phone: '+1234567890',
            date_of_birth: undefined,
            emergency_contact: undefined
          }
        }
      })
      expect(result.success).toBe(true)
      expect(result.data.user).toEqual(mockUser)
    })

    it('handles sign up error', async () => {
      const mockError = { message: 'Invalid email' }
      supabase.auth.signUp.mockResolvedValue({ data: null, error: mockError })

      const result = await authService.signUp('invalid-email', 'password123')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid email')
    })

    it('handles email confirmation message', async () => {
      const mockUser = { ...createMockUser(), email_confirmed_at: null }
      const mockResponse = {
        data: { user: mockUser, session: null },
        error: null
      }

      supabase.auth.signUp.mockResolvedValue(mockResponse)

      const result = await authService.signUp('test@example.com', 'password123')

      expect(result.message).toBe('Please check your email to confirm your account.')
    })
  })

  describe('signIn', () => {
    it('signs in user successfully', async () => {
      const mockUser = createMockUser()
      const mockSession = { access_token: 'token123', user: mockUser }
      const mockResponse = {
        data: { user: mockUser, session: mockSession },
        error: null
      }

      supabase.auth.signInWithPassword.mockResolvedValue(mockResponse)

      const result = await authService.signIn('test@example.com', 'password123')

      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      })
      expect(result.success).toBe(true)
      expect(result.data.user).toEqual(mockUser)
      expect(result.data.session).toEqual(mockSession)
    })

    it('handles sign in error', async () => {
      const mockError = { message: 'Invalid credentials' }
      supabase.auth.signInWithPassword.mockResolvedValue({ data: null, error: mockError })

      const result = await authService.signIn('test@example.com', 'wrongpassword')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid credentials')
    })
  })

  describe('signOut', () => {
    it('signs out successfully', async () => {
      supabase.auth.signOut.mockResolvedValue({ error: null })

      const result = await authService.signOut()

      expect(supabase.auth.signOut).toHaveBeenCalled()
      expect(result.success).toBe(true)
    })

    it('handles sign out error', async () => {
      const mockError = { message: 'Sign out failed' }
      supabase.auth.signOut.mockResolvedValue({ error: mockError })

      const result = await authService.signOut()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Sign out failed')
    })
  })

  describe('getCurrentUser', () => {
    it('gets current user successfully', async () => {
      const mockUser = createMockUser()
      supabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      const result = await authService.getCurrentUser()

      expect(supabase.auth.getUser).toHaveBeenCalled()
      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockUser)
    })

    it('handles get user error', async () => {
      const mockError = { message: 'No user found' }
      supabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: mockError
      })

      const result = await authService.getCurrentUser()

      expect(result.success).toBe(false)
      expect(result.error).toBe('No user found')
    })
  })

  describe('getCurrentSession', () => {
    it('gets current session successfully', async () => {
      const mockSession = { access_token: 'token123', user: createMockUser() }
      supabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null
      })

      const result = await authService.getCurrentSession()

      expect(supabase.auth.getSession).toHaveBeenCalled()
      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockSession)
    })

    it('handles get session error', async () => {
      const mockError = { message: 'No session found' }
      supabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: mockError
      })

      const result = await authService.getCurrentSession()

      expect(result.success).toBe(false)
      expect(result.error).toBe('No session found')
    })
  })

  describe('resetPassword', () => {
    beforeEach(() => {
      // Mock window.location.origin
      Object.defineProperty(window, 'location', {
        value: { origin: 'http://localhost:3000' },
        writable: true
      })
    })

    it('sends reset password email successfully', async () => {
      supabase.auth.resetPasswordForEmail.mockResolvedValue({ error: null })

      const result = await authService.resetPassword('test@example.com')

      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith('test@example.com', {
        redirectTo: 'http://localhost:3000/reset-password'
      })
      expect(result.success).toBe(true)
      expect(result.message).toBe('Password reset email sent. Please check your inbox.')
    })

    it('handles reset password error', async () => {
      const mockError = { message: 'Email not found' }
      supabase.auth.resetPasswordForEmail.mockResolvedValue({ error: mockError })

      const result = await authService.resetPassword('nonexistent@example.com')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Email not found')
    })
  })

  describe('updatePassword', () => {
    it('updates password successfully', async () => {
      supabase.auth.updateUser.mockResolvedValue({ error: null })

      const result = await authService.updatePassword('newpassword123')

      expect(supabase.auth.updateUser).toHaveBeenCalledWith({
        password: 'newpassword123'
      })
      expect(result.success).toBe(true)
      expect(result.message).toBe('Password updated successfully')
    })

    it('handles update password error', async () => {
      const mockError = { message: 'Password too weak' }
      supabase.auth.updateUser.mockResolvedValue({ error: mockError })

      const result = await authService.updatePassword('weak')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Password too weak')
    })
  })

  describe('updateProfile', () => {
    it('updates profile successfully', async () => {
      const updates = { full_name: 'Updated Name', phone: '+1987654321' }
      supabase.auth.updateUser.mockResolvedValue({ error: null })

      const result = await authService.updateProfile(updates)

      expect(supabase.auth.updateUser).toHaveBeenCalledWith({
        data: updates
      })
      expect(result.success).toBe(true)
      expect(result.message).toBe('Profile updated successfully')
    })

    it('handles update profile error', async () => {
      const mockError = { message: 'Update failed' }
      supabase.auth.updateUser.mockResolvedValue({ error: mockError })

      const result = await authService.updateProfile({ full_name: 'Test' })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Update failed')
    })
  })

  describe('onAuthStateChange', () => {
    it('sets up auth state listener', () => {
      const callback = vi.fn()
      const mockUnsubscribe = vi.fn()
      
      supabase.auth.onAuthStateChange.mockReturnValue({
        data: { subscription: { unsubscribe: mockUnsubscribe } }
      })

      const result = authService.onAuthStateChange(callback)

      expect(supabase.auth.onAuthStateChange).toHaveBeenCalledWith(callback)
      expect(result.data.subscription.unsubscribe).toBe(mockUnsubscribe)
    })
  })

  describe('refreshSession', () => {
    it('refreshes session successfully', async () => {
      const mockSession = { access_token: 'new_token123' }
      supabase.auth.refreshSession.mockResolvedValue({
        data: { session: mockSession },
        error: null
      })

      const result = await authService.refreshSession()

      expect(supabase.auth.refreshSession).toHaveBeenCalled()
      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockSession)
    })

    it('handles refresh session error', async () => {
      const mockError = { message: 'Session expired' }
      supabase.auth.refreshSession.mockResolvedValue({
        data: null,
        error: mockError
      })

      const result = await authService.refreshSession()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Session expired')
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