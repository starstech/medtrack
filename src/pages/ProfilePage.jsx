import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Button, Tabs, Typography, Select, Space, Alert } from 'antd'
import { 
  ArrowLeftOutlined,
  UserOutlined, 
  BellOutlined, 
  TeamOutlined,
  SecurityScanOutlined,
  SettingOutlined 
} from '@ant-design/icons'
import ProfileSettings from '../components/profile/ProfileSettings'
import CaregiverManagement from '../components/profile/CaregiverManagement'
import NotificationSettings from '../components/profile/NotificationSettings'
import MeasurementPreferences from '../components/preferences/MeasurementPreferences'
import { useAuth } from '../hooks/useAuth'
import { usePatients } from '../hooks/usePatients'
import LoadingSpinner from '../components/common/LoadingSpinner'
import './ProfilePage.css'

const { Title, Text } = Typography
const { Option } = Select

const ProfilePage = () => {
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const { patients, loading: patientsLoading, selectedPatient, selectPatient } = usePatients()
  const [selectedPatientForSettings, setSelectedPatientForSettings] = useState(null)

  // Set default selected patient when patients load
  useEffect(() => {
    if (patients && patients.length > 0 && !selectedPatientForSettings) {
      // Use the currently selected patient from context, or default to first patient
      const defaultPatient = selectedPatient || patients[0]
      setSelectedPatientForSettings(defaultPatient.id)
    }
  }, [patients, selectedPatient, selectedPatientForSettings])

  if (loading || patientsLoading) {
    return <LoadingSpinner message="Loading profile..." />
  }

  const handleBack = () => {
    navigate('/')
  }

  const handlePatientChange = (patientId) => {
    setSelectedPatientForSettings(patientId)
  }

  const renderMeasurementSettings = () => {
    if (!patients || patients.length === 0) {
      return (
        <Alert
          message="No Patients Available"
          description="You need to add patients before configuring measurement settings."
          type="info"
          showIcon
          action={
            <Button type="primary" onClick={() => navigate('/patients')}>
              Add Patients
            </Button>
          }
        />
      )
    }

    if (!selectedPatientForSettings) {
      return (
        <Alert
          message="Select a Patient"
          description="Please select a patient to configure their measurement settings."
          type="info"
          showIcon
        />
      )
    }

    return (
      <div>
        <div style={{ marginBottom: 24 }}>
          <Space direction="vertical" size={8}>
            <Text strong>Configure measurement settings for:</Text>
            <Select
              value={selectedPatientForSettings}
              onChange={handlePatientChange}
              style={{ width: 300 }}
              placeholder="Select a patient"
            >
              {patients.map(patient => (
                <Option key={patient.id} value={patient.id}>
                  {patient.name}
                </Option>
              ))}
            </Select>
          </Space>
        </div>
        <MeasurementPreferences 
          patientId={selectedPatientForSettings}
          key={selectedPatientForSettings} // Force re-render when patient changes
        />
      </div>
    )
  }

  const tabItems = [
    {
      key: 'profile',
      label: 'Profile',
      children: <ProfileSettings user={user} />
    },
    {
      key: 'measurements',
      label: 'Measurement Settings',
      children: renderMeasurementSettings()
    },
    {
      key: 'notifications',
      label: 'Notifications',
      children: <NotificationSettings />
    },
    {
      key: 'caregivers',
      label: 'Caregivers',
      children: <CaregiverManagement />
    }
  ]

  return (
    <div className="profile-page">
      {/* Quick Actions Bar */}
      <div className="profile-actions-bar">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={handleBack}
          className="back-button"
          size="small"
        >
          Back
        </Button>
      </div>

      {/* Profile Tabs */}
      <div className="profile-tabs-container">
        <Tabs
          defaultActiveKey="profile"
          items={tabItems}
          className="profile-tabs"
        />
      </div>
    </div>
  )
}

export default ProfilePage