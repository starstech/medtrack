-- Edge Functions Support Setup for MedTrack
-- Version: 08 - Edge Functions Database Support

-- Set search path to use api schema
SET search_path TO api, public;

-- =============================================
-- EDGE FUNCTION SUPPORT TABLES
-- =============================================

-- Table to queue tasks for edge functions
CREATE TABLE api.function_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  function_name TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'retry')),
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table to track edge function execution logs
CREATE TABLE api.function_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  function_name TEXT NOT NULL,
  execution_id TEXT,
  status TEXT NOT NULL,
  duration_ms INTEGER,
  memory_used_mb NUMERIC,
  payload JSONB,
  response JSONB,
  error_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for function tables (admin access only)
ALTER TABLE api.function_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE api.function_logs ENABLE ROW LEVEL SECURITY;

-- Only allow service role access to function tables
CREATE POLICY "Service role only access" ON api.function_queue
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role only access" ON api.function_logs
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Indexes for performance
CREATE INDEX idx_function_queue_status ON api.function_queue(status);
CREATE INDEX idx_function_queue_scheduled ON api.function_queue(scheduled_for);
CREATE INDEX idx_function_queue_function ON api.function_queue(function_name);
CREATE INDEX idx_function_logs_function ON api.function_logs(function_name);
CREATE INDEX idx_function_logs_created ON api.function_logs(created_at);

-- =============================================
-- WEBHOOK MANAGEMENT
-- =============================================

-- Table to manage webhook endpoints
CREATE TABLE api.webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  secret TEXT NOT NULL,
  events TEXT[] NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  headers JSONB DEFAULT '{}',
  retry_config JSONB DEFAULT '{"max_attempts": 3, "backoff_seconds": [1, 5, 15]}',
  created_by UUID REFERENCES api.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table to track webhook deliveries
