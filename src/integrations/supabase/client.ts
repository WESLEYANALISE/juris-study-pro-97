
import { createClient } from '@supabase/supabase-js';

// Using Lovable's convention for public Supabase URL and anon key
// These are safe to use in client-side code
const supabaseUrl = 'https://yovocuutiwwmbempxcyo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlvdm9jdXV0aXd3bWJlbXB4Y3lvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5MDcyMjUsImV4cCI6MjA2MDQ4MzIyNX0.vbY_vGFeD0iHqmh-NcMq3sAi-jAIgS-DBVwnn3blEs0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: localStorage
  }
});
