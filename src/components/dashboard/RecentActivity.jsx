import { Card, List, Avatar, Tag, Typography, Space, Button, Empty } from 'antd'
import { 
  MedicineBoxOutlined,
  ExperimentOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  EyeOutlined
} from '@ant-design/icons'
import { usePatients } from '../../hooks/usePatients'
import { LOG_TYPES, SEVERITY_LEVELS } from '../../utils/mockData'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

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
            icon: <CheckCircleOutlined />,
            color: '#52c41a',
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
        color: '#1890ff',
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
        color: logType?.color || '#8c8c8c',
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

  const getActivityAvatar = (activity) => {
    return (
      <Avatar 
        icon={activity.icon} 
        style={{ backgroundColor: activity.color }}
        size="default"
      />
    )
  }

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

  return (
    <Card 
      className="recent-activity-card"
      title={
        <Space>
          <ClockCircleOutlined />
          <Title level={4} style={{ margin: 0 }}>
            Recent Activity
          </Title>
        </Space>
      }
      extra={
        activities.length > 0 && (
          <Button 
            type="link" 
            icon={<EyeOutlined />}
            onClick={handleViewMore}
            size="small"
          >
            View All
          </Button>
        )
      }
      bodyStyle={{ padding: '16px' }}
    >
      {activities.length === 0 ? (
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
          style={{ padding: '24px 0' }}
        >
          <Button type="primary" onClick={handleViewMore}>
            {selectedPatient ? 'Add Activity' : 'View Patients'}
          </Button>
        </Empty>
      ) : (
        <List
          dataSource={activities}
          renderItem={(activity) => (
            <List.Item className="activity-item">
              <List.Item.Meta
                avatar={getActivityAvatar(activity)}
                title={
                  <Space size="small" wrap>
                    <Text strong className="activity-title">
                      {activity.title}
                    </Text>
                    {!selectedPatient && (
                      <Tag size="small" color="blue">
                        {activity.patient?.name}
                      </Tag>
                    )}
                    {activity.severity && (
                      <Tag 
                        size="small" 
                        color={activity.severityColor}
                      >
                        {activity.severity}
                      </Tag>
                    )}
                    {activity.followUpRequired && (
                      <Tag size="small" color="orange">
                        Follow-up needed
                      </Tag>
                    )}
                  </Space>
                }
                description={
                  <Space direction="vertical" size="small">
                    <Text type="secondary" className="activity-description">
                      {activity.description}
                    </Text>
                    {activity.notes && (
                      <Text type="secondary" size="small" italic>
                        Note: {activity.notes}
                      </Text>
                    )}
                    <Text type="secondary" size="small">
                      {formatTimestamp(activity.timestamp)}
                    </Text>
                  </Space>
                }
              />
            </List.Item>
          )}
          size="small"
        />
      )}
    </Card>
  )
}

export default RecentActivity