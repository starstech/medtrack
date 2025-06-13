import { useState, useEffect, useRef } from 'react'
import { 
  Card, 
  Button, 
  Space, 
  Typography, 
  Tag, 
  Empty,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Row,
  Col,
  message,
  Statistic,
  Avatar,
  Dropdown,
  Pagination,
  Switch,
  Slider,
  Divider,
  Image,
  Tooltip
} from 'antd'
import { 
  ExperimentOutlined,
  PlusOutlined,
  TrophyOutlined,
  RiseOutlined,
  FallOutlined,
  LineChartOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  CalendarOutlined,
  UserOutlined,
  HeartOutlined,
  ThunderboltOutlined,
  DashboardOutlined,
  FireOutlined,
  EyeOutlined,
  MedicineBoxOutlined,
  DropboxOutlined,
  CloudOutlined,
  GoldOutlined,
  AlertOutlined,
  BulbOutlined,
  PieChartOutlined,
  BarChartOutlined,
  AreaChartOutlined,
  CameraOutlined,
  FileImageOutlined,
  PictureOutlined
} from '@ant-design/icons'
import { usePatients } from '../../hooks/usePatients'
import { MEASUREMENT_TYPES } from '../../constants'
import { measurementPreferencesService } from '../../services/measurementPreferencesService'
import VitalSignsModal from './modals/VitalSignsModal'
import BloodTestModal from './modals/BloodTestModal'
import PhysicalMeasurementsModal from './modals/PhysicalMeasurementsModal'
import SubjectiveMeasurementsModal from './modals/SubjectiveMeasurementsModal'
import UrineTestModal from './modals/UrineTestModal'
import TrendsModal from './modals/TrendsModal'
import dayjs from 'dayjs'
import './MeasurementSection.css'

const { Title, Text } = Typography
const { Option } = Select
const { TextArea } = Input

// Measurement Categories - Organized by sample/test type
const MEASUREMENT_CATEGORIES = [
  {
    key: 'blood',
    title: 'Blood Tests',
    description: 'Blood sampling and laboratory analysis',
    icon: <DropboxOutlined style={{ color: '#ff4d4f', fontSize: 24 }} />,
    color: '#ff4d4f',
    subcategories: [
      {
        key: 'blood_glucose',
        title: 'Glucose & Diabetes',
        description: 'Blood glucose monitoring and diabetes markers',
        types: ['blood_glucose'],
        modalComponent: 'BloodTestModal'
      },
      {
        key: 'blood_lipid',
        title: 'Lipid Panel',
        description: 'Cholesterol and triglycerides analysis',
        types: ['cholesterol_total', 'cholesterol_ldl', 'cholesterol_hdl', 'triglycerides'],
        modalComponent: 'BloodTestModal'
      },
      {
        key: 'blood_cbc',
        title: 'Complete Blood Count',
        description: 'Blood cells, hemoglobin, and hematocrit',
        types: ['hemoglobin', 'hematocrit', 'white_blood_cell_count', 'red_blood_cell_count', 'platelet_count'],
        modalComponent: 'BloodTestModal'
      },
      {
        key: 'blood_kidney',
        title: 'Kidney Function',
        description: 'Creatinine and BUN tests',
        types: ['creatinine', 'blood_urea_nitrogen'],
        modalComponent: 'BloodTestModal'
      },
      {
        key: 'blood_thyroid',
        title: 'Thyroid Function',
        description: 'TSH, T3, and T4 hormone levels',
        types: ['thyroid_tsh', 'thyroid_t3', 'thyroid_t4'],
        modalComponent: 'BloodTestModal'
      },
      {
        key: 'blood_vitamins',
        title: 'Vitamins & Minerals',
        description: 'Vitamin D, B12, iron, calcium levels',
        types: ['vitamin_d', 'vitamin_b12', 'iron', 'calcium'],
        modalComponent: 'BloodTestModal'
      },
      {
        key: 'blood_electrolytes',
        title: 'Electrolytes',
        description: 'Sodium, potassium, chloride balance',
        types: ['potassium', 'sodium', 'chloride'],
        modalComponent: 'BloodTestModal'
      }
    ]
  },
  {
    key: 'urine',
    title: 'Urine Tests',
    description: 'Urine analysis and dipstick tests',
    icon: <ExperimentOutlined style={{ color: '#fa8c16', fontSize: 24 }} />,
    color: '#fa8c16',
    subcategories: [
      {
        key: 'urine_dipstick',
        title: 'Dipstick Analysis',
        description: 'Protein, glucose, ketones, pH, blood, leukocytes',
        types: ['urine_protein', 'urine_glucose', 'urine_ketones', 'urine_specific_gravity', 'urine_ph', 'urine_blood', 'urine_leukocytes'],
        modalComponent: 'UrineTestModal'
      }
    ]
  },
  {
    key: 'vital_signs',
    title: 'Vital Signs',
    description: 'Essential physiological measurements',
    icon: <HeartOutlined style={{ color: '#52c41a', fontSize: 24 }} />,
    color: '#52c41a',
    subcategories: [
      {
        key: 'cardiovascular',
        title: 'Cardiovascular',
        description: 'Heart rate and blood pressure',
        types: ['heart_rate', 'blood_pressure_systolic', 'blood_pressure_diastolic'],
        modalComponent: 'VitalSignsModal'
      },
      {
        key: 'respiratory',
        title: 'Respiratory',
        description: 'Breathing rate, oxygen saturation, peak flow',
        types: ['respiratory_rate', 'oxygen_saturation', 'peak_flow'],
        modalComponent: 'VitalSignsModal'
      }
    ]
  },
  {
    key: 'temperature',
    title: 'Temperature',
    description: 'Body temperature monitoring',
    icon: <ThunderboltOutlined style={{ color: '#722ed1', fontSize: 24 }} />,
    color: '#722ed1',
    direct: true, // No subcategories - opens modal directly
    types: ['temperature'],
    modalComponent: 'VitalSignsModal'
  },
  {
    key: 'physical',
    title: 'Physical Measurements',
    description: 'Height, weight, and body composition',
    icon: <DashboardOutlined style={{ color: '#1890ff', fontSize: 24 }} />,
    color: '#1890ff',
    direct: true,
    types: ['weight', 'height'],
    modalComponent: 'PhysicalMeasurementsModal'
  },
  {
    key: 'subjective',
    title: 'Subjective Assessments',
    description: 'Patient-reported pain and mood ratings',
    icon: <BulbOutlined style={{ color: '#13c2c2', fontSize: 24 }} />,
    color: '#13c2c2',
    direct: true,
    types: ['pain_level', 'mood_rating'],
    modalComponent: 'SubjectiveMeasurementsModal'
  }
]

