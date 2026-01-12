import { View, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function PetDetail() {
  const { id } = useLocalSearchParams();
  const [pet, setPet] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data } = await supabase
      .from("Pet")
      .select("*")
      .eq("id", id)
      .single();
    setPet(data);
  }

  if (!pet) return null;

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 26 }}>{pet.name}</Text>
      <Text>{pet.breed}</Text>
      <Text>Vet: {pet.vetName}</Text>
      <Text>
        Emergency: {pet.emergencyName} ({pet.emergencyPhone})
      </Text>
    </View>
  );
}
