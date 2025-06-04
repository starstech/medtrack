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
  Tag
} from 'antd'
import { 
  ExperimentOutlined,
  DropboxOutlined,
  InfoCircleOutlined,
  MedicineBoxOutlined
} from '@ant-design/icons'
import { usePatients } from '../../../hooks/usePatients'
import dayjs from 'dayjs'
import './UrineTestModal.css'

const { Title, Text } = Typography
const { TextArea } = Input
const { Option } = Select

const UrineTestModal = ({ visible, onClose, patient }) => {
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
      
      // Urine Protein
      if (values.urineProtein !== undefined && values.urineProtein !== null) {
        measurements.push({
          type: 'urine_protein',
          value: values.urineProtein,
          recordedAt: values.recordedAt.toISOString(),
          recordedBy: values.recordedBy,
          notes: values.proteinNotes || values.generalNotes
        })
      }

      // Urine Glucose
      if (values.urineGlucose !== undefined && values.urineGlucose !== null) {
        measurements.push({
          type: 'urine_glucose',
          value: values.urineGlucose,
          recordedAt: values.recordedAt.toISOString(),
          recordedBy: values.recordedBy,
          notes: values.glucoseNotes || values.generalNotes
        })
      }

      // Urine Ketones
      if (values.urineKetones !== undefined && values.urineKetones !== null) {
        measurements.push({
          type: 'urine_ketones',
          value: values.urineKetones,
          recordedAt: values.recordedAt.toISOString(),
          recordedBy: values.recordedBy,
          notes: values.ketonesNotes || values.generalNotes
        })
      }

      // Urine Specific Gravity
      if (values.urineSpecificGravity !== undefined && values.urineSpecificGravity !== null) {
        measurements.push({
          type: 'urine_specific_gravity',
          value: values.urineSpecificGravity,
          recordedAt: values.recordedAt.toISOString(),
          recordedBy: values.recordedBy,
          notes: values.specificGravityNotes || values.generalNotes
        })
      }

      // Urine pH
      if (values.urinePH !== undefined && values.urinePH !== null) {
        measurements.push({
          type: 'urine_ph',
          value: values.urinePH,
          recordedAt: values.recordedAt.toISOString(),
          recordedBy: values.recordedBy,
          notes: values.phNotes || values.generalNotes
        })
      }

      // Urine Blood
      if (values.urineBlood !== undefined && values.urineBlood !== null) {
        measurements.push({
          type: 'urine_blood',
          value: values.urineBlood,
          recordedAt: values.recordedAt.toISOString(),
          recordedBy: values.recordedBy,
          notes: values.bloodNotes || values.generalNotes
        })
      }

      // Urine Leukocytes
      if (values.urineLeukocytes !== undefined && values.urineLeukocytes !== null) {
        measurements.push({
          type: 'urine_leukocytes',
          value: values.urineLeukocytes,
          recordedAt: values.recordedAt.toISOString(),
          recordedBy: values.recordedBy,
          notes: values.leukocytesNotes || values.generalNotes
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
    onClose()
  }

  // Status checking functions for urine tests
  const getProteinStatus = (protein) => {
    if (protein === undefined || protein === null) return null
    if (typeof protein === 'string') {
      // Handle qualitative results
      const lowerProtein = protein.toLowerCase()
      if (lowerProtein.includes('negative') || lowerProtein.includes('trace')) {
        return { type: 'success', message: 'Normal protein levels' }
      }
      if (lowerProtein.includes('+1') || lowerProtein.includes('mild')) {
        return { type: 'warning', message: 'Mild proteinuria - follow up recommended' }
      }
      if (lowerProtein.includes('+2') || lowerProtein.includes('+3')) {
        return { type: 'error', message: 'Significant proteinuria - medical evaluation needed' }
      }
    }
    // Handle quantitative results
    if (protein < 20) return { type: 'success', message: 'Normal protein levels' }
    if (protein < 150) return { type: 'warning', message: 'Mild proteinuria' }
    return { type: 'error', message: 'Significant proteinuria' }
  }

  const getGlucoseStatus = (glucose) => {
    if (glucose === undefined || glucose === null) return null
    if (typeof glucose === 'string') {
      const lowerGlucose = glucose.toLowerCase()
      if (lowerGlucose.includes('negative')) {
        return { type: 'success', message: 'No glucose detected - normal' }
      }
      if (lowerGlucose.includes('+')) {
        return { type: 'warning', message: 'Glucose detected - check blood sugar' }
      }
    }
    if (glucose === 0) return { type: 'success', message: 'No glucose detected' }
    return { type: 'warning', message: 'Glucose present - diabetes screening recommended' }
  }

  const getKetonesStatus = (ketones) => {
    if (ketones === undefined || ketones === null) return null
    if (typeof ketones === 'string') {
      const lowerKetones = ketones.toLowerCase()
      if (lowerKetones.includes('negative')) {
        return { type: 'success', message: 'No ketones detected - normal' }
      }
      if (lowerKetones.includes('+')) {
        return { type: 'warning', message: 'Ketones detected - check for diabetic ketoacidosis' }
      }
    }
    if (ketones === 0) return { type: 'success', message: 'No ketones detected' }
    return { type: 'warning', message: 'Ketones present - medical evaluation needed' }
  }

  const getpHStatus = (ph) => {
    if (ph === undefined || ph === null) return null
    if (ph < 5.0) return { type: 'warning', message: 'Very acidic urine' }
    if (ph > 8.0) return { type: 'warning', message: 'Very alkaline urine' }
    return { type: 'success', message: 'Normal pH range' }
  }

  const getBloodStatus = (blood) => {
    if (blood === undefined || blood === null) return null
    if (typeof blood === 'string') {
      const lowerBlood = blood.toLowerCase()
      if (lowerBlood.includes('negative')) {
        return { type: 'success', message: 'No blood detected - normal' }
      }
      if (lowerBlood.includes('+')) {
        return { type: 'warning', message: 'Blood detected - investigate cause' }
      }
    }
    if (blood === 0) return { type: 'success', message: 'No blood detected' }
    return { type: 'warning', message: 'Blood present - urological evaluation may be needed' }
  }

  return (
    <Modal
      title={
        <Space>
          <ExperimentOutlined style={{ color: '#fa8c16' }} />
          <Title level={4} style={{ margin: 0 }}>
            Record Urine Dipstick Analysis
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
          form="urine-test-form"
        >
          {loading ? 'Recording...' : 'Record Urine Tests'}
        </Button>
      ]}
      width={800}
      destroyOnClose
      className="urine-test-modal"
      centered
    >
      <Alert
        message="Urine Dipstick Analysis"
        description="Enter urine test results from dipstick analysis. You can use qualitative results (negative, +1, +2, +3) or quantitative values."
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Form
        id="urine-test-form"
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        size="large"
        className="urine-test-form"
      >
        {/* Protein Section */}
        <div className="form-section">
          <Title level={5}>
            <MedicineBoxOutlined style={{ color: '#1890ff', marginRight: 8 }} />
            Protein Analysis
          </Title>
          
          <Row gutter={16}>
            <Col xs={24} sm={16}>
              <Form.Item
                name="urineProtein"
                label={
                  <Space>
                    <span>Protein (mg/dL or qualitative)</span>
                    <Tooltip title="Normal: <20 mg/dL or Negative/Trace">
                      <InfoCircleOutlined />
                    </Tooltip>
                  </Space>
                }
              >
                <Input
                  placeholder="Negative, +1, +2, +3 or numeric value"
                />
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={8}>
              <Form.Item name="proteinNotes" label="Protein Notes">
                <Input placeholder="Method, appearance" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.urineProtein !== currentValues.urineProtein}>
            {({ getFieldValue }) => {
              const proteinStatus = getProteinStatus(getFieldValue('urineProtein'))
              return proteinStatus ? (
                <Alert
                  message={proteinStatus.message}
                  type={proteinStatus.type}
                  size="small"
                  style={{ marginBottom: 16 }}
                />
              ) : null
            }}
          </Form.Item>
        </div>

        {/* Glucose Section */}
        <div className="form-section">
          <Title level={5}>
            <DropboxOutlined style={{ color: '#52c41a', marginRight: 8 }} />
            Glucose & Ketones
          </Title>
          
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="urineGlucose"
                label={
                  <Space>
                    <span>Glucose</span>
                    <Tooltip title="Normal: Negative">
                      <InfoCircleOutlined />
                    </Tooltip>
                  </Space>
                }
              >
                <Input
                  placeholder="Negative, +1, +2, +3"
                />
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={12}>
              <Form.Item
                name="urineKetones"
                label={
                  <Space>
                    <span>Ketones</span>
                    <Tooltip title="Normal: Negative">
                      <InfoCircleOutlined />
                    </Tooltip>
                  </Space>
                }
              >
                <Input
                  placeholder="Negative, +1, +2, +3"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => 
            prevValues.urineGlucose !== currentValues.urineGlucose
          }>
            {({ getFieldValue }) => {
              const glucoseStatus = getGlucoseStatus(getFieldValue('urineGlucose'))
              return glucoseStatus ? (
                <Alert
                  message={glucoseStatus.message}
                  type={glucoseStatus.type}
                  size="small"
                  style={{ marginBottom: 16 }}
                />
              ) : null
            }}
          </Form.Item>

          <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => 
            prevValues.urineKetones !== currentValues.urineKetones
          }>
            {({ getFieldValue }) => {
              const ketonesStatus = getKetonesStatus(getFieldValue('urineKetones'))
              return ketonesStatus ? (
                <Alert
                  message={ketonesStatus.message}
                  type={ketonesStatus.type}
                  size="small"
                  style={{ marginBottom: 16 }}
                />
              ) : null
            }}
          </Form.Item>
        </div>

        {/* Physical Properties */}
        <div className="form-section">
          <Title level={5}>Physical Properties</Title>
          
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="urineSpecificGravity"
                label={
                  <Space>
                    <span>Specific Gravity</span>
                    <Tooltip title="Normal: 1.003-1.030">
                      <InfoCircleOutlined />
                    </Tooltip>
                  </Space>
                }
              >
                <InputNumber
                  placeholder="1.020"
                  step={0.001}
                  precision={3}
                  min={1.000}
                  max={1.050}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={12}>
              <Form.Item
                name="urinePH"
                label={
                  <Space>
                    <span>pH</span>
                    <Tooltip title="Normal: 5.0-8.0">
                      <InfoCircleOutlined />
                    </Tooltip>
                  </Space>
                }
              >
                <InputNumber
                  placeholder="6.0"
                  step={0.1}
                  precision={1}
                  min={4.0}
                  max={9.0}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => 
            prevValues.urinePH !== currentValues.urinePH
          }>
            {({ getFieldValue }) => {
              const phStatus = getpHStatus(getFieldValue('urinePH'))
              return phStatus ? (
                <Alert
                  message={phStatus.message}
                  type={phStatus.type}
                  size="small"
                  style={{ marginBottom: 16 }}
                />
              ) : null
            }}
          </Form.Item>
        </div>

        {/* Microscopic Analysis */}
        <div className="form-section">
          <Title level={5}>Microscopic Analysis</Title>
          
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="urineBlood"
                label={
                  <Space>
                    <span>Blood (RBC/hpf)</span>
                    <Tooltip title="Normal: Negative or <3 RBC/hpf">
                      <InfoCircleOutlined />
                    </Tooltip>
                  </Space>
                }
              >
                <Input
                  placeholder="Negative, +1, +2, +3 or numeric"
                />
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={12}>
              <Form.Item
                name="urineLeukocytes"
                label={
                  <Space>
                    <span>Leukocytes (WBC/hpf)</span>
                    <Tooltip title="Normal: <5 WBC/hpf">
                      <InfoCircleOutlined />
                    </Tooltip>
                  </Space>
                }
              >
                <Input
                  placeholder="Negative, +1, +2, +3 or numeric"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => 
            prevValues.urineBlood !== currentValues.urineBlood
          }>
            {({ getFieldValue }) => {
              const bloodStatus = getBloodStatus(getFieldValue('urineBlood'))
              return bloodStatus ? (
                <Alert
                  message={bloodStatus.message}
                  type={bloodStatus.type}
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
              placeholder="Collection method, appearance, laboratory details..."
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

export default UrineTestModal 