import apiClient from './api';

/**
 * Measurement Preferences Service
 * Handles all API operations for measurement preferences and presets
 */
class MeasurementPreferencesService {
  /**
   * Get measurement preferences for a patient
   * @param {string} patientId - Patient UUID
   * @param {string} userId - User UUID (optional, defaults to current user)
   * @returns {Promise<Object>} Measurement preferences
   */
  async getPreferences(patientId, userId = null) {
    try {
      const params = {};
      if (userId) params.userId = userId;
      
      const data = await apiClient.get(`/patients/${patientId}/measurement-preferences`, params);
      
      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Error getting measurement preferences:', error);
      
      // Return default preferences if API is not available
      const defaultPreferences = this._getDefaultPreferences();
      return {
        success: true,
        data: defaultPreferences,
        isMockData: true
      };
    }
  }

  /**
   * Update measurement preferences
   * @param {string} patientId - Patient UUID
   * @param {Object} preferences - Preferences object
   * @param {string} userId - User UUID (optional, defaults to current user)
   * @returns {Promise<Object>} Updated preferences
   */
  async updatePreferences(patientId, preferences, userId = null) {
    try {
      const requestData = {
        vitalSignsEnabled: preferences.vitalSignsEnabled,
        physicalMeasurementsEnabled: preferences.physicalMeasurementsEnabled,
        subjectiveMeasurementsEnabled: preferences.subjectiveMeasurementsEnabled,
        enabledMeasurements: preferences.enabledMeasurements,
        presetName: preferences.presetName || null,
        isCustom: preferences.isCustom || true
      };
      
      if (userId) requestData.userId = userId;
      
      const data = await apiClient.put(`/patients/${patientId}/measurement-preferences`, requestData);
      
      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Error updating measurement preferences:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get all available measurement presets
   * @returns {Promise<Object>} Array of presets
   */
  async getPresets() {
    try {
      const data = await apiClient.get('/measurement-presets');
      
      return {
        success: true,
        data: data || []
      };
    } catch (error) {
      console.error('Error getting measurement presets:', error);
      
      // Return default presets if API is not available
      const defaultPresets = this._getDefaultPresets();
      return {
        success: true,
        data: defaultPresets,
        isMockData: true
      };
    }
  }

  /**
   * Apply a preset to patient preferences
   * @param {string} patientId - Patient UUID
   * @param {string} presetName - Preset name to apply
   * @param {string} userId - User UUID (optional, defaults to current user)
   * @returns {Promise<Object>} Updated preferences
   */
  async applyPreset(patientId, presetName, userId = null) {
    try {
      const requestData = { presetName };
      if (userId) requestData.userId = userId;
      
      const data = await apiClient.post(`/patients/${patientId}/measurement-preferences/apply-preset`, requestData);
      
      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Error applying measurement preset:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Reset preferences to default
   * @param {string} patientId - Patient UUID
   * @param {string} userId - User UUID (optional, defaults to current user)
   * @returns {Promise<Object>} Reset preferences
   */
  async resetToDefault(patientId, userId = null) {
    try {
      const requestData = {};
      if (userId) requestData.userId = userId;
      
      const data = await apiClient.post(`/patients/${patientId}/measurement-preferences/reset`, requestData);
      
      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Error resetting measurement preferences:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Delete measurement preferences
   * @param {string} patientId - Patient UUID
   * @param {string} userId - User UUID (optional, defaults to current user)
   * @returns {Promise<Object>} Success status
   */
  async deletePreferences(patientId, userId = null) {
    try {
      const params = {};
      if (userId) params.userId = userId;
      
      await apiClient.delete(`/patients/${patientId}/measurement-preferences`, params);
      
      return {
        success: true
      };
    } catch (error) {
      console.error('Error deleting measurement preferences:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Check if a specific measurement is enabled
   * @param {string} patientId - Patient UUID
   * @param {string} category - Measurement category ('vital_signs', 'physical', 'subjective')
   * @param {string} type - Measurement type
   * @param {string} userId - User UUID (optional, defaults to current user)
   * @returns {Promise<boolean>} True if measurement is enabled
   */
  async isMeasurementEnabled(patientId, category, type, userId = null) {
    try {
      const params = { category, type };
      if (userId) params.userId = userId;
      
      const data = await apiClient.get(`/patients/${patientId}/measurement-preferences/check`, params);
      
      return data.enabled === true;
    } catch (error) {
      console.error('Error checking if measurement is enabled:', error);
      return true; // Default to enabled on error
    }
  }

  /**
   * Get filtered measurements based on preferences
   * @param {string} patientId - Patient UUID
   * @param {Object} allMeasurements - All measurement data
   * @param {string} userId - User UUID (optional, defaults to current user)
   * @returns {Promise<Object>} Filtered measurements
   */
  async getFilteredMeasurements(patientId, allMeasurements, userId = null) {
    try {
      const preferencesResult = await this.getPreferences(patientId, userId);
      
      if (!preferencesResult.success) {
        return { success: false, error: preferencesResult.error };
      }
      
      const preferences = preferencesResult.data;
      const filteredMeasurements = {};
      
      // Filter categories
      if (preferences.vital_signs_enabled && allMeasurements.vitalSigns) {
        filteredMeasurements.vitalSigns = this._filterMeasurementsByType(
          allMeasurements.vitalSigns,
          preferences.enabled_measurements.vital_signs
        );
      }
      
      if (preferences.physical_measurements_enabled && allMeasurements.physicalMeasurements) {
        filteredMeasurements.physicalMeasurements = this._filterMeasurementsByType(
          allMeasurements.physicalMeasurements,
          preferences.enabled_measurements.physical
        );
      }
      
      if (preferences.subjective_measurements_enabled && allMeasurements.subjectiveMeasurements) {
        filteredMeasurements.subjectiveMeasurements = this._filterMeasurementsByType(
          allMeasurements.subjectiveMeasurements,
          preferences.enabled_measurements.subjective
        );
      }
      
      return {
        success: true,
        data: filteredMeasurements,
        preferences: preferences
      };
    } catch (error) {
      console.error('Error filtering measurements:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get measurement availability for UI rendering
   * @param {string} patientId - Patient UUID
   * @param {string} userId - User UUID (optional, defaults to current user)
   * @returns {Promise<Object>} Measurement availability map
   */
  async getMeasurementAvailability(patientId, userId = null) {
    try {
      const preferencesResult = await this.getPreferences(patientId, userId);
      
      if (!preferencesResult.success) {
        return { success: false, error: preferencesResult.error };
      }
      
      const preferences = preferencesResult.data;
      
      return {
        success: true,
        data: {
          categories: {
            vitalSigns: preferences.vital_signs_enabled,
            physicalMeasurements: preferences.physical_measurements_enabled,
            subjectiveMeasurements: preferences.subjective_measurements_enabled
          },
          measurements: preferences.enabled_measurements,
          presetName: preferences.preset_name,
          isCustom: preferences.is_custom
        }
      };
    } catch (error) {
      console.error('Error getting measurement availability:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Helper method to filter measurements by enabled types
   * @private
   */
  _filterMeasurementsByType(measurements, enabledTypes) {
    if (!measurements || !Array.isArray(measurements)) return [];
    
    return measurements.filter(measurement => {
      // Check if the measurement type is enabled
      const measurementType = this._getMeasurementType(measurement);
      return enabledTypes[measurementType] === true;
    });
  }

  /**
   * Helper method to get measurement type from measurement object
   * @private
   */
  _getMeasurementType(measurement) {
    // Map common measurement fields to types
    if (measurement.systolic !== undefined || measurement.diastolic !== undefined) return 'blood_pressure';
    if (measurement.heart_rate !== undefined) return 'heart_rate';
    if (measurement.temperature !== undefined) return 'temperature';
    if (measurement.respiratory_rate !== undefined) return 'respiratory_rate';
    if (measurement.oxygen_saturation !== undefined) return 'oxygen_saturation';
    if (measurement.height !== undefined) return 'height';
    if (measurement.weight !== undefined) return 'weight';
    if (measurement.bmi !== undefined) return 'bmi';
    if (measurement.head_circumference !== undefined) return 'head_circumference';
    if (measurement.pain_level !== undefined) return 'pain_level';
    if (measurement.mood !== undefined) return 'mood';
    if (measurement.energy_level !== undefined) return 'energy_level';
    if (measurement.sleep_quality !== undefined) return 'sleep_quality';
    if (measurement.appetite !== undefined) return 'appetite';
    
    // Default fallback
    return 'unknown';
  }

  /**
   * Get default measurement preferences
   * @private
   */
  _getDefaultPreferences() {
    return {
      id: 'default',
      patient_id: null,
      user_id: null,
      vital_signs_enabled: true,
      physical_measurements_enabled: true,
      subjective_measurements_enabled: true,
      enabled_measurements: {
        vital_signs: {
          blood_pressure: true,
          heart_rate: true,
          temperature: true,
          respiratory_rate: true,
          oxygen_saturation: true
        },
        physical: {
          height: true,
          weight: true,
          bmi: true,
          head_circumference: true
        },
        subjective: {
          pain_level: true,
          mood: true,
          energy_level: true,
          sleep_quality: true,
          appetite: true
        }
      },
      preset_name: 'comprehensive',
      is_custom: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  /**
   * Get default measurement presets
   * @private
   */
  _getDefaultPresets() {
    return [
      {
        id: 'comprehensive',
        name: 'comprehensive',
        display_name: 'Comprehensive',
        description: 'All measurements enabled for complete health monitoring',
        category_settings: {
          vital_signs_enabled: true,
          physical_measurements_enabled: true,
          subjective_measurements_enabled: true
        },
        measurement_settings: {
          vital_signs: {
            blood_pressure: true,
            heart_rate: true,
            temperature: true,
            respiratory_rate: true,
            oxygen_saturation: true
          },
          physical: {
            height: true,
            weight: true,
            bmi: true,
            head_circumference: true
          },
          subjective: {
            pain_level: true,
            mood: true,
            energy_level: true,
            sleep_quality: true,
            appetite: true
          }
        },
        target_condition: 'general',
        is_default: true,
        sort_order: 0
      },
      {
        id: 'basic_care',
        name: 'basic_care',
        display_name: 'Basic Care',
        description: 'Essential measurements for routine monitoring',
        category_settings: {
          vital_signs_enabled: true,
          physical_measurements_enabled: true,
          subjective_measurements_enabled: false
        },
        measurement_settings: {
          vital_signs: {
            blood_pressure: true,
            heart_rate: true,
            temperature: true,
            respiratory_rate: false,
            oxygen_saturation: false
          },
          physical: {
            height: true,
            weight: true,
            bmi: true,
            head_circumference: false
          },
          subjective: {
            pain_level: false,
            mood: false,
            energy_level: false,
            sleep_quality: false,
            appetite: false
          }
        },
        target_condition: 'routine',
        is_default: false,
        sort_order: 1
      },
      {
        id: 'diabetes_management',
        name: 'diabetes_management',
        display_name: 'Diabetes Management',
        description: 'Focused on diabetes care with mood and energy tracking',
        category_settings: {
          vital_signs_enabled: true,
          physical_measurements_enabled: true,
          subjective_measurements_enabled: true
        },
        measurement_settings: {
          vital_signs: {
            blood_pressure: true,
            heart_rate: true,
            temperature: false,
            respiratory_rate: false,
            oxygen_saturation: false
          },
          physical: {
            height: true,
            weight: true,
            bmi: true,
            head_circumference: false
          },
          subjective: {
            pain_level: false,
            mood: true,
            energy_level: true,
            sleep_quality: true,
            appetite: true
          }
        },
        target_condition: 'diabetes',
        is_default: false,
        sort_order: 2
      },
      {
        id: 'heart_health',
        name: 'heart_health',
        display_name: 'Heart Health',
        description: 'Cardiovascular-focused measurements',
        category_settings: {
          vital_signs_enabled: true,
          physical_measurements_enabled: true,
          subjective_measurements_enabled: false
        },
        measurement_settings: {
          vital_signs: {
            blood_pressure: true,
            heart_rate: true,
            temperature: false,
            respiratory_rate: true,
            oxygen_saturation: true
          },
          physical: {
            height: true,
            weight: true,
            bmi: true,
            head_circumference: false
          },
          subjective: {
            pain_level: false,
            mood: false,
            energy_level: false,
            sleep_quality: false,
            appetite: false
          }
        },
        target_condition: 'cardiovascular',
        is_default: false,
        sort_order: 3
      },
      {
        id: 'pediatric_care',
        name: 'pediatric_care',
        display_name: 'Pediatric Care',
        description: 'Age-appropriate measurements for children',
        category_settings: {
          vital_signs_enabled: true,
          physical_measurements_enabled: true,
          subjective_measurements_enabled: true
        },
        measurement_settings: {
          vital_signs: {
            blood_pressure: false,
            heart_rate: true,
            temperature: true,
            respiratory_rate: true,
            oxygen_saturation: false
          },
          physical: {
            height: true,
            weight: true,
            bmi: true,
            head_circumference: true
          },
          subjective: {
            pain_level: true,
            mood: true,
            energy_level: false,
            sleep_quality: true,
            appetite: true
          }
        },
        target_condition: 'pediatric',
        is_default: false,
        sort_order: 4
      },
      {
        id: 'post_surgery',
        name: 'post_surgery',
        display_name: 'Post-Surgery Recovery',
        description: 'Recovery monitoring with pain focus',
        category_settings: {
          vital_signs_enabled: true,
          physical_measurements_enabled: false,
          subjective_measurements_enabled: true
        },
        measurement_settings: {
          vital_signs: {
            blood_pressure: true,
            heart_rate: true,
            temperature: true,
            respiratory_rate: true,
            oxygen_saturation: true
          },
          physical: {
            height: false,
            weight: false,
            bmi: false,
            head_circumference: false
          },
          subjective: {
            pain_level: true,
            mood: true,
            energy_level: true,
            sleep_quality: true,
            appetite: true
          }
        },
        target_condition: 'post_surgical',
        is_default: false,
        sort_order: 5
      }
    ];
  }
}

export const measurementPreferencesService = new MeasurementPreferencesService(); 