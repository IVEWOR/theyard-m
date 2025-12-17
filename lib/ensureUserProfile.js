import { supabase } from "./supabase";

export async function ensureUserProfile(user) {
  if (!user) return;

  const { data, error } = await supabase.from("User").insert({
    id: user.id,
    email: user.email,
  });

  console.log("ENSURE USER RESULT:", { data, error });

  if (error) {
    throw error;
  }
}
