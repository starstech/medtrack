import { useState } from 'react'
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Space, 
  Typography, 
  Avatar, 
  Upload, 
  message,
  Row,
  Col,
  Divider,
  Switch,
  Modal
} from 'antd'
import { 
  UserOutlined,
  EditOutlined,
  CameraOutlined,
  MailOutlined,
  PhoneOutlined,
  SaveOutlined,
  LockOutlined,
  CloseOutlined
} from '@ant-design/icons'
import { useAuth } from '../../hooks/useAuth'

const { Title, Text } = Typography

const ProfileSettings = ({ user }) => {
  const { logout } = useAuth()
  const [form] = Form.useForm()
  const [passwordForm] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [changePasswordVisible, setChangePasswordVisible] = useState(false)

  const handleSaveProfile = async (values) => {
    setLoading(true)
    
    try {
      // TODO: Implement profile update API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      message.success('Profile updated successfully!')
      setEditMode(false)
      
    } catch (error) {
      message.error('Failed to update profile. Please try again.')
      console.error('Error updating profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (values) => {
    try {
      // TODO: Implement password change API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      message.success('Password changed successfully!')
      setChangePasswordVisible(false)
      passwordForm.resetFields()
      
    } catch (error) {
      message.error('Failed to change password. Please try again.')
      console.error('Error changing password:', error)
    }
  }

  const handleAvatarUpload = (info) => {
    if (info.file.status === 'uploading') {
      setLoading(true)
      return
    }
    if (info.file.status === 'done') {
      // TODO: Handle avatar upload
      message.success('Profile picture updated successfully!')
      setLoading(false)
    }
    if (info.file.status === 'error') {
      message.error('Failed to upload profile picture.')
      setLoading(false)
    }
  }

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
    if (!isJpgOrPng) {
      message.error('You can only upload JPG/PNG file!')
    }
    const isLt2M = file.size / 1024 / 1024 < 2
    if (!isLt2M) {
      message.error('Image must smaller than 2MB!')
    }
    return isJpgOrPng && isLt2M
  }

  const uploadButton = (
    <div>
      <CameraOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  )

  return (
    <div className="profile-settings">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Profile Picture & Basic Info */}
        <Card title="Profile Information" className="profile-info-card">
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={8} className="profile-avatar-section">
              <div className="avatar-upload">
                <Upload
                  name="avatar"
                  listType="picture-card"
                  className="avatar-uploader"
                  showUploadList={false}
                  beforeUpload={beforeUpload}
                  onChange={handleAvatarUpload}
                  disabled={!editMode}
                >
                  <Avatar 
                    size={80} 
                    icon={<UserOutlined />}
                    src={user?.avatar}
                  />
                  {editMode && (
                    <div className="avatar-overlay">
                      <CameraOutlined />
                    </div>
                  )}
                </Upload>
              </div>
              <div className="profile-role">
                <Text type="secondary">
                  {user?.role === 'caregiver' ? 'Caregiver' : 'Patient'}
                </Text>
              </div>
            </Col>
            
            <Col xs={24} sm={16}>
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSaveProfile}
                initialValues={{
                  name: user?.name,
                  email: user?.email,
                  phone: user?.phone || '',
                  bio: user?.bio || ''
                }}
                disabled={!editMode}
              >
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="name"
                      label="Full Name"
                      rules={[
                        { required: true, message: 'Please enter your name' },
                        { min: 2, message: 'Name must be at least 2 characters' }
                      ]}
                    >
                      <Input prefix={<UserOutlined />} />
                    </Form.Item>
                  </Col>
                  
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="email"
                      label="Email Address"
                      rules={[
                        { required: true, message: 'Please enter your email' },
                        { type: 'email', message: 'Please enter a valid email' }
                      ]}
                    >
                      <Input prefix={<MailOutlined />} />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="phone"
                  label="Phone Number"
                  rules={[
                    { pattern: /^[\+]?[1-9][\d]{0,15}$/, message: 'Please enter a valid phone number' }
                  ]}
                >
                  <Input prefix={<PhoneOutlined />} placeholder="+1 (555) 123-4567" />
                </Form.Item>

                <Form.Item
                  name="bio"
                  label="Bio"
                >
                  <Input.TextArea 
                    rows={3}
                    placeholder="Tell us a bit about yourself..."
                    maxLength={500}
                    showCount
                  />
                </Form.Item>

                <div className="profile-actions">
                  {editMode ? (
                    <Space>
                      <Button 
                        onClick={() => {
                          setEditMode(false)
                          form.resetFields()
                        }}
                        disabled={loading}
                      >
                        <CloseOutlined /> Cancel
                      </Button>
                      <Button 
                        type="primary" 
                        htmlType="submit"
                        loading={loading}
                        icon={<SaveOutlined />}
                      >
                        Save Changes
                      </Button>
                    </Space>
                  ) : (
                    <Button 
                      type="primary" 
                      onClick={() => setEditMode(true)}
                      icon={<EditOutlined />}
                    >
                      Edit Profile
                    </Button>
                  )}
                </div>
              </Form>
            </Col>
          </Row>
        </Card>

        {/* Account Settings */}
        <Card title="Account Settings" className="account-settings-card">
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* Password Change */}
            <div className="setting-item">
              <div className="setting-header">
                <div>
                  <Title level={5}>Password</Title>
                  <Text type="secondary">
                    Keep your account secure with a strong password
                  </Text>
                </div>
                <Button 
                  icon={<LockOutlined />}
                  onClick={() => setChangePasswordVisible(true)}
                >
                  Change Password
                </Button>
              </div>
            </div>

            <Divider />

            {/* Account Information */}
            <div className="setting-item">
              <div className="setting-header">
                <div>
                  <Title level={5}>Account Information</Title>
                  <Text type="secondary">
                    Your account details and membership information
                  </Text>
                </div>
              </div>
              <div className="account-info">
                <Row gutter={[16, 8]}>
                  <Col xs={24} sm={12}>
                    <Text type="secondary">Member Since:</Text>
                    <br />
                    <Text strong>
                      {user?.joinedAt ? new Date(user.joinedAt).toLocaleDateString() : 'Unknown'}
                    </Text>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Text type="secondary">Account Type:</Text>
                    <br />
                    <Text strong>{user?.role === 'caregiver' ? 'Caregiver' : 'Patient'}</Text>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Text type="secondary">User ID:</Text>
                    <br />
                    <Text strong>{user?.id}</Text>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Text type="secondary">Email Status:</Text>
                    <br />
                    <Text strong style={{ color: '#52c41a' }}>Verified</Text>
                  </Col>
                </Row>
              </div>
            </div>

            <Divider />

            {/* Privacy Settings */}
            <div className="setting-item">
              <div className="setting-header">
                <div>
                  <Title level={5}>Privacy Settings</Title>
                  <Text type="secondary">
                    Control how your information is shared
                  </Text>
                </div>
              </div>
              <div className="privacy-settings">
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <div className="privacy-option">
                    <div className="privacy-option-content">
                      <Text strong>Profile Visibility</Text>
                      <br />
                      <Text type="secondary" size="small">
                        Allow other caregivers to see your profile
                      </Text>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="privacy-option">
                    <div className="privacy-option-content">
                      <Text strong>Activity Status</Text>
                      <br />
                      <Text type="secondary" size="small">
                        Show when you were last active
                      </Text>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </Space>
              </div>
            </div>
          </Space>
        </Card>

        {/* Danger Zone */}
        <Card title="Danger Zone" className="danger-zone-card">
          <div className="danger-actions">
            <div className="danger-item">
              <div>
                <Title level={5} style={{ color: '#ff4d4f' }}>
                  Delete Account
                </Title>
                <Text type="secondary">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </Text>
              </div>
              <Button 
                danger 
                onClick={() => {
                  Modal.confirm({
                    title: 'Delete Account',
                    content: 'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.',
                    okText: 'Delete Account',
                    okType: 'danger',
                    cancelText: 'Cancel',
                    onOk: () => {
                      // TODO: Implement account deletion
                      message.error('Account deletion not implemented yet')
                    }
                  })
                }}
              >
                Delete Account
              </Button>
            </div>
          </div>
        </Card>
      </Space>

      {/* Change Password Modal */}
      <Modal
        title="Change Password"
        open={changePasswordVisible}
        onCancel={() => {
          setChangePasswordVisible(false)
          passwordForm.resetFields()
        }}
        footer={null}
        destroyOnClose
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handleChangePassword}
        >
          <Form.Item
            name="currentPassword"
            label="Current Password"
            rules={[
              { required: true, message: 'Please enter your current password' }
            ]}
          >
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="New Password"
            rules={[
              { required: true, message: 'Please enter your new password' },
              { min: 6, message: 'Password must be at least 6 characters' }
            ]}
          >
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm New Password"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Please confirm your new password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('Passwords do not match'))
                }
              })
            ]}
          >
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>

          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button 
                onClick={() => {
                  setChangePasswordVisible(false)
                  passwordForm.resetFields()
                }}
              >
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Change Password
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  )
}

export default ProfileSettings