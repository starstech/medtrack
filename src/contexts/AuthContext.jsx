import { createContext, useContext, useReducer, useEffect } from 'react'

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

  // Simulate checking for existing session on app load
  useEffect(() => {
    const checkAuthStatus = () => {
      // In real app, this would check localStorage/sessionStorage for token
      // or make API call to verify existing session
      const storedUser = localStorage.getItem('user')
      
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser)
          dispatch({ type: 'LOGIN_SUCCESS', payload: user })
        } catch {
          localStorage.removeItem('user')
          dispatch({ type: 'SET_LOADING', payload: false })
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }

    // Simulate API call delay
    setTimeout(checkAuthStatus, 1000)
  }, [])

  const login = async (email, password) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    
    try {
      // Mock login - in real app this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock user data
      const mockUser = {
        id: '1',
        email,
        name: email.split('@')[0],
        role: 'caregiver',
        joinedAt: new Date().toISOString()
      }
      
      localStorage.setItem('user', JSON.stringify(mockUser))
      dispatch({ type: 'LOGIN_SUCCESS', payload: mockUser })
      
      return { success: true }
    } catch (error) {
      dispatch({ type: 'LOGIN_ERROR', payload: 'Invalid email or password' })
      return { success: false, error: 'Invalid email or password' }
    }
  }

  const register = async (email, password, name) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    
    try {
      // Mock registration - in real app this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockUser = {
        id: Date.now().toString(),
        email,
        name,
        role: 'caregiver',
        joinedAt: new Date().toISOString()
      }
      
      localStorage.setItem('user', JSON.stringify(mockUser))
      dispatch({ type: 'LOGIN_SUCCESS', payload: mockUser })
      
      return { success: true }
    } catch (error) {
      dispatch({ type: 'LOGIN_ERROR', payload: 'Registration failed' })
      return { success: false, error: 'Registration failed' }
    }
  }

  const logout = () => {
    localStorage.removeItem('user')
    dispatch({ type: 'LOGOUT' })
  }

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  const value = {
    user: state.user,
    loading: state.loading,
    error: state.error,
    login,
    register,
    logout,
    clearError
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuthContext = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}