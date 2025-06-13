import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Card, Form, Input, Button, Alert, Typography, Space, message, Row, Col } from 'antd'
import { LockOutlined, CheckCircleOutlined, MedicineBoxOutlined, HeartOutlined, ArrowLeftOutlined, LoadingOutlined } from '@ant-design/icons'
import { supabase } from '../lib/supabase'
import './LoginPage.css' // Reuse the login page styles

const { Title, Text } = Typography

const ResetPasswordPage = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const handlePasswordReset = async () => {
      console.log('Reset password handler started', { searchParams: Object.fromEntries(searchParams) })
      
      // Check for PKCE flow code parameter (newer format)
      const code = searchParams.get('code')
      
      if (code) {
        console.log('Found code parameter, attempting PKCE flow', { code })
        try {
          // Exchange the code for a session using PKCE flow
          const { data, error } = await supabase.auth.exchangeCodeForSession(code)
          
          console.log('PKCE exchange result', { data: !!data, error })
          
          if (error) {
            console.error('PKCE exchange error:', error)
            setError(`Invalid reset link: ${error.message}`)
            return
          }
          
          if (data.session) {
            console.log('PKCE session established successfully')
            // Session is automatically set by Supabase
            setSessionReady(true)
            // Clean up the URL
            window.history.replaceState(null, '', window.location.pathname)
            return
          }
        } catch (error) {
          console.error('PKCE flow error:', error)
          setError('Failed to process reset link. Please try again.')
          return
        }
      }
      
      // Fallback: Check for legacy token format (access_token/refresh_token)
      let accessToken = searchParams.get('access_token')
      let refreshToken = searchParams.get('refresh_token')
      
      // If not found in query params, check hash fragments
      if (!accessToken || !refreshToken) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        accessToken = hashParams.get('access_token')
        refreshToken = hashParams.get('refresh_token')
      }
      
      if (accessToken && refreshToken) {
        try {
          // Set the session with the tokens from the URL (legacy format)
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })
          
          if (error) {
            setError(`Invalid reset link: ${error.message}`)
            return
          }
          
          setSessionReady(true)
          // Clean up the URL
          if (window.location.hash) {
            window.history.replaceState(null, '', window.location.pathname)
          }
          return
        } catch (error) {
          setError('Failed to process reset link. Please try again.')
          return
        }
      }
      
      // No valid reset parameters found
      setError('Invalid reset link. Please request a new password reset.')
    }

    handlePasswordReset()
  }, [searchParams])

  const handleSubmit = useCallback(async (values) => {
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.updateUser({
        password: values.password
      })

      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
        message.success('Password updated successfully!')
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login', { replace: true })
        }, 3000)
      }
    } catch (error) {
      setError('Failed to update password. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [navigate])

  const handleBackToLogin = useCallback(() => {
    navigate('/login')
  }, [navigate])

  if (success) {
    return (
      <div className="login-page">
        <div className="login-container">
          {/* Header */}
          <div className="login-header">
            <Button 
              type="text" 
              icon={<ArrowLeftOutlined />} 
              onClick={handleBackToLogin}
              className="back-button"
            >
              Back to Login
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

          {/* Success Content */}
          <Row gutter={[48, 48]} align="middle" justify="center" className="login-content">
            <Col xs={24} lg={14}>
              <Card className="login-card">
                <Space direction="vertical" size="large" className="login-form-container">
                  <div className="form-header" style={{ textAlign: 'center' }}>
                    <CheckCircleOutlined style={{ fontSize: 64, color: '#52c41a', marginBottom: 16 }} />
                    <Title level={3} className="form-title" style={{ color: '#52c41a' }}>
                      Password Updated!
                    </Title>
                    <Text type="secondary" className="form-subtitle">
                      Your password has been successfully updated.
                    </Text>
                  </div>
                  
                  <div style={{ textAlign: 'center' }}>
                    <Text type="secondary">
                      Redirecting you to the login page...
                    </Text>
                  </div>
                  
                  <Button
                    type="primary"
                    onClick={handleBackToLogin}
                    block
                    className="login-submit-btn"
                  >
                    Continue to Login
                  </Button>
                </Space>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="login-page">
        <div className="login-container">
          {/* Header */}
          <div className="login-header">
            <Button 
              type="text" 
              icon={<ArrowLeftOutlined />} 
              onClick={handleBackToLogin}
              className="back-button"
            >
              Back to Login
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

          {/* Error Content */}
          <Row gutter={[48, 48]} align="middle" justify="center" className="login-content">
            <Col xs={24} lg={14}>
              <Card className="login-card">
                <Space direction="vertical" size="large" className="login-form-container">
                  <div className="form-header">
                    <Title level={3} className="form-title">Reset Link Invalid</Title>
                    <Text type="secondary" className="form-subtitle">
                      There was an issue with your password reset link
                    </Text>
                  </div>

                  <Alert
                    message="Reset Failed"
                    description={error}
                    type="error"
                    showIcon
                    className="login-alert"
                  />

                  <Button
                    type="primary"
                    onClick={handleBackToLogin}
                    block
                    className="login-submit-btn"
                  >
                    Back to Login
                  </Button>
                </Space>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    )
  }

  if (!sessionReady) {
    return (
      <div className="login-page">
        <div className="login-container">
          {/* Header */}
          <div className="login-header">
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

          {/* Loading Content */}
          <Row gutter={[48, 48]} align="middle" justify="center" className="login-content">
            <Col xs={24} lg={14}>
              <Card className="login-card">
                <Space direction="vertical" size="large" className="login-form-container">
                  <div className="form-header" style={{ textAlign: 'center' }}>
                    <LoadingOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
                    <Title level={3} className="form-title">Processing Reset Link</Title>
                    <Text type="secondary" className="form-subtitle">
                      Please wait while we verify your reset link...
                    </Text>
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    )
  }

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Header */}
        <div className="login-header">
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            onClick={handleBackToLogin}
            className="back-button"
          >
            Back to Login
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
                    Reset Your Password
                  </Title>
                  <Text className="info-subtitle">
                    Enter your new password below to secure your account
                  </Text>
                </div>
                
                <div className="login-features">
                  <div className="feature-item">
                    <div className="feature-icon">🔒</div>
                    <div>
                      <Text strong>Secure Reset</Text>
                      <br />
                      <Text type="secondary">Your link is encrypted and secure</Text>
                    </div>
                  </div>
                  
                  <div className="feature-item">
                    <div className="feature-icon">⚡</div>
                    <div>
                      <Text strong>Instant Access</Text>
                      <br />
                      <Text type="secondary">Immediate access after reset</Text>
                    </div>
                  </div>
                  
                  <div className="feature-item">
                    <div className="feature-icon">🛡️</div>
                    <div>
                      <Text strong>Account Protection</Text>
                      <br />
                      <Text type="secondary">Keep your data safe and secure</Text>
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
                  <Title level={3} className="form-title">Set New Password</Title>
                  <Text type="secondary" className="form-subtitle">
                    Choose a strong password for your account
                  </Text>
                </div>

                <Form
                  form={form}
                  name="resetPassword"
                  onFinish={handleSubmit}
                  layout="vertical"
                  size="large"
                  disabled={loading}
                  className="login-form"
                >
                  <Form.Item
                    name="password"
                    label="New Password"
                    rules={[
                      {
                        required: true,
                        message: 'Please enter your new password'
                      },
                      {
                        min: 6,
                        message: 'Password must be at least 6 characters'
                      }
                    ]}
                  >
                    <Input.Password
                      prefix={<LockOutlined />}
                      placeholder="Enter your new password"
                      autoComplete="new-password"
                      className="login-input"
                    />
                  </Form.Item>

                  <Form.Item
                    name="confirmPassword"
                    label="Confirm New Password"
                    dependencies={['password']}
                    rules={[
                      {
                        required: true,
                        message: 'Please confirm your new password'
                      },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('password') === value) {
                            return Promise.resolve()
                          }
                          return Promise.reject(new Error('Passwords do not match'))
                        }
                      })
                    ]}
                  >
                    <Input.Password
                      prefix={<LockOutlined />}
                      placeholder="Confirm your new password"
                      autoComplete="new-password"
                      className="login-input"
                    />
                  </Form.Item>

                  <Form.Item className="form-actions">
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      icon={loading ? <LoadingOutlined /> : null}
                      block
                      className="login-submit-btn"
                    >
                      {loading ? 'Updating Password...' : 'Update Password'}
                    </Button>
                  </Form.Item>
                </Form>

                <div className="login-divider">
                  <Text type="secondary">Remember your password?</Text>
                  <Button 
                    type="link" 
                    onClick={handleBackToLogin}
                    disabled={loading}
                    className="register-link"
                    style={{ padding: 0, height: 'auto', marginLeft: 8 }}
                  >
                    Back to Login
                  </Button>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default ResetPasswordPage 