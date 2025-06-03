import { Card, List, Avatar, Tag, Typography, Space, Button, Progress, Empty } from 'antd'
import { 
  MedicineBoxOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
  EyeOutlined
} from '@ant-design/icons'
import { usePatients } from '../../hooks/usePatients'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'

const { Text, Title } = Typography

const MedicationOverview = () => {
  const { 
    selectedPatient, 
    medications, 
    patients,
    getTodaysDoses 
  } = usePatients()
  const navigate = useNavigate()

  // Filter medications based on selected patient
  const filteredMedications = selectedPatient 
    ? medications.filter(med => med.patientId === selectedPatient.id && med.isActive)
    : medications.filter(med => med.isActive)

  // Get today's doses for overview
  const todaysDoses = getTodaysDoses()
  const filteredTodaysDoses = selectedPatient
    ? todaysDoses.filter(dose => dose.patient.id === selectedPatient.id)
    : todaysDoses

  const takenToday = filteredTodaysDoses.filter(dose => dose.status === 'taken').length
  const totalToday = filteredTodaysDoses.length
  const completionPercentage = totalToday > 0 ? Math.round((takenToday / totalToday) * 100) : 0

  // Get medications with upcoming doses today
  const getMedicationsWithDoses = () => {
    const medicationDoses = {}
    
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

  return (
    <Card 
      className="medication-overview-card"
      title={
        <Space>
          <MedicineBoxOutlined />
          <Title level={4} style={{ margin: 0 }}>
            Medication Overview
          </Title>
        </Space>
      }
      extra={
        filteredMedications.length > 0 && (
          <Button 
            type="link" 
            icon={<EyeOutlined />}
            onClick={handleViewAllMedications}
            size="small"
          >
            View All
          </Button>
        )
      }
      bodyStyle={{ padding: '16px' }}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Today's Progress */}
        {totalToday > 0 && (
          <div className="dose-progress">
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <div className="progress-header">
                <Text strong>Today's Doses</Text>
                <Text type="secondary">{takenToday} of {totalToday} taken</Text>
              </div>
              <Progress 
                percent={completionPercentage}
                strokeColor={{
                  '0%': '#ff4d4f',
                  '50%': '#fa8c16',
                  '100%': '#52c41a',
                }}
                size="small"
              />
              <Button 
                type="link" 
                size="small"
                onClick={handleViewTodaysDoses}
                style={{ padding: 0, height: 'auto' }}
              >
                View today's schedule →
              </Button>
            </Space>
          </div>
        )}

        {/* Medications List */}
        {filteredMedications.length === 0 ? (
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
            style={{ padding: '24px 0' }}
          >
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleAddMedication}
            >
              Add Medication
            </Button>
          </Empty>
        ) : (
          <div className="medications-list">
            <Text strong style={{ marginBottom: 12, display: 'block' }}>
              Active Medications ({filteredMedications.length})
            </Text>
            
            <List
              dataSource={medicationsWithDoses}
              renderItem={(item) => {
                const { medication, patient, doses } = item
                const nextDose = getNextDoseTime(doses)
                const status = getDoseStatus(doses)
                
                return (
                  <List.Item className="medication-item">
                    <List.Item.Meta
                      avatar={
                        <Avatar 
                          icon={<MedicineBoxOutlined />}
                          style={{ 
                            backgroundColor: status.pending > 0 ? '#fa8c16' : '#52c41a' 
                          }}
                        />
                      }
                      title={
                        <Space size="small" wrap>
                          <Text strong>{medication.name}</Text>
                          <Text type="secondary">
                            {medication.dosage} {medication.form}
                          </Text>
                          {!selectedPatient && (
                            <Tag size="small" color="blue">
                              {patient.name}
                            </Tag>
                          )}
                        </Space>
                      }
                      description={
                        <Space direction="vertical" size="small">
                          <Space size="small" wrap>
                            <Tag 
                              icon={<CheckCircleOutlined />} 
                              color="success"
                              size="small"
                            >
                              {status.taken} taken
                            </Tag>
                            {status.pending > 0 && (
                              <Tag 
                                icon={<ClockCircleOutlined />} 
                                color="warning"
                                size="small"
                              >
                                {status.pending} pending
                              </Tag>
                            )}
                          </Space>
                          
                          {nextDose && (
                            <Text type="secondary" size="small">
                              Next dose: {formatTime(nextDose)}
                            </Text>
                          )}
                          
                          <Text type="secondary" size="small">
                            {medication.frequency.replace('_', ' ')} • {medication.instructions}
                          </Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )
              }}
              size="small"
            />

            {/* Show remaining medications count */}
            {filteredMedications.length > medicationsWithDoses.length && (
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <Text type="secondary" size="small">
                  and {filteredMedications.length - medicationsWithDoses.length} more medications
                </Text>
              </div>
            )}
          </div>
        )}
      </Space>
    </Card>
  )
}

export default MedicationOverview