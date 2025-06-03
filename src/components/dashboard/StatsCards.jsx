import { Row, Col, Card, Statistic, Space, Progress, theme } from 'antd'
import { 
  UserOutlined, 
  MedicineBoxOutlined, 
  ExperimentOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons'
import { usePatients } from '../../hooks/usePatients'
import { getUpcomingAppointments } from '../../utils/mockData'
import dayjs from 'dayjs'

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

  const statsData = [
    {
      title: 'Total Patients',
      value: filteredPatients.length,
      icon: <UserOutlined />,
      color: colorPrimary,
      visible: !selectedPatient,
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

  const visibleStats = statsData.filter(stat => stat.visible !== false)

  return (
    <div className="stats-cards">
      <Row gutter={[16, 16]}>
        {visibleStats.map((stat, index) => (
          <Col 
            key={index} 
            xs={24} 
            sm={12} 
            md={8} 
            lg={6}
          >
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
          </Col>
        ))}
      </Row>
    </div>
  )
}

export default StatsCards