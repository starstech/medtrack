import { useState, useEffect } from 'react'
import { Typography, Button, Space, Select, Badge, Row, Col, Alert, Spin } from 'antd'
import { 
  CalendarOutlined, 
  PlusOutlined, 
  FilterOutlined
} from '@ant-design/icons'
import CalendarView from '../components/calendar/CalendarView'
import CalendarControls from '../components/calendar/CalendarControls'
import AppointmentModal from '../components/calendar/AppointmentModal'
import { usePatients } from '../hooks/usePatients'
import { appointmentService } from '../services/appointmentService'
import LoadingSpinner from '../components/common/LoadingSpinner'
import dayjs from 'dayjs'
import './CalendarPage.css'

const { Text } = Typography
const { Option } = Select

const CalendarPage = () => {
  const { patients, loading: patientsLoading, error: patientsError } = usePatients()
  const [selectedPatient, setSelectedPatient] = useState('all')
  const [viewType, setViewType] = useState('month')
  const [currentDate, setCurrentDate] = useState(dayjs())
  const [appointmentModalVisible, setAppointmentModalVisible] = useState(false)
  
  // Appointment data state
  const [appointments, setAppointments] = useState([])
  const [upcomingAppointments, setUpcomingAppointments] = useState([])
  const [appointmentsLoading, setAppointmentsLoading] = useState(true)
  const [appointmentsError, setAppointmentsError] = useState(null)

  // Load appointments data
  useEffect(() => {
    const loadAppointments = async () => {
      try {
        setAppointmentsLoading(true)
        setAppointmentsError(null)

        // Load all appointments
        const { data: allAppointments, error: appointmentsErr } = await appointmentService.getAppointments()
        if (appointmentsErr) {
          throw new Error(`Failed to load appointments: ${appointmentsErr}`)
        }

        // Load upcoming appointments (next 7 days)
        const { data: upcoming, error: upcomingErr } = await appointmentService.getUpcomingAppointments(7)
        if (upcomingErr) {
          console.warn('Failed to load upcoming appointments:', upcomingErr)
          setUpcomingAppointments([])
        } else {
          setUpcomingAppointments(upcoming || [])
        }

        setAppointments(allAppointments || [])
      } catch (error) {
        console.error('Error loading appointments:', error)
        setAppointmentsError(error.message)
        setAppointments([])
        setUpcomingAppointments([])
      } finally {
        setAppointmentsLoading(false)
      }
    }

    loadAppointments()
  }, [])

  // Re-load appointments when selectedPatient changes (for filtered data)
  useEffect(() => {
    if (selectedPatient !== 'all') {
      const loadPatientAppointments = async () => {
        try {
          setAppointmentsLoading(true)
          setAppointmentsError(null)

          // Load appointments for specific patient
          const { data: patientAppointments, error: appointmentsErr } = await appointmentService.getPatientAppointments(selectedPatient)
          if (appointmentsErr) {
            throw new Error(`Failed to load patient appointments: ${appointmentsErr}`)
          }

          // Load upcoming appointments for specific patient
          const { data: patientUpcoming, error: upcomingErr } = await appointmentService.getUpcomingAppointments(7, selectedPatient)
          if (upcomingErr) {
            console.warn('Failed to load upcoming appointments for patient:', upcomingErr)
          }

          setAppointments(patientAppointments || [])
          setUpcomingAppointments(patientUpcoming || [])
        } catch (error) {
          console.error('Error loading patient appointments:', error)
          setAppointmentsError(error.message)
        } finally {
          setAppointmentsLoading(false)
        }
      }

      loadPatientAppointments()
    } else {
      // Reload all appointments when switching back to 'all'
      const loadAllAppointments = async () => {
        try {
          setAppointmentsLoading(true)
          setAppointmentsError(null)

          const { data: allAppointments, error: appointmentsErr } = await appointmentService.getAppointments()
          if (appointmentsErr) {
            throw new Error(`Failed to load all appointments: ${appointmentsErr}`)
          }

          const { data: upcoming, error: upcomingErr } = await appointmentService.getUpcomingAppointments(7)
          if (upcomingErr) {
            console.warn('Failed to load upcoming appointments:', upcomingErr)
          }

          setAppointments(allAppointments || [])
          setUpcomingAppointments(upcoming || [])
        } catch (error) {
          console.error('Error loading all appointments:', error)
          setAppointmentsError(error.message)
        } finally {
          setAppointmentsLoading(false)
        }
      }

      loadAllAppointments()
    }
  }, [selectedPatient])

  if (patientsLoading) {
    return <LoadingSpinner message="Loading calendar..." />
  }

  if (patientsError) {
    return (
      <div className="calendar-page">
        <Alert
          message="Error Loading Calendar"
          description={patientsError}
          type="error"
          showIcon
          style={{ margin: '20px' }}
        />
      </div>
    )
  }

  const allPatients = patients || []

  // Use real appointment data with database schema compatibility
  const filteredAppointments = appointments
  const filteredUpcoming = upcomingAppointments

  const handlePatientChange = (value) => {
    setSelectedPatient(value)
  }

  const handleViewChange = (type) => {
    setViewType(type)
  }

  const handleDateChange = (date) => {
    setCurrentDate(date)
  }

  const handleYearChange = (year) => {
    setCurrentDate(currentDate.year(year))
  }

  const handleMonthChange = (month) => {
    setCurrentDate(currentDate.month(month))
  }

  const handleAddAppointment = () => {
    setAppointmentModalVisible(true)
  }

  const handleModalClose = () => {
    setAppointmentModalVisible(false)
  }

  const handleAppointmentAdded = () => {
    // Refresh appointments when a new one is added
    setSelectedPatient(selectedPatient) // This will trigger the useEffect
  }

  // Generate year options (current year ± 5 years)
  const currentYear = dayjs().year()
  const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i)
  
  // Month options
  const monthOptions = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  return (
    <div className="calendar-page">
      {/* Filters and Controls */}
      <div className="calendar-filters">
        <Row gutter={[16, 16]} align="middle">
          {/* Patient Filter */}
          <Col xs={24} sm={8} md={6}>
            <Space>
              <FilterOutlined />
              <Text strong>Patient:</Text>
              <Select
                value={selectedPatient}
                onChange={handlePatientChange}
                style={{ width: 160 }}
                size="large"
                loading={patientsLoading}
              >
                <Option value="all">All Patients</Option>
                {allPatients.map(patient => (
                  <Option key={patient.id} value={patient.id}>
                    {patient.name}
                  </Option>
                ))}
              </Select>
            </Space>
          </Col>

          {/* Date Selectors */}
          <Col xs={24} sm={8} md={6}>
            <Space>
              <Select
                value={currentDate.year()}
                onChange={handleYearChange}
                style={{ width: 100 }}
                size="large"
              >
                {yearOptions.map(year => (
                  <Option key={year} value={year}>
                    {year}
                  </Option>
                ))}
              </Select>
              <Select
                value={currentDate.month()}
                onChange={handleMonthChange}
                style={{ width: 110 }}
                size="large"
              >
                {monthOptions.map((month, index) => (
                  <Option key={index} value={index}>
                    {month}
                  </Option>
                ))}
              </Select>
            </Space>
          </Col>

          {/* View Type Controls and Add Button */}
          <Col xs={24} sm={8} md={12}>
            <div className="view-and-actions">
              <Space size="large">
                <Space>
                  <Text strong>View:</Text>
                  <CalendarControls
                    viewType={viewType}
                    onViewChange={handleViewChange}
                  />
                </Space>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddAppointment}
                  size="large"
                  className="add-appointment-btn"
                >
                  <span className="desktop-only">Add Appointment</span>
                </Button>
              </Space>
            </div>
          </Col>
        </Row>

        {/* Stats Row Below */}
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24}>
            <div className="calendar-stats">
              <Space size="large">
                <div className="calendar-stat">
                  {appointmentsLoading ? (
                    <Spin size="small" />
                  ) : (
                    <Badge count={filteredAppointments.length} color="#1890ff" />
                  )}
                  <Text type="secondary">Total Appointments</Text>
                </div>
                <div className="calendar-stat">
                  {appointmentsLoading ? (
                    <Spin size="small" />
                  ) : (
                    <Badge count={filteredUpcoming.length} color="#52c41a" />
                  )}
                  <Text type="secondary">Upcoming (7 days)</Text>
                </div>
              </Space>
              {appointmentsError && (
                <div style={{ marginTop: '8px' }}>
                  <Text type="danger" style={{ fontSize: '12px' }}>
                    Error loading appointments: {appointmentsError}
                  </Text>
                </div>
              )}
            </div>
          </Col>
        </Row>
      </div>

      {/* Calendar View */}
      <div className="calendar-content">
        {appointmentsLoading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" />
            <Text type="secondary" style={{ display: 'block', marginTop: '16px' }}>
              Loading appointments...
            </Text>
          </div>
        ) : appointmentsError ? (
          <Alert
            message="Error Loading Appointments"
            description={appointmentsError}
            type="error"
            showIcon
            style={{ margin: '20px' }}
          />
        ) : (
          <CalendarView
            appointments={filteredAppointments}
            viewType={viewType}
            currentDate={currentDate}
            onDateChange={handleDateChange}
            selectedPatient={selectedPatient}
          />
        )}
      </div>

      {/* Add Appointment Modal */}
      <AppointmentModal
        visible={appointmentModalVisible}
        onClose={handleModalClose}
        patients={allPatients}
        selectedPatient={selectedPatient === 'all' ? null : selectedPatient}
        onAppointmentAdded={handleAppointmentAdded}
      />
    </div>
  )
}

export default CalendarPage