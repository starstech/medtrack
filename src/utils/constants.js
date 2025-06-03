// Application-wide constants

// App Information
export const APP_NAME = 'MedTracker'
export const APP_VERSION = '1.0.0'
export const APP_DESCRIPTION = 'Your family\'s medication management hub'

// Routes
export const ROUTES = {
  AUTH: '/',
  DASHBOARD: '/',
  PATIENTS: '/patients',
  PATIENT_DETAILS: '/patients/:id',
  TODAYS_DOSES: '/todays-doses',
  CALENDAR: '/calendar',
  PROFILE: '/profile'
}

// User Roles
export const USER_ROLES = {
  CAREGIVER: 'caregiver',
  PATIENT: 'patient',
  ADMIN: 'admin'
}

// Caregiver Roles
export const CAREGIVER_ROLES = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  FAMILY: 'family',
  MEDICAL: 'medical',
  NURSE: 'nurse',
  OTHER: 'other'
}

// Medication Status
export const MEDICATION_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  EXPIRED: 'expired',
  DISCONTINUED: 'discontinued'
}

// Dose Status
export const DOSE_STATUS = {
  PENDING: 'pending',
  TAKEN: 'taken',
  MISSED: 'missed',
  SKIPPED: 'skipped'
}

// Log Types
export const LOG_TYPES = {
  INCIDENT: 'incident',
  SYMPTOM: 'symptom',
  BEHAVIOR: 'behavior',
  ACTIVITY: 'activity',
  MEAL: 'meal',
  SLEEP: 'sleep',
  MEDICATION: 'medication',
  GENERAL: 'general'
}

// Severity Levels
export const SEVERITY_LEVELS = {
  POSITIVE: 'positive',
  NORMAL: 'normal',
  MILD: 'mild',
  MODERATE: 'moderate',
  SEVERE: 'severe'
}

// Measurement Types
export const MEASUREMENT_TYPES = {
  TEMPERATURE: 'temperature',
  WEIGHT: 'weight',
  HEIGHT: 'height',
  BLOOD_PRESSURE: 'blood_pressure',
  BLOOD_GLUCOSE: 'blood_glucose',
  HEART_RATE: 'heart_rate',
  OXYGEN_SATURATION: 'oxygen_saturation',
  URINE_DIPSTICK: 'urine_dipstick',
  PEAK_FLOW: 'peak_flow'
}

// Appointment Types
export const APPOINTMENT_TYPES = {
  ROUTINE_CHECKUP: 'routine_checkup',
  FOLLOW_UP: 'follow_up',
  SPECIALIST: 'specialist',
  EMERGENCY: 'emergency',
  DENTAL: 'dental',
  THERAPY: 'therapy',
  VACCINATION: 'vaccination',
  LAB_WORK: 'lab_work',
  SURGERY: 'surgery',
  OTHER: 'other'
}

// Notification Types
export const NOTIFICATION_TYPES = {
  MEDICATION_REMINDER: 'medication_reminder',
  APPOINTMENT_REMINDER: 'appointment_reminder',
  CAREGIVER_UPDATE: 'caregiver_update',
  MEASUREMENT_DUE: 'measurement_due',
  SYSTEM_ALERT: 'system_alert'
}

// Medication Frequencies
export const MEDICATION_FREQUENCIES = {
  ONCE_DAILY: 'once_daily',
  TWICE_DAILY: 'twice_daily',
  THREE_TIMES_DAILY: 'three_times_daily',
  FOUR_TIMES_DAILY: 'four_times_daily',
  AS_NEEDED: 'as_needed',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly'
}

// Medication Forms
export const MEDICATION_FORMS = {
  TABLET: 'tablet',
  CAPSULE: 'capsule',
  LIQUID: 'liquid',
  INJECTION: 'injection',
  INHALER: 'inhaler',
  CREAM: 'cream',
  DROPS: 'drops',
  PATCH: 'patch'
}

