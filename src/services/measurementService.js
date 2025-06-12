// Measurement service for health vitals and measurements
import { supabase } from '../lib/supabase'

export const measurementService = {
  // Get measurements for a patient
  async getMeasurements(patientId, options = {}) {
    try {
      let query = supabase
        .from('measurements')
        .select('*')
        .eq('patient_id', patientId)
        .order('recorded_at', { ascending: false })

      if (options.type) {
        query = query.eq('type', options.type)
      }

      if (options.startDate) {
        query = query.gte('recorded_at', options.startDate)
      }

      if (options.endDate) {
        query = query.lte('recorded_at', options.endDate)
      }

      if (options.limit) {
        query = query.limit(options.limit)
      }

      const { data, error } = await query

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching measurements:', error)
      return { data: null, error: error.message }
    }
  },

  // Get single measurement
  async getMeasurement(measurementId) {
    try {
      const { data, error } = await supabase
        .from('measurements')
        .select('*')
        .eq('id', measurementId)
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching measurement:', error)
      return { data: null, error: error.message }
    }
  },

  // Create a new measurement
  async createMeasurement(measurementData) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('measurements')
        .insert({
          ...measurementData,
          recorded_by: user.id,
          recorded_at: measurementData.recorded_at || new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error creating measurement:', error)
      return { data: null, error: error.message }
    }
  },

  // Update a measurement
  async updateMeasurement(measurementId, measurementData) {
    try {
      const { data, error } = await supabase
        .from('measurements')
        .update(measurementData)
        .eq('id', measurementId)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error updating measurement:', error)
      return { data: null, error: error.message }
    }
  },

  // Delete a measurement
  async deleteMeasurement(measurementId) {
    try {
      const { error } = await supabase
        .from('measurements')
        .delete()
        .eq('id', measurementId)

      if (error) throw error
      return { data: true, error: null }
    } catch (error) {
      console.error('Error deleting measurement:', error)
      return { data: null, error: error.message }
    }
  },

  // Get measurement trends
  async getMeasurementTrends(patientId, type, period = '30') {
    return supabase.rpc('get_measurement_trends', { patient_id: patientId, type: type, period: period })
  },

  // Get measurement alerts
  async getMeasurementAlerts(patientId) {
    return supabase.rpc('get_measurement_alerts', { patient_id: patientId })
  },

  // Get measurements by type
  async getMeasurementsByType(patientId, type, limit = 50) {
    return supabase.rpc('get_measurements_by_type', { patient_id: patientId, type: type, limit: limit })
  },

  // Get latest measurements
  async getLatestMeasurements(patientId) {
    return supabase.rpc('get_latest_measurements', { patient_id: patientId })
  },

  // Get measurement statistics
  async getMeasurementStats(patientId, type, period = '30') {
    return supabase.rpc('get_measurement_stats', { patient_id: patientId, type: type, period: period })
  },

  // Bulk create measurements
  async bulkCreateMeasurements(patientId, measurements) {
    return supabase.rpc('bulk_create_measurements', { patient_id: patientId, measurements: measurements })
  },

  // Get measurement ranges for a patient
  async getMeasurementRanges(patientId, type) {
    return supabase.rpc('get_measurement_ranges', { patient_id: patientId, type: type })
  },

  // Update measurement ranges
  async updateMeasurementRanges(patientId, type, ranges) {
    return supabase.rpc('update_measurement_ranges', { patient_id: patientId, type: type, ranges: ranges })
  },

  // Get measurement types for a patient
  async getMeasurementTypes(patientId) {
    try {
      const { data, error } = await supabase
        .from('measurements')
        .select('type')
        .eq('patient_id', patientId)

      if (error) throw error
      
      // Get unique types
      const uniqueTypes = [...new Set(data.map(m => m.type))]
      return { data: uniqueTypes, error: null }
    } catch (error) {
      console.error('Error fetching measurement types:', error)
      return { data: null, error: error.message }
    }
  }
}

export default measurementService 