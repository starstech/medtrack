-- Row Level Security Policies for MedTrack
-- Version: 02 - RLS Policies

-- Set search path to use api schema
SET search_path TO api, public;

-- =============================================
-- PROFILES TABLE POLICIES
-- =============================================

-- Users can view and update their own profile
CREATE POLICY "Users can view own profile" ON api.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON api.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Users can view profiles of caregivers who share patients with them
CREATE POLICY "Users can view caregiver profiles" ON api.profiles
  FOR SELECT USING (
    id IN (
      SELECT DISTINCT pc.caregiver_id 
      FROM api.patient_caregivers pc
      WHERE pc.patient_id IN (
        SELECT patient_id FROM api.patient_caregivers 
        WHERE caregiver_id = auth.uid() AND is_active = true
      )
    )
  );

-- =============================================
-- PATIENTS TABLE POLICIES
-- =============================================

-- Users can view patients they are caregivers for
CREATE POLICY "Users can view their patients" ON api.patients
  FOR SELECT USING (
    id IN (
      SELECT patient_id FROM api.patient_caregivers 
      WHERE caregiver_id = auth.uid() AND is_active = true
    )
  );

-- Users can insert patients (they become primary caregiver)
CREATE POLICY "Users can create patients" ON api.patients
  FOR INSERT WITH CHECK (created_by = auth.uid());

-- Users can update patients they are caregivers for
CREATE POLICY "Users can update their patients" ON api.patients
  FOR UPDATE USING (
    id IN (
      SELECT patient_id FROM api.patient_caregivers 
      WHERE caregiver_id = auth.uid() AND is_active = true
    )
  );

-- Users can delete patients they created (primary caregiver)
CREATE POLICY "Users can delete patients they created" ON api.patients
  FOR DELETE USING (created_by = auth.uid());

-- =============================================
-- PATIENT_CAREGIVERS TABLE POLICIES
-- =============================================

-- Users can view caregiver relationships for their patients
CREATE POLICY "Users can view patient caregivers" ON api.patient_caregivers
  FOR SELECT USING (
    caregiver_id = auth.uid() OR 
    patient_id IN (
      SELECT patient_id FROM api.patient_caregivers 
      WHERE caregiver_id = auth.uid() AND is_active = true
    )
  );

-- Users can add caregivers to their patients
CREATE POLICY "Users can add caregivers" ON api.patient_caregivers
  FOR INSERT WITH CHECK (
    patient_id IN (
      SELECT patient_id FROM api.patient_caregivers 
      WHERE caregiver_id = auth.uid() AND is_active = true
    )
  );

-- Users can update caregiver relationships for their patients
CREATE POLICY "Users can update caregiver relationships" ON api.patient_caregivers
  FOR UPDATE USING (
    patient_id IN (
      SELECT patient_id FROM api.patient_caregivers 
      WHERE caregiver_id = auth.uid() AND is_active = true
    )
  );

-- Users can remove caregivers from their patients
CREATE POLICY "Users can remove caregivers" ON api.patient_caregivers
  FOR DELETE USING (
    patient_id IN (
      SELECT patient_id FROM api.patient_caregivers 
      WHERE caregiver_id = auth.uid() AND is_active = true
    )
  );

-- =============================================
-- MEDICATIONS TABLE POLICIES
-- =============================================

-- Users can view medications for their patients
CREATE POLICY "Users can view patient medications" ON api.medications
  FOR SELECT USING (
    patient_id IN (
      SELECT patient_id FROM api.patient_caregivers 
      WHERE caregiver_id = auth.uid() AND is_active = true
    )
  );

-- Users can add medications to their patients
CREATE POLICY "Users can add medications" ON api.medications
  FOR INSERT WITH CHECK (
    patient_id IN (
      SELECT patient_id FROM api.patient_caregivers 
      WHERE caregiver_id = auth.uid() AND is_active = true
    ) AND created_by = auth.uid()
  );

-- Users can update medications for their patients
CREATE POLICY "Users can update medications" ON api.medications
  FOR UPDATE USING (
    patient_id IN (
      SELECT patient_id FROM api.patient_caregivers 
      WHERE caregiver_id = auth.uid() AND is_active = true
    )
  );

-- Users can delete medications for their patients
CREATE POLICY "Users can delete medications" ON api.medications
  FOR DELETE USING (
    patient_id IN (
      SELECT patient_id FROM api.patient_caregivers 
      WHERE caregiver_id = auth.uid() AND is_active = true
    )
  );

-- =============================================
-- DOSES TABLE POLICIES
-- =============================================

-- Users can view doses for medications of their patients
CREATE POLICY "Users can view patient doses" ON api.doses
  FOR SELECT USING (
    medication_id IN (
      SELECT m.id FROM api.medications m
      JOIN api.patient_caregivers pc ON m.patient_id = pc.patient_id
      WHERE pc.caregiver_id = auth.uid() AND pc.is_active = true
    )
  );

-- Users can add doses for medications of their patients
CREATE POLICY "Users can add doses" ON api.doses
  FOR INSERT WITH CHECK (
    medication_id IN (
      SELECT m.id FROM api.medications m
      JOIN api.patient_caregivers pc ON m.patient_id = pc.patient_id
      WHERE pc.caregiver_id = auth.uid() AND pc.is_active = true
    )
  );

