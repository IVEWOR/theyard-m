import { supabase } from "./supabase";
import { ensureUserProfile } from "./ensureUserProfile";

export async function signUpWithEmail(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;

  // DO NOT TOUCH User TABLE HERE
  return data;
}

export async function signInWithEmail(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;

  // SESSION EXISTS HERE
  if (data?.user) {
    await ensureUserProfile(data.user);
  }

  return data;
}
