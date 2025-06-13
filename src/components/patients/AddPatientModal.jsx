import { useState } from 'react'
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
  Alert,
  Checkbox
} from 'antd'
import { 
  UserOutlined, 
  PlusOutlined, 
  DeleteOutlined,
  InfoCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons'
import { usePatients } from '../../hooks/usePatients'
import PhoneInput from '../common/PhoneInput'
import { EMERGENCY_CONTACT_CONFIG } from '../../utils/constants'
import { createPhoneValidationRulesSync, validateEmergencyContact, formatPhoneForStorage } from '../../utils/phoneValidation'
import dayjs from 'dayjs'
import './AddPatientModal.css'

const { Title, Text } = Typography
const { Option } = Select
const { TextArea } = Input

const AddPatientModal = ({ visible, onClose }) => {
  const [form] = Form.useForm()
  const { addPatient } = usePatients()
  const [loading, setLoading] = useState(false)
  const [allergies, setAllergies] = useState([''])
  const [conditions, setConditions] = useState([''])
  const [includeEmergencyContact, setIncludeEmergencyContact] = useState(true)
  const [emergencyContactWarning, setEmergencyContactWarning] = useState(false)

  const handleSubmit = async (values) => {
    setLoading(true)
    
    try {
      // Clean up allergies and conditions arrays
      const cleanAllergies = allergies.filter(allergy => allergy.trim() !== '')
      const cleanConditions = conditions.filter(condition => condition.trim() !== '')
      
      let emergencyContact = null
      
      // Handle emergency contact
      if (includeEmergencyContact) {
        if (values.emergencyContactName || values.emergencyContactPhone || values.emergencyContactRelationship) {
          emergencyContact = {
            name: values.emergencyContactName || '',
            relationship: values.emergencyContactRelationship || '',
            phone: formatPhoneForStorage(values.emergencyContactPhone) || '',
            email: values.emergencyContactEmail || ''
          }
          
          // Validate emergency contact
          const validation = validateEmergencyContact(emergencyContact)
          if (!validation.isValid) {
            const errorMessages = Object.values(validation.errors).join(', ')
            throw new Error(`Emergency contact validation failed: ${errorMessages}`)
          }
        }
      }
      
      const patientData = {
        ...values,
        dateOfBirth: values.dateOfBirth.format('YYYY-MM-DD'),
        allergies: cleanAllergies,
        medicalConditions: cleanConditions,
        emergencyContact
      }

      // Remove emergency contact fields from top level
      delete patientData.emergencyContactName
      delete patientData.emergencyContactRelationship
      delete patientData.emergencyContactPhone
      delete patientData.emergencyContactEmail

      await addPatient(patientData)
      
      message.success(`${values.name} has been added successfully!`)
      
      // Show warning if no emergency contact was provided
      if (!emergencyContact) {
        message.warning('Consider adding emergency contact information for safety purposes', 5)
      }
      
      handleClose()
      
    } catch (error) {
      message.error(error.message || 'Failed to add patient. Please try again.')
      console.error('Error adding patient:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    form.resetFields()
    setAllergies([''])
    setConditions([''])
    setIncludeEmergencyContact(true)
    setEmergencyContactWarning(false)
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

  const handleEmergencyContactToggle = (checked) => {
    setIncludeEmergencyContact(checked)
    if (!checked) {
      setEmergencyContactWarning(true)
      // Clear emergency contact fields
      form.setFieldsValue({
        emergencyContactName: '',
        emergencyContactPhone: '',
        emergencyContactRelationship: '',
        emergencyContactEmail: ''
      })
    } else {
      setEmergencyContactWarning(false)
    }
  }

  return (
    <Modal
      title={
        <Space>
          <UserOutlined />
          <span>Add New Patient</span>
        </Space>
      }
      open={visible}
      onCancel={handleClose}
      footer={[
        <Button key="cancel" onClick={handleClose} disabled={loading}>
          Cancel
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          onClick={() => form.submit()}
          loading={loading}
          icon={<PlusOutlined />}
        >
          Add Patient
        </Button>
      ]}
      width={800}
      destroyOnHidden
      className="add-patient-modal"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="add-patient-form"
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
                  { required: true, message: 'Please enter patient name' },
                  { min: 2, message: 'Name must be at least 2 characters' }
                ]}
              >
                <Input placeholder="Enter full name" />
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
                  disabledDate={(current) => current && current > dayjs().endOf('day')}
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
              <Option value="male">Male</Option>
              <Option value="female">Female</Option>
              <Option value="other">Other</Option>
              <Option value="prefer_not_to_say">Prefer not to say</Option>
            </Select>
          </Form.Item>
        </div>

        {/* Medical Information */}
        <div className="form-section">
          <Title level={5}>Medical Information</Title>
          
          <div className="dynamic-field-section">
            <Text strong>Allergies</Text>
            <Text type="secondary" size="small"> (Optional)</Text>
            
            {allergies.map((allergy, index) => (
              <div key={index} className="dynamic-field">
                <Input
                  placeholder="Enter allergy (e.g., Penicillin, Peanuts)"
                  value={allergy}
                  onChange={(e) => updateAllergy(index, e.target.value)}
                  suffix={
                    allergies.length > 1 && (
                      <Button
                        type="text"
                        icon={<DeleteOutlined />}
                        onClick={() => removeAllergyField(index)}
                        size="small"
                        danger
                      />
                    )
                  }
                />
              </div>
            ))}
            
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={addAllergyField}
              size="small"
            >
              Add Another Allergy
            </Button>
          </div>

          <div className="dynamic-field-section">
            <Text strong>Medical Conditions</Text>
            <Text type="secondary" size="small"> (Optional)</Text>
            
            {conditions.map((condition, index) => (
              <div key={index} className="dynamic-field">
                <Input
                  placeholder="Enter medical condition (e.g., Diabetes, Asthma)"
                  value={condition}
                  onChange={(e) => updateCondition(index, e.target.value)}
                  suffix={
                    conditions.length > 1 && (
                      <Button
                        type="text"
                        icon={<DeleteOutlined />}
                        onClick={() => removeConditionField(index)}
                        size="small"
                        danger
                      />
                    )
                  }
                />
              </div>
            ))}
            
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={addConditionField}
              size="small"
            >
              Add Another Condition
            </Button>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="form-section">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <Title level={5} style={{ margin: 0 }}>Emergency Contact</Title>
            <Checkbox 
              checked={includeEmergencyContact}
              onChange={(e) => handleEmergencyContactToggle(e.target.checked)}
            >
              Include emergency contact
            </Checkbox>
          </div>
          
          {!includeEmergencyContact && emergencyContactWarning && (
            <Alert
              message="No Emergency Contact"
              description="While emergency contact information is optional, it's highly recommended for safety and care coordination purposes."
              type="warning"
              icon={<ExclamationCircleOutlined />}
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}
          
          {includeEmergencyContact && (
            <>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="emergencyContactName"
                    label="Contact Name"
                    rules={[
                      { required: includeEmergencyContact, message: 'Please enter emergency contact name' }
                    ]}
                  >
                    <Input placeholder="Enter contact name" />
                  </Form.Item>
                </Col>
                
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="emergencyContactRelationship"
                    label="Relationship"
                    rules={[
                      { required: includeEmergencyContact, message: 'Please enter relationship' }
                    ]}
                  >
                    <Select placeholder="Select relationship">
                      {EMERGENCY_CONTACT_CONFIG.RELATIONSHIPS.map(rel => (
                        <Option key={rel.value} value={rel.value}>{rel.label}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="emergencyContactPhone"
                label="Phone Number"
                rules={createPhoneValidationRulesSync(null, includeEmergencyContact)}
              >
                <PhoneInput 
                  placeholder="Enter phone number"
                />
              </Form.Item>

              <Form.Item
                name="emergencyContactEmail"
                label="Email Address (Optional)"
                rules={[
                  { type: 'email', message: 'Please enter a valid email address' }
                ]}
              >
                <Input placeholder="Enter email address (optional)" />
              </Form.Item>
            </>
          )}
        </div>
      </Form>
    </Modal>
  )
}

export default AddPatientModal