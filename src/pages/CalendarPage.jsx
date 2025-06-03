import { useState } from 'react'
import { Typography, Button, Space, Select, Badge, Row, Col } from 'antd'
import { 
  CalendarOutlined, 
  PlusOutlined, 
  FilterOutlined,
  LeftOutlined,
  RightOutlined
} from '@ant-design/icons'
import CalendarView from '../components/calendar/CalendarView'
import CalendarControls from '../components/calendar/CalendarControls'
import AppointmentModal from '../components/calendar/AppointmentModal'
import { usePatients } from '../hooks/usePatients'
import { mockAppointments, getUpcomingAppointments } from '../utils/mockData'
import LoadingSpinner from '../components/common/LoadingSpinner'
import dayjs from 'dayjs'
import './CalendarPage.css'

const { Title, Text } = Typography
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

  const handlePrevPeriod = () => {
    if (viewType === 'month') {
      setCurrentDate(currentDate.subtract(1, 'month'))
    } else if (viewType === 'week') {
      setCurrentDate(currentDate.subtract(1, 'week'))
    } else {
      setCurrentDate(currentDate.subtract(1, 'day'))
    }
  }

  const handleNextPeriod = () => {
    if (viewType === 'month') {
      setCurrentDate(currentDate.add(1, 'month'))
    } else if (viewType === 'week') {
      setCurrentDate(currentDate.add(1, 'week'))
    } else {
      setCurrentDate(currentDate.add(1, 'day'))
    }
  }

  const handleToday = () => {
    setCurrentDate(dayjs())
  }

  const handleAddAppointment = () => {
    setAppointmentModalVisible(true)
  }

  const handleModalClose = () => {
    setAppointmentModalVisible(false)
  }

  const getDateRangeText = () => {
    if (viewType === 'month') {
      return currentDate.format('MMMM YYYY')
    } else if (viewType === 'week') {
      const startOfWeek = currentDate.startOf('week')
      const endOfWeek = currentDate.endOf('week')
      return `${startOfWeek.format('MMM D')} - ${endOfWeek.format('MMM D, YYYY')}`
    } else {
      return currentDate.format('dddd, MMMM D, YYYY')
    }
  }

  return (
    <div className="calendar-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="header-content">
          <Space direction="vertical" size="small">
            <Title level={2} className="page-title">
              Calendar
            </Title>
            <Text type="secondary" className="page-subtitle">
              Manage appointments and schedules
            </Text>
          </Space>
        </div>
        
        <div className="header-actions">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddAppointment}
            size="large"
            className="add-appointment-btn"
          >
            <span className="desktop-only">Add Appointment</span>
          </Button>
        </div>
      </div>

      {/* Calendar Controls */}
      <div className="calendar-controls-section">
        <Row gutter={[16, 16]} align="middle">
          {/* Date Navigation */}
          <Col xs={24} sm={12} md={8}>
            <Space size="small">
              <Button 
                icon={<LeftOutlined />} 
                onClick={handlePrevPeriod}
                size="large"
              />
              <Button 
                onClick={handleToday}
                size="large"
                className="today-btn"
              >
                Today
              </Button>
              <Button 
                icon={<RightOutlined />} 
                onClick={handleNextPeriod}
                size="large"
              />
            </Space>
          </Col>

          {/* Date Range Display */}
          <Col xs={24} sm={12} md={8}>
            <div className="date-range-display">
              <Text strong className="date-range-text">
                {getDateRangeText()}
              </Text>
            </div>
          </Col>

          {/* View Type Controls */}
          <Col xs={24} sm={24} md={8}>
            <div className="calendar-view-controls">
              <CalendarControls
                viewType={viewType}
                onViewChange={handleViewChange}
              />
            </div>
          </Col>
        </Row>
      </div>

      {/* Filters and Quick Stats */}
      <div className="calendar-filters">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Space>
              <FilterOutlined />
              <Text strong>Patient:</Text>
              <Select
                value={selectedPatient}
                onChange={handlePatientChange}
                style={{ width: 200 }}
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
          
          <Col xs={24} sm={12} md={16}>
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