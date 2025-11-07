import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Event {
  id: number;
  created_at: string;
  title: string;
  date: string;
  time: string;
  location: string;
  venue: string;
  organizer: string | null;
  description: string;
  short_description: string;
  category: string;
  image_url: string | null;
  image_path: string | null;
}
