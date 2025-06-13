import { useState, useEffect } from 'react'
import { 
  Modal, 
  Form, 
  Radio, 
  Input, 
  TimePicker, 
  Button, 
  Space, 
  Typography,
  Alert,
  Card
} from 'antd'
import { 
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  MedicineBoxOutlined,
  UserOutlined,
  CalendarOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import './MarkDoseModal.css'

const { Title, Text } = Typography
const { TextArea } = Input

const MarkDoseModal = ({ visible, dose, onMarkDose, onClose }) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState('taken')

  useEffect(() => {
    if (visible && dose) {
      // Reset form when modal opens
      form.resetFields()
      setSelectedStatus(dose.status === 'pending' ? 'taken' : dose.status)
      
      // Pre-fill with existing data if editing
      if (dose.status !== 'pending') {
        form.setFieldsValue({
          status: dose.status,
          actualTime: dose.takenAt ? dayjs(dose.takenAt) : dayjs(),
          notes: dose.notes || ''
        })
        setSelectedStatus(dose.status)
      } else {
        // Set default time to now for new entries
        form.setFieldsValue({
          status: 'taken',
          actualTime: dayjs(),
          notes: ''
        })
      }
    }
  }, [visible, dose, form])

  const handleSubmit = async (values) => {
    setLoading(true)
    
    try {
      const doseData = {
        medicationId: dose.medication.id,
        doseId: dose.id,
        status: values.status,
        notes: values.notes || '',
        actualTime: values.actualTime?.toISOString() || new Date().toISOString()
      }

      await onMarkDose(doseData)
    } catch (error) {
      console.error('Error marking dose:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value)
    
    // Set default time based on status
    if (e.target.value === 'taken') {
      form.setFieldValue('actualTime', dayjs())
    } else if (e.target.value === 'missed') {
      form.setFieldValue('actualTime', dayjs(dose.scheduledTime))
    }
  }

  const getScheduledTimeInfo = () => {
    const scheduledTime = dayjs(dose.scheduledTime)
    const now = dayjs()
    const isOverdue = scheduledTime.isBefore(now)
    
    return {
      time: scheduledTime.format('h:mm A'),
      date: scheduledTime.format('MMM D, YYYY'),
      isOverdue,
      diffText: isOverdue ? scheduledTime.fromNow() : scheduledTime.toNow()
    }
  }

  const scheduledInfo = getScheduledTimeInfo()

  if (!dose) return null

  return (
    <Modal
      title={
        <Space>
          <MedicineBoxOutlined />
          <span>{dose.status === 'pending' ? 'Mark Dose' : 'Edit Dose Record'}</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={[
        <Button
          key="cancel"
          onClick={onClose}
          size="large"
        >
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          htmlType="submit"
          loading={loading}
          size="large"
          form="mark-dose-form"
        >
          {dose.status === 'pending' ? 'Mark Dose' : 'Update Record'}
        </Button>
      ]}
      width={600}
      className="mark-dose-modal"
      destroyOnHidden
      centered
    >
      {/* Dose Information Card */}
      <Card size="small" className="dose-info-card">
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <div>
            <Text strong>{dose.medication.name}</Text>
            <Text type="secondary" style={{ marginLeft: 8 }}>
              {dose.medication.dosage} {dose.medication.form}
            </Text>
          </div>
          
          <div>
            <Space>
              <UserOutlined />
              <Text type="secondary">{dose.patient.name}</Text>
            </Space>
          </div>
          
          <div>
            <Space>
              <CalendarOutlined />
              <Text type="secondary">
                Scheduled: {scheduledInfo.time} on {scheduledInfo.date}
              </Text>
              {scheduledInfo.isOverdue && (
                <Text type="danger" size="small">(Overdue)</Text>
              )}
            </Space>
          </div>
        </Space>
      </Card>

      {/* Overdue Warning */}
      {dose.status === 'pending' && scheduledInfo.isOverdue && (
        <Alert
          message="This dose is overdue"
          description={`Scheduled ${scheduledInfo.diffText}. Please confirm whether it was taken or missed.`}
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Form */}
      <Form
        id="mark-dose-form"
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        style={{ marginTop: 16 }}
      >
        {/* Status Selection */}
        <Form.Item
          name="status"
          label="Dose Status"
          rules={[
            { required: true, message: 'Please select the dose status' }
          ]}
        >
          <Radio.Group onChange={handleStatusChange}>
            <Radio value="taken">
              <Space>
                <CheckCircleOutlined style={{ color: '#52c41a' }} />
                Taken
              </Space>
            </Radio>
            <Radio value="missed">
              <Space>
                <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                Missed
              </Space>
            </Radio>
          </Radio.Group>
        </Form.Item>

        {/* Time Selection */}
        <Form.Item
          name="actualTime"
          label={selectedStatus === 'taken' ? 'Time Taken' : 'Time Missed'}
          rules={[
            { required: true, message: 'Please select the time' }
          ]}
        >
          <TimePicker
            format="h:mm A"
            use12Hours
            placeholder="Select time"
            style={{ width: '100%' }}
          />
        </Form.Item>

        {/* Notes */}
        <Form.Item
          name="notes"
          label="Notes (Optional)"
        >
          <TextArea
            placeholder="Add any relevant notes..."
            rows={3}
            maxLength={500}
            showCount
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default MarkDoseModal