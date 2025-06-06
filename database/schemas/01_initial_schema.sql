-- MedTrack Database Schema for Supabase
-- Schema: api (your dedicated schema)
-- Version: 01 - Initial Schema

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the api schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS api;

-- Set search path to use api schema by default
SET search_path TO api, public;

-- 1. Profiles table (extends auth.users)
CREATE TABLE api.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT DEFAULT 'caregiver' CHECK (role IN ('caregiver', 'admin', 'patient')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Patients table
CREATE TABLE api.patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  medical_record_number TEXT,
  emergency_contact JSONB,
  profile_image_url TEXT,
  created_by UUID REFERENCES api.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Patient-Caregiver relationships
CREATE TABLE api.patient_caregivers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES api.patients(id) ON DELETE CASCADE,
  caregiver_id UUID REFERENCES api.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'caregiver',
  permissions JSONB DEFAULT '{}',
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(patient_id, caregiver_id)
);

-- 4. Medications table
CREATE TABLE api.medications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES api.patients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  instructions TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES api.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Doses table
CREATE TABLE api.doses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  medication_id UUID REFERENCES api.medications(id) ON DELETE CASCADE,
  scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'taken', 'missed', 'skipped')),
  taken_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  marked_by UUID REFERENCES api.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Measurements table
CREATE TABLE api.measurements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES api.patients(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  value NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  notes TEXT,
  attachments JSONB DEFAULT '[]',
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  recorded_by UUID REFERENCES api.profiles(id) ON DELETE SET NULL
);

-- 7. Daily logs table
CREATE TABLE api.daily_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES api.patients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL,
  severity TEXT DEFAULT 'normal' CHECK (severity IN ('normal', 'moderate', 'severe')),
  tags TEXT[] DEFAULT '{}',
  attachments JSONB DEFAULT '[]',
  follow_up_required BOOLEAN DEFAULT FALSE,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  recorded_by UUID REFERENCES api.profiles(id) ON DELETE SET NULL
);

-- 8. Files table
CREATE TABLE api.files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  uploaded_by UUID REFERENCES api.profiles(id) ON DELETE SET NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Notifications table
CREATE TABLE api.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES api.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT FALSE,
  sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. User devices for push notifications
CREATE TABLE api.user_devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES api.profiles(id) ON DELETE CASCADE,
  device_token TEXT NOT NULL,
  device_type TEXT NOT NULL CHECK (device_type IN ('web', 'ios', 'android')),
  device_info JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, device_token)
);

-- 11. Notification preferences
CREATE TABLE api.notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES api.profiles(id) ON DELETE CASCADE UNIQUE,
  push_notifications BOOLEAN DEFAULT TRUE,
  email_notifications BOOLEAN DEFAULT FALSE,
  medication_reminders BOOLEAN DEFAULT TRUE,
  appointment_reminders BOOLEAN DEFAULT TRUE,
  caregiver_updates BOOLEAN DEFAULT TRUE,
  reminder_minutes INTEGER[] DEFAULT '{15,30,60}'
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION api.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON api.profiles FOR EACH ROW EXECUTE FUNCTION api.update_updated_at_column();
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON api.patients FOR EACH ROW EXECUTE FUNCTION api.update_updated_at_column();
CREATE TRIGGER update_medications_updated_at BEFORE UPDATE ON api.medications FOR EACH ROW EXECUTE FUNCTION api.update_updated_at_column();

-- Enable Row Level Security on all tables
ALTER TABLE api.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE api.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE api.patient_caregivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE api.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE api.doses ENABLE ROW LEVEL SECURITY;
ALTER TABLE api.measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE api.daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE api.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE api.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE api.user_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE api.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX idx_patient_caregivers_patient_id ON api.patient_caregivers(patient_id);
CREATE INDEX idx_patient_caregivers_caregiver_id ON api.patient_caregivers(caregiver_id);
CREATE INDEX idx_medications_patient_id ON api.medications(patient_id);
CREATE INDEX idx_doses_medication_id ON api.doses(medication_id);
CREATE INDEX idx_doses_scheduled_time ON api.doses(scheduled_time);
CREATE INDEX idx_measurements_patient_id ON api.measurements(patient_id);
CREATE INDEX idx_measurements_type ON api.measurements(type);
CREATE INDEX idx_daily_logs_patient_id ON api.daily_logs(patient_id);
CREATE INDEX idx_notifications_user_id ON api.notifications(user_id);
CREATE INDEX idx_notifications_read ON api.notifications(read);

-- Insert default notification preferences for new users
CREATE OR REPLACE FUNCTION api.create_profile_and_preferences()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile
  INSERT INTO api.profiles (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)));
  
  -- Create default notification preferences
  INSERT INTO api.notification_preferences (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION api.create_profile_and_preferences();

-- Grant permissions
GRANT USAGE ON SCHEMA api TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA api TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA api TO authenticated; 