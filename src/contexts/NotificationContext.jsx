import { createContext, useContext, useReducer, useEffect } from 'react'
import { notification } from 'antd'

const NotificationContext = createContext()

const notificationReducer = (state, action) => {
  switch (action.type) {
    case 'SET_NOTIFICATIONS':
      return { ...state, notifications: action.payload }
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications]
      }
    case 'MARK_READ':
      return {
        ...state,
        notifications: state.notifications.map(notif =>
          notif.id === action.payload ? { ...notif, read: true } : notif
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

  // Load notification preferences from localStorage
  useEffect(() => {
    const savedPrefs = localStorage.getItem('notificationPreferences')
    if (savedPrefs) {
      try {
        const preferences = JSON.parse(savedPrefs)
        dispatch({ type: 'SET_PREFERENCES', payload: preferences })
      } catch (error) {
        console.error('Error loading notification preferences:', error)
      }
    }
  }, [])

  // Mock notifications for demo
  useEffect(() => {
    const mockNotifications = [
      {
        id: '1',
        type: 'medication_reminder',
        title: 'Medication Reminder',
        message: 'Time to give Emma her Amoxicillin (1 tablet)',
        timestamp: new Date().toISOString(),
        read: false,
        patientId: 'patient1',
        medicationId: 'med1'
      },
      {
        id: '2',
        type: 'caregiver_update',
        title: 'Caregiver Update',
        message: 'John marked Emma\'s morning dose as taken',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
        read: false,
        patientId: 'patient1'
      },
      {
        id: '3',
        type: 'appointment_reminder',
        title: 'Appointment Reminder',
        message: 'Emma has a doctor appointment tomorrow at 2:00 PM',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        read: true,
        patientId: 'patient1'
      }
    ]

    dispatch({ type: 'SET_NOTIFICATIONS', payload: mockNotifications })
  }, [])

  const showNotification = (type, message, description = '', duration = 4.5) => {
    notification[type]({
      message,
      description,
      duration,
      placement: 'topRight'
    })
  }

  const addNotification = (notificationData) => {
    const newNotification = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notificationData
    }

    dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification })

    // Show in-app notification if enabled
    if (state.preferences.pushNotifications) {
      showNotification('info', notificationData.title, notificationData.message)
    }
  }

  const scheduleMedicationReminder = (medication, patient, doseTime) => {
    const now = new Date()
    const scheduledTime = new Date(doseTime)
    const timeDiff = scheduledTime.getTime() - now.getTime()

    state.preferences.reminderMinutes.forEach(minutes => {
      const reminderTime = timeDiff - (minutes * 60 * 1000)
      
      if (reminderTime > 0) {
        setTimeout(() => {
          addNotification({
            type: 'medication_reminder',
            title: 'Medication Reminder',
            message: `${patient.name} needs ${medication.name} in ${minutes} minutes`,
            patientId: patient.id,
            medicationId: medication.id
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
          patientId: patient.id
        })
      }, oneDayBefore)
    }

    if (oneHourBefore > 0) {
      setTimeout(() => {
        addNotification({
          type: 'appointment_reminder',
          title: 'Appointment Reminder',
          message: `${patient.name} has an appointment in 1 hour`,
          patientId: patient.id
        })
      }, oneHourBefore)
    }
  }

  const markAsRead = (notificationId) => {
    dispatch({ type: 'MARK_READ', payload: notificationId })
  }

  const markAllAsRead = () => {
    dispatch({ type: 'MARK_ALL_READ' })
  }

  const deleteNotification = (notificationId) => {
    dispatch({ type: 'DELETE_NOTIFICATION', payload: notificationId })
  }

  const updatePreferences = (newPreferences) => {
    dispatch({ type: 'SET_PREFERENCES', payload: newPreferences })
    localStorage.setItem('notificationPreferences', JSON.stringify(newPreferences))
  }

  const getUnreadCount = () => {
    return state.notifications.filter(notif => !notif.read).length
  }

  const value = {
    notifications: state.notifications,
    preferences: state.preferences,
    addNotification,
    scheduleMedicationReminder,
    scheduleAppointmentReminder,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    updatePreferences,
    getUnreadCount,
    showNotification
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotificationContext = () => {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider')
  }
  return context
}