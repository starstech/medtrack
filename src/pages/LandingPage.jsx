import { Button, Typography, Space, Row, Col, Card, Statistic } from 'antd'
import { 
  HeartOutlined, 
  MedicineBoxOutlined, 
  SafetyOutlined, 
  ClockCircleOutlined,
  UserAddOutlined,
  LoginOutlined,
  CheckCircleOutlined,
  MobileOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import './LandingPage.css'

const { Title, Text } = Typography

const LandingPage = () => {
  const navigate = useNavigate()

  const features = [
    {
      icon: <MedicineBoxOutlined className="feature-icon" />,
      title: "Medication Tracking",
      description: "Never miss a dose with smart reminders and comprehensive medication management"
    },
    {
      icon: <HeartOutlined className="feature-icon" />,
      title: "Health Monitoring",
      description: "Track vital signs, symptoms, and health measurements for complete care oversight"
    },
    {
      icon: <ClockCircleOutlined className="feature-icon" />,
      title: "Real-time Updates",
      description: "Stay connected with instant notifications and synchronized family care coordination"
    },
    {
      icon: <SafetyOutlined className="feature-icon" />,
      title: "HIPAA Compliant",
      description: "Your health data is protected with enterprise-grade security and encryption"
    }
  ]

  const stats = [
    { value: "10,000+", label: "Families Served" },
    { value: "99.9%", label: "Uptime" },
    { value: "24/7", label: "Support" },
    { value: "256-bit", label: "Encryption" }
  ]

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <div className="hero-section">
        <Row gutter={[48, 48]} align="middle" justify="center">
          <Col xs={24} lg={12}>
            <Space direction="vertical" size="large" className="hero-content">
              <div className="hero-brand">
                <Space align="center" size="middle">
                  <div className="brand-icon-container">
                    <MedicineBoxOutlined className="brand-icon" />
                    <HeartOutlined className="brand-heart" />
                  </div>
                  <Title level={1} className="brand-title">MedTrack</Title>
                </Space>
              </div>
              
              <Title level={2} className="hero-title">
                Comprehensive Family 
                <br />
                <span className="gradient-text">Healthcare Management</span>
              </Title>
              
              <Text className="hero-subtitle">
                Streamline medication schedules, track health measurements, and coordinate 
                care for your entire family with our intuitive platform designed by healthcare professionals.
              </Text>
              
              <Space size="large" className="hero-actions">
                <Button 
                  type="primary" 
                  size="large"
                  icon={<UserAddOutlined />}
                  onClick={() => navigate('/register')}
                  className="primary-btn"
                >
                  Get Started Free
                </Button>
                <Button 
                  size="large"
                  icon={<LoginOutlined />}
                  onClick={() => navigate('/login')}
                  className="secondary-btn"
                >
                  Sign In
                </Button>
              </Space>
            </Space>
          </Col>
          
          <Col xs={24} lg={12}>
            <div className="hero-visual">
              <Card className="demo-card">
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <div className="demo-header">
                    <Space>
                      <div className="demo-avatar"></div>
                      <div>
                        <Text strong>Sarah's Medications</Text>
                        <br />
                        <Text type="secondary" size="small">Next dose in 2 hours</Text>
                      </div>
                    </Space>
                  </div>
                  
                  <div className="demo-medications">
                    {['Morning Vitamins', 'Blood Pressure', 'Heart Medication'].map((med, index) => (
                      <div key={med} className="demo-med-item">
                        <CheckCircleOutlined className="check-icon" />
                        <Text>{med}</Text>
                        <Text type="secondary" className="med-time">
                          {index === 0 ? 'Taken' : index === 1 ? 'Due 2:00 PM' : 'Due 6:00 PM'}
                        </Text>
                      </div>
                    ))}
                  </div>
                </Space>
              </Card>
            </div>
          </Col>
        </Row>
      </div>

      {/* Stats Section */}
      <div className="stats-section">
        <Row gutter={[24, 24]} justify="center">
          {stats.map((stat, index) => (
            <Col key={index} xs={12} sm={6}>
              <div className="stat-item">
                <Title level={3} className="stat-value">{stat.value}</Title>
                <Text type="secondary">{stat.label}</Text>
              </div>
            </Col>
          ))}
        </Row>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <div className="section-header">
          <Title level={2} className="section-title">
            Everything You Need for Family Healthcare
          </Title>
          <Text className="section-subtitle">
            Comprehensive tools designed to make healthcare management simple and reliable
          </Text>
        </div>
        
        <Row gutter={[32, 32]} justify="center">
          {features.map((feature, index) => (
            <Col key={index} xs={24} sm={12} lg={6}>
              <Card className="feature-card" hoverable>
                <Space direction="vertical" align="center" size="middle">
                  {feature.icon}
                  <Title level={4} className="feature-title">{feature.title}</Title>
                  <Text type="secondary" className="feature-description">
                    {feature.description}
                  </Text>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* Trust Section */}
      <div className="trust-section">
        <Card className="trust-card">
          <Row gutter={[48, 32]} align="middle">
            <Col xs={24} lg={12}>
              <Space direction="vertical" size="large">
                <Title level={3} className="trust-title">
                  Trusted by Healthcare Professionals
                </Title>
                <Text className="trust-description">
                  Built in collaboration with doctors, nurses, and caregivers to ensure 
                  the highest standards of accuracy, security, and usability.
                </Text>
                <Space size="large" wrap>
                  <Space>
                    <SafetyCertificateOutlined className="trust-icon" />
                    <Text strong>HIPAA Compliant</Text>
                  </Space>
                  <Space>
                    <MobileOutlined className="trust-icon" />
                    <Text strong>Mobile Ready</Text>
                  </Space>
                  <Space>
                    <ClockCircleOutlined className="trust-icon" />
                    <Text strong>24/7 Available</Text>
                  </Space>
                </Space>
              </Space>
            </Col>
            <Col xs={24} lg={12}>
              <div className="trust-visual">
                <div className="security-badge">
                  <SafetyCertificateOutlined className="security-icon" />
                  <Space direction="vertical" size="small">
                    <Text strong>Bank-Level Security</Text>
                    <Text type="secondary" size="small">256-bit SSL Encryption</Text>
                  </Space>
                </div>
              </div>
            </Col>
          </Row>
        </Card>
      </div>

      {/* CTA Section */}
      <div className="cta-section">
        <Space direction="vertical" align="center" size="large">
          <Title level={2} className="cta-title">
            Ready to Simplify Your Family's Healthcare?
          </Title>
          <Text className="cta-subtitle">
            Join thousands of families who trust MedTrack for their medication management
          </Text>
          <Space size="large">
            <Button 
              type="primary" 
              size="large"
              icon={<UserAddOutlined />}
              onClick={() => navigate('/register')}
              className="cta-primary-btn"
            >
              Start Free Trial
            </Button>
            <Button 
              size="large"
              onClick={() => navigate('/login')}
              className="cta-secondary-btn"
            >
              Sign In to Continue
            </Button>
          </Space>
        </Space>
      </div>
    </div>
  )
}

export default LandingPage 