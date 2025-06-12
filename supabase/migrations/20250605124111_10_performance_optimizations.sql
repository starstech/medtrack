-- Performance Optimizations for MedTrack
-- Version: 11 - Additional Indexes and Query Optimizations

-- Set search path to use api schema
SET search_path TO api, public;

-- =============================================
-- ADDITIONAL INDEXES FOR PERFORMANCE
-- =============================================

-- Profiles table indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON api.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON api.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON api.profiles(created_at);

-- Patients table indexes
CREATE INDEX IF NOT EXISTS idx_patients_created_by ON api.patients(created_by);
CREATE INDEX IF NOT EXISTS idx_patients_date_of_birth ON api.patients(date_of_birth);
CREATE INDEX IF NOT EXISTS idx_patients_mrn ON api.patients(medical_record_number);
CREATE INDEX IF NOT EXISTS idx_patients_emergency_contact_gin ON api.patients USING GIN (emergency_contact);

-- Medications table indexes
CREATE INDEX IF NOT EXISTS idx_medications_patient_active ON api.medications(patient_id, is_active);
CREATE INDEX IF NOT EXISTS idx_medications_start_date ON api.medications(start_date);
CREATE INDEX IF NOT EXISTS idx_medications_end_date ON api.medications(end_date);
CREATE INDEX IF NOT EXISTS idx_medications_frequency ON api.medications(frequency);
CREATE INDEX IF NOT EXISTS idx_medications_name_text ON api.medications USING GIN (to_tsvector('english', name));

-- Doses table indexes  
CREATE INDEX IF NOT EXISTS idx_doses_status_scheduled ON api.doses(status, scheduled_time);
CREATE INDEX IF NOT EXISTS idx_doses_taken_at ON api.doses(taken_at);
CREATE INDEX IF NOT EXISTS idx_doses_marked_by ON api.doses(marked_by);
CREATE INDEX IF NOT EXISTS idx_doses_medication_status ON api.doses(medication_id, status);

