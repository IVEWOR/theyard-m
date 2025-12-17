import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useEffect, useState } from "react";
import { router } from "expo-router";
import { configureGoogleSignIn } from "../lib/googleNative";
import { signInWithGoogleNative } from "../lib/authGoogle";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { user, loading: authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Configure Google Sign-In ONCE
  useEffect(() => {
    configureGoogleSignIn();
  }, []);

  // If already logged in, go forward
  useEffect(() => {
    if (user) {
      router.replace("/dashboard");
      console.log(user);
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
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 24, justifyContent: "center" }}>
      <Text style={{ fontSize: 24, marginBottom: 24, textAlign: "center" }}>
        The Yard
      </Text>

      <Text>Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 10,
          marginBottom: 12,
        }}
      />

      <Text>Password</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 10,
          marginBottom: 16,
        }}
      />

      <Button
        title={loading ? "Signing in..." : "Login"}
        disabled={loading}
        onPress={handleEmailLogin}
      />

      <View style={{ height: 16 }} />

      <Button
        title={loading ? "Please wait..." : "Sign in with Google"}
        disabled={loading}
        onPress={handleGoogleLogin}
      />

      <View style={{ height: 16 }} />

      <Button title="Create account" onPress={() => router.push("/signup")} />
    </View>
  );
}
