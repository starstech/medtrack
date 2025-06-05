# Measurement Preferences Feature

## 📋 Overview

The Measurement Preferences feature allows users to customize which measurement categories and individual measurements are visible and available for tracking. This provides a personalized experience tailored to specific medical needs and conditions.

## 🎯 Key Features

### Medical Scenario Presets
- **Comprehensive** - All measurements enabled (default)
- **Basic Care** - Essential measurements for routine monitoring
- **Diabetes Management** - Focused on diabetes care with mood/energy tracking
- **Heart Health** - Cardiovascular-focused measurements
- **Pediatric Care** - Age-appropriate measurements for children
- **Post-Surgery Recovery** - Recovery monitoring with pain focus

### Custom Configuration
- Full manual control over all measurement categories
- Individual measurement type toggles
- Category-level enable/disable options
- Real-time UI updates based on preferences

### Smart Filtering
- Measurements hidden from entry forms when disabled
- Historical data preserved but filtered from display
- Re-enable options for previously disabled measurements
- Independent settings per caregiver for shared patients

## 🏗️ Architecture

### Database Schema

#### measurement_preferences Table
```sql
CREATE TABLE api.measurement_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES api.patients(id),
  user_id UUID NOT NULL REFERENCES api.profiles(id),
  
  -- Category-level preferences
  vital_signs_enabled BOOLEAN DEFAULT TRUE,
  physical_measurements_enabled BOOLEAN DEFAULT TRUE,
  subjective_measurements_enabled BOOLEAN DEFAULT TRUE,
  
  -- Individual measurement preferences (JSONB)
  enabled_measurements JSONB DEFAULT '{...}',
  
  -- Preset information
  preset_name TEXT,
  is_custom BOOLEAN DEFAULT FALSE,
  
  -- Audit fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES api.profiles(id),
  
  UNIQUE(patient_id, user_id)
);
```

#### measurement_presets Table
```sql
CREATE TABLE api.measurement_presets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  category_settings JSONB NOT NULL,
  measurement_settings JSONB NOT NULL,
  target_condition TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0
);
```

### API Service Layer

#### measurementPreferencesService.js
**REST API Integration using apiClient:**
- `getPreferences(patientId, userId)` - GET `/patients/{id}/measurement-preferences`
- `updatePreferences(patientId, preferences, userId)` - PUT `/patients/{id}/measurement-preferences`
- `getPresets()` - GET `/measurement-presets`
- `applyPreset(patientId, presetName, userId)` - POST `/patients/{id}/measurement-preferences/apply-preset`
- `isMeasurementEnabled(patientId, category, type, userId)` - GET `/patients/{id}/measurement-preferences/check`
- `getMeasurementAvailability(patientId, userId)` - GET `/patients/{id}/measurement-preferences`
- `resetToDefault(patientId, userId)` - POST `/patients/{id}/measurement-preferences/reset`
- `deletePreferences(patientId, userId)` - DELETE `/patients/{id}/measurement-preferences`

### UI Components

#### MeasurementPreferences.jsx
- Main preferences management interface
- Preset selection dropdown
- Category-level toggles
- Individual measurement toggles
- Save/reset functionality

#### VitalSignsModal.jsx
- Directly loads measurement preferences on open
- Filters available measurements based on user settings
- Shows warning and closes if category is disabled
- Self-contained preference handling

#### PhysicalMeasurementsModal.jsx
- Loads physical measurement preferences on open
- Conditionally renders height and weight fields
- Automatic BMI calculation for enabled measurements

#### SubjectiveMeasurementsModal.jsx
- Loads subjective measurement preferences on open
- Conditionally renders pain level and mood assessment fields
- Patient-reported outcome management

## 🎨 User Interface

### Profile Settings Integration
- New "Measurement Settings" tab in profile
- Accessible from main profile navigation
- Patient-specific settings per user

### Preset Selection
```jsx
<Select placeholder="Select a medical scenario preset">
  <Option value="comprehensive">Comprehensive - All measurements</Option>
  <Option value="basic_care">Basic Care - Essential monitoring</Option>
  <Option value="diabetes_management">Diabetes Management</Option>
  <Option value="heart_health">Heart Health - Cardiovascular focus</Option>
  <Option value="pediatric_care">Pediatric Care - Age-appropriate</Option>
  <Option value="post_surgery">Post-Surgery Recovery</Option>
  <Option value="custom">Custom Configuration</Option>
</Select>
```

### Category Controls
```jsx
<Card title="Vital Signs">
  <Switch checked={vitalSignsEnabled} onChange={handleCategoryToggle} />
  {vitalSignsEnabled && (
    <div className="measurement-toggles">
      <Switch checked={bloodPressureEnabled} /> Blood Pressure
      <Switch checked={heartRateEnabled} /> Heart Rate
      <Switch checked={temperatureEnabled} /> Temperature
      // ... more measurements
    </div>
  )}
</Card>
```

## 🔧 Implementation Details

### Preference Loading
```javascript
// Load preferences on component mount
useEffect(() => {
  const loadPreferences = async () => {
    const result = await measurementPreferencesService.getPreferences(patientId);
    if (result.success) {
      setPreferences(result.data);
    }
  };
  loadPreferences();
}, [patientId]);
```

### Measurement Filtering
```javascript
// Filter measurements based on preferences
const getFilteredMeasurements = () => {
  return measurements.filter(measurement => {
    const mapping = typeToCategory[measurement.type];
    if (!mapping) return true; // Show unmapped by default
    
    const categoryEnabled = preferences.categories[mapping.category];
    if (!categoryEnabled) return false;
    
    const measurementEnabled = preferences.measurements[mapping.category][mapping.type];
    return measurementEnabled !== false;
  });
};
```

