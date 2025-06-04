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
  message
} from 'antd'
import { 
  UserOutlined, 
  PlusOutlined, 
  DeleteOutlined,
  EditOutlined
} from '@ant-design/icons'
import { usePatients } from '../../hooks/usePatients'
import dayjs from 'dayjs'
import './EditPatientModal.css'

const { Title, Text } = Typography
const { Option } = Select
const { TextArea } = Input

const EditPatientModal = ({ visible, onClose, patient }) => {
  const [form] = Form.useForm()
  const { updatePatient } = usePatients()
  const [loading, setLoading] = useState(false)
  const [allergies, setAllergies] = useState([''])
  const [conditions, setConditions] = useState([''])

  // Initialize form with patient data when modal opens
  useEffect(() => {
    if (visible && patient) {
      form.setFieldsValue({
        name: patient.name,
        dateOfBirth: patient.dateOfBirth ? dayjs(patient.dateOfBirth) : null,
        gender: patient.gender,
        emergencyContactName: patient.emergencyContact?.name || '',
        emergencyContactRelationship: patient.emergencyContact?.relationship || '',
        emergencyContactPhone: patient.emergencyContact?.phone || ''
      })
      
      setAllergies(patient.allergies?.length > 0 ? patient.allergies : [''])
      setConditions(patient.medicalConditions?.length > 0 ? patient.medicalConditions : [''])
    }
  }, [visible, patient, form])

  const handleSubmit = async (values) => {
    setLoading(true)
    
    try {
      // Clean up allergies and conditions arrays
      const cleanAllergies = allergies.filter(allergy => allergy.trim() !== '')
      const cleanConditions = conditions.filter(condition => condition.trim() !== '')
      
      const patientData = {
        ...patient,
        ...values,
        dateOfBirth: values.dateOfBirth.format('YYYY-MM-DD'),
        allergies: cleanAllergies,
        medicalConditions: cleanConditions,
        emergencyContact: {
          name: values.emergencyContactName,
          relationship: values.emergencyContactRelationship,
          phone: values.emergencyContactPhone
        }
      }

      // Remove emergency contact fields from top level
      delete patientData.emergencyContactName
      delete patientData.emergencyContactRelationship
      delete patientData.emergencyContactPhone

      await updatePatient(patient.id, patientData)
      
      message.success(`${values.name}'s information has been updated successfully!`)
      handleClose()
      
    } catch (error) {
      message.error('Failed to update patient. Please try again.')
      console.error('Error updating patient:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    form.resetFields()
    setAllergies([''])
    setConditions([''])
    onClose()
  }

  const addAllergyField = () => {
    setAllergies([...allergies, ''])
  }

  const removeAllergyField = (index) => {
    const newAllergies = allergies.filter((_, i) => i !== index)
    setAllergies(newAllergies.length > 0 ? newAllergies : [''])
  }

  const updateAllergy = (index, value) => {
    const newAllergies = [...allergies]
    newAllergies[index] = value
    setAllergies(newAllergies)
  }

  const addConditionField = () => {
    setConditions([...conditions, ''])
  }

  const removeConditionField = (index) => {
    const newConditions = conditions.filter((_, i) => i !== index)
    setConditions(newConditions.length > 0 ? newConditions : [''])
  }

  const updateCondition = (index, value) => {
    const newConditions = [...conditions]
    newConditions[index] = value
    setConditions(newConditions)
  }

  const disabledDate = (current) => {
    // Disable future dates
    return current && current > dayjs().endOf('day')
  }

  return (
    <Modal
      title={
        <Space>
          <EditOutlined />
          <Title level={4} style={{ margin: 0 }}>
            Edit Patient Information
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
          form="edit-patient-form"
        >
          {loading ? 'Updating...' : 'Save Changes'}
        </Button>
      ]}
      width={800}
      destroyOnHidden
      className="edit-patient-modal"
      centered
    >
      <Form
        id="edit-patient-form"
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        size="large"
        className="edit-patient-form"
      >
        {/* Basic Information */}
        <div className="form-section">
          <Title level={5}>Basic Information</Title>
          
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="name"
                label="Full Name"
                rules={[
                  { required: true, message: 'Please enter the patient name' },
                  { min: 2, message: 'Name must be at least 2 characters' }
                ]}
              >
                <Input
                  placeholder="Enter full name"
                  prefix={<UserOutlined />}
                />
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={12}>
              <Form.Item
                name="dateOfBirth"
                label="Date of Birth"
                rules={[
                  { required: true, message: 'Please select date of birth' }
                ]}
              >
                <DatePicker
                  placeholder="Select date of birth"
                  style={{ width: '100%' }}
                  disabledDate={disabledDate}
                  showToday={false}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="gender"
            label="Gender"
            rules={[
              { required: true, message: 'Please select gender' }
            ]}
          >
            <Select placeholder="Select gender">
              <Option value="Male">Male</Option>
              <Option value="Female">Female</Option>
              <Option value="Other">Other</Option>
            </Select>
          </Form.Item>
        </div>

        {/* Medical Information */}
        <div className="form-section">
          <Title level={5}>Medical Information</Title>
          
          <div className="dynamic-field-section">
            <Text strong>Allergies</Text>
            <Text type="secondary" style={{ display: 'block', marginBottom: '12px' }}>
              List any known allergies or sensitivities
            </Text>
            
            {allergies.map((allergy, index) => (
              <div key={index} className="dynamic-field-row">
                <Input
                  placeholder="Enter allergy"
                  value={allergy}
                  onChange={(e) => updateAllergy(index, e.target.value)}
                  style={{ flex: 1 }}
                />
                {allergies.length > 1 && (
                  <Button
                    type="text"
                    icon={<DeleteOutlined />}
                    onClick={() => removeAllergyField(index)}
                    className="remove-field-btn"
                    danger
                  />
                )}
              </div>
            ))}
            
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={addAllergyField}
              className="add-field-btn"
              block
            >
              Add Another Allergy
            </Button>
          </div>

          <div className="dynamic-field-section">
            <Text strong>Medical Conditions</Text>
            <Text type="secondary" style={{ display: 'block', marginBottom: '12px' }}>
              List any ongoing medical conditions or diagnoses
            </Text>
            
            {conditions.map((condition, index) => (
              <div key={index} className="dynamic-field-row">
                <Input
                  placeholder="Enter medical condition"
                  value={condition}
                  onChange={(e) => updateCondition(index, e.target.value)}
                  style={{ flex: 1 }}
                />
                {conditions.length > 1 && (
                  <Button
                    type="text"
                    icon={<DeleteOutlined />}
                    onClick={() => removeConditionField(index)}
                    className="remove-field-btn"
                    danger
                  />
                )}
              </div>
            ))}
            
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={addConditionField}
              className="add-field-btn"
              block
            >
              Add Another Condition
            </Button>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="form-section">
          <Title level={5}>Emergency Contact</Title>
          
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="emergencyContactName"
                label="Contact Name"
                rules={[
                  { required: true, message: 'Please enter emergency contact name' }
                ]}
              >
                <Input
                  placeholder="Emergency contact full name"
                  prefix={<UserOutlined />}
                />
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={12}>
              <Form.Item
                name="emergencyContactRelationship"
                label="Relationship"
                rules={[
                  { required: true, message: 'Please enter relationship' }
                ]}
              >
                <Select placeholder="Select relationship">
                  <Option value="Parent">Parent</Option>
                  <Option value="Guardian">Guardian</Option>
                  <Option value="Spouse">Spouse</Option>
                  <Option value="Sibling">Sibling</Option>
                  <Option value="Child">Child</Option>
                  <Option value="Friend">Friend</Option>
                  <Option value="Other">Other</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="emergencyContactPhone"
            label="Phone Number"
            rules={[
              { required: true, message: 'Please enter phone number' },
              { pattern: /^[\+]?[\d\s\-\(\)]{10,}$/, message: 'Please enter a valid phone number' }
            ]}
          >
            <Input
              placeholder="Emergency contact phone number"
            />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  )
}

export default EditPatientModal 