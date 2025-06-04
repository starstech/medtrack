import { useState } from 'react'
import { 
  Card, 
  List, 
  Button, 
  Space, 
  Typography, 
  Avatar, 
  Badge,
  Empty,
  Dropdown,
  Divider,
  Tag
} from 'antd'
import { 
  BellOutlined,
  MedicineBoxOutlined,
  CalendarOutlined,
  TeamOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EllipsisOutlined,
  EyeOutlined,
  DeleteOutlined,
  CheckOutlined,
  PlusOutlined
} from '@ant-design/icons'
import { useNotificationContext } from '../../contexts/NotificationContext'
import { formatDistanceToNow } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import './NotificationPanel.css'

const { Title, Text } = Typography

const NotificationPanel = () => {
  const navigate = useNavigate()
  const { 
    notifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    addNotification,
    toggleReadStatus
  } = useNotificationContext()

  const [visibleCount, setVisibleCount] = useState(5)
  const unreadNotifications = notifications.filter(n => !n.read)

  const getNotificationIcon = (type) => {
    const iconStyle = { fontSize: '16px' }
    
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

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id)
    }
    // TODO: Add navigation logic based on notification type
  }

  const handleViewAllNotifications = () => {
    navigate('/notifications')
  }

  const visibleNotifications = notifications.slice(0, visibleCount)
  const hasMoreNotifications = notifications.length > visibleCount

  return (
    <Card className="notification-panel" bordered={false}>
      {/* Header */}
      <div className="notification-header">
        <div className="header-title">
          <Space>
            <BellOutlined />
            <Title level={5} style={{ margin: 0 }}>
              Notifications
            </Title>
            {unreadNotifications.length > 0 && (
              <Badge 
                count={unreadNotifications.length} 
                style={{ backgroundColor: '#1890ff' }}
              />
            )}
          </Space>
        </div>
        
        {unreadNotifications.length > 0 && (
          <Button 
            type="text" 
            size="small"
            onClick={markAllAsRead}
            className="mark-all-read-btn"
          >
            Mark all read
          </Button>
        )}
      </div>

      <Divider style={{ margin: '12px 0' }} />

      {/* Notifications List */}
      <div className="notification-list">
        {notifications.length === 0 ? (
          <Empty
            image={<BellOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />}
            description="No notifications yet"
            style={{ padding: '20px 0' }}
          >
            <Text type="secondary" size="small">
              You'll see medication reminders, appointment alerts, and caregiver updates here
            </Text>
          </Empty>
        ) : (
          <List
            dataSource={visibleNotifications}
            renderItem={(notification) => (
              <List.Item 
                className={`notification-item ${!notification.read ? 'unread' : ''}`}
              >
                <div 
                  className="notification-content"
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-main">
                    <div className="notification-avatar">
                      {getNotificationIcon(notification.type)}
                      {!notification.read && (
                        <div className="unread-indicator" />
                      )}
                    </div>
                    
                    <div className="notification-body">
                      <div className="notification-title">
                        <div className="title-content">
                          <Text strong className={!notification.read ? 'unread-title' : ''}>
                            {notification.title}
                          </Text>
                          <Tag 
                            color={getPriorityColor(notification.type)}
                            size="small"
                            className="notification-type-tag"
                          >
                            {formatNotificationType(notification.type)}
                          </Tag>
                        </div>
                      </div>
                      
                      <div className="notification-description">
                        <Text 
                          type="secondary" 
                          className={!notification.read ? 'unread-description' : ''}
                        >
                          {notification.message}
                        </Text>
                      </div>
                      
                      <div className="notification-time">
                        <Text type="secondary" size="small">
                          {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                        </Text>
                      </div>
                    </div>
                  </div>
                  
                  <div className="notification-actions">
                    <Button 
                      type="text" 
                      icon={notification.read ? <EyeOutlined /> : <CheckOutlined />} 
                      size="small"
                      className="notification-action-btn read-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleReadStatus(notification.id)
                      }}
                      title={notification.read ? 'Mark as unread' : 'Mark as read'}
                    />
                    <Button 
                      type="text" 
                      icon={<DeleteOutlined />} 
                      size="small"
                      className="notification-action-btn delete-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteNotification(notification.id)
                      }}
                      title="Delete notification"
                    />
                  </div>
                </div>
              </List.Item>
            )}
          />
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <>
          <Divider style={{ margin: '12px 0' }} />
          <div className="notification-footer">
            {hasMoreNotifications && (
              <Button 
                type="text" 
                size="small"
                onClick={() => setVisibleCount(prev => prev + 5)}
                className="load-more-btn"
              >
                Show {Math.min(5, notifications.length - visibleCount)} more
              </Button>
            )}
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button 
                type="text" 
                size="small"
                icon={<PlusOutlined />}
                onClick={() => {
                  addNotification({
                    type: 'medication_reminder',
                    title: 'New Medication Reminder',
                    message: 'Time for Emma\'s afternoon Vitamin D dose'
                  })
                }}
                className="test-notification-btn"
                style={{ fontSize: '11px' }}
              >
                Test
              </Button>
              
              <Button 
                type="text" 
                size="small"
                className="view-all-btn"
                onClick={handleViewAllNotifications}
              >
                View all
              </Button>
            </div>
          </div>
        </>
      )}
    </Card>
  )
}

export default NotificationPanel 