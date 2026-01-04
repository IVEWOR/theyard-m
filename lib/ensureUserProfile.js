import { supabase } from "./supabase";

export async function ensureUserProfile(user) {
  if (!user) return;

  const { error } = await supabase
    .from("User")
    .upsert({ id: user.id, email: user.email }, { onConflict: "id" });

  if (error) throw error;
}
