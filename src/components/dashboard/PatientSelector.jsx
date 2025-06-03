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

const { Text, Title } = Typography
const { Option } = Select

// Dropdown component only
export const PatientDropdown = () => {
  const { patients, selectedPatient, selectPatient } = usePatients()
  const { token: { colorPrimary, colorBgContainer, borderRadius } } = theme.useToken()

  const handlePatientChange = (patientId) => {
    if (patientId === 'all') {
      selectPatient(null)
    } else {
      selectPatient(patientId)
    }
  }

  const getPatientAge = (dateOfBirth) => {
    return dayjs().diff(dayjs(dateOfBirth), 'year')
  }

  const getSelectedValue = () => {
    return selectedPatient ? selectedPatient.id : 'all'
  }

  return (
    <Select
      value={getSelectedValue()}
      onChange={handlePatientChange}
      placeholder="Select a patient to view their data"
      size="large"
      style={{ 
        width: '300px',
        transition: 'width 0.3s ease'
      }}
      dropdownStyle={{
        padding: '8px',
        borderRadius: borderRadius
      }}
      optionLabelProp="label"
    >
      <Option 
        value="all" 
        key="all" 
        label={
          <Space>
            <GlobalOutlined />
            <span>All Patients</span>
          </Space>
        }
      >
        <div className="patient-option">
          <Space align="center">
            <Avatar 
              icon={<TeamOutlined />} 
              style={{ 
                backgroundColor: `${colorPrimary}20`,
                color: colorPrimary
              }}
            />
            <div>
              <Text strong>All Patients Overview</Text>
              <br />
              <Text type="secondary">{patients.length} patients in care</Text>
            </div>
          </Space>
        </div>
      </Option>
      
      {patients.map(patient => (
        <Option 
          value={patient.id} 
          key={patient.id}
          label={
            <Space>
              <Avatar 
                size="small" 
                icon={<UserOutlined />}
                style={{
                  backgroundColor: patient.id === selectedPatient?.id ? colorPrimary : `${colorPrimary}20`,
                  color: patient.id === selectedPatient?.id ? colorBgContainer : colorPrimary
                }}
              />
              <span>{patient.name}</span>
            </Space>
          }
        >
          <div className="patient-option">
            <Space align="center">
              <Avatar 
                icon={<UserOutlined />}
                style={{
                  backgroundColor: patient.id === selectedPatient?.id ? colorPrimary : `${colorPrimary}20`,
                  color: patient.id === selectedPatient?.id ? colorBgContainer : colorPrimary
                }}
              />
              <div>
                <Text strong>{patient.name}</Text>
                <br />
                <Space size={8}>
                  <Text type="secondary">
                    <CalendarOutlined /> {getPatientAge(patient.dateOfBirth)} years
                  </Text>
                  {patient.medicalConditions?.length > 0 && (
                    <Text type="secondary">
                      <HeartOutlined /> {patient.medicalConditions.length} conditions
                    </Text>
                  )}
                </Space>
              </div>
            </Space>
          </div>
        </Option>
      ))}
    </Select>
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
      type="dashed"
      icon={<PlusOutlined />}
      onClick={handleAddPatient}
      style={{ 
        width: '300px',
        borderRadius: borderRadius
      }}
      size="large"
    >
      Add New Patient
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