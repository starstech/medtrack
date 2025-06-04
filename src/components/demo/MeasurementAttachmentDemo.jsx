import React from 'react'
import { Card, Space, Typography, Tag, Button, Image, Tooltip } from 'antd'
import { 
  CameraOutlined, 
  EyeOutlined, 
  HeartOutlined, 
  RiseOutlined,
  DropboxOutlined 
} from '@ant-design/icons'
import dayjs from 'dayjs'

const { Text } = Typography

// Mock measurement data with attachments
const mockMeasurement = {
  id: 'demo-1',
  type: 'blood_glucose',
  value: 125,
  unit: 'mg/dL',
  recordedAt: dayjs().subtract(2, 'hours').toISOString(),
  recordedBy: 'Dr. Smith',
  notes: 'Post-meal reading, patient feeling normal',
  attachments: [
    {
      uid: 'photo-1',
      name: 'glucose-meter-reading.jpg',
      status: 'done',
      url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjZjBmMGYwIi8+Cjx0ZXh0IHg9IjEyIiB5PSIxNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSI4cHgiIGZpbGw9IiM5OTkiPkdsdWNvc2UKTWV0ZXI8L3RleHQ+Cjwvc3ZnPg=='
    },
    {
      uid: 'photo-2',
      name: 'test-strip.jpg',
      status: 'done',
      url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjZTZmN2ZmIi8+Cjx0ZXh0IHg9IjEyIiB5PSIxNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSI4cHgiIGZpbGw9IiMxODkwZmYiPlRlc3QKU3RyaXA8L3RleHQ+Cjwvc3ZnPg=='
    }
  ]
}

const MeasurementAttachmentDemo = () => {
  const renderMeasurementAttachments = (measurement) => {
    if (!measurement.attachments || measurement.attachments.length === 0) {
      return null
    }

    const attachments = measurement.attachments.filter(att => att.status === 'done')
    if (attachments.length === 0) return null

    return (
      <div className="measurement-attachments">
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

  return (
    <Card
      title="📸 Measurement Attachment Demo"
      style={{ margin: '20px', maxWidth: '600px' }}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Text strong>Example: Blood Glucose Measurement with Photos</Text>
          <Text type="secondary" display="block">
            Shows how device readings and test strips appear in the measurement list
          </Text>
        </div>
        
        <div className="measurement-list-item">
          <div className="measurement-item">
            <div className="measurement-icon">
              <DropboxOutlined style={{ color: '#ff4d4f', fontSize: '20px' }} />
            </div>
            <div className="measurement-primary">
              <div className="measurement-name-row">
                <Text strong className="measurement-name">
                  Blood Glucose
                </Text>
                <div className="measurement-value">
                  <Text strong className="value-text">
                    {mockMeasurement.value} {mockMeasurement.unit}
                  </Text>
                  <Tag color="orange" size="small" className="measurement-status">
                    Elevated
                  </Tag>
                  <span className="trend-info">
                    <RiseOutlined style={{ color: '#52c41a', fontSize: '12px' }} />
                    <Text 
                      size="small" 
                      style={{ 
                        color: '#52c41a',
                        fontSize: '11px',
                        marginLeft: '4px'
                      }}
                    >
                      8.5%
                    </Text>
                  </span>
                </div>
              </div>
              
              <div className="measurement-details-row">
                <Text type="secondary" size="small">
                  {dayjs(mockMeasurement.recordedAt).format('MMM D, YYYY h:mm A')} • by {mockMeasurement.recordedBy}
                </Text>
                {renderMeasurementAttachments(mockMeasurement)}
              </div>
              
              {mockMeasurement.notes && (
                <div className="measurement-notes">
                  <Text size="small" type="secondary">
                    {mockMeasurement.notes}
                  </Text>
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <Text type="secondary" size="small">
            💡 <strong>How it works:</strong><br/>
            • Subtle camera icon shows photos are attached<br/>
            • Small thumbnails provide quick preview<br/>
            • Click any image to view full-size with zoom<br/>
            • Responsive design adapts to mobile screens<br/>
            • Maintains clean, medical-focused interface
          </Text>
        </div>
      </Space>
    </Card>
  )
}

export default MeasurementAttachmentDemo 