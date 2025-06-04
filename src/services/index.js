// Services index - centralized exports for all API services
export { default as apiClient, setAuthToken, clearAuthToken, apiCall } from './api'
export { default as authService } from './authService'
export { default as patientService } from './patientService'
export { default as medicationService } from './medicationService'
export { default as doseService } from './doseService'
export { default as notificationService, pushNotificationUtils } from './notificationService'
export { default as dashboardService } from './dashboardService'
export { default as measurementService } from './measurementService'
export { default as appointmentService } from './appointmentService'
export { default as dailyLogService } from './dailyLogService'
export { default as caregiverService } from './caregiverService'
export { default as syncService, realTimeService, deviceService } from './syncService'
export { default as fileService, fileValidation } from './fileService'

// Convenience object for accessing all services
export const services = {
  auth: authService,
  patient: patientService,
  medication: medicationService,
  dose: doseService,
  notification: notificationService,
  dashboard: dashboardService,
  measurement: measurementService,
  appointment: appointmentService,
  dailyLog: dailyLogService,
  caregiver: caregiverService,
  sync: syncService,
  realTime: realTimeService,
  device: deviceService,
  file: fileService,
}

// Re-export commonly used utilities
export { formatApiError, buildQueryString } from './api' 