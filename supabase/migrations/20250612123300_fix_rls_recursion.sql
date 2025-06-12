-- Fix infinite recursion in RLS policies
-- Complete rewrite of problematic policies

-- Drop all existing policies that cause recursion
DROP POLICY IF EXISTS "Users can view their caregiver relationships" ON api.patient_caregivers;
DROP POLICY IF EXISTS "Users can add caregiver relationships" ON api.patient_caregivers;
DROP POLICY IF EXISTS "Users can update their caregiver relationships" ON api.patient_caregivers;
DROP POLICY IF EXISTS "Users can delete their caregiver relationships" ON api.patient_caregivers;
DROP POLICY IF EXISTS "Users can view relationships for their patients" ON api.patient_caregivers;
DROP POLICY IF EXISTS "Users can manage relationships for their patients" ON api.patient_caregivers;

DROP POLICY IF EXISTS "Users can view medications for their patients" ON api.medications;
DROP POLICY IF EXISTS "Users can manage medications for their patients" ON api.medications;

DROP POLICY IF EXISTS "Users can manage measurements for their patients" ON api.measurements;
DROP POLICY IF EXISTS "Users can manage logs for their patients" ON api.daily_logs;
DROP POLICY IF EXISTS "Users can manage doses for their patients" ON api.doses;

-- Create simple, non-recursive policies for patient_caregivers
CREATE POLICY "Caregivers can view their relationships" ON api.patient_caregivers
  FOR SELECT USING (caregiver_id = auth.uid());

CREATE POLICY "Caregivers can create relationships" ON api.patient_caregivers
  FOR INSERT WITH CHECK (caregiver_id = auth.uid());

CREATE POLICY "Caregivers can update their relationships" ON api.patient_caregivers
  FOR UPDATE USING (caregiver_id = auth.uid());

CREATE POLICY "Caregivers can delete their relationships" ON api.patient_caregivers
  FOR DELETE USING (caregiver_id = auth.uid());

-- Create simple policies for patients (only creators can manage)
CREATE POLICY "Users can manage their created patients" ON api.patients
  FOR ALL USING (created_by = auth.uid());

-- Create simple policies for medications
CREATE POLICY "Users can manage medications they created" ON api.medications
  FOR ALL USING (created_by = auth.uid());

-- Create simple policies for measurements
CREATE POLICY "Users can manage measurements they recorded" ON api.measurements
  FOR ALL USING (recorded_by = auth.uid());

-- Create simple policies for daily logs
CREATE POLICY "Users can manage logs they recorded" ON api.daily_logs
  FOR ALL USING (recorded_by = auth.uid());

-- Create simple policies for doses
CREATE POLICY "Users can manage doses they marked" ON api.doses
  FOR ALL USING (marked_by = auth.uid() OR marked_by IS NULL);

-- Create simple policies for notifications
CREATE POLICY "Users can manage their notifications" ON api.notifications
  FOR ALL USING (user_id = auth.uid());

-- Create simple policies for notification preferences
CREATE POLICY "Users can manage their notification preferences" ON api.notification_preferences
  FOR ALL USING (user_id = auth.uid());

-- Create simple policies for measurement preferences
CREATE POLICY "Users can manage their measurement preferences" ON api.measurement_preferences
  FOR ALL USING (user_id = auth.uid());

-- Create simple policies for profiles
CREATE POLICY "Users can view and update their profile" ON api.profiles
  FOR ALL USING (id = auth.uid());

-- Create a function to check if user has access to a patient (without recursion)
CREATE OR REPLACE FUNCTION api.user_has_patient_access(patient_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user created the patient
  IF EXISTS (
    SELECT 1 FROM api.patients 
    WHERE id = patient_uuid AND created_by = user_uuid
  ) THEN
    RETURN TRUE;
  END IF;
  
  -- For now, only creators have access
  -- In the future, we can add caregiver relationships here
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION api.user_has_patient_access(UUID, UUID) TO authenticated;

-- Update policies to use the helper function for cross-table access
DROP POLICY IF EXISTS "Users can manage medications they created" ON api.medications;
CREATE POLICY "Users can manage medications for accessible patients" ON api.medications
  FOR ALL USING (
    created_by = auth.uid() OR 
    api.user_has_patient_access(patient_id, auth.uid())
  );

DROP POLICY IF EXISTS "Users can manage measurements they recorded" ON api.measurements;
CREATE POLICY "Users can manage measurements for accessible patients" ON api.measurements
  FOR ALL USING (
    recorded_by = auth.uid() OR 
    api.user_has_patient_access(patient_id, auth.uid())
  );

DROP POLICY IF EXISTS "Users can manage logs they recorded" ON api.daily_logs;
CREATE POLICY "Users can manage logs for accessible patients" ON api.daily_logs
  FOR ALL USING (
    recorded_by = auth.uid() OR 
    api.user_has_patient_access(patient_id, auth.uid())
  );

-- Update doses policy to check medication access
DROP POLICY IF EXISTS "Users can manage doses they marked" ON api.doses;
CREATE POLICY "Users can manage doses for accessible medications" ON api.doses
  FOR ALL USING (
    marked_by = auth.uid() OR 
    marked_by IS NULL OR
    medication_id IN (
      SELECT id FROM api.medications 
      WHERE created_by = auth.uid()
    )
  ); 