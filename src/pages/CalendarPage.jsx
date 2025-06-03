import { useState } from 'react'
import { Typography, Button, Space, Select, Badge, Row, Col } from 'antd'
import { 
  CalendarOutlined, 
  PlusOutlined, 
  FilterOutlined
} from '@ant-design/icons'
import CalendarView from '../components/calendar/CalendarView'
import CalendarControls from '../components/calendar/CalendarControls'
import AppointmentModal from '../components/calendar/AppointmentModal'
import { usePatients } from '../hooks/usePatients'
import { mockAppointments, getUpcomingAppointments } from '../utils/mockData'
import LoadingSpinner from '../components/common/LoadingSpinner'
import dayjs from 'dayjs'
import './CalendarPage.css'

const { Text } = Typography
const { Option } = Select

const CalendarPage = () => {
  const { patients, loading } = usePatients()
  const [selectedPatient, setSelectedPatient] = useState('all')
  const [viewType, setViewType] = useState('month')
  const [currentDate, setCurrentDate] = useState(dayjs())
  const [appointmentModalVisible, setAppointmentModalVisible] = useState(false)

  if (loading) {
    return <LoadingSpinner message="Loading calendar..." />
  }

  // Filter appointments by selected patient
  const filteredAppointments = selectedPatient === 'all'
    ? mockAppointments
    : mockAppointments.filter(apt => apt.patientId === selectedPatient)

  // Get upcoming appointments for quick view
  const upcomingAppointments = getUpcomingAppointments(7)
  const filteredUpcoming = selectedPatient === 'all'
    ? upcomingAppointments
    : upcomingAppointments.filter(apt => apt.patientId === selectedPatient)

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
              >
                <Option value="all">All Patients</Option>
                {patients.map(patient => (
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
                  <Badge count={filteredAppointments.length} color="#1890ff" />
                  <Text type="secondary">Total Appointments</Text>
                </div>
                <div className="calendar-stat">
                  <Badge count={filteredUpcoming.length} color="#52c41a" />
                  <Text type="secondary">Upcoming (7 days)</Text>
                </div>
              </Space>
            </div>
          </Col>
        </Row>
      </div>

      {/* Calendar View */}
      <div className="calendar-content">
        <CalendarView
          appointments={filteredAppointments}
          viewType={viewType}
          currentDate={currentDate}
          onDateChange={handleDateChange}
          selectedPatient={selectedPatient}
        />
      </div>

      {/* Add Appointment Modal */}
      <AppointmentModal
        visible={appointmentModalVisible}
        onClose={handleModalClose}
        patients={patients}
        selectedPatient={selectedPatient === 'all' ? null : selectedPatient}
      />
    </div>
  )
}

export default CalendarPage