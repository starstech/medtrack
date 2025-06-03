import { Layout, Button, Badge, Avatar, Dropdown, Typography } from 'antd'
import { 
  MenuOutlined, 
  BellOutlined, 
  UserOutlined,
  LogoutOutlined,
  SettingOutlined
} from '@ant-design/icons'
import { useAuth } from '../../hooks/useAuth'
import { useNotifications } from '../../hooks/useNotifications'
import { useNavigate, useLocation } from 'react-router-dom'

const { Header: AntHeader } = Layout
const { Text } = Typography

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth()
  const { getUnreadCount } = useNotifications()
  const navigate = useNavigate()
  const location = useLocation()

  const unreadCount = getUnreadCount()

  // Get page title based on current route
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Dashboard'
      case '/patients':
        return 'Patients'
      case '/todays-doses':
        return "Today's Doses"
      case '/calendar':
        return 'Calendar'
      case '/profile':
        return 'Profile'
      default:
        if (location.pathname.startsWith('/patients/')) {
          return 'Patient Details'
        }
        return 'MedTracker'
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const userMenuItems = [
    {
      key: 'profile',
      icon: <SettingOutlined />,
      label: 'Profile & Settings',
      onClick: () => navigate('/profile')
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout
    }
  ]

  return (
    <AntHeader className="app-header">
      <div className="header-left">
        <Button
          type="text"
          icon={<MenuOutlined />}
          onClick={onMenuClick}
          className="menu-button"
          size="large"
        />
        <div className="header-title">
          <Text strong className="page-title">
            {getPageTitle()}
          </Text>
        </div>
      </div>

      <div className="header-right">
        <Badge count={unreadCount} size="small">
          <Button
            type="text"
            icon={<BellOutlined />}
            className="notification-button"
            size="large"
          />
        </Badge>

        <Dropdown
          menu={{ items: userMenuItems }}
          placement="bottomRight"
          arrow
        >
          <Button
            type="text"
            className="user-button"
            size="large"
          >
            <Avatar 
              size="small" 
              icon={<UserOutlined />}
            />
            <span className="desktop-only user-name">
              {user?.name || 'User'}
            </span>
          </Button>
        </Dropdown>
      </div>
    </AntHeader>
  )
}

export default Header