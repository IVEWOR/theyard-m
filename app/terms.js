// app/terms.js
import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { useRouter } from "expo-router";
import { View, Text, ScrollView, Button } from "react-native";

export default function Terms() {
  const [text, setText] = useState("");
  const [version, setVersion] = useState(null);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    // load latest terms
    supabase
      .from("Terms")
      .select("version, text")
      .order("activeFrom", { ascending: false })
      .limit(1)
      .single()
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else {
          setVersion(data.version);
          setText(data.text);
        }
      });
  }, []);

  const accept = async () => {
    const session = supabase.auth.session();
    await supabase
      .from("User")
      .update({ acceptedTerms: version })
      .eq("id", session.user.id);
    router.replace("/"); // root layout will now let them through
  };

  if (error) return <Text>Error loading terms: {error}</Text>;
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <ScrollView style={{ flex: 1, marginBottom: 24 }}>
        <Text>{text}</Text>
      </ScrollView>
      <Button title="I Accept" onPress={accept} />
    </View>
  );
}
