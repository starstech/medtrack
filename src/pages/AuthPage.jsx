import { useState } from 'react'
import { Card, Tabs, Typography, Space } from 'antd'
import { HeartOutlined } from '@ant-design/icons'
import LoginForm from '../components/auth/LoginForm'
import RegisterForm from '../components/auth/RegisterForm'
import './AuthPage.css'

const { Title, Text } = Typography

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState('login')

  const tabItems = [
    {
      key: 'login',
      label: 'Login',
      children: <LoginForm />
    },
    {
      key: 'register',
      label: 'Register',
      children: <RegisterForm />
    }
  ]

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Header */}
        <div className="auth-header">
          <Space direction="vertical" align="center" size="large">
            <div className="auth-brand">
              <HeartOutlined className="auth-brand-icon" />
              <Title level={1} className="auth-brand-title">
                MedTracker
              </Title>
            </div>
            <Text type="secondary" className="auth-subtitle">
              Your family's medication management hub
            </Text>
          </Space>
        </div>

        {/* Auth Card */}
        <Card className="auth-card" bordered={false}>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            centered
            size="large"
            items={tabItems}
            className="auth-tabs"
          />
        </Card>

        {/* Footer */}
        <div className="auth-footer">
          <Text type="secondary" size="small">
            Securely manage medications, track doses, and coordinate care
            <br />
            for your loved ones - all in one place.
          </Text>
        </div>
      </div>
    </div>
  )
}

export default AuthPage