# Complete API Requirements for MedTrack - Supabase Backend & Firebase Push Notifications

## Overview
This document outlines ALL API endpoints and functions required for the complete MedTrack application, designed for Supabase backend with Firebase push notifications and mobile app compatibility.

## 1. Authentication & User Management

### Supabase Auth Integration
```sql
-- Users table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT DEFAULT 'caregiver',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### API Endpoints
```
POST /auth/register
POST /auth/login  
POST /auth/logout
POST /auth/refresh
GET /auth/profile
PUT /auth/profile
POST /users/upload-avatar
PUT /auth/change-password
POST /auth/request-password-reset
POST /auth/reset-password
POST /auth/verify-email
```

## 2. Patient Management

### Database Schema
```sql
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  date_of_birth DATE,
  gender TEXT,
  medical_record_number TEXT,
  emergency_contact JSONB,
  profile_image_url TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE patient_caregivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id),
  caregiver_id UUID REFERENCES profiles(id),
  role TEXT NOT NULL,
  permissions JSONB DEFAULT '{}',
  invited_at TIMESTAMP DEFAULT NOW(),
  accepted_at TIMESTAMP,
  UNIQUE(patient_id, caregiver_id)
);
```

### API Endpoints
```
GET /patients
GET /patients/{patientId}
POST /patients
PUT /patients/{patientId}
DELETE /patients/{patientId}
GET /patients/search?query=
GET /patients/{patientId}/caregivers
POST /patients/{patientId}/caregivers
PUT /patients/{patientId}/caregivers/{caregiverId}
DELETE /patients/{patientId}/caregivers/{caregiverId}
GET /patients/{patientId}/stats
GET /patients/{patientId}/activity?limit=
POST /patients/{patientId}/profile-image
```

## 3. Medication Management

### Database Schema
```sql
CREATE TABLE medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id),
  name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  instructions TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE doses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_id UUID REFERENCES medications(id),
  scheduled_time TIMESTAMP NOT NULL,
  status TEXT DEFAULT 'pending',
  taken_at TIMESTAMP,
  notes TEXT,
  marked_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### API Endpoints
```
GET /patients/{patientId}/medications
GET /medications/{medicationId}
POST /patients/{patientId}/medications
PUT /medications/{medicationId}
DELETE /medications/{medicationId}
GET /medications/{medicationId}/schedule
PUT /medications/{medicationId}/schedule
GET /medications/search?name=
GET /medications/{medicationId}/history
GET /medications/{medicationId}/adherence?period=

-- Dose Management
GET /doses/today?patientId=
GET /patients/{patientId}/doses
GET /doses/{doseId}
POST /doses/{doseId}/mark
PUT /doses/{doseId}/status
GET /doses/{doseId}/history
GET /patients/{patientId}/doses/adherence?period=
GET /patients/{patientId}/doses/patterns?period=
GET /doses/overdue?patientId=
GET /doses/upcoming?patientId=&hours=
POST /doses/{doseId}/snooze
POST /doses/bulk-mark
```

## 4. Measurements & Health Data

### Database Schema
```sql
CREATE TABLE measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id),
  type TEXT NOT NULL,
  value NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  notes TEXT,
  attachments JSONB DEFAULT '[]',
  recorded_at TIMESTAMP DEFAULT NOW(),
  recorded_by UUID REFERENCES profiles(id)
);
```

### API Endpoints
```
GET /patients/{patientId}/measurements?include=attachments&type=&period=
GET /measurements/{measurementId}
POST /patients/{patientId}/measurements
PUT /measurements/{measurementId}
DELETE /measurements/{measurementId}
GET /patients/{patientId}/measurements/trends?type=&period=
GET /patients/{patientId}/measurements/alerts
GET /patients/{patientId}/measurements/latest
GET /patients/{patientId}/measurements/stats?type=&period=
POST /patients/{patientId}/measurements/bulk
GET /patients/{patientId}/measurements/ranges?type=
PUT /patients/{patientId}/measurements/ranges
POST /measurements/{measurementId}/image
```

## 5. Daily Logs & Observations

### Database Schema
```sql
CREATE TABLE daily_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL,
  severity TEXT DEFAULT 'normal',
  tags TEXT[] DEFAULT '{}',
  attachments JSONB DEFAULT '[]',
  follow_up_required BOOLEAN DEFAULT false,
  timestamp TIMESTAMP DEFAULT NOW(),
  recorded_by UUID REFERENCES profiles(id)
);
```

