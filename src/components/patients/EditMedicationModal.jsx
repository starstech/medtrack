import { useState, useEffect } from 'react'
import { 
  Modal, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  Button, 
  Space, 
  Typography,
  Row,
  Col,
  message,
  Switch
} from 'antd'
import { 
  MedicineBoxOutlined,
  EditOutlined
} from '@ant-design/icons'
import { usePatients } from '../../hooks/usePatients'
import { MEDICATION_FREQUENCIES, MEDICATION_FORMS } from '../../constants'
import dayjs from 'dayjs'
import './EditMedicationModal.css'

const { Title, Text } = Typography
const { Option } = Select
const { TextArea } = Input
const { RangePicker } = DatePicker

const EditMedicationModal = ({ visible, onClose, medication }) => {
  const [form] = Form.useForm()
  const { updateMedication } = usePatients()
  const [loading, setLoading] = useState(false)

  // Initialize form with medication data when modal opens
  useEffect(() => {
    if (visible && medication) {
      form.setFieldsValue({
        name: medication.name,
        dosage: medication.dosage,
        form: medication.form,
        frequency: medication.frequency,
        prescribedBy: medication.prescribedBy,
        instructions: medication.instructions,
        isActive: medication.isActive,
        dateRange: [
          dayjs(medication.startDate),
          medication.endDate ? dayjs(medication.endDate) : null
        ]
      })
    }
  }, [visible, medication, form])

  const handleSubmit = async (values) => {
    setLoading(true)
    
    try {
      const medicationData = {
        ...medication,
        ...values,
        startDate: values.dateRange[0].format('YYYY-MM-DD'),
        endDate: values.dateRange[1]?.format('YYYY-MM-DD') || null
      }

      // Remove dateRange from the data since it's not part of the medication schema
      delete medicationData.dateRange

      await updateMedication(medication.id, medicationData)
      
      message.success(`${values.name} has been updated successfully!`)
      handleClose()
      
    } catch (error) {
      message.error('Failed to update medication. Please try again.')
      console.error('Error updating medication:', error)
    } finally {
      setLoading(false)
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
          <EditOutlined />
          <Title level={4} style={{ margin: 0 }}>
            Edit Medication
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
          key="submit"
          type="primary"
          htmlType="submit"
          loading={loading}
          size="large"
          form="edit-medication-form"
        >
          {loading ? 'Updating...' : 'Save Changes'}
        </Button>
      ]}
      width={800}
      destroyOnHidden
      className="edit-medication-modal"
      centered
    >
      <Form
        id="edit-medication-form"
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        size="large"
        className="edit-medication-form"
      >
        {/* Basic Information */}
        <div className="form-section">
          <Title level={5}>Medication Details</Title>
          
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
        </div>

        {/* Duration and Status */}
        <div className="form-section">
          <Title level={5}>Duration & Status</Title>
          
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
            name="isActive"
            label="Status"
            valuePropName="checked"
          >
            <Switch 
              checkedChildren="Active" 
              unCheckedChildren="Inactive"
            />
          </Form.Item>
        </div>

        {/* Instructions */}
        <div className="form-section">
          <Title level={5}>Instructions</Title>
          
          <Form.Item
            name="instructions"
            label="Special Instructions"
          >
            <TextArea 
              placeholder="e.g., Take with food, avoid alcohol"
              rows={3}
            />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  )
}

export default EditMedicationModal 