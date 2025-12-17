import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { signUpWithEmail } from "../lib/authEmail";

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

      Alert.alert("Account created", "Check your email to verify your account");

      router.replace("/login");
    } catch (e) {
      Alert.alert("Signup failed", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 24, justifyContent: "center" }}>
      <Text style={{ fontSize: 24, marginBottom: 24, textAlign: "center" }}>
        Create Account
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
        title={loading ? "Creating..." : "Create account"}
        disabled={loading}
        onPress={handleSignup}
      />

      <View style={{ height: 16 }} />

      <Button title="Back to login" onPress={() => router.replace("/login")} />
    </View>
  );
}
