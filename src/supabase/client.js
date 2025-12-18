import { createClient } from '@supabase/supabase-js';

// 1. Load variables from Vite environment
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 2. Safety Check: Warn if missing (helps debugging)
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("CRITICAL ERROR: Supabase Environment Variables are missing!");
  console.error("Check .env file or Cloudflare/Vercel Dashboard Settings.");
}

// 3. Create and Export Client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
