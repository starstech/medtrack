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
  Select,
  Card,
  Tag,
  Switch
} from 'antd'
import { 
  ExperimentOutlined,
  DropboxOutlined,
  InfoCircleOutlined,
  MedicineBoxOutlined,
  CameraOutlined
} from '@ant-design/icons'
import { usePatients } from '../../../hooks/usePatients'
import { MeasurementImageUpload } from '../../common/FileUpload'
import dayjs from 'dayjs'
import './UrineTestModal.css'

const { Title, Text } = Typography
const { TextArea } = Input
const { Option } = Select

// Predefined clinical values for urine tests
const URINE_STANDARDS = {
  protein: [
    { value: 'Negative', label: 'Negative' },
    { value: 'Trace', label: 'Trace' },
    { value: '+1', label: '+1 (Mild)' },
    { value: '+2', label: '+2 (Moderate)' },
    { value: '+3', label: '+3 (Marked)' },
    { value: '+4', label: '+4 (Severe)' }
  ],
  glucose: [
    { value: 'Negative', label: 'Negative' },
    { value: '+1', label: '+1 (≈250 mg/dL)' },
    { value: '+2', label: '+2 (≈500 mg/dL)' },
    { value: '+3', label: '+3 (≈1000 mg/dL)' },
    { value: '+4', label: '+4 (≈2000+ mg/dL)' }
  ],
  ketones: [
    { value: 'Negative', label: 'Negative' },
    { value: 'Trace', label: 'Trace (5 mg/dL)' },
    { value: 'Small', label: 'Small (15 mg/dL)' },
    { value: 'Moderate', label: 'Moderate (40 mg/dL)' },
    { value: 'Large', label: 'Large (80+ mg/dL)' }
  ],
  blood: [
    { value: 'Negative', label: 'Negative' },
    { value: '+1', label: '+1 (Small)' },
    { value: '+2', label: '+2 (Moderate)' },
    { value: '+3', label: '+3 (Large)' }
  ],
  leukocytes: [
    { value: 'Negative', label: 'Negative' },
    { value: '+1', label: '+1 (Small)' },
    { value: '+2', label: '+2 (Moderate)' },
    { value: '+3', label: '+3 (Large)' }
  ]
}

