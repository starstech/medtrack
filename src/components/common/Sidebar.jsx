import { Drawer, Menu, Typography, Divider } from 'antd'
import {
  DashboardOutlined,
  UserOutlined,
  MedicineBoxOutlined,
  CalendarOutlined,
  SettingOutlined,
  HeartOutlined
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { usePatients } from '../../hooks/usePatients'

const { Text } = Typography

const Sidebar = ({ visible, onClose }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { patients, selectedPatient } = usePatients()

  const handleMenuClick = (path) => {
    navigate(path)
    onClose() // Close sidebar on mobile after navigation
  }

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      onClick: () => handleMenuClick('/')
    },
    {
      key: '/patients',
      icon: <UserOutlined />,
      label: 'Patients',
      onClick: () => handleMenuClick('/patients')
    },
    {
      key: '/todays-doses',
      icon: <MedicineBoxOutlined />,
      label: "Today's Doses",
      onClick: () => handleMenuClick('/todays-doses')
    },
    {
      key: '/calendar',
      icon: <CalendarOutlined />,
      label: 'Calendar',
      onClick: () => handleMenuClick('/calendar')
    },
    {
      key: '/profile',
      icon: <SettingOutlined />,
      label: 'Profile & Settings',
      onClick: () => handleMenuClick('/profile')
    }
  ]

  const sidebarContent = (
    <div className="sidebar-content">
      {/* App Brand */}
      <div className="sidebar-header">
        <div className="app-brand">
          <HeartOutlined className="brand-icon" />
          <div className="brand-text">
            <Text strong className="brand-title">MedTracker</Text>
            <Text type="secondary" className="brand-subtitle">Caregiver Hub</Text>
          </div>
        </div>
      </div>

      <Divider style={{ margin: '16px 0' }} />

      {/* Current Patient Info */}
      {selectedPatient && (
        <>
          <div className="current-patient">
            <Text type="secondary" className="current-patient-label">
              Current Patient
            </Text>
            <div className="patient-info">
              <UserOutlined className="patient-icon" />
              <div>
                <Text strong>{selectedPatient.name}</Text>
                <br />
                <Text type="secondary" size="small">
                  Age {selectedPatient.age}
                </Text>
              </div>
            </div>
          </div>
          <Divider style={{ margin: '16px 0' }} />
        </>
      )}

      {/* Navigation Menu */}
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        className="sidebar-menu"
        inlineIndent={16}
      />

      {/* Patient Summary */}
      {patients.length > 0 && (
        <>
          <Divider style={{ margin: '16px 0' }} />
          <div className="patient-summary">
            <Text type="secondary" className="summary-label">
              Quick Stats
            </Text>
            <div className="summary-stats">
              <div className="stat-item">
                <Text strong>{patients.length}</Text>
                <Text type="secondary" size="small">Patients</Text>
              </div>
              <div className="stat-item">
                <Text strong>
                  {patients.reduce((acc, patient) => {
                    return acc + (patient.medications?.filter(med => med.isActive)?.length || 0)
                  }, 0)}
                </Text>
                <Text type="secondary" size="small">Active Meds</Text>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )

  return (
    <>
      {/* Mobile Drawer */}
      <Drawer
        title={null}
        placement="left"
        onClose={onClose}
        open={visible}
        className="mobile-sidebar mobile-only"
        width={280}
        bodyStyle={{ padding: 0 }}
        closable={false}
      >
        {sidebarContent}
      </Drawer>

      {/* Desktop Sidebar */}
      <div className="desktop-sidebar desktop-only">
        {sidebarContent}
      </div>
    </>
  )
}

export default Sidebar