import { createBrowserClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// For server-side operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// For client-side operations
export const createSupabaseClient = () => createBrowserClient(supabaseUrl, supabaseAnonKey)