-- Measurement Preferences Schema for MedTrack
-- Version: 12 - Patient-Specific Measurement Preferences

-- Set search path to use api schema
SET search_path TO api, public;

-- =============================================
-- MEASUREMENT PREFERENCES TABLE
-- =============================================

-- Table to store patient-specific measurement preferences
CREATE TABLE api.measurement_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES api.patients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES api.profiles(id) ON DELETE CASCADE,
  
  -- Category-level preferences
  vital_signs_enabled BOOLEAN DEFAULT TRUE,
  physical_measurements_enabled BOOLEAN DEFAULT TRUE,
  subjective_measurements_enabled BOOLEAN DEFAULT TRUE,
  
  -- Individual measurement preferences (JSON for flexibility)
  enabled_measurements JSONB DEFAULT '{
    "vital_signs": {
      "blood_pressure": true,
      "heart_rate": true,
      "temperature": true,
      "respiratory_rate": true,
      "oxygen_saturation": true
    },
    "physical": {
      "height": true,
      "weight": true,
      "bmi": true,
      "head_circumference": true
    },
    "subjective": {
      "pain_level": true,
      "mood": true,
      "energy_level": true,
      "sleep_quality": true,
      "appetite": true
    }
  }'::jsonb,
  
  -- Preset information
  preset_name TEXT, -- 'basic_care', 'diabetes_management', 'heart_health', 'pediatric_care', 'post_surgery', 'comprehensive', 'custom'
  is_custom BOOLEAN DEFAULT FALSE,
  
  -- Audit fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES api.profiles(id),
  
  -- Constraints
  UNIQUE(patient_id, user_id) -- One preference set per patient per user
);

-- Enable RLS
ALTER TABLE api.measurement_preferences ENABLE ROW LEVEL SECURITY;

-- =============================================
-- MEASUREMENT PRESETS REFERENCE TABLE
-- =============================================

-- Table to store preset configurations
CREATE TABLE api.measurement_presets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  category_settings JSONB NOT NULL,
  measurement_settings JSONB NOT NULL,
  target_condition TEXT, -- 'general', 'diabetes', 'heart_health', 'pediatric', 'post_surgery'
  is_default BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default presets
INSERT INTO api.measurement_presets (name, display_name, description, category_settings, measurement_settings, target_condition, is_default, sort_order) VALUES
(
  'comprehensive',
  'Comprehensive',
  'Track all available measurements for complete health monitoring',
  '{"vital_signs": true, "physical": true, "subjective": true}',
  '{
    "vital_signs": {
      "blood_pressure": true,
      "heart_rate": true,
      "temperature": true,
      "respiratory_rate": true,
      "oxygen_saturation": true
    },
    "physical": {
      "height": true,
      "weight": true,
      "bmi": true,
      "head_circumference": true
    },
    "subjective": {
      "pain_level": true,
      "mood": true,
      "energy_level": true,
      "sleep_quality": true,
      "appetite": true
    }
  }',
  'general',
  TRUE,
  0
),
(
  'basic_care',
  'Basic Care',
  'Essential measurements for routine health monitoring',
  '{"vital_signs": true, "physical": true, "subjective": true}',
  '{
    "vital_signs": {
      "blood_pressure": true,
      "heart_rate": true,
      "temperature": true,
      "respiratory_rate": false,
      "oxygen_saturation": false
    },
    "physical": {
      "height": false,
      "weight": true,
      "bmi": false,
      "head_circumference": false
    },
    "subjective": {
      "pain_level": true,
      "mood": false,
      "energy_level": false,
      "sleep_quality": false,
      "appetite": false
    }
  }',
  'general',
  FALSE,
  1
),
(
  'diabetes_management',
  'Diabetes Management',
  'Comprehensive monitoring for diabetes care including mood and energy tracking',
  '{"vital_signs": true, "physical": true, "subjective": true}',
  '{
    "vital_signs": {
      "blood_pressure": true,
      "heart_rate": true,
      "temperature": true,
      "respiratory_rate": false,
      "oxygen_saturation": false
    },
    "physical": {
      "height": false,
      "weight": true,
      "bmi": true,
      "head_circumference": false
    },
    "subjective": {
      "pain_level": false,
      "mood": true,
      "energy_level": true,
      "sleep_quality": true,
      "appetite": true
    }
  }',
  'diabetes',
  FALSE,
  2
),
(
  'heart_health',
  'Heart Health',
  'Focused monitoring for cardiovascular health management',
  '{"vital_signs": true, "physical": true, "subjective": true}',
  '{
    "vital_signs": {
      "blood_pressure": true,
      "heart_rate": true,
      "temperature": false,
      "respiratory_rate": false,
      "oxygen_saturation": true
    },
    "physical": {
      "height": false,
      "weight": true,
      "bmi": false,
      "head_circumference": false
    },
    "subjective": {
      "pain_level": false,
      "mood": false,
      "energy_level": true,
      "sleep_quality": false,
      "appetite": false
    }
  }',
  'heart_health',
  FALSE,
  3
),
(
  'pediatric_care',
  'Pediatric Care',
  'Age-appropriate measurements for children and infants',
  '{"vital_signs": true, "physical": true, "subjective": true}',
  '{
    "vital_signs": {
      "blood_pressure": false,
      "heart_rate": true,
      "temperature": true,
      "respiratory_rate": true,
      "oxygen_saturation": false
    },
    "physical": {
      "height": true,
      "weight": true,
      "bmi": false,
      "head_circumference": true
    },
    "subjective": {
      "pain_level": false,
      "mood": true,
      "energy_level": false,
      "sleep_quality": true,
      "appetite": true
    }
  }',
  'pediatric',
  FALSE,
  4
),
(
  'post_surgery',
  'Post-Surgery Recovery',
  'Recovery monitoring with focus on pain and vital signs',
  '{"vital_signs": true, "physical": false, "subjective": true}',
  '{
    "vital_signs": {
      "blood_pressure": true,
      "heart_rate": true,
      "temperature": true,
      "respiratory_rate": false,
      "oxygen_saturation": false
    },
    "physical": {
      "height": false,
      "weight": false,
      "bmi": false,
      "head_circumference": false
    },
    "subjective": {
      "pain_level": true,
      "mood": true,
      "energy_level": false,
      "sleep_quality": false,
      "appetite": true
    }
  }',
  'post_surgery',
  FALSE,
  5
);

