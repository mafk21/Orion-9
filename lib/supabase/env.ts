export function getSupabaseEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return {
    supabaseUrl: supabaseUrl ?? '',
    supabaseAnonKey: supabaseAnonKey ?? '',
    isConfigured: Boolean(supabaseUrl && supabaseAnonKey)
  };
}

export function assertSupabaseConfigured() {
  const { isConfigured } = getSupabaseEnv();

  if (!isConfigured) {
    throw new Error('Supabase environment variables NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required.');
  }
}
