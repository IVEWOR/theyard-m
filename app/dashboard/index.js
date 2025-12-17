import { useEffect } from "react";
import { View, Text, Button } from "react-native";
import { router } from "expo-router";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();

  useEffect(() => {
    enforceTerms();
  }, []);

  const enforceTerms = async () => {
    const { data: latest } = await supabase
      .from("Terms")
      .select("version")
      .order("activeFrom", { ascending: false })
      .limit(1)
      .single();

    const { data: profile } = await supabase
      .from("User")
      .select("acceptedTerms")
      .eq("id", user.id)
      .single();

    if (latest && profile?.acceptedTerms !== latest.version) {
      router.replace("/terms");
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 22, marginBottom: 20 }}>Dashboard</Text>
      <Button title="Logout" onPress={logout} />
    </View>
  );
}
