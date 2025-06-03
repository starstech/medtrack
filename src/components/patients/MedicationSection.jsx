import { useState } from 'react'
import { 
  Card, 
  List, 
  Button, 
  Space, 
  Typography, 
  Tag, 
  Avatar, 
  Empty,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Switch,
  Row,
  Col,
  message,
  Dropdown
} from 'antd'
import { 
  MedicineBoxOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  MoreOutlined,
  CalendarOutlined
} from '@ant-design/icons'
import { usePatients } from '../../hooks/usePatients'
import { MEDICATION_FREQUENCIES, MEDICATION_FORMS } from '../../utils/mockData'
import dayjs from 'dayjs'
import './MedicationSection.css'

const { Title, Text } = Typography
const { Option } = Select
const { TextArea } = Input
const { RangePicker } = DatePicker

const MedicationSection = ({ patient }) => {
  const { getPatientMedications, addMedication } = usePatients()
  const [addModalVisible, setAddModalVisible] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [selectedMedication, setSelectedMedication] = useState(null)
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const medications = getPatientMedications(patient.id)
  const activeMedications = medications.filter(med => med.isActive)
  const inactiveMedications = medications.filter(med => !med.isActive)

  const handleAddMedication = async (values) => {
    setLoading(true)
    
    try {
      const medicationData = {
        ...values,
        startDate: values.dateRange[0].format('YYYY-MM-DD'),
        endDate: values.dateRange[1]?.format('YYYY-MM-DD') || null,
        isActive: true
      }

      await addMedication(patient.id, medicationData)
      
      message.success('Medication added successfully!')
      setAddModalVisible(false)
      form.resetFields()
      
    } catch (error) {
      message.error('Failed to add medication. Please try again.')
      console.error('Error adding medication:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditMedication = (medication) => {
    setSelectedMedication(medication)
    setEditModalVisible(true)
    form.setFieldsValue({
      ...medication,
      dateRange: [
        dayjs(medication.startDate),
        medication.endDate ? dayjs(medication.endDate) : null
      ]
    })
  }

  const handleDeleteMedication = (medicationId) => {
    Modal.confirm({
      title: 'Delete Medication',
      content: 'Are you sure you want to delete this medication? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => {
        // TODO: Implement delete functionality
        message.success('Medication deleted successfully!')
      }
    })
  }

  const getMenuItems = (medication) => [
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: 'Edit Medication',
      onClick: () => handleEditMedication(medication)
    },
    {
      key: 'toggle',
      icon: medication.isActive ? <ExclamationCircleOutlined /> : <CheckCircleOutlined />,
      label: medication.isActive ? 'Mark Inactive' : 'Mark Active',
      onClick: () => {
        // TODO: Implement toggle functionality
        message.success(`Medication marked as ${medication.isActive ? 'inactive' : 'active'}!`)
      }
    },
    {
      type: 'divider'
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: 'Delete Medication',
      onClick: () => handleDeleteMedication(medication.id),
      danger: true
    }
  ]

  const getMedicationStatus = (medication) => {
    if (!medication.isActive) {
      return { color: 'default', text: 'Inactive' }
    }
    
    if (medication.endDate) {
      const endDate = dayjs(medication.endDate)
      const today = dayjs()
      
      if (endDate.isBefore(today)) {
        return { color: 'red', text: 'Expired' }
      } else if (endDate.diff(today, 'days') <= 7) {
        return { color: 'orange', text: 'Ending Soon' }
      }
    }
    
    return { color: 'green', text: 'Active' }
  }

  const renderMedicationItem = (medication) => {
    const status = getMedicationStatus(medication)
    
    return (
      <div className="medication-list-item" key={medication.id}>
        <div className="medication-item">
          <div className="medication-primary">
            <div className="medication-name-row">
              <Text strong className="medication-name">
                {medication.name}
              </Text>
              <Tag color={status.color} size="small" className="medication-status">
                {status.text}
              </Tag>
            </div>
            
            <div className="medication-details-row">
              <Text type="secondary" size="small">
                {medication.dosage} {medication.form} • {MEDICATION_FREQUENCIES.find(f => f.value === medication.frequency)?.label || medication.frequency} • Dr. {medication.prescribedBy}
              </Text>
            </div>
            
            {medication.instructions && (
              <div className="medication-notes">
                <Text size="small" type="secondary">
                  {medication.instructions}
                </Text>
              </div>
            )}

            {medication.doses && medication.doses.length > 0 && (
              <div className="medication-doses">
                <Space size="small">
                  {medication.doses.slice(0, 2).map(dose => (
                    <Tag 
                      key={dose.id}
                      color={dose.status === 'taken' ? 'green' : dose.status === 'missed' ? 'red' : 'orange'}
                      size="small"
                    >
                      {dayjs(dose.scheduledTime).format('MMM D')} {dose.status}
                    </Tag>
                  ))}
                </Space>
              </div>
            )}
          </div>
          
          <div className="medication-actions">
            <Button
              size="small"
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditMedication(medication)}
              className="list-action-btn"
            />
            <Dropdown
              menu={{ items: getMenuItems(medication) }}
              placement="bottomLeft"
              trigger={['click']}
            >
              <Button 
                size="small" 
                type="text" 
                icon={<MoreOutlined />} 
                className="list-action-btn"
              />
            </Dropdown>
          </div>
        </div>
      </div>
    )
  }

  const renderAddMedicationModal = () => (
    <Modal
      title={
        <Space>
          <MedicineBoxOutlined />
          <span>Add New Medication</span>
        </Space>
      }
      open={addModalVisible}
      onCancel={() => {
        setAddModalVisible(false)
        form.resetFields()
      }}
      footer={null}
      width={600}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleAddMedication}
        size="large"
      >
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="name"
              label="Medication Name"
              rules={[
                { required: true, message: 'Please enter medication name' }
              ]}
            >
              <Input placeholder="e.g., Amoxicillin" />
            </Form.Item>
          </Col>
          
          <Col xs={24} sm={12}>
            <Form.Item
              name="dosage"
              label="Dosage"
              rules={[
                { required: true, message: 'Please enter dosage' }
              ]}
            >
              <Input placeholder="e.g., 250mg" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="form"
              label="Form"
              rules={[
                { required: true, message: 'Please select medication form' }
              ]}
            >
              <Select placeholder="Select form">
                {MEDICATION_FORMS.map(form => (
                  <Option key={form.value} value={form.value}>
                    {form.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          
          <Col xs={24} sm={12}>
            <Form.Item
              name="frequency"
              label="Frequency"
              rules={[
                { required: true, message: 'Please select frequency' }
              ]}
            >
              <Select placeholder="Select frequency">
                {MEDICATION_FREQUENCIES.map(freq => (
                  <Option key={freq.value} value={freq.value}>
                    {freq.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="prescribedBy"
          label="Prescribed By"
          rules={[
            { required: true, message: 'Please enter prescribing doctor' }
          ]}
        >
          <Input placeholder="e.g., Dr. Smith" />
        </Form.Item>

        <Form.Item
          name="dateRange"
          label="Duration"
          rules={[
            { required: true, message: 'Please select start date' }
          ]}
        >
          <RangePicker
            style={{ width: '100%' }}
            placeholder={['Start Date', 'End Date (Optional)']}
          />
        </Form.Item>

        <Form.Item
          name="instructions"
          label="Instructions"
        >
          <TextArea 
            placeholder="e.g., Take with food, avoid alcohol"
            rows={3}
          />
        </Form.Item>

        <div style={{ textAlign: 'right' }}>
          <Space>
            <Button onClick={() => {
              setAddModalVisible(false)
              form.resetFields()
            }}>
              Cancel
            </Button>
            <Button 
              type="primary" 
              htmlType="submit"
              loading={loading}
            >
              Add Medication
            </Button>
          </Space>
        </div>
      </Form>
    </Modal>
  )

  return (
    <div className="medication-section">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Active Medications */}
        <div className="medication-group">
          <div className="medication-group-header">
            <div className="group-title">
              <Space>
                <MedicineBoxOutlined />
                <span>Active Medications ({activeMedications.length})</span>
              </Space>
            </div>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => setAddModalVisible(true)}
              size="small"
            >
              Add Medication
            </Button>
          </div>

          <div className="medication-list-container">
            {activeMedications.length > 0 ? (
              <div className="medications-list active-medications-list">
                {activeMedications.map(medication => renderMedicationItem(medication))}
              </div>
            ) : (
              <div className="empty-medication-list">
                <Empty
                  image={<MedicineBoxOutlined style={{ fontSize: 32, color: '#d9d9d9' }} />}
                  description="No active medications"
                  style={{ padding: '32px 16px' }}
                >
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    onClick={() => setAddModalVisible(true)}
                    size="small"
                  >
                    Add First Medication
                  </Button>
                </Empty>
              </div>
            )}
          </div>
        </div>

        {/* Inactive Medications */}
        <div className="medication-group inactive-medications">
          <div className="medication-group-header">
            <div className="group-title">
              <Space>
                <ExclamationCircleOutlined />
                <span>Inactive Medications ({inactiveMedications.length})</span>
              </Space>
            </div>
          </div>

          <div className="medication-list-container">
            {inactiveMedications.length > 0 ? (
              <div className="medications-list inactive-medications-list">
                {inactiveMedications.map(medication => renderMedicationItem(medication))}
              </div>
            ) : (
              <div className="empty-medication-list">
                <Empty
                  image={<ExclamationCircleOutlined style={{ fontSize: 32, color: '#d9d9d9' }} />}
                  description="No inactive medications"
                  style={{ padding: '32px 16px' }}
                />
              </div>
            )}
          </div>
        </div>
      </Space>

      {renderAddMedicationModal()}
    </div>
  )
}

export default MedicationSection