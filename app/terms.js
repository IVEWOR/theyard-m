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
  const { user } = useAuth();
  const [terms, setTerms] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTerms();
  }, []);

  const loadTerms = async () => {
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
    setLoading(false);
  };

  const acceptTerms = async () => {
    const { error } = await supabase
      .from("User")
      .update({ acceptedTerms: terms.version })
      .eq("id", user.id);

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    router.replace("/dashboard");
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <ScrollView style={{ flex: 1, marginBottom: 20 }}>
        <Text style={{ fontSize: 22, marginBottom: 12 }}>
          Terms & Conditions
        </Text>
        <Text>{terms.text}</Text>
      </ScrollView>

      <Button title="I Accept" onPress={acceptTerms} />
    </View>
  );
}
