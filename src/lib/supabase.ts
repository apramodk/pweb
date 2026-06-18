import { createClient } from '@supabase/supabase-js';

// Public, safe to ship in the client bundle — Row-Level Security protects the data.
const SUPABASE_URL = 'https://rrvjdkqoeyrqqtlmtljk.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_GGGAVneA7Kz7BQqR4M3lfg_g7diX5UD';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
});
