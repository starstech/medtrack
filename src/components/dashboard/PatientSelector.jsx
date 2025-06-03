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

const PatientSelector = () => {
  const { patients, selectedPatient, selectPatient } = usePatients()
  const navigate = useNavigate()
  const { token: { colorPrimary, colorBgContainer, borderRadius } } = theme.useToken()

  const handlePatientChange = (patientId) => {
    if (patientId === 'all') {
      selectPatient(null)
    } else {
      selectPatient(patientId)
    }
  }

  const handleAddPatient = () => {
    navigate('/patients')
  }

  const getPatientAge = (dateOfBirth) => {
    return dayjs().diff(dayjs(dateOfBirth), 'year')
  }

  const getSelectedValue = () => {
    return selectedPatient ? selectedPatient.id : 'all'
  }

  return (
    <div className="patient-selector">
      <Select
        value={getSelectedValue()}
        onChange={handlePatientChange}
        placeholder="Select a patient to view their data"
        size="large"
        style={{ 
          width: selectedPatient ? '300px' : '240px',
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

      {selectedPatient && (
        <Card 
          className="selected-patient-card"
          style={{
            marginTop: '16px',
            borderRadius: borderRadius,
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}
          bodyStyle={{ padding: '16px' }}
          bordered={false}
        >
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Space align="start">
              <Avatar 
                size={64}
                icon={<UserOutlined />}
                style={{
                  backgroundColor: colorPrimary,
                  color: colorBgContainer
                }}
              />
              <div>
                <Title level={4} style={{ margin: 0 }}>{selectedPatient.name}</Title>
                <Space split="•" style={{ color: 'rgba(0,0,0,0.45)' }}>
                  <Text type="secondary">{getPatientAge(selectedPatient.dateOfBirth)} years</Text>
                  <Text type="secondary">{selectedPatient.gender}</Text>
                  {selectedPatient.caregivers?.length > 0 && (
                    <Text type="secondary">{selectedPatient.caregivers.length} caregivers</Text>
                  )}
                </Space>
              </div>
            </Space>

            {selectedPatient.medicalConditions?.length > 0 && (
              <div>
                <Text type="secondary" style={{ display: 'block', marginBottom: '8px' }}>
                  Medical Conditions
                </Text>
                <Space size={[4, 8]} wrap>
                  {selectedPatient.medicalConditions.map((condition, index) => (
                    <Tag
                      key={index}
                      color="blue"
                      style={{
                        borderRadius: '12px',
                        padding: '4px 12px'
                      }}
                    >
                      {condition}
                    </Tag>
                  ))}
                </Space>
              </div>
            )}
          </Space>
        </Card>
      )}

      <Button
        type="dashed"
        icon={<PlusOutlined />}
        onClick={handleAddPatient}
        style={{ 
          marginTop: '16px',
          width: '100%',
          borderRadius: borderRadius
        }}
      >
        Add New Patient
      </Button>
    </div>
  )
}

export default PatientSelector