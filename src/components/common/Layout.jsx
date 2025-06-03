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
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed} width={200}>
        <div style={{ height: 32, margin: 16, display: 'flex', alignItems: 'center' }}>
          <HeartOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
          {!collapsed && <Title level={4} style={{ margin: '0 0 0 8px' }}>MedTracker</Title>}
        </div>
        <Menu theme="dark" mode="inline" selectedKeys={[location.pathname]} onClick={handleMenuClick} items={menuItems} />
      </Sider>
      <Layout>
        <Header style={{ padding: '0 16px', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <Button type="text" icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} onClick={() => setCollapsed(!collapsed)} />
            <Title level={4} style={{ margin: 0 }}>{getPageTitle()}</Title>
          </Space>
          <Space>
            <Badge count={getUnreadCount()}>
              <Button type="text" icon={<BellOutlined />} />
            </Badge>
            <Dropdown menu={{ items: userMenuItems }}>
              <Space style={{ cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} />
                <Text>{user?.name || 'User'}</Text>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        <Content style={{ margin: '16px', padding: '24px', background: '#fff' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  )
}

export default AppLayout