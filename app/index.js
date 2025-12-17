import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { router } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

export default function Index() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    checkTerms();
  }, [user, loading]);

  const checkTerms = async () => {
    // fetch latest terms
    const { data: latest } = await supabase
      .from("Terms")
      .select("version")
      .order("activeFrom", { ascending: false })
      .limit(1)
      .single();

    if (!latest) {
      router.replace("/dashboard");
      return;
    }

    // fetch user acceptedTerms
    const { data: profile } = await supabase
      .from("User")
      .select("acceptedTerms")
      .eq("id", user.id)
      .single();

    if (profile?.acceptedTerms !== latest.version) {
      router.replace("/terms");
    } else {
      router.replace("/dashboard");
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
