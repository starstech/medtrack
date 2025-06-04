import { useState } from 'react'
import { 
  Card, 
  Switch, 
  Button, 
  Space, 
  Typography, 
  Divider, 
  Select,
  TimePicker,
  Row,
  Col,
  message,
  Tag,
  Slider
} from 'antd'
import { 
  BellOutlined,
  MobileOutlined,
  MailOutlined,
  SaveOutlined,
  NotificationOutlined,
  ClockCircleOutlined,
  SoundOutlined,
  MedicineBoxOutlined,
  CalendarOutlined,
  TeamOutlined
} from '@ant-design/icons'
import { useNotifications } from '../../hooks/useNotifications'
import dayjs from 'dayjs'
import './NotificationSettings.css'

const { Title, Text } = Typography
const { Option } = Select

const NotificationSettings = () => {
  const { preferences, updatePreferences } = useNotifications()
  const [loading, setLoading] = useState(false)
  const [localPreferences, setLocalPreferences] = useState(preferences)

  const handleSaveSettings = async () => {
    setLoading(true)
    
    try {
      await updatePreferences(localPreferences)
      message.success('Notification settings saved successfully!')
    } catch (error) {
      message.error('Failed to save settings. Please try again.')
      console.error('Error saving notification settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateLocalPreference = (key, value) => {
    setLocalPreferences(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const updateReminderMinutes = (minutes) => {
    setLocalPreferences(prev => ({
      ...prev,
      reminderMinutes: minutes
    }))
  }

  const addReminderTime = (minutes) => {
    if (!localPreferences.reminderMinutes.includes(minutes)) {
      const newMinutes = [...localPreferences.reminderMinutes, minutes].sort((a, b) => a - b)
      updateReminderMinutes(newMinutes)
    }
  }

  const removeReminderTime = (minutes) => {
    const newMinutes = localPreferences.reminderMinutes.filter(m => m !== minutes)
    updateReminderMinutes(newMinutes)
  }

  const formatReminderTime = (minutes) => {
    if (minutes < 60) {
      return `${minutes} min`
    } else if (minutes < 1440) {
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
    } else {
      const days = Math.floor(minutes / 1440)
      return `${days} day${days > 1 ? 's' : ''}`
    }
  }

  const reminderOptions = [
    { value: 5, label: '5 minutes' },
    { value: 10, label: '10 minutes' },
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 60, label: '1 hour' },
    { value: 120, label: '2 hours' },
    { value: 240, label: '4 hours' },
    { value: 1440, label: '1 day' },
    { value: 10080, label: '1 week' }
  ]

  return (
    <div className="notification-settings-section">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Push Notifications */}
        <div className="settings-group">
          <div className="settings-group-header">
            <div className="group-title">
              <Space>
                <BellOutlined />
                <span>Notification Delivery</span>
              </Space>
            </div>
          </div>
          
          <div className="settings-content">
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div className="notification-option">
                <div className="option-header">
                  <div className="option-info">
                    <Space>
                      <MobileOutlined />
                      <div>
                        <Text strong>Push Notifications</Text>
                        <br />
                        <Text type="secondary" size="small">
                          Receive notifications on your device
                        </Text>
                      </div>
                    </Space>
                  </div>
                  <Switch
                    checked={localPreferences.pushNotifications}
                    onChange={(checked) => updateLocalPreference('pushNotifications', checked)}
                  />
                </div>
              </div>

              <Divider />

              <div className="notification-option">
                <div className="option-header">
                  <div className="option-info">
                    <Space>
                      <MailOutlined />
                      <div>
                        <Text strong>Email Notifications</Text>
                        <br />
                        <Text type="secondary" size="small">
                          Receive notifications via email
                        </Text>
                      </div>
                    </Space>
                  </div>
                  <Switch
                    checked={localPreferences.emailNotifications}
                    onChange={(checked) => updateLocalPreference('emailNotifications', checked)}
                  />
                </div>
              </div>
            </Space>
          </div>
        </div>

        {/* Notification Types */}
        <div className="settings-group">
          <div className="settings-group-header">
            <div className="group-title">
              <Space>
                <NotificationOutlined />
                <span>Notification Types</span>
              </Space>
            </div>
          </div>
          
          <div className="settings-content">
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div className="notification-option">
                <div className="option-header">
                  <div className="option-info">
                    <Space>
                      <MedicineBoxOutlined />
                      <div>
                        <Text strong>Medication Reminders</Text>
                        <br />
                        <Text type="secondary" size="small">
                          Get notified when it's time to take medications
                        </Text>
                      </div>
                    </Space>
                  </div>
                  <Switch
                    checked={localPreferences.medicationReminders}
                    onChange={(checked) => updateLocalPreference('medicationReminders', checked)}
                    disabled={!localPreferences.pushNotifications && !localPreferences.emailNotifications}
                  />
                </div>
              </div>

              <div className="notification-option">
                <div className="option-header">
                  <div className="option-info">
                    <Space>
                      <CalendarOutlined />
                      <div>
                        <Text strong>Appointment Reminders</Text>
                        <br />
                        <Text type="secondary" size="small">
                          Get notified about upcoming appointments
                        </Text>
                      </div>
                    </Space>
                  </div>
                  <Switch
                    checked={localPreferences.appointmentReminders}
                    onChange={(checked) => updateLocalPreference('appointmentReminders', checked)}
                    disabled={!localPreferences.pushNotifications && !localPreferences.emailNotifications}
                  />
                </div>
              </div>

              <div className="notification-option">
                <div className="option-header">
                  <div className="option-info">
                    <Space>
                      <TeamOutlined />
                      <div>
                        <Text strong>Caregiver Updates</Text>
                        <br />
                        <Text type="secondary" size="small">
                          Get notified when other caregivers update patient information
                        </Text>
                      </div>
                    </Space>
                  </div>
                  <Switch
                    checked={localPreferences.caregiverUpdates}
                    onChange={(checked) => updateLocalPreference('caregiverUpdates', checked)}
                    disabled={!localPreferences.pushNotifications && !localPreferences.emailNotifications}
                  />
                </div>
              </div>
            </Space>
          </div>
        </div>

        {/* Medication Reminder Timing */}
        {localPreferences.medicationReminders && (
          <div className="settings-group">
            <div className="settings-group-header">
              <div className="group-title">
                <Space>
                  <ClockCircleOutlined />
                  <span>Medication Reminder Timing</span>
                </Space>
              </div>
            </div>
            
            <div className="settings-content">
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div>
                  <Text strong>Reminder Schedule</Text>
                  <br />
                  <Text type="secondary" size="small">
                    Choose when to receive medication reminders before the scheduled dose time
                  </Text>
                </div>

                <div className="reminder-times">
                  <Text strong>Active Reminders:</Text>
                  <div style={{ marginTop: 8 }}>
                    <Space size={[8, 8]} wrap>
                      {localPreferences.reminderMinutes.map(minutes => (
                        <Tag
                          key={minutes}
                          closable
                          onClose={() => removeReminderTime(minutes)}
                          color="blue"
                        >
                          {formatReminderTime(minutes)} before
                        </Tag>
                      ))}
                    </Space>
                  </div>
                </div>

                <div className="add-reminder">
                  <Text strong>Add Reminder:</Text>
                  <Row gutter={8} style={{ marginTop: 8 }}>
                    {reminderOptions.map(option => (
                      <Col key={option.value}>
                        <Button
                          size="small"
                          type={localPreferences.reminderMinutes.includes(option.value) ? 'primary' : 'default'}
                          onClick={() => {
                            if (localPreferences.reminderMinutes.includes(option.value)) {
                              removeReminderTime(option.value)
                            } else {
                              addReminderTime(option.value)
                            }
                          }}
                        >
                          {option.label}
                        </Button>
                      </Col>
                    ))}
                  </Row>
                </div>
              </Space>
            </div>
          </div>
        )}

        {/* Quiet Hours */}
        <div className="settings-group">
          <div className="settings-group-header">
            <div className="group-title">
              <Space>
                <SoundOutlined />
                <span>Quiet Hours</span>
              </Space>
            </div>
          </div>
          
          <div className="settings-content">
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div className="notification-option">
                <div className="option-header">
                  <div className="option-info">
                    <Text strong>Enable Quiet Hours</Text>
                    <br />
                    <Text type="secondary" size="small">
                      Disable non-urgent notifications during specified hours
                    </Text>
                  </div>
                  <Switch
                    checked={localPreferences.quietHours?.enabled || false}
                    onChange={(checked) => updateLocalPreference('quietHours', {
                      ...localPreferences.quietHours,
                      enabled: checked
                    })}
                  />
                </div>
              </div>

              {localPreferences.quietHours?.enabled && (
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <div>
                      <Text strong>Start Time</Text>
                      <br />
                      <TimePicker
                        value={localPreferences.quietHours?.start ? dayjs(localPreferences.quietHours.start, 'HH:mm') : dayjs('22:00', 'HH:mm')}
                        format="HH:mm"
                        style={{ width: '100%' }}
                        onChange={(time) => updateLocalPreference('quietHours', {
                          ...localPreferences.quietHours,
                          start: time?.format('HH:mm') || '22:00'
                        })}
                      />
                    </div>
                  </Col>
                  
                  <Col xs={24} sm={12}>
                    <div>
                      <Text strong>End Time</Text>
                      <br />
                      <TimePicker
                        value={localPreferences.quietHours?.end ? dayjs(localPreferences.quietHours.end, 'HH:mm') : dayjs('07:00', 'HH:mm')}
                        format="HH:mm"
                        style={{ width: '100%' }}
                        onChange={(time) => updateLocalPreference('quietHours', {
                          ...localPreferences.quietHours,
                          end: time?.format('HH:mm') || '07:00'
                        })}
                      />
                    </div>
                  </Col>
                </Row>
              )}
            </Space>
          </div>
        </div>

        {/* Notification Preview */}
        <div className="settings-group">
          <div className="settings-group-header">
            <div className="group-title">
              <Space>
                <BellOutlined />
                <span>Notification Preview</span>
              </Space>
            </div>
          </div>
          
          <div className="settings-content">
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Text type="secondary">
                Here's what your notifications will look like:
              </Text>
              
              <div className="notification-preview">
                <div className="preview-notification">
                  <Space>
                    <BellOutlined style={{ color: '#1890ff' }} />
                    <div>
                      <Text strong>Medication Reminder</Text>
                      <br />
                      <Text size="small">Emma needs Amoxicillin in 15 minutes</Text>
                    </div>
                  </Space>
                </div>
                
                <div className="preview-notification">
                  <Space>
                    <NotificationOutlined style={{ color: '#52c41a' }} />
                    <div>
                      <Text strong>Caregiver Update</Text>
                      <br />
                      <Text size="small">Mike marked Emma's dose as taken</Text>
                    </div>
                  </Space>
                </div>
              </div>

              <Button
                type="text"
                onClick={() => {
                  // TODO: Send test notification
                  message.success('Test notification sent!')
                }}
                className="card-action-btn"
                style={{
                  color: '#1890ff',
                  fontWeight: '500',
                  padding: '4px 8px',
                  fontSize: '13px',
                  borderRadius: '4px',
                  transition: 'all 0.2s ease'
                }}
              >
                Send Test
              </Button>
            </Space>
          </div>
        </div>

        {/* Save Button */}
        <div className="settings-actions">
          <Button
            type="primary"
            size="large"
            icon={<SaveOutlined />}
            onClick={handleSaveSettings}
            loading={loading}
          >
            Save Notification Settings
          </Button>
        </div>
      </Space>
    </div>
  )
}

export default NotificationSettings