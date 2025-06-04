import React from 'react'
import { Card, Space, Typography, Tag, Button, Image, Tooltip, Avatar, Timeline } from 'antd'
import { 
  CameraOutlined, 
  EyeOutlined, 
  FileTextOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'

const { Text, Title } = Typography

// Mock daily log data with attachments
const mockLog = {
  id: 'log-demo-1',
  title: 'Medication Side Effect Observed',
  type: 'incident',
  severity: 'moderate',
  description: 'Patient reported mild nausea and dizziness 30 minutes after taking morning medication. Documented rash on left arm.',
  timestamp: dayjs().subtract(3, 'hours').toISOString(),
  recordedBy: 'Nurse Johnson',
  followUpRequired: true,
  tags: ['nausea', 'dizziness', 'rash', 'medication'],
  attachments: [
    {
      uid: 'log-photo-1',
      name: 'arm-rash-documentation.jpg',
      status: 'done',
      url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjZmZmNWY1Ii8+Cjx0ZXh0IHg9IjEyIiB5PSIxNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSI4cHgiIGZpbGw9IiNmZjRkNGYiPlJhc2gKUGhvdG88L3RleHQ+Cjwvc3ZnPg=='
    },
    {
      uid: 'log-photo-2',
      name: 'patient-symptoms-chart.jpg',
      status: 'done',
      url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjZjBmOGZmIi8+Cjx0ZXh0IHg9IjEyIiB5PSIxNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSI4cHgiIGZpbGw9IiMxODkwZmYiPkNoYXJ0CjwvdGV4dD4KPC9zdmc+'
    },
    {
      uid: 'log-photo-3',
      name: 'medication-bottle.jpg',
      status: 'done',
      url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjZjZmZmVkIi8+Cjx0ZXh0IHg9IjEyIiB5PSIxNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSI4cHgiIGZpbGw9IiM1MmM0MWEiPk1lZHM8L3RleHQ+Cjwvc3ZnPg=='
    }
  ]
}

const DailyLogAttachmentDemo = () => {
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

  const renderListView = () => (
    <div className="log-list-item">
      <div className="log-item">
        <div className="log-icon">
          <Avatar 
            icon={<FileTextOutlined />}
            style={{ backgroundColor: '#ff4d4f' }}
            size="default"
          />
        </div>
        <div className="log-primary">
          <div className="log-name-row">
            <Text strong className="log-title">
              {mockLog.title}
            </Text>
            <div className="log-tags-row">
              <Tag color="#ff4d4f" size="small">
                Incident
              </Tag>
              <Tag color="#fa8c16" size="small">
                Moderate
              </Tag>
              {mockLog.followUpRequired && (
                <Tag color="orange" size="small">
                  <ExclamationCircleOutlined />
                  Follow-up
                </Tag>
              )}
            </div>
          </div>
          
          <div className="log-details-row">
            <Text type="secondary" size="small">
              {dayjs(mockLog.timestamp).format('MMM D, YYYY h:mm A')} • by {mockLog.recordedBy} • {dayjs(mockLog.timestamp).fromNow()}
            </Text>
            {renderLogAttachments(mockLog)}
          </div>
          
          <div className="log-description">
            <Text>{mockLog.description}</Text>
          </div>

          {mockLog.tags && mockLog.tags.length > 0 && (
            <div className="log-tags">
              <Space size={4} wrap>
                {mockLog.tags.map((tag, index) => (
                  <Tag key={index} size="small" color="default">
                    {tag}
                  </Tag>
                ))}
              </Space>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderTimelineView = () => (
    <Timeline
      items={[{
        key: mockLog.id,
        dot: (
          <Avatar 
            icon={<FileTextOutlined />}
            style={{ backgroundColor: '#ff4d4f' }}
            size="small"
          />
        ),
        children: (
          <div className="timeline-log-item">
            <div className="timeline-log-header">
              <Space>
                <Title level={5} className="timeline-log-title">
                  {mockLog.title}
                </Title>
                <Tag color="#fa8c16" size="small">
                  Moderate
                </Tag>
                {mockLog.followUpRequired && (
                  <Tag color="orange" size="small">
                    Follow-up
                  </Tag>
                )}
              </Space>
            </div>
            
            <div className="timeline-log-meta">
              <Text type="secondary" size="small" className="timeline-log-time">
                {dayjs(mockLog.timestamp).format('MMM D, YYYY h:mm A')}
              </Text>
              {renderLogAttachments(mockLog)}
            </div>
            
            <div className="timeline-log-description">
              <Text>{mockLog.description}</Text>
            </div>
            
            {mockLog.tags && mockLog.tags.length > 0 && (
              <div className="timeline-log-tags">
                <Space size={4} wrap>
                  {mockLog.tags.map((tag, index) => (
                    <Tag key={index} size="small" color="default">
                      {tag}
                    </Tag>
                  ))}
                </Space>
              </div>
            )}
          </div>
        )
      }]}
      mode="left"
      className="logs-timeline"
    />
  )

  return (
    <Card
      title="📋 Daily Log Attachment Demo"
      style={{ margin: '20px', maxWidth: '800px' }}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Text strong>Example: Incident Log with Photo Documentation</Text>
          <Text type="secondary" display="block">
            Shows how attachment indicators appear in both list and timeline views
          </Text>
        </div>
        
        <div>
          <Title level={5}>📝 List View</Title>
          {renderListView()}
        </div>

        <div>
          <Title level={5}>📅 Timeline View</Title>
          {renderTimelineView()}
        </div>

        <div>
          <Text type="secondary" size="small">
            💡 <strong>Daily Log Use Cases:</strong><br/>
            • Incident documentation with photos<br/>
            • Symptom progression with visual evidence<br/>
            • Medication effects and side reactions<br/>
            • Activity tracking with reference images<br/>
            • Wound care progress documentation<br/>
            • Consistent visual style with measurements
          </Text>
        </div>
      </Space>
    </Card>
  )
}

export default DailyLogAttachmentDemo 