### Self-Contained Modal Pattern
```javascript
// Modal with integrated preference loading
const VitalSignsModal = ({ visible, onClose, patient }) => {
  const [availableMeasurements, setAvailableMeasurements] = useState({});
  const [preferencesLoading, setPreferencesLoading] = useState(true);
  
  useEffect(() => {
    if (visible && patient?.id) {
      loadPreferences();
    }
  }, [visible, patient]);
  
  const loadPreferences = async () => {
    try {
      setPreferencesLoading(true);
      const result = await measurementPreferencesService.getMeasurementAvailability(patient.id);
      
      if (result.success) {
        // Check if category is enabled
        if (!result.data.categories.vitalSigns) {
          onClose();
          message.warning('Vital signs measurements are disabled in your preferences.');
          return;
        }
        
        setAvailableMeasurements(result.data.measurements.vital_signs);
      }
    } finally {
      setPreferencesLoading(false);
    }
  };
  
  // Conditional field rendering
  return (
    <Modal>
      {/* ... other fields ... */}
      {(availableMeasurements.blood_pressure !== false) && (
        <Form.Item name="bloodPressure">
          {/* Blood pressure field */}
        </Form.Item>
      )}
      {(availableMeasurements.heart_rate !== false) && (
        <Form.Item name="heartRate">
          {/* Heart rate field */}
        </Form.Item>
      )}
    </Modal>
  );
};
```

## 📊 Preset Configurations

### Comprehensive (Default)
```json
{
  "categories": {
    "vital_signs": true,
    "physical": true,
    "subjective": true
  },
  "measurements": {
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
  }
}
```

### Basic Care
```json
{
  "categories": {
    "vital_signs": true,
    "physical": true,
    "subjective": true
  },
  "measurements": {
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
  }
}
```

### Diabetes Management
```json
{
  "categories": {
    "vital_signs": true,
    "physical": true,
    "subjective": true
  },
  "measurements": {
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
  }
}
```

## 🔒 Security & Privacy

### Row Level Security
- Users can only access their own preferences
- Caregivers can access preferences for assigned patients
- Preferences are isolated per user-patient combination

### Data Preservation
- Disabling measurements hides them from UI but preserves historical data
- Re-enabling measurements shows historical data again
- No data loss when changing preferences

### Audit Trail
- All preference changes are logged with timestamps
- Created/updated by tracking for accountability
- Preset application history maintained

## 🚀 Usage Examples

### Apply Diabetes Preset
```javascript
const result = await measurementPreferencesService.applyPreset(
  patientId, 
  'diabetes_management'
);
```

### Check if Blood Pressure is Enabled
```javascript
const isEnabled = await measurementPreferencesService.isMeasurementEnabled(
  patientId,
  'vital_signs',
  'blood_pressure'
);
```

### Update Custom Preferences
```javascript
const preferences = {
  vitalSignsEnabled: true,
  physicalMeasurementsEnabled: false,
  subjectiveMeasurementsEnabled: true,
  enabledMeasurements: {
    vital_signs: {
      blood_pressure: true,
      heart_rate: true,
      temperature: false,
      respiratory_rate: false,
      oxygen_saturation: false
    },
    subjective: {
      pain_level: true,
      mood: true,
      energy_level: false,
      sleep_quality: false,
      appetite: false
    }
  },
  isCustom: true
};

await measurementPreferencesService.updatePreferences(patientId, preferences);
```

## 🎯 Benefits

### For Patients
- Simplified interface showing only relevant measurements
- Reduced cognitive load during data entry
- Personalized experience based on medical needs

### For Caregivers
- Condition-specific measurement sets
- Quick preset application for common scenarios
- Independent settings per caregiver

### For Healthcare Providers
- Standardized measurement sets for specific conditions
- Improved data quality through focused collection
- Better patient compliance with simplified interfaces

## 🔮 Future Enhancements

### Planned Features
- Healthcare provider preset recommendations
- Condition-based automatic preset suggestions
- Measurement importance scoring
- Temporary preset switching (e.g., during illness)
- Bulk preference management for multiple patients

### Integration Opportunities
- Electronic Health Record (EHR) integration
- Clinical decision support systems
- Patient education content based on enabled measurements
- Automated alerts for missing critical measurements

## 📝 Migration Guide

### Existing Users
1. All existing users will default to "Comprehensive" preset
2. No data loss - all historical measurements remain accessible
3. Users can customize preferences at any time
4. Caregivers get independent preference sets

### Database Migration
```sql
-- Add measurement preferences for existing patients
INSERT INTO api.measurement_preferences (patient_id, user_id, preset_name, is_custom)
SELECT DISTINCT p.id, pc.caregiver_id, 'comprehensive', false
FROM api.patients p
JOIN api.patient_caregivers pc ON p.id = pc.patient_id
WHERE pc.is_active = true;
```

## 🐛 Troubleshooting

### Common Issues

#### Preferences Not Loading
- Check patient ID is valid
- Verify user has access to patient
- Check network connectivity
- Review browser console for errors

#### Measurements Still Showing When Disabled
- Clear browser cache
- Refresh the page
- Check if using cached data
- Verify preferences were saved successfully

#### Preset Not Applying
- Check preset name is valid
- Verify user permissions
- Check for database connection issues
- Review server logs for errors

### Debug Queries
```sql
-- Check user's preferences
SELECT * FROM api.measurement_preferences 
WHERE patient_id = 'patient-uuid' AND user_id = 'user-uuid';

-- Check available presets
SELECT * FROM api.measurement_presets ORDER BY sort_order;

-- Check if measurement is enabled
SELECT api.is_measurement_enabled('patient-uuid', 'user-uuid', 'vital_signs', 'blood_pressure');
``` 