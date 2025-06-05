-- Database Functions for MedTrack
-- Version: 05 - Utility Functions

-- Set search path to use api schema
SET search_path TO api, public;

-- =============================================
-- PATIENT MANAGEMENT FUNCTIONS
-- =============================================

-- Function to get patient summary with stats
CREATE OR REPLACE FUNCTION api.get_patient_summary(patient_uuid UUID)
RETURNS JSON AS $$
DECLARE
  patient_data JSON;
  medication_count INTEGER;
  active_doses_count INTEGER;
  recent_measurements_count INTEGER;
  recent_logs_count INTEGER;
BEGIN
  -- Get basic patient info
  SELECT to_json(p.*) INTO patient_data
  FROM api.patients p
  WHERE p.id = patient_uuid;

  -- Get medication count
  SELECT COUNT(*) INTO medication_count
  FROM api.medications m
  WHERE m.patient_id = patient_uuid AND m.is_active = true;

  -- Get active doses count (pending or overdue)
  SELECT COUNT(*) INTO active_doses_count
  FROM api.doses d
  JOIN api.medications m ON d.medication_id = m.id
  WHERE m.patient_id = patient_uuid 
    AND d.status = 'pending' 
    AND d.scheduled_time <= NOW();

  -- Get recent measurements count (last 7 days)
  SELECT COUNT(*) INTO recent_measurements_count
  FROM api.measurements ms
  WHERE ms.patient_id = patient_uuid 
    AND ms.recorded_at >= NOW() - INTERVAL '7 days';

  -- Get recent logs count (last 7 days)
  SELECT COUNT(*) INTO recent_logs_count
  FROM api.daily_logs dl
  WHERE dl.patient_id = patient_uuid 
    AND dl.timestamp >= NOW() - INTERVAL '7 days';

  -- Return combined JSON
  RETURN json_build_object(
    'patient', patient_data,
    'stats', json_build_object(
      'active_medications', medication_count,
      'pending_doses', active_doses_count,
      'recent_measurements', recent_measurements_count,
      'recent_logs', recent_logs_count
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- MEDICATION ADHERENCE FUNCTIONS
-- =============================================

-- Function to calculate medication adherence percentage
CREATE OR REPLACE FUNCTION api.calculate_adherence(
  med_uuid UUID,
  days_back INTEGER DEFAULT 30
)
RETURNS NUMERIC AS $$
DECLARE
  total_doses INTEGER;
  taken_doses INTEGER;
  adherence_percent NUMERIC;
BEGIN
  -- Get total scheduled doses in the period
  SELECT COUNT(*) INTO total_doses
  FROM api.doses d
  WHERE d.medication_id = med_uuid
    AND d.scheduled_time >= NOW() - (days_back || ' days')::INTERVAL
    AND d.scheduled_time <= NOW();

  -- Get taken doses in the period
  SELECT COUNT(*) INTO taken_doses
  FROM api.doses d
  WHERE d.medication_id = med_uuid
    AND d.status = 'taken'
    AND d.scheduled_time >= NOW() - (days_back || ' days')::INTERVAL
    AND d.scheduled_time <= NOW();

  -- Calculate percentage
  IF total_doses = 0 THEN
    RETURN 0;
  END IF;

  adherence_percent := (taken_doses::NUMERIC / total_doses::NUMERIC) * 100;
  RETURN ROUND(adherence_percent, 2);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get medication adherence summary
CREATE OR REPLACE FUNCTION api.get_adherence_summary(
  patient_uuid UUID,
  days_back INTEGER DEFAULT 30
)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_agg(
    json_build_object(
      'medication_id', m.id,
      'medication_name', m.name,
      'adherence_percent', api.calculate_adherence(m.id, days_back),
      'total_doses', (
        SELECT COUNT(*) 
        FROM api.doses d 
        WHERE d.medication_id = m.id 
          AND d.scheduled_time >= NOW() - (days_back || ' days')::INTERVAL
          AND d.scheduled_time <= NOW()
      ),
      'taken_doses', (
        SELECT COUNT(*) 
        FROM api.doses d 
        WHERE d.medication_id = m.id 
          AND d.status = 'taken'
          AND d.scheduled_time >= NOW() - (days_back || ' days')::INTERVAL
          AND d.scheduled_time <= NOW()
      ),
      'missed_doses', (
        SELECT COUNT(*) 
        FROM api.doses d 
        WHERE d.medication_id = m.id 
          AND d.status = 'missed'
          AND d.scheduled_time >= NOW() - (days_back || ' days')::INTERVAL
          AND d.scheduled_time <= NOW()
      )
    )
  ) INTO result
  FROM api.medications m
  WHERE m.patient_id = patient_uuid AND m.is_active = true;

  RETURN COALESCE(result, '[]'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- DOSE SCHEDULING FUNCTIONS
-- =============================================

-- Function to generate doses for a medication
CREATE OR REPLACE FUNCTION api.generate_doses(
  med_uuid UUID,
  start_date DATE,
  end_date DATE
)
RETURNS INTEGER AS $$
DECLARE
  medication_record RECORD;
  dose_count INTEGER := 0;
  current_date DATE;
  dose_time TIMESTAMP;
BEGIN
  -- Get medication details
  SELECT * INTO medication_record
  FROM api.medications
  WHERE id = med_uuid;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Medication not found';
  END IF;

  current_date := start_date;
  
  WHILE current_date <= end_date LOOP
    -- Generate doses based on frequency
    CASE medication_record.frequency
      WHEN 'daily' THEN
        INSERT INTO api.doses (medication_id, scheduled_time)
        VALUES (med_uuid, current_date + INTERVAL '9 hours');
        dose_count := dose_count + 1;
        
      WHEN 'twice_daily' THEN
        INSERT INTO api.doses (medication_id, scheduled_time)
        VALUES (med_uuid, current_date + INTERVAL '9 hours');
        INSERT INTO api.doses (medication_id, scheduled_time)
        VALUES (med_uuid, current_date + INTERVAL '21 hours');
        dose_count := dose_count + 2;
        
      WHEN 'three_times_daily' THEN
        INSERT INTO api.doses (medication_id, scheduled_time)
        VALUES (med_uuid, current_date + INTERVAL '8 hours');
        INSERT INTO api.doses (medication_id, scheduled_time)
        VALUES (med_uuid, current_date + INTERVAL '14 hours');
        INSERT INTO api.doses (medication_id, scheduled_time)
        VALUES (med_uuid, current_date + INTERVAL '20 hours');
        dose_count := dose_count + 3;
        
      WHEN 'four_times_daily' THEN
        INSERT INTO api.doses (medication_id, scheduled_time)
        VALUES (med_uuid, current_date + INTERVAL '6 hours');
        INSERT INTO api.doses (medication_id, scheduled_time)
        VALUES (med_uuid, current_date + INTERVAL '12 hours');
        INSERT INTO api.doses (medication_id, scheduled_time)
        VALUES (med_uuid, current_date + INTERVAL '18 hours');
        INSERT INTO api.doses (medication_id, scheduled_time)
        VALUES (med_uuid, current_date + INTERVAL '24 hours');
        dose_count := dose_count + 4;
        
      -- as_needed doesn't generate automatic doses
      WHEN 'as_needed' THEN
        NULL;
    END CASE;
    
    current_date := current_date + 1;
  END LOOP;

  RETURN dose_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- NOTIFICATION FUNCTIONS
-- =============================================

-- Function to get overdue doses for notifications
CREATE OR REPLACE FUNCTION api.get_overdue_doses(user_uuid UUID)
RETURNS JSON AS $$
BEGIN
  RETURN (
    SELECT json_agg(
      json_build_object(
        'dose_id', d.id,
        'medication_id', m.id,
        'medication_name', m.name,
        'patient_id', p.id,
        'patient_name', p.name,
        'scheduled_time', d.scheduled_time,
        'minutes_overdue', EXTRACT(EPOCH FROM (NOW() - d.scheduled_time)) / 60
      )
    )
    FROM api.doses d
    JOIN api.medications m ON d.medication_id = m.id
    JOIN api.patients p ON m.patient_id = p.id
    JOIN api.patient_caregivers pc ON p.id = pc.patient_id
    WHERE pc.caregiver_id = user_uuid
      AND pc.is_active = true
      AND d.status = 'pending'
      AND d.scheduled_time < NOW()
      AND d.scheduled_time > NOW() - INTERVAL '24 hours'  -- Don't include very old doses
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get upcoming doses for notifications
CREATE OR REPLACE FUNCTION api.get_upcoming_doses(
  user_uuid UUID,
  hours_ahead INTEGER DEFAULT 24
)
RETURNS JSON AS $$
BEGIN
  RETURN (
    SELECT json_agg(
      json_build_object(
        'dose_id', d.id,
        'medication_id', m.id,
        'medication_name', m.name,
        'patient_id', p.id,
        'patient_name', p.name,
        'scheduled_time', d.scheduled_time,
        'minutes_until', EXTRACT(EPOCH FROM (d.scheduled_time - NOW())) / 60
      )
    )
    FROM api.doses d
    JOIN api.medications m ON d.medication_id = m.id
    JOIN api.patients p ON m.patient_id = p.id
    JOIN api.patient_caregivers pc ON p.id = pc.patient_id
    WHERE pc.caregiver_id = user_uuid
      AND pc.is_active = true
      AND d.status = 'pending'
      AND d.scheduled_time > NOW()
      AND d.scheduled_time <= NOW() + (hours_ahead || ' hours')::INTERVAL
    ORDER BY d.scheduled_time ASC
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- MEASUREMENT ANALYTICS FUNCTIONS
-- =============================================

-- Function to get measurement trends
CREATE OR REPLACE FUNCTION api.get_measurement_trends(
  patient_uuid UUID,
  measurement_type TEXT,
  days_back INTEGER DEFAULT 30
)
RETURNS JSON AS $$
BEGIN
  RETURN (
    SELECT json_agg(
      json_build_object(
        'date', DATE(recorded_at),
        'value', value,
        'unit', unit,
        'notes', notes,
        'recorded_at', recorded_at
      ) ORDER BY recorded_at ASC
    )
    FROM api.measurements
    WHERE patient_id = patient_uuid
      AND type = measurement_type
      AND recorded_at >= NOW() - (days_back || ' days')::INTERVAL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- CLEANUP FUNCTIONS
-- =============================================

-- Function to cleanup old notifications
CREATE OR REPLACE FUNCTION api.cleanup_old_notifications(days_old INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM api.notifications
  WHERE created_at < NOW() - (days_old || ' days')::INTERVAL
    AND read = true;
    
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark old doses as missed
CREATE OR REPLACE FUNCTION api.mark_overdue_doses_as_missed(hours_overdue INTEGER DEFAULT 6)
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE api.doses
  SET status = 'missed'
  WHERE status = 'pending'
    AND scheduled_time < NOW() - (hours_overdue || ' hours')::INTERVAL;
    
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA api TO authenticated; 