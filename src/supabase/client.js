import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let client;
let isMockMode = false;

// 🛡️ CONFIG CHECK: Fail Loudly but Safely
if (!supabaseUrl || !supabaseKey) {
  console.error("🔥 CRITICAL: Supabase keys are missing from .env");
  console.error("    The app is running in DISCONNECTED MODE.");
  
  isMockMode = true;

  // ✅ PROXY MOCK: The "Catch-All" Safety Net
  // This prevents crashes even if you use features you haven't explicitly mocked yet.
  client = new Proxy({}, {
    get: (target, prop) => {
      // 1. Handle Realtime (Prevent BracketView Crash)
      if (prop === 'channel') {
        console.warn(`⚠️ [MOCK] Realtime disabled.`);
        return () => ({ 
            on: () => ({ subscribe: () => {} }),
            unsubscribe: () => {} 
        });
      }
      
      // 2. Handle Auth/DB Calls
      if (typeof prop === 'string') {
        return () => {
          console.warn(`⚠️ [MOCK] Supabase call '${String(prop)}' blocked. Missing Keys.`);
          return Promise.resolve({ 
            data: null, 
            error: { message: "Supabase Disconnected (Missing Keys)" } 
          });
        };
      }
      
      return undefined;
    }
  });

} else {
  // ✅ REAL CLIENT
  client = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  });
}

export const supabase = client;
export const isSupabaseConfigured = !isMockMode;