CREATE TABLE api.webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID REFERENCES api.webhooks(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  response_status INTEGER,
  response_body TEXT,
  attempt_number INTEGER DEFAULT 1,
  delivered_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for webhook tables
ALTER TABLE api.webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE api.webhook_deliveries ENABLE ROW LEVEL SECURITY;

-- Webhook policies (admin access)
CREATE POLICY "Admins can manage webhooks" ON api.webhooks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM api.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view webhook deliveries" ON api.webhook_deliveries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM api.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =============================================
-- SCHEDULED JOBS SUPPORT
-- =============================================

-- Table to manage scheduled jobs
CREATE TABLE api.scheduled_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  function_name TEXT NOT NULL,
  cron_expression TEXT NOT NULL,
  payload JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  last_run TIMESTAMP WITH TIME ZONE,
  next_run TIMESTAMP WITH TIME ZONE,
  run_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for scheduled jobs
ALTER TABLE api.scheduled_jobs ENABLE ROW LEVEL SECURITY;

-- Only service role can manage scheduled jobs
CREATE POLICY "Service role only for scheduled jobs" ON api.scheduled_jobs
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- =============================================
-- EDGE FUNCTION HELPER FUNCTIONS
-- =============================================

-- Function to queue a task for edge function processing
CREATE OR REPLACE FUNCTION api.queue_function_task(
  function_name TEXT,
  task_payload JSONB,
  delay_seconds INTEGER DEFAULT 0
)
RETURNS UUID AS $$
DECLARE
  task_id UUID;
BEGIN
  INSERT INTO api.function_queue (function_name, payload, scheduled_for)
  VALUES (function_name, task_payload, NOW() + (delay_seconds || ' seconds')::INTERVAL)
  RETURNING id INTO task_id;
  
  RETURN task_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get pending tasks for an edge function
CREATE OR REPLACE FUNCTION api.get_pending_tasks(
  function_name TEXT,
  limit_count INTEGER DEFAULT 10
)
RETURNS SETOF api.function_queue AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM api.function_queue
  WHERE function_queue.function_name = get_pending_tasks.function_name
    AND status = 'pending'
    AND scheduled_for <= NOW()
  ORDER BY scheduled_for ASC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark task as processing
CREATE OR REPLACE FUNCTION api.mark_task_processing(task_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE api.function_queue
  SET status = 'processing', updated_at = NOW()
  WHERE id = task_id AND status = 'pending';
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark task as completed
CREATE OR REPLACE FUNCTION api.complete_task(
  task_id UUID,
  success BOOLEAN,
  error_msg TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  IF success THEN
    UPDATE api.function_queue
    SET status = 'completed', processed_at = NOW(), updated_at = NOW()
    WHERE id = task_id;
  ELSE
    UPDATE api.function_queue
    SET 
      status = CASE 
        WHEN attempts + 1 >= max_attempts THEN 'failed'
        ELSE 'retry'
      END,
      attempts = attempts + 1,
      error_message = error_msg,
      scheduled_for = CASE
        WHEN attempts + 1 < max_attempts THEN NOW() + ((attempts + 1) * INTERVAL '5 minutes')
        ELSE scheduled_for
      END,
      updated_at = NOW()
    WHERE id = task_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- MEDICAL ALERT FUNCTIONS
-- =============================================

-- Function to queue urgent medical alerts
CREATE OR REPLACE FUNCTION api.queue_medical_alert(
  patient_id UUID,
  alert_type TEXT,
  severity TEXT,
  message TEXT,
  data JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  task_id UUID;
  alert_payload JSONB;
BEGIN
  -- Build alert payload
  alert_payload := json_build_object(
    'patient_id', patient_id,
    'alert_type', alert_type,
    'severity', severity,
    'message', message,
    'data', data,
    'timestamp', NOW()
  );
  
  -- Queue for immediate processing
  SELECT api.queue_function_task('medical-alert-handler', alert_payload, 0) INTO task_id;
  
  RETURN task_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to queue medication adherence analysis
CREATE OR REPLACE FUNCTION api.queue_adherence_analysis(
  patient_id UUID,
  analysis_type TEXT DEFAULT 'weekly'
)
RETURNS UUID AS $$
DECLARE
  task_id UUID;
  analysis_payload JSONB;
BEGIN
  analysis_payload := json_build_object(
    'patient_id', patient_id,
    'analysis_type', analysis_type,
    'requested_at', NOW()
  );
  
  SELECT api.queue_function_task('adherence-analyzer', analysis_payload, 0) INTO task_id;
  
  RETURN task_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- NOTIFICATION PROCESSING FUNCTIONS
-- =============================================

-- Function to queue push notification
CREATE OR REPLACE FUNCTION api.queue_push_notification(
  user_id UUID,
  title TEXT,
  body TEXT,
  data JSONB DEFAULT '{}',
  priority TEXT DEFAULT 'normal'
)
RETURNS UUID AS $$
DECLARE
  task_id UUID;
  notification_payload JSONB;
BEGIN
  notification_payload := json_build_object(
    'user_id', user_id,
    'title', title,
    'body', body,
    'data', data,
    'priority', priority,
    'timestamp', NOW()
  );
  
  -- Queue with different delays based on priority
  SELECT api.queue_function_task(
    'push-notification-sender', 
    notification_payload, 
    CASE priority
      WHEN 'urgent' THEN 0
      WHEN 'high' THEN 5
      WHEN 'normal' THEN 30
      ELSE 60
    END
  ) INTO task_id;
  
  RETURN task_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- CLEANUP AND MAINTENANCE FUNCTIONS
-- =============================================

-- Function to cleanup old function queue entries
CREATE OR REPLACE FUNCTION api.cleanup_function_queue(days_old INTEGER DEFAULT 7)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM api.function_queue
  WHERE status IN ('completed', 'failed')
    AND updated_at < NOW() - (days_old || ' days')::INTERVAL;
    
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup old function logs
CREATE OR REPLACE FUNCTION api.cleanup_function_logs(days_old INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM api.function_logs
  WHERE created_at < NOW() - (days_old || ' days')::INTERVAL;
    
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- AUTOMATIC TASK QUEUEING TRIGGERS
-- =============================================

-- Trigger to queue adherence analysis when doses are updated
CREATE OR REPLACE FUNCTION api.trigger_adherence_analysis()
RETURNS TRIGGER AS $$
DECLARE
  patient_uuid UUID;
BEGIN
  -- Get patient ID for this dose
  SELECT m.patient_id INTO patient_uuid
  FROM api.medications m
  WHERE m.id = NEW.medication_id;
  
  -- Queue adherence analysis if dose was marked as taken or missed
  IF NEW.status IN ('taken', 'missed') AND (OLD.status IS NULL OR OLD.status = 'pending') THEN
    PERFORM api.queue_adherence_analysis(patient_uuid, 'dose_update');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER trigger_adherence_analysis
  AFTER UPDATE OF status ON api.doses
  FOR EACH ROW
  EXECUTE FUNCTION api.trigger_adherence_analysis();

-- Grant permissions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA api TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA api TO service_role;

/*
EDGE FUNCTIONS OVERVIEW:

This setup provides database support for several Edge Functions:

1. **medical-alert-handler**
   - Processes urgent medical alerts
   - Sends immediate notifications to caregivers
   - Integrates with external medical systems

2. **adherence-analyzer** 
   - Calculates medication adherence patterns
   - Generates weekly/monthly reports
   - Identifies concerning trends

3. **push-notification-sender**
   - Handles Firebase push notifications
   - Manages device tokens and delivery
   - Supports priority-based delivery

4. **scheduled-maintenance**
   - Runs cleanup tasks
   - Generates reports
   - Handles system maintenance

5. **webhook-processor**
   - Processes incoming webhooks
   - Handles third-party integrations
   - Manages external API communications

DEPLOYMENT NOTES:
- Edge Functions should be deployed with corresponding SQL setup
- Service role key required for function queue access
- Webhook secrets should be stored securely
- Monitor function logs for performance optimization

CRON JOBS TO SETUP:                                             
1. Medication reminders: every 15 minutes
2. Overdue dose checks: every 30 minutes  
3. Daily cleanup: daily at 2 AM
4. Weekly reports: Mondays at 9 AM
*/ 