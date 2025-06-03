import { useState, useMemo } from 'react'
import { List, Empty, Typography, Space, Button, Segmented } from 'antd'
import { 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  ExclamationCircleOutlined,
  MedicineBoxOutlined 
} from '@ant-design/icons'
import DoseCard from './DoseCard'
import MarkDoseModal from './MarkDoseModal'
import { usePatients } from '../../hooks/usePatients'
import dayjs from 'dayjs'
import './TodaysDoses.css'

const { Text, Title } = Typography

const TodaysDoses = ({ doses, selectedPatient, statusFilter }) => {
  const { markDose } = usePatients()
  const [selectedDose, setSelectedDose] = useState(null)
  const [markDoseModalVisible, setMarkDoseModalVisible] = useState(false)
  const [viewMode, setViewMode] = useState('timeline')

  // Group doses by time periods for timeline view
  const groupedDoses = useMemo(() => {
    if (viewMode !== 'timeline') return { all: doses }
    
    const now = dayjs()
    const groups = {
      overdue: [],
      upcoming: [],
      later: []
    }

    doses.forEach(dose => {
      const doseTime = dayjs(dose.scheduledTime)
      const diffMinutes = doseTime.diff(now, 'minutes')
      
      if (dose.status === 'pending') {
        if (diffMinutes < 0) {
          groups.overdue.push(dose)
        } else if (diffMinutes <= 120) { // Next 2 hours
          groups.upcoming.push(dose)
        } else {
          groups.later.push(dose)
        }
      } else {
        // Completed/missed doses go to a separate group
        if (!groups.completed) groups.completed = []
        groups.completed.push(dose)
      }
    })

    return groups
  }, [doses, viewMode])

  const handleMarkDose = (dose) => {
    setSelectedDose(dose)
    setMarkDoseModalVisible(true)
  }

  const handleDoseMarked = async (doseData) => {
    try {
      await markDose(
        doseData.medicationId,
        doseData.doseId,
        doseData.status,
        doseData.notes
      )
      setMarkDoseModalVisible(false)
      setSelectedDose(null)
    } catch (error) {
      console.error('Error marking dose:', error)
    }
  }

  const handleModalClose = () => {
    setMarkDoseModalVisible(false)
    setSelectedDose(null)
  }

  const renderTimelineSection = (title, doses, icon, color, description) => {
    if (!doses || doses.length === 0) return null

    return (
      <div className="timeline-section" key={title}>
        <div className="timeline-header">
          <Space>
            <div className="timeline-icon" style={{ color }}>
              {icon}
            </div>
            <div>
              <Title level={5} className="timeline-title">
                {title} ({doses.length})
              </Title>
              {description && (
                <Text type="secondary" size="small">
                  {description}
                </Text>
              )}
            </div>
          </Space>
        </div>
        
        <List
          dataSource={doses}
          renderItem={(dose) => (
            <List.Item className="dose-list-item">
              <DoseCard
                dose={dose}
                onMarkDose={handleMarkDose}
                showPatient={selectedPatient === 'all'}
              />
            </List.Item>
          )}
          split={false}
        />
      </div>
    )
  }

  const renderListView = () => {
    if (doses.length === 0) {
      return (
        <Empty
          image={<MedicineBoxOutlined className="empty-icon" />}
          imageStyle={{ fontSize: 64, color: '#d9d9d9' }}
          description={
            <div className="empty-description">
              <Text strong>No doses scheduled for today</Text>
              <br />
              <Text type="secondary">
                {selectedPatient === 'all' 
                  ? 'No patients have doses scheduled for today'
                  : 'This patient has no doses scheduled for today'
                }
              </Text>
            </div>
          }
        />
      )
    }

    return (
      <List
        dataSource={doses}
        renderItem={(dose) => (
          <List.Item className="dose-list-item">
            <DoseCard
              dose={dose}
              onMarkDose={handleMarkDose}
              showPatient={selectedPatient === 'all'}
            />
          </List.Item>
        )}
        split={false}
        className="doses-list"
      />
    )
  }

  const renderTimelineView = () => {
    const hasAnyDoses = Object.values(groupedDoses).some(group => group && group.length > 0)
    
    if (!hasAnyDoses) {
      return (
        <Empty
          image={<ClockCircleOutlined className="empty-icon" />}
          imageStyle={{ fontSize: 64, color: '#d9d9d9' }}
          description={
            <div className="empty-description">
              <Text strong>No doses for today</Text>
              <br />
              <Text type="secondary">
                Great! All doses have been completed or there are no doses scheduled.
              </Text>
            </div>
          }
        />
      )
    }

    return (
      <div className="timeline-view">
        {renderTimelineSection(
          'Overdue',
          groupedDoses.overdue,
          <ExclamationCircleOutlined />,
          '#ff4d4f',
          'These doses are past their scheduled time'
        )}
        
        {renderTimelineSection(
          'Coming Up',
          groupedDoses.upcoming,
          <ClockCircleOutlined />,
          '#fa8c16',
          'Doses scheduled in the next 2 hours'
        )}
        
        {renderTimelineSection(
          'Later Today',
          groupedDoses.later,
          <ClockCircleOutlined />,
          '#1890ff',
          'Doses scheduled for later today'
        )}
        
        {renderTimelineSection(
          'Completed Today',
          groupedDoses.completed,
          <CheckCircleOutlined />,
          '#52c41a',
          'Doses that have been taken or marked as missed'
        )}
      </div>
    )
  }

  return (
    <div className="todays-doses">
      {/* View Mode Toggle */}
      <div className="view-controls">
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <div className="view-toggle">
            <Segmented
              value={viewMode}
              onChange={setViewMode}
              options={[
                {
                  label: 'Timeline',
                  value: 'timeline',
                  icon: <ClockCircleOutlined />
                },
                {
                  label: 'List',
                  value: 'list',
                  icon: <MedicineBoxOutlined />
                }
              ]}
              size="large"
            />
          </div>
          
          <Text type="secondary" size="small" className="view-description">
            {viewMode === 'timeline' 
              ? 'Organized by urgency and time periods'
              : 'Simple chronological list of all doses'
            }
          </Text>
        </Space>
      </div>

      {/* Content */}
      <div className="doses-content">
        {viewMode === 'timeline' ? renderTimelineView() : renderListView()}
      </div>

      {/* Mark Dose Modal */}
      {selectedDose && (
        <MarkDoseModal
          visible={markDoseModalVisible}
          dose={selectedDose}
          onMarkDose={handleDoseMarked}
          onClose={handleModalClose}
        />
      )}
    </div>
  )
}

export default TodaysDoses