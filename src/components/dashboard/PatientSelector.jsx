import { Card, Select, Button, Space, Typography, Avatar, Tag, theme, Spin } from 'antd'
import { 
  UserOutlined, 
  PlusOutlined, 
  TeamOutlined,
  GlobalOutlined,
  HeartOutlined,
  CalendarOutlined
} from '@ant-design/icons'
import { usePatients } from '../../hooks/usePatients'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'

const { Text, Title } = Typography
const { Option } = Select

// Dropdown component only
export const PatientDropdown = () => {
  const { patients, selectedPatient, selectPatient, loading, error } = usePatients()
  
  const handlePatientChange = (patientId) => {
    selectPatient(patientId)
  }

  const patientsList = patients || []
  const selectedPatientData = patientsList.find(p => p.id === selectedPatient?.id) || selectedPatient

  const getPatientAge = (dateOfBirth) => {
    return dayjs().diff(dayjs(dateOfBirth), 'year')
  }

  return (
    <div className="patient-selector">
      <Space direction="vertical" size={8}>
        <Text type="secondary" strong>
          Current Patient
        </Text>
        <Select
          value={selectedPatientData?.id}
          onChange={handlePatientChange}
          placeholder={loading ? "Loading patients..." : "Select a patient"}
          size="large"
          className="patient-dropdown"
          style={{ minWidth: '280px' }}
          allowClear
          showSearch
          loading={loading}
          disabled={loading || error}
          filterOption={(input, option) =>
            option?.label?.toLowerCase().includes(input.toLowerCase())
          }
          options={patientsList.map(patient => ({
            value: patient.id,
            label: patient.name,
            patient: patient
          }))}
          styles={{
            popup: {
              root: {
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                border: '1px solid #f0f0f0'
              }
            }
          }}
          optionRender={(option) => (
            <Space>
              <Avatar 
                size="small" 
                icon={<UserOutlined />}
                style={{ backgroundColor: '#1890ff' }}
              />
              <div>
                <Text strong>{option.data.label}</Text>
                <br />
                <Text type="secondary" size="small">
                  {(option.data.patient?.medical_conditions || option.data.patient?.medicalConditions)?.join(', ') || 'No conditions'}
                </Text>
              </div>
            </Space>
          )}
          notFoundContent={
            error ? (
              <div style={{ padding: '16px', textAlign: 'center' }}>
                <Text type="danger">Error loading patients</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>{error}</Text>
              </div>
            ) : loading ? (
              <div style={{ padding: '16px', textAlign: 'center' }}>
                <Spin size="small" />
                <Text type="secondary" style={{ marginLeft: '8px' }}>Loading...</Text>
              </div>
            ) : (
              <div style={{ padding: '16px', textAlign: 'center' }}>
                <Text type="secondary">No patients found</Text>
              </div>
            )
          }
        />
        {error && (
          <Text type="danger" style={{ fontSize: '12px' }}>
            Failed to load patients: {error}
          </Text>
        )}
      </Space>
    </div>
  )
}

// Add Patient Button component
export const AddPatientButton = () => {
  const navigate = useNavigate()
  const { token: { borderRadius } } = theme.useToken()

  const handleAddPatient = () => {
    navigate('/patients')
  }

  return (
    <Button
      type="primary"
      icon={<PlusOutlined />}
      onClick={handleAddPatient}
      size="large"
      className="add-patient-button"
    >
      Add Patient
    </Button>
  )
}

// Selected Patient Card component
export const SelectedPatientCard = () => {
  const { selectedPatient } = usePatients()
  const { token: { colorPrimary, colorBgContainer } } = theme.useToken()

  const getPatientAge = (dateOfBirth) => {
    return dayjs().diff(dayjs(dateOfBirth), 'year')
  }

  if (!selectedPatient) {
    return null
  }

  // Handle both database schema formats
  const patientDateOfBirth = selectedPatient.date_of_birth || selectedPatient.dateOfBirth
  const patientMedicalConditions = selectedPatient.medical_conditions || selectedPatient.medicalConditions
  const patientCaregivers = selectedPatient.patient_caregivers || selectedPatient.caregivers

  return (
    <Card 
      className="selected-patient-card stat-card"
      style={{
        width: '300px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
        transition: 'all 0.3s ease',
        border: 'none'
      }}
      bodyStyle={{ padding: '20px' }}
      variant="filled"
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Header with avatar and basic info */}
        <div className="patient-card-header">
          <Space align="start" size="middle">
            <Avatar 
              size={56}
              icon={<UserOutlined />}
              style={{
                backgroundColor: colorPrimary,
                color: colorBgContainer,
                fontSize: '24px'
              }}
            />
            <div className="patient-basic-info">
              <Title level={4} style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
                {selectedPatient.name}
              </Title>
              <Space split="•" style={{ color: 'rgba(0,0,0,0.45)', fontSize: '14px' }}>
                {patientDateOfBirth && (
                  <Text type="secondary">{getPatientAge(patientDateOfBirth)} years</Text>
                )}
                {selectedPatient.gender && (
                  <Text type="secondary">{selectedPatient.gender}</Text>
                )}
              </Space>
              {patientCaregivers?.length > 0 && (
                <Text type="secondary" style={{ fontSize: '13px', display: 'block', marginTop: '4px' }}>
                  {patientCaregivers.length} caregiver{patientCaregivers.length !== 1 ? 's' : ''} assigned
                </Text>
              )}
            </div>
          </Space>
        </div>

        {/* Medical conditions */}
        {patientMedicalConditions?.length > 0 && (
          <div className="patient-conditions-section">
            <Text 
              type="secondary" 
              style={{ 
                display: 'block', 
                marginBottom: '8px',
                fontSize: '13px',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              Medical Conditions
            </Text>
            <Space size={[6, 6]} wrap>
              {patientMedicalConditions.slice(0, 3).map((condition, index) => (
                <Tag
                  key={index}
                  color="blue"
                  style={{
                    borderRadius: '6px',
                    padding: '2px 8px',
                    fontSize: '12px',
                    border: 'none'
                  }}
                >
                  {condition}
                </Tag>
              ))}
              {patientMedicalConditions.length > 3 && (
                <Tag
                  color="default"
                  style={{
                    borderRadius: '6px',
                    padding: '2px 8px',
                    fontSize: '12px',
                    border: 'none'
                  }}
                >
                  +{patientMedicalConditions.length - 3} more
                </Tag>
              )}
            </Space>
          </div>
        )}
      </Space>
    </Card>
  )
}

// Legacy PatientSelector component for backward compatibility
const PatientSelector = () => {
  return (
    <div className="patient-selector">
      <PatientDropdown />
      <div style={{ marginTop: '16px' }}>
        <SelectedPatientCard />
      </div>
      <div style={{ marginTop: '16px' }}>
        <AddPatientButton />
      </div>
    </div>
  )
}

export default PatientSelector