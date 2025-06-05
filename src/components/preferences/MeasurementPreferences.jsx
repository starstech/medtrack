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
  message,
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
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { measurementPreferencesService } from '../../services/measurementPreferencesService';
import { useAuthContext } from '../../contexts/AuthContext';
import './MeasurementPreferences.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { confirm } = Modal;

const MeasurementPreferences = ({ patientId, onPreferencesChange }) => {
  const { user } = useAuthContext();
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
        setPreferences(preferencesResult.data);
        setSelectedPreset(preferencesResult.data.preset_name);
        setIsCustomMode(preferencesResult.data.is_custom);
      } else {
        message.error('Failed to load measurement preferences');
      }
      
      if (presetsResult.success) {
        setPresets(presetsResult.data);
      } else {
        message.error('Failed to load measurement presets');
      }
    } catch (error) {
      console.error('Error loading data:', error);
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
        onOk: () => applyPreset(presetName),
      });
    } else {
      await applyPreset(presetName);
    }
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
    }
    
    setPreferences(updatedPreferences);
    setIsCustomMode(true);
    setSelectedPreset('custom');
    setHasUnsavedChanges(true);
  };

  const handleMeasurementToggle = (category, measurementType, enabled) => {
    const updatedPreferences = { ...preferences };
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
    const categoryKey = category === 'vital_signs' ? 'vital_signs_enabled' : 
                      category === 'physical' ? 'physical_measurements_enabled' : 
                      'subjective_measurements_enabled';
    
    const isCategoryEnabled = preferences[categoryKey];
    const measurementConfig = preferences.enabled_measurements[category] || {};

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
    }
  };

  return (
    <div className="measurement-preferences">
      <div className="preferences-header">
        <Title level={3}>
          <SettingOutlined /> Measurement Settings
        </Title>
        <Paragraph type="secondary">
          Customize which measurements are available for tracking. You can use medical scenario presets 
          or create your own custom configuration.
        </Paragraph>
      </div>

      {/* Preset Selection */}
      <Card title="Medical Scenario Presets" className="preset-card">
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
            {presets.map(preset => (
              <Option key={preset.name} value={preset.name}>
                <Space>
                  <Text strong>{preset.display_name}</Text>
                  {preset.is_default && <Text type="secondary">(Default)</Text>}
                </Space>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {preset.description}
                </div>
              </Option>
            ))}
            <Option value="custom">
              <Space>
                <Text strong>Custom Configuration</Text>
                <Text type="secondary">(Manual Setup)</Text>
              </Space>
              <div style={{ fontSize: '12px', color: '#666' }}>
                Fully customizable measurement selection
              </div>
            </Option>
          </Select>
        </Space>
      </Card>

      <Divider />

      {/* Custom Configuration */}
      <div className="measurement-sections">
        <Title level={4}>Available Measurements</Title>
        {!isCustomMode && selectedPreset !== 'custom' && (
          <Alert
            message="Using Preset Configuration"
            description={`Currently using "${presets.find(p => p.name === selectedPreset)?.display_name}" preset. Make any changes below to switch to custom mode.`}
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
        </Space>
      </div>

      {/* Action Buttons */}
      <div className="preferences-actions">
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

      {/* Information Alert */}
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
        style={{ marginTop: 24 }}
      />
    </div>
  );
};

export default MeasurementPreferences; 