const MeasurementSection = ({ patient }) => {
  const { getPatientMeasurements, addMeasurement, deleteMeasurement } = usePatients()
  const [typeSelectionVisible, setTypeSelectionVisible] = useState(false)
  const [subcategorySelectionVisible, setSubcategorySelectionVisible] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [modalVisibility, setModalVisibility] = useState({
    vital_signs: false,
    blood_tests: false,
    physical: false,
    subjective: false,
    urine_tests: false,
    trends: false
  })
  const [selectedType, setSelectedType] = useState('all')
  const [loading, setLoading] = useState(false)
  const [isScrollable, setIsScrollable] = useState(false)
  const [measurementAvailability, setMeasurementAvailability] = useState(null)
  const [preferencesLoading, setPreferencesLoading] = useState(true)
  const containerRef = useRef(null)

  const measurements = getPatientMeasurements(patient.id)
  
  // Load measurement preferences on component mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        setPreferencesLoading(true)
        const result = await measurementPreferencesService.getMeasurementAvailability(patient.id)
        
        if (result.success) {
          setMeasurementAvailability(result.data)
        } else {
          console.error('Failed to load measurement preferences:', result.error)
          // Default to all measurements enabled
          setMeasurementAvailability({
            categories: { vitalSigns: true, physicalMeasurements: true, subjectiveMeasurements: true },
            measurements: {
              vital_signs: { blood_pressure: true, heart_rate: true, temperature: true, respiratory_rate: true, oxygen_saturation: true },
              physical: { height: true, weight: true, bmi: true, head_circumference: true },
              subjective: { pain_level: true, mood: true, energy_level: true, sleep_quality: true, appetite: true }
            }
          })
        }
      } catch (error) {
        console.error('Error loading measurement preferences:', error)
        // Default to all measurements enabled
        setMeasurementAvailability({
          categories: { vitalSigns: true, physicalMeasurements: true, subjectiveMeasurements: true },
          measurements: {
            vital_signs: { blood_pressure: true, heart_rate: true, temperature: true, respiratory_rate: true, oxygen_saturation: true },
            physical: { height: true, weight: true, bmi: true, head_circumference: true },
            subjective: { pain_level: true, mood: true, energy_level: true, sleep_quality: true, appetite: true }
          }
        })
      } finally {
        setPreferencesLoading(false)
      }
    }

    loadPreferences()
  }, [patient.id])

  // Filter measurements based on preferences
  const getFilteredMeasurements = () => {
    if (!measurementAvailability) return measurements
    
    return measurements.filter(measurement => {
      // Map measurement types to categories and check if enabled
      const typeToCategory = {
        'blood_pressure_systolic': { category: 'vital_signs', type: 'blood_pressure' },
        'blood_pressure_diastolic': { category: 'vital_signs', type: 'blood_pressure' },
        'blood_pressure': { category: 'vital_signs', type: 'blood_pressure' },
        'heart_rate': { category: 'vital_signs', type: 'heart_rate' },
        'temperature': { category: 'vital_signs', type: 'temperature' },
        'respiratory_rate': { category: 'vital_signs', type: 'respiratory_rate' },
        'oxygen_saturation': { category: 'vital_signs', type: 'oxygen_saturation' },
        'weight': { category: 'physical', type: 'weight' },
        'height': { category: 'physical', type: 'height' },
        'pain_level': { category: 'subjective', type: 'pain_level' },
        'mood_rating': { category: 'subjective', type: 'mood' }
      }
      
      const mapping = typeToCategory[measurement.type]
      if (!mapping) return true // Show unmapped measurements by default
      
      const categoryEnabled = measurementAvailability.categories?.[
        mapping.category === 'vital_signs' ? 'vitalSigns' : 
        mapping.category === 'physical' ? 'physicalMeasurements' : 
        'subjectiveMeasurements'
      ]
      
      if (!categoryEnabled) return false
      
      const measurementEnabled = measurementAvailability.measurements?.[mapping.category]?.[mapping.type]
      return measurementEnabled !== false
    })
  }

  const filteredMeasurements = selectedType === 'all' 
    ? getFilteredMeasurements()
    : getFilteredMeasurements().filter(m => m.type === selectedType)

  // Sort measurements by date (newest first)
  const sortedMeasurements = filteredMeasurements.sort((a, b) => 
    new Date(b.recordedAt) - new Date(a.recordedAt)
  )

  // Get unique measurement types from filtered data
  const availableTypes = [...new Set(getFilteredMeasurements().map(m => m.type))]

  // Check if container is scrollable
  useEffect(() => {
    const checkScrollable = () => {
      if (containerRef.current) {
        const { scrollHeight, clientHeight } = containerRef.current
        setIsScrollable(scrollHeight > clientHeight)
      }
    }

    checkScrollable()
    window.addEventListener('resize', checkScrollable)

    return () => {
      window.removeEventListener('resize', checkScrollable)
    }
  }, [sortedMeasurements])

  const handleDeleteMeasurement = (measurementId) => {
    Modal.confirm({
      title: 'Delete Measurement',
      content: 'Are you sure you want to delete this measurement? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await deleteMeasurement(measurementId)
          message.success('Measurement deleted successfully!')
        } catch (error) {
          message.error('Failed to delete measurement. Please try again.')
          console.error('Error deleting measurement:', error)
        }
      }
    })
  }

  const openModal = (modalComponent) => {
    const modalMap = {
      'VitalSignsModal': 'vital_signs',
      'EnhancedVitalSignsModal': 'vital_signs',
      'BloodTestModal': 'blood_tests',
      'PhysicalMeasurementsModal': 'physical', 
      'SubjectiveMeasurementsModal': 'subjective',
      'UrineTestModal': 'urine_tests'
    }
    const modalKey = modalMap[modalComponent]
    if (modalKey) {
      setTypeSelectionVisible(false)
      setModalVisibility(prev => ({ ...prev, [modalKey]: true }))
    }
  }

  const closeModal = (modalKey) => {
    setModalVisibility(prev => ({ ...prev, [modalKey]: false }))
  }

  const handleCategoryClick = (category) => {
    if (category.direct) {
      // Direct modals don't need subcategory selection
      openModal(category.modalComponent)
    } else if (category.subcategories) {
      // Categories with subcategories need further selection
      setSelectedCategory(category)
      setTypeSelectionVisible(false)
      setSubcategorySelectionVisible(true)
    }
  }

  const handleSubcategoryClick = (subcategory) => {
    openModal(subcategory.modalComponent)
    setSubcategorySelectionVisible(false)
    setSelectedCategory(null)
  }

  const handleTrendsClick = () => {
    setModalVisibility(prev => ({ ...prev, trends: true }))
  }

  const getMeasurementTypeIcon = (type) => {
    const iconMap = {
      'blood_pressure_systolic': <HeartOutlined style={{ color: '#ff4d4f' }} />,
      'blood_pressure_diastolic': <HeartOutlined style={{ color: '#ff4d4f' }} />,
      'blood_pressure': <HeartOutlined style={{ color: '#ff4d4f' }} />,
      'heart_rate': <HeartOutlined style={{ color: '#52c41a' }} />,
      'temperature': <ThunderboltOutlined style={{ color: '#fa8c16' }} />,
      'weight': <FireOutlined style={{ color: '#1890ff' }} />,
      'height': <DashboardOutlined style={{ color: '#722ed1' }} />,
      'blood_glucose': <ExperimentOutlined style={{ color: '#eb2f96' }} />,
      'oxygen_saturation': <DashboardOutlined style={{ color: '#13c2c2' }} />,
      'cholesterol_total': <DropboxOutlined style={{ color: '#fa541c' }} />,
      'cholesterol_ldl': <DropboxOutlined style={{ color: '#ff4d4f' }} />,
      'cholesterol_hdl': <DropboxOutlined style={{ color: '#52c41a' }} />,
      'triglycerides': <DropboxOutlined style={{ color: '#faad14' }} />,
      'hemoglobin': <HeartOutlined style={{ color: '#f5222d' }} />,
      'hematocrit': <HeartOutlined style={{ color: '#cf1322' }} />,
      'white_blood_cell_count': <ExperimentOutlined style={{ color: '#fadb14' }} />,
      'red_blood_cell_count': <HeartOutlined style={{ color: '#ff7875' }} />,
      'platelet_count': <ExperimentOutlined style={{ color: '#ff9c6e' }} />,
      'respiratory_rate': <EyeOutlined style={{ color: '#73d13d' }} />,
      'pain_level': <AlertOutlined style={{ color: '#ff4d4f' }} />,
      'mood_rating': <BulbOutlined style={{ color: '#722ed1' }} />
    }
    
    return iconMap[type] || <ExperimentOutlined style={{ color: '#1890ff' }} />
  }

  const getMeasurementStatus = (type, value) => {
    // Define normal ranges for common measurements based on medical standards
    const normalRanges = {
      // Vital Signs
      'blood_pressure_systolic': { min: 90, max: 120, unit: 'mmHg', label: 'Systolic BP' },
      'blood_pressure_diastolic': { min: 60, max: 80, unit: 'mmHg', label: 'Diastolic BP' },
      'heart_rate': { min: 60, max: 100, unit: 'bpm', label: 'Heart Rate' },
      'temperature': { min: 36.1, max: 37.2, unit: '°C', label: 'Temperature' },
      'respiratory_rate': { min: 12, max: 20, unit: '/min', label: 'Respiratory Rate' },
      'oxygen_saturation': { min: 95, max: 100, unit: '%', label: 'O2 Saturation' },
      'peak_flow': { min: null, max: null, unit: 'L/min', label: 'Peak Flow', status: 'Measured' },
      
      // Physical Measurements
      'weight': { min: null, max: null, unit: 'kg', label: 'Weight', status: 'Measured' },
      'height': { min: null, max: null, unit: 'cm', label: 'Height', status: 'Measured' },
      
      // Blood Tests - Glucose & Diabetes
      'blood_glucose': { min: 70, max: 100, unit: 'mg/dL', label: 'Blood Glucose' },
      
      // Blood Tests - Lipid Panel
      'cholesterol_total': { min: 0, max: 200, unit: 'mg/dL', label: 'Total Cholesterol' },
      'cholesterol_ldl': { min: 0, max: 100, unit: 'mg/dL', label: 'LDL Cholesterol' },
      'cholesterol_hdl': { min: 40, max: null, unit: 'mg/dL', label: 'HDL Cholesterol' },
      'triglycerides': { min: 0, max: 150, unit: 'mg/dL', label: 'Triglycerides' },
      
      // Blood Tests - Complete Blood Count
      'hemoglobin': { min: 12.0, max: 16.0, unit: 'g/dL', label: 'Hemoglobin' },
      'hematocrit': { min: 36, max: 47, unit: '%', label: 'Hematocrit' },
      'white_blood_cell_count': { min: 4500, max: 11000, unit: '/μL', label: 'WBC Count' },
      'red_blood_cell_count': { min: 3.5, max: 5.9, unit: 'million/μL', label: 'RBC Count' },
      'platelet_count': { min: 150000, max: 450000, unit: '/μL', label: 'Platelet Count' },
      
      // Urine Tests
      'urine_protein': { min: null, max: null, unit: 'mg/dL', label: 'Urine Protein', status: 'Tested' },
      'urine_glucose': { min: null, max: null, unit: 'mg/dL', label: 'Urine Glucose', status: 'Tested' },
      'urine_ketones': { min: null, max: null, unit: 'mg/dL', label: 'Urine Ketones', status: 'Tested' },
      'urine_specific_gravity': { min: 1.003, max: 1.030, unit: '', label: 'Urine Specific Gravity' },
      'urine_ph': { min: 5.0, max: 8.0, unit: '', label: 'Urine pH' },
      'urine_blood': { min: null, max: null, unit: 'RBC/hpf', label: 'Urine Blood', status: 'Tested' },
      'urine_leukocytes': { min: null, max: null, unit: 'WBC/hpf', label: 'Urine Leukocytes', status: 'Tested' },
      
      // Kidney Function
      'creatinine': { min: 0.6, max: 1.2, unit: 'mg/dL', label: 'Creatinine' },
      'blood_urea_nitrogen': { min: 7, max: 20, unit: 'mg/dL', label: 'BUN' },
      
      // Thyroid Function
      'thyroid_tsh': { min: 0.4, max: 4.0, unit: 'mIU/L', label: 'TSH' },
      'thyroid_t3': { min: 80, max: 200, unit: 'ng/dL', label: 'T3' },
      'thyroid_t4': { min: 5.0, max: 12.0, unit: 'μg/dL', label: 'T4' },
      
      // Vitamins & Minerals
      'vitamin_d': { min: 30, max: 100, unit: 'ng/mL', label: 'Vitamin D' },
      'vitamin_b12': { min: 300, max: 900, unit: 'pg/mL', label: 'Vitamin B12' },
      'iron': { min: 60, max: 170, unit: 'μg/dL', label: 'Iron' },
      'calcium': { min: 8.5, max: 10.5, unit: 'mg/dL', label: 'Calcium' },
      
      // Electrolytes
      'potassium': { min: 3.5, max: 5.0, unit: 'mEq/L', label: 'Potassium' },
      'sodium': { min: 136, max: 145, unit: 'mEq/L', label: 'Sodium' },
      'chloride': { min: 98, max: 107, unit: 'mEq/L', label: 'Chloride' },
      
      // Subjective Measurements
      'pain_level': { min: 0, max: 3, unit: '/10', label: 'Pain Level' },
      'mood_rating': { min: 7, max: 10, unit: '/10', label: 'Mood Rating' }
    }

    const range = normalRanges[type]
    if (!range) return { color: 'blue', text: 'Measured', level: 'normal' }

    if (range.status) return { color: 'blue', text: range.status, level: 'normal' }

    const numValue = parseFloat(value)
    
    // Handle non-numeric values (common for urine tests)
    if (isNaN(numValue) && typeof value === 'string') {
      const lowerValue = value.toLowerCase()
      if (lowerValue.includes('negative') || lowerValue === 'normal') {
        return { color: 'green', text: 'Normal', level: 'normal' }
      }
      if (lowerValue.includes('+') || lowerValue.includes('positive')) {
        return { color: 'orange', text: 'Positive', level: 'mild' }
      }
      return { color: 'blue', text: 'Recorded', level: 'normal' }
    }
    
    if (range.min !== null && numValue < range.min) {
      if (type === 'pain_level' || type === 'mood_rating') {
        return type === 'pain_level' 
          ? { color: 'green', text: 'Low Pain', level: 'normal' }
          : { color: 'orange', text: 'Low Mood', level: 'mild' }
      }
      return { color: 'orange', text: 'Below Normal', level: 'mild' }
    }
    
    if (range.max !== null && numValue > range.max) {
      if (type === 'mood_rating') {
        return { color: 'green', text: 'Excellent', level: 'normal' }
      }
      if (type === 'pain_level') {
        if (numValue >= 7) return { color: 'red', text: 'Severe Pain', level: 'severe' }
        if (numValue >= 4) return { color: 'orange', text: 'Moderate Pain', level: 'mild' }
      }
      return { color: 'red', text: 'Above Normal', level: 'severe' }
    }

    if (type === 'pain_level') {
      return { color: 'orange', text: 'Mild Pain', level: 'mild' }
    }
    
    return { color: 'green', text: 'Normal', level: 'normal' }
  }

  const getMeasurementTypeInfo = (type) => {
    const typeData = MEASUREMENT_TYPES.find(t => t.value === type)
    return typeData || { label: type, unit: '' }
  }

  const getMeasurementTrend = (type, currentValue) => {
    const typeMeasurements = measurements
      .filter(m => m.type === type)
      .sort((a, b) => new Date(a.recordedAt) - new Date(b.recordedAt))
    
    if (typeMeasurements.length < 2) return null
    
    const previousValue = parseFloat(typeMeasurements[typeMeasurements.length - 2].value)
    const current = parseFloat(currentValue)
    
    if (isNaN(previousValue) || isNaN(current)) return null
    
    const percentChange = ((current - previousValue) / previousValue * 100).toFixed(1)
    
    if (Math.abs(percentChange) < 1) {
      return { direction: 'same', percent: '0' }
    }
    
    return {
      direction: current > previousValue ? 'up' : 'down',
      percent: Math.abs(percentChange)
    }
  }

  const getMenuItems = (measurement) => [
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: 'Edit Measurement',
      onClick: () => message.info('Edit functionality coming soon!')
    },
    {
      type: 'divider'
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: 'Delete Measurement',
      onClick: () => handleDeleteMeasurement(measurement.id),
      danger: true
    }
  ]

  const renderMeasurementAttachments = (measurement) => {
    if (!measurement.attachments || measurement.attachments.length === 0) {
      return null
    }

    const attachments = measurement.attachments.filter(att => att.status === 'done')
    if (attachments.length === 0) return null

    return (
      <div className="measurement-attachments">
        <Space size={4}>
          <Tooltip title={`${attachments.length} photo${attachments.length > 1 ? 's' : ''} attached`}>
            <Button
              type="text"
              size="small"
              icon={<CameraOutlined />}
              className="attachment-indicator"
            >
              {attachments.length}
            </Button>
          </Tooltip>
          <div className="attachment-previews">
            <Image.PreviewGroup>
              {attachments.slice(0, 2).map((attachment, index) => (
                <Image
                  key={attachment.uid}
                  width={24}
                  height={24}
                  src={attachment.url}
                  alt={attachment.name}
                  style={{
                    borderRadius: '4px',
                    objectFit: 'cover',
                    cursor: 'pointer',
                    border: '1px solid #f0f0f0'
                  }}
                  preview={{
                    mask: <EyeOutlined style={{ fontSize: '10px' }} />
                  }}
                />
              ))}
              {attachments.length > 2 && (
                <div className="more-attachments">
                  <Tooltip title={`+${attachments.length - 2} more photos`}>
                    <div className="attachment-count">
                      +{attachments.length - 2}
                    </div>
                  </Tooltip>
                </div>
              )}
            </Image.PreviewGroup>
          </div>
        </Space>
      </div>
    )
  }

  const renderMeasurementItem = (measurement) => {
    const typeInfo = getMeasurementTypeInfo(measurement.type)
    const trend = getMeasurementTrend(measurement.type, measurement.value)
    const status = getMeasurementStatus(measurement.type, measurement.value)
    const typeIcon = getMeasurementTypeIcon(measurement.type)
    
    return (
      <div key={measurement.id} className="measurement-list-item">
        <div className="measurement-item">
          <div className="measurement-icon">
            {typeIcon}
          </div>
          <div className="measurement-primary">
            <div className="measurement-name-row">
              <Text strong className="measurement-name">
                {typeInfo.label}
              </Text>
              <div className="measurement-value">
                <Text strong className="value-text">
                  {measurement.value} {typeInfo.unit}
                </Text>
                <Tag color={status.color} size="small" className="measurement-status">
                  {status.text}
                </Tag>
                {trend && (
                  <span className="trend-info">
                    {trend.direction === 'up' ? (
                      <RiseOutlined style={{ color: '#52c41a', fontSize: '12px' }} />
                    ) : trend.direction === 'down' ? (
                      <FallOutlined style={{ color: '#ff4d4f', fontSize: '12px' }} />
                    ) : null}
                    {trend.direction !== 'same' && (
                      <Text 
                        size="small" 
                        style={{ 
                          color: trend.direction === 'up' ? '#52c41a' : '#ff4d4f',
                          fontSize: '11px',
                          marginLeft: '4px'
                        }}
                      >
                        {trend.percent}%
                      </Text>
                    )}
                  </span>
                )}
              </div>
            </div>
            
            <div className="measurement-details-row">
              <Text type="secondary" size="small">
                {dayjs(measurement.recordedAt).format('MMM D, YYYY h:mm A')} • by {measurement.recordedBy}
              </Text>
              {renderMeasurementAttachments(measurement)}
            </div>
            
            {measurement.notes && (
              <div className="measurement-notes">
                <Text size="small" type="secondary">
                  {measurement.notes}
                </Text>
              </div>
            )}
          </div>

          <div className="measurement-actions">
            <Button
              size="small"
              type="text"
              icon={<LineChartOutlined />}
              onClick={handleTrendsClick}
              className="list-action-btn"
              title="View Trends"
            />
            <Dropdown
              menu={{ items: getMenuItems(measurement) }}
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

  // Filter categories based on preferences
  const getFilteredCategories = () => {
    if (!measurementAvailability) return MEASUREMENT_CATEGORIES;
    
    return MEASUREMENT_CATEGORIES.filter(category => {
      // Map category keys to preference categories
      const categoryMapping = {
        'vital_signs': 'vitalSigns',
        'temperature': 'vitalSigns', // Temperature is part of vital signs
        'physical': 'physicalMeasurements',
        'subjective': 'subjectiveMeasurements',
        'blood': true, // Always show blood tests for now
        'urine': true  // Always show urine tests for now
      };
      
      const preferenceKey = categoryMapping[category.key];
      if (preferenceKey === true) return true; // Always show
      if (typeof preferenceKey === 'string') {
        return measurementAvailability.categories[preferenceKey] === true;
      }
      return true; // Default to show if unmapped
    });
  };

  const renderTypeSelectionModal = () => {
    const filteredCategories = getFilteredCategories();
    
    return (
      <Modal
        title={
          <Space>
            <PlusOutlined />
            <Title level={4} style={{ margin: 0 }}>
              Record New Measurement
            </Title>
          </Space>
        }
        open={typeSelectionVisible}
        onCancel={() => setTypeSelectionVisible(false)}
        footer={null}
        width={720}
        centered
        destroyOnHidden
        className="type-selection-modal"
      >
        <Text type="secondary" style={{ marginBottom: 24, display: 'block' }}>
          Choose the type of measurement you'd like to record:
        </Text>
        
        {filteredCategories.length === 0 ? (
          <Alert
            message="No Measurement Categories Available"
            description="All measurement categories are disabled in your preferences. Please update your measurement settings to record new measurements."
            type="warning"
            showIcon
            style={{ margin: '20px 0' }}
          />
        ) : (
          <div className="measurement-categories-grid">
            {filteredCategories.map(category => (
              <div 
                key={category.key}
                className="measurement-category-card"
                onClick={() => handleCategoryClick(category)}
                style={{ borderColor: category.color }}
              >
                <div className="category-icon">
                  {category.icon}
                </div>
                <div className="category-content">
                  <Title level={5} style={{ margin: '8px 0 4px', color: category.color }}>
                    {category.title}
                  </Title>
                  <Text type="secondary" size="small">
                    {category.description}
                  </Text>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    )
  }

  const renderSubcategorySelectionModal = () => (
    <Modal
      title={
        <Space>
          {selectedCategory?.icon}
          <Title level={4} style={{ margin: 0 }}>
            {selectedCategory?.title} - Select Test Type
          </Title>
        </Space>
      }
      open={subcategorySelectionVisible}
      onCancel={() => {
        setSubcategorySelectionVisible(false)
        setSelectedCategory(null)
      }}
      footer={null}
      width={720}
      centered
      destroyOnHidden
      className="subcategory-selection-modal"
    >
      <Text type="secondary" style={{ marginBottom: 24, display: 'block' }}>
        Select the specific type of {selectedCategory?.title.toLowerCase()} you'd like to record:
      </Text>
      
      <div className="subcategory-grid">
        {selectedCategory?.subcategories?.map(subcategory => (
          <div 
            key={subcategory.key}
            className="subcategory-card"
            onClick={() => handleSubcategoryClick(subcategory)}
          >
            <div className="subcategory-icon">
              {subcategory.icon}
            </div>
            <div className="subcategory-content">
              <Title level={5} style={{ margin: '8px 0 4px', color: selectedCategory.color }}>
                {subcategory.title}
              </Title>
              <Text type="secondary" size="small">
                {subcategory.description}
              </Text>
            </div>
          </div>
        ))}
      </div>
      
      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <Space>
          <Button
            onClick={() => {
              setSubcategorySelectionVisible(false)
              setSelectedCategory(null)
              setTypeSelectionVisible(true)
            }}
          >
            Back to Categories
          </Button>
          <Button
            onClick={() => {
              setSubcategorySelectionVisible(false)
              setSelectedCategory(null)
            }}
          >
            Cancel
          </Button>
        </Space>
      </div>
    </Modal>
  )

  // Get status breakdown for measurements
  const getStatusBreakdown = () => {
    const breakdown = { normal: 0, warning: 0, critical: 0 }
    
    filteredMeasurements.forEach(measurement => {
      const status = getMeasurementStatus(measurement.type, measurement.value)
      if (status.level === 'normal') {
        breakdown.normal++
      } else if (status.level === 'mild') {
        breakdown.warning++
      } else if (status.level === 'severe') {
        breakdown.critical++
      }
    })
    
    return breakdown
  }

  const statusBreakdown = getStatusBreakdown()

  return (
    <div className="measurement-section">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div className="measurement-group">
          <div className="measurement-group-header">
            <div className="group-title">
              <Space>
                <ExperimentOutlined />
                <span>Recent Measurements ({filteredMeasurements.length})</span>
                {filteredMeasurements.length > 0 && (
                  <Space size={4}>
                    {statusBreakdown.normal > 0 && (
                      <Tag color="green" size="small">{statusBreakdown.normal} Normal</Tag>
                    )}
                    {statusBreakdown.warning > 0 && (
                      <Tag color="orange" size="small">{statusBreakdown.warning} Alert</Tag>
                    )}
                    {statusBreakdown.critical > 0 && (
                      <Tag color="red" size="small">{statusBreakdown.critical} Critical</Tag>
                    )}
                  </Space>
                )}
              </Space>
            </div>
            <Space>
              {measurements.length > 0 && (
                <Button 
                  icon={<LineChartOutlined />}
                  onClick={handleTrendsClick}
                  size="small"
                  type="default"
                >
                  Trends
                </Button>
              )}
              <Select
                value={selectedType}
                onChange={(value) => setSelectedType(value)}
                style={{ width: 150 }}
                size="small"
              >
                <Option value="all">All Types</Option>
                {availableTypes.map(type => (
                  <Option key={type} value={type}>
                    {getMeasurementTypeInfo(type).label}
                  </Option>
                ))}
              </Select>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => setTypeSelectionVisible(true)}
                size="small"
              >
                Record
              </Button>
            </Space>
          </div>

          {filteredMeasurements.length > 0 ? (
            <div 
              className={`measurement-list-container ${isScrollable ? 'has-scroll' : ''}`}
              ref={containerRef}
            >
              <div className="measurements-list">
                {sortedMeasurements.map(renderMeasurementItem)}
              </div>
            </div>
          ) : (
            <Empty
              image={<ExperimentOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />}
              description={
                selectedType === 'all' 
                  ? "No measurements recorded yet"
                  : `No ${getMeasurementTypeInfo(selectedType).label.toLowerCase()} measurements`
              }
              style={{ padding: '40px 0' }}
            >
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => setTypeSelectionVisible(true)}
              >
                Record First Measurement
              </Button>
            </Empty>
          )}
        </div>
      </Space>

      {/* Modals */}
      {renderTypeSelectionModal()}
      
      <VitalSignsModal
        visible={modalVisibility.vital_signs}
        onClose={() => closeModal('vital_signs')}
        patient={patient}
      />
      
      <BloodTestModal
        visible={modalVisibility.blood_tests}
        onClose={() => closeModal('blood_tests')}
        patient={patient}
      />
      
      <PhysicalMeasurementsModal
        visible={modalVisibility.physical}
        onClose={() => closeModal('physical')}
        patient={patient}
      />
      
      <SubjectiveMeasurementsModal
        visible={modalVisibility.subjective}
        onClose={() => closeModal('subjective')}
        patient={patient}
      />

      <UrineTestModal
        visible={modalVisibility.urine_tests}
        onClose={() => closeModal('urine_tests')}
        patient={patient}
      />

      <TrendsModal
        visible={modalVisibility.trends}
        onClose={() => closeModal('trends')}
        patient={patient}
        measurements={getFilteredMeasurements()}
      />

      {renderSubcategorySelectionModal()}
    </div>
  )
}

export default MeasurementSection