
import { createClient } from '@supabase/supabase-js';

// Create a single supabase client for interacting with your database
export const supabase = createClient(
  'https://ggkdwcmddukgshaepbdn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdna2R3Y21kZHVrZ3NoYWVwYmRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3ODk0NjAsImV4cCI6MjA2MjM2NTQ2MH0.VIwyLaSXJAn0L7baOFjR02vUcJQOrNo72ZMeSzK1U5k'
);
