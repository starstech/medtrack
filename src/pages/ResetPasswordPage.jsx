import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Card, Form, Input, Button, Alert, Typography, Space, message } from 'antd'
import { LockOutlined, CheckCircleOutlined, MedicineBoxOutlined, HeartOutlined } from '@ant-design/icons'
import { supabase } from '../lib/supabase'
import './VerificationPages.css'

const { Title, Text } = Typography

const ResetPasswordPage = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    // Check if we have the required tokens from the URL
    const accessToken = searchParams.get('access_token')
    const refreshToken = searchParams.get('refresh_token')
    
    if (!accessToken || !refreshToken) {
      setError('Invalid reset link. Please request a new password reset.')
      return
    }

    // Set the session with the tokens from the URL
    supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken
    })
  }, [searchParams])

  const handleSubmit = async (values) => {
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
  }

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-header">
            <Space direction="vertical" align="center" size="large">
              <div className="auth-brand">
                <div className="auth-brand-icon-container">
                  <MedicineBoxOutlined className="auth-brand-icon" />
                  <HeartOutlined className="auth-brand-heart" />
                </div>
                <Title level={1} className="auth-brand-title">
                  MedTrack
                </Title>
              </div>
            </Space>
          </div>

          <Card className="auth-card" variant="borderless">
            <div style={{ padding: '40px 32px', textAlign: 'center' }}>
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <CheckCircleOutlined style={{ fontSize: 64, color: '#52c41a' }} />
                <div>
                  <Title level={2} style={{ color: '#52c41a', margin: 0 }}>
                    Password Updated!
                  </Title>
                  <Text type="secondary">
                    Your password has been successfully updated.
                  </Text>
                </div>
                <Text type="secondary">
                  Redirecting you to the login page...
                </Text>
              </Space>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <Space direction="vertical" align="center" size="large">
            <div className="auth-brand">
              <div className="auth-brand-icon-container">
                <MedicineBoxOutlined className="auth-brand-icon" />
                <HeartOutlined className="auth-brand-heart" />
              </div>
              <Title level={1} className="auth-brand-title">
                MedTrack
              </Title>
            </div>
            <div className="auth-subtitle-container">
              <Text className="auth-subtitle">
                Reset Your Password
              </Text>
              <Text className="auth-subtitle-sub">
                Enter your new password below
              </Text>
            </div>
          </Space>
        </div>

        <Card className="auth-card" variant="borderless">
          <div className="auth-form" style={{ padding: '40px 32px' }}>
            <Space direction="vertical" size="large" className="auth-form-content">
              {error && (
                <Alert
                  message="Password Reset Failed"
                  description={error}
                  type="error"
                  showIcon
                  closable
                  onClose={() => setError('')}
                />
              )}

              <Form
                form={form}
                name="resetPassword"
                onFinish={handleSubmit}
                layout="vertical"
                size="large"
                disabled={loading}
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
                  />
                </Form.Item>

                <Form.Item className="form-actions">
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    block
                    className="submit-button"
                  >
                    {loading ? 'Updating Password...' : 'Update Password'}
                  </Button>
                </Form.Item>
              </Form>

              <div className="form-footer">
                <Text type="secondary" size="small">
                  Remember your password?{' '}
                  <Button 
                    type="link" 
                    size="small" 
                    onClick={() => navigate('/login')}
                    disabled={loading}
                    style={{ padding: 0, height: 'auto' }}
                  >
                    Back to Sign In
                  </Button>
                </Text>
              </div>
            </Space>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default ResetPasswordPage 