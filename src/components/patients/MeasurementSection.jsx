import { useState, useEffect, useRef } from 'react'
import { 
  Card, 
  Button, 
  Space, 
  Typography, 
  Tag, 
  Empty,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Row,
  Col,
  message,
  Statistic,
  Avatar,
  Dropdown,
  Pagination
} from 'antd'
import { 
  ExperimentOutlined,
  PlusOutlined,
  TrophyOutlined,
  RiseOutlined,
  FallOutlined,
  LineChartOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  CalendarOutlined,
  UserOutlined,
  HeartOutlined,
  ThunderboltOutlined,
  DashboardOutlined,
  FireOutlined,
  EyeOutlined,
  MedicineBoxOutlined,
  DropboxOutlined,
  CloudOutlined,
  GoldOutlined,
  AlertOutlined,
  BulbOutlined
} from '@ant-design/icons'
import { usePatients } from '../../hooks/usePatients'
import { MEASUREMENT_TYPES } from '../../utils/mockData'
import dayjs from 'dayjs'
import './MeasurementSection.css'

const { Title, Text } = Typography
const { Option } = Select
const { TextArea } = Input

const MeasurementSection = ({ patient }) => {
  const { getPatientMeasurements, addMeasurement } = usePatients()
  const [addModalVisible, setAddModalVisible] = useState(false)
  const [selectedType, setSelectedType] = useState('all')
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [isScrollable, setIsScrollable] = useState(false)
  const containerRef = useRef(null)

  const measurements = getPatientMeasurements(patient.id)
  const filteredMeasurements = selectedType === 'all' 
    ? measurements 
    : measurements.filter(m => m.type === selectedType)

  // Sort measurements by date (newest first)
  const sortedMeasurements = filteredMeasurements.sort((a, b) => 
    new Date(b.recordedAt) - new Date(a.recordedAt)
  )

  // Get unique measurement types from data
  const availableTypes = [...new Set(measurements.map(m => m.type))]

  // Check if container is scrollable
  useEffect(() => {
    const checkScrollable = () => {
      if (containerRef.current) {
        const { scrollHeight, clientHeight } = containerRef.current
        setIsScrollable(scrollHeight > clientHeight)
      }
    }

    checkScrollable()
    window.addEventListener('resize', checkScrollable)

    return () => {
      window.removeEventListener('resize', checkScrollable)
    }
  }, [sortedMeasurements])

  const handleAddMeasurement = async (values) => {
    setLoading(true)
    
    try {
      const measurementData = {
        ...values,
        recordedAt: values.recordedAt.toISOString(),
        recordedBy: 'Current User' // TODO: Get from auth context
      }

      await addMeasurement(patient.id, measurementData)
      
      message.success('Measurement recorded successfully!')
      setAddModalVisible(false)
      form.resetFields()
      
    } catch (error) {
      message.error('Failed to record measurement. Please try again.')
      console.error('Error adding measurement:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteMeasurement = (measurementId) => {
    Modal.confirm({
      title: 'Delete Measurement',
      content: 'Are you sure you want to delete this measurement? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => {
        // TODO: Implement delete functionality
        message.success('Measurement deleted successfully!')
      }
    })
  }

  const getMeasurementTypeIcon = (type) => {
    const iconMap = {
      'blood_pressure_systolic': <HeartOutlined style={{ color: '#ff4d4f' }} />,
      'blood_pressure_diastolic': <HeartOutlined style={{ color: '#ff4d4f' }} />,
      'blood_pressure': <HeartOutlined style={{ color: '#ff4d4f' }} />,
      'heart_rate': <HeartOutlined style={{ color: '#52c41a' }} />,
      'temperature': <ThunderboltOutlined style={{ color: '#fa8c16' }} />,
      'weight': <FireOutlined style={{ color: '#1890ff' }} />,
      'height': <DashboardOutlined style={{ color: '#722ed1' }} />,
      'blood_glucose': <ExperimentOutlined style={{ color: '#eb2f96' }} />,
      'oxygen_saturation': <DashboardOutlined style={{ color: '#13c2c2' }} />,
      'cholesterol_total': <DropboxOutlined style={{ color: '#fa541c' }} />,
      'cholesterol_ldl': <DropboxOutlined style={{ color: '#ff4d4f' }} />,
      'cholesterol_hdl': <DropboxOutlined style={{ color: '#52c41a' }} />,
      'triglycerides': <DropboxOutlined style={{ color: '#faad14' }} />,
      'hemoglobin': <HeartOutlined style={{ color: '#f5222d' }} />,
      'hematocrit': <HeartOutlined style={{ color: '#cf1322' }} />,
      'white_blood_cell_count': <ExperimentOutlined style={{ color: '#fadb14' }} />,
      'red_blood_cell_count': <HeartOutlined style={{ color: '#ff7875' }} />,
      'platelet_count': <ExperimentOutlined style={{ color: '#ff9c6e' }} />,
      'urine_protein': <DropboxOutlined style={{ color: '#40a9ff' }} />,
      'urine_glucose': <DropboxOutlined style={{ color: '#73d13d' }} />,
      'urine_ketones': <DropboxOutlined style={{ color: '#b37feb' }} />,
      'urine_specific_gravity': <DropboxOutlined style={{ color: '#36cfc9' }} />,
      'urine_ph': <ExperimentOutlined style={{ color: '#ffc53d' }} />,
      'urine_blood': <DropboxOutlined style={{ color: '#ff4d4f' }} />,
      'urine_leukocytes': <DropboxOutlined style={{ color: '#fadb14' }} />,
      'creatinine': <MedicineBoxOutlined style={{ color: '#722ed1' }} />,
      'blood_urea_nitrogen': <MedicineBoxOutlined style={{ color: '#597ef7' }} />,
      'thyroid_tsh': <BulbOutlined style={{ color: '#fa8c16' }} />,
      'thyroid_t3': <BulbOutlined style={{ color: '#faad14' }} />,
      'thyroid_t4': <BulbOutlined style={{ color: '#ffc53d' }} />,
      'vitamin_d': <GoldOutlined style={{ color: '#fadb14' }} />,
      'vitamin_b12': <GoldOutlined style={{ color: '#f759ab' }} />,
      'iron': <GoldOutlined style={{ color: '#8c8c8c' }} />,
      'calcium': <GoldOutlined style={{ color: '#d9d9d9' }} />,
      'potassium': <CloudOutlined style={{ color: '#40a9ff' }} />,
      'sodium': <CloudOutlined style={{ color: '#36cfc9' }} />,
      'chloride': <CloudOutlined style={{ color: '#52c41a' }} />,
      'respiratory_rate': <EyeOutlined style={{ color: '#73d13d' }} />,
      'peak_flow': <EyeOutlined style={{ color: '#40a9ff' }} />,
      'pain_level': <AlertOutlined style={{ color: '#ff4d4f' }} />,
      'mood_rating': <BulbOutlined style={{ color: '#722ed1' }} />
    }
    
    return iconMap[type] || <ExperimentOutlined style={{ color: '#1890ff' }} />
  }

  const getMeasurementStatus = (type, value) => {
    // Define normal ranges for common measurements based on medical standards
    const normalRanges = {
      'blood_pressure_systolic': { min: 90, max: 120, unit: 'mmHg', label: 'Systolic BP' },
      'blood_pressure_diastolic': { min: 60, max: 80, unit: 'mmHg', label: 'Diastolic BP' },
      'blood_pressure': { min: null, max: null, unit: 'mmHg', label: 'Blood Pressure', status: 'Measured' },
      'heart_rate': { min: 60, max: 100, unit: 'bpm', label: 'Heart Rate' },
      'temperature': { min: 36.1, max: 37.2, unit: '°C', label: 'Temperature' },
      'weight': { min: null, max: null, unit: 'kg', label: 'Weight', status: 'Measured' },
      'height': { min: null, max: null, unit: 'cm', label: 'Height', status: 'Measured' },
      'blood_glucose': { min: 70, max: 100, unit: 'mg/dL', label: 'Blood Glucose' },
      'oxygen_saturation': { min: 95, max: 100, unit: '%', label: 'O2 Saturation' },
      'cholesterol_total': { min: 0, max: 200, unit: 'mg/dL', label: 'Total Cholesterol' },
      'cholesterol_ldl': { min: 0, max: 100, unit: 'mg/dL', label: 'LDL Cholesterol' },
      'cholesterol_hdl': { min: 40, max: null, unit: 'mg/dL', label: 'HDL Cholesterol' },
      'triglycerides': { min: 0, max: 150, unit: 'mg/dL', label: 'Triglycerides' },
      'hemoglobin': { min: 12.0, max: 16.0, unit: 'g/dL', label: 'Hemoglobin' },
      'hematocrit': { min: 36, max: 47, unit: '%', label: 'Hematocrit' },
      'white_blood_cell_count': { min: 4500, max: 11000, unit: '/μL', label: 'WBC Count' },
      'red_blood_cell_count': { min: 3.5, max: 5.9, unit: 'million/μL', label: 'RBC Count' },
      'platelet_count': { min: 150000, max: 400000, unit: '/μL', label: 'Platelet Count' },
      'urine_protein': { min: 0, max: 150, unit: 'mg/24h', label: 'Urine Protein' },
      'urine_glucose': { min: 0, max: 0, unit: 'mg/dL', label: 'Urine Glucose' },
      'urine_ketones': { min: 0, max: 0, unit: 'mg/dL', label: 'Urine Ketones' },
      'urine_specific_gravity': { min: 1.005, max: 1.025, unit: '', label: 'Specific Gravity' },
      'urine_ph': { min: 4.5, max: 8.0, unit: '', label: 'Urine pH' },
      'urine_blood': { min: 0, max: 3, unit: 'RBC/hpf', label: 'Urine Blood' },
      'urine_leukocytes': { min: 0, max: 5, unit: 'WBC/hpf', label: 'Urine Leukocytes' },
      'creatinine': { min: 0.6, max: 1.2, unit: 'mg/dL', label: 'Creatinine' },
      'blood_urea_nitrogen': { min: 8, max: 21, unit: 'mg/dL', label: 'BUN' },
      'thyroid_tsh': { min: 0.4, max: 4.0, unit: 'mIU/L', label: 'TSH' },
      'thyroid_t3': { min: 100, max: 200, unit: 'ng/dL', label: 'T3' },
      'thyroid_t4': { min: 5.0, max: 12.0, unit: 'μg/dL', label: 'T4' },
      'vitamin_d': { min: 20, max: 50, unit: 'ng/mL', label: 'Vitamin D' },
      'vitamin_b12': { min: 200, max: 800, unit: 'pg/mL', label: 'Vitamin B12' },
      'iron': { min: 50, max: 175, unit: 'μg/dL', label: 'Iron' },
      'calcium': { min: 8.4, max: 10.2, unit: 'mg/dL', label: 'Calcium' },
      'potassium': { min: 3.5, max: 5.0, unit: 'mEq/L', label: 'Potassium' },
      'sodium': { min: 136, max: 145, unit: 'mEq/L', label: 'Sodium' },
      'chloride': { min: 95, max: 105, unit: 'mEq/L', label: 'Chloride' },
      'respiratory_rate': { min: 12, max: 20, unit: '/min', label: 'Respiratory Rate' },
      'peak_flow': { min: null, max: null, unit: 'L/min', label: 'Peak Flow', status: 'Measured' },
      'pain_level': { min: 0, max: 3, unit: '/10', label: 'Pain Level' },
      'mood_rating': { min: 6, max: 10, unit: '/10', label: 'Mood Rating' }
    }

    const range = normalRanges[type]
    if (!range) {
      return { color: 'blue', text: 'Logged', level: 'normal' }
    }

    // For measurements without defined ranges, return their custom status
    if (range.min === null || range.max === null) {
      return { color: 'blue', text: range.status || 'Logged', level: 'normal' }
    }

    // Special handling for urine protein results
    if (type === 'urine_protein') {
      const val = value.toString().toLowerCase()
      // Handle standard protein dipstick results
      if (val === 'negative' || val === 'normal' || val === '0' || val === '-') {
        return { color: 'green', text: 'Normal', level: 'normal' }
      } else if (val === 'trace' || val.includes('trace')) {
        return { color: 'green', text: 'Trace', level: 'normal' }
      } else if (val === '1+' || val === '+1' || val.includes('1+')) {
        return { color: 'orange', text: '1+ Mild', level: 'mild' }
      } else if (val === '2+' || val === '+2' || val.includes('2+')) {
        return { color: 'orange', text: '2+ Moderate', level: 'mild' }
      } else if (val === '3+' || val === '+3' || val.includes('3+')) {
        return { color: 'red', text: '3+ High', level: 'severe' }
      } else if (val === '4+' || val === '+4' || val.includes('4+')) {
        return { color: 'red', text: '4+ Very High', level: 'severe' }
      } else {
        return { color: 'blue', text: 'Tested', level: 'normal' }
      }
    }

    // Special handling for blood pressure (combined systolic/diastolic)
    if (type === 'blood_pressure') {
      const bpMatch = value.toString().match(/(\d+)\/(\d+)/)
      if (bpMatch) {
        const systolic = parseInt(bpMatch[1])
        const diastolic = parseInt(bpMatch[2])
        
        // Evaluate based on both values
        if (systolic >= 140 || diastolic >= 90) {
          return { color: 'red', text: 'High', level: 'severe' }
        } else if (systolic >= 130 || diastolic >= 80) {
          return { color: 'orange', text: 'Elevated', level: 'mild' }
        } else if (systolic >= 90 && diastolic >= 60) {
          return { color: 'green', text: 'Normal', level: 'normal' }
        } else {
          return { color: 'orange', text: 'Low', level: 'mild' }
        }
      } else {
        return { color: 'blue', text: 'Measured', level: 'normal' }
      }
    }

    const numValue = parseFloat(value)
    if (isNaN(numValue)) {
      return { color: 'default', text: 'Invalid', level: 'unknown' }
    }

    // Special handling for HDL cholesterol (higher is better)
    if (type === 'cholesterol_hdl') {
      if (numValue < range.min) {
        return { color: 'red', text: 'Low Risk', level: 'severe' }
      } else if (numValue >= 60) {
        return { color: 'green', text: 'Protective', level: 'normal' }
      } else {
        return { color: 'orange', text: 'Acceptable', level: 'mild' }
      }
    }

    // Special handling for subjective scales (pain, mood)
    if (type === 'pain_level') {
      if (numValue === 0) {
        return { color: 'green', text: 'No Pain', level: 'normal' }
      } else if (numValue <= 3) {
        return { color: 'green', text: 'Mild', level: 'normal' }
      } else if (numValue <= 6) {
        return { color: 'orange', text: 'Moderate', level: 'mild' }
      } else {
        return { color: 'red', text: 'Severe', level: 'severe' }
      }
    }

    if (type === 'mood_rating') {
      if (numValue >= 8) {
        return { color: 'green', text: 'Excellent', level: 'normal' }
      } else if (numValue >= 6) {
        return { color: 'green', text: 'Good', level: 'normal' }
      } else if (numValue >= 4) {
        return { color: 'orange', text: 'Fair', level: 'mild' }
      } else {
        return { color: 'red', text: 'Poor', level: 'severe' }
      }
    }

    // Standard range evaluation
    if (numValue < range.min) {
      if (numValue < range.min * 0.8) {
        return { 
          color: 'red', 
          text: 'Very Low', 
          level: 'severe' 
        }
      } else {
        return { 
          color: 'orange', 
          text: 'Low', 
          level: 'mild' 
        }
      }
    } else if (numValue > range.max) {
      if (numValue > range.max * 1.2) {
        return { 
          color: 'red', 
          text: 'Very High', 
          level: 'severe' 
        }
      } else {
        return { 
          color: 'orange', 
          text: 'High', 
          level: 'mild' 
        }
      }
    } else {
      return { color: 'green', text: 'Normal', level: 'normal' }
    }
  }

  const getMeasurementTypeInfo = (type) => {
    return MEASUREMENT_TYPES.find(t => t.value === type) || 
           { label: type.replace('_', ' '), unit: '' }
  }

  const getMeasurementTrend = (type, currentValue) => {
    const typeMeasurements = measurements
      .filter(m => m.type === type)
      .sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt))
    
    if (typeMeasurements.length < 2) return null
    
    const previous = typeMeasurements[1]
    const current = typeMeasurements[0]
    
    if (typeof currentValue === 'string') return null
    
    const prevValue = parseFloat(previous.value)
    const currValue = parseFloat(currentValue)
    
    if (isNaN(prevValue) || isNaN(currValue)) return null
    
    const change = currValue - prevValue
    const percentChange = Math.abs((change / prevValue) * 100)
    
    return {
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'same',
      change: Math.abs(change),
      percent: percentChange.toFixed(1)
    }
  }

  const getMenuItems = (measurement) => [
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: 'Edit Measurement',
      onClick: () => {
        // TODO: Implement edit functionality
        message.info('Edit functionality coming soon!')
      }
    },
    {
      type: 'divider'
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: 'Delete Measurement',
      onClick: () => handleDeleteMeasurement(measurement.id),
      danger: true
    }
  ]

  const renderMeasurementItem = (measurement) => {
    const typeInfo = getMeasurementTypeInfo(measurement.type)
    const trend = getMeasurementTrend(measurement.type, measurement.value)
    const status = getMeasurementStatus(measurement.type, measurement.value)
    const typeIcon = getMeasurementTypeIcon(measurement.type)
    
    return (
      <div key={measurement.id} className="measurement-list-item">
        <div className="measurement-item">
          <div className="measurement-icon">
            {typeIcon}
          </div>
          <div className="measurement-primary">
            <div className="measurement-name-row">
              <Text strong className="measurement-name">
                {typeInfo.label}
              </Text>
              <div className="measurement-value">
                <Text strong className="value-text">
                  {measurement.value} {typeInfo.unit}
                </Text>
                <Tag color={status.color} size="small" className="measurement-status">
                  {status.text}
                </Tag>
                {trend && (
                  <span className="trend-info">
                    {trend.direction === 'up' ? (
                      <RiseOutlined style={{ color: '#52c41a', fontSize: '12px' }} />
                    ) : trend.direction === 'down' ? (
                      <FallOutlined style={{ color: '#ff4d4f', fontSize: '12px' }} />
                    ) : null}
                    {trend.direction !== 'same' && (
                      <Text 
                        size="small" 
                        style={{ 
                          color: trend.direction === 'up' ? '#52c41a' : '#ff4d4f',
                          fontSize: '11px',
                          marginLeft: '4px'
                        }}
                      >
                        {trend.percent}%
                      </Text>
                    )}
                  </span>
                )}
              </div>
            </div>
            
            <div className="measurement-details-row">
              <Text type="secondary" size="small">
                {dayjs(measurement.recordedAt).format('MMM D, YYYY h:mm A')} • by {measurement.recordedBy}
              </Text>
            </div>
            
            {measurement.notes && (
              <div className="measurement-notes">
                <Text size="small" type="secondary">
                  {measurement.notes}
                </Text>
              </div>
            )}
          </div>

          <div className="measurement-actions">
            <Button
              size="small"
              type="text"
              icon={<LineChartOutlined />}
              onClick={() => message.info('Trend chart coming soon!')}
              className="list-action-btn"
            />
            <Dropdown
              menu={{ items: getMenuItems(measurement) }}
              placement="bottomLeft"
              trigger={['click']}
            >
              <Button 
                size="small" 
                type="text" 
                icon={<MoreOutlined />} 
                className="list-action-btn"
              />
            </Dropdown>
          </div>
        </div>
      </div>
    )
  }

  const renderAddMeasurementModal = () => (
    <Modal
      title={
        <Space>
          <ExperimentOutlined />
          <span>Record New Measurement</span>
        </Space>
      }
      open={addModalVisible}
      onCancel={() => {
        setAddModalVisible(false)
        form.resetFields()
      }}
      footer={null}
      width={500}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleAddMeasurement}
        size="large"
        initialValues={{
          recordedAt: dayjs()
        }}
      >
        <Form.Item
          name="type"
          label="Measurement Type"
          rules={[
            { required: true, message: 'Please select measurement type' }
          ]}
        >
          <Select 
            placeholder="Select measurement type"
            showSearch
            optionFilterProp="children"
          >
            {MEASUREMENT_TYPES.map(type => (
              <Option key={type.value} value={type.value}>
                {type.label} {type.unit && `(${type.unit})`}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Row gutter={16}>
          <Col xs={24} sm={16}>
            <Form.Item
              name="value"
              label="Value"
              rules={[
                { required: true, message: 'Please enter measurement value' }
              ]}
            >
              <Input placeholder="Enter measurement value" />
            </Form.Item>
          </Col>
          
          <Col xs={24} sm={8}>
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
        </Row>

        <Form.Item
          name="notes"
          label="Notes (Optional)"
        >
          <TextArea 
            placeholder="Any additional notes about this measurement..."
            rows={3}
            maxLength={500}
            showCount
          />
        </Form.Item>

        <div style={{ textAlign: 'right' }}>
          <Space>
            <Button onClick={() => {
              setAddModalVisible(false)
              form.resetFields()
            }}>
              Cancel
            </Button>
            <Button 
              type="primary" 
              htmlType="submit"
              loading={loading}
            >
              Record Measurement
            </Button>
          </Space>
        </div>
      </Form>
    </Modal>
  )

  // Get status breakdown for measurements
  const getStatusBreakdown = () => {
    const breakdown = { normal: 0, warning: 0, critical: 0 }
    
    filteredMeasurements.forEach(measurement => {
      const status = getMeasurementStatus(measurement.type, measurement.value)
      if (status.level === 'normal') {
        breakdown.normal++
      } else if (status.level === 'mild') {
        breakdown.warning++
      } else if (status.level === 'severe') {
        breakdown.critical++
      }
    })
    
    return breakdown
  }

  const statusBreakdown = getStatusBreakdown()

  return (
    <div className="measurement-section">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div className="measurement-group">
          <div className="measurement-group-header">
            <div className="group-title">
              <Space>
                <ExperimentOutlined />
                <span>Recent Measurements ({filteredMeasurements.length})</span>
                {filteredMeasurements.length > 0 && (
                  <Space size={4}>
                    {statusBreakdown.normal > 0 && (
                      <Tag color="green" size="small">{statusBreakdown.normal} Normal</Tag>
                    )}
                    {statusBreakdown.warning > 0 && (
                      <Tag color="orange" size="small">{statusBreakdown.warning} Alert</Tag>
                    )}
                    {statusBreakdown.critical > 0 && (
                      <Tag color="red" size="small">{statusBreakdown.critical} Critical</Tag>
                    )}
                  </Space>
                )}
              </Space>
            </div>
            <Space>
              <Select
                value={selectedType}
                onChange={(value) => setSelectedType(value)}
                style={{ width: 150 }}
                size="small"
              >
                <Option value="all">All Types</Option>
                {availableTypes.map(type => (
                  <Option key={type} value={type}>
                    {getMeasurementTypeInfo(type).label}
                  </Option>
                ))}
              </Select>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => setAddModalVisible(true)}
                size="small"
              >
                Record
              </Button>
            </Space>
          </div>

          {filteredMeasurements.length > 0 ? (
            <div 
              className={`measurement-list-container ${isScrollable ? 'has-scroll' : ''}`}
              ref={containerRef}
            >
              <div className="measurements-list">
                {sortedMeasurements.map(renderMeasurementItem)}
              </div>
            </div>
          ) : (
            <Empty
              image={<ExperimentOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />}
              description={
                selectedType === 'all' 
                  ? "No measurements recorded yet"
                  : `No ${getMeasurementTypeInfo(selectedType).label.toLowerCase()} measurements`
              }
              style={{ padding: '40px 0' }}
            >
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => setAddModalVisible(true)}
              >
                Record First Measurement
              </Button>
            </Empty>
          )}
        </div>
      </Space>

      {renderAddMeasurementModal()}
    </div>
  )
}

export default MeasurementSection