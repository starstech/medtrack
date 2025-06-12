-- Sample Data for MedTrack Application
-- Version: 03 - Sample Data for Testing
-- DISABLED: This seed data requires real authenticated users
-- Use the api.create_sample_data_for_user() function instead after user signup

-- Set search path to use api schema
SET search_path TO api, public;

-- Seed data is disabled - uncomment below to enable after creating real users

-- NOTE: This sample data assumes you have at least one user registered
-- The user ID should be replaced with actual user IDs from auth.users table

-- Sample patient data
-- Using generated UUIDs for sample data
/*
-- INSERT INTO api.patients (id, name, date_of_birth, gender, medical_record_number, emergency_contact, created_by) VALUES
(
  '11111111-1111-1111-1111-111111111111',
  'Emma Johnson',
  '2018-03-15',
  'female',
  'MRN001',
  '{
    "name": "Sarah Johnson",
    "relationship": "Mother",
    "phone": "+1-555-123-4567",
    "email": "sarah.johnson@email.com"
  }',
  '00000000-0000-0000-0000-000000000000'
),
(
  '22222222-2222-2222-2222-222222222222',
  'Michael Chen',
  '2020-07-22',
  'male',
  'MRN002',
  '{
    "name": "Lisa Chen",
    "relationship": "Mother",
    "phone": "+1-555-987-6543",
    "email": "lisa.chen@email.com"
  }',
  '00000000-0000-0000-0000-000000000000'
);
*/

