-- Fix RLS policies to prevent infinite recursion
-- Drop and recreate problematic policies

-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Users can view patient caregivers" ON api.patient_caregivers;
DROP POLICY IF EXISTS "Users can add caregivers" ON api.patient_caregivers;
DROP POLICY IF EXISTS "Users can update caregiver relationships" ON api.patient_caregivers;
DROP POLICY IF EXISTS "Users can remove caregivers" ON api.patient_caregivers;

-- Create simplified patient_caregivers policies without recursion
CREATE POLICY "Users can view their caregiver relationships" ON api.patient_caregivers
  FOR SELECT USING (caregiver_id = auth.uid());

CREATE POLICY "Users can add caregiver relationships" ON api.patient_caregivers
  FOR INSERT WITH CHECK (caregiver_id = auth.uid());

CREATE POLICY "Users can update their caregiver relationships" ON api.patient_caregivers
  FOR UPDATE USING (caregiver_id = auth.uid());

CREATE POLICY "Users can delete their caregiver relationships" ON api.patient_caregivers
  FOR DELETE USING (caregiver_id = auth.uid());

-- Allow users to view relationships for patients they created
CREATE POLICY "Users can view relationships for their patients" ON api.patient_caregivers
  FOR SELECT USING (
    patient_id IN (
      SELECT id FROM api.patients WHERE created_by = auth.uid()
    )
  );

-- Allow users to manage relationships for patients they created
CREATE POLICY "Users can manage relationships for their patients" ON api.patient_caregivers
  FOR ALL USING (
    patient_id IN (
      SELECT id FROM api.patients WHERE created_by = auth.uid()
    )
  );

-- Update other policies to use a simpler approach
-- Drop and recreate medication policies
DROP POLICY IF EXISTS "Users can view patient medications" ON api.medications;
DROP POLICY IF EXISTS "Users can add medications" ON api.medications;
DROP POLICY IF EXISTS "Users can update medications" ON api.medications;
DROP POLICY IF EXISTS "Users can delete medications" ON api.medications;

CREATE POLICY "Users can view medications for their patients" ON api.medications
  FOR SELECT USING (
    patient_id IN (
      SELECT id FROM api.patients WHERE created_by = auth.uid()
    ) OR
    patient_id IN (
      SELECT patient_id FROM api.patient_caregivers WHERE caregiver_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can manage medications for their patients" ON api.medications
  FOR ALL USING (
    patient_id IN (
      SELECT id FROM api.patients WHERE created_by = auth.uid()
    ) OR
    patient_id IN (
      SELECT patient_id FROM api.patient_caregivers WHERE caregiver_id = auth.uid() AND is_active = true
    )
  ) WITH CHECK (
    created_by = auth.uid() AND (
      patient_id IN (
        SELECT id FROM api.patients WHERE created_by = auth.uid()
      ) OR
      patient_id IN (
        SELECT patient_id FROM api.patient_caregivers WHERE caregiver_id = auth.uid() AND is_active = true
      )
    )
  );

-- Simplify other policies similarly
DROP POLICY IF EXISTS "Users can view patient measurements" ON api.measurements;
DROP POLICY IF EXISTS "Users can add measurements" ON api.measurements;
DROP POLICY IF EXISTS "Users can update measurements" ON api.measurements;
DROP POLICY IF EXISTS "Users can delete measurements" ON api.measurements;

CREATE POLICY "Users can manage measurements for their patients" ON api.measurements
  FOR ALL USING (
    patient_id IN (
      SELECT id FROM api.patients WHERE created_by = auth.uid()
    ) OR
    patient_id IN (
      SELECT patient_id FROM api.patient_caregivers WHERE caregiver_id = auth.uid() AND is_active = true
    )
  ) WITH CHECK (
    recorded_by = auth.uid() AND (
      patient_id IN (
        SELECT id FROM api.patients WHERE created_by = auth.uid()
      ) OR
      patient_id IN (
        SELECT patient_id FROM api.patient_caregivers WHERE caregiver_id = auth.uid() AND is_active = true
      )
    )
  );

-- Fix daily logs policies
DROP POLICY IF EXISTS "Users can view patient logs" ON api.daily_logs;
DROP POLICY IF EXISTS "Users can add logs" ON api.daily_logs;
DROP POLICY IF EXISTS "Users can update logs" ON api.daily_logs;
DROP POLICY IF EXISTS "Users can delete logs" ON api.daily_logs;

CREATE POLICY "Users can manage logs for their patients" ON api.daily_logs
  FOR ALL USING (
    patient_id IN (
      SELECT id FROM api.patients WHERE created_by = auth.uid()
    ) OR
    patient_id IN (
      SELECT patient_id FROM api.patient_caregivers WHERE caregiver_id = auth.uid() AND is_active = true
    )
  ) WITH CHECK (
    recorded_by = auth.uid() AND (
      patient_id IN (
        SELECT id FROM api.patients WHERE created_by = auth.uid()
      ) OR
      patient_id IN (
        SELECT patient_id FROM api.patient_caregivers WHERE caregiver_id = auth.uid() AND is_active = true
      )
    )
  );

-- Fix doses policies
DROP POLICY IF EXISTS "Users can view patient doses" ON api.doses;
DROP POLICY IF EXISTS "Users can add doses" ON api.doses;
DROP POLICY IF EXISTS "Users can update doses" ON api.doses;
DROP POLICY IF EXISTS "Users can delete doses" ON api.doses;

CREATE POLICY "Users can manage doses for their patients" ON api.doses
  FOR ALL USING (
    medication_id IN (
      SELECT m.id FROM api.medications m
      WHERE m.patient_id IN (
        SELECT id FROM api.patients WHERE created_by = auth.uid()
      ) OR m.patient_id IN (
        SELECT patient_id FROM api.patient_caregivers WHERE caregiver_id = auth.uid() AND is_active = true
      )
    )
  ); 