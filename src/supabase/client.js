import { createClient } from '@supabase/supabase-js';

// ⚠️ FORCE KEYS (Bypassing .env to fix the 400 Error immediately)
const supabaseUrl = 'https://mbejyfwiuphpktospkga.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1iZWp5ZndpdXBocGt0b3Nwa2dhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2MTY1ODQsImV4cCI6MjA4MTE5MjU4NH0.Nmqmc0zjYcT2O6u21zz4PGzMiO5cDvQHvTbucAdqdpA';

let client;
let isMockMode = false;

// 🛡️ CONFIG CHECK: Fail Loudly but Safely
if (!supabaseUrl || !supabaseKey) {
  console.error("🔥 CRITICAL: Supabase keys are missing.");
  console.error("    The app is running in DISCONNECTED MODE.");
  
  isMockMode = true;

  // ✅ PROXY MOCK: The "Catch-All" Safety Net
  client = new Proxy({}, {
    get: (target, prop) => {
      // 1. Handle Realtime
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
