import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Image,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";

const { width } = Dimensions.get("window");

// --- Theme Colors ---
const COLORS = {
  background: "#F9E9E8",
  surface: "#FFFFFF",
  primaryText: "#2D2424",
  secondaryText: "#5D4E4E",
  accent: "#C68E71",
  accentDark: "#8D5B46",
  selectedBg: "#4A403A", // Dark for selected state
};

export default function CheckinHome() {
  const router = useRouter();
  const { user } = useAuth();
  const [pets, setPets] = useState([]);
  const [selectedPetId, setSelectedPetId] = useState(null);

  // Fetch pets to show "Who's here?" chips
  useEffect(() => {
    const fetchPets = async () => {
      const { data } = await supabase
        .from("Pet")
        .select("id, name")
        .eq("userId", user.id);
      if (data) {
        setPets(data);
        // Default to first pet if exists
        if (data.length > 0) setSelectedPetId(data[0].id);
      }
    };
    fetchPets();
  }, [user]);

  const handleScan = () => {
    // You could pass the selectedPetId to the scan page if needed
    // router.push({ pathname: "/checkin/scan", params: { petId: selectedPetId } });
    router.push("/checkin/scan");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* --- Header Illustration --- */}
        <View style={styles.illustrationContainer}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons
              name="map-marker-radius"
              size={60}
              color={COLORS.accent}
            />
          </View>
          <View style={styles.ripple1} />
          <View style={styles.ripple2} />
        </View>

        <Text style={styles.title}>Park Check-In</Text>
        <Text style={styles.subtitle}>
          Scan the QR code at the gate to unlock the fun.
        </Text>

        {/* --- 1. Pet Selector --- */}
        {pets.length > 0 && (
          <View style={styles.selectorContainer}>
            <Text style={styles.sectionLabel}>WHO IS PLAYING TODAY?</Text>
            <View style={styles.chipRow}>
              {pets.map((pet) => {
                const isSelected = selectedPetId === pet.id;
                return (
                  <TouchableOpacity
                    key={pet.id}
                    style={[styles.chip, isSelected && styles.chipSelected]}
                    onPress={() => setSelectedPetId(pet.id)}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name="paw"
                      size={16}
                      color={isSelected ? "#FFF" : COLORS.secondaryText}
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={[
                        styles.chipText,
                        isSelected && styles.chipTextSelected,
                      ]}
                    >
                      {pet.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* --- 2. Giant Scan Button --- */}
        <TouchableOpacity
          style={styles.scanButtonContainer}
          activeOpacity={0.9}
          onPress={handleScan}
        >
          <LinearGradient
            colors={[COLORS.accent, COLORS.accentDark]} // Bronze Gradient
            style={styles.scanButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.scanIconBg}>
              <MaterialCommunityIcons
                name="qrcode-scan"
                size={40}
                color={COLORS.accent}
              />
            </View>
            <Text style={styles.scanBtnTitle}>Tap to Scan QR</Text>
            <Text style={styles.scanBtnSub}>Point camera at the gate code</Text>
          </LinearGradient>

          {/* Shadow Layer */}
          <View style={styles.btnShadow} />
        </TouchableOpacity>

        {/* --- 3. Rules / Info --- */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Feather name="clock" size={20} color={COLORS.secondaryText} />
            <Text style={styles.infoText}>Open daily 6:00 AM - 9:00 PM</Text>
          </View>
          <View style={[styles.infoRow, { marginTop: 12 }]}>
            <Feather name="shield" size={20} color={COLORS.secondaryText} />
            <Text style={styles.infoText}>Keep gate closed at all times</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },

  // Illustration
  illustrationContainer: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    height: 150,
    marginBottom: 20,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  ripple1: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1,
    borderColor: "rgba(198, 142, 113, 0.3)",
    zIndex: 1,
  },
  ripple2: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 1,
    borderColor: "rgba(198, 142, 113, 0.1)",
    zIndex: 0,
  },

  // Text
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.primaryText,
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.secondaryText,
    textAlign: "center",
    maxWidth: "80%",
    lineHeight: 24,
    marginBottom: 40,
  },

  // Pet Selector
  selectorContainer: {
    width: "100%",
    marginBottom: 30,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#9C8C8C",
    marginBottom: 15,
    letterSpacing: 1.0,
    textTransform: "uppercase",
    textAlign: "left",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  chipSelected: {
    backgroundColor: COLORS.selectedBg,
    borderColor: COLORS.selectedBg,
  },
  chipText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.secondaryText,
  },
  chipTextSelected: {
    color: "#FFF",
  },

  // Scan Button
  scanButtonContainer: {
    width: "100%",
    height: 180,
    position: "relative",
    marginBottom: 40,
  },
  scanButton: {
    flex: 1,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  scanIconBg: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  scanBtnTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFF",
    marginBottom: 5,
  },
  scanBtnSub: {
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
  },
  btnShadow: {
    position: "absolute",
    bottom: -10,
    left: 20,
    right: 20,
    height: 40,
    backgroundColor: COLORS.accent,
    opacity: 0.4,
    borderRadius: 30,
    zIndex: 1,
    transform: [{ scale: 0.9 }],
  },

  // Info Card
  infoCard: {
    backgroundColor: "rgba(255,255,255,0.6)",
    width: "100%",
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.8)",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  infoText: {
    color: COLORS.secondaryText,
    fontSize: 14,
    fontWeight: "500",
  },
});
