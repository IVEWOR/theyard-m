import { supabase } from "./supabase";
import { ensureUserProfile } from "./ensureUserProfile";

export async function signUpWithEmail(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  // Ensure User table row exists
  if (data?.user) {
    await ensureUserProfile(data.user);
  }

  return data;
}

export async function signInWithEmail(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  // Ensure User table row exists (safety for old users)
  if (data?.user) {
    await ensureUserProfile(data.user);
  }

  return data;
}
