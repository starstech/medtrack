-- Notification Triggers for MedTrack
-- Version: 06 - Auto-notification System

-- Set search path to use api schema
SET search_path TO api, public;

-- =============================================
-- DOSE STATUS NOTIFICATION TRIGGERS
-- =============================================

-- Function to create notification when dose is marked as taken
CREATE OR REPLACE FUNCTION api.notify_dose_taken()
RETURNS TRIGGER AS $$
DECLARE
  patient_name TEXT;
  medication_name TEXT;
  caregiver_ids UUID[];
BEGIN
  -- Only trigger on status change to 'taken'
  IF NEW.status = 'taken' AND (OLD.status IS NULL OR OLD.status != 'taken') THEN
    
    -- Get patient and medication names
    SELECT p.name, m.name INTO patient_name, medication_name
    FROM api.patients p
    JOIN api.medications m ON m.patient_id = p.id
    WHERE m.id = NEW.medication_id;
    
    -- Get all caregivers for this patient
    SELECT ARRAY_AGG(pc.caregiver_id) INTO caregiver_ids
    FROM api.patient_caregivers pc
    JOIN api.medications m ON m.patient_id = pc.patient_id
    WHERE m.id = NEW.medication_id AND pc.is_active = true;
    
    -- Create notifications for all caregivers
    INSERT INTO api.notifications (user_id, type, title, message, data)
    SELECT 
      unnest(caregiver_ids),
      'dose_taken',
      'Dose Recorded',
      patient_name || ' has taken their ' || medication_name,
      json_build_object(
        'dose_id', NEW.id,
        'medication_id', NEW.medication_id,
        'patient_name', patient_name,
        'medication_name', medication_name,
        'taken_at', NEW.taken_at
      )::jsonb;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for dose status changes
CREATE TRIGGER trigger_dose_taken_notification
  AFTER UPDATE OF status ON api.doses
  FOR EACH ROW
  EXECUTE FUNCTION api.notify_dose_taken();

-- =============================================
-- OVERDUE DOSE NOTIFICATION FUNCTION
-- =============================================

-- Function to create notifications for overdue doses (called by cron)
CREATE OR REPLACE FUNCTION api.create_overdue_notifications()
RETURNS INTEGER AS $$
DECLARE
  overdue_count INTEGER := 0;
  dose_record RECORD;
BEGIN
  -- Find doses that are overdue by 30 minutes and haven't been notified recently
  FOR dose_record IN
    SELECT 
      d.id as dose_id,
      d.scheduled_time,
      m.id as medication_id,
      m.name as medication_name,
      p.id as patient_id,
      p.name as patient_name,
      ARRAY_AGG(pc.caregiver_id) as caregiver_ids
    FROM api.doses d
    JOIN api.medications m ON d.medication_id = m.id
    JOIN api.patients p ON m.patient_id = p.id
    JOIN api.patient_caregivers pc ON p.id = pc.patient_id
    WHERE d.status = 'pending'
      AND d.scheduled_time < NOW() - INTERVAL '30 minutes'
      AND d.scheduled_time > NOW() - INTERVAL '24 hours'
      AND pc.is_active = true
      -- Don't create duplicate notifications (check if notification was created in last hour)
      AND NOT EXISTS (
        SELECT 1 FROM api.notifications n
        WHERE n.data->>'dose_id' = d.id::text
          AND n.type = 'dose_overdue'
          AND n.created_at > NOW() - INTERVAL '1 hour'
      )
    GROUP BY d.id, d.scheduled_time, m.id, m.name, p.id, p.name
  LOOP
    -- Create overdue notifications for all caregivers
    INSERT INTO api.notifications (user_id, type, title, message, data)
    SELECT 
      unnest(dose_record.caregiver_ids),
      'dose_overdue',
      'Overdue Medication',
      dose_record.patient_name || ' missed their ' || dose_record.medication_name || ' (due ' || 
      EXTRACT(EPOCH FROM (NOW() - dose_record.scheduled_time))::INTEGER / 60 || ' minutes ago)',
      json_build_object(
        'dose_id', dose_record.dose_id,
        'medication_id', dose_record.medication_id,
        'patient_id', dose_record.patient_id,
        'patient_name', dose_record.patient_name,
        'medication_name', dose_record.medication_name,
        'scheduled_time', dose_record.scheduled_time,
        'minutes_overdue', EXTRACT(EPOCH FROM (NOW() - dose_record.scheduled_time))::INTEGER / 60
      )::jsonb;
    
    overdue_count := overdue_count + 1;
  END LOOP;
  
  RETURN overdue_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- UPCOMING DOSE REMINDER FUNCTION
-- =============================================

-- Function to create reminder notifications (called by cron)
CREATE OR REPLACE FUNCTION api.create_reminder_notifications()
RETURNS INTEGER AS $$
DECLARE
  reminder_count INTEGER := 0;
  dose_record RECORD;
  reminder_minutes INTEGER[];
