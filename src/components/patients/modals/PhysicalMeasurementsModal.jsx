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
  Statistic,
  Tag,
  Switch,
  Select
} from 'antd'
import { 
  DashboardOutlined,
  FireOutlined,
  InfoCircleOutlined,
  ScissorOutlined,
  HeartOutlined,
  UserOutlined,
  CameraOutlined
} from '@ant-design/icons'
import { usePatients } from '../../../hooks/usePatients'
import { MeasurementImageUpload } from '../../common/FileUpload'
import dayjs from 'dayjs'
import './PhysicalMeasurementsModal.css'

const { Title, Text } = Typography
const { TextArea } = Input
const { Option } = Select

// Predefined values for physical measurements
const PHYSICAL_STANDARDS = {
  weight: [
    { value: '50', label: '50 kg' },
    { value: '55', label: '55 kg' },
    { value: '60', label: '60 kg' },
    { value: '65', label: '65 kg' },
    { value: '70', label: '70 kg' },
    { value: '75', label: '75 kg' },
    { value: '80', label: '80 kg' },
    { value: '85', label: '85 kg' },
    { value: '90', label: '90 kg' },
    { value: '95', label: '95 kg' },
    { value: '100', label: '100 kg' }
  ],
  height: [
    { value: '150', label: '150 cm (4\'11")' },
    { value: '155', label: '155 cm (5\'1")' },
    { value: '160', label: '160 cm (5\'3")' },
    { value: '165', label: '165 cm (5\'5")' },
    { value: '170', label: '170 cm (5\'7")' },
    { value: '175', label: '175 cm (5\'9")' },
    { value: '180', label: '180 cm (5\'11")' },
    { value: '185', label: '185 cm (6\'1")' },
    { value: '190', label: '190 cm (6\'3")' }
  ]
}

