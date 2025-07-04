import apiClient from './api'

/**
 * Measurement Preferences Service
 * Handles all API operations for measurement preferences and presets
 */
class MeasurementPreferencesService {
  /**
   * Get measurement preferences for a patient
   * @param {string} patientId - Patient UUID
   * @returns {Promise<Object>} Measurement preferences
   */
  async getPreferences(patientId) {
    try {
      const { preferences } = await apiClient.get('/measurements/preferences', { patientId })
      return { data: preferences, error: null }
    } catch (error) {
      console.error('Error getting measurement preferences:', error)
      return { data: this._getDefaultPreferences(), error: error.message }
    }
  }

  /**
   * Update measurement preferences
   * @param {string} patientId - Patient UUID
   * @param {Object} preferences - Preferences object
   * @returns {Promise<Object>} Updated preferences
   */
  async updatePreferences(patientId, preferences) {
    try {
      const { preferences: updated } = await apiClient.post('/measurements/preferences', { patientId, ...preferences })
      return { data: updated, error: null }
    } catch (error) {
      console.error('Error updating measurement preferences:', error)
      return { data: null, error: error.message }
    }
  }

  /**
   * Get all available measurement presets
   * @returns {Promise<Object>} Array of presets
   */
  async getPresets() {
    try {
      const presets = await apiClient.get('/measurements/presets')
      return { data: presets, error: null }
    } catch (error) {
      console.error('Error getting measurement presets:', error)
      return { data: this._getDefaultPresets(), error: error.message }
    }
  }

  /**
   * Apply a preset to patient preferences
   * @param {string} patientId - Patient UUID
   * @param {string} presetName - Preset name to apply
   * @returns {Promise<Object>} Updated preferences
   */
  async applyPreset(patientId, presetName) {
    try {
      const { preferences } = await apiClient.post('/measurements/preferences/apply-preset', { patientId, presetName })
      return { data: preferences, error: null }
    } catch (error) {
      console.error('Error applying measurement preset:', error)
      return { data: null, error: error.message }
    }
  }

  /**
   * Reset preferences to default
   * @param {string} patientId - Patient UUID
   * @returns {Promise<Object>} Reset preferences
   */
  async resetToDefault(patientId) {
    try {
      await this.deletePreferences(patientId)
      return this.getPreferences(patientId)
    } catch (error) {
      console.error('Error resetting measurement preferences:', error)
      return { data: null, error: error.message }
    }
  }

  /**
   * Delete measurement preferences
   * @param {string} patientId - Patient UUID
   * @returns {Promise<Object>} Success status
   */
  async deletePreferences(patientId) {
    try {
      await apiClient.delete(`/measurements/preferences?patientId=${patientId}`)
      return { data: true, error: null }
    } catch (error) {
      console.error('Error deleting measurement preferences:', error)
      return { data: null, error: error.message }
    }
  }

  /**
   * Check if a specific measurement is enabled
   * @param {string} patientId - Patient UUID
   * @param {string} category - Measurement category ('vital_signs', 'physical', 'subjective')
   * @param {string} type - Measurement type
   * @returns {Promise<boolean>} True if measurement is enabled
   */
  async isMeasurementEnabled(patientId, category, type) {
    try {
      const { data: preferences, error } = await this.getPreferences(patientId)
      if (error || !preferences) return false

      const categoryEnabled = preferences[`${category}Enabled`] || false
      if (!categoryEnabled) return false

      const enabledMeasurements = preferences.enabledMeasurements || {}
      if (Array.isArray(enabledMeasurements[category])) {
        return enabledMeasurements[category].includes(type)
      }
      return false
    } catch (error) {
      console.error('Error checking if measurement is enabled:', error)
      return false
    }
  }

  /**
   * Get filtered measurements based on preferences
   * @param {string} patientId - Patient UUID
   * @param {Object} allMeasurements - All measurement data
   * @returns {Promise<Object>} Filtered measurements
   */
  async getFilteredMeasurements(patientId, allMeasurements) {
    try {
      const { data: preferences, error } = await this.getPreferences(patientId)
      if (error) return { error, data: null }

      const filteredMeasurements = {}

      if (preferences.vitalSignsEnabled && allMeasurements.vitalSigns) {
        filteredMeasurements.vitalSigns = this._filterMeasurementsByType(
          allMeasurements.vitalSigns,
          preferences.enabledMeasurements.vital_signs || {}
        )
      }

      if (preferences.physicalMeasurementsEnabled && allMeasurements.physicalMeasurements) {
        filteredMeasurements.physicalMeasurements = this._filterMeasurementsByType(
          allMeasurements.physicalMeasurements,
          preferences.enabledMeasurements.physical || {}
        )
      }

      if (preferences.subjectiveMeasurementsEnabled && allMeasurements.subjectiveMeasurements) {
        filteredMeasurements.subjectiveMeasurements = this._filterMeasurementsByType(
          allMeasurements.subjectiveMeasurements,
          preferences.enabledMeasurements.subjective || {}
        )
      }

      return { data: filteredMeasurements, error: null }
    } catch (error) {
      console.error('Error filtering measurements:', error)
      return { data: null, error: error.message }
    }
  }

  /**
   * Get measurement availability for UI rendering
   * @param {string} patientId - Patient UUID
   * @returns {Promise<Object>} Measurement availability map
   */
  async getMeasurementAvailability(patientId) {
    try {
      const data = await apiClient.get('/measurements/availability', { patientId })
      return { data, error: null }
    } catch (error) {
      console.error('Error getting measurement availability:', error)
      return { data: null, error: error.message }
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
      patientId: null,
      userId: null,
      vitalSignsEnabled: true,
      physicalMeasurementsEnabled: true,
      subjectiveMeasurementsEnabled: true,
      bloodTestsEnabled: true,
      urineTestsEnabled: true,
      enabledMeasurements: {
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
      presetName: 'comprehensive',
      isCustom: false,
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