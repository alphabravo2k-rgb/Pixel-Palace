import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabaseClient;

// 🛡️ SMART CRASH PREVENTION
// If keys are missing, return "Safe Objects" so the app logic doesn't break.
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("⚠️ SYSTEM WARNING: Supabase keys are missing! App running in UI-Only Mode.");

  const safeResponse = { 
    data: { status: 'FAIL', results: [] }, // ✅ Return an OBJECT, not null
    error: { message: "No API Keys Configured" } 
  };

  supabaseClient = {
    auth: {
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      getSession: async () => ({ data: { session: null }, error: null }),
      signInWithPassword: async () => ({ data: null, error: safeResponse.error }),
      signOut: async () => {},
      getUser: async () => ({ data: { user: null }, error: null }),
    },
    // Mocking the chain: .from().select().eq().single()
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => ({ data: {}, error: null }), // ✅ Return empty object for .single()
          maybeSingle: () => ({ data: null, error: null }),
          order: () => ({ data: [], error: null }), // ✅ Return array for lists
          data: []
        }),
        order: () => ({ data: [], error: null }),
        data: []
      }),
      insert: () => ({ select: () => ({ data: {}, error: null }) }),
      update: () => ({ eq: () => ({ select: () => ({ data: {}, error: null }) }) }),
    }),
    // Mocking RPC to return a safe object with a 'status' property
    rpc: async () => ({ 
      data: { status: 'FAIL' }, // ✅ Prevents "Cannot read properties of null"
      error: safeResponse.error 
    })
  };
} else {
  // ✅ Keys found - Load real client
  console.log("✅ Supabase Client Initialized Successfully");
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = supabaseClient;
