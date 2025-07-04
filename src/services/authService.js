// Authentication service
import { supabase } from '../lib/supabase'

// Helper to handle and propagate JWT
const handleToken = (session) => {
  if (session) {
    // Store the session in localStorage (Supabase does this automatically)
    // But we can extract the token for our API client if needed
    const token = session.access_token
    if (token) {
      localStorage.setItem('auth_token', token)
    }
  } else {
    localStorage.removeItem('auth_token')
  }
}

export const authService = {
  // Sign up with Supabase
  async signUp(email, password, userData = {}) {
    try {
      console.log('Registering with Supabase:', { email, name: userData.name || '' })
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData.fullName || userData.name || '',
            role: userData.role || 'user',
          }
        }
      })
      
      if (error) throw error
      
      // With email confirmation disabled, we should get a session right away
      const requiresVerification = !data.session
      
      if (data.session) {
        handleToken(data.session)
        console.log('User signed up and logged in automatically')
      } else {
        console.log('User signed up but no session returned - might need verification')
      }
      
      return {
        success: true,
        data: {
          user: data.user,
          session: data.session,
          requiresVerification
        },
        message: requiresVerification
          ? 'Please check your email to confirm your account.'
          : 'Account created successfully!'
      }
    } catch (error) {
      console.error('Sign up error:', error)
      return {
        success: false,
        error: error.message || 'Registration failed. Please try again.'
      }
    }
  },

  // Sign in with Supabase
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      
      if (data.session) {
        handleToken(data.session)
      }
      
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
        error: error.message || 'Login failed. Please check your credentials.'
      }
    }
  },

  // Sign out with Supabase
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      handleToken(null)
      return { success: true }
    } catch (error) {
      console.error('Sign out error:', error)
      return { success: false, error: error.message || 'Failed to sign out.' }
    }
  },

  // Get current user from Supabase
  async getCurrentUser() {
    try {
      const { data, error } = await supabase.auth.getUser()
      
      if (error) throw error
      
      if (!data.user) {
        return { success: false, error: 'No user found' }
      }
      
      return { 
        success: true, 
        data: data.user 
      }
    } catch (error) {
      return { success: false, error: error.message || 'Failed to get user.' }
    }
  },

  // Get current session from Supabase
  async getCurrentSession() {
    try {
      const { data, error } = await supabase.auth.getSession()
      
      if (error) throw error
      
      if (!data.session) {
        return { success: false, error: 'No active session' }
      }
      
      return { success: true, data: data.session }
    } catch (error) {
      return { success: false, error: error.message || 'Failed to get session.' }
    }
  },

  // Reset password with Supabase
  async resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password'
      })
      
      if (error) throw error
      
      return { 
        success: true, 
        message: 'Password reset email sent. Please check your inbox.' 
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Failed to send password reset email.' 
      }
    }
  },

  // Update password with Supabase
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
      return { 
        success: false, 
        error: error.message || 'Failed to update password.' 
      }
    }
  },

  // Update user profile with Supabase
  async updateProfile(updates) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: updates
      })
      
      if (error) throw error
      
      return { 
        success: true, 
        data: data.user, 
        message: 'Profile updated successfully' 
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Failed to update profile.' 
      }
    }
  },

  // Listen to auth state changes with Supabase
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        handleToken(session)
        callback({ user: session?.user || null })
      } else if (event === 'SIGNED_OUT') {
        handleToken(null)
        callback({ user: null })
      } else if (event === 'USER_UPDATED') {
        callback({ user: session?.user || null })
      }
    })
  },

  // Verify email with Supabase token
  async verifyEmail(token) {
    try {
      // Supabase handles email verification via URL parameters
      // This function is kept for API compatibility but isn't needed
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Failed to verify email.' 
      }
    }
  }
}

export default authService 