import { useState } from 'react'
import { Row, Col, Typography, Button, Space, Input, Card, Statistic, Avatar } from 'antd'
import { PlusOutlined, SearchOutlined, UserOutlined, MedicineBoxOutlined, CalendarOutlined, HeartOutlined } from '@ant-design/icons'
import PatientList from '../components/patients/PatientList'
import AddPatientModal from '../components/patients/AddPatientModal'
import { usePatients } from '../hooks/usePatients'
import { mockPatients, mockMedications, getUpcomingAppointments } from '../utils/mockData'
import LoadingSpinner from '../components/common/LoadingSpinner'
import './PatientsPage.css'

const { Title, Text } = Typography
const { Search } = Input

const PatientsPage = () => {
  const { patients, loading } = usePatients()
  const [searchTerm, setSearchTerm] = useState('')
  const [addModalVisible, setAddModalVisible] = useState(false)

  if (loading) {
    return <LoadingSpinner message="Loading patients..." />
  }

  // Use mock data for now
  const allPatients = mockPatients
  
  const filteredPatients = allPatients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.medicalConditions?.some(condition => 
      condition.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  // Calculate stats
  const totalPatients = allPatients.length
  const activeMedications = mockMedications.filter(med => med.isActive).length
  const upcomingAppointments = getUpcomingAppointments(7).length
  const criticalPatients = allPatients.filter(patient => 
    patient.medicalConditions?.some(condition => 
      ['Diabetes Type 2', 'Hypertension', 'Asthma'].includes(condition)
    )
  ).length

  const handleAddPatient = () => {
    setAddModalVisible(true)
  }

  const handleModalClose = () => {
    setAddModalVisible(false)
  }

  return (
    <div className="patients-page">
      {/* Page Header */}
      <div className="patients-header">
        <Row gutter={[24, 24]} align="top" justify="space-between">
          <Col xs={24} lg={16}>
            <Space direction="vertical" size={4}>
              <Title level={2} className="patients-title">
                Patient Management
              </Title>
              <Text type="secondary" className="patients-subtitle">
                Monitor and manage care for {totalPatients} patient{totalPatients !== 1 ? 's' : ''}
              </Text>
            </Space>
          </Col>
          <Col xs={24} lg={8}>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddPatient}
                size="large"
                className="add-patient-btn"
              >
                Add Patient
              </Button>
            </div>
          </Col>
        </Row>
      </div>

      {/* Stats Overview */}
      <div className="patients-stats">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card className="stat-card" bordered={false}>
              <Statistic
                title="Total Patients"
                value={totalPatients}
                prefix={<UserOutlined className="stat-icon" style={{ color: '#1890ff' }} />}
                valueStyle={{ color: '#1890ff', fontSize: '28px', fontWeight: '600' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="stat-card" bordered={false}>
              <Statistic
                title="Active Medications"
                value={activeMedications}
                prefix={<MedicineBoxOutlined className="stat-icon" style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a', fontSize: '28px', fontWeight: '600' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="stat-card" bordered={false}>
              <Statistic
                title="Upcoming Appointments"
                value={upcomingAppointments}
                prefix={<CalendarOutlined className="stat-icon" style={{ color: '#fa8c16' }} />}
                valueStyle={{ color: '#fa8c16', fontSize: '28px', fontWeight: '600' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="stat-card" bordered={false}>
              <Statistic
                title="Critical Conditions"
                value={criticalPatients}
                prefix={<HeartOutlined className="stat-icon" style={{ color: '#ff4d4f' }} />}
                valueStyle={{ color: '#ff4d4f', fontSize: '28px', fontWeight: '600' }}
              />
            </Card>
          </Col>
        </Row>
      </div>

      {/* Search and Controls */}
      <Card className="patients-controls-card" bordered={false}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={16}>
            <Search
              placeholder="Search patients by name or medical condition..."
              allowClear
              size="large"
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="patients-search"
            />
          </Col>
          <Col xs={24} md={8}>
            <div className="search-summary">
              <Text type="secondary">
                {searchTerm ? (
                  <>
                    <Text strong>{filteredPatients.length}</Text> of <Text strong>{totalPatients}</Text> patients
                    {` matching "${searchTerm}"`}
                  </>
                ) : (
                  <>
                    Showing <Text strong>all {totalPatients}</Text> patients
                  </>
                )}
              </Text>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Patients List */}
      <Card className="patients-list-card" bordered={false}>
        <PatientList 
          patients={filteredPatients}
          searchTerm={searchTerm}
        />
      </Card>

      {/* Add Patient Modal */}
      <AddPatientModal
        visible={addModalVisible}
        onClose={handleModalClose}
      />
    </div>
  )
}

export default PatientsPage