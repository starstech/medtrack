import { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react'
import { authService } from '../services/authService'
import { supabase } from '../lib/supabase'

const AuthContext = createContext()

// Auth reducer to handle authentication state
const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        loading: false,
        error: null
      }
    case 'LOGIN_ERROR':
      return {
        ...state,
        user: null,
        loading: false,
        error: action.payload
      }
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        loading: false,
        error: null
      }
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      }
    default:
      return state
  }
}

const initialState = {
  user: null,
  loading: true,
  error: null
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Check for existing session on app load
  useEffect(() => {
    let mounted = true
    let authListener = null

    const checkAuthStatus = async () => {
      try {
        // Get current session from Supabase
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!mounted) return
        
        if (session?.user) {
          // We have a valid session
          dispatch({ type: 'LOGIN_SUCCESS', payload: session.user })
        } else {
          // No active session
          dispatch({ type: 'SET_LOADING', payload: false })
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        if (mounted) {
          dispatch({ type: 'SET_LOADING', payload: false })
        }
      }
    }

    // Set up auth state change listener
    const setupAuthListener = () => {
      authListener = supabase.auth.onAuthStateChange((event, session) => {
        if (!mounted) return
        
        if (event === 'SIGNED_IN' && session?.user) {
          dispatch({ type: 'LOGIN_SUCCESS', payload: session.user })
        } else if (event === 'SIGNED_OUT') {
          dispatch({ type: 'LOGOUT' })
        } else if (event === 'USER_UPDATED' && session?.user) {
          dispatch({ type: 'LOGIN_SUCCESS', payload: session.user })
        }
      })
    }

    checkAuthStatus()
    setupAuthListener()

    return () => {
      mounted = false
      if (authListener && authListener.subscription && typeof authListener.subscription.unsubscribe === 'function') {
        authListener.subscription.unsubscribe()
      }
    }
  }, [])

  const login = useCallback(async (email, password) => {
    dispatch({ type: 'SET_LOADING', payload: true })

    const result = await authService.signIn(email, password)

    if (result.success) {
      dispatch({ type: 'LOGIN_SUCCESS', payload: result.data.user })
      return { success: true }
    } else {
      dispatch({ type: 'LOGIN_ERROR', payload: result.error })
      return { success: false, error: result.error }
    }
  }, [])

  const register = useCallback(async (email, password, name) => {
    dispatch({ type: 'SET_LOADING', payload: true })

    try {
      console.log('Registering with:', { email, name }) // For debugging
      const result = await authService.signUp(email, password, { name })

      dispatch({ type: 'SET_LOADING', payload: false })

      if (!result.success) {
        dispatch({ type: 'LOGIN_ERROR', payload: result.error })
        return { success: false, error: result.error }
      }

      // Since email confirmation is not required, we should have a session right away
      if (result.data.session) {
        // User is automatically logged in
        dispatch({ type: 'LOGIN_SUCCESS', payload: result.data.user })
        return { 
          success: true, 
          requiresVerification: false,
          message: 'Registration successful!'
        }
      } else if (result.data.requiresVerification) {
        // This case should not happen if email confirmation is disabled,
        // but keeping it for robustness
        return { 
          success: true, 
          requiresVerification: true,
          email: email,
          message: 'Registration successful. Please check your email to verify your account.'
        }
      } else {
        // Default success case
        return { success: true, requiresVerification: false }
      }
    } catch (error) {
      console.error('Registration error in context:', error)
      dispatch({ type: 'SET_LOADING', payload: false })
      dispatch({ type: 'LOGIN_ERROR', payload: error.message || 'Registration failed' })
      return { success: false, error: error.message || 'Registration failed' }
    }
  }, [])

  const verifyEmail = useCallback(async (token) => {
    // With Supabase, email verification is handled via URL parameters
    // This function is kept for API compatibility
    return { success: true }
  }, [])

  const resendVerificationEmail = useCallback(async (email) => {
    try {
      // Use Supabase to resend verification email
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      })
      
      if (error) {
        return { success: false, error: error.message }
      }
      
      return { success: true, message: 'Verification email sent successfully' }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await authService.signOut()
      dispatch({ type: 'LOGOUT' })
    } catch (error) {
      console.error('Logout error:', error)
      // Force logout even if API call fails
      dispatch({ type: 'LOGOUT' })
    }
  }, [])

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' })
  }, [])

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    user: state.user,
    loading: state.loading,
    error: state.error,
    login,
    register,
    verifyEmail,
    resendVerificationEmail,
    logout,
    clearError
  }), [
    state.user,
    state.loading,
    state.error,
    login,
    register,
    verifyEmail,
    resendVerificationEmail,
    logout,
    clearError
  ])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuthContext = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}