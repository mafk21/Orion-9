// Legacy import shim — prefer '@/lib/supabase/client' or '@/lib/supabase'.
import { supabase } from '@/lib/supabase/client';

export { supabase };
export const supabaseService = { getClient: () => supabase };
