// Authentication service
import { supabase } from '../lib/supabase'

export const authService = {
  // Sign up with email and password
  async signUp(email, password, userData = {}) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.fullName || userData.name,
            phone: userData.phone,
            date_of_birth: userData.dateOfBirth,
            emergency_contact: userData.emergencyContact
          }
        }
      })

      if (error) throw error

      return {
        success: true,
        data: {
          user: data.user,
          session: data.session
        },
        message: data.user?.email_confirmed_at 
          ? 'Account created successfully!' 
          : 'Please check your email to confirm your account.'
      }
    } catch (error) {
      console.error('Sign up error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Sign in with email and password
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      return {
        success: true,
        data: {
          user: data.user,
          session: data.session
        }
      }
    } catch (error) {
      console.error('Sign in error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Sign out
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      return {
        success: true
      }
    } catch (error) {
      console.error('Sign out error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error

      return {
        success: true,
        data: user
      }
    } catch (error) {
      console.error('Get current user error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Get current session
  async getCurrentSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error

      return {
        success: true,
        data: session
      }
    } catch (error) {
      console.error('Get current session error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Reset password
  async resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) throw error

      return {
        success: true,
        message: 'Password reset email sent. Please check your inbox.'
      }
    } catch (error) {
      console.error('Reset password error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Update password
  async updatePassword(newPassword) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error

      return {
        success: true,
        message: 'Password updated successfully'
      }
    } catch (error) {
      console.error('Update password error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Update user profile
  async updateProfile(updates) {
    try {
      const { error } = await supabase.auth.updateUser({
        data: updates
      })

      if (error) throw error

      return {
        success: true,
        message: 'Profile updated successfully'
      }
    } catch (error) {
      console.error('Update profile error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Listen to auth state changes
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback)
  },

  // Refresh session
  async refreshSession() {
    try {
      const { data, error } = await supabase.auth.refreshSession()
      if (error) throw error

      return {
        success: true,
        data: data.session
      }
    } catch (error) {
      console.error('Refresh session error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }
}

export default authService 