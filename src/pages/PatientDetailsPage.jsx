import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import { Button, Tabs } from 'antd'
import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons'
import PatientDetails from '../components/patients/PatientDetails'
import MedicationSection from '../components/patients/MedicationSection'
import MeasurementSection from '../components/patients/MeasurementSection'
import DailyLogs from '../components/patients/DailyLogs'
import PatientAppointments from '../components/patients/PatientAppointments'
import { usePatients } from '../hooks/usePatients'
import { mockPatients } from '../utils/mockData'
import LoadingSpinner from '../components/common/LoadingSpinner'
import './PatientDetailsPage.css'

const PatientDetailsPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { selectPatient } = usePatients()
  const hasSelectedPatient = useRef(false)

  // Use mock data for immediate functionality
  const patient = mockPatients.find(p => p.id === id)

  // Fix setState in render issue - use useEffect with ref to prevent infinite loop
  useEffect(() => {
    if (patient && !hasSelectedPatient.current) {
      selectPatient(patient.id)
      hasSelectedPatient.current = true
    }
  }, [patient?.id, selectPatient])

  // Reset ref when patient changes
  useEffect(() => {
    hasSelectedPatient.current = false
  }, [id])

  if (!patient) {
    return (
      <div className="patient-details-page">
        <div className="patient-not-found">
          <Button 
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/patients')}
            className="back-button"
          >
            Back to Patients
          </Button>
          <div className="not-found-content">
            <h3>Patient Not Found</h3>
            <p>The patient you're looking for doesn't exist or may have been removed.</p>
          </div>
        </div>
      </div>
    )
  }

  const handleBack = () => {
    navigate('/patients')
  }

  const tabItems = [
    {
      key: 'overview',
      label: 'Overview',
      children: <PatientDetails patient={patient} />
    },
    {
      key: 'medications',
      label: 'Medications',
      children: <MedicationSection patient={patient} />
    },
    {
      key: 'measurements',
      label: 'Measurements',
      children: <MeasurementSection patient={patient} />
    },
    {
      key: 'appointments',
      label: 'Appointments',
      children: <PatientAppointments patient={patient} />
    },
    {
      key: 'logs',
      label: 'Daily Logs',
      children: <DailyLogs patient={patient} />
    }
  ]

  return (
    <div className="patient-details-page">
      {/* Quick Actions Bar */}
      <div className="patient-actions-bar">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={handleBack}
          className="back-button"
          size="small"
        >
          Back
        </Button>
      </div>

      {/* Patient Tabs */}
      <div className="patient-tabs-container">
        <Tabs
          defaultActiveKey="overview"
          items={tabItems}
          className="patient-tabs"
        />
      </div>
    </div>
  )
}

export default PatientDetailsPage