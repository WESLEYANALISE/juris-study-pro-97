
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Initialize the Supabase client
export const supabase = createClient<Database>(
  'https://yovocuutiwwmbempxcyo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlvdm9jdXV0aXd3bWJlbXB4Y3lvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5MDcyMjUsImV4cCI6MjA2MDQ4MzIyNX0.vbY_vGFeD0iHqmh-NcMq3sAi-jAIgS-DBVwnn3blEs0'
);
