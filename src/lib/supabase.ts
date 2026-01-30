import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Ensure these are set in .env.local
if (!supabaseUrl || !supabaseKey) {
    // In a real app we might want to throw an error, but for build time safety we can log
    // console.warn("Supabase credentials missing");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
