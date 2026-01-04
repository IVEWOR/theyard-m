import { View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useAuth } from "../../context/AuthContext";

export default function CheckinHome() {
  const { user } = useAuth();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 22, marginBottom: 20 }}>Choose Pet</Text>
      <TouchableOpacity
        style={styles.btn}
        onPress={() => router.push("/checkin/scan")}
      >
        <Text style={{ color: "#fff" }}>Scan QR</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = {
  btn: { backgroundColor: "#2B1D12", padding: 16, borderRadius: 30 },
};