### API Endpoints
```
GET /patients/{patientId}/logs?include=attachments&type=&severity=
GET /logs/{logId}
POST /patients/{patientId}/logs
PUT /logs/{logId}
DELETE /logs/{logId}
GET /patients/{patientId}/logs/search?query=
POST /logs/{logId}/attachments
DELETE /logs/{logId}/attachments/{attachmentId}
GET /logs/{logId}/attachments
GET /patients/{patientId}/logs/stats?period=
GET /patients/{patientId}/logs/trends?type=&period=
POST /patients/{patientId}/logs/bulk
GET /patients/{patientId}/logs/recent?limit=
GET /patients/{patientId}/logs/export?format=
```

## 6. Appointments & Calendar

### Database Schema
```sql
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  provider_name TEXT,
  location TEXT,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  status TEXT DEFAULT 'scheduled',
  is_recurring BOOLEAN DEFAULT false,
  recurrence_rule TEXT,
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE appointment_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES appointments(id),
  reminder_time TIMESTAMP NOT NULL,
  type TEXT DEFAULT 'push',
  sent BOOLEAN DEFAULT false
);
```

### API Endpoints
```
GET /appointments?filters=
GET /appointments/{appointmentId}
POST /appointments
PUT /appointments/{appointmentId}
DELETE /appointments/{appointmentId}
GET /appointments/calendar?start=&end=&patientId=
GET /appointments/upcoming?days=&patientId=
GET /appointments/search?query=
POST /appointments/check-conflicts
GET /appointments/{appointmentId}/reminders
POST /appointments/{appointmentId}/reminders
DELETE /appointments/{appointmentId}/reminders/{reminderId}
PATCH /appointments/{appointmentId}/complete
PATCH /appointments/{appointmentId}/missed
PATCH /appointments/{appointmentId}/reschedule
GET /appointments/{appointmentId}/instances
PUT /appointments/{appointmentId}/recurring
DELETE /appointments/{appointmentId}/recurring
GET /appointments/stats?patientId=&period=
GET /appointments/export?format=
GET /appointments/available-slots?providerId=&date=
POST /appointments/{appointmentId}/invite
```

## 7. File Management & Attachments

### Database Schema
```sql
CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  uploaded_by UUID REFERENCES profiles(id),
  uploaded_at TIMESTAMP DEFAULT NOW()
);
```

### API Endpoints
```
POST /files/upload
GET /files/{fileId}
GET /files/{fileId}/download
GET /files/{fileId}/url?expires=
DELETE /files/{fileId}
GET /files/{fileId}/metadata
PUT /files/{fileId}/metadata
GET /files/{fileId}/sharing
POST /files/{fileId}/share
GET /files/storage/usage
POST /patients/{patientId}/files
```

## 8. Notifications & Push Messages

### Database Schema
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT false,
  sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  device_token TEXT NOT NULL,
  device_type TEXT NOT NULL,
  device_info JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  registered_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  push_notifications BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT false,
  medication_reminders BOOLEAN DEFAULT true,
  appointment_reminders BOOLEAN DEFAULT true,
  caregiver_updates BOOLEAN DEFAULT true,
  reminder_minutes INTEGER[] DEFAULT '{15,30,60}'
);
```

### API Endpoints
```
GET /notifications?filters=
GET /notifications/{notificationId}
POST /notifications
PUT /notifications/{notificationId}/read
PUT /notifications/mark-all-read
DELETE /notifications/{notificationId}
POST /notifications/bulk-delete
GET /users/{userId}/notification-preferences
PUT /users/{userId}/notification-preferences
POST /notifications/subscribe
POST /notifications/unsubscribe
POST /notifications/send
POST /notifications/send-bulk
POST /notifications/schedule
DELETE /notifications/scheduled/{notificationId}
GET /notifications/unread-count
POST /notifications/test
```

### Firebase Cloud Functions
```javascript
// Medication reminder scheduler
exports.scheduleMedicationReminders = functions.firestore
  .document('doses/{doseId}')
  .onCreate(async (snap, context) => {
    // Schedule push notification
  });

// Real-time dose tracking
exports.onDoseMarked = functions.firestore
  .document('doses/{doseId}')
  .onUpdate(async (change, context) => {
    // Notify caregivers
  });
```

## 9. Caregiver Management

### Database Schema
```sql
CREATE TABLE caregiver_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invited_by UUID REFERENCES profiles(id),
  email TEXT NOT NULL,
  patient_id UUID REFERENCES patients(id),
  role TEXT NOT NULL,
  permissions JSONB DEFAULT '{}',
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  accepted_at TIMESTAMP,
  declined_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### API Endpoints
