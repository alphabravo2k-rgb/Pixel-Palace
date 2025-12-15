import { createClient } from '@supabase/supabase-js';

// Load environment variables (Vite standard)
// You MUST add these to your Cloudflare Pages "Environment Variables" settings
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn("⚠️ Supabase Keys missing! Check your .env file or Cloudflare variables.");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
