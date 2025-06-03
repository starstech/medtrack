import { Card, List, Avatar, Tag, Typography, Space, Button, Empty, Timeline, theme } from 'antd'
import { 
  MedicineBoxOutlined,
  ExperimentOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  RightOutlined
} from '@ant-design/icons'
import { usePatients } from '../../hooks/usePatients'
import { LOG_TYPES, SEVERITY_LEVELS } from '../../utils/mockData'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import './RecentActivity.css'

dayjs.extend(relativeTime)

const { Text, Title } = Typography

const RecentActivity = () => {
  const { 
    selectedPatient, 
    medications, 
    measurements, 
    dailyLogs, 
    patients 
  } = usePatients()
  const navigate = useNavigate()
  const { token: { colorPrimary, colorSuccess, colorWarning, colorInfo, borderRadius } } = theme.useToken()

  // Combine all activities and sort by timestamp
  const getAllActivities = () => {
    const activities = []

    // Filter data based on selected patient
    const filteredMedications = selectedPatient 
      ? medications.filter(med => med.patientId === selectedPatient.id)
      : medications
    const filteredMeasurements = selectedPatient
      ? measurements.filter(measure => measure.patientId === selectedPatient.id)
      : measurements
    const filteredLogs = selectedPatient
      ? dailyLogs.filter(log => log.patientId === selectedPatient.id)
      : dailyLogs

    // Add medication doses
    filteredMedications.forEach(medication => {
      const patient = patients.find(p => p.id === medication.patientId)
      medication.doses?.forEach(dose => {
        if (dose.status === 'taken') {
          activities.push({
            id: `dose-${dose.id}`,
            type: 'dose',
            timestamp: dose.takenAt,
            title: `Dose taken: ${medication.name}`,
            description: `${medication.dosage} ${medication.form}`,
            patient: patient,
            icon: <MedicineBoxOutlined />,
            color: colorSuccess,
            notes: dose.notes
          })
        }
      })
    })

    // Add measurements
    filteredMeasurements.forEach(measurement => {
      const patient = patients.find(p => p.id === measurement.patientId)
      activities.push({
        id: `measurement-${measurement.id}`,
        type: 'measurement',
        timestamp: measurement.recordedAt,
        title: `${measurement.type.replace('_', ' ')} recorded`,
        description: `${measurement.value} ${measurement.unit}`,
        patient: patient,
        icon: <ExperimentOutlined />,
        color: colorPrimary,
        notes: measurement.notes
      })
    })

    // Add daily logs
    filteredLogs.forEach(log => {
      const patient = patients.find(p => p.id === log.patientId)
      const logType = LOG_TYPES.find(type => type.value === log.type)
      const severityLevel = SEVERITY_LEVELS.find(level => level.value === log.severity)
      
      activities.push({
        id: `log-${log.id}`,
        type: 'log',
        timestamp: log.timestamp,
        title: log.title,
        description: log.description.length > 100 
          ? `${log.description.substring(0, 100)}...` 
          : log.description,
        patient: patient,
        icon: <FileTextOutlined />,
        color: logType?.color || colorInfo,
        severity: log.severity,
        severityColor: severityLevel?.color,
        logType: log.type,
        followUpRequired: log.followUpRequired
      })
    })

    // Sort by timestamp (most recent first)
    return activities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10) // Show only last 10 activities
  }

  const activities = getAllActivities()

  const formatTimestamp = (timestamp) => {
    return dayjs(timestamp).fromNow()
  }

  const handleViewMore = () => {
    if (selectedPatient) {
      navigate(`/patients/${selectedPatient.id}`)
    } else {
      navigate('/patients')
    }
  }

  if (activities.length === 0) {
    return (
      <div className="empty-activity">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <Text type="secondary">
              {selectedPatient 
                ? `No recent activity for ${selectedPatient.name}`
                : 'No recent activity found'
              }
            </Text>
          }
        >
          <Button type="primary" onClick={handleViewMore} size="large">
            {selectedPatient ? 'Add Activity' : 'View Patients'}
          </Button>
        </Empty>
      </div>
    )
  }

  return (
    <div className="recent-activity">
      <div className="activity-header">
        <Space>
          <ClockCircleOutlined />
          <Text strong style={{ fontSize: '16px' }}>Recent Activity</Text>
        </Space>
        <Button 
          type="text"
          icon={<EyeOutlined />}
          onClick={handleViewMore}
          className="view-all-btn"
        >
          View All
        </Button>
      </div>

      <Timeline
        className="activity-timeline"
        items={activities.map(activity => ({
          color: activity.color,
          dot: (
            <Avatar 
              icon={activity.icon}
              style={{ 
                backgroundColor: activity.color,
                border: '2px solid #fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
              size="small"
            />
          ),
          children: (
            <div className="timeline-item">
              <div className="timeline-content">
                <div className="timeline-header">
                  <Space size={8} wrap>
                    <Text strong className="activity-title">
                      {activity.title}
                    </Text>
                    {!selectedPatient && (
                      <Tag 
                        color="blue"
                        style={{ 
                          borderRadius: '12px',
                          padding: '0 8px'
                        }}
                      >
                        {activity.patient?.name}
                      </Tag>
                    )}
                    {activity.severity && (
                      <Tag 
                        color={activity.severityColor}
                        style={{ 
                          borderRadius: '12px',
                          padding: '0 8px'
                        }}
                      >
                        {activity.severity}
                      </Tag>
                    )}
                  </Space>
                  <Text type="secondary" className="activity-time">
                    {formatTimestamp(activity.timestamp)}
                  </Text>
                </div>
                
                <Text type="secondary" className="activity-description">
                  {activity.description}
                </Text>

                {activity.notes && (
                  <div className="activity-notes">
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {activity.notes}
                    </Text>
                  </div>
                )}
              </div>

              <Button 
                type="text" 
                size="small"
                icon={<RightOutlined />}
                className="timeline-action"
                onClick={() => {
                  if (activity.patient) {
                    navigate(`/patients/${activity.patient.id}`)
                  }
                }}
              />
            </div>
          )
        }))}
      />
    </div>
  )
}

export default RecentActivity