BEGIN
  -- Get default reminder minutes
  reminder_minutes := ARRAY[15, 30, 60];
  
  -- Find upcoming doses that need reminders
  FOR dose_record IN
    SELECT 
      d.id as dose_id,
      d.scheduled_time,
      m.id as medication_id,
      m.name as medication_name,
      p.id as patient_id,
      p.name as patient_name,
      pc.caregiver_id,
      COALESCE(np.reminder_minutes, reminder_minutes) as user_reminder_minutes
    FROM api.doses d
    JOIN api.medications m ON d.medication_id = m.id
    JOIN api.patients p ON m.patient_id = p.id
    JOIN api.patient_caregivers pc ON p.id = pc.patient_id
    LEFT JOIN api.notification_preferences np ON pc.caregiver_id = np.user_id
    WHERE d.status = 'pending'
      AND d.scheduled_time > NOW()
      AND d.scheduled_time <= NOW() + INTERVAL '2 hours'
      AND pc.is_active = true
      AND (np.medication_reminders IS NULL OR np.medication_reminders = true)
      -- Check if we should send reminder based on user preferences
      AND EXISTS (
        SELECT 1 FROM unnest(COALESCE(np.reminder_minutes, reminder_minutes)) as minute_before
        WHERE d.scheduled_time - (minute_before || ' minutes')::INTERVAL <= NOW()
          AND d.scheduled_time - (minute_before || ' minutes')::INTERVAL > NOW() - INTERVAL '5 minutes'
      )
      -- Don't create duplicate reminders
      AND NOT EXISTS (
        SELECT 1 FROM api.notifications n
        WHERE n.data->>'dose_id' = d.id::text
          AND n.type = 'dose_reminder'
          AND n.user_id = pc.caregiver_id
          AND n.created_at > NOW() - INTERVAL '10 minutes'
      )
  LOOP
    -- Create reminder notification
    INSERT INTO api.notifications (user_id, type, title, message, data)
    VALUES (
      dose_record.caregiver_id,
      'dose_reminder',
      'Medication Reminder',
      'Time to give ' || dose_record.patient_name || ' their ' || dose_record.medication_name || 
      ' (due in ' || EXTRACT(EPOCH FROM (dose_record.scheduled_time - NOW()))::INTEGER / 60 || ' minutes)',
      json_build_object(
        'dose_id', dose_record.dose_id,
        'medication_id', dose_record.medication_id,
        'patient_id', dose_record.patient_id,
        'patient_name', dose_record.patient_name,
        'medication_name', dose_record.medication_name,
        'scheduled_time', dose_record.scheduled_time,
        'minutes_until', EXTRACT(EPOCH FROM (dose_record.scheduled_time - NOW()))::INTEGER / 60
      )::jsonb
    );
    
    reminder_count := reminder_count + 1;
  END LOOP;
  
  RETURN reminder_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- PATIENT/CAREGIVER ACTIVITY TRIGGERS
-- =============================================

-- Function to notify when new measurement is added
CREATE OR REPLACE FUNCTION api.notify_new_measurement()
RETURNS TRIGGER AS $$
DECLARE
  patient_name TEXT;
  caregiver_ids UUID[];
BEGIN
  -- Get patient name
  SELECT name INTO patient_name FROM api.patients WHERE id = NEW.patient_id;
  
  -- Get all caregivers for this patient (except the one who recorded it)
  SELECT ARRAY_AGG(pc.caregiver_id) INTO caregiver_ids
  FROM api.patient_caregivers pc
  WHERE pc.patient_id = NEW.patient_id 
    AND pc.is_active = true 
    AND pc.caregiver_id != NEW.recorded_by;
  
  -- Create notifications for other caregivers
  IF array_length(caregiver_ids, 1) > 0 THEN
    INSERT INTO api.notifications (user_id, type, title, message, data)
    SELECT 
      unnest(caregiver_ids),
      'new_measurement',
      'New Measurement Added',
      'A new ' || NEW.type || ' measurement was recorded for ' || patient_name,
      json_build_object(
        'measurement_id', NEW.id,
        'patient_id', NEW.patient_id,
        'patient_name', patient_name,
        'type', NEW.type,
        'value', NEW.value,
        'unit', NEW.unit,
        'recorded_by', NEW.recorded_by
      )::jsonb;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new measurements
CREATE TRIGGER trigger_new_measurement_notification
  AFTER INSERT ON api.measurements
  FOR EACH ROW
  EXECUTE FUNCTION api.notify_new_measurement();

-- Function to notify when new daily log is added
CREATE OR REPLACE FUNCTION api.notify_new_daily_log()
RETURNS TRIGGER AS $$
DECLARE
  patient_name TEXT;
  caregiver_ids UUID[];
BEGIN
  -- Get patient name
  SELECT name INTO patient_name FROM api.patients WHERE id = NEW.patient_id;
  
  -- Get all caregivers for this patient (except the one who recorded it)
  SELECT ARRAY_AGG(pc.caregiver_id) INTO caregiver_ids
  FROM api.patient_caregivers pc
  WHERE pc.patient_id = NEW.patient_id 
    AND pc.is_active = true 
    AND pc.caregiver_id != NEW.recorded_by;
  
  -- Create notifications for other caregivers
  IF array_length(caregiver_ids, 1) > 0 THEN
    INSERT INTO api.notifications (user_id, type, title, message, data)
    SELECT 
      unnest(caregiver_ids),
      'new_daily_log',
      'New Daily Log Entry',
      'A new ' || NEW.type || ' log was added for ' || patient_name || 
      CASE WHEN NEW.follow_up_required THEN ' (Follow-up required)' ELSE '' END,
      json_build_object(
        'log_id', NEW.id,
        'patient_id', NEW.patient_id,
        'patient_name', patient_name,
        'title', NEW.title,
        'type', NEW.type,
        'severity', NEW.severity,
        'follow_up_required', NEW.follow_up_required,
        'recorded_by', NEW.recorded_by
      )::jsonb;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new daily logs
CREATE TRIGGER trigger_new_daily_log_notification
  AFTER INSERT ON api.daily_logs
  FOR EACH ROW
  EXECUTE FUNCTION api.notify_new_daily_log();

-- Grant execute permissions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA api TO authenticated; 