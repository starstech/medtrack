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

  const handleAddAppointment = () => {
    setAppointmentModalVisible(true)
  }

  const handleModalClose = () => {
    setAppointmentModalVisible(false)
  }

  return (
    <div className="calendar-page">
      {/* Filters, Stats and Controls Combined */}
      <div className="calendar-filters">
        <Row gutter={[16, 16]} align="middle">
          {/* Patient Filter */}
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

          {/* View Type Controls */}
          <Col xs={24} sm={12} md={8}>
            <Space>
              <Text strong>View:</Text>
              <CalendarControls
                viewType={viewType}
                onViewChange={handleViewChange}
              />
            </Space>
          </Col>
          
          {/* Stats and Add Button */}
          <Col xs={24} sm={24} md={8}>
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