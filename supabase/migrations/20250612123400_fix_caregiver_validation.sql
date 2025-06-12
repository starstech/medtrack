-- Fix caregiver validation to allow patient creators access
-- The current validation is too restrictive

-- Drop the existing validation triggers that are causing issues
DROP TRIGGER IF EXISTS trigger_validate_medication_access ON api.medications;
DROP TRIGGER IF EXISTS trigger_validate_measurement_access ON api.measurements;
DROP TRIGGER IF EXISTS trigger_validate_daily_log_access ON api.daily_logs;

-- Update the validation function to check patient ownership first
CREATE OR REPLACE FUNCTION api.validate_caregiver_permissions()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if user created the patient (primary access)
  IF EXISTS (
    SELECT 1 FROM api.patients p
    WHERE p.id = NEW.patient_id
      AND p.created_by = auth.uid()
  ) THEN
    RETURN NEW;
  END IF;
  
  -- Check if user has caregiver relationship (secondary access)
  IF EXISTS (
    SELECT 1 FROM api.patient_caregivers pc
    WHERE pc.patient_id = NEW.patient_id
      AND pc.caregiver_id = auth.uid()
      AND pc.is_active = true
  ) THEN
    RETURN NEW;
  END IF;
  
  -- If neither condition is met, deny access
  RAISE EXCEPTION 'Access denied: You do not have permission to modify data for this patient';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the triggers with the updated function
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