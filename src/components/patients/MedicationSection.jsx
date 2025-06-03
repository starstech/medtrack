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

  const renderMedicationCard = (medication) => {
    const status = getMedicationStatus(medication)
    
    return (
      <List.Item className="medication-list-item">
        <Card 
          className="medication-card"
          size="small"
        >
          <div className="medication-content">
            <div className="medication-header">
              <div className="medication-title">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text strong className="medication-name">
                    {medication.name}
                  </Text>
                  <Tag color={status.color} size="small">
                    {status.text}
                  </Tag>
                </div>
                <Text type="secondary" size="small">
                  {medication.dosage} {medication.form} • {MEDICATION_FREQUENCIES.find(f => f.value === medication.frequency)?.label || medication.frequency}
                </Text>
              </div>
            </div>

            <div className="medication-details">
              <Row gutter={[12, 4]}>
                <Col xs={24} sm={12}>
                  <Text type="secondary" size="small">Dr. {medication.prescribedBy}</Text>
                </Col>
                <Col xs={24} sm={12}>
                  <Text type="secondary" size="small">
                    {dayjs(medication.startDate).format('MMM D')} - {medication.endDate ? dayjs(medication.endDate).format('MMM D, YYYY') : 'Ongoing'}
                  </Text>
                </Col>
              </Row>

              {medication.instructions && (
                <div className="medication-instructions">
                  <Text size="small" type="secondary">{medication.instructions}</Text>
                </div>
              )}

              {medication.doses && medication.doses.length > 0 && (
                <div className="recent-doses">
                  <Space size="small">
                    {medication.doses.slice(0, 3).map(dose => (
                      <Tag 
                        key={dose.id}
                        color={dose.status === 'taken' ? 'green' : dose.status === 'missed' ? 'red' : 'orange'}
                        size="small"
                      >
                        {dayjs(dose.scheduledTime).format('MMM D')} - {dose.status}
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
                className="card-action-btn"
              >
                Edit
              </Button>
              <Dropdown
                menu={{ items: getMenuItems(medication) }}
                placement="bottomRight"
                trigger={['click']}
              >
                <Button size="small" type="text" icon={<MoreOutlined />} className="card-action-btn">
                  More
                </Button>
              </Dropdown>
            </div>
          </div>
        </Card>
      </List.Item>
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
        <Card
          title={
            <Space>
              <MedicineBoxOutlined />
              <span>Active Medications ({activeMedications.length})</span>
            </Space>
          }
          extra={
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => setAddModalVisible(true)}
            >
              Add Medication
            </Button>
          }
          className="medications-card"
        >
          {activeMedications.length > 0 ? (
            <List
              dataSource={activeMedications}
              renderItem={renderMedicationCard}
              className="medications-list"
            />
          ) : (
            <Empty
              image={<MedicineBoxOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />}
              description="No active medications"
              style={{ padding: '40px 0' }}
            >
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => setAddModalVisible(true)}
              >
                Add First Medication
              </Button>
            </Empty>
          )}
        </Card>

        {/* Inactive Medications */}
        {inactiveMedications.length > 0 && (
          <Card
            title={
              <Space>
                <ExclamationCircleOutlined />
                <span>Inactive Medications ({inactiveMedications.length})</span>
              </Space>
            }
            className="medications-card inactive-medications"
          >
            <List
              dataSource={inactiveMedications}
              renderItem={renderMedicationCard}
              className="medications-list"
            />
          </Card>
        )}
      </Space>

      {renderAddMedicationModal()}
    </div>
  )
}

export default MedicationSection