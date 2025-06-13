import { Button, Typography, Space, Card } from 'antd'
import { CheckCircleOutlined, ArrowRightOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

const EmailVerificationSuccess = ({ onContinue, userName }) => {
  return (
    <div className="email-verification-success">
      <Card className="verification-card" variant="filled">
        <Space direction="vertical" size="large" className="verification-content">
          {/* Success Icon and Header */}
          <div className="verification-header">
            <div className="success-icon">
              <CheckCircleOutlined />
            </div>
            <Title level={2} className="verification-title">
              Email verified successfully!
            </Title>
            <Text type="secondary" className="verification-subtitle">
              {userName ? `Welcome to MedTrack, ${userName}!` : 'Welcome to MedTrack!'}
              <br />
              Your account is now fully activated.
            </Text>
          </div>

          {/* Success Message */}
          <div className="success-message">
            <Card className="success-card">
              <Space direction="vertical" align="center" size="small">
                <CheckCircleOutlined className="message-icon" />
                <Text strong>Account Ready</Text>
                <Text type="secondary" size="small">
                  You can now access all MedTrack features
                </Text>
              </Space>
            </Card>
          </div>

          {/* Features Highlight */}
          <div className="features-highlight">
            <Text type="secondary" className="features-title">
              What you can do now:
            </Text>
            <div className="features-list">
              <div className="feature-item">
                <CheckCircleOutlined className="feature-icon" />
                <Text>Add patients and manage medications</Text>
              </div>
              <div className="feature-item">
                <CheckCircleOutlined className="feature-icon" />
                <Text>Track vital signs and measurements</Text>
              </div>
              <div className="feature-item">
                <CheckCircleOutlined className="feature-icon" />
                <Text>Set up dose reminders and notifications</Text>
              </div>
              <div className="feature-item">
                <CheckCircleOutlined className="feature-icon" />
                <Text>Share care with family members</Text>
              </div>
            </div>
          </div>

          {/* Continue Button */}
          <div className="verification-actions">
            <Button
              type="primary"
              size="large"
              icon={<ArrowRightOutlined />}
              onClick={onContinue}
              block
              className="continue-button"
            >
              Continue to Dashboard
            </Button>
          </div>
        </Space>
      </Card>

      <style jsx>{`
        .email-verification-success {
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

        .success-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, #52c41a, #389e0d);
          color: white;
          font-size: 36px;
          margin-bottom: 24px;
          box-shadow: 0 8px 24px rgba(82, 196, 26, 0.3);
          animation: successPulse 2s ease-in-out infinite;
        }

        @keyframes successPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .verification-title {
          margin-bottom: 8px !important;
          color: #262626 !important;
        }

        .verification-subtitle {
          font-size: 16px;
          line-height: 1.5;
        }

        .success-message {
          margin: 24px 0;
        }

        .success-card {
          background: #f6ffed !important;
          border: 1px solid #b7eb8f !important;
          border-radius: 12px !important;
          box-shadow: none !important;
        }

        .message-icon {
          color: #52c41a;
          font-size: 24px;
        }

        .features-highlight {
          text-align: left;
          max-width: 320px;
          margin: 0 auto;
        }

        .features-title {
          display: block;
          margin-bottom: 16px;
          font-weight: 600;
          color: #595959;
        }

        .features-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .feature-icon {
          color: #52c41a;
          font-size: 16px;
          flex-shrink: 0;
        }

        .verification-actions {
          margin-top: 32px;
          width: 100%;
        }

        .continue-button {
          height: 48px !important;
          border-radius: 8px !important;
          font-weight: 600 !important;
          background: linear-gradient(135deg, #52c41a, #389e0d) !important;
          border: none !important;
          box-shadow: 0 4px 12px rgba(82, 196, 26, 0.3) !important;
        }

        .continue-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(82, 196, 26, 0.4) !important;
          background: linear-gradient(135deg, #73d13d, #52c41a) !important;
        }

        @media (max-width: 768px) {
          .verification-content {
            padding: 20px 16px;
          }

          .success-icon {
            width: 64px;
            height: 64px;
            font-size: 28px;
            margin-bottom: 20px;
          }

          .verification-title {
            font-size: 24px !important;
          }

          .features-highlight {
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  )
}

export default EmailVerificationSuccess 