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
  Divider
} from 'antd'
import { 
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  MedicineBoxOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'

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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'taken':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />
      case 'missed':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
      default:
        return <ClockCircleOutlined style={{ color: '#fa8c16' }} />
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
          <Title level={4} style={{ margin: 0 }}>
            {dose.status === 'pending' ? 'Mark Dose' : 'Edit Dose Record'}
          </Title>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={500}
      className="mark-dose-modal"
      destroyOnClose
    >
      {/* Dose Information */}
      <div className="dose-info-section">
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <div className="medication-summary">
            <Text strong className="medication-name">
              {dose.medication.name}
            </Text>
            <Text type="secondary"> • </Text>
            <Text type="secondary">
              {dose.medication.dosage} {dose.medication.form}
            </Text>
          </div>
          
          <div className="patient-summary">
            <Text type="secondary">
              Patient: <Text strong>{dose.patient.name}</Text>
            </Text>
          </div>
          
          <div className="scheduled-info">
            <Space>
              <ClockCircleOutlined />
              <Text type="secondary">
                Scheduled: {scheduledInfo.time} on {scheduledInfo.date}
              </Text>
              {scheduledInfo.isOverdue && (
                <Text type="danger" size="small">
                  ({scheduledInfo.diffText})
                </Text>
              )}
            </Space>
          </div>
        </Space>
      </div>

      <Divider />

      {/* Overdue Warning */}
      {dose.status === 'pending' && scheduledInfo.isOverdue && (
        <Alert
          message="This dose is overdue"
          description="Please confirm whether the dose was taken or missed."
          type="warning"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      {/* Form */}
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        size="large"
        className="mark-dose-form"
      >
        {/* Status Selection */}
        <Form.Item
          name="status"
          label="Status"
          rules={[
            { required: true, message: 'Please select the dose status' }
          ]}
        >
          <Radio.Group onChange={handleStatusChange} className="status-radio-group">
            <Radio value="taken" className="status-radio">
              <Space>
                {getStatusIcon('taken')}
                <div>
                  <div>Dose Taken</div>
                  <Text type="secondary" size="small">
                    Patient received the medication
                  </Text>
                </div>
              </Space>
            </Radio>
            <Radio value="missed" className="status-radio">
              <Space>
                {getStatusIcon('missed')}
                <div>
                  <div>Dose Missed</div>
                  <Text type="secondary" size="small">
                    Patient did not receive the medication
                  </Text>
                </div>
              </Space>
            </Radio>
          </Radio.Group>
        </Form.Item>

        {/* Actual Time */}
        <Form.Item
          name="actualTime"
          label={selectedStatus === 'taken' ? 'Time Taken' : 'Time Recorded'}
          rules={[
            { required: true, message: 'Please select the time' }
          ]}
        >
          <TimePicker
            format="h:mm A"
            use12Hours
            style={{ width: '100%' }}
            placeholder="Select time"
          />
        </Form.Item>

        {/* Notes */}
        <Form.Item
          name="notes"
          label="Notes (Optional)"
        >
          <TextArea
            placeholder={
              selectedStatus === 'taken' 
                ? "Any notes about taking the dose (e.g., 'Taken with food', 'Patient felt nauseous')"
                : "Reason for missing the dose (e.g., 'Patient was sleeping', 'Forgot to administer')"
            }
            rows={3}
            maxLength={500}
            showCount
          />
        </Form.Item>

        {/* Form Actions */}
        <div className="form-actions">
          <Space>
            <Button
              onClick={onClose}
              size="large"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              icon={getStatusIcon(selectedStatus)}
            >
              {loading 
                ? 'Saving...' 
                : `Mark as ${selectedStatus === 'taken' ? 'Taken' : 'Missed'}`
              }
            </Button>
          </Space>
        </div>
      </Form>
    </Modal>
  )
}

export default MarkDoseModal