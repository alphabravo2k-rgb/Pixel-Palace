import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabaseClient;

// 🛡️ SAFETY CHECK: If keys are missing, don't crash the app.
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ CRITICAL: Supabase Keys are MISSING. App is running in safe mode.");
  
  // Create a 'Mock' Client to prevent "ss is not defined" crashes
  supabaseClient = {
    auth: {
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      getSession: async () => ({ data: { session: null }, error: null }),
      signInWithPassword: async () => ({ data: null, error: { message: "Supabase Keys Missing" } }),
      signOut: async () => {},
    },
    from: () => ({
      select: () => ({ eq: () => ({ single: () => ({ data: null, error: null }) }) }),
    }),
    rpc: async () => ({ data: null, error: { message: "Supabase Keys Missing" } })
  };
} else {
  // Real Client
  console.log("✅ Supabase Keys Found. Initializing...");
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = supabaseClient;
