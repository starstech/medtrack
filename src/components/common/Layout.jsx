import { useState } from 'react'
import { Layout as AntLayout } from 'antd'
import Header from './Header'
import Sidebar from './Sidebar'
import './Layout.css'

const { Content } = AntLayout

const Layout = ({ children }) => {
  const [sidebarVisible, setSidebarVisible] = useState(false)

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible)
  }

  const closeSidebar = () => {
    setSidebarVisible(false)
  }

  return (
    <AntLayout className="app-layout">
      <Header onMenuClick={toggleSidebar} />
      <Sidebar 
        visible={sidebarVisible} 
        onClose={closeSidebar}
      />
      <AntLayout className="main-layout">
        <Content className="main-content">
          <div className="content-wrapper">
            {children}
          </div>
        </Content>
      </AntLayout>
      
      {/* Overlay for mobile sidebar */}
      {sidebarVisible && (
        <div 
          className="sidebar-overlay mobile-only"
          onClick={closeSidebar}
        />
      )}
    </AntLayout>
  )
}

export default Layout