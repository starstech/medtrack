-- Simple test data for MedTrack application
-- This creates sample data that can be used once real users sign up

-- Set search path
SET search_path TO api, public;

-- Create sample patients (these will be orphaned until real users sign up and claim them)
-- In a real scenario, these would be created by authenticated users

-- For demonstration purposes, let's create some sample data structure
-- that shows what the data would look like

-- Create a temporary table to show the expected data structure
CREATE TEMP TABLE sample_data_structure AS
SELECT 
  'Patient Management' as category,
  'John Smith, Alice Johnson, Robert Davis' as sample_patients,
  'Blood pressure, glucose, weight measurements' as sample_measurements,
  'Lisinopril, Metformin, Atorvastatin' as sample_medications,
  'Daily logs with observations and symptoms' as sample_logs;

-- The measurement_preferences table uses a different structure with JSONB
-- Default presets are already created in the measurement_preferences migration
-- No additional setup needed here

-- Create a function to generate sample data for a user
CREATE OR REPLACE FUNCTION api.create_sample_data_for_user(user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  patient_id_1 UUID := gen_random_uuid();
  patient_id_2 UUID := gen_random_uuid();
  medication_id_1 UUID := gen_random_uuid();
  medication_id_2 UUID := gen_random_uuid();
BEGIN
  -- Insert sample patients
  INSERT INTO api.patients (id, name, date_of_birth, gender, medical_record_number, emergency_contact, created_by)
  VALUES 
  (
    patient_id_1,
    'John Smith',
    '1945-03-15',
    'male',
    'MRN001',
    '{"name": "Mary Smith", "phone": "+1-555-0101", "relationship": "spouse"}'::jsonb,
    user_id
  ),
  (
    patient_id_2,
    'Alice Johnson',
    '1960-07-22',
    'female',
    'MRN002',
    '{"name": "Bob Johnson", "phone": "+1-555-0102", "relationship": "son"}'::jsonb,
    user_id
  );

  -- Insert sample medications
  INSERT INTO api.medications (id, patient_id, name, dosage, frequency, instructions, start_date, is_active, created_by)
  VALUES 
  (
    medication_id_1,
    patient_id_1,
    'Lisinopril',
    '10mg',
    'Once daily',
    'Take with food in the morning',
    CURRENT_DATE - INTERVAL '30 days',
    true,
    user_id
  ),
  (
    medication_id_2,
    patient_id_2,
    'Atorvastatin',
    '20mg',
    'Once daily',
    'Take in the evening',
    CURRENT_DATE - INTERVAL '60 days',
    true,
    user_id
  );

  -- Insert sample measurements
  INSERT INTO api.measurements (patient_id, type, value, unit, notes, recorded_at, recorded_by)
  VALUES 
  (patient_id_1, 'blood_pressure_systolic', 130, 'mmHg', 'Morning reading', NOW() - INTERVAL '1 day', user_id),
  (patient_id_1, 'blood_pressure_diastolic', 85, 'mmHg', 'Morning reading', NOW() - INTERVAL '1 day', user_id),
  (patient_id_1, 'blood_glucose', 110, 'mg/dL', 'Fasting glucose', NOW() - INTERVAL '2 days', user_id),
  (patient_id_2, 'weight', 68.5, 'kg', 'Weekly weigh-in', NOW() - INTERVAL '3 days', user_id),
  (patient_id_2, 'cholesterol_total', 180, 'mg/dL', 'Lab result', NOW() - INTERVAL '1 week', user_id);

  -- Insert sample daily logs
  INSERT INTO api.daily_logs (patient_id, title, description, type, severity, tags, timestamp, recorded_by)
  VALUES 
  (patient_id_1, 'Morning routine completed', 'Patient completed morning medication and breakfast without issues', 'observation', 'normal', ARRAY['routine', 'medication'], NOW() - INTERVAL '1 day', user_id),
  (patient_id_1, 'Blood pressure check', 'Regular morning blood pressure monitoring', 'observation', 'normal', ARRAY['vital_signs', 'blood_pressure'], NOW() - INTERVAL '1 day', user_id),
  (patient_id_2, 'Exercise session', 'Completed 30-minute walk in the park', 'activity', 'normal', ARRAY['exercise', 'walking'], NOW() - INTERVAL '3 hours', user_id);

  -- Insert sample doses
  INSERT INTO api.doses (medication_id, scheduled_time, status, taken_at, notes, marked_by)
  VALUES 
  (medication_id_1, NOW() - INTERVAL '1 day', 'taken', NOW() - INTERVAL '1 day', 'Taken with breakfast', user_id),
  (medication_id_1, NOW(), 'pending', NULL, NULL, NULL),
  (medication_id_1, NOW() + INTERVAL '1 day', 'pending', NULL, NULL, NULL),
  (medication_id_2, NOW() - INTERVAL '1 day', 'taken', NOW() - INTERVAL '1 day', 'Taken after dinner', user_id),
  (medication_id_2, NOW(), 'pending', NULL, NULL, NULL);

  -- Apply default measurement preferences for the patients
  -- Use the built-in function to create preferences for each patient
  PERFORM api.get_or_create_measurement_preferences(patient_id_1, user_id);
  PERFORM api.get_or_create_measurement_preferences(patient_id_2, user_id);

END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION api.create_sample_data_for_user(UUID) TO authenticated;

-- Create a comment explaining how to use this
COMMENT ON FUNCTION api.create_sample_data_for_user(UUID) IS 
'Creates sample data for a user. Call this function after a user signs up to populate their account with demo data. Usage: SELECT api.create_sample_data_for_user(auth.uid());'; 