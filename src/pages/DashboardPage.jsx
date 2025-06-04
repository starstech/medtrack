import { Row, Col, Typography, Space, Card } from 'antd'
import StatsCards from '../components/dashboard/StatsCards'
import { PatientDropdown } from '../components/dashboard/PatientSelector'
import RecentActivity from '../components/dashboard/RecentActivity'
import MedicationOverview from '../components/dashboard/MedicationOverview'
import { usePatients } from '../hooks/usePatients'
import { useAuth } from '../hooks/useAuth'
import LoadingSpinner from '../components/common/LoadingSpinner'
import './DashboardPage.css'

const { Title, Text } = Typography

const DashboardPage = () => {
  const { user } = useAuth()
  const { patients, selectedPatient, loading } = usePatients()

  if (loading) {
    return <LoadingSpinner />
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <Space direction="vertical" size={16}>
          <Space direction="vertical" size={4}>
            <Title level={2} className="dashboard-title">
              {getGreeting()}, {user?.name || 'Caregiver'}!
            </Title>
            <Text type="secondary" className="dashboard-subtitle">
              {selectedPatient
                ? `Managing care for ${selectedPatient.name}`
                : `You're caring for ${patients.length} patient${patients.length !== 1 ? 's' : ''}`
              }
            </Text>
          </Space>
          <PatientDropdown />
        </Space>
      </div>

      <div className="dashboard-stats">
        <StatsCards />
      </div>

      <Row gutter={[24, 24]} className="dashboard-content">
        <Col xs={24} lg={16}>
          <RecentActivity />
        </Col>

        <Col xs={24} lg={8}>
          <MedicationOverview />
        </Col>
      </Row>
    </div>
  )
}

export default DashboardPage