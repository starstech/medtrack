import { Card, List, Avatar, Tag, Typography, Space, Button, Progress, Empty, theme, Spin, Alert } from 'antd'
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

const { Text, Title } = Typography

const MedicationOverview = () => {
  const { 
    patients,
    medications,
    selectedPatient,
    loading,
    error,
    getTodaysDoses
  } = usePatients()
  const navigate = useNavigate()
  const { token: { colorPrimary, colorSuccess, colorWarning, colorError } } = theme.useToken()

  // Handle loading state
  if (loading) {
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
      >
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
          <Text type="secondary" style={{ display: 'block', marginTop: '16px' }}>
            Loading medications...
          </Text>
        </div>
      </Card>
    )
  }

  // Handle error state
  if (error) {
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
      >
        <Alert
          message="Error Loading Medications"
          description={error}
          type="error"
          showIcon
        />
      </Card>
    )
  }

  // Use real context data
  const allPatients = patients || []
  const allMedications = medications || []

  // Filter medications based on selected patient using real data
  const filteredMedications = selectedPatient 
    ? allMedications.filter(med => 
        (med.patient_id === selectedPatient.id || med.patientId === selectedPatient.id) && 
        (med.is_active === true || med.isActive === true)
      )
    : allMedications.filter(med => med.is_active === true || med.isActive === true)

  // Get today's doses using real context data
  const todaysDoses = getTodaysDoses ? getTodaysDoses() : []
  const filteredTodaysDoses = selectedPatient
    ? todaysDoses.filter(dose => {
        const patientId = dose.patient_id || dose.patientId
        return patientId === selectedPatient.id
      })
    : todaysDoses

  const takenToday = filteredTodaysDoses.filter(dose => dose.status === 'taken').length
  const totalToday = filteredTodaysDoses.length
  const completionPercentage = totalToday > 0 ? Math.round((takenToday / totalToday) * 100) : 0

  // Get medications with upcoming doses today - modified to show all medications if no doses today
  const getMedicationsWithDoses = () => {
    const medicationDoses = {}
    
    // First, try to get medications with today's doses
    filteredTodaysDoses.forEach(dose => {
      const medId = dose.medication_id || dose.medicationId
      const medication = allMedications.find(m => m.id === medId)
      if (medication) {
        const patientId = medication.patient_id || medication.patientId
        const patient = allPatients.find(p => p.id === patientId)
        
        if (!medicationDoses[medId]) {
          medicationDoses[medId] = {
            medication,
            patient,
            doses: []
          }
        }
        medicationDoses[medId].doses.push(dose)
      }
    })

    // If no medications with today's doses, show active medications anyway
    if (Object.keys(medicationDoses).length === 0) {
      filteredMedications.forEach(medication => {
        const patientId = medication.patient_id || medication.patientId
        const patient = allPatients.find(p => p.id === patientId)
        if (patient) {
          medicationDoses[medication.id] = {
            medication,
            patient,
            doses: medication.doses || []
          }
        }
      })
    }

    return Object.values(medicationDoses).slice(0, 5) // Show top 5
  }

  const medicationsWithDoses = getMedicationsWithDoses()

  const getNextDoseTime = (doses) => {
    const pendingDoses = doses
      .filter(dose => dose.status === 'pending')
      .sort((a, b) => new Date(a.scheduledTime || a.scheduled_time) - new Date(b.scheduledTime || b.scheduled_time))
    
    return pendingDoses.length > 0 ? (pendingDoses[0].scheduledTime || pendingDoses[0].scheduled_time) : null
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
          
          // Handle both database schema formats
          const medicationName = medication.name || medication.medication_name
          const medicationDosage = medication.dosage || medication.dose_amount
          const medicationFrequency = medication.frequency || medication.dose_frequency
          
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
                    <Text strong>{medicationName}</Text>
                    {!selectedPatient && patient && (
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
                    {medicationDosage} • {medicationFrequency}
                  </Text>

                  {nextDose && (
                    <div className="next-dose">
                      <ClockCircleOutlined style={{ color: colorWarning }} />
                      <Text type="secondary">Next dose at {formatTime(nextDose)}</Text>
                    </div>
                  )}

                  {status.total > 0 && (
                    <Progress 
                      percent={(status.taken / status.total) * 100}
                      size="small"
                      strokeColor={colorSuccess}
                      showInfo={false}
                      style={{ marginTop: '8px' }}
                    />
                  )}
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