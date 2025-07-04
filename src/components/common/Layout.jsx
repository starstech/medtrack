import React, { useState, useEffect, useCallback } from 'react'
import { Layout, Menu, Button, Avatar, Dropdown, Space, Typography, Badge, Alert } from 'antd'
import { 
  MenuUnfoldOutlined, 
  MenuFoldOutlined,
  DashboardOutlined,
  UserOutlined,
  MedicineBoxOutlined,
  CalendarOutlined,
  SettingOutlined,
  LogoutOutlined,
  HeartOutlined,
  BellOutlined
} from '@ant-design/icons'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { usePatients } from '../../hooks/usePatients'
import { useNotifications } from '../../hooks/useNotifications'
import './Layout.css'

const { Header, Sider, Content } = Layout
const { Text } = Typography

const AppLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false)
  const [offline, setOffline] = useState(!navigator.onLine)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { getUnreadCount } = useNotifications()
  const { selectedPatient, patients } = usePatients()

  useEffect(() => {
    const handleOnline = () => setOffline(false)
    const handleOffline = () => setOffline(true)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/patients',
      icon: <UserOutlined />,
      label: 'Patients',
    },
    {
      key: '/todays-doses',
      icon: <MedicineBoxOutlined />,
      label: "Today's Doses",
    },
    {
      key: '/calendar',
      icon: <CalendarOutlined />,
      label: 'Calendar',
    },
    {
      key: '/profile',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
  ]

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Sign Out',
      onClick: () => logout()
    }
  ]

  const handleMenuClick = useCallback(({ key }) => {
    navigate(key)
  }, [navigate])

  const handleCollapse = useCallback((collapsed) => {
    setCollapsed(collapsed)
  }, [])

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
        return 'Settings'
      default:
        if (location.pathname.startsWith('/patients/')) {
          return selectedPatient ? selectedPatient.name : 'Patient Details'
        }
        return 'MedTracker'
    }
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {offline && (
        <Alert
          message="You are offline. Any changes will sync automatically once connection is restored."
          type="warning"
          banner
          style={{ textAlign: 'center' }}
        />
      )}
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={handleCollapse} 
        width={280}
        className="custom-menu"
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflow: 'hidden',
          background: '#fff',
          borderRight: '1px solid #f0f0f0',
          boxShadow: '2px 0 8px rgba(0, 0, 0, 0.05)'
        }}
        trigger={null}
      >
        {/* Logo Section */}
        <div style={{ 
          padding: '12px 20px', 
          borderBottom: '1px solid #f5f5f5',
          display: 'flex', 
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          background: '#fff'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #1890ff, #722ed1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(24, 144, 255, 0.25)'
          }}>
            <HeartOutlined style={{ 
              color: '#fff', 
              fontSize: '20px' 
            }} />
          </div>
          {!collapsed && (
            <div style={{ marginLeft: '16px' }}>
              <Text strong style={{ 
                fontSize: '18px', 
                color: '#1890ff',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #1890ff, #722ed1)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                MedTrack
              </Text>
            </div>
          )}
        </div>

        {/* Menu */}
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          onClick={handleMenuClick}
          items={menuItems}
          style={{ 
            border: 'none',
            background: '#fff',
            padding: '8px 0'
          }}
        />
      </Sider>

      <Layout>
        {/* Header */}
        <Header style={{ 
          padding: '0 24px', 
          background: '#fff', 
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 4px rgba(0, 0, 0, 0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: '16px',
                width: 64,
                height: 64,
              }}
            />
            <Typography.Title level={3} style={{ 
              margin: 0, 
              marginLeft: '16px',
              color: '#2d3748',
              fontWeight: 600
            }}>
              {getPageTitle()}
            </Typography.Title>
          </div>

          <Space size="middle">
            {/* Notifications */}
            <Badge count={getUnreadCount()} offset={[-2, 2]}>
              <Button 
                type="text" 
                icon={<BellOutlined />}
                onClick={() => navigate('/notifications')}
                style={{
                  fontSize: '18px',
                  width: '44px',
                  height: '44px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              />
            </Badge>

            {/* User Menu */}
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              trigger={['click']}
            >
              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  cursor: 'pointer',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  transition: 'background-color 0.3s',
                  minHeight: '48px',
                  gap: '12px'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                <Avatar 
                  style={{ 
                    backgroundColor: '#1890ff',
                    color: '#fff',
                    fontWeight: 600,
                    flexShrink: 0
                  }} 
                  size="default"
                >
                  {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                </Avatar>
                <div style={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  minWidth: 0,
                  overflow: 'hidden'
                }}>
                  <Text strong style={{ 
                    fontSize: '14px', 
                    lineHeight: '1.4',
                    margin: 0,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '120px'
                  }}>
                    {user?.name || 'User'}
                  </Text>
                  <Text type="secondary" style={{ 
                    fontSize: '12px', 
                    lineHeight: '1.2',
                    margin: 0,
                    whiteSpace: 'nowrap'
                  }}>
                    {user?.role || 'Caregiver'}
                  </Text>
                </div>
              </div>
            </Dropdown>
          </Space>
        </Header>

        {/* Content */}
        <Content style={{ 
          padding: '24px',
          background: '#f5f7fa',
          minHeight: 'calc(100vh - 64px)',
          overflow: 'auto'
        }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  )
}

export default AppLayout