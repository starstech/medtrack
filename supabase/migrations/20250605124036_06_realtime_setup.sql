-- Real-time Subscriptions Setup for MedTrack
-- Version: 07 - Real-time Configuration

-- Set search path to use api schema
SET search_path TO api, public;

-- =============================================
-- ENABLE REAL-TIME FOR TABLES
-- =============================================

-- Enable real-time for all core tables
ALTER PUBLICATION supabase_realtime ADD TABLE api.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE api.patients;
ALTER PUBLICATION supabase_realtime ADD TABLE api.patient_caregivers;
ALTER PUBLICATION supabase_realtime ADD TABLE api.medications;
ALTER PUBLICATION supabase_realtime ADD TABLE api.doses;
ALTER PUBLICATION supabase_realtime ADD TABLE api.measurements;
ALTER PUBLICATION supabase_realtime ADD TABLE api.daily_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE api.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE api.user_devices;
ALTER PUBLICATION supabase_realtime ADD TABLE api.notification_preferences;

-- Note: Files table is not included in real-time as file operations
-- should go through storage APIs and don't need real-time updates

-- =============================================
-- REAL-TIME SUBSCRIPTION HELPERS
-- =============================================

-- Function to get user's real-time subscription filters
CREATE OR REPLACE FUNCTION api.get_user_subscription_filters(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
  patient_ids UUID[];
  filters JSON;
BEGIN
  -- Get all patient IDs this user has access to
  SELECT ARRAY_AGG(DISTINCT pc.patient_id) INTO patient_ids
  FROM api.patient_caregivers pc
  WHERE pc.caregiver_id = user_uuid AND pc.is_active = true;
  
  -- Build subscription filters
  filters := json_build_object(
    'profiles', json_build_object(
      'filter', 'id=eq.' || user_uuid::text
    ),
    'patients', json_build_object(
      'filter', 'id=in.(' || array_to_string(patient_ids, ',') || ')'
    ),
    'patient_caregivers', json_build_object(
      'filter', 'caregiver_id=eq.' || user_uuid::text || ',patient_id=in.(' || array_to_string(patient_ids, ',') || ')'
    ),
    'medications', json_build_object(
      'filter', 'patient_id=in.(' || array_to_string(patient_ids, ',') || ')'
    ),
    'doses', json_build_object(
      'filter', 'medication_id=in.(select:id:from:medications:where:patient_id:in:(' || array_to_string(patient_ids, ',') || '))'
    ),
    'measurements', json_build_object(
      'filter', 'patient_id=in.(' || array_to_string(patient_ids, ',') || ')'
    ),
    'daily_logs', json_build_object(
      'filter', 'patient_id=in.(' || array_to_string(patient_ids, ',') || ')'
    ),
    'notifications', json_build_object(
      'filter', 'user_id=eq.' || user_uuid::text
    ),
    'user_devices', json_build_object(
      'filter', 'user_id=eq.' || user_uuid::text
    ),
    'notification_preferences', json_build_object(
      'filter', 'user_id=eq.' || user_uuid::text
    )
  );
  
  RETURN filters;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- REAL-TIME EVENT HANDLERS
-- =============================================

-- Function to handle real-time events and trigger additional actions
CREATE OR REPLACE FUNCTION api.handle_realtime_event()
RETURNS TRIGGER AS $$
DECLARE
  event_data JSON;
  table_name TEXT;
BEGIN
  -- Get the table name
  table_name := TG_TABLE_NAME;
  
  -- Build event data based on operation
  CASE TG_OP
    WHEN 'INSERT' THEN
      event_data := json_build_object(
        'operation', 'INSERT',
        'table', table_name,
        'new', row_to_json(NEW),
        'timestamp', NOW()
      );
    WHEN 'UPDATE' THEN
      event_data := json_build_object(
        'operation', 'UPDATE',
        'table', table_name,
        'old', row_to_json(OLD),
        'new', row_to_json(NEW),
        'timestamp', NOW()
      );
    WHEN 'DELETE' THEN
      event_data := json_build_object(
        'operation', 'DELETE',
        'table', table_name,
        'old', row_to_json(OLD),
        'timestamp', NOW()
      );
  END CASE;
  
  -- Log important events (optional - for debugging)
  -- You can enable this for debugging real-time events
  -- INSERT INTO api.realtime_events (event_data, created_at) VALUES (event_data, NOW());
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- REAL-TIME PRESENCE SETUP
-- =============================================

-- Table to track user presence/activity
CREATE TABLE api.user_presence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES api.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'online' CHECK (status IN ('online', 'away', 'offline')),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  device_info JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for presence table
ALTER TABLE api.user_presence ENABLE ROW LEVEL SECURITY;

-- RLS policies for presence
CREATE POLICY "Users can view presence of shared caregivers" ON api.user_presence
  FOR SELECT USING (
    user_id = auth.uid() OR
    user_id IN (
      SELECT DISTINCT pc.caregiver_id 
      FROM api.patient_caregivers pc
      WHERE pc.patient_id IN (
        SELECT patient_id FROM api.patient_caregivers 
        WHERE caregiver_id = auth.uid() AND is_active = true
      )
    )
  );

CREATE POLICY "Users can update own presence" ON api.user_presence
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own presence status" ON api.user_presence
  FOR UPDATE USING (user_id = auth.uid());

-- Add presence to real-time
ALTER PUBLICATION supabase_realtime ADD TABLE api.user_presence;

-- Function to update user presence
CREATE OR REPLACE FUNCTION api.update_user_presence(
  user_uuid UUID,
  presence_status TEXT DEFAULT 'online',
  device_data JSONB DEFAULT '{}'
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO api.user_presence (user_id, status, device_info, last_seen, updated_at)
  VALUES (user_uuid, presence_status, device_data, NOW(), NOW())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    status = EXCLUDED.status,
    device_info = EXCLUDED.device_info,
    last_seen = EXCLUDED.last_seen,
    updated_at = EXCLUDED.updated_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- REAL-TIME OPTIMIZATION FUNCTIONS
-- =============================================

-- Function to get real-time channels for a user
CREATE OR REPLACE FUNCTION api.get_user_channels(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
  patient_ids UUID[];
  channels JSON;
BEGIN
  -- Get patient IDs for this user
  SELECT ARRAY_AGG(DISTINCT pc.patient_id) INTO patient_ids
  FROM api.patient_caregivers pc
  WHERE pc.caregiver_id = user_uuid AND pc.is_active = true;
  
  -- Build channel list
  channels := json_build_object(
    'personal', 'user_' || user_uuid::text,
    'patients', json_agg(json_build_object(
      'patient_id', patient_id,
      'channel', 'patient_' || patient_id::text
    ))
  )
  FROM unnest(patient_ids) AS patient_id;
  
  RETURN channels;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to broadcast real-time message to patient channels
CREATE OR REPLACE FUNCTION api.broadcast_to_patient_caregivers(
  patient_uuid UUID,
  message_type TEXT,
  message_data JSONB
)
RETURNS INTEGER AS $$
DECLARE
  caregiver_count INTEGER;
BEGIN
  -- This would typically be called from your application code
  -- using the Supabase real-time client, but we can track the intent here
  
  SELECT COUNT(*) INTO caregiver_count
  FROM api.patient_caregivers pc
  WHERE pc.patient_id = patient_uuid AND pc.is_active = true;
  
  -- In your application, you would call something like:
  -- supabase.channel(`patient_${patient_uuid}`)
  --   .send('broadcast', { type: message_type, data: message_data })
  
  RETURN caregiver_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- REAL-TIME CLEANUP FUNCTIONS
-- =============================================

-- Function to cleanup old presence records
CREATE OR REPLACE FUNCTION api.cleanup_old_presence(hours_old INTEGER DEFAULT 24)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM api.user_presence
  WHERE last_seen < NOW() - (hours_old || ' hours')::INTERVAL
    AND status = 'offline';
    
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA api TO authenticated;

/*
REAL-TIME USAGE EXAMPLES:

1. Subscribe to user's notifications:
   const channel = supabase
     .channel('user_notifications')
     .on('postgres_changes', 
       { event: 'INSERT', schema: 'api', table: 'notifications', filter: `user_id=eq.${userId}` },
       (payload) => handleNewNotification(payload)
     )
     .subscribe()

2. Subscribe to patient updates:
   const channel = supabase
     .channel('patient_updates')
     .on('postgres_changes',
       { event: '*', schema: 'api', table: 'measurements', filter: `patient_id=eq.${patientId}` },
       (payload) => handleMeasurementUpdate(payload)
     )
     .subscribe()

3. Subscribe to dose updates:
   const channel = supabase
     .channel('dose_tracking')
     .on('postgres_changes',
       { event: 'UPDATE', schema: 'api', table: 'doses', filter: `status=eq.taken` },
       (payload) => handleDoseTaken(payload)
     )
     .subscribe()

4. Presence tracking:
   const presenceChannel = supabase
     .channel('caregiver_presence')
     .on('presence', { event: 'sync' }, () => {
       const newState = presenceChannel.presenceState()
       setOnlineUsers(newState)
     })
     .on('presence', { event: 'join' }, ({ key, newPresences }) => {
       setOnlineUsers(prev => [...prev, ...newPresences])
     })
     .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
       setOnlineUsers(prev => prev.filter(user => !leftPresences.includes(user)))
     })
     .subscribe()

5. Broadcast messages:
   channel.send('broadcast', {
     type: 'dose_reminder',
     patient_id: patientId,
     message: 'Time for medication!'
   })

SECURITY NOTES:
- All real-time subscriptions respect RLS policies
- Users can only subscribe to data they have access to
- Presence information is limited to caregivers of shared patients
- Broadcast messages follow the same security model
*/ 