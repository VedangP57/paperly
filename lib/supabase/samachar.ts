import { createClient } from '@supabase/supabase-js'

// Uses the same Supabase project as the rest of the app.
// Service role key bypasses RLS — server-side only.
export function createSamacharClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SECRET_KEY!
  return createClient(url, key, {
    auth: { persistSession: false },
  })
}
