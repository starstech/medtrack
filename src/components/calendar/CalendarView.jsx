import { useState } from 'react'
import { Calendar, Badge, Card, List, Typography, Space, Empty, Button } from 'antd'
import { 
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  EnvironmentOutlined,
  PlusOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import './CalendarView.css'

dayjs.extend(isSameOrAfter)
dayjs.extend(isSameOrBefore)

const { Text, Title } = Typography

const CalendarView = ({ 
  appointments, 
  viewType, 
  currentDate, 
  onDateChange, 
  selectedPatient 
}) => {
  const [selectedDate, setSelectedDate] = useState(currentDate)

  // Get appointments for a specific date
  const getAppointmentsForDate = (date) => {
    const dateStr = date.format('YYYY-MM-DD')
    return appointments.filter(apt => {
      const aptDate = dayjs(apt.dateTime).format('YYYY-MM-DD')
      return aptDate === dateStr
    })
  }

  // Get appointments for current view period
  const getAppointmentsForPeriod = () => {
    let startDate, endDate
    
    if (viewType === 'month') {
      startDate = currentDate.startOf('month')
      endDate = currentDate.endOf('month')
    } else if (viewType === 'week') {
      startDate = currentDate.startOf('week')
      endDate = currentDate.endOf('week')
    } else {
      startDate = currentDate.startOf('day')
      endDate = currentDate.endOf('day')
    }

    return appointments.filter(apt => {
      const aptDate = dayjs(apt.dateTime)
      return aptDate.isSameOrAfter(startDate) && aptDate.isSameOrBefore(endDate)
    })
  }

  const periodAppointments = getAppointmentsForPeriod()

  // Calendar cell renderer for month view
  const dateCellRender = (value) => {
    const dayAppointments = getAppointmentsForDate(value)
    
    if (dayAppointments.length === 0) return null

    return (
      <div className="calendar-cell-content">
        {dayAppointments.slice(0, 2).map((apt, index) => (
          <div key={apt.id} className="calendar-appointment-item">
            <Badge
              status={getAppointmentStatus(apt)}
              text={
                <Text size="small" className="appointment-text">
                  {dayjs(apt.dateTime).format('HH:mm')} {apt.title}
                </Text>
              }
            />
          </div>
        ))}
        {dayAppointments.length > 2 && (
          <div className="more-appointments">
            <Text size="small" type="secondary">
              +{dayAppointments.length - 2} more
            </Text>
          </div>
        )}
      </div>
    )
  }

  const getAppointmentStatus = (appointment) => {
    const now = dayjs()
    const aptTime = dayjs(appointment.dateTime)
    
    if (aptTime.isBefore(now)) {
      return 'default' // Past appointment
    } else if (aptTime.diff(now, 'hours') <= 24) {
      return 'warning' // Within 24 hours
    } else {
      return 'processing' // Future appointment
    }
  }

  const getAppointmentTypeColor = (type) => {
    const colors = {
      routine_checkup: '#1890ff',
      follow_up: '#52c41a',
      specialist: '#722ed1',
      emergency: '#ff4d4f',
      dental: '#fa8c16',
      therapy: '#13c2c2'
    }
    return colors[type] || '#8c8c8c'
  }

  const handleDateSelect = (date) => {
    setSelectedDate(date)
    if (viewType === 'day') {
      onDateChange(date)
    }
  }

  const handlePanelChange = (date, mode) => {
    onDateChange(date)
  }

  const renderMonthView = () => {
    return (
      <div className="calendar-month-view">
        <Calendar
          value={currentDate}
          onSelect={handleDateSelect}
          onPanelChange={handlePanelChange}
          dateCellRender={dateCellRender}
          className="appointment-calendar"
          mode="month"
        />
        
        {/* Selected Date Details */}
        {renderSelectedDateDetails()}
      </div>
    )
  }

  const renderWeekView = () => {
    const startOfWeek = currentDate.startOf('week')
    const weekDays = Array.from({ length: 7 }, (_, i) => 
      startOfWeek.add(i, 'day')
    )

    return (
      <div className="calendar-week-view">
        <div className="week-header">
          {weekDays.map(day => (
            <div key={day.format('YYYY-MM-DD')} className="week-day-header">
              <div className="day-name">{day.format('ddd')}</div>
              <div className="day-number">{day.format('D')}</div>
            </div>
          ))}
        </div>
        
        <div className="week-content">
          {weekDays.map(day => {
            const dayAppointments = getAppointmentsForDate(day)
            return (
              <div key={day.format('YYYY-MM-DD')} className="week-day-column">
                {dayAppointments.map(apt => (
                  <div
                    key={apt.id}
                    className="week-appointment-item"
                    style={{
                      borderLeft: `4px solid ${getAppointmentTypeColor(apt.type)}`
                    }}
                  >
                    <div className="appointment-time">
                      {dayjs(apt.dateTime).format('HH:mm')}
                    </div>
                    <div className="appointment-title">{apt.title}</div>
                    <div className="appointment-patient">
                      {selectedPatient === 'all' && apt.patient && (
                        <Text size="small" type="secondary">
                          {apt.patient.name}
                        </Text>
                      )}
                    </div>
                  </div>
                ))}
                {dayAppointments.length === 0 && (
                  <div className="no-appointments">
                    <Text type="secondary" size="small">No appointments</Text>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderDayView = () => {
    const dayAppointments = getAppointmentsForDate(currentDate)
    
    return (
      <div className="calendar-day-view">
        <div className="day-header">
          <Title level={3}>
            {currentDate.format('dddd, MMMM D, YYYY')}
          </Title>
        </div>
        
        <div className="day-content">
          {dayAppointments.length === 0 ? (
            <Empty
              image={<CalendarOutlined className="empty-icon" />}
              imageStyle={{ fontSize: 64, color: '#d9d9d9' }}
              description={
                <div className="empty-description">
                  <Text strong>No appointments today</Text>
                  <br />
                  <Text type="secondary">
                    You have a free day! Consider scheduling routine check-ups.
                  </Text>
                </div>
              }
            >
              <Button type="primary" icon={<PlusOutlined />}>
                Schedule Appointment
              </Button>
            </Empty>
          ) : (
            <List
              dataSource={dayAppointments.sort((a, b) => 
                dayjs(a.dateTime).isBefore(dayjs(b.dateTime)) ? -1 : 1
              )}
              renderItem={(apt) => (
                <List.Item>
                  <Card
                    className="day-appointment-card"
                    size="small"
                    style={{
                      borderLeft: `4px solid ${getAppointmentTypeColor(apt.type)}`,
                      width: '100%'
                    }}
                  >
                    <div className="appointment-details">
                      <div className="appointment-header">
                        <Space>
                          <ClockCircleOutlined />
                          <Text strong>{dayjs(apt.dateTime).format('h:mm A')}</Text>
                          <Text type="secondary">({apt.duration} min)</Text>
                        </Space>
                        <Badge
                          status={getAppointmentStatus(apt)}
                          text={apt.type.replace('_', ' ').toUpperCase()}
                        />
                      </div>
                      
                      <Title level={5} className="appointment-title">
                        {apt.title}
                      </Title>
                      
                      <Space direction="vertical" size="small">
                        <div className="appointment-doctor">
                          <UserOutlined />
                          <Text>Dr. {apt.doctor}</Text>
                        </div>
                        
                        <div className="appointment-location">
                          <EnvironmentOutlined />
                          <Text>{apt.location}</Text>
                          {apt.address && (
                            <Text type="secondary" size="small">
                              <br />{apt.address}
                            </Text>
                          )}
                        </div>
                        
                        {selectedPatient === 'all' && apt.patient && (
                          <div className="appointment-patient">
                            <UserOutlined />
                            <Text>Patient: {apt.patient.name}</Text>
                          </div>
                        )}
                        
                        {apt.notes && (
                          <div className="appointment-notes">
                            <Text type="secondary" size="small">
                              Notes: {apt.notes}
                            </Text>
                          </div>
                        )}
                      </Space>
                    </div>
                  </Card>
                </List.Item>
              )}
            />
          )}
        </div>
      </div>
    )
  }

  const renderSelectedDateDetails = () => {
    const selectedAppointments = getAppointmentsForDate(selectedDate)
    
    if (selectedAppointments.length === 0) return null

    return (
      <Card
        className="selected-date-details"
        title={
          <Space>
            <CalendarOutlined />
            <span>{selectedDate.format('MMMM D, YYYY')}</span>
          </Space>
        }
        size="small"
      >
        <List
          dataSource={selectedAppointments.sort((a, b) => 
            dayjs(a.dateTime).isBefore(dayjs(b.dateTime)) ? -1 : 1
          )}
          renderItem={(apt) => (
            <List.Item className="selected-date-appointment">
              <Space>
                <Badge
                  status={getAppointmentStatus(apt)}
                  color={getAppointmentTypeColor(apt.type)}
                />
                <div>
                  <Text strong>{dayjs(apt.dateTime).format('h:mm A')}</Text>
                  <Text> - {apt.title}</Text>
                  {selectedPatient === 'all' && apt.patient && (
                    <Text type="secondary" size="small">
                      <br />{apt.patient.name}
                    </Text>
                  )}
                </div>
              </Space>
            </List.Item>
          )}
          split={false}
        />
      </Card>
    )
  }

  // Render based on view type
  switch (viewType) {
    case 'week':
      return renderWeekView()
    case 'day':
      return renderDayView()
    default:
      return renderMonthView()
  }
}

export default CalendarView