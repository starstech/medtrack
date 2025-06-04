import { useState, useEffect } from 'react'
import { 
  Modal, 
  Form, 
  Input, 
  InputNumber,
  DatePicker, 
  Button, 
  Space, 
  Typography,
  Row,
  Col,
  message,
  Alert,
  Tooltip,
  Card,
  Switch,
  Select
} from 'antd'
import { 
  HeartOutlined,
  ThunderboltOutlined,
  DashboardOutlined,
  EyeOutlined,
  InfoCircleOutlined
} from '@ant-design/icons'
import { usePatients } from '../../../hooks/usePatients'
import dayjs from 'dayjs'
import './VitalSignsModal.css'

const { Title, Text } = Typography
const { TextArea } = Input
const { Option } = Select

// Predefined clinical values for vital signs
const VITAL_STANDARDS = {
  temperature: [
    { value: '36.1', label: '36.1°C (Normal)' },
    { value: '36.5', label: '36.5°C (Normal)' },
    { value: '37.0', label: '37.0°C (Normal)' },
    { value: '37.2', label: '37.2°C (Normal)' },
    { value: '37.5', label: '37.5°C (Low fever)' },
    { value: '38.0', label: '38.0°C (Fever)' },
    { value: '38.5', label: '38.5°C (Fever)' },
    { value: '39.0', label: '39.0°C (High fever)' },
    { value: '39.5', label: '39.5°C (High fever)' }
  ],
  heartRate: [
    { value: '60', label: '60 bpm (Normal)' },
    { value: '70', label: '70 bpm (Normal)' },
    { value: '80', label: '80 bpm (Normal)' },
    { value: '90', label: '90 bpm (Normal)' },
    { value: '100', label: '100 bpm (Normal)' },
    { value: '110', label: '110 bpm (Elevated)' },
    { value: '120', label: '120 bpm (Elevated)' }
  ],
  systolic: [
    { value: '90', label: '90 mmHg (Low)' },
    { value: '100', label: '100 mmHg (Normal)' },
    { value: '110', label: '110 mmHg (Normal)' },
    { value: '120', label: '120 mmHg (Normal)' },
    { value: '130', label: '130 mmHg (Elevated)' },
    { value: '140', label: '140 mmHg (High)' },
    { value: '150', label: '150 mmHg (High)' },
    { value: '160', label: '160 mmHg (High)' }
  ],
  diastolic: [
    { value: '60', label: '60 mmHg (Normal)' },
    { value: '70', label: '70 mmHg (Normal)' },
    { value: '80', label: '80 mmHg (Normal)' },
    { value: '90', label: '90 mmHg (Elevated)' },
    { value: '100', label: '100 mmHg (High)' },
    { value: '110', label: '110 mmHg (High)' }
  ],
  respiratoryRate: [
    { value: '12', label: '12 breaths/min (Normal)' },
    { value: '14', label: '14 breaths/min (Normal)' },
    { value: '16', label: '16 breaths/min (Normal)' },
    { value: '18', label: '18 breaths/min (Normal)' },
    { value: '20', label: '20 breaths/min (Normal)' },
    { value: '22', label: '22 breaths/min (Elevated)' },
    { value: '24', label: '24 breaths/min (Elevated)' }
  ],
  oxygenSaturation: [
    { value: '95', label: '95% (Low normal)' },
    { value: '96', label: '96% (Normal)' },
    { value: '97', label: '97% (Normal)' },
    { value: '98', label: '98% (Normal)' },
    { value: '99', label: '99% (Normal)' },
    { value: '100', label: '100% (Normal)' }
  ]
}

