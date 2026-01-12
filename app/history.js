import { View, Text } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function History() {
  const { user } = useAuth();
  const [visits, setVisits] = useState([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data } = await supabase
      .from("CheckIn")
      .select("type,timestamp,pet:Pet(name)")
      .eq("userId", user.id)
      .order("timestamp", { ascending: false });
    setVisits(data || []);
  }

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 26 }}>Visit History</Text>
      {visits.map((v, i) => (
        <Text key={i}>
          {v.pet.name} — {v.type} — {new Date(v.timestamp).toLocaleString()}
        </Text>
      ))}
    </View>
  );
}
