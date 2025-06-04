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
  Tabs,
  Divider
} from 'antd'
import { 
  ExperimentOutlined,
  DropboxOutlined,
  HeartOutlined,
  InfoCircleOutlined,
  DashboardOutlined,
  ThunderboltOutlined
} from '@ant-design/icons'
import { usePatients } from '../../../hooks/usePatients'
import dayjs from 'dayjs'
import './BloodTestModal.css'

const { Title, Text } = Typography
const { TextArea } = Input
const { TabPane } = Tabs

const BloodTestModal = ({ visible, onClose, patient }) => {
  const [form] = Form.useForm()
  const { addMeasurement } = usePatients()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('glucose')

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
      
      // Blood Glucose
      if (values.bloodGlucose) {
        measurements.push({
          type: 'blood_glucose',
          value: values.bloodGlucose,
          recordedAt: values.recordedAt.toISOString(),
          recordedBy: values.recordedBy,
          notes: values.glucoseNotes || values.generalNotes
        })
      }

      // Cholesterol Panel
      if (values.totalCholesterol) {
        measurements.push({
          type: 'cholesterol_total',
          value: values.totalCholesterol,
          recordedAt: values.recordedAt.toISOString(),
          recordedBy: values.recordedBy,
          notes: values.cholesterolNotes || values.generalNotes
        })
      }

      if (values.ldlCholesterol) {
        measurements.push({
          type: 'cholesterol_ldl',
          value: values.ldlCholesterol,
          recordedAt: values.recordedAt.toISOString(),
          recordedBy: values.recordedBy,
          notes: values.cholesterolNotes || values.generalNotes
        })
      }

      if (values.hdlCholesterol) {
        measurements.push({
          type: 'cholesterol_hdl',
          value: values.hdlCholesterol,
          recordedAt: values.recordedAt.toISOString(),
          recordedBy: values.recordedBy,
          notes: values.cholesterolNotes || values.generalNotes
        })
      }

      if (values.triglycerides) {
        measurements.push({
          type: 'triglycerides',
          value: values.triglycerides,
          recordedAt: values.recordedAt.toISOString(),
          recordedBy: values.recordedBy,
          notes: values.cholesterolNotes || values.generalNotes
        })
      }

      // Complete Blood Count
      if (values.hemoglobin) {
        measurements.push({
          type: 'hemoglobin',
          value: values.hemoglobin,
          recordedAt: values.recordedAt.toISOString(),
          recordedBy: values.recordedBy,
          notes: values.cbcNotes || values.generalNotes
        })
      }

      if (values.hematocrit) {
        measurements.push({
          type: 'hematocrit',
          value: values.hematocrit,
          recordedAt: values.recordedAt.toISOString(),
          recordedBy: values.recordedBy,
          notes: values.cbcNotes || values.generalNotes
        })
      }

      if (values.wbcCount) {
        measurements.push({
          type: 'white_blood_cell_count',
          value: values.wbcCount,
          recordedAt: values.recordedAt.toISOString(),
          recordedBy: values.recordedBy,
          notes: values.cbcNotes || values.generalNotes
        })
      }

      if (values.rbcCount) {
        measurements.push({
          type: 'red_blood_cell_count',
          value: values.rbcCount,
          recordedAt: values.recordedAt.toISOString(),
          recordedBy: values.recordedBy,
          notes: values.cbcNotes || values.generalNotes
        })
      }

      if (values.plateletCount) {
        measurements.push({
          type: 'platelet_count',
          value: values.plateletCount,
          recordedAt: values.recordedAt.toISOString(),
          recordedBy: values.recordedBy,
          notes: values.cbcNotes || values.generalNotes
        })
      }

      // Add all measurements
      for (const measurement of measurements) {
        await addMeasurement(patient.id, measurement)
      }
      
      message.success(`${measurements.length} blood test measurement(s) recorded successfully!`)
      handleClose()
      
    } catch (error) {
      message.error('Failed to record blood tests. Please try again.')
      console.error('Error adding blood tests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    form.resetFields()
    onClose()
  }

  // Status checking functions
  const getGlucoseStatus = (glucose, fasting = true) => {
    if (!glucose) return null
    if (fasting) {
      if (glucose < 70) return { type: 'warning', message: 'Low blood glucose (hypoglycemia)' }
      if (glucose > 100) return { type: 'warning', message: 'Elevated fasting glucose (prediabetes)' }
      if (glucose >= 126) return { type: 'error', message: 'Diabetic range - consult physician' }
      return { type: 'success', message: 'Normal fasting glucose' }
    } else {
      if (glucose < 70) return { type: 'warning', message: 'Low blood glucose' }
      if (glucose > 140) return { type: 'warning', message: 'Elevated post-meal glucose' }
      if (glucose >= 200) return { type: 'error', message: 'Diabetic range' }
      return { type: 'success', message: 'Normal random glucose' }
    }
  }

  const getCholesterolStatus = (total, ldl, hdl) => {
    const issues = []
    if (total && total >= 240) issues.push('High total cholesterol')
    if (total && total >= 200 && total < 240) issues.push('Borderline high total cholesterol')
    if (ldl && ldl >= 160) issues.push('High LDL cholesterol')
    if (ldl && ldl >= 130 && ldl < 160) issues.push('Borderline high LDL')
    if (hdl && hdl < 40) issues.push('Low HDL cholesterol')
    
    if (issues.length > 0) {
      return { type: 'warning', message: issues.join(', ') }
    }
    
    const goods = []
    if (total && total < 200) goods.push('Good total cholesterol')
    if (ldl && ldl < 100) goods.push('Optimal LDL')
    if (hdl && hdl >= 60) goods.push('Protective HDL')
    
    if (goods.length > 0) {
      return { type: 'success', message: goods.join(', ') }
    }
    
    return null
  }

  const getTriglycerideStatus = (trig) => {
    if (!trig) return null
    if (trig >= 500) return { type: 'error', message: 'Very high triglycerides - risk of pancreatitis' }
    if (trig >= 200) return { type: 'warning', message: 'High triglycerides' }
    if (trig >= 150) return { type: 'warning', message: 'Borderline high triglycerides' }
    return { type: 'success', message: 'Normal triglycerides' }
  }

  const getHemoglobinStatus = (hb, gender = 'unknown') => {
    if (!hb) return null
    // Assuming adult ranges - would need gender info for precise ranges
    if (hb < 12) return { type: 'warning', message: 'Low hemoglobin (anemia)' }
    if (hb > 16) return { type: 'warning', message: 'High hemoglobin' }
    return { type: 'success', message: 'Normal hemoglobin' }
  }

  const getWBCStatus = (wbc) => {
    if (!wbc) return null
    if (wbc < 4500) return { type: 'warning', message: 'Low white blood cell count (leukopenia)' }
    if (wbc > 11000) return { type: 'warning', message: 'High white blood cell count (leukocytosis)' }
    return { type: 'success', message: 'Normal white blood cell count' }
  }

  const getPlateletStatus = (plt) => {
    if (!plt) return null
    if (plt < 150000) return { type: 'warning', message: 'Low platelet count (thrombocytopenia)' }
    if (plt > 450000) return { type: 'warning', message: 'High platelet count (thrombocytosis)' }
    return { type: 'success', message: 'Normal platelet count' }
  }

  return (
    <Modal
      title={
        <Space>
          <ExperimentOutlined style={{ color: '#1890ff' }} />
          <Title level={4} style={{ margin: 0 }}>
            Record Blood Tests
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
          form="blood-test-form"
        >
          {loading ? 'Recording...' : 'Record Blood Tests'}
        </Button>
      ]}
      width={800}
      destroyOnClose
      className="blood-test-modal"
      centered
    >
      <Alert
        message="Blood Test Recording"
        description="Enter blood test results. All fields are optional - record only available test results."
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Form
        id="blood-test-form"
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        size="large"
        className="blood-test-form"
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab} type="card">
          {/* Blood Glucose Tab */}
          <TabPane 
            tab={
              <Space>
                <ThunderboltOutlined />
                <span>Blood Glucose</span>
              </Space>
            } 
            key="glucose"
          >
            <div className="form-section">
              <Row gutter={16}>
                <Col xs={24} sm={16}>
                  <Form.Item
                    name="bloodGlucose"
                    label={
                      <Space>
                        <span>Blood Glucose (mg/dL)</span>
                        <Tooltip title="Fasting: 70-100 mg/dL Normal | Random: <140 mg/dL Normal">
                          <InfoCircleOutlined />
                        </Tooltip>
                      </Space>
                    }
                    rules={[
                      { type: 'number', min: 30, max: 600, message: 'Please enter a valid glucose level (30-600 mg/dL)' }
                    ]}
                  >
                    <InputNumber
                      placeholder="95"
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
                
                <Col xs={24} sm={8}>
                  <Form.Item name="glucoseNotes" label="Glucose Notes">
                    <Input placeholder="Fasting, random, post-meal" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.bloodGlucose !== currentValues.bloodGlucose}>
                {({ getFieldValue }) => {
                  const glucoseStatus = getGlucoseStatus(getFieldValue('bloodGlucose'))
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
            </div>
          </TabPane>

          {/* Lipid Panel Tab */}
          <TabPane 
            tab={
              <Space>
                <DropboxOutlined />
                <span>Lipid Panel</span>
              </Space>
            } 
            key="lipid"
          >
            <div className="form-section">
              <Title level={5}>Cholesterol Panel</Title>
              
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="totalCholesterol"
                    label={
                      <Space>
                        <span>Total Cholesterol (mg/dL)</span>
                        <Tooltip title="Desirable: <200 mg/dL">
                          <InfoCircleOutlined />
                        </Tooltip>
                      </Space>
                    }
                    rules={[
                      { type: 'number', min: 100, max: 500, message: 'Please enter a valid cholesterol level (100-500 mg/dL)' }
                    ]}
                  >
                    <InputNumber
                      placeholder="190"
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
                
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="ldlCholesterol"
                    label={
                      <Space>
                        <span>LDL Cholesterol (mg/dL)</span>
                        <Tooltip title="Optimal: <100 mg/dL">
                          <InfoCircleOutlined />
                        </Tooltip>
                      </Space>
                    }
                    rules={[
                      { type: 'number', min: 50, max: 400, message: 'Please enter a valid LDL level (50-400 mg/dL)' }
                    ]}
                  >
                    <InputNumber
                      placeholder="110"
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="hdlCholesterol"
                    label={
                      <Space>
                        <span>HDL Cholesterol (mg/dL)</span>
                        <Tooltip title="Good: ≥40 mg/dL (men), ≥50 mg/dL (women)">
                          <InfoCircleOutlined />
                        </Tooltip>
                      </Space>
                    }
                    rules={[
                      { type: 'number', min: 20, max: 150, message: 'Please enter a valid HDL level (20-150 mg/dL)' }
                    ]}
                  >
                    <InputNumber
                      placeholder="45"
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
                
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="triglycerides"
                    label={
                      <Space>
                        <span>Triglycerides (mg/dL)</span>
                        <Tooltip title="Normal: <150 mg/dL">
                          <InfoCircleOutlined />
                        </Tooltip>
                      </Space>
                    }
                    rules={[
                      { type: 'number', min: 30, max: 1000, message: 'Please enter a valid triglyceride level (30-1000 mg/dL)' }
                    ]}
                  >
                    <InputNumber
                      placeholder="130"
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="cholesterolNotes" label="Lipid Panel Notes">
                <Input placeholder="Fasting status, medications affecting results" />
              </Form.Item>

              <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => 
                prevValues.totalCholesterol !== currentValues.totalCholesterol ||
                prevValues.ldlCholesterol !== currentValues.ldlCholesterol ||
                prevValues.hdlCholesterol !== currentValues.hdlCholesterol
              }>
                {({ getFieldValue }) => {
                  const cholesterolStatus = getCholesterolStatus(
                    getFieldValue('totalCholesterol'),
                    getFieldValue('ldlCholesterol'),
                    getFieldValue('hdlCholesterol')
                  )
                  return cholesterolStatus ? (
                    <Alert
                      message={cholesterolStatus.message}
                      type={cholesterolStatus.type}
                      size="small"
                      style={{ marginBottom: 16 }}
                    />
                  ) : null
                }}
              </Form.Item>

              <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.triglycerides !== currentValues.triglycerides}>
                {({ getFieldValue }) => {
                  const trigStatus = getTriglycerideStatus(getFieldValue('triglycerides'))
                  return trigStatus ? (
                    <Alert
                      message={trigStatus.message}
                      type={trigStatus.type}
                      size="small"
                      style={{ marginBottom: 16 }}
                    />
                  ) : null
                }}
              </Form.Item>
            </div>
          </TabPane>

          {/* Complete Blood Count Tab */}
          <TabPane 
            tab={
              <Space>
                <HeartOutlined />
                <span>Blood Count (CBC)</span>
              </Space>
            } 
            key="cbc"
          >
            <div className="form-section">
              <Title level={5}>Complete Blood Count</Title>
              
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="hemoglobin"
                    label={
                      <Space>
                        <span>Hemoglobin (g/dL)</span>
                        <Tooltip title="Normal: 12-16 g/dL (women), 14-18 g/dL (men)">
                          <InfoCircleOutlined />
                        </Tooltip>
                      </Space>
                    }
                    rules={[
                      { type: 'number', min: 6, max: 25, message: 'Please enter a valid hemoglobin level (6-25 g/dL)' }
                    ]}
                  >
                    <InputNumber
                      placeholder="14.0"
                      step={0.1}
                      precision={1}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
                
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="hematocrit"
                    label={
                      <Space>
                        <span>Hematocrit (%)</span>
                        <Tooltip title="Normal: 36-47% (women), 42-52% (men)">
                          <InfoCircleOutlined />
                        </Tooltip>
                      </Space>
                    }
                    rules={[
                      { type: 'number', min: 15, max: 70, message: 'Please enter a valid hematocrit (15-70%)' }
                    ]}
                  >
                    <InputNumber
                      placeholder="42"
                      step={0.1}
                      precision={1}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} sm={8}>
                  <Form.Item
                    name="wbcCount"
                    label={
                      <Space>
                        <span>WBC Count (/μL)</span>
                        <Tooltip title="Normal: 4,500-11,000 /μL">
                          <InfoCircleOutlined />
                        </Tooltip>
                      </Space>
                    }
                    rules={[
                      { type: 'number', min: 1000, max: 50000, message: 'Please enter a valid WBC count (1,000-50,000 /μL)' }
                    ]}
                  >
                    <InputNumber
                      placeholder="7500"
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
                
                <Col xs={24} sm={8}>
                  <Form.Item
                    name="rbcCount"
                    label={
                      <Space>
                        <span>RBC Count (M/μL)</span>
                        <Tooltip title="Normal: 4.0-5.9 million/μL">
                          <InfoCircleOutlined />
                        </Tooltip>
                      </Space>
                    }
                    rules={[
                      { type: 'number', min: 2, max: 8, message: 'Please enter a valid RBC count (2-8 M/μL)' }
                    ]}
                  >
                    <InputNumber
                      placeholder="4.5"
                      step={0.1}
                      precision={1}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
                
                <Col xs={24} sm={8}>
                  <Form.Item
                    name="plateletCount"
                    label={
                      <Space>
                        <span>Platelet Count (/μL)</span>
                        <Tooltip title="Normal: 150,000-450,000 /μL">
                          <InfoCircleOutlined />
                        </Tooltip>
                      </Space>
                    }
                    rules={[
                      { type: 'number', min: 50000, max: 1000000, message: 'Please enter a valid platelet count (50,000-1,000,000 /μL)' }
                    ]}
                  >
                    <InputNumber
                      placeholder="300000"
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="cbcNotes" label="CBC Notes">
                <Input placeholder="Additional CBC details, differential results" />
              </Form.Item>

              <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.hemoglobin !== currentValues.hemoglobin}>
                {({ getFieldValue }) => {
                  const hbStatus = getHemoglobinStatus(getFieldValue('hemoglobin'))
                  return hbStatus ? (
                    <Alert
                      message={hbStatus.message}
                      type={hbStatus.type}
                      size="small"
                      style={{ marginBottom: 16 }}
                    />
                  ) : null
                }}
              </Form.Item>

              <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.wbcCount !== currentValues.wbcCount}>
                {({ getFieldValue }) => {
                  const wbcStatus = getWBCStatus(getFieldValue('wbcCount'))
                  return wbcStatus ? (
                    <Alert
                      message={wbcStatus.message}
                      type={wbcStatus.type}
                      size="small"
                      style={{ marginBottom: 16 }}
                    />
                  ) : null
                }}
              </Form.Item>

              <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.plateletCount !== currentValues.plateletCount}>
                {({ getFieldValue }) => {
                  const pltStatus = getPlateletStatus(getFieldValue('plateletCount'))
                  return pltStatus ? (
                    <Alert
                      message={pltStatus.message}
                      type={pltStatus.type}
                      size="small"
                      style={{ marginBottom: 16 }}
                    />
                  ) : null
                }}
              </Form.Item>
            </div>
          </TabPane>
        </Tabs>

        {/* General Information */}
        <Divider />
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
              placeholder="Laboratory, fasting status, any medication effects..."
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

export default BloodTestModal 