-- =============================================
-- FUNCTIONS FOR MEASUREMENT PREFERENCES
-- =============================================

-- Function to get or create default preferences for a patient
CREATE OR REPLACE FUNCTION api.get_or_create_measurement_preferences(patient_uuid UUID, user_uuid UUID)
RETURNS api.measurement_preferences AS $$
DECLARE
  preferences_record api.measurement_preferences;
  default_preset api.measurement_presets;
BEGIN
  -- Try to get existing preferences
  SELECT * INTO preferences_record
  FROM api.measurement_preferences
  WHERE patient_id = patient_uuid AND user_id = user_uuid;
  
  -- If no preferences exist, create defaults
  IF NOT FOUND THEN
    -- Get default preset
    SELECT * INTO default_preset
    FROM api.measurement_presets
    WHERE is_default = TRUE
    ORDER BY sort_order
    LIMIT 1;
    
    -- Create default preferences
    INSERT INTO api.measurement_preferences (
      patient_id,
      user_id,
      vital_signs_enabled,
      physical_measurements_enabled,
      subjective_measurements_enabled,
      enabled_measurements,
      preset_name,
      is_custom,
      created_by
    ) VALUES (
      patient_uuid,
      user_uuid,
      (default_preset.category_settings->>'vital_signs')::boolean,
      (default_preset.category_settings->>'physical')::boolean,
      (default_preset.category_settings->>'subjective')::boolean,
      default_preset.measurement_settings,
      default_preset.name,
      FALSE,
      user_uuid
    ) RETURNING * INTO preferences_record;
  END IF;
  
  RETURN preferences_record;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if a measurement type is enabled