const PhysicalMeasurementsModal = ({ visible, onClose, patient }) => {
  const [form] = Form.useForm()
  const { addMeasurement } = usePatients()
  const [loading, setLoading] = useState(false)
  const [calculatedBMI, setCalculatedBMI] = useState(null)
  
  // State for input types (standard vs custom)
  const [inputTypes, setInputTypes] = useState({
    height: 'standard',
    weight: 'standard'
  })

  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        recordedAt: dayjs(),
        recordedBy: 'Current User'
      })
      // Reset input types when modal opens
      setInputTypes({
        height: 'standard',
        weight: 'standard'
      })
    }
  }, [visible, form])

  // Calculate BMI when height and weight change
  const calculateBMI = (height, weight) => {
    if (height && weight && height > 0 && weight > 0) {
      const heightInMeters = height / 100
      const bmi = weight / (heightInMeters * heightInMeters)
      return bmi.toFixed(1)
    }
    return null
  }

  const handleInputTypeChange = (field, type) => {
    setInputTypes(prev => ({ ...prev, [field]: type }))
    // Clear the field value when switching types
    form.setFieldsValue({ [field]: undefined })
    // Recalculate BMI
    const height = field === 'height' ? undefined : form.getFieldValue('height')
    const weight = field === 'weight' ? undefined : form.getFieldValue('weight')
    const bmi = calculateBMI(height, weight)
    setCalculatedBMI(bmi)
  }

  const handleFormChange = (changedFields, allFields) => {
    const height = form.getFieldValue('height')
    const weight = form.getFieldValue('weight')
    const bmi = calculateBMI(height, weight)
    setCalculatedBMI(bmi)
  }

  const handleSubmit = async (values) => {
    setLoading(true)
    
    try {
      const measurements = []
      
      // Prepare shared attachment data
      const attachments = values.devicePhoto || []
      
      // Height
      if (values.height) {
        measurements.push({
          type: 'height',
          value: values.height,
          recordedAt: values.recordedAt.toISOString(),
          recordedBy: values.recordedBy,
          notes: values.heightNotes || values.generalNotes,
          attachments
        })
      }

      // Weight
      if (values.weight) {
        measurements.push({
          type: 'weight',
          value: values.weight,
          recordedAt: values.recordedAt.toISOString(),
          recordedBy: values.recordedBy,
          notes: values.weightNotes || values.generalNotes,
          attachments
        })
      }

      // Add all measurements
      for (const measurement of measurements) {
        await addMeasurement(patient.id, measurement)
      }
      
      message.success(`${measurements.length} physical measurement(s) recorded successfully!`)
      handleClose()
      
    } catch (error) {
      message.error('Failed to record physical measurements. Please try again.')
      console.error('Error adding physical measurements:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    form.resetFields()
    setCalculatedBMI(null)
    setInputTypes({
      height: 'standard',
      weight: 'standard'
    })
    onClose()
  }

  const getBMIStatus = (bmi) => {
    if (!bmi) return null
    const bmiValue = parseFloat(bmi)
    
    if (bmiValue < 18.5) {
      return { 
        type: 'warning', 
        message: 'Underweight - may need nutritional support',
        category: 'Underweight',
        color: '#faad14'
      }
    }
    if (bmiValue <= 24.9) {
      return { 
        type: 'success', 
        message: 'Normal weight range',
        category: 'Normal',
        color: '#52c41a'
      }
    }
    if (bmiValue <= 29.9) {
      return { 
        type: 'warning', 
        message: 'Overweight - consider lifestyle modifications',
        category: 'Overweight',
        color: '#fa8c16'
      }
    }
    if (bmiValue <= 34.9) {
      return { 
        type: 'error', 
        message: 'Class I Obesity - health risks increased',
        category: 'Obese Class I',
        color: '#ff4d4f'
      }
    }
    if (bmiValue <= 39.9) {
      return { 
        type: 'error', 
        message: 'Class II Obesity - significant health risks',
        category: 'Obese Class II',
        color: '#ff4d4f'
      }
    }
    return { 
      type: 'error', 
      message: 'Class III Obesity - severe health risks, consider medical intervention',
      category: 'Obese Class III',
      color: '#cf1322'
    }
  }

  const getHeightStatus = (height, age) => {
    if (!height) return null
    // This is a simplified check - in practice, you'd use growth charts for children
    // and consider age/gender for adults
    if (height < 140) {
      return { type: 'info', message: 'Below average height - consider growth evaluation if child' }
    }
    if (height > 200) {
      return { type: 'info', message: 'Above average height' }
    }
    return { type: 'success', message: 'Normal height range' }
  }

  const getWeightStatus = (weight, bmi) => {
    if (!weight) return null
    
    // Basic weight checks
    if (weight < 40) {
      return { type: 'warning', message: 'Low weight - nutritional assessment recommended' }
    }
    if (weight > 150) {
      return { type: 'info', message: 'High weight - consider BMI interpretation' }
    }
    
    // Use BMI status if available
    if (bmi) {
      const bmiStatus = getBMIStatus(bmi)
      return bmiStatus ? { 
        type: bmiStatus.type, 
        message: `Weight correlates with ${bmiStatus.category} BMI` 
      } : null
    }
    
    return { type: 'success', message: 'Weight recorded' }
  }

  const getIdealWeightRange = (height) => {
    if (!height) return null
    
    // Using simplified ideal weight calculations
    // For men: 50kg + 2.3kg per inch over 5 feet
    // For women: 45.5kg + 2.3kg per inch over 5 feet
    // We'll use a general range here
    
    const heightInInches = height / 2.54
    const feetOver5 = Math.max(0, heightInInches - 60)
    
    const idealMale = 50 + (feetOver5 * 2.3)
    const idealFemale = 45.5 + (feetOver5 * 2.3)
    
    const minIdeal = Math.min(idealMale, idealFemale) - 5
    const maxIdeal = Math.max(idealMale, idealFemale) + 5
    
    return {
      min: Math.round(minIdeal),
      max: Math.round(maxIdeal)
    }
  }

  const bmiStatus = getBMIStatus(calculatedBMI)
  const idealWeight = getIdealWeightRange(form.getFieldValue('height'))

  const renderFieldWithToggle = (fieldName, label, unit, icon, placeholder) => {
    const standards = PHYSICAL_STANDARDS[fieldName]
    const inputType = inputTypes[fieldName]

    return (
      <Card size="small" className="physical-measurement-card">
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
                    {inputType === 'standard' ? 'Common Values' : 'Custom Value'}
                  </Text>
                  <br />
                  <Text type="secondary" size="small">
                    {inputType === 'standard' 
                      ? 'Select from typical ranges' 
                      : 'Enter exact measurement'
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
                  onChange={(value) => {
                    // Trigger BMI calculation when value changes
                    setTimeout(() => {
                      const height = fieldName === 'height' ? value : form.getFieldValue('height')
                      const weight = fieldName === 'weight' ? value : form.getFieldValue('weight')
                      const bmi = calculateBMI(height, weight)
                      setCalculatedBMI(bmi)
                    }, 0)
                  }}
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
                  step={fieldName === 'height' ? 1 : 0.1}
                  onChange={(value) => {
                    // Trigger BMI calculation when value changes
                    const height = fieldName === 'height' ? value : form.getFieldValue('height')
                    const weight = fieldName === 'weight' ? value : form.getFieldValue('weight')
                    const bmi = calculateBMI(height, weight)
                    setCalculatedBMI(bmi)
                  }}
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
          <UserOutlined style={{ color: '#52c41a' }} />
          <span>Record Physical Measurements</span>
        </Space>
      }
      open={visible}
      onCancel={handleClose}
      width={800}
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
          form="physical-measurements-form"
        >
          {loading ? 'Recording...' : 'Record Measurements'}
        </Button>
      ]}
      className="physical-measurements-modal"
    >
      <div className="physical-measurements-form">
        <Alert
          message="Physical Measurements"
          description="Record patient's height and weight measurements. BMI will be calculated automatically."
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Form
          id="physical-measurements-form"
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          onFieldsChange={handleFormChange}
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
            <DashboardOutlined /> Physical Measurements
          </Title>

          <Row gutter={[16, 16]}>
            {/* Height */}
            <Col xs={24} lg={12}>
              {renderFieldWithToggle('height', 'Height', 'cm', <ScissorOutlined style={{ color: '#722ed1' }} />, '175')}
            </Col>

            {/* Weight */}
            <Col xs={24} lg={12}>
              {renderFieldWithToggle('weight', 'Weight', 'kg', <FireOutlined style={{ color: '#1890ff' }} />, '70')}
            </Col>
          </Row>

          {/* BMI Calculation Section */}
          {calculatedBMI && (
            <div style={{ marginTop: 24 }}>
              <Title level={4} style={{ marginBottom: 16 }}>
                <HeartOutlined style={{ color: '#fa8c16' }} /> Body Mass Index (BMI)
              </Title>
              
              <Row gutter={16} align="middle">
                <Col xs={24} sm={8}>
                  <Card>
                    <Statistic
                      title="Calculated BMI"
                      value={calculatedBMI}
                      precision={1}
                      valueStyle={{ 
                        color: bmiStatus?.color || '#1890ff',
                        fontSize: '32px',
                        fontWeight: 'bold'
                      }}
                      suffix="kg/m²"
                    />
                    {bmiStatus && (
                      <Tag 
                        color={bmiStatus.color} 
                        style={{ 
                          marginTop: 8,
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}
                      >
                        {bmiStatus.category}
                      </Tag>
                    )}
                  </Card>
                </Col>
                
                <Col xs={24} sm={16}>
                  {bmiStatus && (
                    <Alert
                      message={`BMI: ${bmiStatus.category}`}
                      description={bmiStatus.message}
                      type={bmiStatus.type}
                      showIcon
                      style={{ marginBottom: 16 }}
                    />
                  )}
                  
                  <div>
                    <Text type="secondary" size="small">
                      <strong>BMI Categories:</strong><br />
                      • Underweight: &lt; 18.5<br />
                      • Normal: 18.5 - 24.9<br />
                      • Overweight: 25.0 - 29.9<br />
                      • Obese: ≥ 30.0
                    </Text>
                  </div>
                </Col>
              </Row>
            </div>
          )}

          {/* Device Reading Photo */}
          <Form.Item
            label={
              <Space>
                <CameraOutlined />
                <span>Device Reading Photo</span>
              </Space>
            }
            name="devicePhoto"
            help="Take a photo of scale display, height measurement tool, or body composition analyzer"
            style={{ marginTop: 24 }}
          >
            <MeasurementImageUpload />
          </Form.Item>

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
              placeholder="Measurement conditions, patient position, clothing status..."
            />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  )
}

export default PhysicalMeasurementsModal 