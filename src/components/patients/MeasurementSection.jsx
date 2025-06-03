import { useState } from 'react'
import { 
  Card, 
  List, 
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
  Dropdown
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

  const renderMeasurementCard = (measurement) => {
    const typeInfo = getMeasurementTypeInfo(measurement.type)
    const trend = getMeasurementTrend(measurement.type, measurement.value)
    
    return (
      <List.Item className="measurement-list-item">
        <Card 
          className="measurement-card"
          size="small"
        >
          <div className="measurement-content">
            <div className="measurement-header">
              <Space>
                <Avatar 
                  icon={<ExperimentOutlined />}
                  style={{ backgroundColor: '#1890ff' }}
                />
                <div className="measurement-title">
                  <Title level={5} className="measurement-type">
                    {typeInfo.label}
                  </Title>
                  <Text type="secondary" size="small">
                    {dayjs(measurement.recordedAt).format('MMM D, YYYY h:mm A')}
                  </Text>
                </div>
              </Space>
              
              <Dropdown
                menu={{ items: getMenuItems(measurement) }}
                placement="bottomRight"
                trigger={['click']}
              >
                <Button type="text" icon={<MoreOutlined />} size="small" />
              </Dropdown>
            </div>

            <div className="measurement-value-section">
              <Row gutter={16} align="middle">
                <Col flex="auto">
                  <div className="measurement-value">
                    <Text strong className="value-text">
                      {measurement.value} {typeInfo.unit}
                    </Text>
                    {trend && (
                      <Space size="small" className="trend-info">
                        {trend.direction === 'up' ? (
                          <RiseOutlined style={{ color: '#52c41a' }} />
                        ) : trend.direction === 'down' ? (
                          <FallOutlined style={{ color: '#ff4d4f' }} />
                        ) : null}
                        {trend.direction !== 'same' && (
                          <Text 
                            size="small" 
                            type="secondary"
                            style={{ 
                              color: trend.direction === 'up' ? '#52c41a' : '#ff4d4f' 
                            }}
                          >
                            {trend.direction === 'up' ? '+' : '-'}{trend.change} ({trend.percent}%)
                          </Text>
                        )}
                      </Space>
                    )}
                  </div>
                </Col>
                
                <Col>
                  <Button 
                    type="text" 
                    icon={<LineChartOutlined />} 
                    size="small"
                    onClick={() => {
                      // TODO: Show trend chart
                      message.info('Trend chart coming soon!')
                    }}
                  >
                    Trend
                  </Button>
                </Col>
              </Row>
            </div>

            <div className="measurement-details">
              <Row gutter={[16, 8]}>
                <Col xs={24} sm={12}>
                  <div className="detail-item">
                    <UserOutlined className="detail-icon" />
                    <Text type="secondary" size="small">Recorded by: </Text>
                    <Text size="small">{measurement.recordedBy}</Text>
                  </div>
                </Col>
                
                <Col xs={24} sm={12}>
                  <div className="detail-item">
                    <CalendarOutlined className="detail-icon" />
                    <Text type="secondary" size="small">
                      {dayjs(measurement.recordedAt).fromNow()}
                    </Text>
                  </div>
                </Col>
                
                {measurement.notes && (
                  <Col xs={24}>
                    <div className="detail-item">
                      <Text type="secondary" size="small">Notes: </Text>
                      <Text size="small">{measurement.notes}</Text>
                    </div>
                  </Col>
                )}
              </Row>
            </div>
          </div>
        </Card>
      </List.Item>
    )
  }

  const renderMeasurementStats = () => {
    if (measurements.length === 0) return null

    const recentMeasurements = measurements.filter(m => 
      dayjs().diff(dayjs(m.recordedAt), 'days') <= 7
    ).length

    const typeCounts = availableTypes.map(type => ({
      type,
      count: measurements.filter(m => m.type === type).length,
      label: getMeasurementTypeInfo(type).label
    })).sort((a, b) => b.count - a.count)

    return (
      <Card 
        title="Measurement Overview"
        className="measurement-stats-card"
        size="small"
      >
        <Row gutter={16}>
          <Col xs={12} sm={6}>
            <Statistic
              title="Total Measurements"
              value={measurements.length}
              prefix={<ExperimentOutlined />}
            />
          </Col>
          
          <Col xs={12} sm={6}>
            <Statistic
              title="This Week"
              value={recentMeasurements}
              prefix={<CalendarOutlined />}
            />
          </Col>
          
          <Col xs={12} sm={6}>
            <Statistic
              title="Measurement Types"
              value={availableTypes.length}
              prefix={<TrophyOutlined />}
            />
          </Col>
          
          <Col xs={12} sm={6}>
            <div className="most-tracked">
              <Text type="secondary" size="small">Most Tracked</Text>
              <div>
                <Text strong>{typeCounts[0]?.label || 'None'}</Text>
                {typeCounts[0] && (
                  <Text type="secondary" size="small"> ({typeCounts[0].count})</Text>
                )}
              </div>
            </div>
          </Col>
        </Row>
      </Card>
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
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {renderMeasurementStats()}

        <div className="measurement-group">
          <div className="measurement-group-header">
            <div className="group-title">
              <Space>
                <ExperimentOutlined />
                <span>Measurements ({filteredMeasurements.length})</span>
              </Space>
            </div>
            <Space>
              <Select
                value={selectedType}
                onChange={setSelectedType}
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
            <List
              dataSource={filteredMeasurements.sort((a, b) => 
                new Date(b.recordedAt) - new Date(a.recordedAt)
              )}
              renderItem={renderMeasurementCard}
              className="measurements-list"
              pagination={{
                pageSize: 10,
                showSizeChanger: false,
                showQuickJumper: true
              }}
            />
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