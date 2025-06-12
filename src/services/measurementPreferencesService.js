import { supabase } from '../lib/supabase'

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
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const targetUserId = userId || user.id

      const { data, error } = await supabase
        .from('measurement_preferences')
        .select('*')
        .eq('patient_id', patientId)
        .eq('user_id', targetUserId)
        .single()

      if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows returned

      return {
        success: true,
        data: data || this._getDefaultPreferences()
      }
    } catch (error) {
      console.error('Error getting measurement preferences:', error)
      
      // Return default preferences if API is not available
      const defaultPreferences = this._getDefaultPreferences()
      return {
        success: true,
        data: defaultPreferences,
        isMockData: true
      }
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
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const targetUserId = userId || user.id

      const requestData = {
        patient_id: patientId,
        user_id: targetUserId,
        vital_signs_enabled: preferences.vitalSignsEnabled,
        physical_measurements_enabled: preferences.physicalMeasurementsEnabled,
        subjective_measurements_enabled: preferences.subjectiveMeasurementsEnabled,
        enabled_measurements: preferences.enabledMeasurements,
        preset_name: preferences.presetName || null,
        is_custom: preferences.isCustom || true
      }
      
      const { data, error } = await supabase
        .from('measurement_preferences')
        .upsert(requestData)
        .select()
        .single()
      
      if (error) throw error

      return {
        success: true,
        data: data
      }
    } catch (error) {
      console.error('Error updating measurement preferences:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Get all available measurement presets
   * @returns {Promise<Object>} Array of presets
   */
  async getPresets() {
    try {
      const { data, error } = await supabase
        .from('measurement_presets')
        .select('*')
        .order('name')

      if (error) throw error

      return {
        success: true,
        data: data || this._getDefaultPresets()
      }
    } catch (error) {
      console.error('Error getting measurement presets:', error)
      
      // Return default presets if API is not available
      const defaultPresets = this._getDefaultPresets()
      return {
        success: true,
        data: defaultPresets,
        isMockData: true
      }
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
      // First get the preset
      const { data: preset, error: presetError } = await supabase
        .from('measurement_presets')
        .select('*')
        .eq('name', presetName)
        .single()

      if (presetError) throw presetError

      // Apply the preset to preferences
      const preferences = {
        vitalSignsEnabled: preset.vital_signs_enabled,
        physicalMeasurementsEnabled: preset.physical_measurements_enabled,
        subjectiveMeasurementsEnabled: preset.subjective_measurements_enabled,
        enabledMeasurements: preset.enabled_measurements,
        presetName: presetName,
        isCustom: false
      }

      return await this.updatePreferences(patientId, preferences, userId)
    } catch (error) {
      console.error('Error applying measurement preset:', error)
      return {
        success: false,
        error: error.message
      }
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
      const defaultPreferences = this._getDefaultPreferences()
      return await this.updatePreferences(patientId, defaultPreferences, userId)
    } catch (error) {
      console.error('Error resetting measurement preferences:', error)
      return {
        success: false,
        error: error.message
      }
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
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const targetUserId = userId || user.id

      const { error } = await supabase
        .from('measurement_preferences')
        .delete()
        .eq('patient_id', patientId)
        .eq('user_id', targetUserId)
      
      if (error) throw error

      return {
        success: true
      }
    } catch (error) {
      console.error('Error deleting measurement preferences:', error)
      return {
        success: false,
        error: error.message
      }
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
      const preferencesResult = await this.getPreferences(patientId, userId)
      if (!preferencesResult.success) return false

      const preferences = preferencesResult.data
      const categoryEnabled = preferences[`${category}Enabled`] || false
      
      if (!categoryEnabled) return false

      const enabledMeasurements = preferences.enabledMeasurements || {}
      return enabledMeasurements[category]?.includes(type) || false
    } catch (error) {
      console.error('Error checking if measurement is enabled:', error)
      return false
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
      blood_tests_enabled: true,
      urine_tests_enabled: true,
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
        },
        blood_tests: {
          blood_glucose: true,
          cholesterol_total: true,
          cholesterol_ldl: true,
          cholesterol_hdl: true,
          triglycerides: true,
          hemoglobin: true,
          hematocrit: true,
          white_blood_cell_count: true,
          red_blood_cell_count: true,
          platelet_count: true,
          creatinine: true,
          blood_urea_nitrogen: true,
          thyroid_stimulating_hormone: true,
          t3: true,
          t4: true,
          vitamin_d: true,
          vitamin_b12: true,
          iron: true,
          calcium: true,
          potassium: true,
          sodium: true,
          chloride: true
        },
        urine_tests: {
          protein: true,
          glucose: true,
          ketones: true,
          specific_gravity: true,
          ph: true,
          blood: true,
          leukocytes: true
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
          subjective_measurements_enabled: true,
          blood_tests_enabled: true,
          urine_tests_enabled: true
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
          },
          blood_tests: {
            blood_glucose: true,
            cholesterol_total: true,
            cholesterol_ldl: true,
            cholesterol_hdl: true,
            triglycerides: true,
            hemoglobin: true,
            hematocrit: true,
            white_blood_cell_count: true,
            red_blood_cell_count: true,
            platelet_count: true,
            creatinine: true,
            blood_urea_nitrogen: true,
            thyroid_stimulating_hormone: true,
            t3: true,
            t4: true,
            vitamin_d: true,
            vitamin_b12: true,
            iron: true,
            calcium: true,
            potassium: true,
            sodium: true,
            chloride: true
          },
          urine_tests: {
            protein: true,
            glucose: true,
            ketones: true,
            specific_gravity: true,
            ph: true,
            blood: true,
            leukocytes: true
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
          subjective_measurements_enabled: false,
          blood_tests_enabled: false,
          urine_tests_enabled: false
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
          },
          blood_tests: {
            blood_glucose: false,
            cholesterol_total: false,
            cholesterol_ldl: false,
            cholesterol_hdl: false,
            triglycerides: false,
            hemoglobin: false,
            hematocrit: false,
            white_blood_cell_count: false,
            red_blood_cell_count: false,
            platelet_count: false,
            creatinine: false,
            blood_urea_nitrogen: false,
            thyroid_stimulating_hormone: false,
            t3: false,
            t4: false,
            vitamin_d: false,
            vitamin_b12: false,
            iron: false,
            calcium: false,
            potassium: false,
            sodium: false,
            chloride: false
          },
          urine_tests: {
            protein: false,
            glucose: false,
            ketones: false,
            specific_gravity: false,
            ph: false,
            blood: false,
            leukocytes: false
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
          subjective_measurements_enabled: true,
          blood_tests_enabled: true,
          urine_tests_enabled: true
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
          },
          blood_tests: {
            blood_glucose: true,
            cholesterol_total: true,
            cholesterol_ldl: false,
            cholesterol_hdl: true,
            triglycerides: true,
            hemoglobin: true,
            hematocrit: false,
            white_blood_cell_count: false,
            red_blood_cell_count: false,
            platelet_count: false,
            creatinine: true,
            blood_urea_nitrogen: false,
            thyroid_stimulating_hormone: false,
            t3: false,
            t4: false,
            vitamin_d: false,
            vitamin_b12: false,
            iron: false,
            calcium: false,
            potassium: false,
            sodium: false,
            chloride: false
          },
          urine_tests: {
            protein: true,
            glucose: true,
            ketones: true,
            specific_gravity: false,
            ph: false,
            blood: false,
            leukocytes: false
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
          subjective_measurements_enabled: false,
          blood_tests_enabled: true,
          urine_tests_enabled: false
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
          },
          blood_tests: {
            blood_glucose: false,
            cholesterol_total: true,
            cholesterol_ldl: true,
            cholesterol_hdl: true,
            triglycerides: true,
            hemoglobin: false,
            hematocrit: false,
            white_blood_cell_count: false,
            red_blood_cell_count: false,
            platelet_count: false,
            creatinine: false,
            blood_urea_nitrogen: false,
            thyroid_stimulating_hormone: false,
            t3: false,
            t4: false,
            vitamin_d: false,
            vitamin_b12: false,
            iron: false,
            calcium: false,
            potassium: true,
            sodium: true,
            chloride: false
          },
          urine_tests: {
            protein: false,
            glucose: false,
            ketones: false,
            specific_gravity: false,
            ph: false,
            blood: false,
            leukocytes: false
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
          subjective_measurements_enabled: true,
          blood_tests_enabled: false,
          urine_tests_enabled: false
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
          },
          blood_tests: {
            blood_glucose: false,
            cholesterol_total: false,
            cholesterol_ldl: false,
            cholesterol_hdl: false,
            triglycerides: false,
            hemoglobin: false,
            hematocrit: false,
            white_blood_cell_count: false,
            red_blood_cell_count: false,
            platelet_count: false,
            creatinine: false,
            blood_urea_nitrogen: false,
            thyroid_stimulating_hormone: false,
            t3: false,
            t4: false,
            vitamin_d: false,
            vitamin_b12: false,
            iron: false,
            calcium: false,
            potassium: false,
            sodium: false,
            chloride: false
          },
          urine_tests: {
            protein: false,
            glucose: false,
            ketones: false,
            specific_gravity: false,
            ph: false,
            blood: false,
            leukocytes: false
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
          subjective_measurements_enabled: true,
          blood_tests_enabled: true,
          urine_tests_enabled: false
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
          },
          blood_tests: {
            blood_glucose: false,
            cholesterol_total: false,
            cholesterol_ldl: false,
            cholesterol_hdl: false,
            triglycerides: false,
            hemoglobin: true,
            hematocrit: true,
            white_blood_cell_count: true,
            red_blood_cell_count: false,
            platelet_count: false,
            creatinine: false,
            blood_urea_nitrogen: false,
            thyroid_stimulating_hormone: false,
            t3: false,
            t4: false,
            vitamin_d: false,
            vitamin_b12: false,
            iron: false,
            calcium: false,
            potassium: false,
            sodium: false,
            chloride: false
          },
          urine_tests: {
            protein: false,
            glucose: false,
            ketones: false,
            specific_gravity: false,
            ph: false,
            blood: false,
            leukocytes: false
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