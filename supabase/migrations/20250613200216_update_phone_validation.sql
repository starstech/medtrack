-- Update phone validation for international support
-- This migration improves phone number validation to support international formats

-- Set search path to use api schema
SET search_path TO api, public;

-- Update the phone validation function to be more flexible
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

-- Update emergency contact validation to be more flexible
-- Make emergency contact completely optional
ALTER TABLE api.patients 
  DROP CONSTRAINT IF EXISTS valid_emergency_contact_phone;

ALTER TABLE api.patients
  ADD CONSTRAINT valid_emergency_contact_phone
  CHECK (
    emergency_contact IS NULL OR
    emergency_contact->>'phone' IS NULL OR
    emergency_contact->>'phone' = '' OR
    api.is_valid_phone(emergency_contact->>'phone')
  );

-- Update emergency contact email validation to be more flexible
ALTER TABLE api.patients 
  DROP CONSTRAINT IF EXISTS valid_emergency_contact_email;

ALTER TABLE api.patients
  ADD CONSTRAINT valid_emergency_contact_email
  CHECK (
    emergency_contact IS NULL OR
    emergency_contact->>'email' IS NULL OR
    emergency_contact->>'email' = '' OR
    api.is_valid_email(emergency_contact->>'email')
  );

-- Add a function to format phone numbers for display
CREATE OR REPLACE FUNCTION api.format_phone_display(phone TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Simple formatting for display purposes
  -- Remove all non-digit characters except +
  IF phone IS NULL OR phone = '' THEN
    RETURN NULL;
  END IF;
  
  -- If it starts with +, keep the +
  IF phone ~ '^\+' THEN
    RETURN '+' || REGEXP_REPLACE(SUBSTRING(phone FROM 2), '[^\d]', '', 'g');
  ELSE
    RETURN REGEXP_REPLACE(phone, '[^\d]', '', 'g');
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add a comment explaining the phone validation
COMMENT ON FUNCTION api.is_valid_phone(TEXT) IS 
'Validates international phone numbers. Accepts formats like +1-555-123-4567, (555) 123-4567, +44 20 7946 0958, etc. Requires 7-15 digits total.';

COMMENT ON FUNCTION api.format_phone_display(TEXT) IS 
'Formats phone numbers for consistent display by removing formatting characters except country code prefix.';

-- Update the data quality check function to handle optional emergency contacts better
CREATE OR REPLACE FUNCTION api.check_data_quality()
RETURNS TABLE(
  issue_type TEXT,
  table_name TEXT,
  record_id UUID,
  description TEXT,
  severity TEXT
) AS $$
BEGIN
  -- Check for patients without emergency contacts (now just a warning, not an error)
  RETURN QUERY
  SELECT 
    'missing_emergency_contact'::TEXT,
    'patients'::TEXT,
    p.id,
    'Patient has no emergency contact information - consider adding for safety'::TEXT,
    'low'::TEXT  -- Changed from 'medium' to 'low' since it's now optional
  FROM api.patients p
  WHERE p.emergency_contact IS NULL 
    OR (p.emergency_contact->>'name' IS NULL AND p.emergency_contact->>'phone' IS NULL);
  
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
  WHERE dl.requires_followup = true
    AND dl.timestamp < NOW() - INTERVAL '7 days'
    AND NOT EXISTS (
      SELECT 1 FROM api.daily_logs dl2 
      WHERE dl2.patient_id = dl.patient_id 
        AND dl2.timestamp > dl.timestamp
        AND dl2.notes ILIKE '%follow%up%'
    );
END;
$$ LANGUAGE plpgsql;
