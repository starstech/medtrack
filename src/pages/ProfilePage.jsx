import { Typography, Tabs, Card } from 'antd'
import { 
  UserOutlined, 
  BellOutlined, 
  TeamOutlined,
  SecurityScanOutlined 
} from '@ant-design/icons'
import ProfileSettings from '../components/profile/ProfileSettings'
import CaregiverManagement from '../components/profile/CaregiverManagement'
import NotificationSettings from '../components/profile/NotificationSettings'
import { useAuth } from '../hooks/useAuth'
import LoadingSpinner from '../components/common/LoadingSpinner'
import './ProfilePage.css'

const { Title, Text } = Typography

const ProfilePage = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner message="Loading profile..." />
  }

  const tabItems = [
    {
      key: 'profile',
      label: (
        <span>
          <UserOutlined />
          <span className="tab-label">Profile</span>
        </span>
      ),
      children: <ProfileSettings user={user} />
    },
    {
      key: 'notifications',
      label: (
        <span>
          <BellOutlined />
          <span className="tab-label">Notifications</span>
        </span>
      ),
      children: <NotificationSettings />
    },
    {
      key: 'caregivers',
      label: (
        <span>
          <TeamOutlined />
          <span className="tab-label">Caregivers</span>
        </span>
      ),
      children: <CaregiverManagement />
    }
  ]

  return (
    <div className="profile-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="header-content">
          <Title level={2} className="page-title">
            Profile & Settings
          </Title>
          <Text type="secondary" className="page-subtitle">
            Manage your account, notifications, and caregiver network
          </Text>
        </div>
      </div>

      {/* Profile Overview Card */}
      <Card className="profile-overview-card" bodyStyle={{ padding: '24px' }}>
        <div className="profile-overview">
          <div className="profile-avatar">
            <div className="avatar-placeholder">
              <UserOutlined />
            </div>
          </div>
          
          <div className="profile-info">
            <Title level={3} className="profile-name">
              {user?.name || 'User'}
            </Title>
            <Text type="secondary" className="profile-email">
              {user?.email}
            </Text>
            <Text type="secondary" size="small" className="profile-role">
              {user?.role === 'caregiver' ? 'Caregiver' : 'Patient'} • Member since {
                user?.joinedAt ? new Date(user.joinedAt).toLocaleDateString() : 'Unknown'
              }
            </Text>
          </div>
        </div>
      </Card>

      {/* Settings Tabs */}
      <div className="profile-tabs-container">
        <Tabs
          defaultActiveKey="profile"
          items={tabItems}
          size="large"
          className="profile-tabs"
          tabPosition="top"
        />
      </div>
    </div>
  )
}

export default ProfilePage