import { Card, List, Avatar, Tag, Typography, Space, Button, Progress, Empty, theme } from 'antd'
import { 
  MedicineBoxOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
  EyeOutlined,
  RightOutlined
} from '@ant-design/icons'
import { usePatients } from '../../hooks/usePatients'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import './MedicationOverview.css'
import { mockMedications, mockPatients } from '../../utils/mockData'

const { Text, Title } = Typography

const MedicationOverview = () => {
  const { 
    selectedPatient
  } = usePatients()
  const navigate = useNavigate()
  const { token: { colorPrimary, colorSuccess, colorWarning, colorError } } = theme.useToken()

  // Mock function to get today's doses
  const getMockTodaysDoses = () => {
    const today = new Date()
    const doses = []
    
    mockMedications.forEach(medication => {
      const patient = mockPatients.find(p => p.id === medication.patientId)
      medication.doses?.forEach(dose => {
        // Create doses for today by updating the date part while keeping the time
        const originalDate = new Date(dose.scheduledTime)
        const todaysDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 
          originalDate.getHours(), originalDate.getMinutes(), originalDate.getSeconds())
        
        doses.push({
          ...dose,
          scheduledTime: todaysDate.toISOString(),
          medication,
          patient
        })
      })
    })
    
    return doses.sort((a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime))
  }

  // Filter medications based on selected patient using mock data
  const filteredMedications = selectedPatient 
    ? mockMedications.filter(med => med.patientId === selectedPatient.id && med.isActive)
    : mockMedications.filter(med => med.isActive)

  // Get today's doses for overview using mock data
  const todaysDoses = getMockTodaysDoses()
  const filteredTodaysDoses = selectedPatient
    ? todaysDoses.filter(dose => dose.patient.id === selectedPatient.id)
    : todaysDoses

  const takenToday = filteredTodaysDoses.filter(dose => dose.status === 'taken').length
  const totalToday = filteredTodaysDoses.length
  const completionPercentage = totalToday > 0 ? Math.round((takenToday / totalToday) * 100) : 0

  // Get medications with upcoming doses today - modified to show all medications if no doses today
  const getMedicationsWithDoses = () => {
    const medicationDoses = {}
    
    // First, try to get medications with today's doses
    filteredTodaysDoses.forEach(dose => {
      const medId = dose.medication.id
      if (!medicationDoses[medId]) {
        medicationDoses[medId] = {
          medication: dose.medication,
          patient: dose.patient,
          doses: []
        }
      }
      medicationDoses[medId].doses.push(dose)
    })

    // If no medications with today's doses, show active medications anyway
    if (Object.keys(medicationDoses).length === 0) {
      filteredMedications.forEach(medication => {
        const patient = mockPatients.find(p => p.id === medication.patientId)
        medicationDoses[medication.id] = {
          medication,
          patient,
          doses: medication.doses || []
        }
      })
    }

    return Object.values(medicationDoses).slice(0, 5) // Show top 5
  }

  const medicationsWithDoses = getMedicationsWithDoses()

  const getNextDoseTime = (doses) => {
    const pendingDoses = doses
      .filter(dose => dose.status === 'pending')
      .sort((a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime))
    
    return pendingDoses.length > 0 ? pendingDoses[0].scheduledTime : null
  }

  const getDoseStatus = (doses) => {
    const taken = doses.filter(dose => dose.status === 'taken').length
    const total = doses.length
    const pending = total - taken
    
    return { taken, total, pending }
  }

  const formatTime = (dateTime) => {
    return dayjs(dateTime).format('h:mm A')
  }

  const handleViewAllMedications = () => {
    if (selectedPatient) {
      navigate(`/patients/${selectedPatient.id}`)
    } else {
      navigate('/patients')
    }
  }

  const handleViewTodaysDoses = () => {
    navigate('/todays-doses')
  }

  const handleAddMedication = () => {
    navigate('/patients')
  }

  if (filteredMedications.length === 0) {
    return (
      <div className="empty-medications">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <Text type="secondary">
              {selectedPatient 
                ? `No active medications for ${selectedPatient.name}`
                : 'No active medications found'
              }
            </Text>
          }
        >
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleAddMedication}
            size="large"
          >
            Add Medication
          </Button>
        </Empty>
      </div>
    )
  }

  return (
    <Card 
      className="dashboard-card medication-overview-card"
      bordered={false}
      title={
        <Space>
          <MedicineBoxOutlined />
          <Text strong style={{ fontSize: '16px' }}>Medication Overview</Text>
        </Space>
      }
      extra={
<Button 
          type="text"
          icon={<EyeOutlined />}
          onClick={handleViewAllMedications}
          className="view-all-btn"
        >
          View All
        </Button>
      }
    >
      {totalToday > 0 && (
        <div className="dose-progress">
          <div className="progress-header">
            <Text strong>Today's Progress</Text>
            <Text type="secondary">{takenToday} of {totalToday} taken</Text>
          </div>
          
          <Progress 
            percent={completionPercentage}
            strokeColor={{
              '0%': colorError,
              '50%': colorWarning,
              '100%': colorSuccess,
            }}
            size="small"
            style={{ margin: '12px 0' }}
          />

          <Button 
            type="link" 
            onClick={handleViewTodaysDoses}
            icon={<RightOutlined />}
            className="schedule-link"
          >
            View today's schedule
          </Button>
        </div>
      )}

      <div className="medications-list">
        <div className="list-header">
          <Text strong>Active Medications ({filteredMedications.length})</Text>
        </div>
        
        {medicationsWithDoses.map((item, index) => {
          const { medication, patient, doses } = item
          const nextDose = getNextDoseTime(doses)
          const status = getDoseStatus(doses)
          
          return (
            <div 
              key={medication.id} 
              className="medication-item"
              onClick={() => navigate(`/patients/${patient.id}`)}
            >
              <Space align="start" style={{ flex: 1 }}>
                <Avatar 
                  icon={<MedicineBoxOutlined />}
                  style={{ 
                    backgroundColor: status.pending > 0 ? colorWarning : colorSuccess,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                />
                <div className="medication-info">
                  <div className="medication-header">
                    <Text strong>{medication.name}</Text>
                    {!selectedPatient && (
                      <Tag 
                        color="blue"
                        style={{ 
                          borderRadius: '12px',
                          padding: '0 8px'
                        }}
                      >
                        {patient.name}
                      </Tag>
                    )}
                  </div>
                  
                  <Text type="secondary" className="medication-details">
                    {medication.dosage} • {medication.frequency}
                  </Text>

                  {nextDose && (
                    <div className="next-dose">
                      <ClockCircleOutlined style={{ color: colorWarning }} />
                      <Text type="secondary">Next dose at {formatTime(nextDose)}</Text>
                    </div>
                  )}

                  <Progress 
                    percent={(status.taken / status.total) * 100}
                    size="small"
                    strokeColor={colorSuccess}
                    showInfo={false}
                    style={{ marginTop: '8px' }}
                  />
                </div>
              </Space>

              <Button 
                type="text" 
                size="small"
                icon={<RightOutlined />}
                className="medication-action"
              />
            </div>
          )
        })}
      </div>
    </Card>
  )
}

export default MedicationOverview