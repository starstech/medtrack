import { createContext, useContext, useReducer, useEffect } from 'react'
import { mockPatients, mockMedications, mockMeasurements, mockLogs } from '../utils/mockData'

const PatientContext = createContext()

const patientReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_PATIENTS':
      return { ...state, patients: action.payload, loading: false }
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
  loading: true
}

export const PatientProvider = ({ children }) => {
  const [state, dispatch] = useReducer(patientReducer, initialState)

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800))
      
      dispatch({ type: 'SET_PATIENTS', payload: mockPatients })
      dispatch({ type: 'SET_MEDICATIONS', payload: mockMedications })
      dispatch({ type: 'SET_MEASUREMENTS', payload: mockMeasurements })
      dispatch({ type: 'SET_DAILY_LOGS', payload: mockLogs })
    }

    loadData()
  }, [])

  const selectPatient = (patientId) => {
    const patient = state.patients.find(p => p.id === patientId)
    dispatch({ type: 'SET_SELECTED_PATIENT', payload: patient })
  }

  const addPatient = async (patientData) => {
    const newPatient = {
      id: Date.now().toString(),
      ...patientData,
      createdAt: new Date().toISOString(),
      caregivers: [{ id: '1', name: 'Current User', role: 'primary' }]
    }
    
    dispatch({ type: 'ADD_PATIENT', payload: newPatient })
    return newPatient
  }

  const addMedication = async (patientId, medicationData) => {
    const newMedication = {
      id: Date.now().toString(),
      patientId,
      ...medicationData,
      createdAt: new Date().toISOString(),
      doses: [] // Will be populated based on schedule
    }
    
    dispatch({ type: 'ADD_MEDICATION', payload: newMedication })
    return newMedication
  }

  const addMeasurement = async (patientId, measurementData) => {
    const newMeasurement = {
      id: Date.now().toString(),
      patientId,
      ...measurementData,
      recordedAt: new Date().toISOString()
    }
    
    dispatch({ type: 'ADD_MEASUREMENT', payload: newMeasurement })
    return newMeasurement
  }

  const addDailyLog = async (patientId, logData) => {
    const newLog = {
      id: Date.now().toString(),
      patientId,
      ...logData,
      timestamp: new Date().toISOString()
    }
    
    dispatch({ type: 'ADD_DAILY_LOG', payload: newLog })
    return newLog
  }

  const markDose = async (medicationId, doseId, status, notes = '') => {
    dispatch({ 
      type: 'MARK_DOSE_TAKEN', 
      payload: { 
        medicationId, 
        doseId, 
        status, 
        takenAt: new Date().toISOString(),
        notes 
      } 
    })
  }

  const getTodaysDoses = () => {
    const today = new Date().toDateString()
    const todaysDoses = []
    
    state.medications.forEach(medication => {
      const patient = state.patients.find(p => p.id === medication.patientId)
      medication.doses?.forEach(dose => {
        const doseDate = new Date(dose.scheduledTime).toDateString()
        if (doseDate === today) {
          todaysDoses.push({
            ...dose,
            medication,
            patient
          })
        }
      })
    })
    
    return todaysDoses.sort((a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime))
  }

  const getPatientMedications = (patientId) => {
    return state.medications.filter(med => med.patientId === patientId)
  }

  const getPatientMeasurements = (patientId) => {
    return state.measurements.filter(measurement => measurement.patientId === patientId)
  }

  const getPatientLogs = (patientId) => {
    return state.dailyLogs.filter(log => log.patientId === patientId)
  }

  const value = {
    patients: state.patients,
    selectedPatient: state.selectedPatient,
    medications: state.medications,
    measurements: state.measurements,
    dailyLogs: state.dailyLogs,
    loading: state.loading,
    selectPatient,
    addPatient,
    addMedication,
    addMeasurement,
    addDailyLog,
    markDose,
    getTodaysDoses,
    getPatientMedications,
    getPatientMeasurements,
    getPatientLogs
  }

  return (
    <PatientContext.Provider value={value}>
      {children}
    </PatientContext.Provider>
  )
}

export const usePatientContext = () => {
  const context = useContext(PatientContext)
  if (context === undefined) {
    throw new Error('usePatientContext must be used within a PatientProvider')
  }
  return context
}