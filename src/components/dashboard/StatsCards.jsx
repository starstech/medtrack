import { Row, Col, Card, Statistic, Space, Progress, theme, Avatar, Tag, Typography, Spin } from 'antd'
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
import { appointmentService } from '../../services/appointmentService'
import { useState, useEffect } from 'react'
import dayjs from 'dayjs'

const { Text } = Typography

const StatsCards = () => {
  const { 
    patients, 
    selectedPatient, 
    medications, 
    measurements, 
    getTodaysDoses,
    loading: patientsLoading,
    error: patientsError
  } = usePatients()

  // Appointment data state
  const [upcomingAppointments, setUpcomingAppointments] = useState([])
  const [appointmentsLoading, setAppointmentsLoading] = useState(true)
  const [appointmentsError, setAppointmentsError] = useState(null)

  const {
    token: { colorPrimary, colorSuccess, colorWarning, colorInfo }
  } = theme.useToken()

  // Load upcoming appointments
  useEffect(() => {
    const loadUpcomingAppointments = async () => {
      try {
        setAppointmentsLoading(true)
        setAppointmentsError(null)

        const { data: upcoming, error } = await appointmentService.getUpcomingAppointments(7)
        if (error) {
          console.warn('Failed to load upcoming appointments:', error)
          setUpcomingAppointments([])
          setAppointmentsError(error)
        } else {
          setUpcomingAppointments(upcoming || [])
        }
      } catch (error) {
        console.error('Error loading upcoming appointments:', error)
        setUpcomingAppointments([])
        setAppointmentsError(error.message)
      } finally {
        setAppointmentsLoading(false)
      }
    }

    loadUpcomingAppointments()
  }, [])

  // Use fallback empty arrays if data is not loaded yet
  const allPatients = patients || []
  const allMedications = medications || []
  const allMeasurements = measurements || []

  // Filter data based on selected patient
  const filteredPatients = selectedPatient ? [selectedPatient] : allPatients
  const filteredMedications = selectedPatient 
    ? allMedications.filter(med => 
        (med.patient_id === selectedPatient.id || med.patientId === selectedPatient.id)
      )
    : allMedications
  const filteredMeasurements = selectedPatient
    ? allMeasurements.filter(measure => 
        (measure.patient_id === selectedPatient.id || measure.patientId === selectedPatient.id)
      )
    : allMeasurements

  // Calculate stats with database schema compatibility
  const activeMedications = filteredMedications.filter(med => 
    med.is_active === true || med.isActive === true
  ).length
  
  const todaysDoses = getTodaysDoses ? getTodaysDoses() : []
  const filteredTodaysDoses = selectedPatient
    ? todaysDoses.filter(dose => {
        const patientId = dose.patient_id || dose.patientId || (dose.patient && dose.patient.id)
        return patientId === selectedPatient.id
      })
    : todaysDoses
  
  const takenDoses = filteredTodaysDoses.filter(dose => dose.status === 'taken').length
  const pendingDoses = filteredTodaysDoses.filter(dose => dose.status === 'pending').length
  const totalDoses = filteredTodaysDoses.length
  
  const recentMeasurements = filteredMeasurements.filter(measure => {
    const recordedDate = measure.recorded_at || measure.recordedAt
    return dayjs().diff(dayjs(recordedDate), 'days') <= 7
  }).length

  // Filter appointments by selected patient with database schema compatibility
  const filteredAppointments = selectedPatient
    ? upcomingAppointments.filter(apt => 
        (apt.patient_id === selectedPatient.id || apt.patientId === selectedPatient.id)
      )
    : upcomingAppointments

  const getPatientAge = (dateOfBirth) => {
    const birthDate = dateOfBirth || selectedPatient?.date_of_birth
    return birthDate ? dayjs().diff(dayjs(birthDate), 'year') : 0
  }

  // Custom Selected Patient Card Component
  const SelectedPatientCard = () => {
    // Handle both database schema formats
    const patientDateOfBirth = selectedPatient.date_of_birth || selectedPatient.dateOfBirth
    const patientMedicalConditions = selectedPatient.medical_conditions || selectedPatient.medicalConditions

    return (
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
              {patientDateOfBirth && getPatientAge(patientDateOfBirth)} 
              {patientDateOfBirth && ' years'}
              {selectedPatient.gender && (patientDateOfBirth ? ` • ${selectedPatient.gender}` : selectedPatient.gender)}
            </Text>
          </div>

          {patientMedicalConditions?.length > 0 && (
            <div style={{ textAlign: 'center', marginTop: '4px' }}>
              <Space size={[4, 4]} wrap style={{ justifyContent: 'center' }}>
                {patientMedicalConditions.slice(0, 2).map((condition, index) => (
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
                {patientMedicalConditions.length > 2 && (
                  <Tag
                    color="default"
                    style={{
                      fontSize: '10px',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      border: 'none'
                    }}
                  >
                    +{patientMedicalConditions.length - 2}
                  </Tag>
                )}
              </Space>
            </div>
          )}
        </Space>
      </Card>
    )
  }

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
      value: appointmentsLoading ? 0 : filteredAppointments.length,
      icon: appointmentsLoading ? <Spin size="small" /> : <CalendarOutlined />,
      color: appointmentsError ? colorWarning : colorInfo,
      description: appointmentsLoading 
        ? 'Loading appointments...'
        : appointmentsError 
          ? 'Error loading appointments'
          : 'Scheduled in the next 7 days'
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