const UrineTestModal = ({ visible, onClose, patient }) => {
  const [form] = Form.useForm()
  const { addMeasurement } = usePatients()
  const [loading, setLoading] = useState(false)
  
  // State for input types (standard vs custom)
  const [inputTypes, setInputTypes] = useState({
    protein: 'standard',
    glucose: 'standard', 
    ketones: 'standard',
    blood: 'standard',
    leukocytes: 'standard'
  })

  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        recordedAt: dayjs(),
        recordedBy: 'Current User'
      })
      // Reset input types when modal opens
      setInputTypes({
        protein: 'standard',
        glucose: 'standard',
        ketones: 'standard', 
        blood: 'standard',
        leukocytes: 'standard'
      })
    }
  }, [visible, form])

  const handleInputTypeChange = (field, type) => {
    setInputTypes(prev => ({ ...prev, [field]: type }))
    // Clear the field value when switching types
    form.setFieldsValue({ [`urine${field.charAt(0).toUpperCase() + field.slice(1)}`]: undefined })
  }

  const handleSubmit = async (values) => {
    setLoading(true)
    
    try {
      const measurements = []
      
      // Prepare shared attachment data
      const attachments = values.dipstickPhoto || []
      
      // Urine Protein
      if (values.urineProtein !== undefined && values.urineProtein !== null) {
        measurements.push({
          type: 'urine_protein',
          value: values.urineProtein,
          recordedAt: values.recordedAt.toISOString(),
          recordedBy: values.recordedBy,
          notes: values.proteinNotes || values.generalNotes,
          attachments
        })
      }

      // Urine Glucose
      if (values.urineGlucose !== undefined && values.urineGlucose !== null) {
        measurements.push({
          type: 'urine_glucose',
          value: values.urineGlucose,
          recordedAt: values.recordedAt.toISOString(),
          recordedBy: values.recordedBy,
          notes: values.glucoseNotes || values.generalNotes,
          attachments
        })
      }

      // Urine Ketones
      if (values.urineKetones !== undefined && values.urineKetones !== null) {
        measurements.push({
          type: 'urine_ketones',
          value: values.urineKetones,
          recordedAt: values.recordedAt.toISOString(),
          recordedBy: values.recordedBy,
          notes: values.ketonesNotes || values.generalNotes,
          attachments
        })
      }

      // Urine Specific Gravity
      if (values.urineSpecificGravity !== undefined && values.urineSpecificGravity !== null) {
        measurements.push({
          type: 'urine_specific_gravity',
          value: values.urineSpecificGravity,
          recordedAt: values.recordedAt.toISOString(),
          recordedBy: values.recordedBy,
          notes: values.specificGravityNotes || values.generalNotes,
          attachments
        })
      }

      // Urine pH
      if (values.urinePH !== undefined && values.urinePH !== null) {
        measurements.push({
          type: 'urine_ph',
          value: values.urinePH,
          recordedAt: values.recordedAt.toISOString(),
          recordedBy: values.recordedBy,
          notes: values.phNotes || values.generalNotes,
          attachments
        })
      }

      // Urine Blood
      if (values.urineBlood !== undefined && values.urineBlood !== null) {
        measurements.push({
          type: 'urine_blood',
          value: values.urineBlood,
          recordedAt: values.recordedAt.toISOString(),
          recordedBy: values.recordedBy,
          notes: values.bloodNotes || values.generalNotes,
          attachments
        })
      }

      // Urine Leukocytes
      if (values.urineLeukocytes !== undefined && values.urineLeukocytes !== null) {
        measurements.push({
          type: 'urine_leukocytes',
          value: values.urineLeukocytes,
          recordedAt: values.recordedAt.toISOString(),
          recordedBy: values.recordedBy,
          notes: values.leukocytesNotes || values.generalNotes,
          attachments
        })
      }

      if (measurements.length === 0) {
        message.warning('Please enter at least one urine test result.')
        return
      }

      // Add all measurements
      for (const measurement of measurements) {
        await addMeasurement(patient.id, measurement)
      }
      
      message.success(`${measurements.length} urine test measurement(s) recorded successfully!`)
      handleClose()
      
    } catch (error) {
      message.error('Failed to record urine tests. Please try again.')
      console.error('Error adding urine tests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    form.resetFields()
    setInputTypes({
      protein: 'standard',
      glucose: 'standard',
      ketones: 'standard',
      blood: 'standard',
      leukocytes: 'standard'
    })
    onClose()
  }

  const renderFieldWithToggle = (fieldName, label, unit, icon) => {
    const standards = URINE_STANDARDS[fieldName]
    const inputType = inputTypes[fieldName]
    const fieldKey = `urine${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}`

    return (
      <Card size="small" className="urine-test-card">
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
                    {inputType === 'standard' ? 'Standard Results' : 'Custom Value'}
                  </Text>
                  <br />
                  <Text type="secondary" size="small">
                    {inputType === 'standard' 
                      ? 'Use predefined clinical values' 
                      : 'Enter custom numeric value'
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
              name={fieldKey}
              rules={[{ required: false }]}
              style={{ marginBottom: 0 }}
            >
              {inputType === 'standard' ? (
                <Select
                  placeholder={`Select ${label.toLowerCase()} result`}
                  size="middle"
                  allowClear
                >
                  {standards?.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              ) : (
                <Input
                  placeholder={`Enter ${label.toLowerCase()} value`}
                  suffix={unit}
                  size="middle"
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
          <ExperimentOutlined style={{ color: '#1890ff' }} />
          <span>Record Urine Test</span>
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
          form="urine-test-form"
        >
          {loading ? 'Recording...' : 'Record Urine Test'}
        </Button>
      ]}
      className="urine-test-modal"
    >
      <div className="urine-test-form">
        <Alert
          message="Urine Dipstick Analysis"
          description="Record urine test results from dipstick analysis. All fields are optional - record only available results."
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Form
          id="urine-test-form"
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
            <ExperimentOutlined /> Urine Test Parameters
          </Title>

          <Row gutter={[16, 16]}>
            {/* Protein */}
            <Col xs={24} lg={12}>
              {renderFieldWithToggle('protein', 'Protein', 'mg/dL', <MedicineBoxOutlined style={{ color: '#52c41a' }} />)}
            </Col>

            {/* Glucose */}
            <Col xs={24} lg={12}>
              {renderFieldWithToggle('glucose', 'Glucose', 'mg/dL', <MedicineBoxOutlined style={{ color: '#fa8c16' }} />)}
            </Col>

            {/* Ketones */}
            <Col xs={24} lg={12}>
              {renderFieldWithToggle('ketones', 'Ketones', 'mg/dL', <MedicineBoxOutlined style={{ color: '#722ed1' }} />)}
            </Col>

            {/* Blood */}
            <Col xs={24} lg={12}>
              {renderFieldWithToggle('blood', 'Blood', 'RBC/hpf', <MedicineBoxOutlined style={{ color: '#f5222d' }} />)}
            </Col>

            {/* Leukocytes */}
            <Col xs={24} lg={12}>
              {renderFieldWithToggle('leukocytes', 'Leukocytes', 'WBC/hpf', <MedicineBoxOutlined style={{ color: '#1890ff' }} />)}
            </Col>

            {/* Specific Gravity - Always numeric */}
            <Col xs={24} lg={12}>
              <Card size="small" className="urine-test-card">
                <Row align="middle" gutter={[16, 8]}>
                  <Col span={24}>
                    <Space>
                      <MedicineBoxOutlined style={{ color: '#13c2c2' }} />
                      <Text strong>Specific Gravity</Text>
                    </Space>
                  </Col>
                  <Col span={24}>
                    <Form.Item 
                      name="urineSpecificGravity"
                      rules={[{ 
                        type: 'number', 
                        min: 1.000, 
                        max: 1.040, 
                        message: 'Value should be between 1.000 and 1.040' 
                      }]}
                      style={{ marginBottom: 0 }}
                    >
                      <InputNumber
                        placeholder="e.g., 1.020"
                        step={0.001}
                        min={1.000}
                        max={1.040}
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </Col>

            {/* pH - Always numeric */}
            <Col xs={24} lg={12}>
              <Card size="small" className="urine-test-card">
                <Row align="middle" gutter={[16, 8]}>
                  <Col span={24}>
                    <Space>
                      <MedicineBoxOutlined style={{ color: '#eb2f96' }} />
                      <Text strong>pH Level</Text>
                    </Space>
                  </Col>
                  <Col span={24}>
                    <Form.Item 
                      name="urinePH"
                      rules={[{ 
                        type: 'number', 
                        min: 4.5, 
                        max: 8.5, 
                        message: 'pH should be between 4.5 and 8.5' 
                      }]}
                      style={{ marginBottom: 0 }}
                    >
                      <InputNumber
                        placeholder="e.g., 6.0"
                        step={0.1}
                        min={4.5}
                        max={8.5}
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>

          {/* Dipstick Photo */}
          <Form.Item
            label={
              <Space>
                <CameraOutlined />
                <span>Dipstick Photo</span>
              </Space>
            }
            name="dipstickPhoto"
            help="Take a photo of the urine dipstick for reference"
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
          >
            <TextArea 
              rows={3} 
              placeholder="Enter any additional notes about the urine analysis..."
            />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  )
}

export default UrineTestModal 