CREATE OR REPLACE FUNCTION api.is_measurement_enabled(
  patient_uuid UUID,
  user_uuid UUID,
  measurement_category TEXT,
  measurement_type TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  preferences_record api.measurement_preferences;
  category_enabled BOOLEAN;
  measurement_enabled BOOLEAN;
BEGIN
  -- Get preferences
  SELECT * INTO preferences_record
  FROM api.get_or_create_measurement_preferences(patient_uuid, user_uuid);
  
  -- Check category level
  CASE measurement_category
    WHEN 'vital_signs' THEN
      category_enabled := preferences_record.vital_signs_enabled;
    WHEN 'physical' THEN
      category_enabled := preferences_record.physical_measurements_enabled;
    WHEN 'subjective' THEN
      category_enabled := preferences_record.subjective_measurements_enabled;
    ELSE
      category_enabled := FALSE;
  END CASE;
  
  -- If category is disabled, measurement is disabled
  IF NOT category_enabled THEN
    RETURN FALSE;
  END IF;
  
  -- Check individual measurement
  measurement_enabled := COALESCE(
    (preferences_record.enabled_measurements->measurement_category->>measurement_type)::boolean,
    FALSE
  );
  
  RETURN measurement_enabled;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to apply a preset to patient preferences
CREATE OR REPLACE FUNCTION api.apply_measurement_preset(
  patient_uuid UUID,
  user_uuid UUID,
  preset_name_param TEXT
)
RETURNS api.measurement_preferences AS $$
DECLARE
  preset_record api.measurement_presets;
  preferences_record api.measurement_preferences;
BEGIN
  -- Get the preset
  SELECT * INTO preset_record
  FROM api.measurement_presets
  WHERE name = preset_name_param;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Preset not found: %', preset_name_param;
  END IF;
  
  -- Update or create preferences
  INSERT INTO api.measurement_preferences (
    patient_id,
    user_id,
    vital_signs_enabled,
    physical_measurements_enabled,
    subjective_measurements_enabled,
    enabled_measurements,
    preset_name,
    is_custom,
    created_by,
    updated_at
  ) VALUES (
    patient_uuid,
    user_uuid,
    (preset_record.category_settings->>'vital_signs')::boolean,
    (preset_record.category_settings->>'physical')::boolean,
    (preset_record.category_settings->>'subjective')::boolean,
    preset_record.measurement_settings,
    preset_record.name,
    FALSE,
    user_uuid,
    NOW()
  )
  ON CONFLICT (patient_id, user_id)
  DO UPDATE SET
    vital_signs_enabled = (preset_record.category_settings->>'vital_signs')::boolean,
    physical_measurements_enabled = (preset_record.category_settings->>'physical')::boolean,
    subjective_measurements_enabled = (preset_record.category_settings->>'subjective')::boolean,
    enabled_measurements = preset_record.measurement_settings,
    preset_name = preset_record.name,
    is_custom = FALSE,
    updated_at = NOW()
  RETURNING * INTO preferences_record;
  
  RETURN preferences_record;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- INDEXES AND CONSTRAINTS
-- =============================================

-- Indexes for performance
CREATE INDEX idx_measurement_preferences_patient_id ON api.measurement_preferences(patient_id);
CREATE INDEX idx_measurement_preferences_user_id ON api.measurement_preferences(user_id);
CREATE INDEX idx_measurement_preferences_patient_user ON api.measurement_preferences(patient_id, user_id);
CREATE INDEX idx_measurement_presets_target_condition ON api.measurement_presets(target_condition);
CREATE INDEX idx_measurement_presets_sort_order ON api.measurement_presets(sort_order);

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Users can only access their own measurement preferences
CREATE POLICY "Users can access own measurement preferences" ON api.measurement_preferences
  FOR ALL USING (
    user_id = auth.uid() OR
    -- Allow access if user is a caregiver for this patient
    EXISTS (
      SELECT 1 FROM api.patient_caregivers pc
      WHERE pc.patient_id = measurement_preferences.patient_id
        AND pc.caregiver_id = auth.uid()
        AND pc.is_active = true
    )
  );

-- Measurement presets are readable by all authenticated users
CREATE POLICY "Authenticated users can read presets" ON api.measurement_presets
  FOR SELECT USING (auth.role() = 'authenticated');

-- =============================================
-- TRIGGERS
-- =============================================

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION api.update_measurement_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_measurement_preferences_updated_at
  BEFORE UPDATE ON api.measurement_preferences
  FOR EACH ROW
  EXECUTE FUNCTION api.update_measurement_preferences_updated_at();

-- Grant permissions
GRANT ALL ON api.measurement_preferences TO authenticated;
GRANT SELECT ON api.measurement_presets TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA api TO authenticated;

/*
MEASUREMENT PREFERENCES SCHEMA OVERVIEW:

1. **measurement_preferences table**
   - Patient-specific preferences per user
   - Category-level and individual measurement toggles
   - Preset tracking and custom configurations
   - Full audit trail

2. **measurement_presets table**
   - Predefined measurement configurations
   - Medical condition-specific presets
   - Easy application and reuse

3. **Helper Functions**
   - get_or_create_measurement_preferences()
   - is_measurement_enabled()
   - apply_measurement_preset()

4. **Security**
   - RLS policies for data isolation
   - Caregiver access for shared patients
   - Audit logging integration

5. **Performance**
   - Optimized indexes for common queries
   - Efficient JSON operations
   - Fast preference lookups

USAGE EXAMPLES:

-- Get preferences for a patient
SELECT * FROM api.get_or_create_measurement_preferences('patient-id', 'user-id');

-- Check if blood pressure is enabled
SELECT api.is_measurement_enabled('patient-id', 'user-id', 'vital_signs', 'blood_pressure');

-- Apply diabetes preset
SELECT * FROM api.apply_measurement_preset('patient-id', 'user-id', 'diabetes_management');

-- Get all available presets
SELECT * FROM api.measurement_presets ORDER BY sort_order;
*/ 