const VitalSignsModal = ({ visible, onClose, patient }) => {
  const [form] = Form.useForm()
  const { addMeasurement } = usePatients()
  const [loading, setLoading] = useState(false)
  const [bloodPressureMode, setBloodPressureMode] = useState('separate') // 'separate' or 'combined'
  
  // State for input types (standard vs custom)
  const [inputTypes, setInputTypes] = useState({
    temperature: 'standard',
    heartRate: 'standard',
    systolic: 'standard',
    diastolic: 'standard',
    respiratoryRate: 'standard',
    oxygenSaturation: 'standard'
  })

  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        recordedAt: dayjs(),
        recordedBy: 'Current User'
      })
      // Reset input types when modal opens
      setInputTypes({
        temperature: 'standard',
        heartRate: 'standard',
        systolic: 'standard',
        diastolic: 'standard',
        respiratoryRate: 'standard',
        oxygenSaturation: 'standard'
      })
    }
  }, [visible, form])

  const handleInputTypeChange = (field, type) => {
    setInputTypes(prev => ({ ...prev, [field]: type }))
    // Clear the field value when switching types
    form.setFieldsValue({ [field]: undefined })
  }

  const handleSubmit = async (values) => {
    setLoading(true)
    
    try {
      const measurements = []
      
      // Temperature
      if (values.temperature) {
        measurements.push({
          type: 'temperature',
          value: values.temperature,
          recordedAt: values.recordedAt.toISOString(),
          recordedBy: values.recordedBy,
          notes: values.temperatureNotes || values.generalNotes
        })
      }

      // Blood Pressure
      if (bloodPressureMode === 'separate') {
        if (values.systolic) {
          measurements.push({
            type: 'blood_pressure_systolic',
            value: values.systolic,
            recordedAt: values.recordedAt.toISOString(),
            recordedBy: values.recordedBy,
            notes: values.bloodPressureNotes || values.generalNotes
          })
        }
        if (values.diastolic) {
          measurements.push({
            type: 'blood_pressure_diastolic',
            value: values.diastolic,
            recordedAt: values.recordedAt.toISOString(),
            recordedBy: values.recordedBy,
            notes: values.bloodPressureNotes || values.generalNotes
          })
        }
      }

      // Heart Rate
      if (values.heartRate) {
        measurements.push({
          type: 'heart_rate',
          value: values.heartRate,
          recordedAt: values.recordedAt.toISOString(),
          recordedBy: values.recordedBy,
          notes: values.heartRateNotes || values.generalNotes
        })
      }

      // Respiratory Rate
      if (values.respiratoryRate) {
        measurements.push({
          type: 'respiratory_rate',
          value: values.respiratoryRate,
          recordedAt: values.recordedAt.toISOString(),
          recordedBy: values.recordedBy,
          notes: values.respiratoryNotes || values.generalNotes
        })
      }

      // Oxygen Saturation
      if (values.oxygenSaturation) {
        measurements.push({
          type: 'oxygen_saturation',
          value: values.oxygenSaturation,
          recordedAt: values.recordedAt.toISOString(),
          recordedBy: values.recordedBy,
          notes: values.oxygenNotes || values.generalNotes
        })
      }

      // Add all measurements
      for (const measurement of measurements) {
        await addMeasurement(patient.id, measurement)
      }
      
      message.success(`${measurements.length} vital sign measurement(s) recorded successfully!`)
      handleClose()
      
    } catch (error) {
      message.error('Failed to record vital signs. Please try again.')
      console.error('Error adding vital signs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    form.resetFields()
    setInputTypes({
      temperature: 'standard',
      heartRate: 'standard',
      systolic: 'standard',
      diastolic: 'standard',
      respiratoryRate: 'standard',
      oxygenSaturation: 'standard'
    })
    onClose()
  }

  const getTemperatureStatus = (temp) => {
    if (!temp) return null
    if (temp < 36.1) return { type: 'warning', message: 'Below normal (hypothermia risk)' }
    if (temp > 37.2) return { type: 'error', message: 'Fever detected' }
    if (temp > 38.9) return { type: 'error', message: 'High fever - seek medical attention' }
    return { type: 'success', message: 'Normal temperature' }
  }

  const getBloodPressureStatus = (systolic, diastolic) => {
    if (!systolic || !diastolic) return null
    
    if (systolic >= 180 || diastolic >= 120) {
      return { type: 'error', message: 'Hypertensive crisis - seek immediate medical attention' }
    }
    if (systolic >= 140 || diastolic >= 90) {
      return { type: 'error', message: 'High blood pressure (Stage 2)' }
    }
    if (systolic >= 130 || diastolic >= 80) {
      return { type: 'warning', message: 'High blood pressure (Stage 1)' }
    }
    if (systolic >= 120 && diastolic < 80) {
      return { type: 'warning', message: 'Elevated blood pressure' }
    }
    if (systolic < 90 || diastolic < 60) {
      return { type: 'warning', message: 'Low blood pressure (hypotension)' }
    }
    return { type: 'success', message: 'Normal blood pressure' }
  }

  const getHeartRateStatus = (hr) => {
    if (!hr) return null
    if (hr < 60) return { type: 'warning', message: 'Bradycardia (slow heart rate)' }
    if (hr > 100) return { type: 'warning', message: 'Tachycardia (fast heart rate)' }
    if (hr > 150) return { type: 'error', message: 'Very high heart rate - check patient' }
    return { type: 'success', message: 'Normal heart rate' }
  }

  const getRespiratoryStatus = (rr) => {
    if (!rr) return null
    if (rr < 12) return { type: 'warning', message: 'Bradypnea (slow breathing)' }
    if (rr > 20) return { type: 'warning', message: 'Tachypnea (fast breathing)' }
    if (rr > 24) return { type: 'error', message: 'Very high respiratory rate' }
    return { type: 'success', message: 'Normal respiratory rate' }
  }

  const getOxygenStatus = (o2) => {
    if (!o2) return null
    if (o2 < 90) return { type: 'error', message: 'Critical - oxygen supplementation needed' }
    if (o2 < 95) return { type: 'warning', message: 'Below normal oxygen saturation' }
    return { type: 'success', message: 'Normal oxygen saturation' }
  }

  const renderFieldWithToggle = (fieldName, label, unit, icon, placeholder) => {
    const standards = VITAL_STANDARDS[fieldName]
    const inputType = inputTypes[fieldName]

    return (
      <Card size="small" className="vital-sign-card">
        <Row align="middle" gutter={[16, 12]}>
          <Col span={24}>
            <Space>
              {icon}
              <Text strong>{label}</Text>
            </Space>
          </Col>
          
          <Col span={24}>
            <div className="input-type-toggle">
              <div className="toggle-content">
                <div className="toggle-info">
                  <Text strong>
                    {inputType === 'standard' ? 'Standard Values' : 'Custom Value'}
                  </Text>
                  <br />
                  <Text type="secondary" size="small">
                    {inputType === 'standard' 
                      ? 'Use common clinical values' 
                      : 'Enter exact measured value'
                    }
                  </Text>
                </div>
                <Switch
                  checked={inputType === 'standard'}
                  onChange={(checked) => handleInputTypeChange(fieldName, checked ? 'standard' : 'custom')}
                  size="small"
                />
              </div>
            </div>
          </Col>

          <Col span={24}>
            <Form.Item 
              name={fieldName}
              rules={[{ required: false }]}
              style={{ marginBottom: 0 }}
            >
              {inputType === 'standard' ? (
                <Select
                  placeholder={`Select ${label.toLowerCase()}`}
                  size="middle"
                  allowClear
                >
                  {standards?.map(option => (
                    <Option key={option.value} value={parseFloat(option.value)}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              ) : (
                <InputNumber
                  placeholder={placeholder}
                  suffix={unit}
                  size="middle"
                  style={{ width: '100%' }}
                  step={fieldName === 'temperature' ? 0.1 : 1}
                />
              )}
            </Form.Item>
          </Col>
        </Row>
      </Card>
    )
  }

  return (
    <Modal
      title={
        <Space>
          <HeartOutlined style={{ color: '#ff4d4f' }} />
          <span>Record Vital Signs</span>
        </Space>
      }
      open={visible}
      onCancel={handleClose}
      width={800}
      footer={null}
      className="vital-signs-modal"
    >
      <Alert
        message="Vital Signs Recording"
        description="Enter the vital signs measurements. All fields are optional - record only what's available."
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          recordedAt: dayjs(),
          recordedBy: 'Current User'
        }}
      >
        <Row gutter={[16, 16]}>
          {/* Date and Recorded By */}
          <Col xs={24} sm={12}>
            <Form.Item
              label="Date & Time"
              name="recordedAt"
              rules={[{ required: true, message: 'Please select date and time' }]}
            >
              <DatePicker 
                showTime 
                format="YYYY-MM-DD HH:mm"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              label="Recorded By"
              name="recordedBy"
              rules={[{ required: true, message: 'Please enter who recorded this' }]}
            >
              <Input placeholder="Enter name" />
            </Form.Item>
          </Col>
        </Row>

        <Title level={4} style={{ marginTop: 24, marginBottom: 16 }}>
          <HeartOutlined /> Vital Signs Measurements
        </Title>

        <Row gutter={[16, 16]}>
          {/* Temperature */}
          <Col xs={24} lg={12}>
            {renderFieldWithToggle('temperature', 'Temperature', '°C', <ThunderboltOutlined style={{ color: '#fa8c16' }} />, '36.5')}
          </Col>

          {/* Heart Rate */}
          <Col xs={24} lg={12}>
            {renderFieldWithToggle('heartRate', 'Heart Rate', 'bpm', <HeartOutlined style={{ color: '#52c41a' }} />, '72')}
          </Col>

          {/* Systolic Blood Pressure */}
          <Col xs={24} lg={12}>
            {renderFieldWithToggle('systolic', 'Systolic BP', 'mmHg', <HeartOutlined style={{ color: '#ff4d4f' }} />, '120')}
          </Col>

          {/* Diastolic Blood Pressure */}
          <Col xs={24} lg={12}>
            {renderFieldWithToggle('diastolic', 'Diastolic BP', 'mmHg', <HeartOutlined style={{ color: '#f5222d' }} />, '80')}
          </Col>

          {/* Respiratory Rate */}
          <Col xs={24} lg={12}>
            {renderFieldWithToggle('respiratoryRate', 'Respiratory Rate', '/min', <EyeOutlined style={{ color: '#1890ff' }} />, '16')}
          </Col>

          {/* Oxygen Saturation */}
          <Col xs={24} lg={12}>
            {renderFieldWithToggle('oxygenSaturation', 'Oxygen Saturation', '%', <DashboardOutlined style={{ color: '#722ed1' }} />, '98')}
          </Col>
        </Row>

        {/* General Notes */}
        <Form.Item
          label={
            <Space>
              <InfoCircleOutlined />
              <span>General Notes</span>
            </Space>
          }
          name="generalNotes"
          style={{ marginTop: 24 }}
        >
          <TextArea 
            rows={3} 
            placeholder="Enter any additional notes about the vital signs measurements..."
          />
        </Form.Item>

        {/* Submit Button */}
        <Form.Item style={{ marginTop: 24, marginBottom: 0, textAlign: 'center' }}>
          <Space>
            <Button onClick={handleClose}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Record Vital Signs
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default VitalSignsModal 