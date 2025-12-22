import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 🔍 DEBUGGING LOGS (Check your browser console!)
console.log("------------------------------------------------");
console.log("🔍 SUPABASE DEBUGGER");
console.log("URL Exists?", !!supabaseUrl); // Should be TRUE
console.log("Key Exists?", !!supabaseAnonKey); // Should be TRUE
if (supabaseUrl) console.log("URL Preview:", supabaseUrl.substring(0, 15) + "...");
console.log("------------------------------------------------");

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ CRITICAL ERROR: Supabase Environment Variables are MISSING.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
