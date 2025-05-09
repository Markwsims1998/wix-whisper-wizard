
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../integrations/supabase/types';

// Using the same URL and key from the existing setup
const SUPABASE_URL = "https://ggkdwcmddukgshaepbdn.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdna2R3Y21kZHVrZ3NoYWVwYmRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3ODk0NjAsImV4cCI6MjA2MjM2NTQ2MH0.VIwyLaSXJAn0L7baOFjR02vUcJQOrNo72ZMeSzK1U5k";

// Create a single Supabase client instance with explicit session configuration
export const supabase = createClient<Database>(
  SUPABASE_URL, 
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storage: localStorage,
    }
  }
);