-- Users can update doses for their patients
CREATE POLICY "Users can update doses" ON api.doses
  FOR UPDATE USING (
    medication_id IN (
      SELECT m.id FROM api.medications m
      JOIN api.patient_caregivers pc ON m.patient_id = pc.patient_id
      WHERE pc.caregiver_id = auth.uid() AND pc.is_active = true
    )
  );

-- Users can delete doses for their patients
CREATE POLICY "Users can delete doses" ON api.doses
  FOR DELETE USING (
    medication_id IN (
      SELECT m.id FROM api.medications m
      JOIN api.patient_caregivers pc ON m.patient_id = pc.patient_id
      WHERE pc.caregiver_id = auth.uid() AND pc.is_active = true
    )
  );

-- =============================================
-- MEASUREMENTS TABLE POLICIES
-- =============================================

-- Users can view measurements for their patients
CREATE POLICY "Users can view patient measurements" ON api.measurements
  FOR SELECT USING (
    patient_id IN (
      SELECT patient_id FROM api.patient_caregivers 
      WHERE caregiver_id = auth.uid() AND is_active = true
    )
  );

-- Users can add measurements for their patients
CREATE POLICY "Users can add measurements" ON api.measurements
  FOR INSERT WITH CHECK (
    patient_id IN (
      SELECT patient_id FROM api.patient_caregivers 
      WHERE caregiver_id = auth.uid() AND is_active = true
    ) AND recorded_by = auth.uid()
  );

-- Users can update measurements for their patients
CREATE POLICY "Users can update measurements" ON api.measurements
  FOR UPDATE USING (
    patient_id IN (
      SELECT patient_id FROM api.patient_caregivers 
      WHERE caregiver_id = auth.uid() AND is_active = true
    )
  );

-- Users can delete measurements for their patients
CREATE POLICY "Users can delete measurements" ON api.measurements
  FOR DELETE USING (
    patient_id IN (
      SELECT patient_id FROM api.patient_caregivers 
      WHERE caregiver_id = auth.uid() AND is_active = true
    )
  );

-- =============================================
-- DAILY_LOGS TABLE POLICIES
-- =============================================

-- Users can view daily logs for their patients
CREATE POLICY "Users can view patient logs" ON api.daily_logs
  FOR SELECT USING (
    patient_id IN (
      SELECT patient_id FROM api.patient_caregivers 
      WHERE caregiver_id = auth.uid() AND is_active = true
    )
  );

-- Users can add daily logs for their patients
CREATE POLICY "Users can add logs" ON api.daily_logs
  FOR INSERT WITH CHECK (
    patient_id IN (
      SELECT patient_id FROM api.patient_caregivers 
      WHERE caregiver_id = auth.uid() AND is_active = true
    ) AND recorded_by = auth.uid()
  );

-- Users can update daily logs for their patients
CREATE POLICY "Users can update logs" ON api.daily_logs
  FOR UPDATE USING (
    patient_id IN (
      SELECT patient_id FROM api.patient_caregivers 
      WHERE caregiver_id = auth.uid() AND is_active = true
    )
  );

-- Users can delete daily logs for their patients
CREATE POLICY "Users can delete logs" ON api.daily_logs
  FOR DELETE USING (
    patient_id IN (
      SELECT patient_id FROM api.patient_caregivers 
      WHERE caregiver_id = auth.uid() AND is_active = true
    )
  );

-- =============================================
-- FILES TABLE POLICIES
-- =============================================

-- Users can view files they uploaded
CREATE POLICY "Users can view own files" ON api.files
  FOR SELECT USING (uploaded_by = auth.uid());

-- Users can upload files
CREATE POLICY "Users can upload files" ON api.files
  FOR INSERT WITH CHECK (uploaded_by = auth.uid());

-- Users can delete files they uploaded
CREATE POLICY "Users can delete own files" ON api.files
  FOR DELETE USING (uploaded_by = auth.uid());

-- =============================================
-- NOTIFICATIONS TABLE POLICIES
-- =============================================

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications" ON api.notifications
  FOR SELECT USING (user_id = auth.uid());

-- Users can insert notifications for themselves
CREATE POLICY "Users can create notifications" ON api.notifications
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON api.notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications" ON api.notifications
  FOR DELETE USING (user_id = auth.uid());

-- =============================================
-- USER_DEVICES TABLE POLICIES
-- =============================================

-- Users can view their own devices
CREATE POLICY "Users can view own devices" ON api.user_devices
  FOR SELECT USING (user_id = auth.uid());

-- Users can register their own devices
CREATE POLICY "Users can register devices" ON api.user_devices
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can update their own devices
CREATE POLICY "Users can update own devices" ON api.user_devices
  FOR UPDATE USING (user_id = auth.uid());

-- Users can delete their own devices
CREATE POLICY "Users can delete own devices" ON api.user_devices
  FOR DELETE USING (user_id = auth.uid());

-- =============================================
-- NOTIFICATION_PREFERENCES TABLE POLICIES
-- =============================================

-- Users can view their own notification preferences
CREATE POLICY "Users can view own preferences" ON api.notification_preferences
  FOR SELECT USING (user_id = auth.uid());

-- Users can update their own notification preferences
CREATE POLICY "Users can update own preferences" ON api.notification_preferences
  FOR UPDATE USING (user_id = auth.uid());

-- Users can insert their own notification preferences
CREATE POLICY "Users can create preferences" ON api.notification_preferences
  FOR INSERT WITH CHECK (user_id = auth.uid()); 