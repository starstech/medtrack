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
  Divider,
  Switch,
  Select,
  Card
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
const { Option } = Select

// Predefined clinical values for blood tests
const BLOOD_STANDARDS = {
  bloodGlucose: [
    { value: '70', label: '70 mg/dL (Normal fasting)' },
    { value: '80', label: '80 mg/dL (Normal fasting)' },
    { value: '90', label: '90 mg/dL (Normal fasting)' },
    { value: '100', label: '100 mg/dL (Normal fasting)' },
    { value: '110', label: '110 mg/dL (Elevated)' },
    { value: '126', label: '126 mg/dL (Diabetes threshold)' },
    { value: '140', label: '140 mg/dL (Post-meal normal)' },
    { value: '200', label: '200 mg/dL (Diabetes)' }
  ],
  totalCholesterol: [
    { value: '150', label: '150 mg/dL (Optimal)' },
    { value: '180', label: '180 mg/dL (Desirable)' },
    { value: '200', label: '200 mg/dL (Borderline)' },
    { value: '220', label: '220 mg/dL (Borderline high)' },
    { value: '240', label: '240 mg/dL (High)' },
    { value: '260', label: '260 mg/dL (High)' }
  ],
  ldlCholesterol: [
    { value: '70', label: '70 mg/dL (Optimal)' },
    { value: '100', label: '100 mg/dL (Near optimal)' },
    { value: '130', label: '130 mg/dL (Borderline)' },
    { value: '160', label: '160 mg/dL (High)' },
    { value: '190', label: '190 mg/dL (Very high)' }
  ],
  hdlCholesterol: [
    { value: '35', label: '35 mg/dL (Low)' },
    { value: '40', label: '40 mg/dL (Low normal)' },
    { value: '50', label: '50 mg/dL (Normal)' },
    { value: '60', label: '60 mg/dL (High - protective)' },
    { value: '70', label: '70 mg/dL (High - protective)' }
  ],
  triglycerides: [
    { value: '100', label: '100 mg/dL (Normal)' },
    { value: '150', label: '150 mg/dL (Borderline)' },
    { value: '200', label: '200 mg/dL (High)' },
    { value: '250', label: '250 mg/dL (High)' },
    { value: '500', label: '500 mg/dL (Very high)' }
  ],
  hemoglobin: [
    { value: '12.0', label: '12.0 g/dL (Female low)' },
    { value: '13.5', label: '13.5 g/dL (Female normal)' },
    { value: '14.0', label: '14.0 g/dL (Male low)' },
    { value: '15.0', label: '15.0 g/dL (Normal)' },
    { value: '16.0', label: '16.0 g/dL (Normal)' },
    { value: '17.0', label: '17.0 g/dL (Male high)' }
  ],
  hematocrit: [
    { value: '36', label: '36% (Female low)' },
    { value: '40', label: '40% (Female normal)' },
    { value: '42', label: '42% (Male low)' },
    { value: '45', label: '45% (Normal)' },
    { value: '48', label: '48% (Normal)' },
    { value: '52', label: '52% (Male high)' }
  ],
  wbcCount: [
    { value: '4000', label: '4,000 /μL (Low normal)' },
    { value: '6000', label: '6,000 /μL (Normal)' },
    { value: '8000', label: '8,000 /μL (Normal)' },
    { value: '10000', label: '10,000 /μL (High normal)' },
    { value: '12000', label: '12,000 /μL (Elevated)' }
  ],
  rbcCount: [
    { value: '4.2', label: '4.2 M/μL (Female normal)' },
    { value: '4.5', label: '4.5 M/μL (Normal)' },
    { value: '5.0', label: '5.0 M/μL (Male normal)' },
    { value: '5.5', label: '5.5 M/μL (High)' }
  ],
  plateletCount: [
    { value: '150000', label: '150,000 /μL (Low normal)' },
    { value: '250000', label: '250,000 /μL (Normal)' },
    { value: '350000', label: '350,000 /μL (Normal)' },
    { value: '450000', label: '450,000 /μL (High)' }
  ]
}

