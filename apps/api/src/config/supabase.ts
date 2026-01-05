import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || ''; // Nanti kita set di Env Vercel
const supabaseKey = process.env.SUPABASE_KEY || ''; // Nanti kita set di Env Vercel

export const supabase = createClient(supabaseUrl, supabaseKey);
