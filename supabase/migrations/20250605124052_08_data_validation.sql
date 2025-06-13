-- Data Validation and Constraints for MedTrack
-- Version: 09 - Comprehensive Validation System

-- Set search path to use api schema
SET search_path TO api, public;

-- =============================================
-- VALIDATION CONSTRAINT FUNCTIONS
-- =============================================

-- Function to validate email format
CREATE OR REPLACE FUNCTION api.is_valid_email(email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to validate phone number format
CREATE OR REPLACE FUNCTION api.is_valid_phone(phone TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- More flexible international phone number validation
  -- Supports various formats: +1-555-123-4567, (555) 123-4567, 555.123.4567, +44 20 7946 0958, etc.
  -- Minimum 7 digits, maximum 15 digits (E.164 standard)
  RETURN phone ~* '^\+?[\d\s\-\(\)\.]{7,20}$' 
    AND LENGTH(REGEXP_REPLACE(phone, '[^\d]', '', 'g')) BETWEEN 7 AND 15;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to validate medical record number format
CREATE OR REPLACE FUNCTION api.is_valid_mrn(mrn TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- MRN should be 6-20 alphanumeric characters
  RETURN mrn ~* '^[A-Z0-9]{6,20}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to validate medication dosage format
CREATE OR REPLACE FUNCTION api.is_valid_dosage(dosage TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Supports formats like: 250mg, 1 tablet, 2.5ml, 1/2 teaspoon
  RETURN dosage ~* '^[0-9]+(\.[0-9]+)?(/[0-9]+)?\s*(mg|g|ml|l|tablet|capsule|teaspoon|tablespoon|unit|puff|drop)s?$'
    OR dosage ~* '^[0-9]+(\.[0-9]+)?(/[0-9]+)?\s*(mg|g|ml|l|tablet|capsule|teaspoon|tablespoon|unit|puff|drop)s?\s+.*$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to validate age appropriateness
CREATE OR REPLACE FUNCTION api.is_valid_age_for_medication(birth_date DATE, medication_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  age_years INTEGER;
BEGIN
  age_years := EXTRACT(YEAR FROM AGE(birth_date));
  
  -- Basic age validation rules (can be expanded)
  CASE
    -- Pediatric medications
    WHEN medication_name ILIKE '%children%' OR medication_name ILIKE '%pediatric%' THEN
      RETURN age_years <= 18;
    -- Adult medications  
    WHEN medication_name ILIKE '%adult%' THEN
      RETURN age_years >= 18;
    -- Aspirin restrictions for children
    WHEN medication_name ILIKE '%aspirin%' THEN
      RETURN age_years >= 16;
    ELSE
      RETURN TRUE; -- Default to allowing if no specific rules
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to validate measurement values within normal ranges
CREATE OR REPLACE FUNCTION api.is_valid_measurement_value(
  measurement_type TEXT,
  value NUMERIC,
  unit TEXT,
  patient_age_years INTEGER
)
RETURNS BOOLEAN AS $$
BEGIN
  CASE measurement_type
    WHEN 'temperature' THEN
      CASE unit
        WHEN '°F' THEN RETURN value BETWEEN 90.0 AND 115.0;
        WHEN '°C' THEN RETURN value BETWEEN 32.0 AND 46.0;
        ELSE RETURN FALSE;
      END CASE;
      
    WHEN 'weight' THEN
      CASE unit
        WHEN 'lbs' THEN 
          IF patient_age_years < 1 THEN RETURN value BETWEEN 4.0 AND 25.0;
          ELSIF patient_age_years < 18 THEN RETURN value BETWEEN 15.0 AND 300.0;
          ELSE RETURN value BETWEEN 50.0 AND 1000.0;
          END IF;
        WHEN 'kg' THEN 
          IF patient_age_years < 1 THEN RETURN value BETWEEN 2.0 AND 12.0;
          ELSIF patient_age_years < 18 THEN RETURN value BETWEEN 7.0 AND 140.0;
          ELSE RETURN value BETWEEN 25.0 AND 450.0;
          END IF;
        ELSE RETURN FALSE;
      END CASE;
      
    WHEN 'height' THEN
      CASE unit
        WHEN 'inches' THEN 
          IF patient_age_years < 1 THEN RETURN value BETWEEN 15.0 AND 35.0;
          ELSIF patient_age_years < 18 THEN RETURN value BETWEEN 20.0 AND 80.0;
          ELSE RETURN value BETWEEN 48.0 AND 96.0;
          END IF;
        WHEN 'cm' THEN 
          IF patient_age_years < 1 THEN RETURN value BETWEEN 40.0 AND 90.0;
          ELSIF patient_age_years < 18 THEN RETURN value BETWEEN 50.0 AND 200.0;
          ELSE RETURN value BETWEEN 120.0 AND 250.0;
          END IF;
        ELSE RETURN FALSE;
      END CASE;
      
    WHEN 'blood_pressure_systolic' THEN
      RETURN value BETWEEN 60.0 AND 250.0;
      
    WHEN 'blood_pressure_diastolic' THEN
      RETURN value BETWEEN 30.0 AND 150.0;
      
    WHEN 'heart_rate' THEN
      IF patient_age_years < 1 THEN RETURN value BETWEEN 80.0 AND 180.0;
      ELSIF patient_age_years < 18 THEN RETURN value BETWEEN 60.0 AND 150.0;
      ELSE RETURN value BETWEEN 40.0 AND 120.0;
      END IF;
      
    WHEN 'blood_glucose' THEN
      CASE unit
        WHEN 'mg/dL' THEN RETURN value BETWEEN 50.0 AND 500.0;
        WHEN 'mmol/L' THEN RETURN value BETWEEN 3.0 AND 28.0;
        ELSE RETURN FALSE;
      END CASE;
      
    WHEN 'oxygen_saturation' THEN
      RETURN value BETWEEN 70.0 AND 100.0;
      
    ELSE
      RETURN TRUE; -- Allow custom measurements without validation
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =============================================
-- TABLE CONSTRAINT ADDITIONS
-- =============================================

-- Add validation constraints to existing tables

-- Profiles table constraints
ALTER TABLE api.profiles 
  ADD CONSTRAINT valid_email_format 
  CHECK (api.is_valid_email(email));

-- Patients table constraints
ALTER TABLE api.patients
  ADD CONSTRAINT valid_birth_date 
  CHECK (date_of_birth <= CURRENT_DATE AND date_of_birth >= '1900-01-01');

ALTER TABLE api.patients
  ADD CONSTRAINT valid_mrn_format 
  CHECK (medical_record_number IS NULL OR api.is_valid_mrn(medical_record_number));

-- Emergency contact validation
ALTER TABLE api.patients
  ADD CONSTRAINT valid_emergency_contact_phone
  CHECK (
    emergency_contact IS NULL OR
    api.is_valid_phone(emergency_contact->>'phone')
  );

ALTER TABLE api.patients
  ADD CONSTRAINT valid_emergency_contact_email
  CHECK (
    emergency_contact IS NULL OR
    emergency_contact->>'email' IS NULL OR
    api.is_valid_email(emergency_contact->>'email')
  );

-- Medications table constraints
ALTER TABLE api.medications
  ADD CONSTRAINT valid_dosage_format
  CHECK (api.is_valid_dosage(dosage));

ALTER TABLE api.medications
  ADD CONSTRAINT valid_frequency_values
  CHECK (frequency IN ('daily', 'twice_daily', 'three_times_daily', 'four_times_daily', 'as_needed', 'weekly', 'monthly'));

ALTER TABLE api.medications
  ADD CONSTRAINT valid_date_range
  CHECK (end_date IS NULL OR end_date >= start_date);

-- Doses table constraints
ALTER TABLE api.doses
  ADD CONSTRAINT valid_taken_at_timing
  CHECK (taken_at IS NULL OR taken_at <= NOW() + INTERVAL '1 hour'); -- Allow small future buffer for time zones

-- Measurements table constraints  
ALTER TABLE api.measurements
  ADD CONSTRAINT valid_measurement_timing
  CHECK (recorded_at <= NOW() + INTERVAL '1 hour');

-- Daily logs table constraints
ALTER TABLE api.daily_logs
  ADD CONSTRAINT valid_log_timing
  CHECK (timestamp <= NOW() + INTERVAL '1 hour');

-- =============================================
-- VALIDATION TRIGGER FUNCTIONS
-- =============================================

-- Function to validate medication age appropriateness
CREATE OR REPLACE FUNCTION api.validate_medication_age_appropriateness()
RETURNS TRIGGER AS $$
DECLARE
  patient_birth_date DATE;
BEGIN
  -- Get patient birth date
  SELECT date_of_birth INTO patient_birth_date
  FROM api.patients
  WHERE id = NEW.patient_id;
  
  -- Validate age appropriateness
  IF NOT api.is_valid_age_for_medication(patient_birth_date, NEW.name) THEN
    RAISE EXCEPTION 'Medication "%" may not be appropriate for patient age. Please verify before proceeding.', NEW.name;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for medication age validation
CREATE TRIGGER trigger_validate_medication_age
  BEFORE INSERT OR UPDATE ON api.medications
  FOR EACH ROW
  EXECUTE FUNCTION api.validate_medication_age_appropriateness();

-- Function to validate measurement values
CREATE OR REPLACE FUNCTION api.validate_measurement_values()
RETURNS TRIGGER AS $$
DECLARE
  patient_birth_date DATE;
  patient_age_years INTEGER;
BEGIN
  -- Get patient birth date and calculate age
  SELECT date_of_birth INTO patient_birth_date
  FROM api.patients
  WHERE id = NEW.patient_id;
  
  patient_age_years := EXTRACT(YEAR FROM AGE(patient_birth_date));
  
  -- Validate measurement value
  IF NOT api.is_valid_measurement_value(NEW.type, NEW.value, NEW.unit, patient_age_years) THEN
    RAISE WARNING 'Measurement value % % for % may be outside normal range for age %. Please verify.', 
      NEW.value, NEW.unit, NEW.type, patient_age_years;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for measurement validation (warning only)
CREATE TRIGGER trigger_validate_measurement_values
  BEFORE INSERT OR UPDATE ON api.measurements
  FOR EACH ROW
  EXECUTE FUNCTION api.validate_measurement_values();

-- =============================================
-- DATA CONSISTENCY FUNCTIONS
-- =============================================

-- Function to check for duplicate doses
CREATE OR REPLACE FUNCTION api.prevent_duplicate_doses()
RETURNS TRIGGER AS $$
BEGIN
  -- Check for existing dose within 30 minutes of scheduled time
  IF EXISTS (
    SELECT 1 FROM api.doses
    WHERE medication_id = NEW.medication_id
      AND ABS(EXTRACT(EPOCH FROM (scheduled_time - NEW.scheduled_time))) < 1800 -- 30 minutes
      AND id != COALESCE(NEW.id, gen_random_uuid())
  ) THEN
    RAISE EXCEPTION 'A dose for this medication is already scheduled within 30 minutes of this time';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to prevent duplicate doses
CREATE TRIGGER trigger_prevent_duplicate_doses
  BEFORE INSERT OR UPDATE ON api.doses
  FOR EACH ROW
  EXECUTE FUNCTION api.prevent_duplicate_doses();

-- Function to validate caregiver permissions
CREATE OR REPLACE FUNCTION api.validate_caregiver_permissions()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if user has access to this patient
  IF NOT EXISTS (
    SELECT 1 FROM api.patient_caregivers pc
    WHERE pc.patient_id = NEW.patient_id
      AND pc.caregiver_id = auth.uid()
      AND pc.is_active = true
  ) THEN
    RAISE EXCEPTION 'Access denied: You do not have permission to modify data for this patient';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply caregiver validation to relevant tables
CREATE TRIGGER trigger_validate_medication_access
  BEFORE INSERT OR UPDATE ON api.medications
  FOR EACH ROW
  EXECUTE FUNCTION api.validate_caregiver_permissions();

CREATE TRIGGER trigger_validate_measurement_access
  BEFORE INSERT OR UPDATE ON api.measurements
  FOR EACH ROW
  EXECUTE FUNCTION api.validate_caregiver_permissions();

CREATE TRIGGER trigger_validate_daily_log_access
  BEFORE INSERT OR UPDATE ON api.daily_logs
  FOR EACH ROW
  EXECUTE FUNCTION api.validate_caregiver_permissions();

-- =============================================
-- DATA QUALITY FUNCTIONS
-- =============================================

-- Function to check data quality issues
CREATE OR REPLACE FUNCTION api.check_data_quality()
RETURNS TABLE (
  issue_type TEXT,
  table_name TEXT,
  record_id UUID,
  description TEXT,
  severity TEXT
) AS $$
BEGIN
  -- Check for patients without emergency contacts
  RETURN QUERY
  SELECT 
    'missing_emergency_contact'::TEXT,
    'patients'::TEXT,
    p.id,
    'Patient has no emergency contact information'::TEXT,
    'medium'::TEXT
  FROM api.patients p
  WHERE p.emergency_contact IS NULL;
  
  -- Check for medications without end dates that are very old
  RETURN QUERY
  SELECT 
    'old_open_medication'::TEXT,
    'medications'::TEXT,
    m.id,
    'Medication started over 6 months ago with no end date'::TEXT,
    'medium'::TEXT
  FROM api.medications m
  WHERE m.end_date IS NULL 
    AND m.start_date < CURRENT_DATE - INTERVAL '6 months'
    AND m.is_active = true;
    
  -- Check for very high medication adherence gaps
  RETURN QUERY
  SELECT 
    'poor_adherence'::TEXT,
    'medications'::TEXT,
    m.id,
    'Medication adherence below 50% in last 30 days'::TEXT,
    'high'::TEXT
  FROM api.medications m
  WHERE m.is_active = true
    AND api.calculate_adherence(m.id, 30) < 50.0
    AND EXISTS (
      SELECT 1 FROM api.doses d 
      WHERE d.medication_id = m.id 
        AND d.scheduled_time >= NOW() - INTERVAL '30 days'
    );
    
  -- Check for measurements with suspicious values (flagged by validation)
  RETURN QUERY
  SELECT 
    'suspicious_measurement'::TEXT,
    'measurements'::TEXT,
    ms.id,
    'Measurement value may be outside normal range: ' || ms.value || ' ' || ms.unit::TEXT,
    'medium'::TEXT
  FROM api.measurements ms
  JOIN api.patients p ON ms.patient_id = p.id
  WHERE NOT api.is_valid_measurement_value(
    ms.type, 
    ms.value, 
    ms.unit, 
    EXTRACT(YEAR FROM AGE(p.date_of_birth))::INTEGER
  )
  AND ms.recorded_at >= NOW() - INTERVAL '7 days';
  
  -- Check for daily logs requiring follow-up that are old
  RETURN QUERY
  SELECT 
    'overdue_followup'::TEXT,
    'daily_logs'::TEXT,
    dl.id,
    'Log requires follow-up but is over 7 days old'::TEXT,
    'high'::TEXT
  FROM api.daily_logs dl
  WHERE dl.follow_up_required = true
    AND dl.timestamp < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate data quality report
CREATE OR REPLACE FUNCTION api.generate_data_quality_report(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
  report JSON;
BEGIN
  WITH quality_issues AS (
    SELECT * FROM api.check_data_quality()
    WHERE record_id IN (
      -- Only show issues for patients this user has access to
      SELECT DISTINCT p.id
      FROM api.patients p
      JOIN api.patient_caregivers pc ON p.id = pc.patient_id
      WHERE pc.caregiver_id = user_uuid AND pc.is_active = true
    )
  )
  SELECT json_build_object(
    'summary', json_build_object(
      'total_issues', COUNT(*),
      'high_severity', COUNT(*) FILTER (WHERE severity = 'high'),
      'medium_severity', COUNT(*) FILTER (WHERE severity = 'medium'),
      'low_severity', COUNT(*) FILTER (WHERE severity = 'low')
    ),
    'issues_by_type', json_object_agg(
      issue_type,
      json_build_object(
        'count', type_counts.count,
        'severity', type_counts.severity
      )
    ),
    'recent_issues', json_agg(
      json_build_object(
        'type', issue_type,
        'table', table_name,
        'record_id', record_id,
        'description', description,
        'severity', severity
      )
    )
  ) INTO report
  FROM quality_issues qi
  LEFT JOIN (
    SELECT issue_type, COUNT(*) as count, MAX(severity) as severity
    FROM quality_issues
    GROUP BY issue_type
  ) type_counts ON qi.issue_type = type_counts.issue_type;
  
  RETURN COALESCE(report, '{}'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA api TO authenticated;

/*
DATA VALIDATION OVERVIEW:

This comprehensive validation system includes:

1. **Format Validation**
   - Email format validation
   - Phone number format validation  
   - Medical record number validation
   - Medication dosage format validation

2. **Medical Validation**
   - Age-appropriate medication checking
   - Measurement value range validation
   - Dosage timing validation

3. **Data Consistency**
   - Duplicate dose prevention
   - Caregiver access validation
   - Date range consistency

4. **Data Quality Monitoring**
   - Missing critical information detection
   - Poor adherence identification
   - Suspicious measurement flagging
   - Overdue follow-up tracking

5. **Constraint Enforcement**
   - Database-level constraints for data integrity
   - Trigger-based validation for complex rules
   - Warning system for borderline values

USAGE EXAMPLES:

-- Check if email is valid
SELECT api.is_valid_email('user@example.com');

-- Validate measurement value
SELECT api.is_valid_measurement_value('temperature', 98.6, '°F', 25);

-- Generate data quality report
SELECT api.generate_data_quality_report(auth.uid());

-- Check for data quality issues
SELECT * FROM api.check_data_quality();

MONITORING RECOMMENDATIONS:

1. Run data quality checks weekly
2. Monitor validation trigger performance
3. Review and update validation rules based on medical standards
4. Track validation failure rates for improvement opportunities
*/ 