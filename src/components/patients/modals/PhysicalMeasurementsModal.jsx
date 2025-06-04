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
  Tag
} from 'antd'
import { 
  DashboardOutlined,
  FireOutlined,
  InfoCircleOutlined,
  ScissorOutlined,
  HeartOutlined
} from '@ant-design/icons'
import { usePatients } from '../../../hooks/usePatients'
import dayjs from 'dayjs'
import './PhysicalMeasurementsModal.css'

const { Title, Text } = Typography
const { TextArea } = Input

const PhysicalMeasurementsModal = ({ visible, onClose, patient }) => {
  const [form] = Form.useForm()
  const { addMeasurement } = usePatients()
  const [loading, setLoading] = useState(false)
  const [calculatedBMI, setCalculatedBMI] = useState(null)

  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        recordedAt: dayjs(),
        recordedBy: 'Current User'
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
      
      // Height
      if (values.height) {
        measurements.push({
          type: 'height',
          value: values.height,
          recordedAt: values.recordedAt.toISOString(),
          recordedBy: values.recordedBy,
          notes: values.heightNotes || values.generalNotes
        })
      }

      // Weight
      if (values.weight) {
        measurements.push({
          type: 'weight',
          value: values.weight,
          recordedAt: values.recordedAt.toISOString(),
          recordedBy: values.recordedBy,
          notes: values.weightNotes || values.generalNotes
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

  return (
    <Modal
      title={
        <Space>
          <DashboardOutlined style={{ color: '#52c41a' }} />
          <Title level={4} style={{ margin: 0 }}>
            Record Physical Measurements
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
          form="physical-measurements-form"
        >
          {loading ? 'Recording...' : 'Record Measurements'}
        </Button>
      ]}
      width={800}
      destroyOnClose
      className="physical-measurements-modal"
      centered
    >
      <Alert
        message="Physical Measurements Recording"
        description="Enter physical measurements. Height and weight will automatically calculate BMI."
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
        size="large"
        className="physical-measurements-form"
      >
        {/* Height Section */}
        <div className="form-section">
          <Title level={5}>
            <ScissorOutlined style={{ color: '#722ed1', marginRight: 8 }} />
            Height Measurement
          </Title>
          
          <Row gutter={16}>
            <Col xs={24} sm={16}>
              <Form.Item
                name="height"
                label={
                  <Space>
                    <span>Height (cm)</span>
                    <Tooltip title="Enter height in centimeters (e.g., 175 cm)">
                      <InfoCircleOutlined />
                    </Tooltip>
                  </Space>
                }
                rules={[
                  { type: 'number', min: 50, max: 250, message: 'Please enter a valid height (50-250 cm)' }
                ]}
              >
                <InputNumber
                  placeholder="175"
                  style={{ width: '100%' }}
                  addonAfter="cm"
                />
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={8}>
              <Form.Item name="heightNotes" label="Height Notes">
                <Input placeholder="Standing, lying, measurement method" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.height !== currentValues.height}>
            {({ getFieldValue }) => {
              const heightStatus = getHeightStatus(getFieldValue('height'))
              return heightStatus ? (
                <Alert
                  message={heightStatus.message}
                  type={heightStatus.type}
                  size="small"
                  style={{ marginBottom: 16 }}
                />
              ) : null
            }}
          </Form.Item>
        </div>

        {/* Weight Section */}
        <div className="form-section">
          <Title level={5}>
            <FireOutlined style={{ color: '#1890ff', marginRight: 8 }} />
            Weight Measurement
          </Title>
          
          <Row gutter={16}>
            <Col xs={24} sm={16}>
              <Form.Item
                name="weight"
                label={
                  <Space>
                    <span>Weight (kg)</span>
                    <Tooltip title="Enter weight in kilograms (e.g., 70 kg)">
                      <InfoCircleOutlined />
                    </Tooltip>
                  </Space>
                }
                rules={[
                  { type: 'number', min: 20, max: 300, message: 'Please enter a valid weight (20-300 kg)' }
                ]}
              >
                <InputNumber
                  placeholder="70"
                  step={0.1}
                  precision={1}
                  style={{ width: '100%' }}
                  addonAfter="kg"
                />
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={8}>
              <Form.Item name="weightNotes" label="Weight Notes">
                <Input placeholder="Clothed, fasting, time of day" />
              </Form.Item>
            </Col>
          </Row>

          {idealWeight && (
            <Alert
              message={`Ideal weight range: ${idealWeight.min} - ${idealWeight.max} kg`}
              type="info"
              size="small"
              style={{ marginBottom: 16 }}
            />
          )}

          <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => 
            prevValues.weight !== currentValues.weight || prevValues.height !== currentValues.height
          }>
            {({ getFieldValue }) => {
              const weightStatus = getWeightStatus(getFieldValue('weight'), calculatedBMI)
              return weightStatus ? (
                <Alert
                  message={weightStatus.message}
                  type={weightStatus.type}
                  size="small"
                  style={{ marginBottom: 16 }}
                />
              ) : null
            }}
          </Form.Item>
        </div>

        {/* BMI Calculation Section */}
        {calculatedBMI && (
          <div className="form-section">
            <Title level={5}>
              <HeartOutlined style={{ color: '#fa8c16', marginRight: 8 }} />
              Body Mass Index (BMI)
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
                  />
                )}
                
                <div style={{ marginTop: 16 }}>
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

        {/* General Information */}
        <div className="form-section">
          <Title level={5}>General Information</Title>
          
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="recordedAt"
                label="Date & Time"
                rules={[
                  { required: true, message: 'Please select date and time' }
                ]}
              >
                <DatePicker
                  showTime
                  format="MMM D, YYYY h:mm A"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={12}>
              <Form.Item
                name="recordedBy"
                label="Recorded By"
                rules={[
                  { required: true, message: 'Please enter who recorded this' }
                ]}
              >
                <Input placeholder="Current User" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="generalNotes" label="General Notes">
            <TextArea 
              placeholder="Measurement conditions, patient position, clothing status..."
              rows={3}
              maxLength={500}
              showCount
            />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  )
}

export default PhysicalMeasurementsModal 