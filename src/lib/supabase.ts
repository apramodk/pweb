import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { browser } from '$app/environment';

// Public, safe to ship in the client bundle — Row-Level Security protects the data.
const SUPABASE_URL = 'https://rrvjdkqoeyrqqtlmtljk.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_GGGAVneA7Kz7BQqR4M3lfg_g7diX5UD';

// Only instantiate in the browser. The client pulls in WebSocket/realtime code that
// crashes during static prerender (SSR); all usage here is client-side (onMount/handlers).
export const supabase: SupabaseClient = browser
    ? createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
          auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
      })
    : (null as unknown as SupabaseClient);
