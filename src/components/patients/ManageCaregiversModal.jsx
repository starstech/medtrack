import { useState, useEffect } from 'react'
import { 
  Modal, 
  Form, 
  Input, 
  Select, 
  Button, 
  Space, 
  Typography,
  List,
  Avatar,
  Tag,
  message,
  Divider,
  Popconfirm
} from 'antd'
import { 
  UserOutlined, 
  TeamOutlined,
  PlusOutlined, 
  EditOutlined,
  DeleteOutlined,
  MailOutlined,
  PhoneOutlined
} from '@ant-design/icons'
import { usePatients } from '../../hooks/usePatients'
import './ManageCaregiversModal.css'

const { Title, Text } = Typography
const { Option } = Select

const ManageCaregiversModal = ({ visible, onClose, patient }) => {
  const [form] = Form.useForm()
  const { updatePatient } = usePatients()
  const [loading, setLoading] = useState(false)
  const [caregivers, setCaregivers] = useState([])
  const [editingCaregiver, setEditingCaregiver] = useState(null)
  const [isAddingNew, setIsAddingNew] = useState(false)

  // Initialize caregivers when modal opens
  useEffect(() => {
    if (visible && patient) {
      setCaregivers(patient.caregivers || [])
    }
  }, [visible, patient])

  const handleSubmit = async (values) => {
    try {
      const newCaregiver = {
        id: editingCaregiver?.id || `caregiver_${Date.now()}`,
        name: values.name,
        email: values.email,
        phone: values.phone,
        role: values.role
      }

      let updatedCaregivers
      if (editingCaregiver) {
        // Update existing caregiver
        updatedCaregivers = caregivers.map(c => 
          c.id === editingCaregiver.id ? newCaregiver : c
        )
      } else {
        // Add new caregiver
        updatedCaregivers = [...caregivers, newCaregiver]
      }

      setCaregivers(updatedCaregivers)
      resetForm()
      message.success(editingCaregiver ? 'Caregiver updated successfully!' : 'Caregiver added successfully!')
    } catch (error) {
      message.error('Failed to save caregiver. Please try again.')
      console.error('Error saving caregiver:', error)
    }
  }

  const handleDeleteCaregiver = (caregiverId) => {
    const updatedCaregivers = caregivers.filter(c => c.id !== caregiverId)
    setCaregivers(updatedCaregivers)
    message.success('Caregiver removed successfully!')
  }

  const handleEditCaregiver = (caregiver) => {
    setEditingCaregiver(caregiver)
    setIsAddingNew(true)
    form.setFieldsValue({
      name: caregiver.name,
      email: caregiver.email,
      phone: caregiver.phone,
      role: caregiver.role
    })
  }

  const handleAddNew = () => {
    setIsAddingNew(true)
    setEditingCaregiver(null)
    form.resetFields()
  }

  const resetForm = () => {
    setIsAddingNew(false)
    setEditingCaregiver(null)
    form.resetFields()
  }

  const handleSaveAllChanges = async () => {
    setLoading(true)
    
    try {
      const updatedPatient = {
        ...patient,
        caregivers: caregivers
      }

      await updatePatient(patient.id, updatedPatient)
      
      message.success('Caregiver information updated successfully!')
      handleClose()
      
    } catch (error) {
      message.error('Failed to save changes. Please try again.')
      console.error('Error updating patient:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    resetForm()
    setCaregivers([])
    onClose()
  }

  const getRoleColor = (role) => {
    const colors = {
      primary: 'green',
      secondary: 'blue',
      family: 'gold',
      medical: 'red',
      nurse: 'orange',
      other: 'purple'
    }
    return colors[role] || 'default'
  }

  return (
    <Modal
      title={
        <Space>
          <TeamOutlined />
          <Title level={4} style={{ margin: 0 }}>
            Manage Caregivers
          </Title>
        </Space>
      }
      open={visible}
      onCancel={handleClose}
      footer={[
        <Button
          key="cancel"
          onClick={handleClose}
          size="large"
          disabled={loading}
        >
          Cancel
        </Button>,
        <Button
          key="save"
          type="primary"
          onClick={handleSaveAllChanges}
          loading={loading}
          size="large"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      ]}
      width={800}
      destroyOnHidden
      className="manage-caregivers-modal"
      centered
    >
      <div className="caregivers-content">
        {/* Current Caregivers List */}
        <div className="caregivers-section">
          <div className="section-header">
            <Title level={5}>Current Caregivers ({caregivers.length})</Title>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddNew}
              disabled={isAddingNew}
            >
              Add Caregiver
            </Button>
          </div>

          {caregivers.length > 0 ? (
            <List
              className="caregivers-list"
              dataSource={caregivers}
              renderItem={(caregiver) => (
                <List.Item
                  className="caregiver-item"
                  actions={[
                    <Button
                      key="edit"
                      type="text"
                      icon={<EditOutlined />}
                      onClick={() => handleEditCaregiver(caregiver)}
                      disabled={isAddingNew}
                    >
                      Edit
                    </Button>,
                    <Popconfirm
                      key="delete"
                      title="Are you sure you want to remove this caregiver?"
                      onConfirm={() => handleDeleteCaregiver(caregiver.id)}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button
                        type="text"
                        icon={<DeleteOutlined />}
                        danger
                        disabled={isAddingNew}
                      >
                        Remove
                      </Button>
                    </Popconfirm>
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar size="large" icon={<UserOutlined />} />}
                    title={
                      <Space>
                        <Text strong>{caregiver.name}</Text>
                        <Tag color={getRoleColor(caregiver.role)} size="small">
                          {caregiver.role}
                        </Tag>
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size={4}>
                        {caregiver.email && (
                          <Space size={4}>
                            <MailOutlined className="contact-icon" />
                            <Text type="secondary">{caregiver.email}</Text>
                          </Space>
                        )}
                        {caregiver.phone && (
                          <Space size={4}>
                            <PhoneOutlined className="contact-icon" />
                            <Text type="secondary">{caregiver.phone}</Text>
                          </Space>
                        )}
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          ) : (
            <div className="empty-state">
              <TeamOutlined className="empty-icon" />
              <Text type="secondary">No caregivers assigned yet</Text>
            </div>
          )}
        </div>

        {/* Add/Edit Caregiver Form */}
        {isAddingNew && (
          <>
            <Divider />
            <div className="add-caregiver-section">
              <Title level={5}>
                {editingCaregiver ? 'Edit Caregiver' : 'Add New Caregiver'}
              </Title>
              
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                size="large"
                className="caregiver-form"
              >
                <Form.Item
                  name="name"
                  label="Full Name"
                  rules={[
                    { required: true, message: 'Please enter caregiver name' },
                    { min: 2, message: 'Name must be at least 2 characters' }
                  ]}
                >
                  <Input
                    placeholder="Enter full name"
                    prefix={<UserOutlined />}
                  />
                </Form.Item>

                <Form.Item
                  name="role"
                  label="Role"
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

                <Form.Item
                  name="email"
                  label="Email Address"
                  rules={[
                    { type: 'email', message: 'Please enter a valid email address' }
                  ]}
                >
                  <Input
                    placeholder="Enter email address"
                    prefix={<MailOutlined />}
                  />
                </Form.Item>

                <Form.Item
                  name="phone"
                  label="Phone Number (Optional)"
                  rules={[
                    { pattern: /^[\+]?[\d\s\-\(\)\.]{7,20}$/, message: 'Please enter a valid phone number' }
                  ]}
                >
                  <Input
                    placeholder="Enter phone number"
                    prefix={<PhoneOutlined />}
                  />
                </Form.Item>

                <Space>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={editingCaregiver ? <EditOutlined /> : <PlusOutlined />}
                  >
                    {editingCaregiver ? 'Update Caregiver' : 'Add Caregiver'}
                  </Button>
                  <Button onClick={resetForm}>
                    Cancel
                  </Button>
                </Space>
              </Form>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}

export default ManageCaregiversModal 