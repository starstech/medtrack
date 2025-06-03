import { useState } from 'react'
import { Typography, Button, Space, Select, Row, Col, Alert, Card, Statistic, Segmented } from 'antd'
import { 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  ExclamationCircleOutlined,
  MedicineBoxOutlined,
  EyeOutlined,
  UnorderedListOutlined
} from '@ant-design/icons'
import TodaysDoses from '../components/doses/TodaysDoses'
import { usePatients } from '../hooks/usePatients'
import LoadingSpinner from '../components/common/LoadingSpinner'
import './TodaysDosesPage.css'

const { Text } = Typography
const { Option } = Select

const TodaysDosesPage = () => {
  const { patients, loading, getTodaysDoses } = usePatients()
  const [selectedPatient, setSelectedPatient] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [viewMode, setViewMode] = useState('timeline')

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

  // Get overdue doses (pending doses past their scheduled time)
  const now = new Date()
  const overdueDoses = patientFilteredDoses.filter(dose => 
    dose.status === 'pending' && new Date(dose.scheduledTime) < now
  ).length

  const handlePatientChange = (value) => {
    setSelectedPatient(value)
  }

  const handleStatusChange = (value) => {
    setStatusFilter(value)
  }

  return (
    <div className="todays-doses-page">
      {/* Critical Alert for Overdue */}
      {overdueDoses > 0 && (
        <Alert
          message="Overdue Doses"
          description={
            <Space>
              <Text>
                {overdueDoses} dose{overdueDoses > 1 ? 's are' : ' is'} overdue and need{overdueDoses === 1 ? 's' : ''} attention.
              </Text>
            </Space>
          }
          type="warning"
          showIcon
          className="overdue-alert"
          action={
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => setStatusFilter('pending')}
              className="view-all-btn"
            >
              View Overdue
            </Button>
          }
        />
      )}

      {/* Stats Overview with View Controls */}
      {totalDoses > 0 && (
        <div className="stats-overview">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={12} sm={6} lg={4}>
              <Card className="stat-card">
                <Statistic
                  title="Completed"
                  value={takenDoses}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6} lg={4}>
              <Card className="stat-card">
                <Statistic
                  title="Pending"
                  value={pendingDoses}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6} lg={4}>
              <Card className="stat-card">
                <Statistic
                  title="Overdue"
                  value={overdueDoses}
                  prefix={<ExclamationCircleOutlined />}
                  valueStyle={{ color: '#ff4d4f' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6} lg={4}>
              <Card className="stat-card">
                <Statistic
                  title="Total"
                  value={totalDoses}
                  prefix={<MedicineBoxOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Card className="stat-card view-controls-card">
                <div className="view-controls-content">
                  <div className="view-controls-header">
                    <Text strong>View Options</Text>
                  </div>
                  <Segmented
                    value={viewMode}
                    onChange={setViewMode}
                    options={[
                      {
                        label: (
                          <Space>
                            <ClockCircleOutlined />
                            <span>Timeline</span>
                          </Space>
                        ),
                        value: 'timeline'
                      },
                      {
                        label: (
                          <Space>
                            <UnorderedListOutlined />
                            <span>List</span>
                          </Space>
                        ),
                        value: 'list'
                      }
                    ]}
                    className="view-toggle"
                  />
                  <Text type="secondary" size="small" className="view-description">
                    {viewMode === 'timeline' 
                      ? 'Organized by urgency and time periods'
                      : 'Simple chronological list of all doses'
                    }
                  </Text>
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      )}

      {/* Filters */}
      <Card className="filters-card">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8}>
            <Space direction="vertical" size={4} style={{ width: '100%' }}>
              <Text type="secondary" size="small">Patient</Text>
              <Select
                value={selectedPatient}
                onChange={handlePatientChange}
                style={{ width: '100%' }}
                placeholder="Select patient"
              >
                <Option value="all">All Patients ({allDoses.length})</Option>
                {patients.map(patient => {
                  const patientDoses = allDoses.filter(dose => dose.patient.id === patient.id)
                  return (
                    <Option key={patient.id} value={patient.id}>
                      {patient.name} ({patientDoses.length})
                    </Option>
                  )
                })}
              </Select>
            </Space>
          </Col>
          
          <Col xs={24} sm={8}>
            <Space direction="vertical" size={4} style={{ width: '100%' }}>
              <Text type="secondary" size="small">Status</Text>
              <Select
                value={statusFilter}
                onChange={handleStatusChange}
                style={{ width: '100%' }}
                placeholder="Select status"
              >
                <Option value="all">All Status</Option>
                <Option value="pending">
                  <Space>
                    <ClockCircleOutlined style={{ color: '#fa8c16' }} />
                    Pending
                  </Space>
                </Option>
                <Option value="taken">
                  <Space>
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    Taken
                  </Space>
                </Option>
                <Option value="missed">
                  <Space>
                    <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
                    Missed
                  </Space>
                </Option>
              </Select>
            </Space>
          </Col>
          
          <Col xs={24} sm={8}>
            <div className="filter-summary">
              <Text type="secondary" size="small">
                Showing {filteredDoses.length} of {totalDoses} doses
              </Text>
              {statusFilter !== 'all' && (
                <Text type="secondary" size="small"> • {statusFilter} only</Text>
              )}
            </div>
          </Col>
        </Row>
      </Card>

      {/* Doses Content */}
      <TodaysDoses 
        doses={filteredDoses}
        selectedPatient={selectedPatient}
        statusFilter={statusFilter}
        viewMode={viewMode}
      />
    </div>
  )
}

export default TodaysDosesPage