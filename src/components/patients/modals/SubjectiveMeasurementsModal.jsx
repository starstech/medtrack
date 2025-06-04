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
  Slider,
  Card,
  Rate
} from 'antd'
import { 
  BulbOutlined,
  AlertOutlined,
  SmileOutlined,
  FrownOutlined,
  InfoCircleOutlined
} from '@ant-design/icons'
import { usePatients } from '../../../hooks/usePatients'
import dayjs from 'dayjs'
import './SubjectiveMeasurementsModal.css'

const { Title, Text } = Typography
const { TextArea } = Input

const SubjectiveMeasurementsModal = ({ visible, onClose, patient }) => {
  const [form] = Form.useForm()
  const { addMeasurement } = usePatients()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        recordedAt: dayjs(),
        recordedBy: 'Current User'
      })
    }
  }, [visible, form])

  const handleSubmit = async (values) => {
    setLoading(true)
    
    try {
      const measurements = []
      
      // Pain Level
      if (values.painLevel !== undefined && values.painLevel !== null) {
        measurements.push({
          type: 'pain_level',
          value: values.painLevel,
          recordedAt: values.recordedAt.toISOString(),
          recordedBy: values.recordedBy,
          notes: values.painNotes || values.generalNotes
        })
      }

      // Mood Rating
      if (values.moodRating !== undefined && values.moodRating !== null) {
        measurements.push({
          type: 'mood_rating',
          value: values.moodRating,
          recordedAt: values.recordedAt.toISOString(),
          recordedBy: values.recordedBy,
          notes: values.moodNotes || values.generalNotes
        })
      }

      if (measurements.length === 0) {
        message.warning('Please enter at least one assessment.')
        return
      }

      // Add all measurements
      for (const measurement of measurements) {
        await addMeasurement(patient.id, measurement)
      }
      
      message.success(`${measurements.length} subjective assessment(s) recorded successfully!`)
      handleClose()
      
    } catch (error) {
      message.error('Failed to record assessments. Please try again.')
      console.error('Error adding subjective measurements:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    form.resetFields()
    onClose()
  }

  const getPainLevelDescription = (level) => {
    const descriptions = {
      0: 'No pain',
      1: 'Mild discomfort',
      2: 'Mild pain',
      3: 'Moderate pain',
      4: 'Moderate pain',
      5: 'Moderate-severe pain',
      6: 'Severe pain',
      7: 'Very severe pain',
      8: 'Very severe pain',
      9: 'Extremely severe pain',
      10: 'Worst possible pain'
    }
    return descriptions[level] || ''
  }

  const getPainLevelStatus = (level) => {
    if (level === undefined || level === null) return null
    
    if (level === 0) {
      return { type: 'success', message: 'No pain reported - excellent!' }
    }
    if (level <= 3) {
      return { type: 'success', message: 'Mild pain - manageable level' }
    }
    if (level <= 6) {
      return { type: 'warning', message: 'Moderate pain - may need intervention' }
    }
    if (level <= 8) {
      return { type: 'error', message: 'Severe pain - pain management needed' }
    }
    return { type: 'error', message: 'Extreme pain - immediate attention required' }
  }

  const getMoodDescription = (rating) => {
    const descriptions = {
      1: 'Very poor mood',
      2: 'Poor mood', 
      3: 'Below average mood',
      4: 'Fair mood',
      5: 'Average mood',
      6: 'Good mood',
      7: 'Very good mood',
      8: 'Great mood',
      9: 'Excellent mood',
      10: 'Outstanding mood'
    }
    return descriptions[rating] || ''
  }

  const getMoodStatus = (rating) => {
    if (rating === undefined || rating === null) return null
    
    if (rating <= 3) {
      return { type: 'error', message: 'Low mood - consider psychological support' }
    }
    if (rating <= 5) {
      return { type: 'warning', message: 'Below average mood - monitor closely' }
    }
    if (rating <= 7) {
      return { type: 'success', message: 'Good mood - normal range' }
    }
    return { type: 'success', message: 'Excellent mood - very positive' }
  }

  const painMarks = {
    0: '0',
    2: '2',
    4: '4', 
    6: '6',
    8: '8',
    10: '10'
  }

  const moodMarks = {
    1: '1',
    3: '3',
    5: '5',
    7: '7',
    9: '9',
    10: '10'
  }

  return (
    <Modal
      title={
        <Space>
          <BulbOutlined style={{ color: '#722ed1' }} />
          <Title level={4} style={{ margin: 0 }}>
            Record Subjective Assessments
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
          form="subjective-measurements-form"
        >
          {loading ? 'Recording...' : 'Record Assessments'}
        </Button>
      ]}
      width={800}
      destroyOnClose
      className="subjective-measurements-modal"
      centered
    >
      <Alert
        message="Subjective Assessment Recording"
        description="Record patient-reported measurements like pain levels and mood. These help track comfort and mental state."
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Form
        id="subjective-measurements-form"
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        size="large"
        className="subjective-measurements-form"
      >
        {/* Pain Level Section */}
        <div className="form-section">
          <Title level={5}>
            <AlertOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
            Pain Level Assessment
          </Title>
          
          <Row gutter={24}>
            <Col xs={24} lg={16}>
              <Form.Item
                name="painLevel"
                label="Pain Level (0-10 Scale)"
              >
                <div className="pain-slider-container">
                  <Slider
                    min={0}
                    max={10}
                    marks={painMarks}
                    step={1}
                    tipFormatter={(value) => `${value}/10 - ${getPainLevelDescription(value)}`}
                    trackStyle={{ backgroundColor: '#ff4d4f' }}
                    handleStyle={{ borderColor: '#ff4d4f' }}
                  />
                </div>
              </Form.Item>
              
              <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.painLevel !== currentValues.painLevel}>
                {({ getFieldValue }) => {
                  const painLevel = getFieldValue('painLevel')
                  const description = getPainLevelDescription(painLevel)
                  return painLevel !== undefined && painLevel !== null ? (
                    <Card size="small" className="assessment-description">
                      <Text strong>Pain Level {painLevel}/10: </Text>
                      <Text>{description}</Text>
                    </Card>
                  ) : null
                }}
              </Form.Item>
            </Col>
            
            <Col xs={24} lg={8}>
              <div className="pain-scale-reference">
                <Title level={6}>Pain Scale Reference:</Title>
                <Text size="small" type="secondary">
                  <strong>0:</strong> No pain<br />
                  <strong>1-3:</strong> Mild pain<br />
                  <strong>4-6:</strong> Moderate pain<br />
                  <strong>7-10:</strong> Severe pain
                </Text>
              </div>
            </Col>
          </Row>

          <Form.Item name="painNotes" label="Pain Notes">
            <TextArea 
              placeholder="Location, type of pain, triggers, what helps..."
              rows={2}
              maxLength={300}
              showCount
            />
          </Form.Item>

          <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.painLevel !== currentValues.painLevel}>
            {({ getFieldValue }) => {
              const painStatus = getPainLevelStatus(getFieldValue('painLevel'))
              return painStatus ? (
                <Alert
                  message={painStatus.message}
                  type={painStatus.type}
                  size="small"
                  style={{ marginBottom: 16 }}
                />
              ) : null
            }}
          </Form.Item>
        </div>

        {/* Mood Rating Section */}
        <div className="form-section">
          <Title level={5}>
            <SmileOutlined style={{ color: '#722ed1', marginRight: 8 }} />
            Mood Rating Assessment
          </Title>
          
          <Row gutter={24}>
            <Col xs={24} lg={16}>
              <Form.Item
                name="moodRating"
                label="Mood Rating (1-10 Scale)"
              >
                <div className="mood-slider-container">
                  <Slider
                    min={1}
                    max={10}
                    marks={moodMarks}
                    step={1}
                    tipFormatter={(value) => `${value}/10 - ${getMoodDescription(value)}`}
                    trackStyle={{ backgroundColor: '#722ed1' }}
                    handleStyle={{ borderColor: '#722ed1' }}
                  />
                </div>
              </Form.Item>
              
              <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.moodRating !== currentValues.moodRating}>
                {({ getFieldValue }) => {
                  const moodRating = getFieldValue('moodRating')
                  const description = getMoodDescription(moodRating)
                  return moodRating !== undefined && moodRating !== null ? (
                    <Card size="small" className="assessment-description">
                      <Text strong>Mood Rating {moodRating}/10: </Text>
                      <Text>{description}</Text>
                    </Card>
                  ) : null
                }}
              </Form.Item>
            </Col>
            
            <Col xs={24} lg={8}>
              <div className="mood-scale-reference">
                <Title level={6}>Mood Scale Reference:</Title>
                <Text size="small" type="secondary">
                  <strong>1-3:</strong> Very low mood<br />
                  <strong>4-5:</strong> Below average<br />
                  <strong>6-7:</strong> Good mood<br />
                  <strong>8-10:</strong> Excellent mood
                </Text>
              </div>
            </Col>
          </Row>

          <Form.Item name="moodNotes" label="Mood Notes">
            <TextArea 
              placeholder="Current feelings, energy level, sleep quality, stress factors..."
              rows={2}
              maxLength={300}
              showCount
            />
          </Form.Item>

          <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.moodRating !== currentValues.moodRating}>
            {({ getFieldValue }) => {
              const moodStatus = getMoodStatus(getFieldValue('moodRating'))
              return moodStatus ? (
                <Alert
                  message={moodStatus.message}
                  type={moodStatus.type}
                  size="small"
                  style={{ marginBottom: 16 }}
                />
              ) : null
            }}
          </Form.Item>
        </div>

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
              placeholder="Overall condition, environmental factors, medication effects..."
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

export default SubjectiveMeasurementsModal 