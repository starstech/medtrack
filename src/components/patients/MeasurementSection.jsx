import { useState } from 'react'
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
  UserOutlined
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
    
    return (
      <div key={measurement.id} className="measurement-list-item">
        <div className="measurement-item">
          <div className="measurement-primary">
            <div className="measurement-name-row">
              <Text strong className="measurement-name">
                {typeInfo.label}
              </Text>
              <div className="measurement-value">
                <Text strong className="value-text">
                  {measurement.value} {typeInfo.unit}
                </Text>
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
                {measurement.notes && ` • ${measurement.notes}`}
              </Text>
            </div>
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

  return (
    <div className="measurement-section">
      <div className="measurement-group">
        <div className="measurement-group-header">
          <div className="group-title">
            <ExperimentOutlined />
            <span>Measurements ({filteredMeasurements.length})</span>
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
          <div className="measurement-list-container">
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

      {renderAddMeasurementModal()}
    </div>
  )
}

export default MeasurementSection