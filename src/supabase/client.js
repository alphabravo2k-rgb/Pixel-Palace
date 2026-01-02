import { createClient } from '@supabase/supabase-js';

// 1. 🔍 ENVIRONMENT EXTRACTION
// We grab the variables baked in by Vite during the build
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 2. 🛡️ SECURITY & DEBUGGING AUDIT
// This runs once when the app starts to verify your connection health.
const isDev = import.meta.env.DEV;

if (!supabaseUrl || !supabaseKey) {
  // 🚨 CRITICAL ERROR: This will show in the browser console if Cloudflare didn't inject keys
  console.error(
    `%c🔥 SUPABASE FATAL ERROR: Credentials Missing`,
    'background: #red; color: white; font-size: 12px; padding: 4px; border-radius: 2px;'
  );
  console.table({
    'VITE_SUPABASE_URL': supabaseUrl ? '✅ Loaded' : '❌ MISSING',
    'VITE_SUPABASE_ANON_KEY': supabaseKey ? '✅ Loaded' : '❌ MISSING'
  });
  
  // Throwing stops the app from running with broken data
  throw new Error("Supabase Configuration Missing. Check Cloudflare Environment Variables.");
} else if (isDev) {
  // ✅ SUCCESS LOG (Dev Only)
  console.log(
    `%c⚡ SUPABASE CONNECTED: ${supabaseUrl}`,
    'color: #10b981; font-weight: bold;'
  );
}

// 3. 🔌 THE MASTER CLIENT
// Configured for maximum reliability and automatic session persistence
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,      // Keeps user logged in after refresh
    autoRefreshToken: true,    // Handles token rotation automatically
    detectSessionInUrl: true,  // Works with Magic Links / OAuth
    storage: window.localStorage // Explicitly use LocalStorage
  },
  db: {
    schema: 'public',
  },
  // ⚡ REALTIME OPTIMIZATION
  realtime: {
    params: {
      eventsPerSecond: 10, // Prevents flooding clients with updates
    },
  },
});

// 4. 🛠️ DEV TOOLS ACCESS (God Mode in Console)
// Allows you to type 'window.sb.from("matches").select("*")' in Chrome Console
if (isDev || window.location.hostname.includes('localhost')) {
  window.sb = supabase;
}

// 5. 🚦 EXPORT STATUS HELPER
export const isSupabaseConfigured = true;
