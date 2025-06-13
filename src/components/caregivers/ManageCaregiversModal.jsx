import { useState, useEffect } from 'react'
import { 
  Modal, 
  Form, 
  Input, 
  Button, 
  Space, 
  Typography, 
  message, 
  List,
  Card,
  Avatar,
  Popconfirm,
  Row,
  Col,
  Divider
} from 'antd'
import { 
  UserAddOutlined, 
  DeleteOutlined, 
  MailOutlined,
  PhoneOutlined,
  UserOutlined
} from '@ant-design/icons'
import { useCaregivers } from '../../hooks/useCaregivers'
import PhoneInput from '../common/PhoneInput'
import { createPhoneValidationRulesSync, formatPhoneForStorage, parsePhoneFromStorage } from '../../utils/phoneValidation'
import './ManageCaregiversModal.css'

const { Title, Text } = Typography

const ManageCaregiversModal = ({ visible, onClose, patientId }) => {
  const [form] = Form.useForm()
  const { caregivers, inviteCaregiver, removeCaregiver, loading } = useCaregivers(patientId)
  const [inviting, setInviting] = useState(false)

  const handleInvite = async (values) => {
    setInviting(true)
    
    try {
      const inviteData = {
        ...values,
        phone: formatPhoneForStorage(values.phone)
      }
      
      await inviteCaregiver(inviteData)
      message.success(`Invitation sent to ${values.name}!`)
      form.resetFields()
    } catch (error) {
      message.error(error.message || 'Failed to send invitation')
      console.error('Error inviting caregiver:', error)
    } finally {
      setInviting(false)
    }
  }

  const handleRemove = async (caregiverId) => {
    try {
      await removeCaregiver(caregiverId)
      message.success('Caregiver removed successfully')
    } catch (error) {
      message.error(error.message || 'Failed to remove caregiver')
      console.error('Error removing caregiver:', error)
    }
  }

  const handleClose = () => {
    form.resetFields()
    onClose()
  }

  return (
    <Modal
      title={
        <Space>
          <UserAddOutlined />
          <span>Manage Caregivers</span>
        </Space>
      }
      open={visible}
      onCancel={handleClose}
      footer={null}
      width={700}
      destroyOnHidden
      className="manage-caregivers-modal"
    >
      <div className="caregivers-content">
        {/* Invite New Caregiver */}
        <Card title="Invite New Caregiver" className="invite-card">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleInvite}
            className="invite-form"
          >
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="name"
                  label="Full Name"
                  rules={[
                    { required: true, message: 'Please enter caregiver name' },
                    { min: 2, message: 'Name must be at least 2 characters' }
                  ]}
                >
                  <Input 
                    placeholder="Enter caregiver's full name"
                    prefix={<UserOutlined />}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12}>
                <Form.Item
                  name="email"
                  label="Email Address"
                  rules={[
                    { required: true, message: 'Please enter email address' },
                    { type: 'email', message: 'Please enter a valid email address' }
                  ]}
                >
                  <Input 
                    placeholder="Enter email address"
                    prefix={<MailOutlined />}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="phone"
              label="Phone Number (Optional)"
              rules={createPhoneValidationRulesSync(null, false)}
            >
              <PhoneInput 
                placeholder="Enter phone number"
              />
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={inviting}
                icon={<UserAddOutlined />}
                block
              >
                Send Invitation
              </Button>
            </Form.Item>
          </Form>
        </Card>

        <Divider />

        {/* Current Caregivers */}
        <div className="current-caregivers">
          <Title level={5}>Current Caregivers</Title>
          
          {loading ? (
            <div className="loading-state">Loading caregivers...</div>
          ) : caregivers.length === 0 ? (
            <div className="empty-state">
              <Text type="secondary">No caregivers assigned yet</Text>
            </div>
          ) : (
            <List
              dataSource={caregivers}
              renderItem={(caregiver) => (
                <List.Item
                  actions={[
                    <Popconfirm
                      title="Remove Caregiver"
                      description="Are you sure you want to remove this caregiver?"
                      onConfirm={() => handleRemove(caregiver.id)}
                      okText="Remove"
                      cancelText="Cancel"
                      okType="danger"
                    >
                      <Button 
                        type="text" 
                        danger 
                        icon={<DeleteOutlined />}
                        size="small"
                      >
                        Remove
                      </Button>
                    </Popconfirm>
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} />}
                    title={caregiver.name}
                    description={
                      <Space direction="vertical" size="small">
                        <Text type="secondary">
                          <MailOutlined /> {caregiver.email}
                        </Text>
                        {caregiver.phone && (
                          <Text type="secondary">
                            <PhoneOutlined /> {caregiver.phone}
                          </Text>
                        )}
                        <Text type="secondary" size="small">
                          Status: {caregiver.status || 'Active'}
                        </Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </div>
      </div>
    </Modal>
  )
}

export default ManageCaregiversModal 