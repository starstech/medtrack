import { createContext, useContext, useReducer, useEffect, useMemo } from 'react'
import { patientService } from '../services/patientService'
import { medicationService } from '../services/medicationService'
import { measurementService } from '../services/measurementService'
import { dailyLogService } from '../services/dailyLogService'
import { useAuthContext } from './AuthContext'

const PatientContext = createContext()

const patientReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false }
    case 'CLEAR_ERROR':
      return { ...state, error: null }
    case 'SET_PATIENTS':
      return { ...state, patients: action.payload, loading: false, error: null }
    case 'SET_SELECTED_PATIENT':
      return { ...state, selectedPatient: action.payload }
    case 'ADD_PATIENT':
      return {
        ...state,
        patients: [...state.patients, action.payload]
      }
    case 'UPDATE_PATIENT':
      return {
        ...state,
        patients: state.patients.map(p => 
          p.id === action.payload.id ? action.payload : p
        )
      }
    case 'SET_MEDICATIONS':
      return { ...state, medications: action.payload }
    case 'ADD_MEDICATION':
      return {
        ...state,
        medications: [...state.medications, action.payload]
      }
    case 'UPDATE_MEDICATION':
      return {
        ...state,
        medications: state.medications.map(m => 
          m.id === action.payload.id ? action.payload : m
        )
      }
    case 'DELETE_MEDICATION':
      return {
        ...state,
        medications: state.medications.filter(m => m.id !== action.payload.medicationId)
      }
    case 'SET_MEASUREMENTS':
      return { ...state, measurements: action.payload }
    case 'ADD_MEASUREMENT':
      return {
        ...state,
        measurements: [...state.measurements, action.payload]
      }
    case 'SET_DAILY_LOGS':
      return { ...state, dailyLogs: action.payload }
    case 'ADD_DAILY_LOG':
      return {
        ...state,
        dailyLogs: [...state.dailyLogs, action.payload]
      }
    case 'MARK_DOSE_TAKEN':
      return {
        ...state,
        medications: state.medications.map(med => 
          med.id === action.payload.medicationId 
            ? {
                ...med,
                doses: med.doses.map(dose => 
                  dose.id === action.payload.doseId 
                    ? { ...dose, status: action.payload.status, takenAt: action.payload.takenAt }
                    : dose
                )
              }
            : med
        )
      }
    default:
      return state
  }
}

const initialState = {
  patients: [],
  selectedPatient: null,
  medications: [],
  measurements: [],
  dailyLogs: [],
  loading: true,
  error: null
}

