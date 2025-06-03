import { useState } from 'react'
import { Row, Col, Typography, Button, Space, Input } from 'antd'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons'
import PatientList from '../components/patients/PatientList'
import AddPatientModal from '../components/patients/AddPatientModal'
import { usePatients } from '../hooks/usePatients'
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

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.medicalConditions?.some(condition => 
      condition.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  const handleAddPatient = () => {
    setAddModalVisible(true)
  }

  const handleModalClose = () => {
    setAddModalVisible(false)
  }

  return (
    <div className="patients-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="header-content">
          <Space direction="vertical" size="small">
            <Title level={2} className="page-title">
              Patients
            </Title>
            <Text type="secondary" className="page-subtitle">
              Manage and monitor your patients' care
            </Text>
          </Space>
        </div>
        
        <div className="header-actions">
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
      </div>

      {/* Search and Filters */}
      <div className="patients-controls">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={16} md={12}>
            <Search
              placeholder="Search patients by name or condition..."
              allowClear
              size="large"
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="patients-search"
            />
          </Col>
          <Col xs={24} sm={8} md={12}>
            <div className="patients-summary">
              <Text type="secondary">
                {filteredPatients.length} of {patients.length} patients
                {searchTerm && ` matching "${searchTerm}"`}
              </Text>
            </div>
          </Col>
        </Row>
      </div>

      {/* Patients List */}
      <div className="patients-content">
        <PatientList 
          patients={filteredPatients}
          searchTerm={searchTerm}
        />
      </div>

      {/* Add Patient Modal */}
      <AddPatientModal
        visible={addModalVisible}
        onClose={handleModalClose}
      />
    </div>
  )
}

export default PatientsPage