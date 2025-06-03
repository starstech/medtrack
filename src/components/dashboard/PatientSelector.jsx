import { Card, Select, Button, Space, Typography, Avatar, Tag } from 'antd'
import { 
  UserOutlined, 
  PlusOutlined, 
  TeamOutlined,
  GlobalOutlined 
} from '@ant-design/icons'
import { usePatients } from '../../hooks/usePatients'
import { useNavigate } from 'react-router-dom'

const { Text } = Typography
const { Option } = Select

const PatientSelector = () => {
  const { patients, selectedPatient, selectPatient } = usePatients()
  const navigate = useNavigate()

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
    const today = new Date()
    const birth = new Date(dateOfBirth)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    
    return age
  }

  const getSelectedValue = () => {
    return selectedPatient ? selectedPatient.id : 'all'
  }

  return (
    <Card className="patient-selector-card" bodyStyle={{ padding: '16px' }}>
      <div className="patient-selector-header">
        <Space align="center">
          <TeamOutlined className="selector-icon" />
          <Text strong>Patient View</Text>
        </Space>
      </div>

      <div className="patient-selector-content">
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {/* Patient Selector */}
          <Select
            value={getSelectedValue()}
            onChange={handlePatientChange}
            placeholder="Select a patient to view their data"
            size="large"
            style={{ width: '100%' }}
            className="patient-select"
          >
            <Option value="all" key="all">
              <Space>
                <GlobalOutlined />
                <span>All Patients Overview</span>
              </Space>
            </Option>
            
            {patients.map(patient => (
              <Option value={patient.id} key={patient.id}>
                <Space>
                  <Avatar size="small" icon={<UserOutlined />} />
                  <div>
                    <div style={{ fontWeight: 500 }}>{patient.name}</div>
                    <Text type="secondary" size="small">
                      {getPatientAge(patient.dateOfBirth)} years old
                    </Text>
                  </div>
                </Space>
              </Option>
            ))}
          </Select>

          {/* Selected Patient Info */}
          {selectedPatient && (
            <div className="selected-patient-info">
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <div className="patient-details">
                  <Space>
                    <Avatar icon={<UserOutlined />} />
                    <div>
                      <Text strong>{selectedPatient.name}</Text>
                      <br />
                      <Text type="secondary" size="small">
                        {getPatientAge(selectedPatient.dateOfBirth)} years old • {selectedPatient.gender}
                      </Text>
                    </div>
                  </Space>
                </div>

                {/* Medical Conditions */}
                {selectedPatient.medicalConditions?.length > 0 && (
                  <div className="patient-conditions">
                    <Text type="secondary" size="small">Conditions:</Text>
                    <div style={{ marginTop: 4 }}>
                      {selectedPatient.medicalConditions.map((condition, index) => (
                        <Tag key={index} size="small" color="blue">
                          {condition}
                        </Tag>
                      ))}
                    </div>
                  </div>
                )}

                {/* Caregivers */}
                <div className="patient-caregivers">
                  <Text type="secondary" size="small">
                    Caregivers: {selectedPatient.caregivers?.length || 0}
                  </Text>
                </div>
              </Space>
            </div>
          )}

          {/* Add Patient Button */}
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={handleAddPatient}
            block
            className="add-patient-button"
          >
            Add New Patient
          </Button>
        </Space>
      </div>
    </Card>
  )
}

export default PatientSelector