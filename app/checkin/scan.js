// app/checkin/scan.js
import { useState, useEffect } from "react";
import { View, Text, Button } from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
import { useRouter } from "expo-router";

export default function ScanScreen() {
  const [hasPermission, setHasPermission] = useState(null);
  const router = useRouter();

  useEffect(() => {
    BarCodeScanner.requestPermissionsAsync().then(({ status }) => {
      setHasPermission(status === "granted");
    });
  }, []);

  const handleBarCodeScanned = ({ data }) => {
    // assume data === petId
    router.push(`/checkin/${encodeURIComponent(data)}`);
  };

  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }
  return (
    <View style={{ flex: 1 }}>
      <BarCodeScanner
        onBarCodeScanned={handleBarCodeScanned}
        style={{ flex: 1 }}
      />
      <Button title="Cancel" onPress={() => router.back()} />
    </View>
  );
}
