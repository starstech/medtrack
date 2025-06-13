import { useState, useCallback, useMemo } from 'react'
import { Form, Input, Button, Alert, Typography, Space, Card, Row, Col, Progress, Checkbox } from 'antd'
import { MailOutlined, LockOutlined, UserOutlined, LoadingOutlined, ArrowLeftOutlined, MedicineBoxOutlined, HeartOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { useAuth } from '../hooks/useAuth'
import { useNavigate, Link } from 'react-router-dom'
import './RegisterPage.css'

const { Title, Text } = Typography

const RegisterPage = () => {
  const [form] = Form.useForm()
  const { register, loading, error, clearError } = useAuth()
  const [localLoading, setLocalLoading] = useState(false)
  const [passwordValue, setPasswordValue] = useState('')
  const navigate = useNavigate()

  const handleSubmit = useCallback(async (values) => {
    setLocalLoading(true)
    clearError()
    
    const result = await register(values.email, values.password, values.name)
    
    if (result.success && result.requiresVerification) {
      // Redirect to verification pending page
      navigate(`/verify-email?mode=pending&email=${encodeURIComponent(values.email)}`, { 
        replace: true 
      })
    } else if (!result.success) {
      // Error is handled by the context
    }
    
    setLocalLoading(false)
  }, [register, clearError, navigate])

  const handlePasswordChange = useCallback((e) => {
    setPasswordValue(e.target.value)
  }, [])

  // Memoized password strength calculation
  const passwordStrength = useMemo(() => {
    if (!passwordValue) return { score: 0, text: '', color: '' }
    
    let score = 0
    if (passwordValue.length >= 8) score += 25
    if (/[a-z]/.test(passwordValue)) score += 25
    if (/[A-Z]/.test(passwordValue)) score += 25
    if (/[0-9]/.test(passwordValue)) score += 25
    
    if (score < 50) return { score, text: 'Weak', color: '#ff4d4f' }
    if (score < 75) return { score, text: 'Fair', color: '#faad14' }
    if (score < 100) return { score, text: 'Good', color: '#52c41a' }
    return { score, text: 'Strong', color: '#52c41a' }
  }, [passwordValue])

  const isLoading = loading || localLoading

  const benefits = [
    "Secure medication tracking for your family",
    "Real-time dose reminders and alerts", 
    "Health measurements and progress tracking",
    "HIPAA-compliant data protection",
    "Sync across all your devices"
  ]

  return (
    <div className="register-page">
      <div className="register-container">
        {/* Header */}
        <div className="register-header">
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/')}
            className="back-button"
          >
            Back to Home
          </Button>
          
          <div className="register-brand">
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
        <Row gutter={[48, 48]} align="middle" justify="center" className="register-content">
          <Col xs={24} lg={10}>
            <div className="register-info">
              <Space direction="vertical" size="large">
                <div>
                  <Title level={2} className="info-title">
                    Join Thousands of Families
                  </Title>
                  <Text className="info-subtitle">
                    Create your free account and start managing your family's healthcare with confidence
                  </Text>
                </div>
                
                <div className="register-benefits">
                  <Title level={4} className="benefits-title">What you'll get:</Title>
                  <div className="benefits-list">
                    {benefits.map((benefit, index) => (
                      <div key={index} className="benefit-item">
                        <CheckCircleOutlined className="benefit-icon" />
                        <Text>{benefit}</Text>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="trust-indicators">
                  <div className="trust-item">
                    <div className="trust-icon">🔒</div>
                    <div>
                      <Text strong>HIPAA Compliant</Text>
                      <br />
                      <Text type="secondary" size="small">Your data is protected</Text>
                    </div>
                  </div>
                  <div className="trust-item">
                    <div className="trust-icon">⚡</div>
                    <div>
                      <Text strong>Free Forever</Text>
                      <br />
                      <Text type="secondary" size="small">No hidden fees</Text>
                    </div>
                  </div>
                </div>
              </Space>
            </div>
          </Col>
          
          <Col xs={24} lg={14}>
            <Card className="register-card">
              <Space direction="vertical" size="large" className="register-form-container">
                <div className="form-header">
                  <Title level={3} className="form-title">Create Account</Title>
                  <Text type="secondary" className="form-subtitle">
                    Fill in your information to get started
                  </Text>
                </div>

                {error && (
                  <Alert
                    message="Registration Failed"
                    description={error}
                    type="error"
                    showIcon
                    closable
                    onClose={clearError}
                    className="register-alert"
                  />
                )}

                <Form
                  form={form}
                  name="register"
                  onFinish={handleSubmit}
                  layout="vertical"
                  size="large"
                  disabled={isLoading}
                  className="register-form"
                >
                  <Form.Item
                    name="name"
                    label="Full Name"
                    rules={[
                      {
                        required: true,
                        message: 'Please enter your full name'
                      },
                      {
                        min: 2,
                        message: 'Name must be at least 2 characters'
                      }
                    ]}
                  >
                    <Input
                      prefix={<UserOutlined />}
                      placeholder="Enter your full name"
                      autoComplete="name"
                      className="register-input"
                    />
                  </Form.Item>

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
                      className="register-input"
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
                      placeholder="Create a password (min. 6 characters)"
                      autoComplete="new-password"
                      onChange={handlePasswordChange}
                      className="register-input"
                    />
                  </Form.Item>

                  {/* Password Strength Indicator */}
                  {passwordStrength.score > 0 && (
                    <div className="password-strength">
                      <Progress
                        percent={passwordStrength.score}
                        strokeColor={passwordStrength.color}
                        showInfo={false}
                        size="small"
                      />
                      <Text size="small" style={{ color: passwordStrength.color }}>
                        Password strength: {passwordStrength.text}
                      </Text>
                    </div>
                  )}

                  <Form.Item
                    name="confirmPassword"
                    label="Confirm Password"
                    dependencies={['password']}
                    rules={[
                      {
                        required: true,
                        message: 'Please confirm your password'
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
                      placeholder="Confirm your password"
                      autoComplete="new-password"
                      className="register-input"
                    />
                  </Form.Item>

                  <Form.Item
                    name="agree"
                    valuePropName="checked"
                    rules={[
                      {
                        validator: (_, value) =>
                          value
                            ? Promise.resolve()
                            : Promise.reject(new Error('Please accept the terms and conditions'))
                      }
                    ]}
                    className="terms-checkbox"
                  >
                    <Checkbox disabled={isLoading}>
                      I agree to the{' '}
                      <a href="/terms" target="_blank" rel="noopener noreferrer">
                        Terms of Service
                      </a>{' '}
                      and{' '}
                      <a href="/privacy" target="_blank" rel="noopener noreferrer">
                        Privacy Policy
                      </a>
                    </Checkbox>
                  </Form.Item>

                  <Form.Item className="form-actions">
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={isLoading}
                      icon={isLoading ? <LoadingOutlined /> : null}
                      block
                      className="register-submit-btn"
                    >
                      {isLoading ? 'Creating Account...' : 'Create Account'}
                    </Button>
                  </Form.Item>
                </Form>

                <div className="register-divider">
                  <Text type="secondary">Already have an account?</Text>
                  <Link to="/login" className="login-link">
                    Sign in instead
                  </Link>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default RegisterPage 