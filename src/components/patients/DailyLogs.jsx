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
  Row,
  Col,
  message,
  Timeline,
  Avatar,
  Dropdown,
  Divider,
  Segmented
} from 'antd'
import { 
  FileTextOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  UserOutlined,
  CalendarOutlined,
  FilterOutlined,
  UnorderedListOutlined,
  NodeIndexOutlined
} from '@ant-design/icons'
import { usePatients } from '../../hooks/usePatients'
import { LOG_TYPES, SEVERITY_LEVELS } from '../../utils/mockData'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { Option } = Select
const { TextArea } = Input

const DailyLogs = ({ patient }) => {
  const { getPatientLogs, addDailyLog } = usePatients()
  const [addModalVisible, setAddModalVisible] = useState(false)
  const [selectedType, setSelectedType] = useState('all')
  const [selectedSeverity, setSelectedSeverity] = useState('all')
  const [viewMode, setViewMode] = useState('list') // 'list' or 'timeline'
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const logs = getPatientLogs(patient.id)
  
  // Filter logs
  const filteredLogs = logs.filter(log => {
    const typeMatch = selectedType === 'all' || log.type === selectedType
    const severityMatch = selectedSeverity === 'all' || log.severity === selectedSeverity
    return typeMatch && severityMatch
  })

  // Get unique types and severities from data
  const availableTypes = [...new Set(logs.map(log => log.type))]
  const availableSeverities = [...new Set(logs.map(log => log.severity))]

  const handleAddLog = async (values) => {
    setLoading(true)
    
    try {
      const logData = {
        ...values,
        timestamp: values.timestamp.toISOString(),
        recordedBy: 'Current User', // TODO: Get from auth context
        followUpRequired: values.severity === 'moderate' || values.severity === 'severe',
        tags: values.tags ? values.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
      }

      await addDailyLog(patient.id, logData)
      
      message.success('Log entry added successfully!')
      setAddModalVisible(false)
      form.resetFields()
      
    } catch (error) {
      message.error('Failed to add log entry. Please try again.')
      console.error('Error adding log:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteLog = (logId) => {
    Modal.confirm({
      title: 'Delete Log Entry',
      content: 'Are you sure you want to delete this log entry? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => {
        // TODO: Implement delete functionality
        message.success('Log entry deleted successfully!')
      }
    })
  }

  const getLogTypeInfo = (type) => {
    return LOG_TYPES.find(t => t.value === type) || 
           { label: type, color: '#8c8c8c' }
  }

  const getSeverityInfo = (severity) => {
    return SEVERITY_LEVELS.find(s => s.value === severity) || 
           { label: severity, color: '#8c8c8c' }
  }

  const getMenuItems = (log) => [
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: 'Edit Log Entry',
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
      label: 'Delete Log Entry',
      onClick: () => handleDeleteLog(log.id),
      danger: true
    }
  ]

  const renderLogCard = (log) => {
    const typeInfo = getLogTypeInfo(log.type)
    const severityInfo = getSeverityInfo(log.severity)
    
    return (
      <Col xs={24} md={12}>
        <List.Item className="log-list-item">
          <Card 
            className={`log-card log-${log.severity}`}
            size="small"
            bodyStyle={{ padding: 16 }}
          >
            <div className="log-content">
              <div className="log-header">
                <Space>
                  <Avatar 
                    icon={<FileTextOutlined />}
                    style={{ backgroundColor: typeInfo.color }}
                    size="default"
                  />
                  <div className="log-title-section">
                    <Title level={5} className="log-title">
                      {log.title}
                    </Title>
                    <Text type="secondary" size="small">
                      {dayjs(log.timestamp).format('MMM D, YYYY h:mm A')}
                    </Text>
                  </div>
                </Space>
                
                <Space>
                  <Tag color={typeInfo.color} size="small">
                    {typeInfo.label}
                  </Tag>
                  <Tag color={severityInfo.color} size="small">
                    {severityInfo.label}
                  </Tag>
                  {log.followUpRequired && (
                    <Tag color="orange" size="small">
                      <ExclamationCircleOutlined />
                      Follow-up
                    </Tag>
                  )}
                  <Dropdown
                    menu={{ items: getMenuItems(log) }}
                    placement="bottomRight"
                    trigger={['click']}
                  >
                    <Button type="text" icon={<MoreOutlined />} size="small" />
                  </Dropdown>
                </Space>
              </div>

              <div className="log-description">
                <Text>{log.description}</Text>
              </div>

              <div className="log-footer">
                <Row gutter={[16, 8]}>
                  <Col xs={24} sm={12}>
                    <div className="log-meta">
                      <UserOutlined className="meta-icon" />
                      <Text type="secondary" size="small">
                        Recorded by {log.recordedBy}
                      </Text>
                    </div>
                  </Col>
                  
                  <Col xs={24} sm={12}>
                    <div className="log-meta">
                      <ClockCircleOutlined className="meta-icon" />
                      <Text type="secondary" size="small">
                        {dayjs(log.timestamp).fromNow()}
                      </Text>
                    </div>
                  </Col>
                  
                  {log.tags && log.tags.length > 0 && (
                    <Col xs={24}>
                      <div className="log-tags">
                        <Text type="secondary" size="small">Tags: </Text>
                        <Space size={4} wrap>
                          {log.tags.map((tag, index) => (
                            <Tag key={index} size="small" color="default">
                              {tag}
                            </Tag>
                          ))}
                        </Space>
                      </div>
                    </Col>
                  )}
                </Row>
              </div>
            </div>
          </Card>
        </List.Item>
      </Col>
    )
  }

  const renderListView = () => (
    <div className="logs-list-view">
      <List
        grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 2, xxl: 2 }}
        dataSource={filteredLogs}
        renderItem={renderLogCard}
      />
    </div>
  )

  const renderTimelineView = () => {
    const timelineItems = filteredLogs
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .map(log => {
        const typeInfo = getLogTypeInfo(log.type)
        const severityInfo = getSeverityInfo(log.severity)
        
        return {
          key: log.id,
          dot: (
            <Avatar 
              icon={<FileTextOutlined />}
              style={{ backgroundColor: typeInfo.color }}
              size="small"
            />
          ),
          children: (
            <div className="timeline-log-item">
              <div className="timeline-log-header">
                <Space>
                  <Title level={5} className="timeline-log-title">
                    {log.title}
                  </Title>
                  <Tag color={severityInfo.color} size="small">
                    {severityInfo.label}
                  </Tag>
                  {log.followUpRequired && (
                    <Tag color="orange" size="small">
                      Follow-up
                    </Tag>
                  )}
                </Space>
                
                <Dropdown
                  menu={{ items: getMenuItems(log) }}
                  placement="bottomRight"
                  trigger={['click']}
                >
                  <Button type="text" icon={<MoreOutlined />} size="small" />
                </Dropdown>
              </div>
              
              <Text type="secondary" size="small" className="timeline-log-time">
                {dayjs(log.timestamp).format('MMM D, YYYY h:mm A')}
              </Text>
              
              <div className="timeline-log-description">
                <Text>{log.description}</Text>
              </div>
              
              {log.tags && log.tags.length > 0 && (
                <div className="timeline-log-tags">
                  <Space size={4} wrap>
                    {log.tags.map((tag, index) => (
                      <Tag key={index} size="small" color="default">
                        {tag}
                      </Tag>
                    ))}
                  </Space>
                </div>
              )}
            </div>
          )
        }
      })

    return (
      <Timeline
        items={timelineItems}
        mode="left"
        className="logs-timeline"
      />
    )
  }

  const renderAddLogModal = () => (
    <Modal
      title={
        <Space>
          <FileTextOutlined />
          <span>Add Daily Log Entry</span>
        </Space>
      }
      open={addModalVisible}
      onCancel={() => {
        setAddModalVisible(false)
        form.resetFields()
      }}
      footer={null}
      width={600}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleAddLog}
        size="large"
        initialValues={{
          timestamp: dayjs(),
          type: 'general',
          severity: 'normal'
        }}
      >
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="type"
              label="Log Type"
              rules={[
                { required: true, message: 'Please select log type' }
              ]}
            >
              <Select placeholder="Select log type">
                {LOG_TYPES.map(type => (
                  <Option key={type.value} value={type.value}>
                    <Space>
                      <div
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: type.color
                        }}
                      />
                      {type.label}
                    </Space>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          
          <Col xs={24} sm={12}>
            <Form.Item
              name="severity"
              label="Severity"
              rules={[
                { required: true, message: 'Please select severity level' }
              ]}
            >
              <Select placeholder="Select severity">
                {SEVERITY_LEVELS.map(severity => (
                  <Option key={severity.value} value={severity.value}>
                    <Space>
                      <div
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: severity.color
                        }}
                      />
                      {severity.label}
                    </Space>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="title"
          label="Title"
          rules={[
            { required: true, message: 'Please enter a title' },
            { min: 3, message: 'Title must be at least 3 characters' }
          ]}
        >
          <Input placeholder="e.g., Threw up after breakfast" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
          rules={[
            { required: true, message: 'Please enter a description' },
            { min: 10, message: 'Description must be at least 10 characters' }
          ]}
        >
          <TextArea 
            placeholder="Detailed description of what happened, when it occurred, any relevant circumstances..."
            rows={4}
            maxLength={1000}
            showCount
          />
        </Form.Item>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="timestamp"
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
              name="tags"
              label="Tags (Optional)"
              help="Separate multiple tags with commas"
            >
              <Input placeholder="e.g., breakfast, nausea, recovery" />
            </Form.Item>
          </Col>
        </Row>

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
              Add Log Entry
            </Button>
          </Space>
        </div>
      </Form>
    </Modal>
  )

  return (
    <div className="daily-logs-section">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* View Controls */}
        <Card size="small" className="logs-controls">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={8}>
              <Segmented
                value={viewMode}
                onChange={setViewMode}
                options={[
                  {
                    label: 'List',
                    value: 'list',
                    icon: <UnorderedListOutlined />
                  },
                  {
                    label: 'Timeline',
                    value: 'timeline',
                    icon: <NodeIndexOutlined />
                  }
                ]}
              />
            </Col>
            
            <Col xs={24} sm={16}>
              <Space wrap>
                <Select
                  value={selectedType}
                  onChange={setSelectedType}
                  style={{ width: 120 }}
                  size="small"
                >
                  <Option value="all">All Types</Option>
                  {availableTypes.map(type => (
                    <Option key={type} value={type}>
                      {getLogTypeInfo(type).label}
                    </Option>
                  ))}
                </Select>
                
                <Select
                  value={selectedSeverity}
                  onChange={setSelectedSeverity}
                  style={{ width: 120 }}
                  size="small"
                >
                  <Option value="all">All Severity</Option>
                  {availableSeverities.map(severity => (
                    <Option key={severity} value={severity}>
                      {getSeverityInfo(severity).label}
                    </Option>
                  ))}
                </Select>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Main Content */}
        <Card
          title={
            <Space>
              <FileTextOutlined />
              <span>Daily Logs ({filteredLogs.length})</span>
            </Space>
          }
          extra={
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => setAddModalVisible(true)}
            >
              Add Log
            </Button>
          }
          className="logs-card"
        >
          {filteredLogs.length > 0 ? (
            <div className="logs-content">
              {viewMode === 'timeline' ? (
                renderTimelineView()
              ) : (
                renderListView()
              )}
            </div>
          ) : (
            <Empty
              image={<FileTextOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />}
              description={
                selectedType === 'all' && selectedSeverity === 'all'
                  ? "No log entries yet"
                  : "No entries match the selected filters"
              }
              style={{ padding: '40px 0' }}
            >
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => setAddModalVisible(true)}
              >
                Add First Log Entry
              </Button>
            </Empty>
          )}
        </Card>
      </Space>

      {renderAddLogModal()}
    </div>
  )
}

export default DailyLogs