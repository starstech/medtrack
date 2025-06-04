import { useState } from 'react'
import { 
  List, 
  Button, 
  Space, 
  Typography, 
  Avatar, 
  Tag, 
  Empty,
  Modal,
  Form,
  Input,
  Select,
  message,
  Row,
  Col,
  Dropdown,
  Divider
} from 'antd'
import { 
  TeamOutlined,
  PlusOutlined,
  UserOutlined,
  MailOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  SendOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons'
import { usePatients } from '../../hooks/usePatients'
import './CaregiverManagement.css'

const { Title, Text } = Typography
const { Option } = Select

const CaregiverManagement = () => {
  const { patients } = usePatients()
  const [inviteModalVisible, setInviteModalVisible] = useState(false)
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  // Mock caregiver invitations and connections
  const [invitations] = useState([
    {
      id: 'inv1',
      email: 'john.doe@example.com',
      patientName: 'Emma Johnson',
      role: 'secondary',
      status: 'pending',
      sentAt: '2024-06-01T10:00:00Z'
    },
    {
      id: 'inv2',
      email: 'nurse.smith@hospital.com',
      patientName: 'Maria Garcia',
      role: 'medical',
      status: 'accepted',
      sentAt: '2024-05-28T14:30:00Z'
    }
  ])

  const [caregiverConnections] = useState([
    {
      id: 'cg1',
      name: 'Dr. Sarah Wilson',
      email: 'sarah.wilson@clinic.com',
      role: 'medical',
      patients: ['Emma Johnson', 'James Wilson'],
      status: 'active',
      joinedAt: '2024-01-15T08:00:00Z'
    },
    {
      id: 'cg2',
      name: 'Mike Johnson',
      email: 'mike@example.com',
      role: 'family',
      patients: ['Emma Johnson'],
      status: 'active',
      joinedAt: '2024-02-20T12:00:00Z'
    },
    {
      id: 'cg3',
      name: 'Lisa Chen',
      email: 'lisa.chen@nurse.com',
      role: 'nurse',
      patients: ['Maria Garcia'],
      status: 'inactive',
      joinedAt: '2024-03-10T16:00:00Z'
    }
  ])

  const handleSendInvite = async (values) => {
    setLoading(true)
    
    try {
      // TODO: Implement invite API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      message.success(`Invitation sent to ${values.email}!`)
      setInviteModalVisible(false)
      form.resetFields()
      
    } catch (error) {
      message.error('Failed to send invitation. Please try again.')
      console.error('Error sending invite:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveCaregiver = (caregiverId) => {
    Modal.confirm({
      title: 'Remove Caregiver',
      content: 'Are you sure you want to remove this caregiver? They will lose access to patient information.',
      okText: 'Remove',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => {
        // TODO: Implement remove caregiver
        message.success('Caregiver removed successfully!')
      }
    })
  }

  const handleResendInvite = (inviteId) => {
    // TODO: Implement resend invite
    message.success('Invitation resent!')
  }

  const handleCancelInvite = (inviteId) => {
    Modal.confirm({
      title: 'Cancel Invitation',
      content: 'Are you sure you want to cancel this invitation?',
      okText: 'Cancel Invitation',
      okType: 'danger',
      cancelText: 'Keep Invitation',
      onOk: () => {
        // TODO: Implement cancel invite
        message.success('Invitation cancelled!')
      }
    })
  }

  const getRoleColor = (role) => {
    const colors = {
      primary: 'green',
      secondary: 'blue',
      family: 'purple',
      medical: 'red',
      nurse: 'orange',
      other: 'default'
    }
    return colors[role] || 'default'
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />
      case 'inactive':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
      case 'pending':
        return <ClockCircleOutlined style={{ color: '#fa8c16' }} />
      case 'accepted':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />
      default:
        return <ClockCircleOutlined style={{ color: '#8c8c8c' }} />
    }
  }

  const getCaregiverMenuItems = (caregiver) => [
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: 'Edit Role',
      onClick: () => {
        // TODO: Implement edit caregiver role
        message.info('Edit functionality coming soon!')
      }
    },
    {
      key: 'toggle',
      icon: caregiver.status === 'active' ? <CloseCircleOutlined /> : <CheckCircleOutlined />,
      label: caregiver.status === 'active' ? 'Deactivate' : 'Activate',
      onClick: () => {
        // TODO: Implement toggle caregiver status
        message.success(`Caregiver ${caregiver.status === 'active' ? 'deactivated' : 'activated'}!`)
      }
    },
    {
      type: 'divider'
    },
    {
      key: 'remove',
      icon: <DeleteOutlined />,
      label: 'Remove Caregiver',
      onClick: () => handleRemoveCaregiver(caregiver.id),
      danger: true
    }
  ]

  const getInviteMenuItems = (invite) => [
    {
      key: 'resend',
      icon: <SendOutlined />,
      label: 'Resend Invitation',
      onClick: () => handleResendInvite(invite.id),
      disabled: invite.status === 'accepted'
    },
    {
      type: 'divider'
    },
    {
      key: 'cancel',
      icon: <DeleteOutlined />,
      label: 'Cancel Invitation',
      onClick: () => handleCancelInvite(invite.id),
      danger: true,
      disabled: invite.status === 'accepted'
    }
  ]

  return (
    <div className="caregiver-management-section">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Active Caregivers */}
        <div className="settings-group">
          <div className="settings-group-header">
            <div className="group-title">
              <Space>
                <TeamOutlined />
                <span>Caregiver Network ({caregiverConnections.filter(cg => cg.status === 'active').length})</span>
              </Space>
            </div>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => setInviteModalVisible(true)}
              size="small"
            >
              Invite Caregiver
            </Button>
          </div>

          <div className="settings-content">
            {caregiverConnections.length > 0 ? (
              <List
                dataSource={caregiverConnections}
                renderItem={(caregiver) => (
                  <List.Item
                    className="caregiver-list-item"
                    actions={[
                      <Dropdown
                        key="actions"
                        menu={{ items: getCaregiverMenuItems(caregiver) }}
                        placement="bottomRight"
                        trigger={['click']}
                      >
                        <Button type="text" icon={<MoreOutlined />} size="small" />
                      </Dropdown>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar 
                          icon={<UserOutlined />}
                          style={{ 
                            backgroundColor: caregiver.status === 'active' ? '#52c41a' : '#8c8c8c' 
                          }}
                        />
                      }
                      title={
                        <div className="caregiver-header-info">
                          <Space>
                            <Text strong>{caregiver.name}</Text>
                            <Tag color={getRoleColor(caregiver.role)} size="small">
                              {caregiver.role}
                            </Tag>
                            <div className="status-indicator">
                              {getStatusIcon(caregiver.status)}
                              <Text size="small" type={caregiver.status === 'active' ? 'success' : 'secondary'}>
                                {caregiver.status}
                              </Text>
                            </div>
                          </Space>
                        </div>
                      }
                      description={
                        <div className="caregiver-details">
                          <Text type="secondary" style={{ display: 'block' }}>{caregiver.email}</Text>
                          <Space split="•" size="small" style={{ marginTop: 4 }}>
                            <Text type="secondary" size="small">
                              Patients: {caregiver.patients.join(', ')}
                            </Text>
                            <Text type="secondary" size="small">
                              Joined {new Date(caregiver.joinedAt).toLocaleDateString()}
                            </Text>
                          </Space>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty
                image={<TeamOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />}
                description="No caregivers in your network yet"
                style={{ padding: '40px 0' }}
              >
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => setInviteModalVisible(true)}
                >
                  Invite Your First Caregiver
                </Button>
              </Empty>
            )}
          </div>
        </div>

        {/* Pending Invitations */}
        {invitations.length > 0 && (
          <div className="settings-group">
            <div className="settings-group-header">
              <div className="group-title">
                <Space>
                  <SendOutlined />
                  <span>Pending Invitations ({invitations.filter(inv => inv.status === 'pending').length})</span>
                </Space>
              </div>
            </div>

            <div className="settings-content">
              <List
                dataSource={invitations}
                renderItem={(invite) => (
                  <List.Item
                    className="invitation-list-item"
                    actions={[
                      <Dropdown
                        key="actions"
                        menu={{ items: getInviteMenuItems(invite) }}
                        placement="bottomRight"
                        trigger={['click']}
                      >
                        <Button type="text" icon={<MoreOutlined />} size="small" />
                      </Dropdown>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<Avatar icon={<MailOutlined />} size="default" />}
                      title={
                        <div className="invitation-header-info">
                          <Space>
                            <Text strong>{invite.email}</Text>
                            <Tag color={getRoleColor(invite.role)} size="small">
                              {invite.role}
                            </Tag>
                            <div className="status-indicator">
                              {getStatusIcon(invite.status)}
                              <Text size="small" type={invite.status === 'accepted' ? 'success' : 'secondary'}>
                                {invite.status}
                              </Text>
                            </div>
                          </Space>
                        </div>
                      }
                      description={
                        <div className="invitation-details">
                          <Text type="secondary" style={{ display: 'block' }}>
                            Invited to care for {invite.patientName} as {invite.role} caregiver
                          </Text>
                          <Text type="secondary" size="small">
                            Sent {new Date(invite.sentAt).toLocaleDateString()}
                          </Text>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="settings-group">
          <div className="settings-group-header">
            <div className="group-title">
              <Space>
                <TeamOutlined />
                <span>Need Help?</span>
              </Space>
            </div>
          </div>

          <div className="settings-content">
            <div className="help-content">
              <Text type="secondary">
                Caregivers you invite will be able to:
              </Text>
              <ul style={{ marginTop: 8, marginBottom: 0 }}>
                <li><Text size="small">View patient medical information</Text></li>
                <li><Text size="small">Track medications and doses</Text></li>
                <li><Text size="small">Add measurements and daily logs</Text></li>
                <li><Text size="small">Receive notifications about the patient</Text></li>
              </ul>
              <div style={{ marginTop: 12 }}>
                <Text type="secondary" size="small">
                  You can control caregiver permissions and remove access at any time.
                </Text>
              </div>
            </div>
          </div>
        </div>
      </Space>

      {/* Invite Caregiver Modal */}
      <Modal
        title={
          <Space>
            <TeamOutlined />
            <span>Invite Caregiver</span>
          </Space>
        }
        open={inviteModalVisible}
        onCancel={() => {
          setInviteModalVisible(false)
          form.resetFields()
        }}
        footer={[
          <Button 
            key="cancel"
            onClick={() => {
              setInviteModalVisible(false)
              form.resetFields()
            }}
          >
            Cancel
          </Button>,
          <Button 
            key="submit"
            type="primary" 
            htmlType="submit"
            form="invite-caregiver-form"
            loading={loading}
          >
            Send Invitation
          </Button>
        ]}
        destroyOnClose
        className="invite-caregiver-modal"
      >
        <div className="modal-form">
          <Form
            id="invite-caregiver-form"
            form={form}
            layout="vertical"
            onFinish={handleSendInvite}
          >
            <Form.Item
              name="email"
              label="Email Address"
              rules={[
                { required: true, message: 'Please enter email address' },
                { type: 'email', message: 'Please enter a valid email address' }
              ]}
            >
              <Input 
                prefix={<MailOutlined />}
                placeholder="caregiver@example.com" 
              />
            </Form.Item>

            <Form.Item
              name="patientId"
              label="Patient"
              rules={[
                { required: true, message: 'Please select a patient' }
              ]}
            >
              <Select placeholder="Select patient to share">
                {patients.map(patient => (
                  <Option key={patient.id} value={patient.id}>
                    <Space>
                      <UserOutlined />
                      {patient.name}
                    </Space>
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="role"
              label="Role"
              rules={[
                { required: true, message: 'Please select a role' }
              ]}
            >
              <Select placeholder="Select caregiver role">
                <Option value="secondary">Secondary Caregiver</Option>
                <Option value="family">Family Member</Option>
                <Option value="medical">Medical Professional</Option>
                <Option value="nurse">Nurse</Option>
                <Option value="other">Other</Option>
              </Select>
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </div>
  )
}

export default CaregiverManagement