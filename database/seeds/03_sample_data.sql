-- Sample Data for MedTrack Application
-- Version: 03 - Sample Data for Testing

-- Set search path to use api schema
SET search_path TO api, public;

-- NOTE: This sample data assumes you have at least one user registered
-- The user ID should be replaced with actual user IDs from auth.users table

-- Sample patient data
-- Replace 'user-uuid-here' with actual user UUID from your auth.users table
INSERT INTO api.patients (id, name, date_of_birth, gender, medical_record_number, emergency_contact, created_by) VALUES
(
  'patient-1-uuid',
  'Emma Johnson',
  '2018-03-15',
  'female',
  'MRN-001',
  '{
    "name": "Sarah Johnson",
    "relationship": "Mother",
    "phone": "+1-555-123-4567",
    "email": "sarah.johnson@email.com"
  }',
  'user-uuid-here'
),
(
  'patient-2-uuid',
  'Michael Chen',
  '2020-07-22',
  'male',
  'MRN-002',
  '{
    "name": "Lisa Chen",
    "relationship": "Mother",
    "phone": "+1-555-987-6543",
    "email": "lisa.chen@email.com"
  }',
  'user-uuid-here'
);

-- Sample patient-caregiver relationships
-- User becomes primary caregiver for their patients
INSERT INTO api.patient_caregivers (patient_id, caregiver_id, role, accepted_at, is_active) VALUES
('patient-1-uuid', 'user-uuid-here', 'primary', NOW(), true),
('patient-2-uuid', 'user-uuid-here', 'primary', NOW(), true);

-- Sample medications for Emma Johnson
INSERT INTO api.medications (id, patient_id, name, dosage, frequency, instructions, start_date, is_active, created_by) VALUES
(
  'med-1-uuid',
  'patient-1-uuid',
  'Amoxicillin',
  '250mg',
  'twice_daily',
  'Take with food. Complete full course even if feeling better.',
  '2024-01-15',
  true,
  'user-uuid-here'
),
(
  'med-2-uuid',
  'patient-1-uuid',
  'Children''s Tylenol',
  '80mg',
  'as_needed',
  'For fever or pain. Do not exceed 5 doses in 24 hours.',
  '2024-01-10',
  true,
  'user-uuid-here'
),
(
  'med-3-uuid',
  'patient-1-uuid',
  'Daily Vitamin',
  '1 chewable tablet',
  'daily',
  'Take with breakfast.',
  '2024-01-01',
  true,
  'user-uuid-here'
);

-- Sample medications for Michael Chen
INSERT INTO api.medications (id, patient_id, name, dosage, frequency, instructions, start_date, is_active, created_by) VALUES
(
  'med-4-uuid',
  'patient-2-uuid',
  'Albuterol Inhaler',
  '2 puffs',
  'as_needed',
  'For breathing difficulties. Shake well before use.',
  '2024-01-20',
  true,
  'user-uuid-here'
);

-- Sample doses for today and recent days
INSERT INTO api.doses (id, medication_id, scheduled_time, status, taken_at, marked_by) VALUES
-- Emma's Amoxicillin doses (past 3 days)
('dose-1-uuid', 'med-1-uuid', NOW() - INTERVAL '2 days' + INTERVAL '8 hours', 'taken', NOW() - INTERVAL '2 days' + INTERVAL '8 hours', 'user-uuid-here'),
('dose-2-uuid', 'med-1-uuid', NOW() - INTERVAL '2 days' + INTERVAL '20 hours', 'taken', NOW() - INTERVAL '2 days' + INTERVAL '20 hours', 'user-uuid-here'),
('dose-3-uuid', 'med-1-uuid', NOW() - INTERVAL '1 day' + INTERVAL '8 hours', 'taken', NOW() - INTERVAL '1 day' + INTERVAL '8 hours', 'user-uuid-here'),
('dose-4-uuid', 'med-1-uuid', NOW() - INTERVAL '1 day' + INTERVAL '20 hours', 'missed', NULL, NULL),
('dose-5-uuid', 'med-1-uuid', NOW() - INTERVAL '8 hours', 'taken', NOW() - INTERVAL '8 hours', 'user-uuid-here'),
('dose-6-uuid', 'med-1-uuid', NOW() + INTERVAL '4 hours', 'pending', NULL, NULL),

-- Emma's Vitamin doses
('dose-7-uuid', 'med-3-uuid', NOW() - INTERVAL '2 days' + INTERVAL '9 hours', 'taken', NOW() - INTERVAL '2 days' + INTERVAL '9 hours', 'user-uuid-here'),
('dose-8-uuid', 'med-3-uuid', NOW() - INTERVAL '1 day' + INTERVAL '9 hours', 'taken', NOW() - INTERVAL '1 day' + INTERVAL '9 hours', 'user-uuid-here'),
('dose-9-uuid', 'med-3-uuid', NOW() - INTERVAL '9 hours', 'taken', NOW() - INTERVAL '9 hours', 'user-uuid-here'),
('dose-10-uuid', 'med-3-uuid', NOW() + INTERVAL '15 hours', 'pending', NULL, NULL);

