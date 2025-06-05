import { useParams, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { Button, Tabs, Typography } from 'antd'
import { 
  ArrowLeftOutlined,
  UserOutlined, 
  BellOutlined, 
  TeamOutlined,
  SecurityScanOutlined,
  SettingOutlined 
} from '@ant-design/icons'
import ProfileSettings from '../components/profile/ProfileSettings'
import CaregiverManagement from '../components/profile/CaregiverManagement'
import NotificationSettings from '../components/profile/NotificationSettings'
import MeasurementPreferences from '../components/preferences/MeasurementPreferences'
import { useAuth } from '../hooks/useAuth'
import LoadingSpinner from '../components/common/LoadingSpinner'
import './ProfilePage.css'

const { Title, Text } = Typography

const ProfilePage = () => {
  const navigate = useNavigate()
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner message="Loading profile..." />
  }

  const handleBack = () => {
    navigate('/')
  }

  const tabItems = [
    {
      key: 'profile',
      label: 'Profile',
      children: <ProfileSettings user={user} />
    },
    {
      key: 'measurements',
      label: 'Measurement Settings',
      children: <MeasurementPreferences patientId={user?.patient_id || user?.id} />
    },
    {
      key: 'notifications',
      label: 'Notifications',
      children: <NotificationSettings />
    },
    {
      key: 'caregivers',
      label: 'Caregivers',
      children: <CaregiverManagement />
    }
  ]

  return (
    <div className="profile-page">
      {/* Quick Actions Bar */}
      <div className="profile-actions-bar">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={handleBack}
          className="back-button"
          size="small"
        >
          Back
        </Button>
      </div>

      {/* Profile Tabs */}
      <div className="profile-tabs-container">
        <Tabs
          defaultActiveKey="profile"
          items={tabItems}
          className="profile-tabs"
        />
      </div>
    </div>
  )
}

export default ProfilePage