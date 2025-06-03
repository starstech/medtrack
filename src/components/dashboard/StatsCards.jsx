import { Row, Col, Card, Statistic, Space } from 'antd'
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
      color: '#1890ff',
      visible: !selectedPatient
    },
    {
      title: 'Active Medications',
      value: activeMedications,
      icon: <MedicineBoxOutlined />,
      color: '#52c41a'
    },
    {
      title: 'Doses Taken Today',
      value: takenDoses,
      suffix: `/ ${filteredTodaysDoses.length}`,
      icon: <CheckCircleOutlined />,
      color: '#52c41a'
    },
    {
      title: 'Pending Doses',
      value: pendingDoses,
      icon: <ClockCircleOutlined />,
      color: '#fa8c16'
    },
    {
      title: 'Recent Measurements',
      value: recentMeasurements,
      prefix: 'Last 7 days',
      icon: <ExperimentOutlined />,
      color: '#722ed1'
    },
    {
      title: 'Upcoming Appointments',
      value: filteredAppointments.length,
      prefix: 'Next 7 days',
      icon: <CalendarOutlined />,
      color: '#13c2c2'
    }
  ]

  const visibleStats = statsData.filter(stat => stat.visible !== false)

  return (
    <div className="stats-cards">
      <Row gutter={[12, 12]}>
        {visibleStats.map((stat, index) => (
          <Col 
            key={index} 
            xs={12} 
            sm={12} 
            md={8} 
            lg={selectedPatient ? 8 : 6}
            xl={selectedPatient ? 8 : 4}
          >
            <Card 
              className="stat-card" 
              bodyStyle={{ padding: '16px 12px' }}
              hoverable
            >
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <div className="stat-header">
                  <div 
                    className="stat-icon"
                    style={{ color: stat.color }}
                  >
                    {stat.icon}
                  </div>
                </div>
                
                <Statistic
                  value={stat.value}
                  suffix={stat.suffix}
                  prefix={stat.prefix}
                  valueStyle={{ 
                    fontSize: '20px', 
                    fontWeight: 'bold',
                    color: stat.color,
                    lineHeight: 1.2
                  }}
                />
                
                <div className="stat-title">
                  {stat.title}
                </div>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  )
}

export default StatsCards