import React, { useState } from 'react'
import { Layout, Menu, Button, Avatar, Badge, Dropdown, Typography, Space } from 'antd'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  UserOutlined,
  MedicineBoxOutlined,
  CalendarOutlined,
  SettingOutlined,
  HeartOutlined,
  BellOutlined,
  LogoutOutlined
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useNotifications } from '../../hooks/useNotifications'
import { usePatients } from '../../hooks/usePatients'

const { Header, Sider, Content } = Layout
const { Title, Text } = Typography

const AppLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false)
  
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const { getUnreadCount } = useNotifications()
  const { selectedPatient, patients } = usePatients()

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
      label: 'Sign Out',
      onClick: logout
    }
  ]

  const handleMenuClick = ({ key }) => {
    navigate(key)
  }

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
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={setCollapsed} 
        width={240}
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
          padding: '24px 20px', 
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
              fontSize: '20px', 
              color: '#fff'
            }} />
          </div>
          {!collapsed && (
            <Title level={3} style={{ 
              margin: '0 0 0 16px', 
              background: 'linear-gradient(135deg, #1890ff, #722ed1)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 700
            }}>
              MedTracker
            </Title>
          )}
        </div>

        {/* Menu */}
        <div style={{ padding: '16px 0' }}>
          <Menu 
            mode="inline" 
            selectedKeys={[location.pathname]} 
            onClick={handleMenuClick} 
            items={menuItems}
            style={{
              background: 'transparent',
              border: 'none'
            }}
          />
        </div>

        {/* Custom Menu Styles */}
        <style jsx>{`
          .ant-menu-inline .ant-menu-item {
            margin: 4px 16px !important;
            border-radius: 8px !important;
            height: 44px !important;
            line-height: 44px !important;
            padding: 0 16px !important;
            transition: all 0.3s ease !important;
            color: rgba(0, 0, 0, 0.65) !important;
            font-weight: 500 !important;
          }
          
          .ant-menu-inline .ant-menu-item:hover {
            background: rgba(24, 144, 255, 0.08) !important;
            color: #1890ff !important;
            transform: translateX(4px) !important;
          }
          
          .ant-menu-inline .ant-menu-item-selected {
            background: linear-gradient(135deg, rgba(24, 144, 255, 0.1), rgba(114, 46, 209, 0.1)) !important;
            color: #1890ff !important;
            font-weight: 600 !important;
            border-right: 3px solid #1890ff !important;
          }
          
          .ant-menu-inline .ant-menu-item-selected:hover {
            background: linear-gradient(135deg, rgba(24, 144, 255, 0.15), rgba(114, 46, 209, 0.15)) !important;
          }
          
          .ant-menu .ant-menu-item .ant-menu-item-icon {
            font-size: 18px !important;
            margin-right: 12px !important;
            transition: all 0.3s ease !important;
          }
          
          .ant-menu-inline .ant-menu-item:hover .ant-menu-item-icon,
          .ant-menu-inline .ant-menu-item-selected .ant-menu-item-icon {
            color: #1890ff !important;
            transform: scale(1.1) !important;
          }
          
          .ant-layout-sider-collapsed .ant-menu-inline .ant-menu-item {
            margin: 4px 12px !important;
            padding: 0 !important;
            justify-content: center !important;
            text-align: center !important;
          }
          
          .ant-layout-sider-collapsed .ant-menu .ant-menu-item .ant-menu-item-icon {
            margin-right: 0 !important;
          }
        `}</style>
      </Sider>
      
      <Layout>
        <Header style={{ 
          position: 'sticky', 
          top: 0, 
          zIndex: 100, 
          padding: '0 24px', 
          background: '#fff', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <Space>
            <Button 
              type="text" 
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} 
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: '16px',
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                transition: 'all 0.3s ease'
              }}
            />
            <Title level={4} style={{ 
              margin: 0,
              background: 'linear-gradient(135deg, #1890ff, #722ed1)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 600
            }}>
              {getPageTitle()}
            </Title>
          </Space>
          <Space>
            <Badge count={getUnreadCount()}>
              <Button 
                type="text" 
                icon={<BellOutlined />}
                style={{
                  fontSize: '16px',
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease'
                }}
              />
            </Badge>
            <Dropdown menu={{ items: userMenuItems }}>
              <Space style={{ 
                cursor: 'pointer',
                padding: '8px 12px',
                borderRadius: '8px',
                transition: 'all 0.3s ease'
              }}>
                <Avatar 
                  icon={<UserOutlined />}
                  style={{
                    background: 'linear-gradient(135deg, #1890ff, #722ed1)',
                    boxShadow: '0 2px 8px rgba(24, 144, 255, 0.3)'
                  }}
                />
                <Text style={{ fontWeight: 500 }}>{user?.name || 'User'}</Text>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        <Content style={{ 
          margin: '24px', 
          padding: '32px', 
          background: '#fff',
          borderRadius: '16px',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
          border: '1px solid #f0f0f0'
        }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  )
}

export default AppLayout