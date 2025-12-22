import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabaseClient;

// 🛡️ CRASH PREVENTION SYSTEM
// If keys are missing, use a "Dummy" client so the app loads (instead of crashing).
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("⚠️ SYSTEM WARNING: Supabase keys are missing! App running in UI-Only Mode.");
  
  supabaseClient = {
    auth: {
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      getSession: async () => ({ data: { session: null }, error: null }),
      signInWithPassword: async () => ({ data: null, error: { message: "No API Keys Configured" } }),
      signOut: async () => {},
    },
    from: () => ({
      select: () => ({ eq: () => ({ single: () => ({ data: null, error: null }) }) }),
      insert: () => ({ select: () => ({ data: null, error: null }) }),
      update: () => ({ eq: () => ({ select: () => ({ data: null, error: null }) }) }),
    }),
    rpc: async () => ({ data: null, error: { message: "No API Keys Configured" } })
  };
} else {
  // ✅ Keys found - Load real client
  console.log("✅ Supabase Client Initialized Successfully");
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = supabaseClient;
