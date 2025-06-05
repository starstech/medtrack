import { useState } from 'react'
import { Form, Input, Button, Alert, Typography, Space, Checkbox } from 'antd'
import { MailOutlined, LockOutlined, UserOutlined, LoadingOutlined } from '@ant-design/icons'
import { useAuth } from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

const { Text, Link } = Typography

const RegisterForm = () => {
  const [form] = Form.useForm()
  const { register, loading, error, clearError } = useAuth()
  const [localLoading, setLocalLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (values) => {
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
  }

  const isLoading = loading || localLoading

  return (
    <div className="auth-form">
      <Space direction="vertical" size="large" className="auth-form-content">
        <div className="form-header">
          <Text strong className="form-title">Create your account</Text>
          <Text type="secondary">
            Join thousands of caregivers managing medications safely
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
          />
        )}

        <Form
          form={form}
          name="register"
          onFinish={handleSubmit}
          layout="vertical"
          size="large"
          disabled={isLoading}
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
            />
          </Form.Item>

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
          >
            <Checkbox disabled={isLoading}>
              I agree to the{' '}
              <Link href="#" disabled={isLoading}>
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="#" disabled={isLoading}>
                Privacy Policy
              </Link>
            </Checkbox>
          </Form.Item>

          <Form.Item className="form-actions">
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              icon={isLoading ? <LoadingOutlined /> : null}
              block
              className="submit-button"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </Form.Item>
        </Form>

        <div className="form-footer">
          <Text type="secondary" size="small">
            Already have an account?{' '}
            <Link href="#" disabled={isLoading}>
              Sign in instead
            </Link>
          </Text>
        </div>
      </Space>
    </div>
  )
}

export default RegisterForm