```
GET /caregivers
GET /caregivers/{caregiverId}
PUT /caregivers/{caregiverId}
DELETE /caregivers/{caregiverId}
POST /caregivers/invite
POST /caregivers/accept-invitation
POST /caregivers/decline-invitation
GET /caregivers/pending-invitations
GET /caregivers/received-invitations
DELETE /caregivers/invitations/{invitationId}
POST /caregivers/invitations/{invitationId}/resend
GET /caregivers/{caregiverId}/permissions?patientId=
PUT /caregivers/{caregiverId}/permissions
GET /caregivers/{caregiverId}/activity?patientId=&limit=
GET /caregivers/{caregiverId}/patients
POST /patients/{patientId}/share
DELETE /patients/{patientId}/caregivers/{caregiverId}
GET /caregivers/{caregiverId}/notification-preferences
PUT /caregivers/{caregiverId}/notification-preferences
POST /caregivers/{caregiverId}/messages
GET /caregivers/{caregiverId}/messages?limit=
GET /patients/{patientId}/care-team
POST /patients/{patientId}/care-team
DELETE /patients/{patientId}/care-team/{caregiverId}
GET /caregivers/{caregiverId}/schedule?patientId=
PUT /caregivers/{caregiverId}/schedule
GET /caregivers/{caregiverId}/stats?period=
```

## 10. Dashboard & Analytics

### API Endpoints
```
GET /dashboard/stats?patientId=
GET /dashboard/recent-activity?patientId=&limit=
GET /dashboard/medication-overview?patientId=
GET /dashboard/alerts?patientId=
GET /dashboard/quick-stats?patientId=
GET /dashboard/adherence-trends?patientId=&period=
GET /dashboard/upcoming-events?patientId=&days=
GET /dashboard/health-metrics?patientId=&period=
GET /dashboard/care-team-activity?patientId=&limit=
GET /dashboard/critical-alerts?patientId=
```

## 11. Sync & Real-time Features

### Supabase Real-time Configuration
```sql
-- Enable real-time for critical tables
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE doses ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE measurements ENABLE ROW LEVEL SECURITY;
```

### API Endpoints
```
GET /sync/patient-data/{patientId}?lastSync=
GET /sync/user-data?lastSync=
POST /sync/bulk-update
GET /sync/status
POST /sync/force-full
GET /sync/pending
PATCH /sync/operations/{operationId}/complete
GET /sync/conflicts
POST /sync/conflicts/{conflictId}/resolve
POST /sync/devices
DELETE /sync/devices/{deviceId}
GET /sync/devices/{deviceId}/history?limit=
```

### Device Management
```
POST /devices/register
PUT /devices/{deviceId}/token
DELETE /devices/{deviceId}
GET /devices/{deviceId}
GET /devices
PUT /devices/{deviceId}/settings
```

## 12. Row Level Security (RLS) Policies

```sql
-- Patients: Users can only access patients they're caregivers for
CREATE POLICY "Users can view their patients" ON patients
FOR SELECT USING (
  id IN (
    SELECT patient_id FROM patient_caregivers 
    WHERE caregiver_id = auth.uid()
  )
);

-- Medications: Same patient access rules
CREATE POLICY "Users can view patient medications" ON medications
FOR SELECT USING (
  patient_id IN (
    SELECT patient_id FROM patient_caregivers 
    WHERE caregiver_id = auth.uid()
  )
);

-- Similar policies for doses, measurements, daily_logs, appointments
```

## 13. Mobile App Compatibility

### React Native Specific Endpoints
```
POST /mobile/register-device
POST /mobile/sync-offline-data
GET /mobile/app-config
POST /mobile/crash-report
GET /mobile/feature-flags
```

### Native Features Support
- Biometric authentication
- Camera integration for attachments
- Local database sync
- Background task scheduling
- Push notification handling

## 14. Security & Compliance

### HIPAA Compliance Requirements
- End-to-end encryption for PHI
- Audit logging for all data access
- Secure file storage with expiring URLs
- Data retention policies
- User consent management

### Additional Security Endpoints
```
POST /audit/log-access
GET /audit/user-activity?userId=
POST /compliance/consent
GET /compliance/data-export?userId=
POST /compliance/data-deletion?userId=
```

## 15. Testing & Development

### Mock Data Endpoints (Development)
```
POST /dev/seed-data
POST /dev/generate-test-notifications
GET /dev/health-check
POST /dev/simulate-dose-reminder
```

## Implementation Priority

### Phase 1 (MVP)
1. Authentication & User Management
2. Patient Management (basic)
3. Medication & Dose Tracking
4. Basic Notifications
5. File Upload (measurements)

### Phase 2 (Core Features)
1. Daily Logs with Attachments
2. Appointments & Calendar
3. Caregiver Management
4. Dashboard & Analytics
5. Real-time Updates

### Phase 3 (Advanced)
1. Sync & Offline Support
2. Mobile App Features
3. Advanced Analytics
4. Compliance Features
5. Third-party Integrations

This comprehensive API specification ensures full mobile compatibility and provides a scalable foundation for the MedTrack application using Supabase and Firebase. 