import { createClient } from '@supabase/supabase-js'

// Replace these with your actual Supabase project credentials
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://your-project-id.supabase.co'
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'your-anon-public-key'

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Helper functions for common operations
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

// Schema configuration
export const SCHEMA = 'api'  // Your dedicated schema name

export default supabase 