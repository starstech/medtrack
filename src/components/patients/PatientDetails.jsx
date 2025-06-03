import { Card, Row, Col, Typography, Tag, Space, Avatar, Button } from 'antd'
import { 
  UserOutlined,
  EditOutlined,
  PhoneOutlined,
  CalendarOutlined,
  HeartOutlined,
  AlertOutlined,
  TeamOutlined,
  MailOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import './PatientDetails.css'

const { Title, Text } = Typography

const PatientDetails = ({ patient }) => {
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

  const handleEditPatient = () => {
    // TODO: Open edit patient modal
    console.log('Edit patient:', patient.id)
  }

  const renderBasicInfo = () => (
    <Card 
      title={
        <Space>
          <UserOutlined />
          <span>Basic Information</span>
        </Space>
      }
      extra={
        <Button 
          type="link" 
          icon={<EditOutlined />} 
          onClick={handleEditPatient}
        >
          Edit
        </Button>
      }
      className="patient-info-card"
    >
      <Row gutter={[24, 16]}>
        <Col xs={24} sm={8}>
          <div className="patient-avatar-section">
            <Avatar 
              size={80} 
              icon={<UserOutlined />}
              className="patient-avatar-large"
            />
            <div className="patient-name-section">
              <Title level={4} className="patient-name">
                {patient.name}
              </Title>
              <Text type="secondary">
                {getPatientAge(patient.dateOfBirth)} years old • {patient.gender}
              </Text>
            </div>
          </div>
        </Col>
        
        <Col xs={24} sm={16}>
          <Row gutter={[16, 12]}>
            <Col xs={24} sm={12}>
              <div className="info-item">
                <Text type="secondary" className="info-label">Date of Birth</Text>
                <div className="info-value">
                  <CalendarOutlined className="info-icon" />
                  <Text strong>{dayjs(patient.dateOfBirth).format('MMMM D, YYYY')}</Text>
                </div>
              </div>
            </Col>
            
            <Col xs={24} sm={12}>
              <div className="info-item">
                <Text type="secondary" className="info-label">Gender</Text>
                <div className="info-value">
                  <UserOutlined className="info-icon" />
                  <Text strong>{patient.gender}</Text>
                </div>
              </div>
            </Col>
            
            <Col xs={24}>
              <div className="info-item">
                <Text type="secondary" className="info-label">Member Since</Text>
                <div className="info-value">
                  <CalendarOutlined className="info-icon" />
                  <Text strong>{dayjs(patient.createdAt).format('MMMM D, YYYY')}</Text>
                  <Text type="secondary"> ({dayjs(patient.createdAt).fromNow()})</Text>
                </div>
              </div>
            </Col>
          </Row>
        </Col>
      </Row>
    </Card>
  )

  const renderMedicalInfo = () => (
    <Card 
      title={
        <Space>
          <HeartOutlined />
          <span>Medical Information</span>
        </Space>
      }
      className="patient-info-card"
    >
      <Row gutter={[24, 16]}>
        <Col xs={24} sm={12}>
          <div className="medical-section">
            <Text strong className="section-title">Medical Conditions</Text>
            {patient.medicalConditions && patient.medicalConditions.length > 0 ? (
              <div className="tags-container">
                {patient.medicalConditions.map((condition, index) => (
                  <Tag key={index} color="blue" className="medical-tag">
                    {condition}
                  </Tag>
                ))}
              </div>
            ) : (
              <Text type="secondary">No medical conditions recorded</Text>
            )}
          </div>
        </Col>
        
        <Col xs={24} sm={12}>
          <div className="medical-section">
            <Text strong className="section-title">Allergies</Text>
            {patient.allergies && patient.allergies.length > 0 ? (
              <div className="tags-container">
                {patient.allergies.map((allergy, index) => (
                  <Tag key={index} color="red" className="allergy-tag">
                    <AlertOutlined className="tag-icon" />
                    {allergy}
                  </Tag>
                ))}
              </div>
            ) : (
              <Text type="secondary">No known allergies</Text>
            )}
          </div>
        </Col>
      </Row>
    </Card>
  )

  const renderEmergencyContact = () => (
    <Card 
      title={
        <Space>
          <PhoneOutlined />
          <span>Emergency Contact</span>
        </Space>
      }
      className="patient-info-card"
    >
      {patient.emergencyContact ? (
        <Row gutter={[16, 12]}>
          <Col xs={24} sm={8}>
            <div className="info-item">
              <Text type="secondary" className="info-label">Name</Text>
              <div className="info-value">
                <UserOutlined className="info-icon" />
                <Text strong>{patient.emergencyContact.name}</Text>
              </div>
            </div>
          </Col>
          
          <Col xs={24} sm={8}>
            <div className="info-item">
              <Text type="secondary" className="info-label">Relationship</Text>
              <div className="info-value">
                <TeamOutlined className="info-icon" />
                <Text strong>{patient.emergencyContact.relationship}</Text>
              </div>
            </div>
          </Col>
          
          <Col xs={24} sm={8}>
            <div className="info-item">
              <Text type="secondary" className="info-label">Phone</Text>
              <div className="info-value">
                <PhoneOutlined className="info-icon" />
                <Text strong>{patient.emergencyContact.phone}</Text>
              </div>
            </div>
          </Col>
        </Row>
      ) : (
        <Text type="secondary">No emergency contact information</Text>
      )}
    </Card>
  )

  const renderCaregivers = () => (
    <Card 
      title={
        <Space>
          <TeamOutlined />
          <span>Caregivers ({patient.caregivers?.length || 0})</span>
        </Space>
      }
      extra={
        <Button type="link" icon={<EditOutlined />}>
          Manage
        </Button>
      }
      className="patient-info-card"
    >
      {patient.caregivers && patient.caregivers.length > 0 ? (
        <div className="caregivers-list">
          {patient.caregivers.map((caregiver, index) => (
            <div key={caregiver.id || index} className="caregiver-item">
              <Avatar size="small" icon={<UserOutlined />} />
              <div className="caregiver-info">
                <Text strong>{caregiver.name}</Text>
                <Text type="secondary" size="small">
                  {caregiver.role} caregiver
                </Text>
              </div>
              {caregiver.email && (
                <div className="caregiver-contact">
                  <MailOutlined className="contact-icon" />
                  <Text size="small">{caregiver.email}</Text>
                </div>
              )}
              <Tag 
                color={caregiver.role === 'primary' ? 'green' : 'blue'}
                size="small"
              >
                {caregiver.role}
              </Tag>
            </div>
          ))}
        </div>
      ) : (
        <Text type="secondary">No caregivers assigned</Text>
      )}
    </Card>
  )

  return (
    <div className="patient-details">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {renderBasicInfo()}
        {renderMedicalInfo()}
        {renderEmergencyContact()}
        {renderCaregivers()}
      </Space>
    </div>
  )
}

export default PatientDetails