import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase URL loaded:', supabaseUrl ? '✅' : '❌');
console.log('Supabase Key loaded:', supabaseAnonKey ? '✅' : '❌');

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project-url')) {
  console.error('❌ Supabase credentials missing or invalid! Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your AI Studio Secrets.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder-error.supabase.co',
  supabaseAnonKey || 'placeholder',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: window.localStorage
    }
  }
);