/*
-- Sample patient-caregiver relationships
-- User becomes primary caregiver for their patients
INSERT INTO api.patient_caregivers (patient_id, caregiver_id, role, accepted_at, is_active) VALUES
('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'primary', NOW(), true),
('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'primary', NOW(), true);

-- Sample medications for Emma Johnson
INSERT INTO api.medications (id, patient_id, name, dosage, frequency, instructions, start_date, is_active, created_by) VALUES
(
  '33333333-3333-3333-3333-333333333333',
  '11111111-1111-1111-1111-111111111111',
  'Amoxicillin',
  '250mg',
  'twice_daily',
  'Take with food. Complete full course even if feeling better.',
  '2024-01-15',
  true,
  '00000000-0000-0000-0000-000000000000'
),
(
  '44444444-4444-4444-4444-444444444444',
  '11111111-1111-1111-1111-111111111111',
  'Children''s Tylenol',
  '80mg',
  'as_needed',
  'For fever or pain. Do not exceed 5 doses in 24 hours.',
  '2024-01-10',
  true,
  '00000000-0000-0000-0000-000000000000'
),
(
  '55555555-5555-5555-5555-555555555555',
  '11111111-1111-1111-1111-111111111111',
  'Daily Vitamin',
  '1 chewable tablet',
  'daily',
  'Take with breakfast.',
  '2024-01-01',
  true,
  '00000000-0000-0000-0000-000000000000'
);

-- Sample medications for Michael Chen
INSERT INTO api.medications (id, patient_id, name, dosage, frequency, instructions, start_date, is_active, created_by) VALUES
(
  '66666666-6666-6666-6666-666666666666',
  '22222222-2222-2222-2222-222222222222',
  'Albuterol Inhaler',
  '2 puffs',
  'as_needed',
  'For breathing difficulties. Shake well before use.',
  '2024-01-20',
  true,
  '00000000-0000-0000-0000-000000000000'
);

-- Sample doses for today and recent days
INSERT INTO api.doses (id, medication_id, scheduled_time, status, taken_at, marked_by) VALUES
-- Emma's Amoxicillin doses (past 3 days)
('77777777-7777-7777-7777-777777777777', '33333333-3333-3333-3333-333333333333', NOW() - INTERVAL '2 days' + INTERVAL '8 hours', 'taken', NOW() - INTERVAL '2 days' + INTERVAL '8 hours', '00000000-0000-0000-0000-000000000000'),
('88888888-8888-8888-8888-888888888888', '33333333-3333-3333-3333-333333333333', NOW() - INTERVAL '2 days' + INTERVAL '20 hours', 'taken', NOW() - INTERVAL '2 days' + INTERVAL '20 hours', '00000000-0000-0000-0000-000000000000'),
('99999999-9999-9999-9999-999999999999', '33333333-3333-3333-3333-333333333333', NOW() - INTERVAL '1 day' + INTERVAL '8 hours', 'taken', NOW() - INTERVAL '1 day' + INTERVAL '8 hours', '00000000-0000-0000-0000-000000000000'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', NOW() - INTERVAL '1 day' + INTERVAL '20 hours', 'missed', NULL, NULL),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '33333333-3333-3333-3333-333333333333', NOW() - INTERVAL '8 hours', 'taken', NOW() - INTERVAL '8 hours', '00000000-0000-0000-0000-000000000000'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', NOW() + INTERVAL '4 hours', 'pending', NULL, NULL),

-- Emma's Vitamin doses
('dddddddd-dddd-dddd-dddd-dddddddddddd', '55555555-5555-5555-5555-555555555555', NOW() - INTERVAL '2 days' + INTERVAL '9 hours', 'taken', NOW() - INTERVAL '2 days' + INTERVAL '9 hours', '00000000-0000-0000-0000-000000000000'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '55555555-5555-5555-5555-555555555555', NOW() - INTERVAL '1 day' + INTERVAL '9 hours', 'taken', NOW() - INTERVAL '1 day' + INTERVAL '9 hours', '00000000-0000-0000-0000-000000000000'),
('ffffffff-ffff-ffff-ffff-ffffffffffff', '55555555-5555-5555-5555-555555555555', NOW() - INTERVAL '9 hours', 'taken', NOW() - INTERVAL '9 hours', '00000000-0000-0000-0000-000000000000'),
('12345678-1234-1234-1234-123456789012', '55555555-5555-5555-5555-555555555555', NOW() + INTERVAL '15 hours', 'pending', NULL, NULL);

-- Sample measurements for Emma
INSERT INTO api.measurements (id, patient_id, type, value, unit, notes, recorded_at, recorded_by) VALUES
('12345678-1234-1234-1234-123456789013', '11111111-1111-1111-1111-111111111111', 'temperature', 98.6, '°F', 'Normal temperature, feeling well', NOW() - INTERVAL '2 hours', '00000000-0000-0000-0000-000000000000'),
('12345678-1234-1234-1234-123456789014', '11111111-1111-1111-1111-111111111111', 'weight', 32.5, 'lbs', 'Weekly weigh-in', NOW() - INTERVAL '1 day', '00000000-0000-0000-0000-000000000000'),
('12345678-1234-1234-1234-123456789015', '11111111-1111-1111-1111-111111111111', 'height', 38.5, 'inches', 'Growth check', NOW() - INTERVAL '1 week', '00000000-0000-0000-0000-000000000000'),
('12345678-1234-1234-1234-123456789016', '11111111-1111-1111-1111-111111111111', 'temperature', 100.2, '°F', 'Slight fever, gave Tylenol', NOW() - INTERVAL '3 days', '00000000-0000-0000-0000-000000000000');

-- Sample measurements for Michael
INSERT INTO api.measurements (id, patient_id, type, value, unit, notes, recorded_at, recorded_by) VALUES
('12345678-1234-1234-1234-123456789017', '22222222-2222-2222-2222-222222222222', 'weight', 28.2, 'lbs', 'Monthly check', NOW() - INTERVAL '1 day', '00000000-0000-0000-0000-000000000000'),
('12345678-1234-1234-1234-123456789018', '22222222-2222-2222-2222-222222222222', 'height', 34.0, 'inches', 'Growth measurement', NOW() - INTERVAL '1 week', '00000000-0000-0000-0000-000000000000');

-- Sample daily logs for Emma
INSERT INTO api.daily_logs (id, patient_id, title, description, type, severity, tags, follow_up_required, timestamp, recorded_by) VALUES
(
  '12345678-1234-1234-1234-123456789019',
  '11111111-1111-1111-1111-111111111111',
  'Completed antibiotic course',
  'Emma finished her 10-day course of Amoxicillin. No adverse reactions observed. Appetite has returned to normal.',
  'medication',
  'normal',
  ARRAY['antibiotic', 'completion', 'recovery'],
  false,
  NOW() - INTERVAL '1 hour',
  '00000000-0000-0000-0000-000000000000'
),
(
  '12345678-1234-1234-1234-123456789020',
  '11111111-1111-1111-1111-111111111111',
  'Mild fever episode',
  'Emma developed a low-grade fever of 100.2°F around 3 PM. Gave Children''s Tylenol as prescribed. Fever reduced to 99.1°F after 1 hour. She remained active and ate dinner normally.',
  'symptom',
  'moderate',
  ARRAY['fever', 'tylenol', 'resolved'],
  false,
  NOW() - INTERVAL '3 days',
  '00000000-0000-0000-0000-000000000000'
),
(
  '12345678-1234-1234-1234-123456789021',
  '11111111-1111-1111-1111-111111111111',
  'Good appetite and energy',
  'Emma had a great day today. Ate all her meals, played actively, and took her vitamin without any fuss. Sleeping well.',
  'general',
  'normal',
  ARRAY['appetite', 'energy', 'positive'],
  false,
  NOW() - INTERVAL '1 day',
  '00000000-0000-0000-0000-000000000000'
);

-- Sample daily logs for Michael
INSERT INTO api.daily_logs (id, patient_id, title, description, type, severity, tags, follow_up_required, timestamp, recorded_by) VALUES
(
  '12345678-1234-1234-1234-123456789022',
  '22222222-2222-2222-2222-222222222222',
  'Minor breathing difficulty',
  'Michael had some wheezing after playing outside. Used albuterol inhaler as prescribed. Breathing returned to normal within 15 minutes. Will monitor for any recurrence.',
  'respiratory',
  'moderate',
  ARRAY['wheezing', 'inhaler', 'outdoor', 'resolved'],
  true,
  NOW() - INTERVAL '2 days',
  '00000000-0000-0000-0000-000000000000'
);

-- Sample notifications
INSERT INTO api.notifications (id, user_id, type, title, message, data, read, created_at) VALUES
(
  '12345678-1234-1234-1234-123456789023',
  '00000000-0000-0000-0000-000000000000',
  'medication_reminder',
  'Medication Reminder',
  'Time to give Emma her Amoxicillin (evening dose)',
  '{"patient_id": "11111111-1111-1111-1111-111111111111", "medication_id": "33333333-3333-3333-3333-333333333333", "dose_id": "cccccccc-cccc-cccc-cccc-cccccccccccc"}',
  false,
  NOW() + INTERVAL '4 hours'
),
(
  '12345678-1234-1234-1234-123456789024',
  '00000000-0000-0000-0000-000000000000',
  'dose_marked',
  'Dose Recorded',
  'Emma''s morning vitamin has been marked as taken',
  '{"patient_id": "11111111-1111-1111-1111-111111111111", "medication_id": "55555555-5555-5555-5555-555555555555", "dose_id": "ffffffff-ffff-ffff-ffff-ffffffffffff"}',
  true,
  NOW() - INTERVAL '9 hours'
);
*/

-- Sample notification preferences (will be created automatically by trigger)
-- This is just for reference - the trigger handles this automatically

/*
NOTES FOR IMPLEMENTATION:

1. Replace all '00000000-0000-0000-0000-000000000000' with actual user UUID from auth.users
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
   - Replace '00000000-0000-0000-0000-000000000000' with the actual UUID
   - Generate new UUIDs for all other records
   - Run the SQL

6. This gives you a realistic dataset to test all features:
   - Medication tracking and adherence
   - Health measurements with attachments
   - Daily logs with different types
   - Notification system
   - Patient management
*/ 