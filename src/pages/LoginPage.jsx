import { useState, useCallback } from 'react'
import { Form, Input, Button, Alert, Typography, Space, Modal, message, Card, Row, Col } from 'antd'
import { MailOutlined, LockOutlined, LoadingOutlined, ArrowLeftOutlined, MedicineBoxOutlined, HeartOutlined } from '@ant-design/icons'
import { useAuth } from '../hooks/useAuth'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './LoginPage.css'

const { Title, Text } = Typography

const LoginPage = () => {
  const [form] = Form.useForm()
  const [resetForm] = Form.useForm()
  const { login, loading, error, clearError } = useAuth()
  const [localLoading, setLocalLoading] = useState(false)
  const [resetModalVisible, setResetModalVisible] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = useCallback(async (values) => {
    setLocalLoading(true)
    clearError()
    
    const result = await login(values.email, values.password)
    
    if (!result.success) {
      // Error is handled by the context
    }
    
    setLocalLoading(false)
  }, [login, clearError])

  const handleForgotPassword = useCallback(async (values) => {
    setResetLoading(true)
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: `${window.location.origin}/reset-password`
      })
      
      if (error) {
        message.error(`Failed to send reset email: ${error.message}`)
      } else {
        message.success('Password reset email sent! Please check your inbox.')
        setResetModalVisible(false)
        resetForm.resetFields()
      }
    } catch (error) {
      message.error('Failed to send reset email. Please try again.')
    } finally {
      setResetLoading(false)
    }
  }, [resetForm])

  const handleResetModalOpen = useCallback(() => {
    setResetModalVisible(true)
  }, [])

  const handleResetModalClose = useCallback(() => {
    setResetModalVisible(false)
    resetForm.resetFields()
  }, [resetForm])

  const isLoading = loading || localLoading

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Header */}
        <div className="login-header">
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/')}
            className="back-button"
          >
            Back to Home
          </Button>
          
          <div className="login-brand">
            <Space align="center" size="middle">
              <div className="brand-icon-container">
                <MedicineBoxOutlined className="brand-icon" />
                <HeartOutlined className="brand-heart" />
              </div>
              <Title level={2} className="brand-title">MedTrack</Title>
            </Space>
          </div>
        </div>

        {/* Main Content */}
        <Row gutter={[48, 48]} align="middle" justify="center" className="login-content">
          <Col xs={24} lg={10}>
            <div className="login-info">
              <Space direction="vertical" size="large">
                <div>
                  <Title level={2} className="info-title">
                    Welcome Back
                  </Title>
                  <Text className="info-subtitle">
                    Sign in to continue managing your family's healthcare with confidence
                  </Text>
                </div>
                
                <div className="login-features">
                  <div className="feature-item">
                    <div className="feature-icon">📋</div>
                    <div>
                      <Text strong>Medication Tracking</Text>
                      <br />
                      <Text type="secondary">Never miss a dose again</Text>
                    </div>
                  </div>
                  
                  <div className="feature-item">
                    <div className="feature-icon">💊</div>
                    <div>
                      <Text strong>Smart Reminders</Text>
                      <br />
                      <Text type="secondary">Timely notifications for your family</Text>
                    </div>
                  </div>
                  
                  <div className="feature-item">
                    <div className="feature-icon">📱</div>
                    <div>
                      <Text strong>Sync Everywhere</Text>
                      <br />
                      <Text type="secondary">Access from any device, anytime</Text>
                    </div>
                  </div>
                </div>
              </Space>
            </div>
          </Col>
          
          <Col xs={24} lg={14}>
            <Card className="login-card">
              <Space direction="vertical" size="large" className="login-form-container">
                <div className="form-header">
                  <Title level={3} className="form-title">Sign In</Title>
                  <Text type="secondary" className="form-subtitle">
                    Enter your credentials to access your account
                  </Text>
                </div>

                {error && (
                  <Alert
                    message="Sign In Failed"
                    description={error}
                    type="error"
                    showIcon
                    closable
                    onClose={clearError}
                    className="login-alert"
                  />
                )}

                <Form
                  form={form}
                  name="login"
                  onFinish={handleSubmit}
                  layout="vertical"
                  size="large"
                  disabled={isLoading}
                  className="login-form"
                >
                  <Form.Item
                    name="email"
                    label="Email Address"
                    rules={[
                      {
                        required: true,
                        message: 'Please enter your email address'
                      },
                      {
                        type: 'email',
                        message: 'Please enter a valid email address'
                      }
                    ]}
                  >
                    <Input
                      prefix={<MailOutlined />}
                      placeholder="Enter your email"
                      autoComplete="email"
                      className="login-input"
                    />
                  </Form.Item>

                  <Form.Item
                    name="password"
                    label="Password"
                    rules={[
                      {
                        required: true,
                        message: 'Please enter your password'
                      },
                      {
                        min: 6,
                        message: 'Password must be at least 6 characters'
                      }
                    ]}
                  >
                    <Input.Password
                      prefix={<LockOutlined />}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      className="login-input"
                    />
                  </Form.Item>

                  <div className="form-footer">
                    <Button
                      type="link"
                      onClick={handleResetModalOpen}
                      disabled={isLoading}
                      className="forgot-password-link"
                    >
                      Forgot your password?
                    </Button>
                  </div>

                  <Form.Item className="form-actions">
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={isLoading}
                      icon={isLoading ? <LoadingOutlined /> : null}
                      block
                      className="login-submit-btn"
                    >
                      {isLoading ? 'Signing In...' : 'Sign In'}
                    </Button>
                  </Form.Item>
                </Form>

                <div className="login-divider">
                  <Text type="secondary">Don't have an account?</Text>
                  <Link to="/register" className="register-link">
                    Create one now
                  </Link>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Password Reset Modal */}
      <Modal
        title="Reset Password"
        open={resetModalVisible}
        onCancel={handleResetModalClose}
        footer={null}
        destroyOnClose
        className="reset-modal"
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Text type="secondary">
            Enter your email address and we'll send you a link to reset your password.
          </Text>
          
          <Form
            form={resetForm}
            onFinish={handleForgotPassword}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="email"
              label="Email Address"
              rules={[
                {
                  required: true,
                  message: 'Please enter your email address'
                },
                {
                  type: 'email',
                  message: 'Please enter a valid email address'
                }
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="Enter your email"
                autoComplete="email"
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button 
                  onClick={handleResetModalClose}
                  disabled={resetLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={resetLoading}
                >
                  Send Reset Link
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Space>
      </Modal>
    </div>
  )
}

export default LoginPage 