export const PatientProvider = ({ children }) => {
  const [state, dispatch] = useReducer(patientReducer, initialState)
  const { user } = useAuthContext()

  // Load data whenever authenticated user changes
  useEffect(() => {
    let mounted = true

    const loadData = async () => {
      try {
        if (!user) {
          // User not authenticated or component unmounted
          dispatch({ type: 'SET_LOADING', payload: false })
          return
        }

        // Make sure we have a valid user with necessary properties
        if (!mounted) {
          return
        }

        dispatch({ type: 'SET_LOADING', payload: true })
        dispatch({ type: 'CLEAR_ERROR' })
        
        try {
          // Load patients first
          const { data: patients, error: patientsError } = await patientService.getPatients()
          if (patientsError) throw new Error(`Failed to load patients: ${patientsError}`)
          
          if (!mounted) return
          dispatch({ type: 'SET_PATIENTS', payload: patients || [] })
          
          // If we have patients, load data for all patients
          if (patients && patients.length > 0) {
            // Load medications for all patients
            const medicationsPromises = patients.map(patient => 
              medicationService.getMedications(patient.id)
            )
            const medicationsResults = await Promise.allSettled(medicationsPromises)
            const allMedications = medicationsResults
              .filter(result => result.status === 'fulfilled' && result.value.data)
              .flatMap(result => result.value.data)
            
            if (!mounted) return
            dispatch({ type: 'SET_MEDICATIONS', payload: allMedications })
            
            // Load measurements for all patients
            const measurementsPromises = patients.map(patient => 
              measurementService.getMeasurements(patient.id, { limit: 100 })
            )
            const measurementsResults = await Promise.allSettled(measurementsPromises)
            const allMeasurements = measurementsResults
              .filter(result => result.status === 'fulfilled' && result.value.data)
              .flatMap(result => result.value.data)
            
            if (!mounted) return
            dispatch({ type: 'SET_MEASUREMENTS', payload: allMeasurements })
            
            // Load daily logs for all patients
            const dailyLogsPromises = patients.map(patient => 
              dailyLogService.getPatientLogs(patient.id, { limit: 100 })
            )
            const dailyLogsResults = await Promise.allSettled(dailyLogsPromises)
            const allDailyLogs = dailyLogsResults
              .filter(result => result.status === 'fulfilled' && result.value.data)
              .flatMap(result => result.value.data)
            
            if (!mounted) return
            dispatch({ type: 'SET_DAILY_LOGS', payload: allDailyLogs })
          }
        } catch (error) {
          console.error('Error loading data:', error)
          if (mounted) {
            dispatch({ type: 'SET_ERROR', payload: error.message })
          }
        }
        
      } catch (error) {
        console.error('Error loading initial data:', error)
        if (mounted) {
          dispatch({ type: 'SET_ERROR', payload: error.message })
        }
      } finally {
        if (mounted) {
          dispatch({ type: 'SET_LOADING', payload: false })
        }
      }
    }

    loadData()

    return () => {
      mounted = false
      // nothing to cleanup
    }
  }, [user])

  const selectPatient = (patientId) => {
    const patient = state.patients.find(p => p.id === patientId)
    dispatch({ type: 'SET_SELECTED_PATIENT', payload: patient })
  }

  const addPatient = async (patientData) => {
    try {
      dispatch({ type: 'CLEAR_ERROR' })
      const { data: newPatient, error } = await patientService.createPatient(patientData)
      
      if (error) throw new Error(error)
      
      dispatch({ type: 'ADD_PATIENT', payload: newPatient })
      return newPatient
    } catch (error) {
      console.error('Error adding patient:', error)
      dispatch({ type: 'SET_ERROR', payload: error.message })
      throw error
    }
  }

  const updatePatient = async (patientId, patientData) => {
    try {
      dispatch({ type: 'CLEAR_ERROR' })
      const { data: updatedPatient, error } = await patientService.updatePatient(patientId, patientData)
      
      if (error) throw new Error(error)
      
      dispatch({ type: 'UPDATE_PATIENT', payload: updatedPatient })
      
      // Update selected patient if it's the one being updated
      if (state.selectedPatient?.id === patientId) {
        dispatch({ type: 'SET_SELECTED_PATIENT', payload: updatedPatient })
      }
      
      return updatedPatient
    } catch (error) {
      console.error('Error updating patient:', error)
      dispatch({ type: 'SET_ERROR', payload: error.message })
      throw error
    }
  }

  const addMedication = async (patientId, medicationData) => {
    try {
      dispatch({ type: 'CLEAR_ERROR' })
      const { data: newMedication, error } = await medicationService.createMedication({
        ...medicationData,
        patient_id: patientId
      })
      
      if (error) throw new Error(error)
      
      dispatch({ type: 'ADD_MEDICATION', payload: newMedication })
      return newMedication
    } catch (error) {
      console.error('Error adding medication:', error)
      dispatch({ type: 'SET_ERROR', payload: error.message })
      throw error
    }
  }

  const updateMedication = async (medicationId, medicationData) => {
    try {
      dispatch({ type: 'CLEAR_ERROR' })
      const { data: updatedMedication, error } = await medicationService.updateMedication(medicationId, medicationData)
      
      if (error) throw new Error(error)
      
      dispatch({ type: 'UPDATE_MEDICATION', payload: updatedMedication })
      return updatedMedication
    } catch (error) {
      console.error('Error updating medication:', error)
      dispatch({ type: 'SET_ERROR', payload: error.message })
      throw error
    }
  }

  const deleteMedication = async (medicationId) => {
    try {
      dispatch({ type: 'CLEAR_ERROR' })
      const { error } = await medicationService.deleteMedication(medicationId)
      
      if (error) throw new Error(error)
      
      dispatch({
        type: 'DELETE_MEDICATION',
        payload: { medicationId }
      })
    } catch (error) {
      console.error('Error deleting medication:', error)
      dispatch({ type: 'SET_ERROR', payload: error.message })
      throw error
    }
  }

  const addMeasurement = async (patientId, measurementData) => {
    try {
      dispatch({ type: 'CLEAR_ERROR' })
      const { data: newMeasurement, error } = await measurementService.createMeasurement({
        ...measurementData,
        patient_id: patientId
      })
      
      if (error) throw new Error(error)
      
      dispatch({ type: 'ADD_MEASUREMENT', payload: newMeasurement })
      return newMeasurement
    } catch (error) {
      console.error('Error adding measurement:', error)
      dispatch({ type: 'SET_ERROR', payload: error.message })
      throw error
    }
  }

  const addDailyLog = async (patientId, logData) => {
    try {
      dispatch({ type: 'CLEAR_ERROR' })
      const { data: newLog, error } = await dailyLogService.createLog(patientId, logData)
      
      if (error) throw new Error(error)
      
      dispatch({ type: 'ADD_DAILY_LOG', payload: newLog })
      return newLog
    } catch (error) {
      console.error('Error adding daily log:', error)
      dispatch({ type: 'SET_ERROR', payload: error.message })
      throw error
    }
  }

  const markDose = async (medicationId, doseId, status, notes = '') => {
    // Note: This function needs to be updated once we have a dose tracking service
    // For now, we'll update the local state only
    dispatch({ 
      type: 'MARK_DOSE_TAKEN', 
      payload: { 
        medicationId, 
        doseId, 
        status, 
        takenAt: status === 'taken' ? new Date().toISOString() : null,
        notes 
      }
    })
  }

  const getTodaysDoses = () => {
    const today = new Date().toDateString()
    return state.medications.flatMap(medication => 
      (medication.doses || []).filter(dose => 
        new Date(dose.scheduledTime).toDateString() === today
      ).map(dose => ({
        ...dose,
        medicationName: medication.name,
        patientName: state.patients.find(p => p.id === medication.patientId)?.name || 'Unknown'
      }))
    )
  }

  const getPatientMedications = (patientId) => {
    return state.medications.filter(m => m.patient_id === patientId || m.patientId === patientId)
  }

  const getPatientMeasurements = (patientId) => {
    return state.measurements.filter(m => m.patient_id === patientId || m.patientId === patientId)
  }

  const getPatientLogs = (patientId) => {
    return state.dailyLogs.filter(l => l.patient_id === patientId || l.patientId === patientId)
  }

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    ...state,
    selectPatient,
    addPatient,
    updatePatient,
    addMedication,
    updateMedication,
    deleteMedication,
    addMeasurement,
    addDailyLog,
    markDose,
    getTodaysDoses,
    getPatientMedications,
    getPatientMeasurements,
    getPatientLogs,
    clearError: () => dispatch({ type: 'CLEAR_ERROR' })
  }), [state])

  return (
    <PatientContext.Provider value={value}>
      {children}
    </PatientContext.Provider>
  )
}

export const usePatientContext = () => {
  const context = useContext(PatientContext)
  if (!context) {
    throw new Error('usePatientContext must be used within a PatientProvider')
  }
  return context
}