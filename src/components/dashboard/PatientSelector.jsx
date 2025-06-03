import { Card, Select, Button, Space, Typography, Avatar, Tag, theme } from 'antd'
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
import { mockPatients } from '../../utils/mockData'

const { Text, Title } = Typography
const { Option } = Select

// Dropdown component only
export const PatientDropdown = () => {
  const { selectedPatient, selectPatient } = usePatients()
  
  // Use mock data for immediate functionality
  const patients = mockPatients
  
  const handlePatientChange = (patientId) => {
    selectPatient(patientId)
  }

  const selectedPatientData = patients.find(p => p.id === selectedPatient?.id) || selectedPatient

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
          placeholder="Select a patient"
          size="large"
          className="patient-dropdown"
          allowClear
          showSearch
          filterOption={(input, option) =>
            option?.label?.toLowerCase().includes(input.toLowerCase())
          }
          options={patients.map(patient => ({
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
                  {option.data.patient?.medicalConditions?.join(', ') || 'No conditions'}
                </Text>
              </div>
            </Space>
          )}
        />
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
      bordered={false}
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
                <Text type="secondary">{getPatientAge(selectedPatient.dateOfBirth)} years</Text>
                <Text type="secondary">{selectedPatient.gender}</Text>
              </Space>
              {selectedPatient.caregivers?.length > 0 && (
                <Text type="secondary" style={{ fontSize: '13px', display: 'block', marginTop: '4px' }}>
                  {selectedPatient.caregivers.length} caregiver{selectedPatient.caregivers.length !== 1 ? 's' : ''} assigned
                </Text>
              )}
            </div>
          </Space>
        </div>

        {/* Medical conditions */}
        {selectedPatient.medicalConditions?.length > 0 && (
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
              {selectedPatient.medicalConditions.slice(0, 3).map((condition, index) => (
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
              {selectedPatient.medicalConditions.length > 3 && (
                <Tag
                  color="default"
                  style={{
                    borderRadius: '6px',
                    padding: '2px 8px',
                    fontSize: '12px',
                    border: 'none'
                  }}
                >
                  +{selectedPatient.medicalConditions.length - 3} more
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