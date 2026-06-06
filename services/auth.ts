import { supabase } from '@/lib/supabase/client';
import { createOrUpdateProfile } from './profile';

export async function signInWithEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signUpWithEmail(email: string, password: string, callsign?: string) {
  const result = await supabase.auth.signUp({ email, password });
  const userId = result.data.user?.id;

  if (userId) {
    await createOrUpdateProfile(userId, email, callsign).catch(() => undefined);
  }

  return result;
}

export async function resetPassword(email: string) {
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth?reset=true`
  });
}

export async function updatePassword(newPassword: string) {
  return supabase.auth.updateUser({ password: newPassword });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function getUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}
