/**
 * 🔌 PIXEL PALACE: SUPABASE OMNI-LINK
 * VERSION: 2050.5.0 (MASTER OMNI)
 * STATUS: SECURED // REALTIME ENABLED
 */

import { createClient } from '@supabase/supabase-js';

// 1. 🔍 ENVIRONMENT VAULT EXTRACTION
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const isDev = import.meta.env.DEV;

// 2. 🛡️ INTEGRITY HANDSHAKE
if (!supabaseUrl || !supabaseKey) {
  const style = 'background: #ef4444; color: white; padding: 6px; border-radius: 4px; font-family: "JetBrains Mono";';
  console.error('%c🔥 CRITICAL: NEXUS UPLINK DISCONNECTED', style);
  console.table({
    "Infrastructure URL": supabaseUrl ? 'LOCKED' : 'VACANT',
    "Security Key": supabaseKey ? 'LOCKED' : 'VACANT'
  });
  // We throw to prevent the app from booting into a zombie state
  throw new Error("Genesis Failure: Environment variables missing from the Vault.");
}

// 3. 🔌 THE MASTER KERNEL
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'pp-nexus-auth-v5', // Versioned storage to prevent localhost conflicts
    flowType: 'pkce', // Modern standard for secure redirects
  },
  db: {
    schema: 'public',
  },
  // ⚡ REALTIME SYNC (Faceit-Standard Throttling)
  realtime: {
    params: {
      eventsPerSecond: 10, // Prevents 3D UI lag during high-traffic matches
    },
  },
});

// 4. 📁 STORAGE NEXUS (Media Optimization)
export const storageNexus = {
  /**
   * Resolve a public URL with cache-busting logic
   * (Fixes the issue where changing a team logo doesn't update immediately)
   */
  getUrl: (bucket, path) => {
    if (!path) return null;
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    // Append timestamp to bypass browser cache
    return `${data.publicUrl}?t=${new Date().getTime()}`; 
  },
  
  /**
   * Atomic Upload with Overwrite Capability
   */
  upload: async (bucket, path, file) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true 
      });
    if (error) throw error;
    return data;
  }
};

// 5. 🛠️ COMMAND LINE INTERFACE (Dev Access)
if (isDev) {
  window.nexus = supabase; // Type 'nexus' in console to access DB
  console.log(
    `%c🛰️ NEXUS LINK ESTABLISHED // ${new URL(supabaseUrl).hostname}`,
    'color: #c026d3; font-weight: 900; font-family: "Rajdhani"; text-transform: uppercase; letter-spacing: 0.2em;'
  );
}

export const isSupabaseConfigured = true;
