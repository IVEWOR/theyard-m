import { View, Text, ActivityIndicator, Alert } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";

export default function Gate() {
  const { petId } = useLocalSearchParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    process();
  }, []);

  async function process() {
    // Load subscription
    const { data: sub } = await supabase
      .from("Subscription")
      .select("status,currentPeriodEnd")
      .eq("userId", user.id)
      .single();

    if (
      !sub ||
      sub.status !== "active" ||
      new Date(sub.currentPeriodEnd) < new Date()
    ) {
      Alert.alert("Access denied", "No active membership");
      router.replace("/dashboard");
      return;
    }

    // Last state
    const { data: last } = await supabase
      .from("CheckIn")
      .select("type")
      .eq("petId", petId)
      .order("timestamp", { ascending: false })
      .limit(1)
      .single();

    const next = last?.type === "IN" ? "OUT" : "IN";

    const { error } = await supabase.from("CheckIn").insert({
      userId: user.id,
      petId,
      type: next,
    });

    if (error) {
      Alert.alert("Error", error.message);
      router.replace("/dashboard");
      return;
    }

    Alert.alert("Success", `Checked ${next}`);
    router.replace("/dashboard");
  }

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
      <Text>Processing gate...</Text>
    </View>
  );
}
