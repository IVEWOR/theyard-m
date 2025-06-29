// app/checkin/[petId].js
import { useState, useEffect } from "react";
import { View, Text, Button, Alert } from "react-native";
import { supabase } from "../../supabase";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function CheckInForm() {
  const { petId } = useLocalSearchParams();
  const [type, setType] = useState("IN"); // you can swap with a Picker
  const router = useRouter();

  const handleSubmit = async () => {
    const session = supabase.auth.session();
    if (!session) return Alert.alert("Not signed in");

    const { error } = await supabase
      .from("CheckIn")
      .insert([{ petId, userId: session.user.id, type }]);
    if (error) Alert.alert("Check-in failed", error.message);
    else {
      Alert.alert("Success!");
      router.replace("/"); // back to dashboard
    }
  };

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 24, marginBottom: 16 }}>
        {type === "IN" ? "Check In" : "Check Out"}
      </Text>
      {/* Replace with a Picker / toggles */}
      <Button
        title={`Switch to ${type === "IN" ? "Check-Out" : "Check-In"}`}
        onPress={() => setType((t) => (t === "IN" ? "OUT" : "IN"))}
      />
      <View style={{ height: 16 }} />
      <Button title="Submit" onPress={handleSubmit} />
    </View>
  );
}
