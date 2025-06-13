import { Card, Avatar, Typography, Space, Tag, Button, Badge } from 'antd'
import { 
  UserOutlined, 
  WarningOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { usePatients } from '../../hooks/usePatients'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

const { Text, Title } = Typography

const PatientCard = ({ patient }) => {
  const navigate = useNavigate()
  const { selectPatient } = usePatients()

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

  const age = getPatientAge(patient.dateOfBirth)

  const handleCardClick = () => {
    navigate(`/patients/${patient.id}`)
  }

  const handleViewDashboard = (e) => {
    e.stopPropagation()
    selectPatient(patient.id)
    navigate('/')
  }

  const hasCriticalConditions = () => {
    return patient.medicalConditions?.some(condition => 
      ['Diabetes Type 2', 'Hypertension', 'Severe'].some(critical => 
        condition.includes(critical)
      )
    )
  }

  const renderConditions = () => {
    if (!patient.medicalConditions || patient.medicalConditions.length === 0) {
      return (
        <Text type="secondary" style={{ fontSize: '12px' }}>
          No medical conditions recorded
        </Text>
      )
    }

    const displayConditions = patient.medicalConditions.slice(0, 2)
    const remainingCount = patient.medicalConditions.length - 2

    return (
      <Space size={3} wrap>
        {displayConditions.map((condition, index) => (
          <Tag 
            key={index} 
            size="small" 
            color={hasCriticalConditions() ? "red" : "blue"}
            style={{ fontSize: '10px', borderRadius: '6px', margin: '1px 2px' }}
          >
            {condition}
          </Tag>
        ))}
        {remainingCount > 0 && (
          <Tag size="small" color="default" style={{ fontSize: '10px', borderRadius: '6px', margin: '1px 2px' }}>
            +{remainingCount}
          </Tag>
        )}
      </Space>
    )
  }

  const renderAllergies = () => {
    if (!patient.allergies || patient.allergies.length === 0) {
      return null
    }

    return (
      <div style={{ marginTop: '6px' }}>
        <Space align="center" size={3}>
          <WarningOutlined style={{ color: '#fa8c16', fontSize: '10px' }} />
          <Text type="secondary" style={{ fontSize: '10px', fontWeight: '500' }}>
            Allergies:
          </Text>
        </Space>
        <div style={{ marginTop: '2px' }}>
          <Space size={3} wrap>
            {patient.allergies.slice(0, 2).map((allergy, index) => (
              <Tag 
                key={index} 
                size="small" 
                color="orange"
                style={{ fontSize: '10px', borderRadius: '6px', margin: '1px 2px' }}
              >
                {allergy}
              </Tag>
            ))}
            {patient.allergies.length > 2 && (
              <Tag size="small" color="default" style={{ fontSize: '10px', borderRadius: '6px', margin: '1px 2px' }}>
                +{patient.allergies.length - 2}
              </Tag>
            )}
          </Space>
        </div>
      </div>
    )
  }

  const renderQuickInfo = () => {
    const conditionCount = patient.medicalConditions?.length || 0
    const allergyCount = patient.allergies?.length || 0
    
    return (
      <div className="patient-quick-info">
        <Space size={12}>
          <Text type="secondary" style={{ fontSize: '11px' }}>
            <Text strong>{age}</Text> years old
          </Text>
          {conditionCount > 0 && (
            <Text type="secondary" style={{ fontSize: '11px' }}>
              <Text strong>{conditionCount}</Text> condition{conditionCount !== 1 ? 's' : ''}
            </Text>
          )}
          {allergyCount > 0 && (
            <Text type="secondary" style={{ fontSize: '11px', color: '#fa8c16' }}>
              <Text strong>{allergyCount}</Text> allerg{allergyCount !== 1 ? 'ies' : 'y'}
            </Text>
          )}
        </Space>
      </div>
    )
  }

  return (
    <Badge.Ribbon 
      text="Critical" 
      color="red" 
      style={{ display: hasCriticalConditions() ? 'block' : 'none' }}
    >
      <Card
        className="patient-card"
        hoverable
        onClick={handleCardClick}
        variant="filled"
      >
        {/* Patient Header */}
        <div className="patient-header">
          <Space align="start" size={12}>
            <Avatar 
              size={48}
              icon={<UserOutlined />}
              style={{ 
                backgroundColor: hasCriticalConditions() ? '#ff4d4f' : '#1890ff',
                flexShrink: 0
              }}
            />
            <div className="patient-info">
              <Title level={5} className="patient-name">
                {patient.name}
              </Title>
              <Text type="secondary" className="patient-details">
                {patient.gender === 'male' ? '♂' : '♀'} • Added {dayjs(patient.createdAt).fromNow()}
              </Text>
            </div>
          </Space>
        </div>

        {/* Quick Info */}
        {renderQuickInfo()}

        {/* Medical Information */}
        <div className="patient-conditions">
          {renderConditions()}
          {renderAllergies()}
        </div>

        {/* Actions */}
        <div className="patient-actions">
          <Button 
            type="text" 
            size="small"
            onClick={handleViewDashboard}
            className="action-btn"
            block
          >
            View Dashboard
          </Button>
        </div>
      </Card>
    </Badge.Ribbon>
  )
}

export default PatientCard