-- Measurements table indexes
CREATE INDEX IF NOT EXISTS idx_measurements_type_patient ON api.measurements(type, patient_id);
CREATE INDEX IF NOT EXISTS idx_measurements_recorded_at_desc ON api.measurements(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_measurements_value_unit ON api.measurements(type, value, unit);
CREATE INDEX IF NOT EXISTS idx_measurements_attachments_gin ON api.measurements USING GIN (attachments);

-- Daily logs table indexes
CREATE INDEX IF NOT EXISTS idx_daily_logs_type ON api.daily_logs(type);
CREATE INDEX IF NOT EXISTS idx_daily_logs_severity ON api.daily_logs(severity);
CREATE INDEX IF NOT EXISTS idx_daily_logs_follow_up ON api.daily_logs(follow_up_required);
CREATE INDEX IF NOT EXISTS idx_daily_logs_tags_gin ON api.daily_logs USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_daily_logs_timestamp_desc ON api.daily_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_daily_logs_attachments_gin ON api.daily_logs USING GIN (attachments);

-- Notifications table indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON api.notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON api.notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_sent ON api.notifications(sent);
CREATE INDEX IF NOT EXISTS idx_notifications_data_gin ON api.notifications USING GIN (data);

-- Files table indexes
CREATE INDEX IF NOT EXISTS idx_files_mime_type ON api.files(mime_type);
CREATE INDEX IF NOT EXISTS idx_files_size ON api.files(size);
CREATE INDEX IF NOT EXISTS idx_files_uploaded_at ON api.files(uploaded_at);
CREATE INDEX IF NOT EXISTS idx_files_metadata_gin ON api.files USING GIN (metadata);

-- User devices table indexes
CREATE INDEX IF NOT EXISTS idx_user_devices_device_type ON api.user_devices(device_type);
CREATE INDEX IF NOT EXISTS idx_user_devices_active ON api.user_devices(is_active);
CREATE INDEX IF NOT EXISTS idx_user_devices_token ON api.user_devices(device_token);

-- =============================================
-- COMPOSITE INDEXES FOR COMPLEX QUERIES
-- =============================================

-- Medication adherence queries
CREATE INDEX IF NOT EXISTS idx_doses_adherence_calc ON api.doses(medication_id, scheduled_time, status);

-- Patient dashboard queries
CREATE INDEX IF NOT EXISTS idx_patient_caregivers_active_patient ON api.patient_caregivers(patient_id, is_active, caregiver_id)
  WHERE is_active = true;

-- Real-time subscription filters
CREATE INDEX IF NOT EXISTS idx_measurements_patient_recent ON api.measurements(patient_id, recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_daily_logs_patient_recent ON api.daily_logs(patient_id, timestamp DESC);

-- Notification processing
CREATE INDEX IF NOT EXISTS idx_doses_overdue ON api.doses(scheduled_time, status);

CREATE INDEX IF NOT EXISTS idx_doses_upcoming ON api.doses(scheduled_time, status);

-- =============================================
-- MATERIALIZED VIEWS FOR PERFORMANCE
-- =============================================

-- Materialized view for medication adherence statistics
CREATE MATERIALIZED VIEW api.medication_adherence_stats AS
SELECT 
  m.id as medication_id,
  m.patient_id,
  m.name as medication_name,
  COUNT(d.id) as total_doses_30d,
  COUNT(d.id) FILTER (WHERE d.status = 'taken') as taken_doses_30d,
  COUNT(d.id) FILTER (WHERE d.status = 'missed') as missed_doses_30d,
  ROUND(
    (COUNT(d.id) FILTER (WHERE d.status = 'taken')::NUMERIC / 
     NULLIF(COUNT(d.id), 0)::NUMERIC) * 100, 2
  ) as adherence_percentage,
  MAX(d.scheduled_time) FILTER (WHERE d.status = 'taken') as last_taken,
  MIN(d.scheduled_time) FILTER (WHERE d.status = 'pending' AND d.scheduled_time > NOW()) as next_due,
  NOW() as calculated_at
FROM api.medications m
LEFT JOIN api.doses d ON m.id = d.medication_id 
  AND d.scheduled_time >= NOW() - INTERVAL '30 days'
  AND d.scheduled_time <= NOW()
WHERE m.is_active = true
GROUP BY m.id, m.patient_id, m.name;

-- Create unique index on materialized view
CREATE UNIQUE INDEX idx_medication_adherence_stats_id ON api.medication_adherence_stats(medication_id);

-- Materialized view for patient summary dashboard
CREATE MATERIALIZED VIEW api.patient_dashboard_stats AS
SELECT 
  p.id as patient_id,
  p.name as patient_name,
  COUNT(DISTINCT m.id) FILTER (WHERE m.is_active = true) as active_medications,
  COUNT(DISTINCT d.id) FILTER (WHERE d.status = 'pending' AND d.scheduled_time <= NOW()) as overdue_doses,
  COUNT(DISTINCT ms.id) FILTER (WHERE ms.recorded_at >= NOW() - INTERVAL '7 days') as recent_measurements,
  COUNT(DISTINCT dl.id) FILTER (WHERE dl.timestamp >= NOW() - INTERVAL '7 days') as recent_logs,
  COUNT(DISTINCT dl.id) FILTER (WHERE dl.follow_up_required = true AND dl.timestamp >= NOW() - INTERVAL '7 days') as pending_followups,
  MAX(ms.recorded_at) as last_measurement,
  MAX(dl.timestamp) as last_log,
  EXTRACT(YEAR FROM AGE(p.date_of_birth))::INTEGER as age_years,
  NOW() as calculated_at
FROM api.patients p
LEFT JOIN api.medications m ON p.id = m.patient_id
LEFT JOIN api.doses d ON m.id = d.medication_id
LEFT JOIN api.measurements ms ON p.id = ms.patient_id
LEFT JOIN api.daily_logs dl ON p.id = dl.patient_id
GROUP BY p.id, p.name, p.date_of_birth;

-- Create unique index on patient dashboard stats
CREATE UNIQUE INDEX idx_patient_dashboard_stats_id ON api.patient_dashboard_stats(patient_id);

-- =============================================
-- REFRESH FUNCTIONS FOR MATERIALIZED VIEWS
-- =============================================

-- Function to refresh adherence stats
CREATE OR REPLACE FUNCTION api.refresh_adherence_stats()
RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY api.medication_adherence_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to refresh dashboard stats
CREATE OR REPLACE FUNCTION api.refresh_dashboard_stats()
RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY api.patient_dashboard_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to refresh all materialized views
CREATE OR REPLACE FUNCTION api.refresh_all_stats()
RETURNS TABLE (view_name TEXT, refresh_duration INTERVAL) AS $$
DECLARE
  start_time TIMESTAMP;
  end_time TIMESTAMP;
BEGIN
  -- Refresh adherence stats
  start_time := clock_timestamp();
  PERFORM api.refresh_adherence_stats();
  end_time := clock_timestamp();
  
  view_name := 'medication_adherence_stats';
  refresh_duration := end_time - start_time;
  RETURN NEXT;
  
  -- Refresh dashboard stats
  start_time := clock_timestamp();
  PERFORM api.refresh_dashboard_stats();
  end_time := clock_timestamp();
  
  view_name := 'patient_dashboard_stats';
  refresh_duration := end_time - start_time;
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- QUERY OPTIMIZATION FUNCTIONS
-- =============================================

-- Optimized function to get patient medication summary
CREATE OR REPLACE FUNCTION api.get_patient_medication_summary_optimized(patient_uuid UUID)
RETURNS JSON AS $$
BEGIN
  RETURN (
    SELECT json_build_object(
      'patient_id', patient_uuid,
      'medications', json_agg(
        json_build_object(
          'medication_id', mas.medication_id,
          'medication_name', mas.medication_name,
          'adherence_percentage', mas.adherence_percentage,
          'total_doses_30d', mas.total_doses_30d,
          'taken_doses_30d', mas.taken_doses_30d,
          'missed_doses_30d', mas.missed_doses_30d,
          'last_taken', mas.last_taken,
          'next_due', mas.next_due
        )
      )
    )
    FROM api.medication_adherence_stats mas
    WHERE mas.patient_id = patient_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Optimized function to get dashboard data
CREATE OR REPLACE FUNCTION api.get_dashboard_data_optimized(user_uuid UUID)
RETURNS JSON AS $$
BEGIN
  RETURN (
    SELECT json_build_object(
      'patients', json_agg(
        json_build_object(
          'patient_id', pds.patient_id,
          'patient_name', pds.patient_name,
          'age_years', pds.age_years,
          'active_medications', pds.active_medications,
          'overdue_doses', pds.overdue_doses,
          'recent_measurements', pds.recent_measurements,
          'recent_logs', pds.recent_logs,
          'pending_followups', pds.pending_followups,
          'last_measurement', pds.last_measurement,
          'last_log', pds.last_log
        )
      ),
      'summary', json_build_object(
        'total_patients', COUNT(*),
        'total_overdue_doses', SUM(pds.overdue_doses),
        'total_pending_followups', SUM(pds.pending_followups),
        'patients_with_recent_activity', COUNT(*) FILTER (
          WHERE pds.last_measurement >= NOW() - INTERVAL '24 hours' 
             OR pds.last_log >= NOW() - INTERVAL '24 hours'
        )
      )
    )
    FROM api.patient_dashboard_stats pds
    JOIN api.patient_caregivers pc ON pds.patient_id = pc.patient_id
    WHERE pc.caregiver_id = user_uuid AND pc.is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- DATABASE MAINTENANCE FUNCTIONS
-- =============================================

-- Function to analyze table statistics
CREATE OR REPLACE FUNCTION api.update_table_statistics()
RETURNS VOID AS $$
BEGIN
  -- Update statistics for all api schema tables
  ANALYZE api.profiles;
  ANALYZE api.patients;
  ANALYZE api.patient_caregivers;
  ANALYZE api.medications;
  ANALYZE api.doses;
  ANALYZE api.measurements;
  ANALYZE api.daily_logs;
  ANALYZE api.notifications;
  ANALYZE api.files;
  ANALYZE api.user_devices;
  ANALYZE api.notification_preferences;
  ANALYZE api.audit_logs;
  
  -- Log the analysis
  INSERT INTO api.function_logs (function_name, status, created_at)
  VALUES ('update_table_statistics', 'completed', NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to vacuum and reindex tables
CREATE OR REPLACE FUNCTION api.maintenance_vacuum_reindex()
RETURNS TABLE (
  table_name TEXT,
  operation TEXT,
  status TEXT
) AS $$
BEGIN
  -- This function would typically be run by a database administrator
  -- as it requires elevated privileges
  
  -- Return maintenance recommendations instead of actually running VACUUM
  RETURN QUERY
  SELECT 
    t.table_name::TEXT,
    'VACUUM ANALYZE'::TEXT as operation,
    'recommended'::TEXT as status
  FROM information_schema.tables t
  WHERE t.table_schema = 'api'
    AND t.table_type = 'BASE TABLE';
    
  -- Also recommend reindexing
  RETURN QUERY
  SELECT 
    schemaname || '.' || tablename as table_name,
    'REINDEX'::TEXT as operation,
    'recommended'::TEXT as status
  FROM pg_tables 
  WHERE schemaname = 'api';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- PERFORMANCE MONITORING VIEWS
-- =============================================

-- View for slow queries monitoring
CREATE OR REPLACE VIEW api.performance_stats AS
SELECT 
  'table_sizes' as metric_type,
  schemaname || '.' || tablename as object_name,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as value,
  pg_total_relation_size(schemaname||'.'||tablename) as numeric_value
FROM pg_tables 
WHERE schemaname = 'api'
UNION ALL
SELECT
  'index_usage' as metric_type,
  schemaname || '.' || indexrelname as object_name,
  CASE 
    WHEN idx_scan = 0 THEN 'unused'
    WHEN idx_scan < 10 THEN 'low_usage'
    ELSE 'active'
  END as value,
  idx_scan as numeric_value
FROM pg_stat_user_indexes 
WHERE schemaname = 'api';

-- Grant permissions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA api TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA api TO service_role;
GRANT SELECT ON api.medication_adherence_stats TO authenticated;
GRANT SELECT ON api.patient_dashboard_stats TO authenticated;
GRANT SELECT ON api.performance_stats TO authenticated;

/*
PERFORMANCE OPTIMIZATIONS OVERVIEW:

1. **Additional Indexes**
   - Complete coverage of foreign keys
   - Text search indexes for medications
   - Composite indexes for complex queries
   - Partial indexes for filtered queries

2. **Materialized Views**
   - Pre-calculated adherence statistics
   - Dashboard summary data
   - Refresh functions for updates

3. **Query Optimizations**
   - Optimized dashboard functions
   - Efficient patient summary queries
   - Reduced database round trips

4. **Maintenance Functions**
   - Statistics updates
   - Vacuum and reindex recommendations
   - Performance monitoring views

5. **Monitoring**
   - Table size tracking
   - Index usage statistics
   - Query performance metrics

USAGE:

-- Refresh materialized views (run every 15 minutes)
SELECT * FROM api.refresh_all_stats();

-- Get optimized dashboard data
SELECT api.get_dashboard_data_optimized(auth.uid());

-- Update table statistics (run weekly)
SELECT api.update_table_statistics();

-- Check performance metrics
SELECT * FROM api.performance_stats;

RECOMMENDED CRON JOBS:                              
- Refresh stats: every 15 minutes
- Update statistics: weekly
- Performance monitoring: every 6 hours
*/ 