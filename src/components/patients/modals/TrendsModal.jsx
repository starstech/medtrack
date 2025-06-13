import { useState, useEffect, useMemo } from 'react'
import { 
  Modal, 
  Button, 
  Space, 
  Typography,
  Row,
  Col,
  Select,
  Card,
  Statistic,
  Tag,
  Empty,
  DatePicker,
  Tabs,
  Alert
} from 'antd'
import { 
  LineChartOutlined,
  RiseOutlined,
  FallOutlined,
  DashboardOutlined,
  CalendarOutlined,
  BarChartOutlined,
  PieChartOutlined,
  AreaChartOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import './TrendsModal.css'

const { Title, Text } = Typography
const { RangePicker } = DatePicker
const { Option } = Select
const { TabPane } = Tabs

// Mock Chart Components (in a real app, you'd use a charting library like recharts, chart.js, etc.)
const LineChart = ({ data, title, color = '#1890ff', unit = '' }) => (
  <div className="mock-chart line-chart" style={{ borderColor: color }}>
    <div className="chart-header">
      <Text strong>{title}</Text>
    </div>
    <div className="chart-content">
      <div className="chart-line" style={{ background: `linear-gradient(45deg, ${color}20, ${color}40)` }}>
        {data && data.length > 0 ? (
          <div className="chart-points">
            {data.map((point, index) => (
              <div 
                key={index}
                className="chart-point" 
                style={{ 
                  backgroundColor: color,
                  left: `${(index / (data.length - 1)) * 100}%`,
                  top: `${100 - (point.value / Math.max(...data.map(d => d.value)) * 100)}%`
                }}
                title={`${point.date}: ${point.value}${unit}`}
              />
            ))}
          </div>
        ) : (
          <Text type="secondary">No data points</Text>
        )}
      </div>
    </div>
  </div>
)

const BarChart = ({ data, title, color = '#52c41a' }) => (
  <div className="mock-chart bar-chart" style={{ borderColor: color }}>
    <div className="chart-header">
      <Text strong>{title}</Text>
    </div>
    <div className="chart-content">
      <div className="chart-bars">
        {data && data.length > 0 ? (
          data.map((item, index) => (
            <div key={index} className="chart-bar-container">
              <div 
                className="chart-bar" 
                style={{ 
                  backgroundColor: color,
                  height: `${(item.value / Math.max(...data.map(d => d.value))) * 100}%`
                }}
                title={`${item.label}: ${item.value}`}
              />
              <Text size="small">{item.label}</Text>
            </div>
          ))
        ) : (
          <Text type="secondary">No data</Text>
        )}
      </div>
    </div>
  </div>
)

const TrendsModal = ({ visible, onClose, patient, measurements }) => {
  const [selectedTypes, setSelectedTypes] = useState(['all'])
  const [dateRange, setDateRange] = useState([dayjs().subtract(30, 'days'), dayjs()])
  const [activeTab, setActiveTab] = useState('overview')

  // Helper functions need to be defined before the useMemo hooks
  const calculateTrend = (measurements) => {
    if (measurements.length < 2) return { direction: 'stable', percentage: 0 }
    
    const recent = measurements.slice(-3).map(m => parseFloat(m.value))
    const earlier = measurements.slice(0, Math.min(3, measurements.length - 3)).map(m => parseFloat(m.value))
    
    if (earlier.length === 0) return { direction: 'stable', percentage: 0 }
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length
    const earlierAvg = earlier.reduce((a, b) => a + b, 0) / earlier.length
    
    const change = ((recentAvg - earlierAvg) / earlierAvg) * 100
    
    return {
      direction: Math.abs(change) < 5 ? 'stable' : change > 0 ? 'up' : 'down',
      percentage: Math.abs(change).toFixed(1)
    }
  }

  const getStatusColor = (type, value) => {
    // Simplified status colors based on measurement type
    const statusMap = {
      'blood_pressure_systolic': value > 140 ? 'red' : value < 90 ? 'orange' : 'green',
      'blood_pressure_diastolic': value > 90 ? 'red' : value < 60 ? 'orange' : 'green',
      'heart_rate': value > 100 ? 'orange' : value < 60 ? 'orange' : 'green',
      'temperature': value > 37.2 ? 'red' : value < 36.1 ? 'orange' : 'green',
      'blood_glucose': value > 140 ? 'orange' : value < 70 ? 'red' : 'green',
      'pain_level': value > 6 ? 'red' : value > 3 ? 'orange' : 'green',
      'mood_rating': value < 4 ? 'red' : value < 7 ? 'orange' : 'green'
    }
    
    return statusMap[type] || 'blue'
  }

  const getTrendIcon = (trend) => {
    switch (trend.direction) {
      case 'up':
        return <RiseOutlined style={{ color: '#52c41a' }} />
      case 'down':
        return <FallOutlined style={{ color: '#ff4d4f' }} />
      default:
        return <DashboardOutlined style={{ color: '#8c8c8c' }} />
    }
  }

  // Filter measurements by date range
  const filteredMeasurements = useMemo(() => {
    if (!measurements || !dateRange || dateRange.length !== 2) return measurements || []
    
    const [startDate, endDate] = dateRange
    return measurements.filter(m => {
      const measurementDate = dayjs(m.recordedAt)
      return measurementDate.isAfter(startDate) && measurementDate.isBefore(endDate.add(1, 'day'))
    })
  }, [measurements, dateRange])

  // Get available measurement types
  const availableTypes = useMemo(() => {
    const types = [...new Set(filteredMeasurements.map(m => m.type))]
    return types.map(type => ({
      value: type,
      label: type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      count: filteredMeasurements.filter(m => m.type === type).length
    }))
  }, [filteredMeasurements])

  // Process data for charts
  const processedData = useMemo(() => {
    const typesToShow = selectedTypes.includes('all') ? availableTypes.map(t => t.value) : selectedTypes
    
    const processed = {}
    
    typesToShow.forEach(type => {
      const typeMeasurements = filteredMeasurements
        .filter(m => m.type === type)
        .sort((a, b) => new Date(a.recordedAt) - new Date(b.recordedAt))
      
      processed[type] = {
        data: typeMeasurements.map(m => ({
          date: dayjs(m.recordedAt).format('MMM D'),
          value: parseFloat(m.value),
          fullDate: m.recordedAt
        })),
        latest: typeMeasurements[typeMeasurements.length - 1],
        average: typeMeasurements.reduce((sum, m) => sum + parseFloat(m.value), 0) / typeMeasurements.length,
        trend: calculateTrend(typeMeasurements),
        count: typeMeasurements.length
      }
    })
    
    return processed
  }, [filteredMeasurements, selectedTypes, availableTypes])

  const renderOverviewTab = () => (
    <div className="trends-overview">
      <Row gutter={[16, 16]}>
        {Object.entries(processedData).map(([type, data]) => (
          <Col xs={24} sm={12} lg={8} key={type}>
            <Card className="trend-summary-card">
              <div className="trend-summary-header">
                <Text strong className="trend-type-name">
                  {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Text>
                {getTrendIcon(data.trend)}
              </div>
              
              <div className="trend-summary-stats">
                <Statistic
                  value={data.latest?.value || 0}
                  precision={1}
                  valueStyle={{ 
                    fontSize: '24px',
                    color: getStatusColor(type, data.latest?.value) === 'green' ? '#52c41a' : 
                           getStatusColor(type, data.latest?.value) === 'red' ? '#ff4d4f' : '#fa8c16'
                  }}
                />
                <Text type="secondary" size="small">
                  Latest: {data.latest ? dayjs(data.latest.recordedAt).format('MMM D') : 'N/A'}
                </Text>
              </div>
              
              <div className="trend-summary-details">
                <Space size="small">
                  <Tag color="blue">{data.count} readings</Tag>
                  <Tag color={data.trend.direction === 'up' ? 'green' : data.trend.direction === 'down' ? 'red' : 'default'}>
                    {data.trend.direction === 'stable' ? 'Stable' : `${data.trend.percentage}% ${data.trend.direction}`}
                  </Tag>
                </Space>
              </div>
              
              <div className="trend-mini-chart">
                <LineChart 
                  data={data.data.slice(-7)} 
                  title=""
                  color={getStatusColor(type, data.latest?.value) === 'green' ? '#52c41a' : 
                         getStatusColor(type, data.latest?.value) === 'red' ? '#ff4d4f' : '#fa8c16'}
                />
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  )

  const renderChartsTab = () => (
    <div className="trends-charts">
      <Row gutter={[16, 16]}>
        {Object.entries(processedData).map(([type, data]) => (
          <Col xs={24} lg={12} key={type}>
            <Card title={type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}>
              <LineChart 
                data={data.data}
                title={`Trend over ${dateRange[1].diff(dateRange[0], 'days')} days`}
                color="#1890ff"
              />
              <div className="chart-stats" style={{ marginTop: 16 }}>
                <Row gutter={16}>
                  <Col span={8}>
                    <Statistic
                      title="Average"
                      value={data.average}
                      precision={1}
                      valueStyle={{ fontSize: '16px' }}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="Latest"
                      value={data.latest?.value || 0}
                      precision={1}
                      valueStyle={{ fontSize: '16px' }}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="Readings"
                      value={data.count}
                      valueStyle={{ fontSize: '16px' }}
                    />
                  </Col>
                </Row>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  )

  const renderAnalysisTab = () => {
    const analysisData = Object.entries(processedData).map(([type, data]) => ({
      type,
      ...data,
      typeName: type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    }))

    return (
      <div className="trends-analysis">
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="Measurement Frequency">
              <BarChart 
                data={analysisData.map(item => ({
                  label: item.typeName.slice(0, 10) + (item.typeName.length > 10 ? '...' : ''),
                  value: item.count
                }))}
                title="Number of Readings"
                color="#52c41a"
              />
            </Card>
          </Col>
          
          <Col xs={24} lg={12}>
            <Card title="Trend Analysis">
              <div className="trend-analysis-list">
                {analysisData.map(item => (
                  <div key={item.type} className="trend-analysis-item">
                    <div className="trend-analysis-header">
                      <Text strong>{item.typeName}</Text>
                      {getTrendIcon(item.trend)}
                    </div>
                    <div className="trend-analysis-details">
                      <Text size="small">
                        {item.trend.direction === 'stable' 
                          ? 'Values are stable with minimal variation'
                          : `${item.trend.direction === 'up' ? 'Increasing' : 'Decreasing'} trend of ${item.trend.percentage}%`
                        }
                      </Text>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </Col>
        </Row>
        
        <Row style={{ marginTop: 16 }}>
          <Col span={24}>
            <Alert
              message="Trend Analysis Notes"
              description="Trends are calculated based on the most recent 3 readings compared to earlier readings. A change of less than 5% is considered stable. These trends are for reference only and should not replace professional medical interpretation."
              type="info"
              showIcon
            />
          </Col>
        </Row>
      </div>
    )
  }

  return (
    <Modal
      title={
        <Space>
          <LineChartOutlined style={{ color: '#1890ff' }} />
          <Title level={4} style={{ margin: 0 }}>
            Measurement Trends - {patient?.name}
          </Title>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={[
        <Button
          key="close"
          onClick={onClose}
          size="large"
        >
          Close
        </Button>
      ]}
      width={1200}
      destroyOnHidden
      className="trends-modal"
      centered
    >
      <div className="trends-controls">
        <Row gutter={16} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Text strong size="small">Date Range:</Text>
              <RangePicker
                value={dateRange}
                onChange={setDateRange}
                style={{ width: '100%' }}
                size="small"
              />
            </Space>
          </Col>
          
          <Col xs={24} sm={12} md={8}>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Text strong size="small">Measurement Types:</Text>
              <Select
                mode="multiple"
                value={selectedTypes}
                onChange={setSelectedTypes}
                style={{ width: '100%' }}
                size="small"
                placeholder="Select measurement types"
              >
                <Option value="all">All Types ({filteredMeasurements.length} total)</Option>
                {availableTypes.map(type => (
                  <Option key={type.value} value={type.value}>
                    {type.label} ({type.count})
                  </Option>
                ))}
              </Select>
            </Space>
          </Col>
          
          <Col xs={24} sm={24} md={8}>
            <div className="trends-summary">
              <Text strong size="small">Summary: </Text>
              <Text size="small">
                {Object.keys(processedData).length} type(s), {filteredMeasurements.length} total readings
              </Text>
            </div>
          </Col>
        </Row>
      </div>

      {Object.keys(processedData).length === 0 ? (
        <Empty
          image={<LineChartOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />}
          description="No measurements found for the selected criteria"
          style={{ padding: '40px 0' }}
        />
      ) : (
        <Tabs activeKey={activeTab} onChange={setActiveTab} type="card">
          <TabPane 
            tab={
              <Space>
                <DashboardOutlined />
                <span>Overview</span>
              </Space>
            } 
            key="overview"
          >
            {renderOverviewTab()}
          </TabPane>
          
          <TabPane 
            tab={
              <Space>
                <AreaChartOutlined />
                <span>Charts</span>
              </Space>
            } 
            key="charts"
          >
            {renderChartsTab()}
          </TabPane>
          
          <TabPane 
            tab={
              <Space>
                <BarChartOutlined />
                <span>Analysis</span>
              </Space>
            } 
            key="analysis"
          >
            {renderAnalysisTab()}
          </TabPane>
        </Tabs>
      )}
    </Modal>
  )
}

export default TrendsModal 