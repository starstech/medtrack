import { useState } from 'react'
import { Button, Typography, Space, Alert, Card } from 'antd'
import { MailOutlined, CheckCircleOutlined, ReloadOutlined } from '@ant-design/icons'
import { useAuth } from '../../hooks/useAuth'

const { Title, Text, Link } = Typography

const EmailVerificationPending = ({ email, onResendVerification, onBackToLogin }) => {
  const [resendLoading, setResendLoading] = useState(false)
  const [resendMessage, setResendMessage] = useState(null)
  const { error, clearError } = useAuth()

  const handleResendVerification = async () => {
    setResendLoading(true)
    clearError()
    
    try {
      await onResendVerification(email)
      setResendMessage({
        type: 'success',
        message: 'Verification email sent successfully!',
        description: 'Please check your inbox and spam folder.'
      })
    } catch (err) {
      setResendMessage({
        type: 'error',
        message: 'Failed to send verification email',
        description: 'Please try again in a few moments.'
      })
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="email-verification-pending">
      <Card className="verification-card" bordered={false}>
        <Space direction="vertical" size="large" className="verification-content">
          {/* Icon and Header */}
          <div className="verification-header">
            <div className="verification-icon">
              <MailOutlined />
            </div>
            <Title level={2} className="verification-title">
              Check your email
            </Title>
            <Text type="secondary" className="verification-subtitle">
              We've sent a verification link to your email address
            </Text>
          </div>

          {/* Email Display */}
          <div className="email-display">
            <Card className="email-card">
              <Space>
                <CheckCircleOutlined className="email-icon" />
                <div>
                  <Text strong>{email}</Text>
                  <br />
                  <Text type="secondary" size="small">
                    Verification email sent
                  </Text>
                </div>
              </Space>
            </Card>
          </div>

          {/* Instructions */}
          <div className="verification-instructions">
            <Text type="secondary">
              <strong>Next steps:</strong>
            </Text>
            <ol className="instruction-list">
              <li>Open your email inbox</li>
              <li>Look for an email from MedTrack</li>
              <li>Click the verification link in the email</li>
              <li>Return here to continue</li>
            </ol>
            <Text type="secondary" size="small">
              Don't see the email? Check your spam folder or promotions tab.
            </Text>
          </div>

          {/* Error Display */}
          {error && (
            <Alert
              message="Verification Error"
              description={error}
              type="error"
              showIcon
              closable
              onClose={clearError}
            />
          )}

          {/* Resend Message */}
          {resendMessage && (
            <Alert
              message={resendMessage.message}
              description={resendMessage.description}
              type={resendMessage.type}
              showIcon
              closable
              onClose={() => setResendMessage(null)}
            />
          )}

          {/* Actions */}
          <div className="verification-actions">
            <Space direction="vertical" size="middle" className="action-buttons">
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                loading={resendLoading}
                onClick={handleResendVerification}
                block
                size="large"
                className="resend-button"
              >
                {resendLoading ? 'Sending...' : 'Resend verification email'}
              </Button>
              
              <Button
                type="link"
                onClick={onBackToLogin}
                className="back-button"
              >
                Back to login
              </Button>
            </Space>
          </div>

          {/* Help Text */}
          <div className="verification-help">
            <Text type="secondary" size="small">
              Need help? Contact our support team at{' '}
              <Link href="mailto:support@medtrack.com">
                support@medtrack.com
              </Link>
            </Text>
          </div>
        </Space>
      </Card>

      <style jsx>{`
        .email-verification-pending {
          width: 100%;
          max-width: 480px;
          margin: 0 auto;
        }

        .verification-card {
          border-radius: 16px !important;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08) !important;
          border: 1px solid #f0f0f0 !important;
        }

        .verification-content {
          width: 100%;
          text-align: center;
          padding: 24px;
        }

        .verification-header {
          text-align: center;
        }

        .verification-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, #1890ff, #722ed1);
          color: white;
          font-size: 36px;
          margin-bottom: 24px;
          box-shadow: 0 8px 24px rgba(24, 144, 255, 0.3);
        }

        .verification-title {
          margin-bottom: 8px !important;
          color: #262626 !important;
        }

        .verification-subtitle {
          font-size: 16px;
          line-height: 1.5;
        }

        .email-display {
          margin: 24px 0;
        }

        .email-card {
          background: #f6ffed !important;
          border: 1px solid #b7eb8f !important;
          border-radius: 12px !important;
          box-shadow: none !important;
        }

        .email-icon {
          color: #52c41a;
          font-size: 18px;
        }

        .verification-instructions {
          text-align: left;
          max-width: 320px;
          margin: 0 auto;
        }

        .instruction-list {
          margin: 12px 0;
          padding-left: 20px;
          color: #595959;
          line-height: 1.6;
        }

        .instruction-list li {
          margin-bottom: 4px;
        }

        .verification-actions {
          margin-top: 32px;
          width: 100%;
        }

        .action-buttons {
          width: 100%;
        }

        .resend-button {
          height: 48px !important;
          border-radius: 8px !important;
          font-weight: 600 !important;
          background: #1890ff !important;
          border-color: #1890ff !important;
          box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3) !important;
        }

        .resend-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(24, 144, 255, 0.4) !important;
        }

        .back-button {
          color: #8c8c8c !important;
          font-size: 14px;
        }

        .verification-help {
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid #f0f0f0;
        }

        @media (max-width: 768px) {
          .verification-content {
            padding: 20px 16px;
          }

          .verification-icon {
            width: 64px;
            height: 64px;
            font-size: 28px;
            margin-bottom: 20px;
          }

          .verification-title {
            font-size: 24px !important;
          }

          .verification-instructions {
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  )
}

export default EmailVerificationPending 