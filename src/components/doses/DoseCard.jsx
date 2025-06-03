import { Card, Avatar, Typography, Space, Tag, Button, Badge, Dropdown } from 'antd'
import { 
  MedicineBoxOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  MoreOutlined,
  EditOutlined,
  UserOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import './DoseCard.css'

dayjs.extend(relativeTime)

const { Text } = Typography

const DoseCard = ({ dose, onMarkDose, showPatient = false }) => {
  const { medication, patient, scheduledTime, status, takenAt, notes } = dose

  const getStatusConfig = () => {
    const now = dayjs()
    const doseTime = dayjs(scheduledTime)
    const isOverdue = status === 'pending' && doseTime.isBefore(now)
    
    switch (status) {
      case 'taken':
        return {
          color: '#52c41a',
          icon: <CheckCircleOutlined />,
          text: 'Taken',
          bgColor: '#f6ffed',
          borderColor: '#b7eb8f'
        }
      case 'missed':
        return {
          color: '#ff4d4f',
          icon: <CloseCircleOutlined />,
          text: 'Missed',
          bgColor: '#fff2f0',
          borderColor: '#ffccc7'
        }
      case 'pending':
        if (isOverdue) {
          return {
            color: '#ff4d4f',
            icon: <ExclamationCircleOutlined />,
            text: 'Overdue',
            bgColor: '#fff2f0',
            borderColor: '#ffccc7'
          }
        }
        return {
          color: '#fa8c16',
          icon: <ClockCircleOutlined />,
          text: 'Pending',
          bgColor: '#fff7e6',
          borderColor: '#ffd591'
        }
      default:
        return {
          color: '#8c8c8c',
          icon: <ClockCircleOutlined />,
          text: 'Unknown',
          bgColor: '#fafafa',
          borderColor: '#d9d9d9'
        }
    }
  }

  const statusConfig = getStatusConfig()

  const formatTime = () => {
    const doseTime = dayjs(scheduledTime)
    const now = dayjs()
    
    if (status === 'taken' && takenAt) {
      return {
        scheduled: doseTime.format('h:mm A'),
        actual: dayjs(takenAt).format('h:mm A'),
        relative: dayjs(takenAt).fromNow()
      }
    }
    
    return {
      scheduled: doseTime.format('h:mm A'),
      relative: doseTime.fromNow()
    }
  }

  const timeInfo = formatTime()

  const handleQuickMark = (newStatus) => {
    onMarkDose({
      ...dose,
      newStatus,
      notes: newStatus === 'missed' ? 'Marked as missed' : ''
    })
  }

  const handleDetailedMark = () => {
    onMarkDose(dose)
  }

  const getMenuItems = () => {
    const items = [
      {
        key: 'details',
        icon: <EditOutlined />,
        label: 'Mark with Details',
        onClick: handleDetailedMark
      }
    ]

    if (status === 'pending') {
      items.unshift(
        {
          key: 'taken',
          icon: <CheckCircleOutlined />,
          label: 'Mark as Taken',
          onClick: () => handleQuickMark('taken')
        },
        {
          key: 'missed',
          icon: <CloseCircleOutlined />,
          label: 'Mark as Missed',
          onClick: () => handleQuickMark('missed')
        },
        {
          type: 'divider'
        }
      )
    }

    return items
  }

  const renderPatientInfo = () => {
    if (!showPatient || !patient) return null

    return (
      <div className="dose-patient-info">
        <Space size="small">
          <Avatar size="small" icon={<UserOutlined />} />
          <Text strong className="patient-name">{patient.name}</Text>
          <Text type="secondary" size="small">
            {patient.age} years old
          </Text>
        </Space>
      </div>
    )
  }

  const renderTimeInfo = () => {
    return (
      <div className="dose-time-info">
        <Space direction="vertical" size={2}>
          <div className="scheduled-time">
            <Space size="small">
              <ClockCircleOutlined className="time-icon" />
              <Text strong>Scheduled: {timeInfo.scheduled}</Text>
            </Space>
          </div>
          
          {timeInfo.actual && (
            <div className="actual-time">
              <Text type="secondary" size="small">
                Actually taken: {timeInfo.actual}
              </Text>
            </div>
          )}
          
          <div className="relative-time">
            <Text type="secondary" size="small">
              {timeInfo.relative}
            </Text>
          </div>
        </Space>
      </div>
    )
  }

  const renderActionButtons = () => {
    if (status !== 'pending') {
      return (
        <Button
          type="text"
          icon={<EditOutlined />}
          onClick={handleDetailedMark}
          size="small"
        >
          Edit
        </Button>
      )
    }

    return (
      <Space size="small">
        <Button
          type="primary"
          icon={<CheckCircleOutlined />}
          onClick={() => handleQuickMark('taken')}
          size="small"
          className="take-button"
        >
          Take
        </Button>
        <Button
          danger
          icon={<CloseCircleOutlined />}
          onClick={() => handleQuickMark('missed')}
          size="small"
          className="miss-button"
        >
          Miss
        </Button>
        <Dropdown
          menu={{ items: getMenuItems() }}
          placement="bottomRight"
          trigger={['click']}
        >
          <Button
            type="text"
            icon={<MoreOutlined />}
            size="small"
          />
        </Dropdown>
      </Space>
    )
  }

  return (
    <Badge.Ribbon
      text={statusConfig.text}
      color={statusConfig.color}
      style={{ 
        display: status === 'pending' && dayjs(scheduledTime).isBefore(dayjs()) ? 'block' : 'none'
      }}
    >
      <Card
        className={`dose-card dose-card-${status}`}
        style={{
          borderColor: statusConfig.borderColor,
          backgroundColor: statusConfig.bgColor
        }}
        size="small"
      >
        <div className="dose-card-content">
          {/* Patient Info (if showing multiple patients) */}
          {renderPatientInfo()}

          {/* Main Content */}
          <div className="dose-main-content">
            <div className="dose-info">
              {/* Medication Info */}
              <div className="medication-info">
                <Space>
                  <Avatar
                    icon={<MedicineBoxOutlined />}
                    style={{ backgroundColor: statusConfig.color }}
                    size="default"
                  />
                  <div className="medication-details">
                    <Text strong className="medication-name">
                      {medication.name}
                    </Text>
                    <div className="medication-dosage">
                      <Text type="secondary">
                        {medication.dosage} {medication.form}
                      </Text>
                      {medication.instructions && (
                        <>
                          <Text type="secondary"> • </Text>
                          <Text type="secondary" size="small">
                            {medication.instructions}
                          </Text>
                        </>
                      )}
                    </div>
                  </div>
                </Space>
              </div>

              {/* Status Tag */}
              <div className="dose-status">
                <Tag
                  icon={statusConfig.icon}
                  color={statusConfig.color}
                  className="status-tag"
                >
                  {statusConfig.text}
                </Tag>
              </div>
            </div>

            {/* Time Information */}
            {renderTimeInfo()}

            {/* Notes */}
            {notes && (
              <div className="dose-notes">
                <Text type="secondary" size="small" italic>
                  Note: {notes}
                </Text>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="dose-actions">
            {renderActionButtons()}
          </div>
        </div>
      </Card>
    </Badge.Ribbon>
  )
}

export default DoseCard