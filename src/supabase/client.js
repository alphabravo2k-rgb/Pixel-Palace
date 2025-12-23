import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabaseClient;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("⚠️ SYSTEM WARNING: Supabase keys are missing! App running in UI-Only Mode.");

  const safeList = { data: [], error: null };
  const safeObj = { data: {}, error: null };

  supabaseClient = {
    auth: {
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      getSession: async () => ({ data: { session: null }, error: null }),
      signInWithPassword: async () => ({ data: null, error: { message: "Mock Auth Failed" } }),
      signOut: async () => {},
      getUser: async () => ({ data: { user: null }, error: null }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => safeObj,
          maybeSingle: () => safeObj,
          order: () => safeList,
          data: []
        }),
        order: () => safeList,
        data: []
      }),
      insert: () => ({ select: () => safeObj }),
      update: () => ({ eq: () => ({ select: () => safeObj }) }),
    }),
    rpc: async () => safeList 
  };
} else {
  console.log("✅ Supabase Client Initialized Successfully");
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = supabaseClient;
