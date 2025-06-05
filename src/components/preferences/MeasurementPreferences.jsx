import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Switch, 
  Button, 
  Select, 
  Divider, 
  Space, 
  Typography, 
  Alert, 
  Spin, 
  Row, 
  Col,
  App,
  Modal,
  Tooltip
} from 'antd';
import { 
  SettingOutlined, 
  MedicineBoxOutlined, 
  HeartOutlined, 
  SmileOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
  CheckOutlined,
  ExclamationCircleOutlined,
  ExperimentOutlined
} from '@ant-design/icons';
import { measurementPreferencesService } from '../../services/measurementPreferencesService';
import { useAuthContext } from '../../contexts/AuthContext';
import './MeasurementPreferences.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { confirm } = Modal;

const MeasurementPreferences = ({ patientId, onPreferencesChange }) => {
  const { user } = useAuthContext();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState(null);
  const [presets, setPresets] = useState([]);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load initial data
  useEffect(() => {
    loadData();
  }, [patientId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load preferences and presets in parallel
      const [preferencesResult, presetsResult] = await Promise.all([
        measurementPreferencesService.getPreferences(patientId),
        measurementPreferencesService.getPresets()
      ]);
      
      if (preferencesResult.success) {
        // Ensure preferences has proper structure with defaults
        const preferences = {
          vital_signs_enabled: false,
          physical_measurements_enabled: false,
          subjective_measurements_enabled: false,
          blood_tests_enabled: false,
          urine_tests_enabled: false,
          enabled_measurements: {
            vital_signs: {},
            physical: {},
            subjective: {},
            blood_tests: {},
            urine_tests: {}
          },
          preset_name: 'comprehensive',
          is_custom: false,
          ...preferencesResult.data
        };
        setPreferences(preferences);
        setSelectedPreset(preferences.preset_name);
        setIsCustomMode(preferences.is_custom);
      } else {
        message.error('Failed to load measurement preferences');
      }
      
      if (presetsResult.success) {
        console.log('Presets loaded:', presetsResult.data);
        setPresets(Array.isArray(presetsResult.data) ? presetsResult.data : []);
      } else {
        console.error('Failed to load presets:', presetsResult);
        setPresets([]);
        message.error('Failed to load measurement presets');
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setPresets([]); // Ensure presets is always an array
      message.error('Failed to load measurement settings');
    } finally {
      setLoading(false);
    }
  };

  const handlePresetChange = async (presetName) => {
    if (hasUnsavedChanges) {
      confirm({
        title: 'Discard unsaved changes?',
        content: 'You have unsaved changes. Applying a preset will discard them.',
        icon: <ExclamationCircleOutlined />,
        onOk: () => applyPresetLocally(presetName),
      });
    } else {
      applyPresetLocally(presetName);
    }
  };

  const applyPresetLocally = (presetName) => {
    if (presetName === 'custom') {
      setSelectedPreset('custom');
      setIsCustomMode(true);
      setHasUnsavedChanges(true);
      return;
    }

    // Find the preset configuration
    const preset = presets.find(p => p.name === presetName);
    if (!preset) {
      console.error('Preset not found:', presetName);
      return;
    }

    // Update preferences to match the preset
    const updatedPreferences = {
      ...preferences,
      vital_signs_enabled: preset.category_settings.vital_signs_enabled,
      physical_measurements_enabled: preset.category_settings.physical_measurements_enabled,
      subjective_measurements_enabled: preset.category_settings.subjective_measurements_enabled,
      blood_tests_enabled: preset.category_settings.blood_tests_enabled,
      urine_tests_enabled: preset.category_settings.urine_tests_enabled,
      enabled_measurements: {
        vital_signs: preset.measurement_settings.vital_signs || {},
        physical: preset.measurement_settings.physical || {},
        subjective: preset.measurement_settings.subjective || {},
        blood_tests: preset.measurement_settings.blood_tests || {},
        urine_tests: preset.measurement_settings.urine_tests || {}
      },
      preset_name: presetName,
      is_custom: false
    };

    setPreferences(updatedPreferences);
    setSelectedPreset(presetName);
    setIsCustomMode(false);
    setHasUnsavedChanges(true); // Mark as having changes since it's not saved yet
  };

  const applyPreset = async (presetName) => {
    try {
      setSaving(true);
      const result = await measurementPreferencesService.applyPreset(patientId, presetName);
      
      if (result.success) {
        setPreferences(result.data);
        setSelectedPreset(presetName);
        setIsCustomMode(false);
        setHasUnsavedChanges(false);
        message.success('Measurement preset applied successfully');
        onPreferencesChange?.(result.data);
      } else {
        message.error('Failed to apply preset');
      }
    } catch (error) {
      console.error('Error applying preset:', error);
      message.error('Failed to apply measurement preset');
    } finally {
      setSaving(false);
    }
  };

  const handleCategoryToggle = (category, enabled) => {
    const updatedPreferences = { ...preferences };
    
    switch (category) {
      case 'vital_signs':
        updatedPreferences.vital_signs_enabled = enabled;
        break;
      case 'physical':
        updatedPreferences.physical_measurements_enabled = enabled;
        break;
      case 'subjective':
        updatedPreferences.subjective_measurements_enabled = enabled;
        break;
      case 'blood_tests':
        updatedPreferences.blood_tests_enabled = enabled;
        break;
      case 'urine_tests':
        updatedPreferences.urine_tests_enabled = enabled;
        break;
    }
    
    setPreferences(updatedPreferences);
    setIsCustomMode(true);
    setSelectedPreset('custom');
    setHasUnsavedChanges(true);
  };

  const handleMeasurementToggle = (category, measurementType, enabled) => {
    const updatedPreferences = { ...preferences };
    
    // Ensure enabled_measurements structure exists
    if (!updatedPreferences.enabled_measurements) {
      updatedPreferences.enabled_measurements = {
        vital_signs: {},
        physical: {},
        subjective: {},
        blood_tests: {},
        urine_tests: {}
      };
    }
    
    updatedPreferences.enabled_measurements = {
      ...updatedPreferences.enabled_measurements,
      [category]: {
        ...updatedPreferences.enabled_measurements[category],
        [measurementType]: enabled
      }
    };
    
    setPreferences(updatedPreferences);
    setIsCustomMode(true);
    setSelectedPreset('custom');
    setHasUnsavedChanges(true);
  };

  const savePreferences = async () => {
    try {
      setSaving(true);
      
      const preferencesData = {
        vitalSignsEnabled: preferences.vital_signs_enabled,
        physicalMeasurementsEnabled: preferences.physical_measurements_enabled,
        subjectiveMeasurementsEnabled: preferences.subjective_measurements_enabled,
        bloodTestsEnabled: preferences.blood_tests_enabled,
        urineTestsEnabled: preferences.urine_tests_enabled,
        enabledMeasurements: preferences.enabled_measurements,
        presetName: isCustomMode ? 'custom' : selectedPreset,
        isCustom: isCustomMode
      };
      
      const result = await measurementPreferencesService.updatePreferences(patientId, preferencesData);
      
      if (result.success) {
        setPreferences(result.data);
        setHasUnsavedChanges(false);
        message.success('Measurement preferences saved successfully');
        onPreferencesChange?.(result.data);
      } else {
        message.error('Failed to save preferences');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      message.error('Failed to save measurement preferences');
    } finally {
      setSaving(false);
    }
  };

  const resetToDefault = () => {
    confirm({
      title: 'Reset to default settings?',
      content: 'This will reset all measurement preferences to the comprehensive preset.',
      icon: <ExclamationCircleOutlined />,
      onOk: async () => {
        try {
          setSaving(true);
          const result = await measurementPreferencesService.resetToDefault(patientId);
          
          if (result.success) {
            setPreferences(result.data);
            setSelectedPreset('comprehensive');
            setIsCustomMode(false);
            setHasUnsavedChanges(false);
            message.success('Preferences reset to default');
            onPreferencesChange?.(result.data);
          } else {
            message.error('Failed to reset preferences');
          }
        } catch (error) {
          console.error('Error resetting preferences:', error);
          message.error('Failed to reset preferences');
        } finally {
          setSaving(false);
        }
      }
    });
  };

  const renderMeasurementSection = (category, title, icon, measurements) => {
    const categoryKeyMap = {
      'vital_signs': 'vital_signs_enabled',
      'physical': 'physical_measurements_enabled',
      'subjective': 'subjective_measurements_enabled',
      'blood_tests': 'blood_tests_enabled',
      'urine_tests': 'urine_tests_enabled'
    };
    
    const categoryKey = categoryKeyMap[category] || `${category}_enabled`;
    const isCategoryEnabled = preferences?.[categoryKey] || false;
    const measurementConfig = preferences?.enabled_measurements?.[category] || {};

    return (
      <Card 
        size="small" 
        className={`measurement-section ${!isCategoryEnabled ? 'disabled' : ''}`}
      >
        <div className="section-header">
          <Space>
            {icon}
            <Title level={5} style={{ margin: 0 }}>
              {title}
            </Title>
            <Switch
              checked={isCategoryEnabled}
              onChange={(checked) => handleCategoryToggle(category, checked)}
              size="small"
            />
          </Space>
        </div>
        
        {isCategoryEnabled && (
          <div className="measurement-toggles">
            <Row gutter={[12, 8]}>
              {Object.entries(measurements).map(([key, label]) => (
                <Col span={12} key={key}>
                  <div className="measurement-item">
                    <Text className={measurementConfig[key] ? 'enabled' : 'disabled'}>
                      {label}
                    </Text>
                    <Switch
                      size="small"
                      checked={measurementConfig[key] || false}
                      onChange={(checked) => handleMeasurementToggle(category, key, checked)}
                    />
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        )}
      </Card>
    );
  };

  const getPresetDescription = (presetName) => {
    if (!Array.isArray(presets) || !presetName) return '';
    const preset = presets.find(p => p.name === presetName);
    return preset?.description || '';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
        <Text style={{ marginTop: 16, display: 'block' }}>Loading measurement settings...</Text>
      </div>
    );
  }

  if (!preferences) {
    return (
      <Alert
        message="Error Loading Preferences"
        description="Unable to load measurement preferences. Please try refreshing the page."
        type="error"
        showIcon
      />
    );
  }

  const measurementTypes = {
    vital_signs: {
      blood_pressure: 'Blood Pressure',
      heart_rate: 'Heart Rate',
      temperature: 'Temperature',
      respiratory_rate: 'Respiratory Rate',
      oxygen_saturation: 'Oxygen Saturation'
    },
    physical: {
      height: 'Height',
      weight: 'Weight',
      bmi: 'BMI',
      head_circumference: 'Head Circumference'
    },
    subjective: {
      pain_level: 'Pain Level',
      mood: 'Mood',
      energy_level: 'Energy Level',
      sleep_quality: 'Sleep Quality',
      appetite: 'Appetite'
    },
    blood_tests: {
      blood_glucose: 'Blood Glucose',
      cholesterol_total: 'Total Cholesterol',
      cholesterol_ldl: 'LDL Cholesterol',
      cholesterol_hdl: 'HDL Cholesterol',
      triglycerides: 'Triglycerides',
      hemoglobin: 'Hemoglobin',
      hematocrit: 'Hematocrit',
      white_blood_cell_count: 'White Blood Cell Count',
      red_blood_cell_count: 'Red Blood Cell Count',
      platelet_count: 'Platelet Count',
      creatinine: 'Creatinine',
      blood_urea_nitrogen: 'Blood Urea Nitrogen',
      thyroid_stimulating_hormone: 'TSH',
      t3: 'T3',
      t4: 'T4',
      vitamin_d: 'Vitamin D',
      vitamin_b12: 'Vitamin B12',
      iron: 'Iron',
      calcium: 'Calcium',
      potassium: 'Potassium',
      sodium: 'Sodium',
      chloride: 'Chloride'
    },
    urine_tests: {
      protein: 'Protein',
      glucose: 'Glucose',
      ketones: 'Ketones',
      specific_gravity: 'Specific Gravity',
      ph: 'pH',
      blood: 'Blood',
      leukocytes: 'Leukocytes'
    }
  };

  return (
    <App>
      <div className="measurement-preferences">
        {/* Header */}
        <div className="settings-group">
          <div className="settings-group-header">
            <div className="group-title">
              <Space>
                <SettingOutlined />
                <span>Measurement Settings</span>
              </Space>
            </div>
          </div>
          <div className="settings-content">
            <Paragraph type="secondary">
              Customize which measurements are available for tracking. You can use medical scenario presets 
              or create your own custom configuration.
            </Paragraph>
          </div>
        </div>

        {/* Preset Selection */}
        <div className="settings-group">
          <div className="settings-group-header">
            <div className="group-title">
              <Space>
                <MedicineBoxOutlined />
                <span>Medical Scenario Presets</span>
              </Space>
            </div>
          </div>
          <div className="settings-content">
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <Text strong>Choose a preset based on your medical needs:</Text>
                <Tooltip title={getPresetDescription(selectedPreset)}>
                  <InfoCircleOutlined style={{ marginLeft: 8, color: '#1890ff' }} />
                </Tooltip>
              </div>
              
              <Select
                value={selectedPreset}
                onChange={handlePresetChange}
                style={{ width: '100%' }}
                placeholder="Select a medical scenario preset"
                loading={saving}
              >
                {Array.isArray(presets) ? presets.map(preset => (
                  <Option key={preset.name} value={preset.name}>
                    {preset.display_name} {preset.is_default && '(Default)'}
                  </Option>
                )) : null}
                <Option value="custom">
                  Custom Configuration
                </Option>
              </Select>
            </Space>
          </div>
        </div>

        {/* Custom Configuration */}
        <div className="settings-group">
          <div className="settings-group-header">
            <div className="group-title">
              <Space>
                <HeartOutlined />
                <span>Available Measurements</span>
              </Space>
            </div>
          </div>
          <div className="settings-content">
            {!isCustomMode && selectedPreset !== 'custom' && (
              <Alert
                message="Using Preset Configuration"
                description={`Currently using "${Array.isArray(presets) ? presets.find(p => p.name === selectedPreset)?.display_name || selectedPreset : selectedPreset}" preset. Make any changes below to switch to custom mode.`}
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}

            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              {renderMeasurementSection(
                'vital_signs',
                'Vital Signs',
                <HeartOutlined style={{ color: '#ff4d4f' }} />,
                measurementTypes.vital_signs
              )}
              
              {renderMeasurementSection(
                'physical',
                'Physical Measurements',
                <MedicineBoxOutlined style={{ color: '#1890ff' }} />,
                measurementTypes.physical
              )}
              
              {renderMeasurementSection(
                'subjective',
                'Subjective Assessments',
                <SmileOutlined style={{ color: '#52c41a' }} />,
                measurementTypes.subjective
              )}
              
              {renderMeasurementSection(
                'blood_tests',
                'Blood Tests',
                <ExperimentOutlined style={{ color: '#eb2f96' }} />,
                measurementTypes.blood_tests
              )}
              
              {renderMeasurementSection(
                'urine_tests',
                'Urine Tests',
                <ExperimentOutlined style={{ color: '#fa8c16' }} />,
                measurementTypes.urine_tests
              )}
            </Space>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="settings-group">
          <div className="settings-content">
            <Space>
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={savePreferences}
                loading={saving}
                disabled={!hasUnsavedChanges}
              >
                Save Changes
              </Button>
              
              <Button
                icon={<ReloadOutlined />}
                onClick={resetToDefault}
                loading={saving}
              >
                Reset to Default
              </Button>
              
              {hasUnsavedChanges && (
                <Text type="warning" style={{ marginLeft: 16 }}>
                  <ExclamationCircleOutlined /> You have unsaved changes
                </Text>
              )}
            </Space>
          </div>
        </div>

        {/* Information Alert */}
        <div className="settings-group">
          <div className="settings-content">
            <Alert
              message="Important Information"
              description={
                <div>
                  <p>• Disabled measurements will be hidden from all measurement entry forms</p>
                  <p>• Historical data for disabled measurements is preserved and can be re-enabled</p>
                  <p>• Changes affect only your view - other caregivers have independent settings</p>
                  <p>• Some preset combinations may be recommended by healthcare providers</p>
                </div>
              }
              type="info"
              showIcon
            />
          </div>
        </div>
      </div>
    </App>
  );
};

export default MeasurementPreferences; 