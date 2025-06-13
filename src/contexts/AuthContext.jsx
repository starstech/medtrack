import { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react'
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

    const checkAuthStatus = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (!mounted) return

        if (error) {
          console.error('Error getting session:', error)
          dispatch({ type: 'SET_LOADING', payload: false })
          return
        }

        if (session?.user) {
          // Get user profile from our profiles table
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (!mounted) return

          if (profileError) {
            console.error('Error fetching profile:', profileError)
            // User exists in auth but not in profiles table - this shouldn't happen
            // but we'll handle it gracefully
            dispatch({ type: 'LOGIN_SUCCESS', payload: {
              id: session.user.id,
              email: session.user.email,
              name: session.user.user_metadata?.name || session.user.email.split('@')[0],
              role: 'caregiver'
            }})
          } else {
            dispatch({ type: 'LOGIN_SUCCESS', payload: profile })
          }
        } else {
          dispatch({ type: 'SET_LOADING', payload: false })
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        if (mounted) {
          dispatch({ type: 'SET_LOADING', payload: false })
        }
      }
    }

    checkAuthStatus()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        if (event === 'SIGNED_IN' && session?.user) {
          // Get user profile
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (mounted && !error && profile) {
            dispatch({ type: 'LOGIN_SUCCESS', payload: profile })
          }
        } else if (event === 'SIGNED_OUT') {
          if (mounted) {
            dispatch({ type: 'LOGOUT' })
          }
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const login = useCallback(async (email, password) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        dispatch({ type: 'LOGIN_ERROR', payload: error.message })
        return { success: false, error: error.message }
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (profileError) {
        console.error('Error fetching profile:', profileError)
        // Fallback to basic user data
        dispatch({ type: 'LOGIN_SUCCESS', payload: {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name || data.user.email.split('@')[0],
          role: 'caregiver'
        }})
      } else {
        dispatch({ type: 'LOGIN_SUCCESS', payload: profile })
      }
      
      return { success: true }
    } catch (error) {
      dispatch({ type: 'LOGIN_ERROR', payload: error.message })
      return { success: false, error: error.message }
    }
  }, [])

  const register = useCallback(async (email, password, name) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name
          }
        }
      })
      
      if (error) {
        dispatch({ type: 'LOGIN_ERROR', payload: error.message })
        return { success: false, error: error.message }
      }

      dispatch({ type: 'SET_LOADING', payload: false })
      
      // Check if email confirmation is required
      if (data.user && !data.session) {
        return { 
          success: true, 
          requiresVerification: true,
          email: email,
          message: 'Registration successful. Please check your email to verify your account.'
        }
      } else {
        // Auto-login if no email confirmation required (local dev)
        return { success: true, requiresVerification: false }
      }
    } catch (error) {
      dispatch({ type: 'LOGIN_ERROR', payload: error.message })
      return { success: false, error: error.message }
    }
  }, [])

  const verifyEmail = useCallback(async (token) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'signup'
      })
      
      if (error) {
        dispatch({ type: 'LOGIN_ERROR', payload: error.message })
        return { success: false, error: error.message }
      }

      // Get user profile after verification
      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()

        if (!profileError && profile) {
          dispatch({ type: 'LOGIN_SUCCESS', payload: profile })
        }
      }
      
      return { success: true }
    } catch (error) {
      dispatch({ type: 'LOGIN_ERROR', payload: error.message })
      return { success: false, error: error.message }
    }
  }, [])

  const resendVerificationEmail = useCallback(async (email) => {
    try {
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
      await supabase.auth.signOut()
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