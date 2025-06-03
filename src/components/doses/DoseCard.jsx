import { Avatar, Typography, Space, Tag, Button, Dropdown } from 'antd'
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
          color: 'green',
          text: 'Taken'
        }
      case 'missed':
        return {
          color: 'red',
          text: 'Missed'
        }
      case 'pending':
        if (isOverdue) {
          return {
            color: 'red',
            text: 'Overdue'
          }
        }
        return {
          color: 'orange',
          text: 'Pending'
        }
      default:
        return {
          color: 'default',
          text: 'Unknown'
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

  const renderActionButtons = () => {
    if (status !== 'pending') {
      return (
        <Button
          size="small"
          type="text"
          icon={<EditOutlined />}
          onClick={handleDetailedMark}
          className="list-action-btn"
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
      </Space>
    )
  }

  return (
    <div className="dose-item">
      <div className="dose-icon">
        <MedicineBoxOutlined />
      </div>
      <div className="dose-primary">
        <div className="dose-name-row">
          <Text strong className="dose-name">
            {medication.name}
          </Text>
          <div className="dose-status-time">
            <Tag color={statusConfig.color} size="small" className="dose-status">
              {statusConfig.text}
            </Tag>
          </div>
        </div>
        
        <div className="dose-details-row">
          <Text type="secondary" size="small">
            <span className="dose-label">Dosage:</span> {medication.dosage} {medication.form}
            {showPatient && patient && (
              <> • <span className="dose-label">Patient:</span> {patient.name}</>
            )}
          </Text>
        </div>
        
        <div className="dose-time-row">
          <Text type="secondary" size="small">
            <span className="dose-label">
              {status === 'taken' && timeInfo.actual ? 'Taken at:' : 'Due at:'}
            </span>{' '}
            {status === 'taken' && timeInfo.actual ? timeInfo.actual : timeInfo.scheduled}
            {' • '}
            <span className="dose-relative-time">{timeInfo.relative}</span>
          </Text>
        </div>
        
        {notes && (
          <div className="dose-notes">
            <Text size="small" type="secondary">
              <span className="dose-label">Note:</span> {notes}
            </Text>
          </div>
        )}
      </div>

      <div className="dose-actions">
        {renderActionButtons()}
      </div>
    </div>
  )
}

export default DoseCard