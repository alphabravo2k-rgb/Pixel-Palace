import { createClient } from '@supabase/supabase-js';

// 1. 🔍 ENVIRONMENT EXTRACTION
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const isDev = import.meta.env.DEV;

// 2. 🛡️ SECURITY & CONFIG AUDIT
if (!supabaseUrl || !supabaseKey) {
  // 🚨 CRITICAL ERROR: Shows if Cloudflare Env Vars are missing
  console.error(
    `%c🔥 SUPABASE FATAL ERROR: Credentials Missing`,
    'background: #ef4444; color: white; font-size: 12px; padding: 4px; border-radius: 2px;'
  );
  console.table({
    'URL': supabaseUrl ? '✅ Loaded' : '❌ MISSING',
    'KEY': supabaseKey ? '✅ Loaded' : '❌ MISSING'
  });
  throw new Error("Supabase Configuration Missing. Check Cloudflare Environment Variables.");
}

// 3. 🔌 THE MASTER CLIENT
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    
    // 🔒 CRITICAL UPGRADE: Use PKCE Flow
    // This makes login reliable on mobile browsers (Safari/iOS) preventing random logouts.
    flowType: 'pkce', 
  },
  db: {
    schema: 'public',
  },
  // ⚡ REALTIME OPTIMIZATION
  realtime: {
    params: {
      eventsPerSecond: 10, // Throttles updates to prevent UI stuttering during high traffic
    },
  },
});

// 4. 🛠️ DEV TOOLS ACCESS (God Mode)
// Only exposes the client globally when running on localhost
if (isDev) {
  window.sb = supabase;
  console.log(
    `%c⚡ SUPABASE CONNECTED: ${supabaseUrl.slice(0, 20)}...`,
    'color: #10b981; font-weight: bold; font-family: monospace;'
  );
}

export const isSupabaseConfigured = true;
