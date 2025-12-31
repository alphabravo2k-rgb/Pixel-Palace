import { createClient } from '@supabase/supabase-js';

// 1. LOAD ENV VARS
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 2. VALIDATE CONFIG
if (!supabaseUrl || !supabaseKey) {
  console.error("🔥 CRITICAL: Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY.");
  throw new Error("Supabase Configuration Missing. Check .env file.");
}

// 3. INITIALIZE CLIENT
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10, // Throttle updates
    },
  },
});

export const isSupabaseConfigured = !!(supabaseUrl && supabaseKey);