// Time Formats
export const TIME_FORMATS = {
  TIME_12: 'h:mm A',
  TIME_24: 'HH:mm',
  DATE: 'MMM D, YYYY',
  DATE_SHORT: 'MMM D',
  DATE_TIME: 'MMM D, YYYY h:mm A',
  DATE_TIME_SHORT: 'MMM D h:mm A'
}

// Local Storage Keys
export const STORAGE_KEYS = {
  USER: 'user',
  AUTH_TOKEN: 'auth_token',
  NOTIFICATION_PREFERENCES: 'notification_preferences',
  SELECTED_PATIENT: 'selected_patient',
  THEME: 'theme',
  LANGUAGE: 'language'
}

// API Endpoints (for future backend integration)
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh'
  },
  PATIENTS: {
    LIST: '/patients',
    CREATE: '/patients',
    GET: '/patients/:id',
    UPDATE: '/patients/:id',
    DELETE: '/patients/:id'
  },
  MEDICATIONS: {
    LIST: '/patients/:patientId/medications',
    CREATE: '/patients/:patientId/medications',
    UPDATE: '/medications/:id',
    DELETE: '/medications/:id'
  },
  DOSES: {
    LIST: '/patients/:patientId/doses',
    MARK: '/doses/:id/mark',
    TODAY: '/doses/today'
  },
  MEASUREMENTS: {
    LIST: '/patients/:patientId/measurements',
    CREATE: '/patients/:patientId/measurements',
    UPDATE: '/measurements/:id',
    DELETE: '/measurements/:id'
  },
  LOGS: {
    LIST: '/patients/:patientId/logs',
    CREATE: '/patients/:patientId/logs',
    UPDATE: '/logs/:id',
    DELETE: '/logs/:id'
  },
  APPOINTMENTS: {
    LIST: '/appointments',
    CREATE: '/appointments',
    UPDATE: '/appointments/:id',
    DELETE: '/appointments/:id'
  },
  CAREGIVERS: {
    LIST: '/caregivers',
    INVITE: '/caregivers/invite',
    REMOVE: '/caregivers/:id',
    ACCEPT: '/caregivers/accept/:token'
  },
  NOTIFICATIONS: {
    LIST: '/notifications',
    MARK_READ: '/notifications/:id/read',
    PREFERENCES: '/notifications/preferences'
  }
}

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  UNAUTHORIZED: 'Please log in to continue.',
  FORBIDDEN: 'You don\'t have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Something went wrong. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.'
}

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Successfully logged in!',
  LOGOUT_SUCCESS: 'Successfully logged out!',
  REGISTRATION_SUCCESS: 'Account created successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  PASSWORD_CHANGED: 'Password changed successfully!',
  PATIENT_ADDED: 'Patient added successfully!',
  MEDICATION_ADDED: 'Medication added successfully!',
  DOSE_MARKED: 'Dose marked successfully!',
  MEASUREMENT_RECORDED: 'Measurement recorded successfully!',
  LOG_ADDED: 'Log entry added successfully!',
  APPOINTMENT_SCHEDULED: 'Appointment scheduled successfully!',
  CAREGIVER_INVITED: 'Caregiver invitation sent successfully!',
  SETTINGS_SAVED: 'Settings saved successfully!'
}

// Validation Rules
export const VALIDATION_RULES = {
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    MESSAGE: 'Please enter a valid email address'
  },
  PASSWORD: {
    MIN_LENGTH: 6,
    MESSAGE: 'Password must be at least 6 characters long'
  },
  PHONE: {
    PATTERN: /^[\+]?[1-9][\d]{0,15}$/,
    MESSAGE: 'Please enter a valid phone number'
  },
  NAME: {
    MIN_LENGTH: 2,
    MESSAGE: 'Name must be at least 2 characters long'
  }
}