const BloodTestModal = ({ visible, onClose, patient }) => {
  const [form] = Form.useForm()
  const { addMeasurement } = usePatients()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('glucose')
  
  // State for input types (standard vs custom)
  const [inputTypes, setInputTypes] = useState({
    bloodGlucose: 'standard',
    totalCholesterol: 'standard',
    ldlCholesterol: 'standard',
    hdlCholesterol: 'standard',
    triglycerides: 'standard',
    hemoglobin: 'standard',
    hematocrit: 'standard',
    wbcCount: 'standard',
    rbcCount: 'standard',
    plateletCount: 'standard'
  })

  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        recordedAt: dayjs(),
        recordedBy: 'Current User'
      })
      // Reset input types when modal opens
      setInputTypes({
        bloodGlucose: 'standard',
        totalCholesterol: 'standard',
        ldlCholesterol: 'standard',
        hdlCholesterol: 'standard',
        triglycerides: 'standard',
        hemoglobin: 'standard',
        hematocrit: 'standard',
        wbcCount: 'standard',
        rbcCount: 'standard',
        plateletCount: 'standard'
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
    setInputTypes({
      bloodGlucose: 'standard',
      totalCholesterol: 'standard',
      ldlCholesterol: 'standard',
      hdlCholesterol: 'standard',
      triglycerides: 'standard',
      hemoglobin: 'standard',
      hematocrit: 'standard',
      wbcCount: 'standard',
      rbcCount: 'standard',
      plateletCount: 'standard'
    })
    onClose()
  }

  const renderFieldWithToggle = (fieldName, label, unit, icon, placeholder) => {
    const standards = BLOOD_STANDARDS[fieldName]
    const inputType = inputTypes[fieldName]

    return (
      <Card size="small" className="blood-test-card">
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
                    {inputType === 'standard' ? 'Clinical Ranges' : 'Custom Value'}
                  </Text>
                  <br />
                  <Text type="secondary" size="small">
                    {inputType === 'standard' 
                      ? 'Select from typical lab values' 
                      : 'Enter exact lab result'
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
                  placeholder={`Select ${label.toLowerCase()} value`}
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
                  step={fieldName.includes('Count') ? 1000 : (fieldName === 'rbcCount' ? 0.1 : 1)}
                />
              )}
            </Form.Item>
          </Col>
        </Row>
      </Card>
    )
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
          <span>Record Blood Tests</span>
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
          form="blood-test-form"
        >
          {loading ? 'Recording...' : 'Record Blood Tests'}
        </Button>
      ]}
      className="blood-test-modal"
    >
      <div className="blood-test-form">
        <Alert
          message="Blood Test Results"
          description="Record blood test results from laboratory analysis. All fields are optional - record only available results."
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Form
          id="blood-test-form"
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

          {/* Glucose Section */}
          <div className="form-section">
            <Title level={5}>
              <DropboxOutlined style={{ color: '#fa8c16', marginRight: 8 }} />
              Glucose Levels
            </Title>
            
            <Row gutter={[16, 16]}>
              <Col xs={24}>
                {renderFieldWithToggle('bloodGlucose', 'Blood Glucose', 'mg/dL', <DropboxOutlined style={{ color: '#fa8c16' }} />, '90')}
              </Col>
            </Row>
          </div>

          {/* Cholesterol Section */}
          <div className="form-section">
            <Title level={5}>
              <HeartOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
              Cholesterol Panel
            </Title>
            
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={12}>
                {renderFieldWithToggle('totalCholesterol', 'Total Cholesterol', 'mg/dL', <HeartOutlined style={{ color: '#ff4d4f' }} />, '200')}
              </Col>
              
              <Col xs={24} lg={12}>
                {renderFieldWithToggle('ldlCholesterol', 'LDL Cholesterol', 'mg/dL', <InfoCircleOutlined style={{ color: '#f5222d' }} />, '100')}
              </Col>
              
              <Col xs={24} lg={12}>
                {renderFieldWithToggle('hdlCholesterol', 'HDL Cholesterol', 'mg/dL', <InfoCircleOutlined style={{ color: '#52c41a' }} />, '50')}
              </Col>
              
              <Col xs={24} lg={12}>
                {renderFieldWithToggle('triglycerides', 'Triglycerides', 'mg/dL', <DashboardOutlined style={{ color: '#722ed1' }} />, '150')}
              </Col>
            </Row>
          </div>

          {/* Complete Blood Count Section */}
          <div className="form-section">
            <Title level={5}>
              <ThunderboltOutlined style={{ color: '#13c2c2', marginRight: 8 }} />
              Complete Blood Count (CBC)
            </Title>
            
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={12}>
                {renderFieldWithToggle('hemoglobin', 'Hemoglobin', 'g/dL', <ThunderboltOutlined style={{ color: '#13c2c2' }} />, '14')}
              </Col>
              
              <Col xs={24} lg={12}>
                {renderFieldWithToggle('hematocrit', 'Hematocrit', '%', <ThunderboltOutlined style={{ color: '#1890ff' }} />, '42')}
              </Col>
              
              <Col xs={24} lg={12}>
                {renderFieldWithToggle('wbcCount', 'White Blood Cell Count', 'K/µL', <ExperimentOutlined style={{ color: '#fa8c16' }} />, '7')}
              </Col>
              
              <Col xs={24} lg={12}>
                {renderFieldWithToggle('rbcCount', 'Red Blood Cell Count', 'M/µL', <ExperimentOutlined style={{ color: '#ff4d4f' }} />, '4.5')}
              </Col>
              
              <Col xs={24}>
                {renderFieldWithToggle('plateletCount', 'Platelet Count', 'K/µL', <ExperimentOutlined style={{ color: '#722ed1' }} />, '250')}
              </Col>
            </Row>
          </div>

          {/* General Notes */}
          <Form.Item
            label={
              <Space>
                <InfoCircleOutlined />
                <span>Lab Notes</span>
              </Space>
            }
            name="labNotes"
            style={{ marginTop: 24 }}
          >
            <TextArea 
              rows={3} 
              placeholder="Enter any additional notes about the blood test results..."
            />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  )
}

export default BloodTestModal 