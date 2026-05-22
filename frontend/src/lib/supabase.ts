import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || ''
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || ''

export const AUTH_CONFIGURED = Boolean(supabaseUrl && !supabaseUrl.includes('[tu-'))

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase = AUTH_CONFIGURED
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (null as any)
