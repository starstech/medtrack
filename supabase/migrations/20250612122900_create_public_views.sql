-- Create views in public schema to expose api schema tables
-- This allows PostgREST to access our api schema tables

-- Create views for all main tables
CREATE VIEW public.profiles AS SELECT * FROM api.profiles;
CREATE VIEW public.patients AS SELECT * FROM api.patients;
CREATE VIEW public.patient_caregivers AS SELECT * FROM api.patient_caregivers;
CREATE VIEW public.medications AS SELECT * FROM api.medications;
CREATE VIEW public.doses AS SELECT * FROM api.doses;
CREATE VIEW public.measurements AS SELECT * FROM api.measurements;
CREATE VIEW public.daily_logs AS SELECT * FROM api.daily_logs;
CREATE VIEW public.files AS SELECT * FROM api.files;
CREATE VIEW public.notifications AS SELECT * FROM api.notifications;
CREATE VIEW public.user_devices AS SELECT * FROM api.user_devices;
CREATE VIEW public.notification_preferences AS SELECT * FROM api.notification_preferences;

-- Enable RLS on views (inherits from underlying tables)
ALTER VIEW public.profiles SET (security_invoker = true);
ALTER VIEW public.patients SET (security_invoker = true);
ALTER VIEW public.patient_caregivers SET (security_invoker = true);
ALTER VIEW public.medications SET (security_invoker = true);
ALTER VIEW public.doses SET (security_invoker = true);
ALTER VIEW public.measurements SET (security_invoker = true);
ALTER VIEW public.daily_logs SET (security_invoker = true);
ALTER VIEW public.files SET (security_invoker = true);
ALTER VIEW public.notifications SET (security_invoker = true);
ALTER VIEW public.user_devices SET (security_invoker = true);
ALTER VIEW public.notification_preferences SET (security_invoker = true);

-- Grant permissions to authenticated and anon roles
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.patients TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.patient_caregivers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.medications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.doses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.measurements TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.files TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_devices TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_preferences TO authenticated;

-- Grant limited permissions to anon role (for signup/login flows)
GRANT SELECT ON public.profiles TO anon;
GRANT INSERT ON public.profiles TO anon; 