import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const hasValidUrl = (() => {
  try {
    return Boolean(new URL(supabaseUrl));
  } catch {
    return false;
  }
})();

export const isSupabaseConfigured = hasValidUrl && Boolean(supabaseAnonKey);

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);
