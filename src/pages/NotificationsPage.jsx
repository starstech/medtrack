import { useState, useMemo } from 'react'
import { 
  Card,
  List,
  Button,
  Space,
  Typography,
  Select,
  Input,
  Badge,
  Tag,
  Empty,
  Row,
  Col,
  Checkbox,
  Dropdown,
  message
} from 'antd'
import { 
  BellOutlined,
  SearchOutlined,
  FilterOutlined,
  CheckOutlined,
  DeleteOutlined,
  EyeOutlined,
  ArrowLeftOutlined,
  MedicineBoxOutlined,
  CalendarOutlined,
  TeamOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined,
  MoreOutlined
} from '@ant-design/icons'
import { useNotificationContext } from '../contexts/NotificationContext'
import { formatDistanceToNow } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import './NotificationsPage.css'

const { Title, Text } = Typography
const { Option } = Select
const { Search } = Input

const NotificationsPage = () => {
  const navigate = useNavigate()
  const { 
    notifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotificationContext()

  const [selectedNotifications, setSelectedNotifications] = useState([])
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')

  const getNotificationIcon = (type) => {
    const iconStyle = { fontSize: '18px' }
    
    switch (type) {
      case 'medication_reminder':
        return <MedicineBoxOutlined style={{ ...iconStyle, color: '#1890ff' }} />
      case 'appointment_reminder':
        return <CalendarOutlined style={{ ...iconStyle, color: '#52c41a' }} />
      case 'caregiver_update':
        return <TeamOutlined style={{ ...iconStyle, color: '#722ed1' }} />
      case 'system_alert':
        return <ExclamationCircleOutlined style={{ ...iconStyle, color: '#ff4d4f' }} />
      case 'measurement_reminder':
        return <ClockCircleOutlined style={{ ...iconStyle, color: '#fa8c16' }} />
      default:
        return <InfoCircleOutlined style={{ ...iconStyle, color: '#8c8c8c' }} />
    }
  }

  const getPriorityColor = (type) => {
    switch (type) {
      case 'medication_reminder':
        return '#1890ff'
      case 'appointment_reminder':
        return '#52c41a'
      case 'caregiver_update':
        return '#722ed1'
      case 'system_alert':
        return '#ff4d4f'
      case 'measurement_reminder':
        return '#fa8c16'
      default:
        return '#8c8c8c'
    }
  }

  const formatNotificationType = (type) => {
    const typeMap = {
      medication_reminder: 'Medication',
      appointment_reminder: 'Appointment',
      caregiver_update: 'Caregiver',
      system_alert: 'System',
      measurement_reminder: 'Measurement'
    }
    return typeMap[type] || 'Notification'
  }

  const filteredAndSortedNotifications = useMemo(() => {
    let filtered = notifications

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(n => n.type === filterType)
    }

    // Filter by status
    if (filterStatus === 'unread') {
      filtered = filtered.filter(n => !n.read)
    } else if (filterStatus === 'read') {
      filtered = filtered.filter(n => n.read)
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.message.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Sort
    if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    } else if (sortBy === 'type') {
      filtered.sort((a, b) => a.type.localeCompare(b.type))
    }

    return filtered
  }, [notifications, filterType, filterStatus, searchQuery, sortBy])

  const unreadCount = notifications.filter(n => !n.read).length

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedNotifications(filteredAndSortedNotifications.map(n => n.id))
    } else {
      setSelectedNotifications([])
    }
  }

  const handleSelectNotification = (notificationId, checked) => {
    if (checked) {
      setSelectedNotifications(prev => [...prev, notificationId])
    } else {
      setSelectedNotifications(prev => prev.filter(id => id !== notificationId))
    }
  }

  const handleBulkMarkAsRead = () => {
    selectedNotifications.forEach(id => markAsRead(id))
    setSelectedNotifications([])
    message.success(`Marked ${selectedNotifications.length} notifications as read`)
  }

  const handleBulkDelete = () => {
    selectedNotifications.forEach(id => deleteNotification(id))
    setSelectedNotifications([])
    message.success(`Deleted ${selectedNotifications.length} notifications`)
  }

  const getBulkActionItems = () => [
    {
      key: 'mark-read',
      icon: <CheckOutlined />,
      label: 'Mark as Read',
      onClick: handleBulkMarkAsRead
    },
    {
      type: 'divider'
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: 'Delete',
      onClick: handleBulkDelete,
      danger: true
    }
  ]

  return (
    <div className="notifications-page">
      {/* Header */}
      <div className="notifications-header">
        <div className="header-content">
          <div className="header-title">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(-1)}
              className="back-button"
              size="small"
            >
              Back
            </Button>
            <div className="title-section">
              <Title level={2} style={{ margin: 0 }}>
                <Space>
                  <BellOutlined />
                  Notifications
                  {unreadCount > 0 && (
                    <Badge count={unreadCount} style={{ backgroundColor: '#1890ff' }} />
                  )}
                </Space>
              </Title>
              <Text type="secondary">
                {filteredAndSortedNotifications.length} of {notifications.length} notifications
              </Text>
            </div>
          </div>

          <div className="header-actions">
            {unreadCount > 0 && (
              <Button 
                type="primary" 
                icon={<CheckOutlined />}
                onClick={markAllAsRead}
              >
                Mark All Read
              </Button>
            )}
          </div>
        </div>

        {/* Filters and Search */}
        <Card className="filters-card" size="small">
          <Row gutter={16} align="middle">
            <Col xs={24} sm={8} md={6}>
              <Search
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                prefix={<SearchOutlined />}
                allowClear
              />
            </Col>
            
            <Col xs={12} sm={4} md={3}>
              <Select
                value={filterType}
                onChange={setFilterType}
                style={{ width: '100%' }}
                placeholder="Type"
              >
                <Option value="all">All Types</Option>
                <Option value="medication_reminder">Medication</Option>
                <Option value="appointment_reminder">Appointment</Option>
                <Option value="caregiver_update">Caregiver</Option>
                <Option value="measurement_reminder">Measurement</Option>
                <Option value="system_alert">System</Option>
              </Select>
            </Col>
            
            <Col xs={12} sm={4} md={3}>
              <Select
                value={filterStatus}
                onChange={setFilterStatus}
                style={{ width: '100%' }}
                placeholder="Status"
              >
                <Option value="all">All Status</Option>
                <Option value="unread">Unread</Option>
                <Option value="read">Read</Option>
              </Select>
            </Col>
            
            <Col xs={12} sm={4} md={3}>
              <Select
                value={sortBy}
                onChange={setSortBy}
                style={{ width: '100%' }}
                placeholder="Sort"
              >
                <Option value="newest">Newest First</Option>
                <Option value="oldest">Oldest First</Option>
                <Option value="type">By Type</Option>
              </Select>
            </Col>

            {selectedNotifications.length > 0 && (
              <Col xs={12} sm={4} md={3}>
                <Dropdown menu={{ items: getBulkActionItems() }} placement="bottomRight">
                  <Button icon={<MoreOutlined />}>
                    Actions ({selectedNotifications.length})
                  </Button>
                </Dropdown>
              </Col>
            )}
          </Row>
        </Card>
      </div>

      {/* Notifications List */}
      <Card className="notifications-content">
        {filteredAndSortedNotifications.length === 0 ? (
          <Empty
            image={<BellOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />}
            description={
              searchQuery || filterType !== 'all' || filterStatus !== 'all'
                ? "No notifications match your filters"
                : "No notifications yet"
            }
            style={{ padding: '60px 0' }}
          >
            {(!searchQuery && filterType === 'all' && filterStatus === 'all') && (
              <Text type="secondary">
                You'll see medication reminders, appointment alerts, and caregiver updates here
              </Text>
            )}
          </Empty>
        ) : (
          <>
            {/* Select All Header */}
            <div className="select-all-header">
              <Checkbox
                checked={selectedNotifications.length === filteredAndSortedNotifications.length}
                indeterminate={selectedNotifications.length > 0 && selectedNotifications.length < filteredAndSortedNotifications.length}
                onChange={(e) => handleSelectAll(e.target.checked)}
              >
                Select all visible notifications
              </Checkbox>
            </div>

            <List
              dataSource={filteredAndSortedNotifications}
              renderItem={(notification) => (
                <List.Item 
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                  actions={[
                    <Space key="actions">
                      <Button 
                        type="text" 
                        icon={notification.read ? <EyeOutlined /> : <CheckOutlined />} 
                        size="small"
                        onClick={() => markAsRead(notification.id)}
                        title={notification.read ? 'Mark as unread' : 'Mark as read'}
                      />
                      <Button 
                        type="text" 
                        icon={<DeleteOutlined />} 
                        size="small"
                        onClick={() => deleteNotification(notification.id)}
                        title="Delete notification"
                        danger
                      />
                    </Space>
                  ]}
                >
                  <div className="notification-content-full">
                    <Checkbox
                      checked={selectedNotifications.includes(notification.id)}
                      onChange={(e) => handleSelectNotification(notification.id, e.target.checked)}
                      className="notification-checkbox"
                    />
                    
                    <List.Item.Meta
                      avatar={
                        <div className="notification-avatar">
                          {getNotificationIcon(notification.type)}
                          {!notification.read && (
                            <div className="unread-indicator" />
                          )}
                        </div>
                      }
                      title={
                        <div className="notification-title">
                          <Space>
                            <Text strong className={!notification.read ? 'unread-title' : ''}>
                              {notification.title}
                            </Text>
                            <Tag 
                              color={getPriorityColor(notification.type)}
                              size="small"
                            >
                              {formatNotificationType(notification.type)}
                            </Tag>
                          </Space>
                        </div>
                      }
                      description={
                        <div className="notification-description">
                          <Text 
                            type="secondary" 
                            className={!notification.read ? 'unread-description' : ''}
                          >
                            {notification.message}
                          </Text>
                          <div className="notification-time">
                            <Text type="secondary" size="small">
                              {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                            </Text>
                          </div>
                        </div>
                      }
                    />
                  </div>
                </List.Item>
              )}
            />
          </>
        )}
      </Card>
    </div>
  )
}

export default NotificationsPage 