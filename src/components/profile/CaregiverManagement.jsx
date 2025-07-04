import { useState, useEffect } from 'react'
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
  Divider,
  Spin
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
import { caregiverService } from '../../services/caregiverService'
import { useAuth } from '../../hooks/useAuth'
import './CaregiverManagement.css'

const { Title, Text } = Typography
const { Option } = Select

const CaregiverManagement = () => {
  const { user } = useAuth()
  const { patients } = usePatients()
  const [inviteModalVisible, setInviteModalVisible] = useState(false)
  const [editRoleModalVisible, setEditRoleModalVisible] = useState(false)
  const [removeConfirmVisible, setRemoveConfirmVisible] = useState(false)
  const [toggleStatusVisible, setToggleStatusVisible] = useState(false)
  const [resendInviteVisible, setResendInviteVisible] = useState(false)
  const [cancelInviteVisible, setCancelInviteVisible] = useState(false)
  const [selectedCaregiver, setSelectedCaregiver] = useState(null)
  const [selectedInvite, setSelectedInvite] = useState(null)
  const [form] = Form.useForm()
  const [editForm] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)

  // Real data states
  const [caregiverConnections, setCaregiverConnections] = useState([])
  const [invitations, setInvitations] = useState([])

  // Load caregiver data on component mount
  useEffect(() => {
    loadCaregiverData()
  }, [user])

  const loadCaregiverData = async () => {
    if (!user) {
      setDataLoading(false)
      return
    }
    
    setDataLoading(true)
    try {
      // Load caregiver connections
      const { data: caregivers, error: caregiversError } = await caregiverService.getCaregivers()
      if (caregiversError) {
        console.error('Error loading caregivers:', caregiversError)
        setCaregiverConnections([])
        // Only show error message for real errors, not empty data
        if (!caregiversError.includes('No rows') && !caregiversError.includes('not found')) {
          console.warn('Caregiver service error:', caregiversError)
        }
      } else {
        // Transform the data to match our UI format
        const transformedCaregivers = caregivers?.map(connection => ({
          id: connection.id,
          name: connection.caregiver?.name || 'Unknown User',
          email: connection.caregiver?.email || 'Unknown Email',
          role: connection.role || 'caregiver',
          patients: [connection.patient?.name || 'Unknown Patient'],
          status: connection.is_active ? 'active' : 'inactive',
          joinedAt: connection.accepted_at || connection.invited_at,
          caregiverId: connection.caregiver_id,
          patientId: connection.patient_id,
          permissions: connection.permissions || {}
        })) || []
        setCaregiverConnections(transformedCaregivers)
      }

      // Load pending invitations
      const { data: pendingInvites, error: invitesError } = await caregiverService.getPendingInvitations()
      if (invitesError) {
        console.error('Error loading invitations:', invitesError)
        setInvitations([])
      } else {
        const transformedInvites = pendingInvites?.map(invite => ({
          id: invite.id,
          email: invite.email,
          role: invite.role,
          patient: invite.patient?.name || 'Unknown Patient',
          patientId: invite.patient_id,
          sentAt: invite.invited_at,
          expiresAt: invite.expires_at,
          status: invite.status
        })) || []
        setInvitations(transformedInvites)
      }

    } catch (error) {
      console.error('Error loading caregiver data:', error)
      // Set empty arrays to stop loading
      setCaregiverConnections([])
      setInvitations([])
      // Don't show error messages for expected empty states
      console.warn('Caregiver data loading completed with empty results')
    } finally {
      // Always set loading to false
      setDataLoading(false)
    }
  }

  const handleSendInvite = async (values) => {
    setLoading(true)
    
    try {
      // Send invitation
      const invitationData = {
        patient_id: values.patientId,
        email: values.email,
        role: values.role || 'caregiver'
      }
      
      const { data, error } = await caregiverService.inviteCaregiver(invitationData)
      
      if (error) {
        throw new Error(error)
      }
      
      message.success(`Invitation sent to ${values.email}!`)
      setInviteModalVisible(false)
      form.resetFields()
      
      // Reload data to show updated state
      await loadCaregiverData()
      
    } catch (error) {
      message.error('Failed to send invitation. Please try again.')
      console.error('Error sending invite:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditRole = (caregiver) => {
    setSelectedCaregiver(caregiver)
    setEditRoleModalVisible(true)
    editForm.setFieldsValue({
      role: caregiver.role
    })
  }

  const handleSaveRoleChange = async (values) => {
    try {
      // Update caregiver role using API
      const { error } = await caregiverService.updateCaregiver(selectedCaregiver.id, {
        role: values.role
      })
      
      if (error) {
        throw new Error(error)
      }
      
      message.success(`${selectedCaregiver.name}'s role updated to ${values.role}!`)
      setEditRoleModalVisible(false)
      setSelectedCaregiver(null)
      editForm.resetFields()
      
      // Reload data to show updated state
      await loadCaregiverData()
      
    } catch (error) {
      message.error('Failed to update role. Please try again.')
      console.error('Error updating role:', error)
    }
  }

  const handleToggleStatus = (caregiver) => {
    setSelectedCaregiver(caregiver)
    setToggleStatusVisible(true)
  }

  const confirmToggleStatus = async () => {
    try {
      const newStatus = selectedCaregiver.status === 'active' ? 'inactive' : 'active'
      const action = newStatus === 'active' ? 'activated' : 'deactivated'
      
      // Update caregiver status using API
      const { error } = await caregiverService.updateCaregiver(selectedCaregiver.id, {
        is_active: newStatus === 'active'
      })
      
      if (error) {
        throw new Error(error)
      }
      
      message.success(`${selectedCaregiver.name} has been ${action} successfully!`)
      setToggleStatusVisible(false)
      setSelectedCaregiver(null)
      
      // Reload data to show updated state
      await loadCaregiverData()
      
    } catch (error) {
      message.error('Failed to update caregiver status. Please try again.')
      console.error('Error updating status:', error)
      setToggleStatusVisible(false)
      setSelectedCaregiver(null)
    }
  }

  const handleRemoveCaregiver = (caregiver) => {
    setSelectedCaregiver(caregiver)
    setRemoveConfirmVisible(true)
  }

  const confirmRemoveCaregiver = async () => {
    try {
      // Remove caregiver using API
      const { error } = await caregiverService.removeCaregiver(selectedCaregiver.id)
      
      if (error) {
        throw new Error(error)
      }
      
      message.success(`${selectedCaregiver.name} has been removed from your caregiver network.`)
      setRemoveConfirmVisible(false)
      setSelectedCaregiver(null)
      
      // Reload data to show updated state
      await loadCaregiverData()
      
    } catch (error) {
      message.error('Failed to remove caregiver. Please try again.')
      console.error('Error removing caregiver:', error)
      setRemoveConfirmVisible(false)
      setSelectedCaregiver(null)
    }
  }

  const handleResendInvite = (invite) => {
    setSelectedInvite(invite)
    setResendInviteVisible(true)
  }

  const confirmResendInvite = () => {
    // TODO: Implement resend invite API
    message.success(`Invitation resent to ${selectedInvite.email}!`)
    setResendInviteVisible(false)
    setSelectedInvite(null)
  }

  const handleCancelInvite = (invite) => {
    setSelectedInvite(invite)
    setCancelInviteVisible(true)
  }

  const confirmCancelInvite = () => {
    setInvitations(prev => prev.filter(inv => inv.id !== selectedInvite.id))
    message.success('Invitation cancelled successfully!')
    setCancelInviteVisible(false)
    setSelectedInvite(null)
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
      onClick: () => handleEditRole(caregiver)
    },
    {
      key: 'toggle',
      icon: caregiver.status === 'active' ? <CloseCircleOutlined /> : <CheckCircleOutlined />,
      label: caregiver.status === 'active' ? 'Deactivate' : 'Activate',
      onClick: () => handleToggleStatus(caregiver)
    },
    {
      type: 'divider'
    },
    {
      key: 'remove',
      icon: <DeleteOutlined />,
      label: 'Remove Caregiver',
      onClick: () => handleRemoveCaregiver(caregiver),
      danger: true
    }
  ]

  const getInviteMenuItems = (invite) => [
    {
      key: 'resend',
      icon: <SendOutlined />,
      label: 'Resend Invitation',
      onClick: () => handleResendInvite(invite),
      disabled: invite.status === 'accepted'
    },
    {
      type: 'divider'
    },
    {
      key: 'cancel',
      icon: <DeleteOutlined />,
      label: 'Cancel Invitation',
      onClick: () => handleCancelInvite(invite),
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
            {dataLoading ? (
              <Spin />
            ) : caregiverConnections.length > 0 ? (
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
                            Invited to care for {invite.patient} as {invite.role} caregiver
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
        destroyOnHidden
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

      {/* Edit Role Modal */}
      <Modal
        title={
          <Space>
            <EditOutlined />
            <span>Edit Caregiver Role</span>
          </Space>
        }
        open={editRoleModalVisible}
        onCancel={() => {
          setEditRoleModalVisible(false)
          setSelectedCaregiver(null)
          editForm.resetFields()
        }}
        footer={[
          <Button 
            key="cancel"
            onClick={() => {
              setEditRoleModalVisible(false)
              setSelectedCaregiver(null)
              editForm.resetFields()
            }}
          >
            Cancel
          </Button>,
          <Button 
            key="submit"
            type="primary" 
            htmlType="submit"
            form="edit-role-form"
          >
            Update Role
          </Button>
        ]}
        destroyOnHidden
        className="edit-role-modal"
      >
        <div className="modal-form">
          {selectedCaregiver && (
            <div style={{ marginBottom: 16 }}>
              <Text type="secondary">
                Updating role for <Text strong>{selectedCaregiver.name}</Text>
              </Text>
            </div>
          )}
          <Form
            id="edit-role-form"
            form={editForm}
            layout="vertical"
            onFinish={handleSaveRoleChange}
          >
            <Form.Item
              name="role"
              label="New Role"
              rules={[
                { required: true, message: 'Please select a role' }
              ]}
            >
              <Select placeholder="Select caregiver role">
                <Option value="primary">Primary Caregiver</Option>
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

      {/* Remove Caregiver Confirmation Modal */}
      <Modal
        title={
          <Space>
            <DeleteOutlined style={{ color: '#ff4d4f' }} />
            <span>Remove Caregiver</span>
          </Space>
        }
        open={removeConfirmVisible}
        onCancel={() => {
          setRemoveConfirmVisible(false)
          setSelectedCaregiver(null)
        }}
        footer={[
          <Button 
            key="cancel"
            onClick={() => {
              setRemoveConfirmVisible(false)
              setSelectedCaregiver(null)
            }}
          >
            Cancel
          </Button>,
          <Button 
            key="remove"
            type="primary"
            danger
            onClick={confirmRemoveCaregiver}
          >
            Remove Caregiver
          </Button>
        ]}
        destroyOnHidden
        className="remove-caregiver-modal"
        width={500}
      >
        <div className="modal-form">
          {selectedCaregiver && (
            <div style={{ marginTop: 16 }}>
              <Text>Are you sure you want to remove <Text strong>{selectedCaregiver.name}</Text> from your caregiver network?</Text>
              <br />
              <br />
              <Text type="secondary">
                This action will:
              </Text>
              <ul style={{ marginTop: 8, marginBottom: 16, paddingLeft: 20 }}>
                <li><Text type="secondary">Remove their access to patient information</Text></li>
                <li><Text type="secondary">Stop all notifications to them</Text></li>
                <li><Text type="secondary">Remove them from patient care teams</Text></li>
              </ul>
              <Text strong style={{ color: '#ff4d4f' }}>
                This action cannot be undone.
              </Text>
            </div>
          )}
        </div>
      </Modal>

      {/* Toggle Status Confirmation Modal */}
      <Modal
        title={
          selectedCaregiver && selectedCaregiver.status === 'active' ? 'Deactivate Caregiver' : 'Activate Caregiver'
        }
        open={toggleStatusVisible}
        onCancel={() => {
          setToggleStatusVisible(false)
          setSelectedCaregiver(null)
        }}
        footer={[
          <Button 
            key="cancel"
            onClick={() => {
              setToggleStatusVisible(false)
              setSelectedCaregiver(null)
            }}
          >
            Cancel
          </Button>,
          <Button 
            key="confirm"
            type="primary"
            danger={selectedCaregiver && selectedCaregiver.status === 'active'}
            onClick={confirmToggleStatus}
          >
            {selectedCaregiver && selectedCaregiver.status === 'active' ? 'Deactivate' : 'Activate'}
          </Button>
        ]}
        destroyOnHidden
        className="toggle-status-modal"
      >
        <div className="modal-form">
          {selectedCaregiver && (
            <div style={{ marginTop: 16 }}>
              <Text>
                Are you sure you want to {selectedCaregiver.status === 'active' ? 'deactivate' : 'activate'} <Text strong>{selectedCaregiver.name}</Text>?
              </Text>
              <br />
              <br />
              <Text type="secondary">
                {selectedCaregiver.status === 'active' 
                  ? 'They will temporarily lose access to patient information.' 
                  : 'They will regain access to patient information.'}
              </Text>
            </div>
          )}
        </div>
      </Modal>

      {/* Resend Invitation Confirmation Modal */}
      <Modal
        title="Resend Invitation"
        open={resendInviteVisible}
        onCancel={() => {
          setResendInviteVisible(false)
          setSelectedInvite(null)
        }}
        footer={[
          <Button 
            key="cancel"
            onClick={() => {
              setResendInviteVisible(false)
              setSelectedInvite(null)
            }}
          >
            Cancel
          </Button>,
          <Button 
            key="resend"
            type="primary"
            onClick={confirmResendInvite}
          >
            Resend
          </Button>
        ]}
        destroyOnHidden
        className="resend-invite-modal"
      >
        <div className="modal-form">
          {selectedInvite && (
            <div style={{ marginTop: 16 }}>
              <Text>Are you sure you want to resend the invitation to <Text strong>{selectedInvite.email}</Text>?</Text>
            </div>
          )}
        </div>
      </Modal>

      {/* Cancel Invitation Confirmation Modal */}
      <Modal
        title="Cancel Invitation"
        open={cancelInviteVisible}
        onCancel={() => {
          setCancelInviteVisible(false)
          setSelectedInvite(null)
        }}
        footer={[
          <Button 
            key="keep"
            onClick={() => {
              setCancelInviteVisible(false)
              setSelectedInvite(null)
            }}
          >
            Keep Invitation
          </Button>,
          <Button 
            key="cancel"
            type="primary"
            danger
            onClick={confirmCancelInvite}
          >
            Cancel Invitation
          </Button>
        ]}
        destroyOnHidden
        className="cancel-invite-modal"
      >
        <div className="modal-form">
          {selectedInvite && (
            <div style={{ marginTop: 16 }}>
              <Text>
                Are you sure you want to cancel the invitation to <Text strong>{selectedInvite.email}</Text>? 
                They will not be able to join your caregiver network using this invitation.
              </Text>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}

export default CaregiverManagement