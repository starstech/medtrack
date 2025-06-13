import { createContext, useContext, useReducer, useEffect, useRef, useMemo } from 'react'
import { notification } from 'antd'
import { notificationService } from '../services/notificationService'
import { supabase } from '../lib/supabase'

const NotificationContext = createContext()

const notificationReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false }
    case 'CLEAR_ERROR':
      return { ...state, error: null }
    case 'SET_NOTIFICATIONS':
      return { ...state, notifications: action.payload, loading: false, error: null }
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications]
      }
    case 'UPDATE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.map(notif =>
          notif.id === action.payload.id ? action.payload : notif
        )
      }
    case 'MARK_READ':
      return {
        ...state,
        notifications: state.notifications.map(notif =>
          notif.id === action.payload ? { ...notif, read: true } : notif
        )
      }
    case 'TOGGLE_READ':
      return {
        ...state,
        notifications: state.notifications.map(notif =>
          notif.id === action.payload ? { ...notif, read: !notif.read } : notif
        )
      }
    case 'MARK_ALL_READ':
      return {
        ...state,
        notifications: state.notifications.map(notif => ({ ...notif, read: true }))
      }
    case 'DELETE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(notif => notif.id !== action.payload)
      }
    case 'SET_PREFERENCES':
      return { ...state, preferences: action.payload }
    default:
      return state
  }
}

const initialState = {
  notifications: [],
  loading: true,
  error: null,
  preferences: {
    pushNotifications: true,
    emailNotifications: false,
    medicationReminders: true,
    appointmentReminders: true,
    caregiverUpdates: true,
    reminderMinutes: [15, 30, 60] // Minutes before dose time
  }
}

