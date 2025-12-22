import { createClient } from '@supabase/supabase-js';

// 1. Read Environment Variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 🔍 DEBUGGING LOGS (This will show in your browser console)
console.log("------------------------------------------------");
console.log("🔍 SUPABASE INIT DEBUGGER");
console.log("URL Configured:", !!supabaseUrl); 
if (supabaseUrl) console.log("URL Preview:", supabaseUrl.substring(0, 15) + "...");
console.log("Key Configured:", !!supabaseAnonKey);
console.log("------------------------------------------------");

// 2. Safety Check (Prevents the "ss is not defined" crash)
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ CRITICAL ERROR: Supabase Environment Variables are MISSING in Cloudflare.");
  // We allow the crash here so you see the error, but we log it first.
}

// 3. Export Client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
