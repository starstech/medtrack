import { createClient } from '@supabase/supabase-js'

// Environment variables (support both Vite and CRA-style prefixes)
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  process.env.REACT_APP_SUPABASE_URL ||
  ''

const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  process.env.REACT_APP_SUPABASE_ANON_KEY ||
  ''

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // eslint-disable-next-line no-console
  console.warn('[Supabase] URL or Anon key is missing; auth features will be disabled until configured.')
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
})

// Convenience helpers – keep surface small and focused on auth only
export const getCurrentUser = () => supabase.auth.getUser()
export const signOut = () => supabase.auth.signOut()

export default supabase 