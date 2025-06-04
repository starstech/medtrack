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
  CloseOutlined,
  InfoCircleOutlined,
  SecurityScanOutlined,
  DeleteOutlined
} from '@ant-design/icons'
import { useAuth } from '../../hooks/useAuth'
import './ProfileSettings.css'

const { Title, Text } = Typography

const ProfileSettings = ({ user }) => {
  const { logout } = useAuth()
  const [form] = Form.useForm()
  const [passwordForm] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [changePasswordVisible, setChangePasswordVisible] = useState(false)
  const [deleteAccountVisible, setDeleteAccountVisible] = useState(false)

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

  const handleAvatarUpload = (info) => {
    if (info.file.status === 'done') {
      message.success('Avatar uploaded successfully!')
    } else if (info.file.status === 'error') {
      message.error('Failed to upload avatar.')
    }
  }

  return (
    <div className="profile-settings-section">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Profile Information Card */}
        <div className="settings-group">
          <div className="settings-group-header">
            <div className="group-title">
              <Space>
                <UserOutlined />
                <span>Profile Information</span>
              </Space>
            </div>
            {!editMode && (
              <Button 
                type="primary" 
                icon={<EditOutlined />}
                onClick={() => setEditMode(true)}
                size="small"
              >
                Edit Profile
              </Button>
            )}
          </div>

          <div className="settings-content">
            <Row gutter={24}>
              <Col xs={24} sm={8}>
                <div className="profile-avatar-section">
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
                  className="profile-form"
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

                  {editMode && (
                    <div className="profile-actions">
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
                    </div>
                  )}
                </Form>
              </Col>
            </Row>
          </div>
        </div>

        {/* Account Settings */}
        <div className="settings-group">
          <div className="settings-group-header">
            <div className="group-title">
              <Space>
                <SecurityScanOutlined />
                <span>Account Settings</span>
              </Space>
            </div>
          </div>

          <div className="settings-content">
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {/* Password Change */}
              <div className="setting-item">
                <div className="setting-header">
                  <div className="setting-info">
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
                  <div className="setting-info">
                    <Title level={5}>Account Information</Title>
                    <Text type="secondary">
                      Your account details and membership information
                    </Text>
                  </div>
                </div>
                <div className="account-info">
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12}>
                      <div className="info-item">
                        <Text type="secondary">Member Since:</Text>
                        <br />
                        <Text strong>
                          {user?.joinedAt ? new Date(user.joinedAt).toLocaleDateString() : 'Unknown'}
                        </Text>
                      </div>
                    </Col>
                    <Col xs={24} sm={12}>
                      <div className="info-item">
                        <Text type="secondary">Account Type:</Text>
                        <br />
                        <Text strong>{user?.role === 'caregiver' ? 'Caregiver' : 'Patient'}</Text>
                      </div>
                    </Col>
                    <Col xs={24} sm={12}>
                      <div className="info-item">
                        <Text type="secondary">Email Status:</Text>
                        <br />
                        <Text strong style={{ color: '#52c41a' }}>Verified</Text>
                      </div>
                    </Col>
                  </Row>
                </div>
              </div>

              <Divider />

              {/* Privacy Settings */}
              <div className="setting-item">
                <div className="setting-header">
                  <div className="setting-info">
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
          </div>
        </div>

        {/* Danger Zone */}
        <div className="settings-group danger-zone">
          <div className="settings-group-header">
            <div className="group-title">
              <Space>
                <DeleteOutlined />
                <span>Danger Zone</span>
              </Space>
            </div>
          </div>

          <div className="settings-content">
            <div className="danger-actions">
              <div className="danger-item">
                <div className="setting-info">
                  <Title level={5} style={{ color: '#ff4d4f' }}>
                    Delete Account
                  </Title>
                  <Text type="secondary">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </Text>
                </div>
                <Button 
                  danger 
                  onClick={() => setDeleteAccountVisible(true)}
                >
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Space>

      {/* Change Password Modal */}
      <Modal
        title={
          <Space>
            <LockOutlined />
            <span>Change Password</span>
          </Space>
        }
        open={changePasswordVisible}
        onCancel={() => {
          setChangePasswordVisible(false)
          passwordForm.resetFields()
        }}
        footer={[
          <Button 
            key="cancel"
            onClick={() => {
              setChangePasswordVisible(false)
              passwordForm.resetFields()
            }}
          >
            Cancel
          </Button>,
          <Button 
            key="submit"
            type="primary" 
            htmlType="submit"
            form="password-change-form"
          >
            Change Password
          </Button>
        ]}
        destroyOnClose
        className="password-modal"
      >
        <div className="modal-form">
          <Form
            id="password-change-form"
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
              <Input.Password />
            </Form.Item>

            <Form.Item
              name="newPassword"
              label="New Password"
              rules={[
                { required: true, message: 'Please enter a new password' },
                { min: 8, message: 'Password must be at least 8 characters' }
              ]}
            >
              <Input.Password />
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
                    return Promise.reject(new Error('The two passwords do not match!'))
                  },
                }),
              ]}
            >
              <Input.Password />
            </Form.Item>
          </Form>
        </div>
      </Modal>

      {/* Delete Account Confirmation Modal */}
      <Modal
        title={
          <Space>
            <DeleteOutlined style={{ color: '#ff4d4f' }} />
            <span>Delete Account</span>
          </Space>
        }
        open={deleteAccountVisible}
        onCancel={() => setDeleteAccountVisible(false)}
        footer={[
          <Button 
            key="cancel"
            onClick={() => setDeleteAccountVisible(false)}
          >
            Cancel
          </Button>,
          <Button 
            key="delete"
            type="primary"
            danger
            onClick={() => {
              // TODO: Implement account deletion
              message.error('Account deletion not implemented yet')
              setDeleteAccountVisible(false)
            }}
          >
            Delete Account
          </Button>
        ]}
        destroyOnClose
        className="delete-account-modal"
        width={500}
      >
        <div className="modal-form">
          <div style={{ marginTop: 16 }}>
            <Text>Are you sure you want to delete your account?</Text>
            <br />
            <br />
            <Text type="secondary">
              This action will permanently delete:
            </Text>
            <ul style={{ marginTop: 8, marginBottom: 16, paddingLeft: 20 }}>
              <li><Text type="secondary">Your profile and account data</Text></li>
              {/* <li><Text type="secondary">All patient information</Text></li>
              <li><Text type="secondary">Medication records and history</Text></li>
              <li><Text type="secondary">Daily logs and measurements</Text></li> */}
            </ul>
            <Text strong style={{ color: '#ff4d4f' }}>
              This action cannot be undone.
            </Text>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default ProfileSettings