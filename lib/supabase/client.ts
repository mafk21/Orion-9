import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let cached: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (cached) return cached;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Environment variables validated at this point

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Supabase environment variables NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required.'
    );
  }

  cached = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'orion9.session'
    }
  });

  return cached;
}

// Lazy singleton — validation + client creation happen on first property access,
// NOT at module import time. This prevents crashes during SSR / build / early eval.
export const supabase: SupabaseClient = new Proxy<SupabaseClient>({} as SupabaseClient, {
  get(_, prop) {
    return Reflect.get(getClient(), prop);
  }
});
