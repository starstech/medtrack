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
  message
} from 'antd'
import { 
  UserOutlined, 
  PlusOutlined, 
  DeleteOutlined 
} from '@ant-design/icons'
import { usePatients } from '../../hooks/usePatients'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { Option } = Select
const { TextArea } = Input

const AddPatientModal = ({ visible, onClose }) => {
  const [form] = Form.useForm()
  const { addPatient } = usePatients()
  const [loading, setLoading] = useState(false)
  const [allergies, setAllergies] = useState([''])
  const [conditions, setConditions] = useState([''])

  const handleSubmit = async (values) => {
    setLoading(true)
    
    try {
      // Clean up allergies and conditions arrays
      const cleanAllergies = allergies.filter(allergy => allergy.trim() !== '')
      const cleanConditions = conditions.filter(condition => condition.trim() !== '')
      
      const patientData = {
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

      await addPatient(patientData)
      
      message.success(`${values.name} has been added successfully!`)
      handleClose()
      
    } catch (error) {
      message.error('Failed to add patient. Please try again.')
      console.error('Error adding patient:', error)
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
          <UserOutlined />
          <Title level={4} style={{ margin: 0 }}>
            Add New Patient
          </Title>
        </Space>
      }
      open={visible}
      onCancel={handleClose}
      footer={null}
      width={600}
      destroyOnHidden
      className="add-patient-modal"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        size="large"
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
              <Option value="male">Male</Option>
              <Option value="female">Female</Option>
              <Option value="other">Other</Option>
            </Select>
          </Form.Item>
        </div>

        {/* Medical Information */}
        <div className="form-section">
          <Title level={5}>Medical Information</Title>
          
          {/* Allergies */}
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

          {/* Medical Conditions */}
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
                <Input placeholder="Enter contact name" />
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
                  <Option value="parent">Parent</Option>
                  <Option value="spouse">Spouse</Option>
                  <Option value="child">Child</Option>
                  <Option value="sibling">Sibling</Option>
                  <Option value="guardian">Guardian</Option>
                  <Option value="friend">Friend</Option>
                  <Option value="other">Other</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="emergencyContactPhone"
            label="Phone Number"
            rules={[
              { required: true, message: 'Please enter phone number' },
              { pattern: /^[\+]?[1-9][\d]{0,15}$/, message: 'Please enter a valid phone number' }
            ]}
          >
            <Input placeholder="Enter phone number (e.g., +1-555-0123)" />
          </Form.Item>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <Space>
            <Button
              onClick={handleClose}
              size="large"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
            >
              {loading ? 'Adding Patient...' : 'Add Patient'}
            </Button>
          </Space>
        </div>
      </Form>
    </Modal>
  )
}

export default AddPatientModal