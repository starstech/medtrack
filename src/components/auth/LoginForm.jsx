import { useState } from 'react'
import { Form, Input, Button, Alert, Typography, Space } from 'antd'
import { MailOutlined, LockOutlined, LoadingOutlined } from '@ant-design/icons'
import { useAuth } from '../../hooks/useAuth'

const { Text, Link } = Typography

const LoginForm = () => {
  const [form] = Form.useForm()
  const { login, loading, error, clearError } = useAuth()
  const [localLoading, setLocalLoading] = useState(false)

  const handleSubmit = async (values) => {
    setLocalLoading(true)
    clearError()
    
    const result = await login(values.email, values.password)
    
    if (!result.success) {
      // Error is handled by the context
    }
    
    setLocalLoading(false)
  }

  const isLoading = loading || localLoading

  // Demo credentials helper
  const fillDemoCredentials = () => {
    form.setFieldsValue({
      email: 'sarah@example.com',
      password: 'demo123'
    })
  }

  return (
    <div className="auth-form">
      <Space direction="vertical" size="large" className="auth-form-content">
        <div className="form-header">
          <Text strong className="form-title">Welcome back</Text>
          <Text type="secondary">
            Sign in to continue managing your patients' care
          </Text>
        </div>

        {error && (
          <Alert
            message="Login Failed"
            description={error}
            type="error"
            showIcon
            closable
            onClose={clearError}
          />
        )}

        <Form
          form={form}
          name="login"
          onFinish={handleSubmit}
          layout="vertical"
          size="large"
          disabled={isLoading}
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
            />
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
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </Form.Item>
        </Form>

        {/* Demo Helper */}
        <div className="demo-helper">
          <Text type="secondary" size="small">
            For demo purposes:
          </Text>
          <Button 
            type="link" 
            size="small" 
            onClick={fillDemoCredentials}
            disabled={isLoading}
          >
            Fill demo credentials
          </Button>
        </div>

        <div className="form-footer">
          <Text type="secondary" size="small">
            Forgot your password?{' '}
            <Link href="#" disabled={isLoading}>
              Reset it here
            </Link>
          </Text>
        </div>
      </Space>
    </div>
  )
}

export default LoginForm