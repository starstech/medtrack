// Mock data for development and testing

export const mockPatients = [
    {
      id: 'patient1',
      name: 'Emma Johnson',
      dateOfBirth: '2018-03-15',
      age: 7,
      gender: 'female',
      allergies: ['Penicillin', 'Peanuts'],
      medicalConditions: ['Asthma', 'Mild anxiety'],
      emergencyContact: {
        name: 'Sarah Johnson',
        relationship: 'Mother',
        phone: '+1-555-0123'
      },
      caregivers: [
        { id: 'caregiver1', name: 'Sarah Johnson', role: 'primary', email: 'sarah@example.com' },
        { id: 'caregiver2', name: 'Mike Johnson', role: 'secondary', email: 'mike@example.com' }
      ],
      createdAt: '2024-01-15T08:00:00Z',
      profileImage: null
    },
    {
      id: 'patient2',
      name: 'James Wilson',
      dateOfBirth: '2020-07-22',
      age: 4,
      gender: 'male',
      allergies: ['Shellfish'],
      medicalConditions: ['ADHD'],
      emergencyContact: {
        name: 'Lisa Wilson',
        relationship: 'Mother',
        phone: '+1-555-0456'
      },
      caregivers: [
        { id: 'caregiver1', name: 'Lisa Wilson', role: 'primary', email: 'lisa@example.com' },
        { id: 'caregiver3', name: 'David Wilson', role: 'secondary', email: 'david@example.com' }
      ],
      createdAt: '2024-02-01T10:30:00Z',
      profileImage: null
    },
    {
      id: 'patient3',
      name: 'Maria Garcia',
      dateOfBirth: '1985-11-08',
      age: 39,
      gender: 'female',
      allergies: [],
      medicalConditions: ['Diabetes Type 2', 'Hypertension'],
      emergencyContact: {
        name: 'Carlos Garcia',
        relationship: 'Spouse',
        phone: '+1-555-0789'
      },
      caregivers: [
        { id: 'caregiver1', name: 'Current User', role: 'self', email: 'user@example.com' },
        { id: 'caregiver4', name: 'Carlos Garcia', role: 'spouse', email: 'carlos@example.com' }
      ],
      createdAt: '2024-01-20T14:15:00Z',
      profileImage: null
    }
  ]
  
  export const mockMedications = [
    {
      id: 'med1',
      patientId: 'patient1',
      name: 'Amoxicillin',
      dosage: '250mg',
      form: 'tablet',
      frequency: 'twice_daily',
      duration: '10 days',
      instructions: 'Take with food',
      prescribedBy: 'Dr. Smith',
      startDate: '2024-06-01',
      endDate: '2024-06-11',
      isActive: true,
      createdAt: '2024-06-01T09:00:00Z',
      doses: [
        {
          id: 'dose1',
          scheduledTime: '2024-06-03T08:00:00Z',
          status: 'taken',
          takenAt: '2024-06-03T08:05:00Z',
          notes: 'Taken with breakfast'
        },
        {
          id: 'dose2',
          scheduledTime: '2024-06-03T20:00:00Z',
          status: 'pending',
          takenAt: null,
          notes: ''
        },
        {
          id: 'dose3',
          scheduledTime: '2024-06-04T08:00:00Z',
          status: 'pending',
          takenAt: null,
          notes: ''
        }
      ]
    },
    {
      id: 'med2',
      patientId: 'patient1',
      name: 'Albuterol Inhaler',
      dosage: '2 puffs',
      form: 'inhaler',
      frequency: 'as_needed',
      duration: 'ongoing',
      instructions: 'Use during asthma attacks or before exercise',
      prescribedBy: 'Dr. Smith',
      startDate: '2024-05-15',
      endDate: null,
      isActive: true,
      createdAt: '2024-05-15T11:00:00Z',
      doses: []
    },
    {
      id: 'med3',
      patientId: 'patient2',
      name: 'Methylphenidate',
      dosage: '5mg',
      form: 'tablet',
      frequency: 'once_daily',
      duration: 'ongoing',
      instructions: 'Take in the morning with breakfast',
      prescribedBy: 'Dr. Johnson',
      startDate: '2024-05-01',
      endDate: null,
      isActive: true,
      createdAt: '2024-05-01T07:30:00Z',
      doses: [
        {
          id: 'dose4',
          scheduledTime: '2024-06-03T07:30:00Z',
          status: 'taken',
          takenAt: '2024-06-03T07:35:00Z',
          notes: 'Good response today'
        },
        {
          id: 'dose5',
          scheduledTime: '2024-06-04T07:30:00Z',
          status: 'pending',
          takenAt: null,
          notes: ''
        }
      ]
    },
    {
      id: 'med4',
      patientId: 'patient3',
      name: 'Metformin',
      dosage: '500mg',
      form: 'tablet',
      frequency: 'twice_daily',
      duration: 'ongoing',
      instructions: 'Take with meals',
      prescribedBy: 'Dr. Rodriguez',
      startDate: '2024-01-15',
      endDate: null,
      isActive: true,
      createdAt: '2024-01-15T10:00:00Z',
      doses: [
        {
          id: 'dose6',
          scheduledTime: '2024-06-03T08:00:00Z',
          status: 'taken',
          takenAt: '2024-06-03T08:10:00Z',
          notes: ''
        },
        {
          id: 'dose7',
          scheduledTime: '2024-06-03T18:00:00Z',
          status: 'taken',
          takenAt: '2024-06-03T18:15:00Z',
          notes: ''
        },
        {
          id: 'dose8',
          scheduledTime: '2024-06-04T08:00:00Z',
          status: 'pending',
          takenAt: null,
          notes: ''
        }
      ]
    },
    {
      id: 'med5',
      patientId: 'patient3',
      name: 'Lisinopril',
      dosage: '10mg',
      form: 'tablet',
      frequency: 'once_daily',
      duration: 'ongoing',
      instructions: 'Take in the morning',
      prescribedBy: 'Dr. Rodriguez',
      startDate: '2024-01-15',
      endDate: null,
      isActive: true,
      createdAt: '2024-01-15T10:00:00Z',
      doses: [
        {
          id: 'dose9',
          scheduledTime: '2024-06-03T09:00:00Z',
          status: 'taken',
          takenAt: '2024-06-03T09:05:00Z',
          notes: ''
        },
        {
          id: 'dose10',
          scheduledTime: '2024-06-04T09:00:00Z',
          status: 'pending',
          takenAt: null,
          notes: ''
        }
      ]
    }
  ]
  
  export const mockMeasurements = [
    {
      id: 'measure1',
      patientId: 'patient1',
      type: 'temperature',
      value: 98.6,
      unit: '°F',
      recordedAt: '2024-06-03T07:30:00Z',
      notes: 'Normal temperature, feeling well',
      recordedBy: 'Sarah Johnson'
    },
    {
      id: 'measure2',
      patientId: 'patient1',
      type: 'weight',
      value: 45,
      unit: 'lbs',
      recordedAt: '2024-06-02T08:00:00Z',
      notes: 'Weekly weight check',
      recordedBy: 'Sarah Johnson'
    },
    {
      id: 'measure3',
      patientId: 'patient2',
      type: 'height',
      value: 42,
      unit: 'inches',
      recordedAt: '2024-06-01T10:00:00Z',
      notes: 'Monthly growth check',
      recordedBy: 'Lisa Wilson'
    },
    {
      id: 'measure4',
      patientId: 'patient3',
      type: 'blood_glucose',
      value: 125,
      unit: 'mg/dL',
      recordedAt: '2024-06-03T07:00:00Z',
      notes: 'Fasting glucose reading',
      recordedBy: 'Maria Garcia'
    },
    {
      id: 'measure5',
      patientId: 'patient3',
      type: 'blood_pressure',
      value: '135/85',
      unit: 'mmHg',
      recordedAt: '2024-06-03T08:30:00Z',
      notes: 'Slightly elevated, will monitor',
      recordedBy: 'Maria Garcia'
    },
    {
      id: 'measure6',
      patientId: 'patient1',
      type: 'urine_dipstick',
      value: 'Normal',
      unit: '',
      recordedAt: '2024-06-03T09:00:00Z',
      notes: 'All parameters within normal range',
      recordedBy: 'Sarah Johnson'
    }
  ]
  
  export const mockLogs = [
    {
      id: 'log1',
      patientId: 'patient1',
      timestamp: '2024-06-03T11:00:00Z',
      type: 'incident',
      title: 'Threw up after breakfast',
      description: 'Emma vomited about 30 minutes after eating breakfast. She had eaten quickly and drank milk. No fever, seems to feel better now.',
      severity: 'moderate',
      recordedBy: 'Sarah Johnson',
      tags: ['vomiting', 'breakfast', 'milk'],
      followUpRequired: false
    },
    {
      id: 'log2',
      patientId: 'patient1',
      timestamp: '2024-06-03T14:30:00Z',
      type: 'activity',
      title: 'Used inhaler',
      description: 'Used albuterol inhaler before soccer practice as preventive measure.',
      severity: 'normal',
      recordedBy: 'Mike Johnson',
      tags: ['inhaler', 'sports', 'prevention'],
      followUpRequired: false
    },
    {
      id: 'log3',
      patientId: 'patient2',
      timestamp: '2024-06-03T10:15:00Z',
      type: 'behavior',
      title: 'Good focus in school',
      description: 'Teacher reported James had excellent focus during math class today. Medication seems to be working well.',
      severity: 'positive',
      recordedBy: 'Lisa Wilson',
      tags: ['school', 'focus', 'medication-response'],
      followUpRequired: false
    },
    {
      id: 'log4',
      patientId: 'patient2',
      timestamp: '2024-06-03T12:45:00Z',
      type: 'incident',
      title: 'Had diarrhea after lunch',
      description: 'James had loose stools about 1 hour after lunch. He had eaten school pizza and chocolate milk. Gave him water and crackers.',
      severity: 'mild',
      recordedBy: 'School Nurse',
      tags: ['diarrhea', 'lunch', 'school-food'],
      followUpRequired: true
    },
    {
      id: 'log5',
      patientId: 'patient3',
      timestamp: '2024-06-03T16:20:00Z',
      type: 'incident',
      title: 'Dizzy spell and near fall',
      description: 'Felt very dizzy when standing up from couch, almost fell. Blood pressure was elevated this morning (135/85). Sat down immediately and drank water.',
      severity: 'moderate',
      recordedBy: 'Maria Garcia',
      tags: ['dizziness', 'blood-pressure', 'fall-risk'],
      followUpRequired: true
    },
    {
      id: 'log6',
      patientId: 'patient3',
      timestamp: '2024-06-03T19:45:00Z',
      type: 'meal',
      title: 'Healthy dinner',
      description: 'Had grilled chicken salad with quinoa. Blood sugar should be stable.',
      severity: 'positive',
      recordedBy: 'Carlos Garcia',
      tags: ['healthy-meal', 'diabetes-friendly'],
      followUpRequired: false
    },
    {
      id: 'log7',
      patientId: 'patient1',
      timestamp: '2024-06-02T09:30:00Z',
      type: 'incident',
      title: 'Allergic reaction to new soap',
      description: 'Emma developed red, itchy rash on arms after using new body wash. Stopped use immediately and applied anti-itch cream. Rash improving.',
      severity: 'mild',
      recordedBy: 'Sarah Johnson',
      tags: ['allergic-reaction', 'rash', 'soap', 'skin'],
      followUpRequired: false
    },
    {
      id: 'log8',
      patientId: 'patient2',
      timestamp: '2024-06-02T15:20:00Z',
      type: 'incident',
      title: 'Nosebleed during playtime',
      description: 'James had a sudden nosebleed while playing with blocks. No trauma or injury. Bleeding stopped after 5 minutes with pressure. He seems fine.',
      severity: 'mild',
      recordedBy: 'David Wilson',
      tags: ['nosebleed', 'spontaneous', 'play'],
      followUpRequired: false
    },
    {
      id: 'log9',
      patientId: 'patient3',
      timestamp: '2024-06-01T22:15:00Z',
      type: 'incident',
      title: 'Woke up with chest tightness',
      description: 'Woke up around 10pm with mild chest discomfort and shortness of breath. Blood pressure was normal. Symptoms resolved after sitting up for 20 minutes.',
      severity: 'moderate',
      recordedBy: 'Maria Garcia',
      tags: ['chest-pain', 'breathing', 'nighttime', 'anxiety'],
      followUpRequired: true
    },
    {
      id: 'log10',
      patientId: 'patient1',
      timestamp: '2024-06-01T16:45:00Z',
      type: 'symptom',
      title: 'Mild wheezing after exercise',
      description: 'Emma had slight wheezing after running around playground. Used inhaler and symptoms cleared within 10 minutes.',
      severity: 'mild',
      recordedBy: 'Mike Johnson',
      tags: ['wheezing', 'exercise', 'asthma', 'inhaler-used'],
      followUpRequired: false
    }
  ]
  
  export const mockAppointments = [
    {
      id: 'appt1',
      patientId: 'patient1',
      title: 'Pediatric Checkup',
      doctor: 'Dr. Smith',
      dateTime: '2024-06-05T14:00:00Z',
      duration: 60,
      location: 'Children\'s Medical Center',
      address: '123 Medical Dr, Suite 100',
      type: 'routine_checkup',
      notes: 'Annual physical examination',
      reminders: ['24_hours', '1_hour'],
      createdAt: '2024-05-20T10:00:00Z'
    },
    {
      id: 'appt2',
      patientId: 'patient2',
      title: 'ADHD Follow-up',
      doctor: 'Dr. Johnson',
      dateTime: '2024-06-07T10:30:00Z',
      duration: 45,
      location: 'Pediatric Psychology Center',
      address: '456 Health St, Floor 3',
      type: 'follow_up',
      notes: 'Review medication effectiveness and behavioral progress',
      reminders: ['24_hours', '2_hours'],
      createdAt: '2024-05-25T15:30:00Z'
    },
    {
      id: 'appt3',
      patientId: 'patient3',
      title: 'Diabetes Management',
      doctor: 'Dr. Rodriguez',
      dateTime: '2024-06-10T09:00:00Z',
      duration: 30,
      location: 'Endocrinology Clinic',
      address: '789 Wellness Blvd, Suite 200',
      type: 'specialist',
      notes: 'Quarterly diabetes review and A1C test',
      reminders: ['24_hours', '1_hour'],
      createdAt: '2024-05-28T08:00:00Z'
    },
    {
      id: 'appt4',
      patientId: 'patient1',
      title: 'Dental Cleaning',
      doctor: 'Dr. White',
      dateTime: '2024-06-12T16:00:00Z',
      duration: 45,
      location: 'Smile Dental Care',
      address: '321 Dental Ave',
      type: 'dental',
      notes: 'Regular cleaning and fluoride treatment',
      reminders: ['24_hours'],
      createdAt: '2024-05-30T11:00:00Z'
    }
  ]
  
  // Utility functions for working with mock data
  export const getMedicationsByPatient = (patientId) => {
    return mockMedications.filter(med => med.patientId === patientId)
  }
  
  export const getMeasurementsByPatient = (patientId) => {
    return mockMeasurements.filter(measurement => measurement.patientId === patientId)
  }
  
  export const getLogsByPatient = (patientId) => {
    return mockLogs.filter(log => log.patientId === patientId)
  }
  
  export const getAppointmentsByPatient = (patientId) => {
    return mockAppointments.filter(appt => appt.patientId === patientId)
  }
  
  export const getTodaysDoses = () => {
    const today = new Date().toDateString()
    const doses = []
    
    mockMedications.forEach(medication => {
      const patient = mockPatients.find(p => p.id === medication.patientId)
      medication.doses?.forEach(dose => {
        const doseDate = new Date(dose.scheduledTime).toDateString()
        if (doseDate === today) {
          doses.push({
            ...dose,
            medication,
            patient
          })
        }
      })
    })
    
    return doses.sort((a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime))
  }
  
  export const getUpcomingAppointments = (days = 7) => {
    const now = new Date()
    const futureDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000))
    
    return mockAppointments
      .filter(appt => {
        const apptDate = new Date(appt.dateTime)
        return apptDate >= now && apptDate <= futureDate
      })
      .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime))
      .map(appt => ({
        ...appt,
        patient: mockPatients.find(p => p.id === appt.patientId)
      }))
  }
  
  // Constants for dropdown options
  export const MEDICATION_FREQUENCIES = [
    { value: 'once_daily', label: 'Once daily' },
    { value: 'twice_daily', label: 'Twice daily' },
    { value: 'three_times_daily', label: 'Three times daily' },
    { value: 'four_times_daily', label: 'Four times daily' },
    { value: 'as_needed', label: 'As needed' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' }
  ]
  
  export const MEDICATION_FORMS = [
    { value: 'tablet', label: 'Tablet' },
    { value: 'capsule', label: 'Capsule' },
    { value: 'liquid', label: 'Liquid' },
    { value: 'injection', label: 'Injection' },
    { value: 'inhaler', label: 'Inhaler' },
    { value: 'cream', label: 'Cream/Ointment' },
    { value: 'drops', label: 'Drops' },
    { value: 'patch', label: 'Patch' }
  ]
  
  export const MEASUREMENT_TYPES = [
    { value: 'temperature', label: 'Temperature', unit: '°F' },
    { value: 'weight', label: 'Weight', unit: 'lbs' },
    { value: 'height', label: 'Height', unit: 'inches' },
    { value: 'blood_pressure', label: 'Blood Pressure', unit: 'mmHg' },
    { value: 'blood_glucose', label: 'Blood Glucose', unit: 'mg/dL' },
    { value: 'heart_rate', label: 'Heart Rate', unit: 'bpm' },
    { value: 'oxygen_saturation', label: 'Oxygen Saturation', unit: '%' },
    { value: 'urine_dipstick', label: 'Urine Dipstick', unit: '' },
    { value: 'peak_flow', label: 'Peak Flow', unit: 'L/min' }
  ]
  
  export const LOG_TYPES = [
    { value: 'incident', label: 'Incident', color: '#ff4d4f' },
    { value: 'symptom', label: 'Symptom', color: '#ff7a45' },
    { value: 'behavior', label: 'Behavior', color: '#1890ff' },
    { value: 'activity', label: 'Activity', color: '#52c41a' },
    { value: 'meal', label: 'Meal', color: '#fa8c16' },
    { value: 'sleep', label: 'Sleep', color: '#722ed1' },
    { value: 'medication', label: 'Medication', color: '#13c2c2' },
    { value: 'general', label: 'General', color: '#8c8c8c' }
  ]
  
  export const SEVERITY_LEVELS = [
    { value: 'positive', label: 'Positive', color: '#52c41a' },
    { value: 'normal', label: 'Normal', color: '#1890ff' },
    { value: 'mild', label: 'Mild', color: '#fa8c16' },
    { value: 'moderate', label: 'Moderate', color: '#ff7a45' },
    { value: 'severe', label: 'Severe', color: '#ff4d4f' }
  ]