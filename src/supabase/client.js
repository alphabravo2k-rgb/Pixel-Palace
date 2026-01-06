import { createClient } from '@supabase/supabase-js';

/**
 * 🔌 PIXEL PALACE: SUPABASE NEXUS
 * ------------------------------
 * STATUS: MASTERED (DUBAI STANDARD)
 * * FEATURES:
 * 1. INTEGRITY GUARD: Prevents app startup if API keys are missing.
 * 2. STORAGE NEXUS: Helper utilities for handling Team Logos/Banners.
 * 3. ISOLATED AUTH: Uses a unique LocalStorage key to prevent conflicts.
 */

// 1. 🔍 ENVIRONMENT EXTRACTION
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const isDev = import.meta.env.DEV;

// 2. 🛡️ INTEGRITY GUARD
if (!supabaseUrl || !supabaseKey) {
  // 🚨 CRITICAL ERROR: Shows if Cloudflare/Vercel Env Vars are missing
  const style = 'background: #ef4444; color: white; padding: 4px; border-radius: 2px; font-weight: bold;';
  console.error('%c🔥 NEXUS OFFLINE: Credentials Missing', style);
  console.table({
    'URL': supabaseUrl ? '✅ Loaded' : '❌ MISSING',
    'KEY': supabaseKey ? '✅ Loaded' : '❌ MISSING'
  });
  throw new Error("Nexus Uplink Failure: Check Environment Vault.");
}

// 3. 🔌 THE MASTER CLIENT
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // 🔒 ISOLATION: Unique key prevents conflicts with other localhost apps
    storageKey: 'pp-nexus-auth', 
    // 🔒 SECURITY: PKCE Flow makes mobile login (iOS/Safari) reliable
    flowType: 'pkce', 
  },
  db: {
    schema: 'public',
  },
  // ⚡ REALTIME SHIELDING
  realtime: {
    params: {
      eventsPerSecond: 10, // Throttles updates to prevent UI stuttering
    },
  },
});

// 4. 📁 STORAGE NEXUS (Media Utilities)
// Standardized helpers to handle Pictures, Audio, and GIFs
export const storageNexus = {
  // Generate a reliable public URL for any hard file
  getUrl: (bucket, path) => {
    if (!path) return null;
    return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
  },
  
  // High-performance upload with cache control
  upload: async (bucket, path, file) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true // Overwrites old version to keep storage clean
      });
    if (error) throw error;
    return data;
  }
};

// 5. 🛠️ GOD MODE (Dev Only)
if (isDev) {
  window.sb = supabase; // Standard shorthand
  window.nexus = supabase; // Cool shorthand
  console.log(
    `%c⚡ NEXUS CONNECTED: ${supabaseUrl.slice(0, 20)}...`,
    'color: #10b981; font-weight: bold; font-family: monospace;'
  );
}

export const isSupabaseConfigured = true;
