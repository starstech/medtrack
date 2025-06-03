import { useParams, useNavigate } from 'react-router-dom'
import { Button, Typography, Space, Tabs, Alert } from 'antd'
import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons'
import PatientDetails from '../components/patients/PatientDetails'
import MedicationSection from '../components/patients/MedicationSection'
import MeasurementSection from '../components/patients/MeasurementSection'
import DailyLogs from '../components/patients/DailyLogs'
import { usePatients } from '../hooks/usePatients'
import LoadingSpinner from '../components/common/LoadingSpinner'
import './PatientDetailsPage.css'

const { Title, Text } = Typography

const PatientDetailsPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { patients, loading, selectPatient } = usePatients()

  if (loading) {
    return <LoadingSpinner message="Loading patient details..." />
  }

  const patient = patients.find(p => p.id === id)

  if (!patient) {
    return (
      <div className="patient-not-found">
        <Alert
          message="Patient Not Found"
          description="The patient you're looking for doesn't exist or may have been removed."
          type="error"
          showIcon
          action={
            <Button size="small" onClick={() => navigate('/patients')}>
              Back to Patients
            </Button>
          }
        />
      </div>
    )
  }

  // Set as selected patient for dashboard context
  if (patient) {
    selectPatient(patient.id)
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
      key: 'logs',
      label: 'Daily Logs',
      children: <DailyLogs patient={patient} />
    }
  ]

  const getPatientAge = (dateOfBirth) => {
    const today = new Date()
    const birth = new Date(dateOfBirth)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    
    return age
  }

  return (
    <div className="patient-details-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="header-content">
          <Space size="middle" align="center">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={handleBack}
              size="large"
              className="back-button"
            >
              <span className="desktop-only">Back</span>
            </Button>
            
            <Space direction="vertical" size="small">
              <Title level={2} className="page-title">
                {patient.name}
              </Title>
              <Text type="secondary" className="page-subtitle">
                {getPatientAge(patient.dateOfBirth)} years old • {patient.gender}
              </Text>
            </Space>
          </Space>
        </div>
        
        <div className="header-actions">
          <Button
            icon={<EditOutlined />}
            size="large"
            className="edit-button"
          >
            <span className="desktop-only">Edit</span>
          </Button>
        </div>
      </div>

      {/* Patient Tabs */}
      <div className="patient-tabs-container">
        <Tabs
          defaultActiveKey="overview"
          items={tabItems}
          size="large"
          className="patient-tabs"
        />
      </div>
    </div>
  )
}

export default PatientDetailsPage