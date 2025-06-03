import { Row, Col, Card, Statistic, Space, Progress, theme, Avatar, Tag, Typography } from 'antd'
import { 
  UserOutlined, 
  MedicineBoxOutlined, 
  ExperimentOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  HeartOutlined
} from '@ant-design/icons'
import { usePatients } from '../../hooks/usePatients'
import { getUpcomingAppointments } from '../../utils/mockData'
import dayjs from 'dayjs'

const { Text } = Typography

const StatsCards = () => {
  const { 
    patients, 
    selectedPatient, 
    medications, 
    measurements, 
    getTodaysDoses 
  } = usePatients()

  const {
    token: { colorPrimary, colorSuccess, colorWarning, colorInfo }
  } = theme.useToken()

  // Filter data based on selected patient
  const filteredPatients = selectedPatient ? [selectedPatient] : patients
  const filteredMedications = selectedPatient 
    ? medications.filter(med => med.patientId === selectedPatient.id)
    : medications
  const filteredMeasurements = selectedPatient
    ? measurements.filter(measure => measure.patientId === selectedPatient.id)
    : measurements

  // Calculate stats
  const activeMedications = filteredMedications.filter(med => med.isActive).length
  const todaysDoses = getTodaysDoses()
  const filteredTodaysDoses = selectedPatient
    ? todaysDoses.filter(dose => dose.patient.id === selectedPatient.id)
    : todaysDoses
  
  const takenDoses = filteredTodaysDoses.filter(dose => dose.status === 'taken').length
  const pendingDoses = filteredTodaysDoses.filter(dose => dose.status === 'pending').length
  const totalDoses = filteredTodaysDoses.length
  
  const recentMeasurements = filteredMeasurements.filter(measure => 
    dayjs().diff(dayjs(measure.recordedAt), 'days') <= 7
  ).length

  const upcomingAppointments = getUpcomingAppointments(7)
  const filteredAppointments = selectedPatient
    ? upcomingAppointments.filter(apt => apt.patientId === selectedPatient.id)
    : upcomingAppointments

  const getPatientAge = (dateOfBirth) => {
    return dayjs().diff(dayjs(dateOfBirth), 'year')
  }

  // Custom Selected Patient Card Component
  const SelectedPatientCard = () => (
    <Card className="stat-card selected-patient-stat-card" bordered={false}>
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        <div className="stat-header">
          <Avatar 
            size={32}
            icon={<UserOutlined />}
            style={{
              backgroundColor: colorPrimary,
              color: '#fff'
            }}
          />
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <div className="stat-title" style={{ fontSize: '12px', marginBottom: '4px' }}>
            Selected Patient
          </div>
          <Text strong style={{ 
            fontSize: '16px', 
            fontWeight: 600, 
            color: colorPrimary,
            display: 'block',
            marginBottom: '2px'
          }}>
            {selectedPatient.name}
          </Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {getPatientAge(selectedPatient.dateOfBirth)} years • {selectedPatient.gender}
          </Text>
        </div>

        {selectedPatient.medicalConditions?.length > 0 && (
          <div style={{ textAlign: 'center', marginTop: '4px' }}>
            <Space size={[4, 4]} wrap style={{ justifyContent: 'center' }}>
              {selectedPatient.medicalConditions.slice(0, 2).map((condition, index) => (
                <Tag
                  key={index}
                  color="blue"
                  style={{
                    fontSize: '10px',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    border: 'none'
                  }}
                >
                  {condition}
                </Tag>
              ))}
              {selectedPatient.medicalConditions.length > 2 && (
                <Tag
                  color="default"
                  style={{
                    fontSize: '10px',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    border: 'none'
                  }}
                >
                  +{selectedPatient.medicalConditions.length - 2}
                </Tag>
              )}
            </Space>
          </div>
        )}
      </Space>
    </Card>
  )

  const statsData = [
    // First card: Either Total Patients or Selected Patient
    selectedPatient ? {
      component: <SelectedPatientCard />,
      isCustom: true
    } : {
      title: 'Total Patients',
      value: filteredPatients.length,
      icon: <UserOutlined />,
      color: colorPrimary,
      description: 'Active patients under care'
    },
    {
      title: 'Active Medications',
      value: activeMedications,
      icon: <MedicineBoxOutlined />,
      color: colorSuccess,
      description: 'Currently prescribed medications'
    },
    {
      title: 'Medication Adherence',
      value: totalDoses ? Math.round((takenDoses / totalDoses) * 100) : 0,
      icon: <CheckCircleOutlined />,
      color: colorSuccess,
      suffix: '%',
      showProgress: true,
      description: `${takenDoses} of ${totalDoses} doses taken today`
    },
    {
      title: 'Pending Doses',
      value: pendingDoses,
      icon: <ClockCircleOutlined />,
      color: colorWarning,
      description: 'Doses waiting to be taken'
    },
    {
      title: 'Recent Measurements',
      value: recentMeasurements,
      icon: <ExperimentOutlined />,
      color: '#722ed1',
      description: 'Recorded in the last 7 days'
    },
    {
      title: 'Upcoming Appointments',
      value: filteredAppointments.length,
      icon: <CalendarOutlined />,
      color: colorInfo,
      description: 'Scheduled in the next 7 days'
    }
  ]

  return (
    <div className="stats-cards">
      <Row gutter={[16, 16]}>
        {statsData.map((stat, index) => (
          <Col 
            key={index} 
            xs={24} 
            sm={12} 
            md={8} 
            lg={4}
            xl={4}
          >
            {stat.isCustom ? stat.component : (
              <Card 
                className="stat-card" 
                bordered={false}
              >
                <div className="stat-header">
                  <div 
                    className="stat-icon"
                    style={{ 
                      color: stat.color,
                      background: `${stat.color}10`
                    }}
                  >
                    {stat.icon}
                  </div>
                </div>
                
                <Statistic
                  title={
                    <div className="stat-title">
                      {stat.title}
                    </div>
                  }
                  value={stat.value}
                  suffix={stat.suffix}
                  valueStyle={{
                    color: stat.color,
                    fontSize: '28px',
                    fontWeight: 600,
                    lineHeight: 1.2,
                    marginBottom: '8px'
                  }}
                />

                {stat.showProgress && (
                  <Progress 
                    percent={stat.value} 
                    strokeColor={stat.color}
                    size="small"
                    showInfo={false}
                    style={{ marginBottom: '8px' }}
                  />
                )}
                
                <div className="stat-description" style={{ color: 'rgba(0, 0, 0, 0.45)' }}>
                  {stat.description}
                </div>
              </Card>
            )}
          </Col>
        ))}
      </Row>
    </div>
  )
}

export default StatsCards