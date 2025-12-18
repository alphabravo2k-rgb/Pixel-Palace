import { createClient } from '@supabase/supabase-js';

/**
 * SUPABASE CLIENT INTERFACE
 * Standardized initialization with explicit environment validation.
 * Ensures the application fails immediately if core database configurations are missing.
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Fail-fast validation for tactical infrastructure
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "FATAL_CONFIG_ERROR: Supabase credentials not found in environment variables. " +
    "Check your .env file for VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
  );
}

/**
 * Singleton instance of the Supabase client.
 * Configured for the Pixel Palace Tournament Manager environment.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
