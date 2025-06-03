import { usePatientContext } from '../contexts/PatientContext'

export const usePatients = () => {
  return usePatientContext()
}