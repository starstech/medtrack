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
  Rate,
  Spin
} from 'antd'
import { 
  BulbOutlined,
  AlertOutlined,
  SmileOutlined,
  FrownOutlined,
  InfoCircleOutlined,
  CameraOutlined
} from '@ant-design/icons'
import { usePatients } from '../../../hooks/usePatients'
import { MeasurementImageUpload } from '../../common/FileUpload'
import { measurementPreferencesService } from '../../../services/measurementPreferencesService'
import dayjs from 'dayjs'
import './SubjectiveMeasurementsModal.css'

const { Title, Text } = Typography
const { TextArea } = Input

const SubjectiveMeasurementsModal = ({ visible, onClose, patient }) => {
  const [form] = Form.useForm()
  const { addMeasurement } = usePatients()
  const [loading, setLoading] = useState(false)
  const [preferencesLoading, setPreferencesLoading] = useState(true)
  const [availableMeasurements, setAvailableMeasurements] = useState({})

  useEffect(() => {
    if (visible && patient?.id) {
      loadPreferences()
      form.setFieldsValue({
        recordedAt: dayjs(),
        recordedBy: 'Current User'
      })
    }
  }, [visible, patient, form])

  const loadPreferences = async () => {
    try {
      setPreferencesLoading(true)
      const result = await measurementPreferencesService.getMeasurementAvailability(patient.id)
      
      if (result.success) {
        // Check if subjective measurements category is enabled
        if (!result.data.categories.subjectiveMeasurements) {
          // Category is disabled, close the modal
          onClose()
          message.warning('Subjective assessments are disabled in your preferences.')
          return
        }
        
        // Extract available subjective measurements
        const subjectiveMeasurements = result.data.measurements.subjective || {}
        setAvailableMeasurements(subjectiveMeasurements)
      } else {
        console.error('Failed to load preferences:', result.error)
        // Default to all measurements enabled on error
        setAvailableMeasurements({
          pain_level: true,
          mood: true,
          energy_level: true,
          sleep_quality: true,
          appetite: true
        })
      }
    } catch (error) {
      console.error('Error loading measurement preferences:', error)
      // Default to all measurements enabled on error
      setAvailableMeasurements({
        pain_level: true,
        mood: true,
        energy_level: true,
        sleep_quality: true,
        appetite: true
      })
    } finally {
      setPreferencesLoading(false)
    }
  }

  const handleSubmit = async (values) => {
    setLoading(true)
    
    try {
      const measurements = []
      
      // Prepare shared attachment data
      const attachments = values.assessmentPhoto || []
      
      // Pain Level
      if (values.painLevel !== undefined && values.painLevel !== null) {
        measurements.push({
          type: 'pain_level',
          value: values.painLevel,
          recordedAt: values.recordedAt.toISOString(),
          recordedBy: values.recordedBy,
          notes: values.painNotes || values.generalNotes,
          attachments
        })
      }

      // Mood Rating
      if (values.moodRating !== undefined && values.moodRating !== null) {
        measurements.push({
          type: 'mood_rating',
          value: values.moodRating,
          recordedAt: values.recordedAt.toISOString(),
          recordedBy: values.recordedBy,
          notes: values.moodNotes || values.generalNotes,
          attachments
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
          <span>Record Subjective Assessments</span>
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
          form="subjective-measurements-form"
        >
          {loading ? 'Recording...' : 'Record Assessments'}
        </Button>
      ]}
      className="subjective-measurements-modal"
    >
      <div className="subjective-measurements-form">
        <Alert
          message="Subjective Assessments"
          description="Record patient-reported measurements such as pain levels and mood ratings."
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Form
          id="subjective-measurements-form"
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
            <BulbOutlined /> Subjective Assessments
          </Title>

          {/* Pain Level - only show if enabled */}
          {(availableMeasurements.pain_level !== false) && (
            <Card style={{ marginBottom: 16 }}>
              <Row align="top" gutter={[16, 16]}>
                <Col span={24}>
                  <Space>
                    <AlertOutlined style={{ color: '#ff4d4f' }} />
                    <Text strong>Pain Level Assessment</Text>
                  </Space>
                </Col>
                
                <Col span={24}>
                  <Form.Item
                    name="painLevel"
                    label="Pain Level (0-10 scale)"
                    rules={[{ type: 'number', min: 0, max: 10, message: 'Pain level must be between 0 and 10' }]}
                  >
                    <Slider
                      min={0}
                      max={10}
                      marks={{
                        0: '0 - No Pain',
                        2: '2',
                        4: '4',
                        6: '6 - Moderate',
                        8: '8',
                        10: '10 - Severe'
                      }}
                      step={1}
                      tipFormatter={(value) => `${value} - ${getPainLevelDescription(value)}`}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          )}

          {/* Mood Rating - only show if enabled */}
          {(availableMeasurements.mood !== false) && (
            <Card style={{ marginBottom: 16 }}>
              <Row align="top" gutter={[16, 16]}>
                <Col span={24}>
                  <Space>
                    <SmileOutlined style={{ color: '#52c41a' }} />
                    <Text strong>Mood Rating</Text>
                  </Space>
                </Col>
                
                <Col span={24}>
                  <Form.Item
                    name="moodRating"
                    label="Overall Mood (1-5 stars)"
                    rules={[{ type: 'number', min: 1, max: 5, message: 'Mood rating must be between 1 and 5' }]}
                  >
                    <Rate 
                      character={<SmileOutlined />}
                      style={{ fontSize: 32 }}
                      tooltips={['Very Poor', 'Poor', 'Average', 'Good', 'Excellent']}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          )}

          {/* Assessment Photo */}
          <Form.Item
            label={
              <Space>
                <CameraOutlined />
                <span>Assessment Photo</span>
              </Space>
            }
            name="assessmentPhoto"
            help="Take a photo of pain assessment tools, visual analog scales, or patient drawings"
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
            style={{ marginTop: 16 }}
          >
            <TextArea 
              rows={3} 
              placeholder="Assessment conditions, patient cooperation, additional observations..."
            />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  )
}

export default SubjectiveMeasurementsModal 