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
  Card
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

const VitalSignsModal = ({ visible, onClose, patient }) => {
  const [form] = Form.useForm()
  const { addMeasurement } = usePatients()
  const [loading, setLoading] = useState(false)
  const [bloodPressureMode, setBloodPressureMode] = useState('separate') // 'separate' or 'combined'

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

  return (
    <Modal
      title={
        <Space>
          <HeartOutlined style={{ color: '#ff4d4f' }} />
          <Title level={4} style={{ margin: 0 }}>
            Record Vital Signs
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
          form="vital-signs-form"
        >
          {loading ? 'Recording...' : 'Record Vital Signs'}
        </Button>
      ]}
      width={800}
      destroyOnClose
      className="vital-signs-modal"
      centered
    >
      <Alert
        message="Vital Signs Recording"
        description="Enter the vital signs measurements. All fields are optional - record only what's available."
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Form
        id="vital-signs-form"
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        size="large"
        className="vital-signs-form"
      >
        {/* Temperature Section */}
        <div className="form-section">
          <Title level={5}>
            <ThunderboltOutlined style={{ color: '#fa8c16', marginRight: 8 }} />
            Body Temperature
          </Title>
          
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="temperature"
                label={
                  <Space>
                    <span>Temperature (°C)</span>
                    <Tooltip title="Normal range: 36.1-37.2°C">
                      <InfoCircleOutlined />
                    </Tooltip>
                  </Space>
                }
                rules={[
                  { type: 'number', min: 30, max: 45, message: 'Please enter a valid temperature (30-45°C)' }
                ]}
              >
                <InputNumber
                  placeholder="36.5"
                  step={0.1}
                  precision={1}
                  style={{ width: '100%' }}
                  onChange={(value) => {
                    const status = getTemperatureStatus(value)
                    // You could show status here if needed
                  }}
                />
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={12}>
              <Form.Item name="temperatureNotes" label="Temperature Notes">
                <Input placeholder="Method (oral, rectal, axillary), location" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.temperature !== currentValues.temperature}>
            {({ getFieldValue }) => {
              const tempStatus = getTemperatureStatus(getFieldValue('temperature'))
              return tempStatus ? (
                <Alert
                  message={tempStatus.message}
                  type={tempStatus.type}
                  size="small"
                  style={{ marginBottom: 16 }}
                />
              ) : null
            }}
          </Form.Item>
        </div>

        {/* Blood Pressure Section */}
        <div className="form-section">
          <Title level={5}>
            <HeartOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
            Blood Pressure
          </Title>
          
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item
                name="systolic"
                label={
                  <Space>
                    <span>Systolic (mmHg)</span>
                    <Tooltip title="Normal range: 90-120 mmHg">
                      <InfoCircleOutlined />
                    </Tooltip>
                  </Space>
                }
                rules={[
                  { type: 'number', min: 50, max: 250, message: 'Please enter a valid systolic pressure (50-250 mmHg)' }
                ]}
              >
                <InputNumber
                  placeholder="120"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={8}>
              <Form.Item
                name="diastolic"
                label={
                  <Space>
                    <span>Diastolic (mmHg)</span>
                    <Tooltip title="Normal range: 60-80 mmHg">
                      <InfoCircleOutlined />
                    </Tooltip>
                  </Space>
                }
                rules={[
                  { type: 'number', min: 30, max: 150, message: 'Please enter a valid diastolic pressure (30-150 mmHg)' }
                ]}
              >
                <InputNumber
                  placeholder="80"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={8}>
              <Form.Item name="bloodPressureNotes" label="BP Notes">
                <Input placeholder="Position, cuff size, arm used" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => 
            prevValues.systolic !== currentValues.systolic || prevValues.diastolic !== currentValues.diastolic
          }>
            {({ getFieldValue }) => {
              const bpStatus = getBloodPressureStatus(getFieldValue('systolic'), getFieldValue('diastolic'))
              return bpStatus ? (
                <Alert
                  message={bpStatus.message}
                  type={bpStatus.type}
                  size="small"
                  style={{ marginBottom: 16 }}
                />
              ) : null
            }}
          </Form.Item>
        </div>

        {/* Heart Rate Section */}
        <div className="form-section">
          <Title level={5}>
            <HeartOutlined style={{ color: '#52c41a', marginRight: 8 }} />
            Heart Rate
          </Title>
          
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="heartRate"
                label={
                  <Space>
                    <span>Heart Rate (bpm)</span>
                    <Tooltip title="Normal range: 60-100 bpm">
                      <InfoCircleOutlined />
                    </Tooltip>
                  </Space>
                }
                rules={[
                  { type: 'number', min: 30, max: 200, message: 'Please enter a valid heart rate (30-200 bpm)' }
                ]}
              >
                <InputNumber
                  placeholder="72"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={12}>
              <Form.Item name="heartRateNotes" label="Heart Rate Notes">
                <Input placeholder="Method (pulse, monitor), rhythm" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.heartRate !== currentValues.heartRate}>
            {({ getFieldValue }) => {
              const hrStatus = getHeartRateStatus(getFieldValue('heartRate'))
              return hrStatus ? (
                <Alert
                  message={hrStatus.message}
                  type={hrStatus.type}
                  size="small"
                  style={{ marginBottom: 16 }}
                />
              ) : null
            }}
          </Form.Item>
        </div>

        {/* Respiratory Rate Section */}
        <div className="form-section">
          <Title level={5}>
            <EyeOutlined style={{ color: '#73d13d', marginRight: 8 }} />
            Respiratory Rate
          </Title>
          
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="respiratoryRate"
                label={
                  <Space>
                    <span>Respiratory Rate (/min)</span>
                    <Tooltip title="Normal range: 12-20 breaths per minute">
                      <InfoCircleOutlined />
                    </Tooltip>
                  </Space>
                }
                rules={[
                  { type: 'number', min: 5, max: 60, message: 'Please enter a valid respiratory rate (5-60 /min)' }
                ]}
              >
                <InputNumber
                  placeholder="16"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={12}>
              <Form.Item name="respiratoryNotes" label="Respiratory Notes">
                <Input placeholder="Depth, effort, rhythm" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.respiratoryRate !== currentValues.respiratoryRate}>
            {({ getFieldValue }) => {
              const rrStatus = getRespiratoryStatus(getFieldValue('respiratoryRate'))
              return rrStatus ? (
                <Alert
                  message={rrStatus.message}
                  type={rrStatus.type}
                  size="small"
                  style={{ marginBottom: 16 }}
                />
              ) : null
            }}
          </Form.Item>
        </div>

        {/* Oxygen Saturation Section */}
        <div className="form-section">
          <Title level={5}>
            <DashboardOutlined style={{ color: '#13c2c2', marginRight: 8 }} />
            Oxygen Saturation
          </Title>
          
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="oxygenSaturation"
                label={
                  <Space>
                    <span>Oxygen Saturation (%)</span>
                    <Tooltip title="Normal range: 95-100%">
                      <InfoCircleOutlined />
                    </Tooltip>
                  </Space>
                }
                rules={[
                  { type: 'number', min: 70, max: 100, message: 'Please enter a valid oxygen saturation (70-100%)' }
                ]}
              >
                <InputNumber
                  placeholder="98"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={12}>
              <Form.Item name="oxygenNotes" label="Oxygen Notes">
                <Input placeholder="Room air, supplemental O2" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.oxygenSaturation !== currentValues.oxygenSaturation}>
            {({ getFieldValue }) => {
              const o2Status = getOxygenStatus(getFieldValue('oxygenSaturation'))
              return o2Status ? (
                <Alert
                  message={o2Status.message}
                  type={o2Status.type}
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
              placeholder="Any additional observations about the patient's condition..."
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

export default VitalSignsModal 