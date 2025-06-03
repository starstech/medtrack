import { useState } from 'react'
import { Typography, Button, Space, Select, Progress, Row, Col, Alert } from 'antd'
import { 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  ExclamationCircleOutlined,
  FilterOutlined 
} from '@ant-design/icons'
import TodaysDoses from '../components/doses/TodaysDoses'
import { usePatients } from '../hooks/usePatients'
import LoadingSpinner from '../components/common/LoadingSpinner'
import dayjs from 'dayjs'
import './TodaysDosesPage.css'

const { Title, Text } = Typography
const { Option } = Select

const TodaysDosesPage = () => {
  const { patients, loading, getTodaysDoses } = usePatients()
  const [selectedPatient, setSelectedPatient] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  if (loading) {
    return <LoadingSpinner message="Loading today's doses..." />
  }

  const allDoses = getTodaysDoses()
  
  // Filter by patient
  const patientFilteredDoses = selectedPatient === 'all' 
    ? allDoses 
    : allDoses.filter(dose => dose.patient.id === selectedPatient)

  // Filter by status
  const filteredDoses = statusFilter === 'all'
    ? patientFilteredDoses
    : patientFilteredDoses.filter(dose => dose.status === statusFilter)

  // Calculate statistics
  const totalDoses = patientFilteredDoses.length
  const takenDoses = patientFilteredDoses.filter(dose => dose.status === 'taken').length
  const pendingDoses = patientFilteredDoses.filter(dose => dose.status === 'pending').length
  const missedDoses = patientFilteredDoses.filter(dose => dose.status === 'missed').length
  
  const completionPercentage = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 0

  // Get overdue doses (pending doses past their scheduled time)
  const now = new Date()
  const overdueDoses = patientFilteredDoses.filter(dose => 
    dose.status === 'pending' && new Date(dose.scheduledTime) < now
  ).length

  const getProgressColor = () => {
    if (completionPercentage >= 80) return '#52c41a'
    if (completionPercentage >= 60) return '#fa8c16'
    return '#ff4d4f'
  }

  const handlePatientChange = (value) => {
    setSelectedPatient(value)
  }

  const handleStatusChange = (value) => {
    setStatusFilter(value)
  }

  return (
    <div className="todays-doses-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="header-content">
          <Space direction="vertical" size="small">
            <Title level={2} className="page-title">
              Today's Doses
            </Title>
            <Text type="secondary" className="page-subtitle">
              {dayjs().format('dddd, MMMM D, YYYY')}
            </Text>
          </Space>
        </div>
      </div>

      {/* Progress Overview */}
      {totalDoses > 0 && (
        <div className="doses-overview">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <div className="progress-section">
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <div className="progress-header">
                    <Text strong>Today's Progress</Text>
                    <Text type="secondary">
                      {takenDoses} of {totalDoses} doses completed
                    </Text>
                  </div>
                  <Progress
                    percent={completionPercentage}
                    strokeColor={getProgressColor()}
                    size="default"
                    format={(percent) => `${percent}%`}
                  />
                </Space>
              </div>
            </Col>
            
            <Col xs={24} md={12}>
              <Row gutter={[12, 12]}>
                <Col span={8}>
                  <div className="stat-mini">
                    <CheckCircleOutlined className="stat-icon success" />
                    <div className="stat-content">
                      <Text strong className="stat-number">{takenDoses}</Text>
                      <Text type="secondary" size="small">Taken</Text>
                    </div>
                  </div>
                </Col>
                <Col span={8}>
                  <div className="stat-mini">
                    <ClockCircleOutlined className="stat-icon warning" />
                    <div className="stat-content">
                      <Text strong className="stat-number">{pendingDoses}</Text>
                      <Text type="secondary" size="small">Pending</Text>
                    </div>
                  </div>
                </Col>
                <Col span={8}>
                  <div className="stat-mini">
                    <ExclamationCircleOutlined className="stat-icon danger" />
                    <div className="stat-content">
                      <Text strong className="stat-number">{overdueDoses}</Text>
                      <Text type="secondary" size="small">Overdue</Text>
                    </div>
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>
        </div>
      )}

      {/* Overdue Alert */}
      {overdueDoses > 0 && (
        <Alert
          message={`${overdueDoses} dose${overdueDoses > 1 ? 's' : ''} overdue`}
          description="Some doses are past their scheduled time. Please review and mark as taken or missed."
          type="warning"
          showIcon
          className="overdue-alert"
        />
      )}

      {/* Filters */}
      <div className="doses-filters">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Space>
              <FilterOutlined />
              <Text strong>Filters:</Text>
            </Space>
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              value={selectedPatient}
              onChange={handlePatientChange}
              style={{ width: '100%' }}
              size="large"
            >
              <Option value="all">All Patients</Option>
              {patients.map(patient => (
                <Option key={patient.id} value={patient.id}>
                  {patient.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              value={statusFilter}
              onChange={handleStatusChange}
              style={{ width: '100%' }}
              size="large"
            >
              <Option value="all">All Status</Option>
              <Option value="pending">Pending</Option>
              <Option value="taken">Taken</Option>
              <Option value="missed">Missed</Option>
            </Select>
          </Col>
          <Col xs={24} sm={24} md={8}>
            <div className="filter-summary">
              <Text type="secondary">
                Showing {filteredDoses.length} of {totalDoses} doses
              </Text>
            </div>
          </Col>
        </Row>
      </div>

      {/* Doses List */}
      <div className="doses-content">
        <TodaysDoses 
          doses={filteredDoses}
          selectedPatient={selectedPatient}
          statusFilter={statusFilter}
        />
      </div>
    </div>
  )
}

export default TodaysDosesPage