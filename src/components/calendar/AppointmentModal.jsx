import { useState } from 'react'
import { 
  Modal, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  TimePicker,
  InputNumber,
  Button, 
  Space, 
  Typography,
  Row,
  Col,
  Checkbox,
  message
} from 'antd'
import { 
  CalendarOutlined, 
  UserOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { Option } = Select
const { TextArea } = Input

const AppointmentModal = ({ visible, onClose, patients, selectedPatient }) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

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

  const handleSubmit = async (values) => {
    setLoading(true)
    
    try {
      // Combine date and time
      const appointmentDateTime = dayjs(values.date)
        .hour(values.time.hour())
        .minute(values.time.minute())

      const appointmentData = {
        title: values.title,
        doctor: values.doctor,
        dateTime: appointmentDateTime.toISOString(),
        duration: values.duration,
        location: values.location,
        address: values.address,
        type: values.type,
        notes: values.notes,
        reminders: values.reminders || [],
        patientId: values.patientId
      }

      // In a real app, this would call an API
      console.log('Creating appointment:', appointmentData)
      
      message.success('Appointment scheduled successfully!')
      handleClose()
      
    } catch (error) {
      message.error('Failed to schedule appointment. Please try again.')
      console.error('Error creating appointment:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    form.resetFields()
    onClose()
  }

  const disabledDate = (current) => {
    // Disable past dates (except today)
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

  return (
    <Modal
      title={
        <Space>
          <CalendarOutlined />
          <Title level={4} style={{ margin: 0 }}>
            Schedule New Appointment
          </Title>
        </Space>
      }
      open={visible}
      onCancel={handleClose}
      footer={[
        <Button
          key="cancel"
          onClick={handleClose}
          size="large"
          disabled={loading}
        >
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          htmlType="submit"
          loading={loading}
          size="large"
          icon={<CalendarOutlined />}
          form="appointment-form"
        >
          {loading ? 'Scheduling...' : 'Schedule Appointment'}
        </Button>
      ]}
      width={900}
      className="appointment-modal"
      destroyOnHidden
      centered
    >
      <Form
        id="appointment-form"
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        size="large"
        className="appointment-form"
        initialValues={{
          duration: 30,
          type: 'routine_checkup',
          reminders: ['1_day', '1_hour'],
          patientId: selectedPatient
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
                <Select placeholder="Select appointment type">
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
                name="patientId"
                label="Patient"
                rules={[
                  { required: true, message: 'Please select a patient' }
                ]}
              >
                <Select placeholder="Select patient">
                  {patients.map(patient => (
                    <Option key={patient.id} value={patient.id}>
                      <Space>
                        <UserOutlined />
                        {patient.name} ({patient.age} years old)
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </div>

        {/* Date and Time */}
        <div className="form-section">
          <Title level={5}>Date & Time</Title>
          
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item
                name="date"
                label="Date"
                rules={[
                  { required: true, message: 'Please select a date' }
                ]}
              >
                <DatePicker
                  placeholder="Select date"
                  style={{ width: '100%' }}
                  disabledDate={disabledDate}
                  format="MMM D, YYYY"
                />
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={8}>
              <Form.Item
                name="time"
                label="Time"
                rules={[
                  { required: true, message: 'Please select a time' }
                ]}
              >
                <TimePicker
                  placeholder="Select time"
                  style={{ width: '100%' }}
                  format="h:mm A"
                  use12Hours
                  minuteStep={15}
                  disabledTime={disabledTime}
                />
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={8}>
              <Form.Item
                name="duration"
                label="Duration (minutes)"
                rules={[
                  { required: true, message: 'Please enter duration' },
                  { type: 'number', min: 15, max: 480, message: 'Duration must be between 15-480 minutes' }
                ]}
              >
                <InputNumber
                  placeholder="30"
                  style={{ width: '100%' }}
                  min={15}
                  max={480}
                  step={15}
                  prefix={<ClockCircleOutlined />}
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
    </Modal>
  )
}

export default AppointmentModal