export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState)
  
  // Use ref to store latest state values to avoid closure issues
  const stateRef = useRef(state)
  stateRef.current = state

  // Load notifications and preferences from backend (only when authenticated)
  useEffect(() => {
    let mounted = true

    const loadNotifications = async () => {
      try {
        // Check if user is authenticated before loading data
        const { data: { user } } = await supabase.auth.getUser()
        if (!user || !mounted) {
          // User not authenticated or component unmounted, don't load data
          if (mounted) {
            dispatch({ type: 'SET_LOADING', payload: false })
          }
          return
        }

        dispatch({ type: 'SET_LOADING', payload: true })
        dispatch({ type: 'CLEAR_ERROR' })

        // Load notifications
        const { data: notifications, error: notificationsError } = await notificationService.getNotifications({
          limit: 50 // Get last 50 notifications
        })

        if (notificationsError) {
          throw new Error(`Failed to load notifications: ${notificationsError}`)
        }

        if (!mounted) return
        dispatch({ type: 'SET_NOTIFICATIONS', payload: notifications || [] })

        // Load preferences
        const { data: savedPrefs, error: prefsError } = await notificationService.getNotificationPreferences()
        
        if (savedPrefs && !prefsError && mounted) {
          // Merge with default preferences
          const mergedPrefs = { ...initialState.preferences, ...savedPrefs }
          dispatch({ type: 'SET_PREFERENCES', payload: mergedPrefs })
        } else if (mounted) {
          // Try to load from localStorage as fallback
          const localStoragePrefs = localStorage.getItem('notificationPreferences')
          if (localStoragePrefs) {
            try {
              const preferences = JSON.parse(localStoragePrefs)
              dispatch({ type: 'SET_PREFERENCES', payload: preferences })
            } catch (error) {
              console.error('Error loading notification preferences from localStorage:', error)
            }
          }
        }

      } catch (error) {
        console.error('Error loading notifications:', error)
        if (mounted) {
          dispatch({ type: 'SET_ERROR', payload: error.message })
        }
      } finally {
        if (mounted) {
          dispatch({ type: 'SET_LOADING', payload: false })
        }
      }
    }

    loadNotifications()

    // Listen for auth state changes to reload data when user logs in/out
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return

      if (event === 'SIGNED_IN') {
        loadNotifications()
      } else if (event === 'SIGNED_OUT') {
        // Clear notifications when user logs out
        dispatch({ type: 'SET_NOTIFICATIONS', payload: [] })
        dispatch({ type: 'SET_LOADING', payload: false })
        dispatch({ type: 'CLEAR_ERROR' })
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  // Set up real-time notifications subscription
  useEffect(() => {
    let mounted = true
    let subscription = null

    const setupRealtimeSubscription = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user || !mounted) return

        // Subscribe to notifications table changes for the current user
        subscription = supabase
          .channel('notifications')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'notifications',
              filter: `user_id=eq.${user.id}`
            },
            (payload) => {
              if (!mounted) return
              const newNotification = payload.new
              dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification })
              
              // Show in-app notification if enabled (use ref to get current state)
              if (stateRef.current.preferences?.pushNotifications) {
                showNotification('info', newNotification.title, newNotification.message)
              }
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'notifications',
              filter: `user_id=eq.${user.id}`
            },
            (payload) => {
              if (!mounted) return
              const updatedNotification = payload.new
              dispatch({ type: 'UPDATE_NOTIFICATION', payload: updatedNotification })
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'DELETE',
              schema: 'public',
              table: 'notifications',
              filter: `user_id=eq.${user.id}`
            },
            (payload) => {
              if (!mounted) return
              const deletedNotification = payload.old
              dispatch({ type: 'DELETE_NOTIFICATION', payload: deletedNotification.id })
            }
          )
          .subscribe()

      } catch (error) {
        console.error('Error setting up realtime subscription:', error)
      }
    }

    setupRealtimeSubscription()

    // Cleanup subscription on unmount
    return () => {
      mounted = false
      if (subscription) {
        supabase.removeChannel(subscription)
      }
    }
  }, [])

  const showNotification = (type, message, description = '', duration = 4.5) => {
    notification[type]({
      message,
      description,
      duration,
      placement: 'topRight'
    })
  }

  const addNotification = async (notificationData) => {
    try {
      dispatch({ type: 'CLEAR_ERROR' })
      
      const { data: newNotification, error } = await notificationService.createNotification({
        ...notificationData,
        created_at: new Date().toISOString(),
        read: false
      })

      if (error) throw new Error(error)

      // The notification will be added via realtime subscription
      // But add locally for immediate feedback
      dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification })

      // Show in-app notification if enabled (use ref to get current state)
      if (stateRef.current.preferences.pushNotifications) {
        showNotification('info', notificationData.title, notificationData.message)
      }

      return newNotification
    } catch (error) {
      console.error('Error adding notification:', error)
      dispatch({ type: 'SET_ERROR', payload: error.message })
      throw error
    }
  }

  const scheduleMedicationReminder = (medication, patient, doseTime) => {
    const now = new Date()
    const scheduledTime = new Date(doseTime)
    const timeDiff = scheduledTime.getTime() - now.getTime()

    // Use ref to get current preferences
    stateRef.current.preferences.reminderMinutes.forEach(minutes => {
      const reminderTime = timeDiff - (minutes * 60 * 1000)
      
      if (reminderTime > 0) {
        setTimeout(() => {
          addNotification({
            type: 'medication_reminder',
            title: 'Medication Reminder',
            message: `${patient.name} needs ${medication.name} in ${minutes} minutes`,
            patient_id: patient.id,
            medication_id: medication.id
          })
        }, reminderTime)
      }
    })
  }

  const scheduleAppointmentReminder = (appointment, patient) => {
    const now = new Date()
    const appointmentTime = new Date(appointment.dateTime)
    const oneDayBefore = appointmentTime.getTime() - now.getTime() - (24 * 60 * 60 * 1000)
    const oneHourBefore = appointmentTime.getTime() - now.getTime() - (60 * 60 * 1000)

    if (oneDayBefore > 0) {
      setTimeout(() => {
        addNotification({
          type: 'appointment_reminder',
          title: 'Appointment Reminder',
          message: `${patient.name} has an appointment tomorrow at ${appointment.time}`,
          patient_id: patient.id
        })
      }, oneDayBefore)
    }

    if (oneHourBefore > 0) {
      setTimeout(() => {
        addNotification({
          type: 'appointment_reminder',
          title: 'Appointment Reminder',
          message: `${patient.name} has an appointment in 1 hour`,
          patient_id: patient.id
        })
      }, oneHourBefore)
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      dispatch({ type: 'CLEAR_ERROR' })
      
      const { error } = await notificationService.markAsRead(notificationId)
      if (error) throw new Error(error)
      
      dispatch({ type: 'MARK_READ', payload: notificationId })
    } catch (error) {
      console.error('Error marking notification as read:', error)
      dispatch({ type: 'SET_ERROR', payload: error.message })
      throw error
    }
  }

  const toggleReadStatus = async (notificationId) => {
    // Use ref to get current notifications
    const notification = stateRef.current.notifications.find(n => n.id === notificationId)
    if (notification) {
      if (notification.read) {
        // For toggling back to unread, we need to implement this in the service
        dispatch({ type: 'TOGGLE_READ', payload: notificationId })
      } else {
        await markAsRead(notificationId)
      }
    }
  }

  const markAllAsRead = async () => {
    try {
      dispatch({ type: 'CLEAR_ERROR' })
      
      const { error } = await notificationService.markAllAsRead()
      if (error) throw new Error(error)
      
      dispatch({ type: 'MARK_ALL_READ' })
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      dispatch({ type: 'SET_ERROR', payload: error.message })
      throw error
    }
  }

  const deleteNotification = async (notificationId) => {
    try {
      dispatch({ type: 'CLEAR_ERROR' })
      
      const { error } = await notificationService.deleteNotification(notificationId)
      if (error) throw new Error(error)
      
      dispatch({ type: 'DELETE_NOTIFICATION', payload: notificationId })
    } catch (error) {
      console.error('Error deleting notification:', error)
      dispatch({ type: 'SET_ERROR', payload: error.message })
      throw error
    }
  }

  const updatePreferences = async (newPreferences) => {
    try {
      dispatch({ type: 'CLEAR_ERROR' })
      
      // Update in backend
      const { error } = await notificationService.updateNotificationPreferences(newPreferences)
      if (error) {
        console.warn('Failed to save preferences to backend:', error)
      }
      
      // Always update locally and in localStorage
      dispatch({ type: 'SET_PREFERENCES', payload: newPreferences })
      localStorage.setItem('notificationPreferences', JSON.stringify(newPreferences))
    } catch (error) {
      console.error('Error updating notification preferences:', error)
      // Still update locally even if backend fails
      dispatch({ type: 'SET_PREFERENCES', payload: newPreferences })
      localStorage.setItem('notificationPreferences', JSON.stringify(newPreferences))
    }
  }

  const getUnreadCount = () => {
    return state.notifications.filter(notif => !notif.read).length
  }

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    ...state,
    addNotification,
    scheduleMedicationReminder,
    scheduleAppointmentReminder,
    markAsRead,
    toggleReadStatus,
    markAllAsRead,
    deleteNotification,
    updatePreferences,
    getUnreadCount
  }), [state])

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotificationContext = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider')
  }
  return context
}