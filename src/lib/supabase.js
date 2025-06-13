import { createClient } from '@supabase/supabase-js'

// Support both REACT_APP_ and VITE_ environment variable formats
const supabaseUrl = 
  import.meta.env.VITE_SUPABASE_URL || 
  process.env.REACT_APP_SUPABASE_URL || 
  'https://your-project-id.supabase.co'

const supabaseAnonKey = 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  process.env.REACT_APP_SUPABASE_ANON_KEY || 
  'your-anon-public-key'

// Log configuration in development
if (import.meta.env.DEV) {
  console.log('Supabase Configuration:', {
    url: supabaseUrl,
    hasAnonKey: !!supabaseAnonKey,
    environment: import.meta.env.MODE
  })
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
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