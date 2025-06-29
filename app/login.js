// app/login.js
import { useState } from "react";
import { supabase } from "../supabase";
import { useRouter } from "expo-router";
import { View, TextInput, Button, Text } from "react-native";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async () => {
    let res;
    if (isSignup) {
      res = await supabase.auth.signUp({ email, password });
    } else {
      res = await supabase.auth.signInWithPassword({ email, password });
    }
    if (res.error) setError(res.error.message);
    else router.replace("/"); // root layout will redirect on auth
  };

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 24, marginBottom: 16 }}>
        {isSignup ? "Create Account" : "Sign In"}
      </Text>
      {error ? <Text style={{ color: "red" }}>{error}</Text> : null}
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        style={{ borderWidth: 1, marginBottom: 12, padding: 8 }}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{ borderWidth: 1, marginBottom: 12, padding: 8 }}
      />
      <Button title={isSignup ? "Sign Up" : "Sign In"} onPress={handleSubmit} />
      <Button
        title={isSignup ? "Have an account? Sign In" : "No account? Sign Up"}
        onPress={() => {
          setIsSignup((s) => !s);
          setError("");
        }}
      />
    </View>
  );
}
