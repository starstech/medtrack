import { useState, useCallback, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { Card, Form, Input, Button, Alert, Typography, Space, message, Row, Col } from 'antd'
import { LockOutlined, SafetyCertificateOutlined, MedicineBoxOutlined, HeartOutlined, ArrowLeftOutlined, LoadingOutlined, MailOutlined } from '@ant-design/icons'
import { supabase } from '../../lib/supabase'
import '../../pages/LoginPage.css' // Reuse the login page styles

const { Title, Text } = Typography

const PasswordResetCodeEntry = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState('code') // 'code' or 'password'
  const [resetCode, setResetCode] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()

  // Don't auto-redirect authenticated users - they need to login after password reset

  // Check if we already have a code from URL
  useEffect(() => {
    const codeFromUrl = searchParams.get('code')
    if (codeFromUrl && codeFromUrl.length === 6 && /^\d{6}$/.test(codeFromUrl)) {
      // If it's a 6-digit numeric code, pre-fill it but don't auto-verify
      form.setFieldsValue({ code: codeFromUrl })
      // Clean up the URL
      window.history.replaceState(null, '', window.location.pathname)
    }
  }, [searchParams, form])

  const handleCodeSubmit = useCallback(async (values) => {
    setLoading(true)
    setError('')

    try {
      console.log('Submitting verification:', { email: values.email, code: values.code })
      console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL)
      
      // Verify the OTP code for password reset
      const { data, error } = await supabase.auth.verifyOtp({
        email: values.email,
        token: values.code,
        type: 'recovery'
      })
      
      console.log('Verification response:', { data: !!data, error })
      
      if (error) {
        console.error('Verification error:', error)
        setError('Invalid or expired reset code. Please request a new password reset.')
        return
      }
      
      if (data.session) {
        console.log('Verification successful, session established')
        setResetCode(values.code)
        setStep('password')
        message.success('Code verified! Now set your new password.')
      }
    } catch (error) {
      console.error('Verification exception:', error)
      setError('Failed to verify code. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  const handlePasswordSubmit = useCallback(async (values) => {
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.updateUser({
        password: values.password
      })

      if (error) {
        setError(error.message)
      } else {
        message.success('Password updated successfully! Please log in with your new password.')
        
        // Sign out the user so they have to log in again
        await supabase.auth.signOut()
        
        // Redirect to login page
        setTimeout(() => {
          navigate('/login', { replace: true })
        }, 1500)
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

  const handleBackToCode = useCallback(() => {
    setStep('code')
    setResetCode('')
    setError('')
    form.resetFields()
  }, [form])

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Header */}
        <div className="login-header">
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            onClick={step === 'code' ? handleBackToLogin : handleBackToCode}
            className="back-button"
          >
            {step === 'code' ? 'Back to Login' : 'Back to Code Entry'}
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
                    {step === 'code' ? 'Enter Reset Code' : 'Set New Password'}
                  </Title>
                  <Text className="info-subtitle">
                    {step === 'code' 
                      ? 'Enter your email address and the 6-digit code to verify your identity'
                      : 'Choose a strong password for your account'
                    }
                  </Text>
                </div>
                
                <div className="login-features">
                  <div className="feature-item">
                    <div className="feature-icon">📧</div>
                    <div>
                      <Text strong>Check Your Email</Text>
                      <br />
                      <Text type="secondary">Look for the reset code in your inbox</Text>
                    </div>
                  </div>
                  
                  <div className="feature-item">
                    <div className="feature-icon">🔒</div>
                    <div>
                      <Text strong>Secure Process</Text>
                      <br />
                      <Text type="secondary">Your code expires in 1 hour</Text>
                    </div>
                  </div>
                  
                  <div className="feature-item">
                    <div className="feature-icon">⚡</div>
                    <div>
                      <Text strong>Quick Reset</Text>
                      <br />
                      <Text type="secondary">Get back to your account fast</Text>
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
                  <Title level={3} className="form-title">
                    {step === 'code' ? 'Verify Reset Code' : 'Set New Password'}
                  </Title>
                  <Text type="secondary" className="form-subtitle">
                    {step === 'code' 
                      ? 'Enter your email address and the verification code sent to your inbox'
                      : 'Your code has been verified. Set your new password below.'
                    }
                  </Text>
                </div>

                {error && (
                  <Alert
                    message={step === 'code' ? 'Code Verification Failed' : 'Password Update Failed'}
                    description={error}
                    type="error"
                    showIcon
                    className="login-alert"
                  />
                )}

                {step === 'code' ? (
                  <Form
                    form={form}
                    name="verifyCode"
                    onFinish={handleCodeSubmit}
                    layout="vertical"
                    size="large"
                    disabled={loading}
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
                        placeholder="Enter your email address"
                        autoComplete="email"
                        className="login-input"
                      />
                    </Form.Item>

                    <Form.Item
                      name="code"
                      label="Reset Code"
                      rules={[
                        {
                          required: true,
                          message: 'Please enter your reset code'
                        },
                        {
                          len: 6,
                          message: 'Reset code should be 6 digits'
                        },
                        {
                          pattern: /^\d{6}$/,
                          message: 'Reset code must be exactly 6 digits'
                        }
                      ]}
                    >
                      <Input
                        prefix={<SafetyCertificateOutlined />}
                        placeholder="Enter the 6-digit code from your email"
                        autoComplete="off"
                        className="login-input"
                        style={{ fontFamily: 'monospace', letterSpacing: '2px', textAlign: 'center', fontSize: '18px' }}
                        maxLength={6}
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
                        {loading ? 'Verifying Code...' : 'Verify Code'}
                      </Button>
                    </Form.Item>
                  </Form>
                ) : (
                  <Form
                    form={form}
                    name="setNewPassword"
                    onFinish={handlePasswordSubmit}
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
                )}

                <div className="login-divider">
                  <Text type="secondary">
                    {step === 'code' ? "Didn't receive a code?" : 'Need help?'}
                  </Text>
                  <Button 
                    type="link" 
                    onClick={step === 'code' ? handleBackToLogin : handleBackToCode}
                    disabled={loading}
                    className="register-link"
                    style={{ padding: 0, height: 'auto', marginLeft: 8 }}
                  >
                    {step === 'code' ? 'Request New Reset' : 'Try Different Code'}
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

export default PasswordResetCodeEntry 