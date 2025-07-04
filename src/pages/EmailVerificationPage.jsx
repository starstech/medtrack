import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Spin, Typography, Space, Alert } from 'antd'
import { HeartOutlined, LoadingOutlined } from '@ant-design/icons'
import EmailVerificationPending from '../components/auth/EmailVerificationPending'
import EmailVerificationSuccess from '../components/auth/EmailVerificationSuccess'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import './VerificationPages.css'

const { Title, Text } = Typography

const EmailVerificationPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user, resendVerificationEmail } = useAuth()
  
  const [verificationState, setVerificationState] = useState('loading') // loading, pending, success, error
  const [verificationError, setVerificationError] = useState(null)
  const [pendingEmail, setPendingEmail] = useState(null)

  // For Supabase, verification happens automatically via URL parameters
  // The URL will have a hash fragment that Supabase client will process
  const email = searchParams.get('email')
  const mode = searchParams.get('mode') // 'verify' or 'pending'

  useEffect(() => {
    const handleVerification = async () => {
      // Check if this is a Supabase auth callback URL
      const { data, error } = await supabase.auth.getSession()
      
      // If we have a session, verification was successful
      if (data?.session) {
        setVerificationState('success')
        return
      }
      
      // If mode is pending, show pending state
      if (mode === 'pending' && email) {
        setVerificationState('pending')
        setPendingEmail(email)
        return
      }
      
      // Check for error in URL
      const errorParam = searchParams.get('error')
      if (errorParam) {
        setVerificationState('error')
        setVerificationError(errorParam || 'Verification failed')
        return
      }
      
      // No valid parameters
      setVerificationState('error')
      setVerificationError('Invalid verification link')
    }

    // Simulate loading delay
    const timer = setTimeout(handleVerification, 1500)
    
    return () => clearTimeout(timer)
  }, [email, mode, searchParams])

  const handleResendVerification = async (emailAddress) => {
    return await resendVerificationEmail(emailAddress)
  }

  const handleBackToLogin = () => {
    navigate('/login', { replace: true })
  }

  const handleContinueToDashboard = () => {
    navigate('/dashboard', { replace: true })
  }

  const renderContent = () => {
    switch (verificationState) {
      case 'loading':
        return (
          <div className="verification-loading">
            <Space direction="vertical" align="center" size="large">
              <Spin 
                size="large" 
                indicator={<LoadingOutlined style={{ fontSize: 48, color: '#1890ff' }} spin />}
              />
              <div>
                <Text strong style={{ fontSize: 18, color: '#fff' }}>
                  Verifying your email...
                </Text>
                <br />
                <Text type="secondary" style={{ color: 'rgba(255,255,255,0.8)' }}>
                  Please wait while we confirm your account
                </Text>
              </div>
            </Space>
          </div>
        )

      case 'pending':
        return (
          <EmailVerificationPending
            email={pendingEmail}
            onResendVerification={handleResendVerification}
            onBackToLogin={handleBackToLogin}
          />
        )

      case 'success':
        return (
          <EmailVerificationSuccess
            userName={user?.name || user?.user_metadata?.name}
            onContinue={handleContinueToDashboard}
          />
        )

      case 'error':
        return (
          <div className="verification-error">
            <Space direction="vertical" size="large" align="center">
              <Alert
                message="Verification Failed"
                description={verificationError}
                type="error"
                showIcon
                style={{ 
                  borderRadius: '12px',
                  maxWidth: '400px',
                  margin: '0 auto'
                }}
              />
              <div className="error-actions">
                <Space direction="vertical" size="middle">
                  <button 
                    onClick={handleBackToLogin}
                    className="error-button primary"
                  >
                    Back to Login
                  </button>
                  {pendingEmail && (
                    <button 
                      onClick={() => setVerificationState('pending')}
                      className="error-button secondary"
                    >
                      Try Again
                    </button>
                  )}
                </Space>
              </div>
            </Space>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="auth-page verification-page">
      <div className="auth-container">
        {/* Header - Only show for loading and error states */}
        {(verificationState === 'loading' || verificationState === 'error') && (
          <div className="auth-header">
            <Space direction="vertical" align="center" size="large">
              <div className="auth-brand">
                <HeartOutlined className="auth-brand-icon" />
                <Title level={1} className="auth-brand-title">
                  MedTrack
                </Title>
              </div>
              <Text type="secondary" className="auth-subtitle">
                Email Verification
              </Text>
            </Space>
          </div>
        )}

        {/* Main Content */}
        <div className="verification-content">
          {renderContent()}
        </div>

        {/* Footer - Only show for loading state */}
        {verificationState === 'loading' && (
          <div className="auth-footer">
            <Text type="secondary" size="small">
              Securing your account with email verification
            </Text>
          </div>
        )}
      </div>

      <style jsx>{`
        .verification-page {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .verification-loading {
          text-align: center;
          padding: 48px 24px;
        }

        .verification-error {
          max-width: 480px;
          margin: 0 auto;
        }

        .error-actions {
          margin-top: 24px;
        }

        .error-button {
          display: block;
          width: 200px;
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .error-button.primary {
          background: #1890ff;
          color: white;
          box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
        }

        .error-button.primary:hover {
          background: #40a9ff;
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(24, 144, 255, 0.4);
        }

        .error-button.secondary {
          background: transparent;
          color: #1890ff;
          border: 2px solid #1890ff;
        }

        .error-button.secondary:hover {
          background: #1890ff;
          color: white;
          transform: translateY(-1px);
        }

        .verification-content {
          width: 100%;
        }

        /* Loading animation */
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        .verification-loading .ant-spin {
          animation: pulse 2s ease-in-out infinite;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .verification-loading {
            padding: 32px 16px;
          }

          .error-button {
            width: 100%;
            max-width: 280px;
          }
        }
      `}</style>
    </div>
  )
}

export default EmailVerificationPage 