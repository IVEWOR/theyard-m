import { useEffect } from "react";
import {
  ActivityIndicator,
  View,
  StyleSheet,
  Text,
  StatusBar,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { Ionicons } from "@expo/vector-icons";

// Theme Colors
const COLORS = {
  background: "#F9E9E8",
  primaryText: "#2D2424",
  accent: "#C68E71",
};

export default function Index() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      // Small delay to prevent flicker if desired, or instant
      router.replace("/login");
      return;
    }

    checkTerms();
  }, [user, loading]);

  const checkTerms = async () => {
    try {
      // fetch latest terms
      const { data: latest } = await supabase
        .from("Terms")
        .select("version")
        .order("activeFrom", { ascending: false })
        .limit(1)
        .single();

      if (!latest) {
        router.replace("/home"); // Updated from dashboard to home based on previous structure
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
        router.replace("/home");
      }
    } catch (e) {
      // Fallback on error
      router.replace("/home");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.content}>
        <Ionicons
          name="paw"
          size={60}
          color={COLORS.primaryText}
          style={{ marginBottom: 20 }}
        />
        <Text style={styles.title}>THE YARD</Text>
        <ActivityIndicator
          size="large"
          color={COLORS.accent}
          style={{ marginTop: 40 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.primaryText,
    letterSpacing: 4,
  },
});
