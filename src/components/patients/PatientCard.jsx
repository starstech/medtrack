import { Card, Avatar, Typography, Space, Tag, Button, Badge, Dropdown } from 'antd'
import { 
  UserOutlined, 
  MedicineBoxOutlined, 
  ExperimentOutlined,
  CalendarOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { usePatients } from '../../hooks/usePatients'
import { getMedicationsByPatient, getMeasurementsByPatient, getUpcomingAppointments } from '../../utils/mockData'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

const { Text, Title } = Typography
const { Meta } = Card

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

  const getPatientStats = () => {
    const medications = getMedicationsByPatient(patient.id)
    const activeMedications = medications.filter(med => med.isActive).length
    
    const measurements = getMeasurementsByPatient(patient.id)
    const recentMeasurements = measurements.filter(measure => 
      dayjs().diff(dayjs(measure.recordedAt), 'days') <= 7
    ).length

    const upcomingAppointments = getUpcomingAppointments(30)
    const patientAppointments = upcomingAppointments.filter(apt => apt.patientId === patient.id).length

    return {
      activeMedications,
      recentMeasurements,
      upcomingAppointments: patientAppointments
    }
  }

  const stats = getPatientStats()

  const handleCardClick = () => {
    navigate(`/patients/${patient.id}`)
  }

  const handleViewDashboard = () => {
    selectPatient(patient.id)
    navigate('/')
  }

  const handleEditPatient = (e) => {
    e.stopPropagation()
    // TODO: Open edit patient modal
    console.log('Edit patient:', patient.id)
  }

  const handleDeletePatient = (e) => {
    e.stopPropagation()
    // TODO: Open delete confirmation modal
    console.log('Delete patient:', patient.id)
  }

  const menuItems = [
    {
      key: 'view',
      icon: <EyeOutlined />,
      label: 'View Dashboard',
      onClick: handleViewDashboard
    },
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: 'Edit Patient',
      onClick: handleEditPatient
    },
    {
      type: 'divider'
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: 'Delete Patient',
      onClick: handleDeletePatient,
      danger: true
    }
  ]

  const renderConditions = () => {
    if (!patient.medicalConditions || patient.medicalConditions.length === 0) {
      return <Text type="secondary" size="small">No conditions</Text>
    }

    const displayConditions = patient.medicalConditions.slice(0, 2)
    const remainingCount = patient.medicalConditions.length - 2

    return (
      <Space size={4} wrap>
        {displayConditions.map((condition, index) => (
          <Tag key={index} size="small" color="blue">
            {condition}
          </Tag>
        ))}
        {remainingCount > 0 && (
          <Tag size="small" color="default">
            +{remainingCount} more
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
      <div className="patient-allergies">
        <Text type="secondary" size="small">Allergies:</Text>
        <Space size={4} wrap style={{ marginTop: 4 }}>
          {patient.allergies.slice(0, 2).map((allergy, index) => (
            <Tag key={index} size="small" color="red">
              {allergy}
            </Tag>
          ))}
          {patient.allergies.length > 2 && (
            <Tag size="small" color="default">
              +{patient.allergies.length - 2} more
            </Tag>
          )}
        </Space>
      </div>
    )
  }

  const hasUrgentItems = () => {
    // Check for overdue medications or urgent conditions
    return stats.activeMedications > 5 || patient.medicalConditions?.includes('Severe')
  }

  return (
    <Badge.Ribbon 
      text="Urgent" 
      color="red" 
      style={{ display: hasUrgentItems() ? 'block' : 'none' }}
    >
      <Card
        className="patient-card"
        hoverable
        onClick={handleCardClick}
        actions={[
          <Button
            key="dashboard"
            type="text"
            icon={<EyeOutlined />}
            onClick={(e) => {
              e.stopPropagation()
              handleViewDashboard()
            }}
            className="card-action-btn"
          >
            Dashboard
          </Button>,
          <Dropdown
            key="more"
            menu={{ items: menuItems }}
            placement="bottomRight"
            trigger={['click']}
          >
            <Button
              type="text"
              icon={<MoreOutlined />}
              onClick={(e) => e.stopPropagation()}
              className="card-action-btn"
            >
              More
            </Button>
          </Dropdown>
        ]}
      >
        <Meta
          avatar={
            <Avatar 
              size={48} 
              icon={<UserOutlined />}
              className="patient-avatar"
            />
          }
          title={
            <div className="patient-card-header">
              <Title level={4} className="patient-name">
                {patient.name}
              </Title>
              <Text type="secondary" className="patient-age">
                {getPatientAge(patient.dateOfBirth)} years old
              </Text>
            </div>
          }
          description={
            <Space direction="vertical" size="small" className="patient-card-content">
              {/* Medical Conditions */}
              <div className="patient-conditions">
                <Text type="secondary" size="small" className="section-label">
                  Conditions:
                </Text>
                {renderConditions()}
              </div>

              {/* Allergies */}
              {renderAllergies()}

              {/* Statistics */}
              <div className="patient-stats">
                <Space size="middle" wrap>
                  <div className="stat-item">
                    <MedicineBoxOutlined className="stat-icon" />
                    <Space direction="vertical" size={0}>
                      <Text strong className="stat-number">{stats.activeMedications}</Text>
                      <Text type="secondary" size="small">Active Meds</Text>
                    </Space>
                  </div>

                  <div className="stat-item">
                    <ExperimentOutlined className="stat-icon" />
                    <Space direction="vertical" size={0}>
                      <Text strong className="stat-number">{stats.recentMeasurements}</Text>
                      <Text type="secondary" size="small">Recent Tests</Text>
                    </Space>
                  </div>

                  <div className="stat-item">
                    <CalendarOutlined className="stat-icon" />
                    <Space direction="vertical" size={0}>
                      <Text strong className="stat-number">{stats.upcomingAppointments}</Text>
                      <Text type="secondary" size="small">Upcoming</Text>
                    </Space>
                  </div>
                </Space>
              </div>

              {/* Caregivers Info */}
              <div className="patient-caregivers">
                <Text type="secondary" size="small">
                  {patient.caregivers?.length || 0} caregiver{(patient.caregivers?.length || 0) !== 1 ? 's' : ''}
                  {patient.caregivers?.length > 0 && (
                    <span> • Primary: {patient.caregivers.find(c => c.role === 'primary')?.name || 'Unknown'}</span>
                  )}
                </Text>
              </div>

              {/* Last Updated */}
              <div className="patient-last-updated">
                <Text type="secondary" size="small">
                  Added {dayjs(patient.createdAt).fromNow()}
                </Text>
              </div>
            </Space>
          }
        />
      </Card>
    </Badge.Ribbon>
  )
}

export default PatientCard