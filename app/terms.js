import {
  View,
  Text,
  ScrollView,
  Button,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useEffect, useState } from "react";
import { router } from "expo-router";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export default function Terms() {
  const { user, loading } = useAuth();
  const [terms, setTerms] = useState(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    loadTerms();
  }, [user, loading]);

  async function loadTerms() {
    const { data, error } = await supabase
      .from("Terms")
      .select("version, text")
      .order("activeFrom", { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      Alert.alert("Error", "Could not load terms");
      return;
    }
    setTerms(data);
  }

  async function acceptTerms() {
    const { error } = await supabase
      .from("User")
      .update({ acceptedTerms: terms.version })
      .eq("id", user.id);

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }
    router.replace("/dashboard");
  }

  if (!terms) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <ScrollView>
        <Text style={{ fontSize: 22, marginBottom: 12 }}>
          Terms & Conditions
        </Text>
        <Text>{terms.text}</Text>
      </ScrollView>
      <Button title="I Accept" onPress={acceptTerms} />
    </View>
  );
}
