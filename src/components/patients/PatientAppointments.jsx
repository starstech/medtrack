import { useState, useEffect, useRef } from 'react'
import { 
  Card, 
  List, 
  Button, 
  Space, 
  Typography, 
  Tag, 
  Empty,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  TimePicker,
  InputNumber,
  Row,
  Col,
  message,
  Badge,
  Avatar,
  Dropdown,
  Divider,
  Checkbox,
  Segmented,
  Spin,
  Alert
} from 'antd'
import { 
  CalendarOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  UserOutlined,
  EnvironmentOutlined,
  FilterOutlined,
  UnorderedListOutlined,
  NodeIndexOutlined
} from '@ant-design/icons'
import { appointmentService } from '../../services/appointmentService'
import dayjs from 'dayjs'
import './PatientAppointments.css'

const { Title, Text } = Typography
const { Option } = Select
const { TextArea } = Input

const PatientAppointments = ({ patient }) => {
  const [addModalVisible, setAddModalVisible] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [selectedFilter, setSelectedFilter] = useState('all') // 'all', 'upcoming', 'past', 'today'
  const [selectedType, setSelectedType] = useState('all')
  const [viewMode, setViewMode] = useState('list') // 'list' or 'timeline'
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [isScrollable, setIsScrollable] = useState(false)
  const containerRef = useRef(null)

  // Appointment data state
  const [appointments, setAppointments] = useState([])
  const [appointmentsLoading, setAppointmentsLoading] = useState(true)
  const [appointmentsError, setAppointmentsError] = useState(null)

  // Load appointments for the patient
  useEffect(() => {
    const loadAppointments = async () => {
      if (!patient?.id) return

      try {
        setAppointmentsLoading(true)
        setAppointmentsError(null)

        const { data: patientAppointments, error } = await appointmentService.getPatientAppointments(patient.id)
        
        if (error) {
          throw new Error(`Failed to load appointments: ${error}`)
        }

        setAppointments(patientAppointments || [])
      } catch (error) {
        console.error('Error loading patient appointments:', error)
        setAppointmentsError(error.message)
        setAppointments([])
      } finally {
        setAppointmentsLoading(false)
      }
    }

    loadAppointments()
  }, [patient?.id])

  const appointmentTypes = [
    { value: 'routine_checkup', label: 'Routine Checkup', color: '#1890ff' },
    { value: 'follow_up', label: 'Follow-up Visit', color: '#52c41a' },
    { value: 'specialist', label: 'Specialist Consultation', color: '#722ed1' },
    { value: 'emergency', label: 'Emergency Visit', color: '#ff4d4f' },
    { value: 'dental', label: 'Dental Appointment', color: '#fa8c16' },
    { value: 'therapy', label: 'Therapy Session', color: '#13c2c2' },
    { value: 'vaccination', label: 'Vaccination', color: '#eb2f96' },
    { value: 'lab_work', label: 'Lab Work', color: '#f5222d' },
    { value: 'surgery', label: 'Surgery', color: '#faad14' },
    { value: 'other', label: 'Other', color: '#8c8c8c' }
  ]

  const reminderOptions = [
    { value: '15_minutes', label: '15 minutes before' },
    { value: '30_minutes', label: '30 minutes before' },
    { value: '1_hour', label: '1 hour before' },
    { value: '2_hours', label: '2 hours before' },
    { value: '1_day', label: '1 day before' },
    { value: '1_week', label: '1 week before' }
  ]
  
  // Filter appointments
  const filterAppointments = (appointments, filter, typeFilter) => {
    const now = dayjs()
    const today = now.startOf('day')
    
    let filtered = appointments
    
    // Filter by time
    switch (filter) {
      case 'upcoming':
        filtered = appointments.filter(apt => {
          const aptDate = apt.appointment_date || apt.dateTime
          return dayjs(aptDate).isAfter(now)
        })
        break
      case 'past':
        filtered = appointments.filter(apt => {
          const aptDate = apt.appointment_date || apt.dateTime
          return dayjs(aptDate).isBefore(now)
        })
        break
      case 'today':
        filtered = appointments.filter(apt => {
          const aptDate = apt.appointment_date || apt.dateTime
          return dayjs(aptDate).isSame(today, 'day')
        })
        break
      default:
        filtered = appointments
    }
    
    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(apt => apt.type === typeFilter)
    }
    
    return filtered
  }
  
  const filteredAppointments = filterAppointments(appointments, selectedFilter, selectedType)
  
  // Sort appointments by date (upcoming first, then past in reverse chronological order)
  const sortedAppointments = filteredAppointments.sort((a, b) => {
    const dateA = dayjs(a.appointment_date || a.dateTime)
    const dateB = dayjs(b.appointment_date || b.dateTime)
    const now = dayjs()
    
    const aIsUpcoming = dateA.isAfter(now)
    const bIsUpcoming = dateB.isAfter(now)
    
    if (aIsUpcoming && bIsUpcoming) {
      return dateA.isBefore(dateB) ? -1 : 1 // Upcoming: earliest first
    } else if (!aIsUpcoming && !bIsUpcoming) {
      return dateA.isBefore(dateB) ? 1 : -1 // Past: latest first
    } else {
      return aIsUpcoming ? -1 : 1 // Upcoming before past
    }
  })

  // Get unique appointment types from data
  const availableTypes = [...new Set(appointments.map(apt => apt.type))]

  // Check if container is scrollable
  useEffect(() => {
    const checkScrollable = () => {
      if (containerRef.current) {
        const { scrollHeight, clientHeight } = containerRef.current
        setIsScrollable(scrollHeight > clientHeight)
      }
    }

    checkScrollable()
    window.addEventListener('resize', checkScrollable)

    return () => {
      window.removeEventListener('resize', checkScrollable)
    }
  }, [sortedAppointments, selectedFilter, selectedType])

  const handleAddAppointment = async (values) => {
    setLoading(true)
    
    try {
      // Combine date and time
      const appointmentDateTime = dayjs(values.date)
        .hour(values.time.hour())
        .minute(values.time.minute())

      const appointmentData = {
        patient_id: patient.id,
        title: values.title,
        doctor: values.doctor,
        type: values.type,
        appointment_date: appointmentDateTime.toISOString(),
        duration: values.duration,
        location: values.location,
        address: values.address,
        notes: values.notes,
        reminders: values.reminders || [],
        status: 'scheduled'
      }

      const { data: newAppointment, error } = await appointmentService.createAppointment(appointmentData)
      
      if (error) {
        throw new Error(error)
      }
      
      // Add to local state for immediate feedback
      setAppointments(prev => [...prev, newAppointment])
      
      message.success('Appointment scheduled successfully!')
      setAddModalVisible(false)
      form.resetFields()
      
    } catch (error) {
      message.error(`Failed to schedule appointment: ${error.message}`)
      console.error('Error adding appointment:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditAppointment = async (values) => {
    setLoading(true)
    
    try {
      // Combine date and time
      const appointmentDateTime = dayjs(values.date)
        .hour(values.time.hour())
        .minute(values.time.minute())

      const appointmentData = {
        title: values.title,
        doctor: values.doctor,
        type: values.type,
        appointment_date: appointmentDateTime.toISOString(),
        duration: values.duration,
        location: values.location,
        address: values.address,
        notes: values.notes,
        reminders: values.reminders || []
      }

      const { data: updatedAppointment, error } = await appointmentService.updateAppointment(
        selectedAppointment.id, 
        appointmentData
      )
      
      if (error) {
        throw new Error(error)
      }
      
      // Update local state for immediate feedback
      setAppointments(prev => 
        prev.map(apt => apt.id === selectedAppointment.id ? updatedAppointment : apt)
      )
      
      message.success('Appointment updated successfully!')
      setEditModalVisible(false)
      setSelectedAppointment(null)
      form.resetFields()
      
    } catch (error) {
      message.error(`Failed to update appointment: ${error.message}`)
      console.error('Error updating appointment:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAppointment = (appointmentId) => {
    Modal.confirm({
      title: 'Delete Appointment',
      content: 'Are you sure you want to delete this appointment? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const { error } = await appointmentService.deleteAppointment(appointmentId)
          
          if (error) {
            throw new Error(error)
          }
          
          // Remove from local state for immediate feedback
          setAppointments(prev => prev.filter(apt => apt.id !== appointmentId))
          
          message.success('Appointment deleted successfully!')
        } catch (error) {
          message.error(`Failed to delete appointment: ${error.message}`)
          console.error('Error deleting appointment:', error)
        }
      }
    })
  }

  const handleEditClick = (appointment) => {
    setSelectedAppointment(appointment)
    
    // Pre-fill form with appointment data - handle both schema formats
    const appointmentDateTime = dayjs(appointment.appointment_date || appointment.dateTime)
    form.setFieldsValue({
      title: appointment.title,
      doctor: appointment.doctor,
      type: appointment.type,
      date: appointmentDateTime,
      time: appointmentDateTime,
      duration: appointment.duration,
      location: appointment.location,
      address: appointment.address,
      notes: appointment.notes,
      reminders: appointment.reminders || []
    })
    
    setEditModalVisible(true)
  }

  const getAppointmentStatus = (appointment) => {
    const now = dayjs()
    const aptTime = dayjs(appointment.appointment_date || appointment.dateTime)
    
    if (aptTime.isBefore(now)) {
      return { status: 'default', text: 'Completed', color: '#8c8c8c' }
    } else if (aptTime.diff(now, 'hours') <= 24) {
      return { status: 'warning', text: 'Tomorrow', color: '#faad14' }
    } else if (aptTime.isSame(now, 'day')) {
      return { status: 'processing', text: 'Today', color: '#1890ff' }
    } else {
      return { status: 'success', text: 'Upcoming', color: '#52c41a' }
    }
  }

  const getAppointmentTypeInfo = (type) => {
    return appointmentTypes.find(t => t.value === type) || 
           { label: type, color: '#8c8c8c' }
  }

  const disabledDate = (current) => {
    // Disable past dates (except today) for new appointments
    return current && current < dayjs().startOf('day')
  }

  const disabledTime = (current) => {
    // If date is today, disable past hours
    if (current && current.isSame(dayjs(), 'day')) {
      const currentHour = dayjs().hour()
      const currentMinute = dayjs().minute()
      
      return {
        disabledHours: () => Array.from({ length: currentHour }, (_, i) => i),
        disabledMinutes: (selectedHour) => {
          if (selectedHour === currentHour) {
            return Array.from({ length: currentMinute }, (_, i) => i)
          }
          return []
        }
      }
    }
    return {}
  }

  // Show loading state
  if (appointmentsLoading) {
    return (
      <div className="patient-appointments-section">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
          <Text type="secondary" style={{ display: 'block', marginTop: '16px' }}>
            Loading appointments...
          </Text>
        </div>
      </div>
    )
  }

  // Show error state
  if (appointmentsError) {
    return (
      <div className="patient-appointments-section">
        <Alert
          message="Error Loading Appointments"
          description={appointmentsError}
          type="error"
          showIcon
          action={
            <Button 
              size="small" 
              type="primary"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          }
        />
      </div>
    )
  }

  const renderAppointmentModal = (isEdit = false) => (
    <Modal
      title={
        <Space>
          <CalendarOutlined />
          <span>{isEdit ? 'Edit Appointment' : 'Schedule New Appointment'}</span>
        </Space>
      }
      open={isEdit ? editModalVisible : addModalVisible}
      onCancel={() => {
        if (isEdit) {
          setEditModalVisible(false)
          setSelectedAppointment(null)
        } else {
          setAddModalVisible(false)
        }
        form.resetFields()
      }}
      footer={[
        <Button 
          key="cancel"
          onClick={() => {
            if (isEdit) {
              setEditModalVisible(false)
              setSelectedAppointment(null)
            } else {
              setAddModalVisible(false)
            }
            form.resetFields()
          }}
          size="large"
        >
          Cancel
        </Button>,
        <Button 
          key="submit"
          type="primary" 
          htmlType="submit"
          loading={loading}
          form={`appointment-form-${isEdit ? 'edit' : 'add'}`}
          size="large"
        >
          {loading ? (isEdit ? 'Updating...' : 'Scheduling...') : (isEdit ? 'Update Appointment' : 'Schedule Appointment')}
        </Button>
      ]}
      width={700}
      destroyOnClose
      className="appointment-modal"
    >
      <div className="modal-form">
        <Form
          id={`appointment-form-${isEdit ? 'edit' : 'add'}`}
          form={form}
          layout="vertical"
          onFinish={isEdit ? handleEditAppointment : handleAddAppointment}
          size="large"
          initialValues={{
            duration: 30,
            type: 'routine_checkup',
            reminders: ['1_day', '1_hour']
          }}
        >
          {/* Basic Information */}
          <div className="form-section">
            <Title level={5}>Appointment Details</Title>
            
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="title"
                  label="Appointment Title"
                  rules={[
                    { required: true, message: 'Please enter appointment title' },
                    { min: 3, message: 'Title must be at least 3 characters' }
                  ]}
                >
                  <Input
                    placeholder="e.g., Annual Physical Exam"
                    prefix={<CalendarOutlined />}
                  />
                </Form.Item>
              </Col>
              
              <Col xs={24} sm={12}>
                <Form.Item
                  name="type"
                  label="Appointment Type"
                  rules={[
                    { required: true, message: 'Please select appointment type' }
                  ]}
                >
                  <Select placeholder="Select type">
                    {appointmentTypes.map(type => (
                      <Option key={type.value} value={type.value}>
                        <Space>
                          <div
                            style={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              backgroundColor: type.color
                            }}
                          />
                          {type.label}
                        </Space>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="doctor"
                  label="Doctor/Healthcare Provider"
                  rules={[
                    { required: true, message: 'Please enter doctor name' }
                  ]}
                >
                  <Input
                    placeholder="Dr. Smith"
                    prefix={<UserOutlined />}
                  />
                </Form.Item>
              </Col>
              
              <Col xs={24} sm={12}>
                <Form.Item
                  name="duration"
                  label="Duration (minutes)"
                  rules={[
                    { required: true, message: 'Please enter duration' }
                  ]}
                >
                  <InputNumber
                    min={15}
                    max={480}
                    step={15}
                    placeholder="30"
                    style={{ width: '100%' }}
                    prefix={<ClockCircleOutlined />}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Date and Time */}
          <div className="form-section">
            <Title level={5}>Date & Time</Title>
            
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="date"
                  label="Date"
                  rules={[
                    { required: true, message: 'Please select date' }
                  ]}
                >
                  <DatePicker
                    style={{ width: '100%' }}
                    disabledDate={!isEdit ? disabledDate : undefined}
                    format="MMMM D, YYYY"
                  />
                </Form.Item>
              </Col>
              
              <Col xs={24} sm={12}>
                <Form.Item
                  name="time"
                  label="Time"
                  rules={[
                    { required: true, message: 'Please select time' }
                  ]}
                >
                  <TimePicker
                    style={{ width: '100%' }}
                    format="h:mm A"
                    minuteStep={15}
                    disabledTime={!isEdit ? disabledTime : undefined}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Location */}
          <div className="form-section">
            <Title level={5}>Location</Title>
            
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="location"
                  label="Clinic/Hospital Name"
                  rules={[
                    { required: true, message: 'Please enter location name' }
                  ]}
                >
                  <Input
                    placeholder="City Medical Center"
                    prefix={<EnvironmentOutlined />}
                  />
                </Form.Item>
              </Col>
              
              <Col xs={24} sm={12}>
                <Form.Item
                  name="address"
                  label="Address (Optional)"
                >
                  <Input
                    placeholder="123 Main St, Suite 100"
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Reminders and Notes */}
          <div className="form-section">
            <Title level={5}>Reminders & Notes</Title>
            
            <Form.Item
              name="reminders"
              label="Reminder Notifications"
            >
              <Checkbox.Group
                options={reminderOptions}
                className="reminder-checkboxes"
              />
            </Form.Item>

            <Form.Item
              name="notes"
              label="Additional Notes (Optional)"
            >
              <TextArea
                placeholder="Any special instructions, preparations needed, or other notes..."
                rows={3}
                maxLength={1000}
                showCount
              />
            </Form.Item>
          </div>
        </Form>
      </div>
    </Modal>
  )

  const renderListView = () => (
    <div 
      className={`appointment-list-container ${isScrollable ? 'has-scroll' : ''}`}
      ref={containerRef}
    >
      <List
        className="appointments-list"
        dataSource={sortedAppointments}
        renderItem={(appointment) => {
          const status = getAppointmentStatus(appointment)
          const typeInfo = getAppointmentTypeInfo(appointment.type)
          const appointmentDate = appointment.appointment_date || appointment.dateTime
          
          return (
            <List.Item className="appointment-list-item">
              <div className="appointment-item">
                <div className="appointment-icon">
                  <div 
                    className="type-indicator"
                    style={{ backgroundColor: typeInfo.color }}
                  >
                    <CalendarOutlined />
                  </div>
                </div>
                
                <div className="appointment-primary">
                  <div className="appointment-name-row">
                    <div className="appointment-title">
                      <Text strong>{appointment.title}</Text>
                      <div className="appointment-meta">
                        <Text type="secondary" size="small">
                          {dayjs(appointmentDate).format('MMMM D, YYYY • h:mm A')} • {appointment.duration} min
                        </Text>
                      </div>
                    </div>
                    <div className="appointment-badges">
                      <Badge 
                        status={status.status} 
                        text={status.text}
                        style={{ color: status.color }}
                      />
                      <Tag color={typeInfo.color} size="small">
                        {typeInfo.label}
                      </Tag>
                    </div>
                  </div>
                  
                  <div className="appointment-details-row">
                    <Space size="large">
                      <div className="detail-item">
                        <UserOutlined style={{ color: '#1890ff' }} />
                        <Text size="small">Dr. {appointment.doctor}</Text>
                      </div>
                      <div className="detail-item">
                        <EnvironmentOutlined style={{ color: '#52c41a' }} />
                        <Text size="small">{appointment.location}</Text>
                      </div>
                    </Space>
                  </div>
                  
                  {appointment.notes && (
                    <div className="appointment-notes">
                      <Text type="secondary" size="small">
                        Notes: {appointment.notes}
                      </Text>
                    </div>
                  )}
                </div>
                
                <div className="appointment-actions">
                  <Dropdown
                    menu={{
                      items: [
                        {
                          key: 'edit',
                          label: 'Edit',
                          icon: <EditOutlined />,
                          onClick: () => handleEditClick(appointment)
                        },
                        {
                          key: 'delete',
                          label: 'Delete',
                          icon: <DeleteOutlined />,
                          danger: true,
                          onClick: () => handleDeleteAppointment(appointment.id)
                        }
                      ]
                    }}
                    trigger={['click']}
                    placement="bottomRight"
                  >
                    <Button 
                      type="text" 
                      icon={<MoreOutlined />}
                      className="list-action-btn"
                    />
                  </Dropdown>
                </div>
              </div>
            </List.Item>
          )
        }}
      />
    </div>
  )

  const upcomingCount = appointments.filter(apt => {
    const aptDate = apt.appointment_date || apt.dateTime
    return dayjs(aptDate).isAfter(dayjs())
  }).length
  
  const todayCount = appointments.filter(apt => {
    const aptDate = apt.appointment_date || apt.dateTime
    return dayjs(aptDate).isSame(dayjs(), 'day')
  }).length

  return (
    <div className="patient-appointments-section">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Filters and Controls */}
        <div className="appointments-controls-group">
          <div className="appointments-controls-header">
            <div className="filter-controls">
              <Space size="middle">
                <Text strong>View:</Text>
                <Segmented
                  options={[
                    { label: 'All', value: 'all' },
                    { label: `Upcoming (${upcomingCount})`, value: 'upcoming' },
                    { label: `Today (${todayCount})`, value: 'today' },
                    { label: 'Past', value: 'past' }
                  ]}
                  value={selectedFilter}
                  onChange={setSelectedFilter}
                  size="small"
                />
              </Space>
            </div>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => setAddModalVisible(true)}
              size="small"
            >
              Add Appointment
            </Button>
          </div>
          
          <Row gutter={[16, 8]}>
            <Col xs={24} sm={8} md={6}>
              <Select
                value={selectedType}
                onChange={setSelectedType}
                style={{ width: '100%' }}
                size="small"
              >
                <Option value="all">All Types</Option>
                {availableTypes.map(type => {
                  const typeInfo = getAppointmentTypeInfo(type)
                  return (
                    <Option key={type} value={type}>
                      <Space>
                        <div
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: typeInfo.color
                          }}
                        />
                        {typeInfo.label}
                      </Space>
                    </Option>
                  )
                })}
              </Select>
            </Col>
          </Row>
        </div>

        {/* Main Content */}
        <div className="appointments-group">
          <div className="appointments-group-header">
            <div className="group-title">
              <Space>
                <CalendarOutlined />
                <span>
                  Appointments ({filteredAppointments.length})
                  {selectedFilter !== 'all' && (
                    <Text type="secondary" style={{ fontWeight: 'normal', fontSize: '14px' }}>
                      {selectedFilter === 'upcoming' && ' • Upcoming'}
                      {selectedFilter === 'past' && ' • Past'}
                      {selectedFilter === 'today' && ' • Today'}
                    </Text>
                  )}
                </span>
              </Space>
            </div>
          </div>

          {filteredAppointments.length > 0 ? (
            <div className="appointments-content">
              {renderListView()}
            </div>
          ) : (
            <Empty
              image={<CalendarOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />}
              description={
                selectedFilter === 'all'
                  ? "No appointments scheduled yet"
                  : `No ${selectedFilter} appointments found`
              }
              style={{ padding: '40px 0' }}
            >
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => setAddModalVisible(true)}
              >
                Schedule First Appointment
              </Button>
            </Empty>
          )}
        </div>
      </Space>

      {/* Modals */}
      {renderAppointmentModal(false)}
      {renderAppointmentModal(true)}
    </div>
  )
}

export default PatientAppointments 