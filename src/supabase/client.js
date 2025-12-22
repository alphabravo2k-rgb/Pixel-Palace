import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabaseClient;

// 🛡️ CRASH PREVENTION SYSTEM
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("⚠️ SYSTEM WARNING: Supabase keys are missing! App running in UI-Only Mode.");
  
  // Create a 'Dummy' Client so the app doesn't crash with "ss is not defined"
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
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = supabaseClient;
