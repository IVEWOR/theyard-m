import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  SafeAreaView,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { signUpWithEmail } from "../lib/authEmail";

const COLORS = {
  background: "#F9E9E8",
  surface: "#FFFFFF",
  primaryText: "#2D2424",
  secondaryText: "#5D4E4E",
  accent: "#C68E71",
  border: "#E0E0E0",
};

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (loading) return;

    if (!email || !password) {
      Alert.alert("Error", "Email and password required");
      return;
    }

    try {
      setLoading(true);
      await signUpWithEmail(email, password);
      Alert.alert(
        "Account created",
        "Please check your email to verify your account."
      );
      router.replace("/login");
    } catch (e) {
      Alert.alert("Signup failed", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.inner}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => router.replace("/login")}
                style={styles.backBtn}
              >
                <Ionicons
                  name="arrow-back"
                  size={24}
                  color={COLORS.primaryText}
                />
              </TouchableOpacity>
              <Text style={styles.title}>Join the Pack</Text>
              <Text style={styles.subtitle}>
                Create an account to get started.
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={COLORS.secondaryText}
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="Email Address"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={styles.input}
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={COLORS.secondaryText}
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="Create Password"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  style={styles.input}
                />
              </View>

              <View style={{ height: 20 }} />

              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={handleSignup}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.primaryBtnText}>Create Account</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.replace("/login")}>
                <Text style={styles.linkText}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  inner: { flex: 1, padding: 24, justifyContent: "center" },

  header: { marginBottom: 32 },
  backBtn: { marginBottom: 20 },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: COLORS.primaryText,
    marginBottom: 8,
  },
  subtitle: { fontSize: 16, color: COLORS.secondaryText },

  form: { marginBottom: 24 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: COLORS.primaryText },

  primaryBtn: {
    backgroundColor: COLORS.primaryText,
    borderRadius: 16,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.primaryText,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },

  footer: { flexDirection: "row", justifyContent: "center", marginTop: 20 },
  footerText: { color: COLORS.secondaryText, fontSize: 14 },
  linkText: { color: COLORS.primaryText, fontWeight: "bold", fontSize: 14 },
});
