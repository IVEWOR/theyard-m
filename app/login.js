import React, { useEffect, useState } from "react";
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
import { configureGoogleSignIn } from "../lib/googleNative";
import { signInWithGoogleNative } from "../lib/authGoogle";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

const COLORS = {
  background: "#F9E9E8",
  surface: "#FFFFFF",
  primaryText: "#2D2424",
  secondaryText: "#5D4E4E",
  accent: "#C68E71",
  border: "#E0E0E0",
};

export default function Login() {
  const { user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    configureGoogleSignIn();
  }, []);

  useEffect(() => {
    if (user) {
      router.replace("/home");
    }
  }, [user]);

  const handleEmailLogin = async () => {
    if (loading) return;
    if (!email || !password) {
      Alert.alert("Error", "Email and password required");
      return;
    }
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (e) {
      Alert.alert("Login failed", e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (loading) return;
    try {
      setLoading(true);
      await signInWithGoogleNative();
    } catch (e) {
      Alert.alert("Google login failed", e.message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primaryText} />
      </View>
    );
  }

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
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>Sign in to access your pack.</Text>
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
                  placeholder="Password"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  style={styles.input}
                />
              </View>

              <TouchableOpacity style={styles.forgotBtn}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={handleEmailLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.primaryBtnText}>Sign In</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google Button */}
            <TouchableOpacity
              style={styles.socialBtn}
              onPress={handleGoogleLogin}
              disabled={loading}
            >
              <Ionicons
                name="logo-google"
                size={20}
                color={COLORS.primaryText}
              />
              <Text style={styles.socialBtnText}>Google</Text>
            </TouchableOpacity>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push("/signup")}>
                <Text style={styles.linkText}>Sign Up</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  inner: { flex: 1, padding: 24, justifyContent: "center" },

  header: { marginBottom: 32 },
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

  forgotBtn: { alignSelf: "flex-end", marginBottom: 24 },
  forgotText: { color: COLORS.accent, fontWeight: "600" },

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

  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerText: {
    marginHorizontal: 16,
    color: COLORS.secondaryText,
    fontSize: 14,
  },

  socialBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    height: 56,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
    gap: 10,
  },
  socialBtnText: { color: COLORS.primaryText, fontSize: 16, fontWeight: "600" },

  footer: { flexDirection: "row", justifyContent: "center" },
  footerText: { color: COLORS.secondaryText, fontSize: 14 },
  linkText: { color: COLORS.primaryText, fontWeight: "bold", fontSize: 14 },
});
