import { useState, useMemo } from 'react'
import { List, Empty, Typography, Space, Button, Card, Segmented } from 'antd'
import { 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  ExclamationCircleOutlined,
  MedicineBoxOutlined,
  UnorderedListOutlined,
  CalendarOutlined,
  SmileOutlined
} from '@ant-design/icons'
import DoseCard from './DoseCard'
import MarkDoseModal from './MarkDoseModal'
import { usePatients } from '../../hooks/usePatients'
import dayjs from 'dayjs'
import './TodaysDoses.css'

const { Text, Title } = Typography

const TodaysDoses = ({ doses, selectedPatient, statusFilter, viewMode }) => {
  const { markDose } = usePatients()
  const [selectedDose, setSelectedDose] = useState(null)
  const [markDoseModalVisible, setMarkDoseModalVisible] = useState(false)

  // Group doses by time periods for timeline view
  const groupedDoses = useMemo(() => {
    if (viewMode !== 'timeline') return { all: doses }
    
    const now = dayjs()
    const groups = {
      overdue: [],
      upcoming: [],
      later: [],
      completed: []
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

  const renderTimelineSection = (sectionKey, sectionDoses, title, icon, color) => {
    if (!sectionDoses || sectionDoses.length === 0) return null

    return (
      <div className={`timeline-section timeline-section-${sectionKey}`} key={sectionKey}>
        <div className="section-header">
          <Space>
            <span className="section-icon" style={{ color }}>
              {icon}
            </span>
            <Title level={5} className="section-title">
              {title} ({sectionDoses.length})
            </Title>
          </Space>
        </div>
        
        <div className="section-content">
          {sectionDoses.map((dose) => (
            <div key={`${dose.medication.id}-${dose.id}`} className="dose-list-item">
              <DoseCard
                dose={dose}
                onMarkDose={handleMarkDose}
                showPatient={selectedPatient === 'all'}
              />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderListView = () => {
    if (doses.length === 0) {
      return (
        <div className="empty-state">
          <Empty
            image={<MedicineBoxOutlined className="empty-icon" />}
            imageStyle={{ fontSize: 64, color: '#d9d9d9' }}
            description={
              <div>
                <Text type="secondary">No doses scheduled for today</Text>
                <br />
                <Text type="secondary" size="small">
                  {selectedPatient === 'all' 
                    ? 'All patients are up to date'
                    : 'This patient has no scheduled doses'
                  }
                </Text>
              </div>
            }
          />
        </div>
      )
    }

    return (
      <div className="doses-list">
        {doses.map((dose) => (
          <div key={`${dose.medication.id}-${dose.id}`} className="dose-list-item">
            <DoseCard
              dose={dose}
              onMarkDose={handleMarkDose}
              showPatient={selectedPatient === 'all'}
            />
          </div>
        ))}
      </div>
    )
  }

  const renderTimelineView = () => {
    const hasAnyDoses = Object.values(groupedDoses).some(group => group && group.length > 0)
    
    if (!hasAnyDoses) {
      return (
        <div className="empty-state">
          <Empty
            image={<CalendarOutlined className="empty-icon" />}
            imageStyle={{ fontSize: 64, color: '#d9d9d9' }}
            description={
              <div>
                <Text type="secondary">No doses found</Text>
                <br />
                <Text type="secondary" size="small">
                  Try adjusting your filters to see more results
                </Text>
              </div>
            }
          />
        </div>
      )
    }

    return (
      <div className="timeline-view">
        {renderTimelineSection('overdue', groupedDoses.overdue, 'Overdue', <ExclamationCircleOutlined />, '#ff4d4f')}
        {renderTimelineSection('upcoming', groupedDoses.upcoming, 'Coming Up', <ClockCircleOutlined />, '#fa8c16')}
        {renderTimelineSection('later', groupedDoses.later, 'Later Today', <ClockCircleOutlined />, '#1890ff')}
        {renderTimelineSection('completed', groupedDoses.completed, 'Completed', <CheckCircleOutlined />, '#52c41a')}
      </div>
    )
  }

  return (
    <div className="todays-doses">
      {/* Content Container */}
      <div className="doses-container">
        <div className="doses-content">
          {viewMode === 'timeline' ? renderTimelineView() : renderListView()}
        </div>
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