// Default Values
export const DEFAULT_VALUES = {
  PAGINATION: {
    PAGE_SIZE: 10,
    SHOW_SIZE_CHANGER: false,
    SHOW_QUICK_JUMPER: true
  },
  NOTIFICATION_PREFERENCES: {
    pushNotifications: true,
    emailNotifications: false,
    medicationReminders: true,
    appointmentReminders: true,
    caregiverUpdates: true,
    reminderMinutes: [15, 30, 60],
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '07:00'
    }
  },
  MEDICATION: {
    FREQUENCY: 'once_daily',
    FORM: 'tablet',
    DURATION: 30
  },
  APPOINTMENT: {
    DURATION: 30,
    REMINDERS: ['24_hours', '1_hour']
  }
}

// Theme Colors
export const THEME_COLORS = {
  PRIMARY: '#1890ff',
  SUCCESS: '#52c41a',
  WARNING: '#fa8c16',
  ERROR: '#ff4d4f',
  INFO: '#13c2c2',
  PURPLE: '#722ed1',
  GRAY: '#8c8c8c'
}

// Responsive Breakpoints
export const BREAKPOINTS = {
  XS: 0,      // Extra small devices (phones)
  SM: 576,    // Small devices (tablets)
  MD: 768,    // Medium devices (small laptops)
  LG: 992,    // Large devices (desktops)
  XL: 1200,   // Extra large devices (large desktops)
  XXL: 1600   // Extra extra large devices
}

// Animation Durations
export const ANIMATION_DURATIONS = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500
}

// File Upload Limits
export const FILE_UPLOAD = {
  MAX_SIZE: 2 * 1024 * 1024, // 2MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
  AVATAR_MAX_SIZE: 1 * 1024 * 1024 // 1MB for avatars
}

// Date/Time Constants
export const DATE_TIME = {
  DEFAULT_TIMEZONE: 'UTC',
  DOSE_REMINDER_WINDOW: 15, // minutes
  APPOINTMENT_REMINDER_DEFAULT: [1440, 60], // 1 day and 1 hour in minutes
  MEASUREMENT_FREQUENCY_DAYS: 7,
  LOG_RETENTION_DAYS: 365
}

// Notification Settings
export const NOTIFICATIONS = {
  MAX_DISPLAY_COUNT: 10,
  AUTO_DISMISS_DURATION: 5000, // 5 seconds
  REMINDER_INTERVALS: [5, 10, 15, 30, 60, 120, 240, 1440, 10080], // in minutes
  PRIORITY_LEVELS: {
    LOW: 'low',
    NORMAL: 'normal',
    HIGH: 'high',
    URGENT: 'urgent'
  }
}

// Features Flags (for gradual rollout of new features)
export const FEATURE_FLAGS = {
  ADVANCED_ANALYTICS: false,
  MEDICATION_INTERACTIONS: false,
  TELEHEALTH_INTEGRATION: false,
  VOICE_REMINDERS: false,
  FAMILY_SHARING: true,
  EXPORT_DATA: true,
  OFFLINE_MODE: false
}

// Chart/Analytics Colors
export const CHART_COLORS = [
  '#1890ff', '#52c41a', '#fa8c16', '#ff4d4f', 
  '#722ed1', '#13c2c2', '#eb2f96', '#f5222d',
  '#faad14', '#a0d911', '#36cfc9', '#b37feb'
]

// Export all constants as a single object for easier importing
export default {
  APP_NAME,
  APP_VERSION,
  APP_DESCRIPTION,
  ROUTES,
  USER_ROLES,
  CAREGIVER_ROLES,
  MEDICATION_STATUS,
  DOSE_STATUS,
  LOG_TYPES,
  SEVERITY_LEVELS,
  MEASUREMENT_TYPES,
  APPOINTMENT_TYPES,
  NOTIFICATION_TYPES,
  MEDICATION_FREQUENCIES,
  MEDICATION_FORMS,
  TIME_FORMATS,
  STORAGE_KEYS,
  API_ENDPOINTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  VALIDATION_RULES,
  DEFAULT_VALUES,
  THEME_COLORS,
  BREAKPOINTS,
  ANIMATION_DURATIONS,
  FILE_UPLOAD,
  DATE_TIME,
  NOTIFICATIONS,
  FEATURE_FLAGS,
  CHART_COLORS
}