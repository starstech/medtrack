import { useState, useEffect, useRef } from 'react'
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
  Segmented,
  Image,
  Tooltip
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
  NodeIndexOutlined,
  CameraOutlined,
  EyeOutlined
} from '@ant-design/icons'
import { usePatients } from '../../hooks/usePatients'
import { LOG_TYPES, SEVERITY_LEVELS } from '../../utils/mockData'
import { LogAttachmentUpload } from '../common/FileUpload'
import dayjs from 'dayjs'
import './DailyLogs.css'

const { Title, Text } = Typography
const { Option } = Select
const { TextArea } = Input
const { RangePicker } = DatePicker

const DailyLogs = ({ patient }) => {
  const { getPatientLogs, addDailyLog } = usePatients()
  const [addModalVisible, setAddModalVisible] = useState(false)
  const [selectedType, setSelectedType] = useState('all')
  const [selectedSeverity, setSelectedSeverity] = useState('all')
  const [selectedDateFilter, setSelectedDateFilter] = useState('all') // 'all', 'today', 'yesterday', 'last7days', 'thisweek', 'custom'
  const [customDateRange, setCustomDateRange] = useState([null, null])
  const [viewMode, setViewMode] = useState('list') // 'list' or 'timeline'
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [isScrollable, setIsScrollable] = useState(false)
  const containerRef = useRef(null)

  const logs = getPatientLogs(patient.id)
  
  // Helper function to filter logs by date
  const filterLogsByDate = (logs, dateFilter, customRange) => {
    const now = dayjs()
    const today = now.startOf('day')
    
    switch (dateFilter) {
      case 'today':
        return logs.filter(log => dayjs(log.timestamp).isSame(today, 'day'))
      case 'yesterday':
        const yesterday = today.subtract(1, 'day')
        return logs.filter(log => dayjs(log.timestamp).isSame(yesterday, 'day'))
      case 'last7days':
        const sevenDaysAgo = today.subtract(7, 'day')
        return logs.filter(log => dayjs(log.timestamp).isAfter(sevenDaysAgo))
      case 'thisweek':
        const startOfWeek = today.startOf('week')
        return logs.filter(log => dayjs(log.timestamp).isAfter(startOfWeek))
      case 'custom':
        if (customRange[0] && customRange[1]) {
          return logs.filter(log => {
            const logDate = dayjs(log.timestamp)
            return logDate.isAfter(customRange[0].startOf('day')) && 
                   logDate.isBefore(customRange[1].endOf('day'))
          })
        }
        return logs
      default:
        return logs
    }
  }
  
  // Filter logs
  const filteredLogs = logs.filter(log => {
    const typeMatch = selectedType === 'all' || log.type === selectedType
    const severityMatch = selectedSeverity === 'all' || log.severity === selectedSeverity
    return typeMatch && severityMatch
  })

  // Apply date filtering
  const dateFilteredLogs = filterLogsByDate(filteredLogs, selectedDateFilter, customDateRange)

  // Sort logs by date (newest first)
  const sortedLogs = dateFilteredLogs.sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  )

  // Group logs by date for better organization
  const groupLogsByDate = (logs) => {
    const groups = {}
    logs.forEach(log => {
      const dateKey = dayjs(log.timestamp).format('YYYY-MM-DD')
      const dateLabel = dayjs(log.timestamp).format('MMMM D, YYYY')
      const isToday = dayjs(log.timestamp).isSame(dayjs(), 'day')
      const isYesterday = dayjs(log.timestamp).isSame(dayjs().subtract(1, 'day'), 'day')
      
      let displayLabel = dateLabel
      if (isToday) displayLabel = `Today, ${dateLabel}`
      else if (isYesterday) displayLabel = `Yesterday, ${dateLabel}`
      
      if (!groups[dateKey]) {
        groups[dateKey] = {
          date: dateKey,
          label: displayLabel,
          logs: []
        }
      }
      groups[dateKey].logs.push(log)
    })
    
    return Object.values(groups).sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf())
  }

  const groupedLogs = groupLogsByDate(sortedLogs)

  // Get unique types and severities from data
  const availableTypes = [...new Set(logs.map(log => log.type))]
  const availableSeverities = [...new Set(logs.map(log => log.severity))]

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
  }, [sortedLogs, selectedDateFilter, customDateRange])

  const handleAddLog = async (values) => {
    setLoading(true)
    
    try {
      const logData = {
        ...values,
        timestamp: values.timestamp.toISOString(),
        recordedBy: 'Current User', // TODO: Get from auth context
        followUpRequired: values.severity === 'moderate' || values.severity === 'severe',
        tags: values.tags ? values.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
        attachments: values.attachments || []
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

  const renderLogAttachments = (log) => {
    if (!log.attachments || log.attachments.length === 0) {
      return null
    }

    const attachments = log.attachments.filter(att => att.status === 'done')
    if (attachments.length === 0) return null

    return (
      <div className="log-attachments">
        <Space size={4}>
          <Tooltip title={`${attachments.length} photo${attachments.length > 1 ? 's' : ''} attached`}>
            <Button
              type="text"
              size="small"
              icon={<CameraOutlined />}
              className="attachment-indicator"
            >
              {attachments.length}
            </Button>
          </Tooltip>
          <div className="attachment-previews">
            <Image.PreviewGroup>
              {attachments.slice(0, 2).map((attachment, index) => (
                <Image
                  key={attachment.uid}
                  width={24}
                  height={24}
                  src={attachment.url}
                  alt={attachment.name}
                  style={{
                    borderRadius: '4px',
                    objectFit: 'cover',
                    cursor: 'pointer',
                    border: '1px solid #f0f0f0'
                  }}
                  preview={{
                    mask: <EyeOutlined style={{ fontSize: '10px' }} />
                  }}
                />
              ))}
              {attachments.length > 2 && (
                <div className="more-attachments">
                  <Tooltip title={`+${attachments.length - 2} more photos`}>
                    <div className="attachment-count">
                      +{attachments.length - 2}
                    </div>
                  </Tooltip>
                </div>
              )}
            </Image.PreviewGroup>
          </div>
        </Space>
      </div>
    )
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

  const renderLogItem = (log) => {
    const typeInfo = getLogTypeInfo(log.type)
    const severityInfo = getSeverityInfo(log.severity)
    
    return (
      <div key={log.id} className="log-list-item">
        <div className="log-item">
          <div className="log-icon">
            <Avatar 
              icon={<FileTextOutlined />}
              style={{ backgroundColor: typeInfo.color }}
              size="default"
            />
          </div>
          <div className="log-primary">
            <div className="log-name-row">
              <Text strong className="log-title">
                {log.title}
              </Text>
              <div className="log-tags-row">
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
              </div>
            </div>
            
            <div className="log-details-row">
              <Text type="secondary" size="small">
                {dayjs(log.timestamp).format('MMM D, YYYY h:mm A')} • by {log.recordedBy} • {dayjs(log.timestamp).fromNow()}
              </Text>
              {renderLogAttachments(log)}
            </div>
            
            <div className="log-description">
              <Text>{log.description}</Text>
            </div>

            {log.tags && log.tags.length > 0 && (
              <div className="log-tags">
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

          <div className="log-actions">
            <Button
              size="small"
              type="text"
              icon={<EditOutlined />}
              onClick={() => message.info('Edit functionality coming soon!')}
              className="list-action-btn"
            />
            <Dropdown
              menu={{ items: getMenuItems(log) }}
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

  const renderListView = () => (
    <div 
      className={`log-list-container ${isScrollable ? 'has-scroll' : ''}`}
      ref={containerRef}
    >
      <div className="logs-list">
        {groupedLogs.map((dateGroup) => (
          <div key={dateGroup.date} className="date-group">
            <div className="date-group-header">
              <Text strong className="date-group-title">
                {dateGroup.label}
              </Text>
              <Tag size="small" color="blue">
                {dateGroup.logs.length} {dateGroup.logs.length === 1 ? 'entry' : 'entries'}
              </Tag>
            </div>
            <div className="date-group-logs">
              {dateGroup.logs.map(renderLogItem)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderTimelineView = () => {
    const timelineItems = sortedLogs
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
              
              <div className="timeline-log-meta">
                <Text type="secondary" size="small" className="timeline-log-time">
                  {dayjs(log.timestamp).format('MMM D, YYYY h:mm A')}
                </Text>
                {renderLogAttachments(log)}
              </div>
              
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
      footer={[
        <Button 
          key="cancel"
          onClick={() => {
            setAddModalVisible(false)
            form.resetFields()
          }}
          size="large"
        >
          Cancel
        </Button>,
        <Button 
          key="submit"
          type="primary" 
          htmlType="submit"
          loading={loading}
          form="daily-log-form"
          size="large"
        >
          {loading ? 'Adding...' : 'Add Log Entry'}
        </Button>
      ]}
      width={600}
      destroyOnClose
      className="daily-log-modal"
    >
      <div className="modal-form">
        <Form
          id="daily-log-form"
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

          <Form.Item
            name="attachments"
            label="Photos (Optional)"
            help="Add photos to document incidents, symptoms, or activities"
          >
            <LogAttachmentUpload />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  )

  return (
    <div className="daily-logs-section">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* View Controls */}
        <div className="logs-controls-group">
          <div className="logs-controls-header">
            <div className="group-title">
              <Space>
                <FilterOutlined />
                <span>View Options</span>
              </Space>
            </div>
            <Space wrap>
              <Segmented
                value={viewMode}
                onChange={setViewMode}
                size="small"
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
            </Space>
          </div>
          
          <Row gutter={[16, 8]}>
            <Col xs={24} sm={8} md={6}>
              <Select
                value={selectedDateFilter}
                onChange={(value) => {
                  setSelectedDateFilter(value)
                  if (value !== 'custom') {
                    setCustomDateRange([null, null])
                  }
                }}
                style={{ width: '100%' }}
                size="small"
                placeholder="Select date range"
              >
                <Option value="all">All Dates</Option>
                <Option value="today">Today</Option>
                <Option value="yesterday">Yesterday</Option>
                <Option value="last7days">Last 7 Days</Option>
                <Option value="thisweek">This Week</Option>
                <Option value="custom">Custom Range</Option>
              </Select>
            </Col>
            
            {selectedDateFilter === 'custom' && (
              <Col xs={24} sm={12} md={8}>
                <RangePicker
                  value={customDateRange}
                  onChange={setCustomDateRange}
                  style={{ width: '100%' }}
                  size="small"
                  placeholder={['Start Date', 'End Date']}
                />
              </Col>
            )}
            
            <Col xs={24} sm={8} md={6}>
              <Select
                value={selectedType}
                onChange={setSelectedType}
                style={{ width: '100%' }}
                size="small"
              >
                <Option value="all">All Types</Option>
                {availableTypes.map(type => (
                  <Option key={type} value={type}>
                    {getLogTypeInfo(type).label}
                  </Option>
                ))}
              </Select>
            </Col>
            
            <Col xs={24} sm={8} md={6}>
              <Select
                value={selectedSeverity}
                onChange={setSelectedSeverity}
                style={{ width: '100%' }}
                size="small"
              >
                <Option value="all">All Severity</Option>
                {availableSeverities.map(severity => (
                  <Option key={severity} value={severity}>
                    {getSeverityInfo(severity).label}
                  </Option>
                ))}
              </Select>
            </Col>
          </Row>
        </div>

        {/* Main Content */}
        <div className="logs-group">
          <div className="logs-group-header">
            <div className="group-title">
              <Space>
                <FileTextOutlined />
                <span>
                  Daily Logs ({dateFilteredLogs.length})
                  {selectedDateFilter !== 'all' && (
                    <Text type="secondary" style={{ fontWeight: 'normal', fontSize: '14px' }}>
                      {selectedDateFilter === 'today' && ' • Today'}
                      {selectedDateFilter === 'yesterday' && ' • Yesterday'}
                      {selectedDateFilter === 'last7days' && ' • Last 7 Days'}
                      {selectedDateFilter === 'thisweek' && ' • This Week'}
                      {selectedDateFilter === 'custom' && customDateRange[0] && customDateRange[1] && 
                        ` • ${customDateRange[0].format('MMM D')} - ${customDateRange[1].format('MMM D')}`}
                    </Text>
                  )}
                </span>
              </Space>
            </div>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => setAddModalVisible(true)}
              size="small"
            >
              Add Log
            </Button>
          </div>

          {dateFilteredLogs.length > 0 ? (
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
                selectedType === 'all' && selectedSeverity === 'all' && selectedDateFilter === 'all'
                  ? "No log entries yet"
                  : `No entries match the selected filters${
                      selectedDateFilter === 'today' ? ' for today' :
                      selectedDateFilter === 'yesterday' ? ' for yesterday' :
                      selectedDateFilter === 'last7days' ? ' for the last 7 days' :
                      selectedDateFilter === 'thisweek' ? ' for this week' :
                      selectedDateFilter === 'custom' && customDateRange[0] && customDateRange[1] ? 
                        ` for ${customDateRange[0].format('MMM D')} - ${customDateRange[1].format('MMM D')}` :
                      ''
                    }`
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
        </div>
      </Space>

      {renderAddLogModal()}
    </div>
  )
}

export default DailyLogs