-- Sample measurements for Emma
INSERT INTO api.measurements (id, patient_id, type, value, unit, notes, recorded_at, recorded_by) VALUES
('measurement-1-uuid', 'patient-1-uuid', 'temperature', 98.6, '°F', 'Normal temperature, feeling well', NOW() - INTERVAL '2 hours', 'user-uuid-here'),
('measurement-2-uuid', 'patient-1-uuid', 'weight', 32.5, 'lbs', 'Weekly weigh-in', NOW() - INTERVAL '1 day', 'user-uuid-here'),
('measurement-3-uuid', 'patient-1-uuid', 'height', 38.5, 'inches', 'Growth check', NOW() - INTERVAL '1 week', 'user-uuid-here'),
('measurement-4-uuid', 'patient-1-uuid', 'temperature', 100.2, '°F', 'Slight fever, gave Tylenol', NOW() - INTERVAL '3 days', 'user-uuid-here');

-- Sample measurements for Michael
INSERT INTO api.measurements (id, patient_id, type, value, unit, notes, recorded_at, recorded_by) VALUES
('measurement-5-uuid', 'patient-2-uuid', 'weight', 28.2, 'lbs', 'Monthly check', NOW() - INTERVAL '1 day', 'user-uuid-here'),
('measurement-6-uuid', 'patient-2-uuid', 'height', 34.0, 'inches', 'Growth measurement', NOW() - INTERVAL '1 week', 'user-uuid-here');

-- Sample daily logs for Emma
INSERT INTO api.daily_logs (id, patient_id, title, description, type, severity, tags, follow_up_required, timestamp, recorded_by) VALUES
(
  'log-1-uuid',
  'patient-1-uuid',
  'Completed antibiotic course',
  'Emma finished her 10-day course of Amoxicillin. No adverse reactions observed. Appetite has returned to normal.',
  'medication',
  'normal',
  ARRAY['antibiotic', 'completion', 'recovery'],
  false,
  NOW() - INTERVAL '1 hour',
  'user-uuid-here'
),
(
  'log-2-uuid',
  'patient-1-uuid',
  'Mild fever episode',
  'Emma developed a low-grade fever of 100.2°F around 3 PM. Gave Children''s Tylenol as prescribed. Fever reduced to 99.1°F after 1 hour. She remained active and ate dinner normally.',
  'symptom',
  'moderate',
  ARRAY['fever', 'tylenol', 'resolved'],
  false,
  NOW() - INTERVAL '3 days',
  'user-uuid-here'
),
(
  'log-3-uuid',
  'patient-1-uuid',
  'Good appetite and energy',
  'Emma had a great day today. Ate all her meals, played actively, and took her vitamin without any fuss. Sleeping well.',
  'general',
  'normal',
  ARRAY['appetite', 'energy', 'positive'],
  false,
  NOW() - INTERVAL '1 day',
  'user-uuid-here'
);

-- Sample daily logs for Michael
INSERT INTO api.daily_logs (id, patient_id, title, description, type, severity, tags, follow_up_required, timestamp, recorded_by) VALUES
(
  'log-4-uuid',
  'patient-2-uuid',
  'Minor breathing difficulty',
  'Michael had some wheezing after playing outside. Used albuterol inhaler as prescribed. Breathing returned to normal within 15 minutes. Will monitor for any recurrence.',
  'respiratory',
  'moderate',
  ARRAY['wheezing', 'inhaler', 'outdoor', 'resolved'],
  true,
  NOW() - INTERVAL '2 days',
  'user-uuid-here'
);

-- Sample notifications
INSERT INTO api.notifications (id, user_id, type, title, message, data, read, created_at) VALUES
(
  'notification-1-uuid',
  'user-uuid-here',
  'medication_reminder',
  'Medication Reminder',
  'Time to give Emma her Amoxicillin (evening dose)',
  '{"patient_id": "patient-1-uuid", "medication_id": "med-1-uuid", "dose_id": "dose-6-uuid"}',
  false,
  NOW() + INTERVAL '4 hours'
),
(
  'notification-2-uuid',
  'user-uuid-here',
  'dose_marked',
  'Dose Recorded',
  'Emma''s morning vitamin has been marked as taken',
  '{"patient_id": "patient-1-uuid", "medication_id": "med-3-uuid", "dose_id": "dose-9-uuid"}',
  true,
  NOW() - INTERVAL '9 hours'
);

-- Sample notification preferences (will be created automatically by trigger)
-- This is just for reference - the trigger handles this automatically

/*
NOTES FOR IMPLEMENTATION:

1. Replace all 'user-uuid-here' with actual user UUID from auth.users
2. Replace all other UUIDs with actual generated UUIDs
3. Adjust timestamps as needed for testing
4. This data provides:
   - 2 patients with realistic medical information
   - Multiple medications with different frequencies
   - Realistic dose tracking with mixed statuses
   - Health measurements over time
   - Daily logs with various types and severities
   - Notifications for testing the system

5. To insert this data safely:
   - First create a test user account through your app
   - Get the user UUID from auth.users table
   - Replace 'user-uuid-here' with the actual UUID
   - Generate new UUIDs for all other records
   - Run the SQL

6. This gives you a realistic dataset to test all features:
   - Medication tracking and adherence
   - Health measurements with attachments
   - Daily logs with different types
   - Notification system
   - Patient management
*/ 