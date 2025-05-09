
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../integrations/supabase/types';

// Using the same URL and key from the existing setup
const SUPABASE_URL = "https://ggkdwcmddukgshaepbdn.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdna2R3Y21kZHVrZ3NoYWVwYmRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3ODk0NjAsImV4cCI6MjA2MjM2NTQ2MH0.VIwyLaSXJAn0L7baOFjR02vUcJQOrNo72ZMeSzK1U5k";

// Create a single Supabase client instance with improved session configuration
export const supabase = createClient<Database>(
  SUPABASE_URL, 
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: localStorage,
      flowType: 'implicit'
    }
  }
);

// Add a debug helper to check session status (useful for troubleshooting)
export const checkSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error("Session check error:", error);
      return null;
    }
    return data.session;
  } catch (err) {
    console.error("Failed to check session:", err);
    return null;
  }
};
