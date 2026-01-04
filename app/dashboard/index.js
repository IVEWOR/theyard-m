import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";

const { width } = Dimensions.get("window");

// --- Updated Palette: More Pink, More Contrast ---
const COLORS = {
  background: "#F9E9E8", // The main requested Pink theme
  surface: "#FFFFFF", // White cards for pop

  // Text Colors - Darker for better visibility
  primaryText: "#2D2424", // Very dark brown/black
  secondaryText: "#5D4E4E", // Darker grey-brown

  // Accents
  accent: "#C68E71", // A visible warm terracotta/bronze
  accentDark: "#8D5B46", // Darker version for gradients

  // Status Colors
  success: "#2E7D32", // Darker green for visibility
  inactiveIcon: "#DBCAC8", // A darker pink-grey for empty slots (more visible)

  // Gradients
  freeCardGradient: ["#5E5656", "#453E3E"], // Dark Grey/Brown for Free card (High contrast)
  activeCardGradient: ["#C68E71", "#8D5B46"], // Bronze for Active
};

export default function Dashboard() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const { data: sub } = await supabase
        .from("Subscription")
        .select("status,currentPeriodEnd,allowedPets")
        .eq("userId", user.id)
        .single();
      setSubscription(sub);

      const { data: myPets } = await supabase
        .from("Pet")
        .select("id")
        .eq("userId", user.id);
      setPets(myPets || []);
    } catch (e) {
      // console.log(e)
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load();
  }, []);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={COLORS.primaryText} />
      </View>
    );
  }

  const isActive =
    subscription?.status === "active" &&
    new Date(subscription.currentPeriodEnd) > new Date();
  const allowedPets = subscription?.allowedPets || 0;
  const registeredPets = pets.length;

  const nextRenewal = subscription?.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : "Inactive";

  return (
    <View style={styles.container}>
      {/* Dark status bar for better visibility on pink */}
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Good {new Date().getHours() < 12 ? "Morning" : "Evening"},
            </Text>
            <Text style={styles.userName}>
              {user?.email?.split("@")[0] || "Member"}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.settingsBtn}
            onPress={() => console.log("Settings")}
          >
            <Feather name="settings" size={24} color={COLORS.primaryText} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primaryText}
            />
          }
        >
          {/* --- 1. Membership Pass --- */}
          <Text style={styles.sectionLabel}>MEMBERSHIP PASS</Text>
          <TouchableOpacity
            activeOpacity={0.95}
            onPress={() => router.push("/pricing")}
            style={styles.cardContainer}
          >
            <LinearGradient
              // Use distinct gradients for Free vs Active so "Free" isn't washed out
              colors={
                isActive ? COLORS.activeCardGradient : COLORS.freeCardGradient
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.membershipCard}
            >
              <View style={styles.passHeader}>
                <View style={styles.logoRow}>
                  <Ionicons name="paw" size={20} color="#FFF" />
                  <Text style={styles.brandName}>THE YARD</Text>
                </View>
                {isActive && (
                  <View style={styles.activeTag}>
                    <Text style={styles.activeTagText}>ACTIVE</Text>
                  </View>
                )}
              </View>

              <View>
                <Text style={styles.planTitle}>
                  {isActive ? `${allowedPets} Pet Access` : "Free Account"}
                </Text>
                <Text style={styles.planSubtitle}>
                  {isActive ? `Renews ${nextRenewal}` : "Tap to upgrade plan"}
                </Text>
              </View>

              {/* Texture Circle */}
              <View style={styles.bgCircle} />
            </LinearGradient>

            {/* Shadow underneath */}
            <View style={styles.cardShadow} />
          </TouchableOpacity>

          {/* --- 2. Your Pack --- */}
          <Text style={styles.sectionLabel}>YOUR PACK</Text>
          <View style={styles.contentCard}>
            <View style={styles.packHeader}>
              <View>
                <Text style={styles.cardTitle}>Registered Pets</Text>
                <Text style={styles.cardSubtitle}>
                  {registeredPets} of {isActive ? allowedPets : 0} slots used
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push("/pets")}
                style={styles.editBtn}
              >
                <Feather name="edit-3" size={20} color={COLORS.secondaryText} />
              </TouchableOpacity>
            </View>

            <View style={styles.petsRow}>
              {/* Logic: Show allowed slots, min 3 for visual balance if free */}
              {[...Array(isActive ? Math.max(allowedPets, 1) : 3)].map(
                (_, i) => (
                  <View key={i} style={styles.petSlot}>
                    <View
                      style={[
                        styles.petCircle,
                        i < registeredPets ? styles.petFilled : styles.petEmpty,
                      ]}
                    >
                      <Ionicons
                        name="paw"
                        size={24}
                        color={i < registeredPets ? "#FFF" : "#BCAAA8"} // Darker grey for empty icon
                      />
                    </View>
                    {i < registeredPets && <View style={styles.statusDot} />}
                  </View>
                )
              )}
            </View>

            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => router.push("/pets")}
            >
              <Text style={styles.actionRowText}>Manage Profiles</Text>
              <Feather
                name="chevron-right"
                size={18}
                color={COLORS.secondaryText}
              />
            </TouchableOpacity>
          </View>

          {/* --- 3. Park Check-In --- */}
          <Text style={styles.sectionLabel}>QUICK ACTIONS</Text>
          <TouchableOpacity
            style={styles.checkInContainer}
            onPress={() => router.push("/checkin")}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={["#C68E71", "#A66E53"]} // Warm visible Bronze
              style={styles.checkInGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.checkInContent}>
                <View style={styles.pinIconBox}>
                  <MaterialCommunityIcons
                    name="map-marker"
                    size={28}
                    color={COLORS.accentDark}
                  />
                </View>
                <View style={styles.checkInTexts}>
                  <Text style={styles.checkInTitle}>Park Check-In</Text>
                  <Text style={styles.checkInSubtitle}>Tap to scan in</Text>
                </View>
              </View>
              <View style={styles.arrowCircle}>
                <Feather
                  name="arrow-right"
                  size={22}
                  color={COLORS.accentDark}
                />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background, // Pink Theme
  },
  loader: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 50,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 25,
  },
  greeting: {
    fontSize: 16,
    color: COLORS.secondaryText,
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.primaryText,
    textTransform: "capitalize",
  },
  settingsBtn: {
    padding: 8,
    backgroundColor: "#FFF",
    borderRadius: 50,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },

  // Labels
  sectionLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#9C8C8C", // Slightly darker than before
    marginBottom: 12,
    marginTop: 10,
    letterSpacing: 1.0,
    textTransform: "uppercase",
  },

  // Membership Card
  cardContainer: {
    marginBottom: 30,
  },
  membershipCard: {
    borderRadius: 24,
    padding: 24,
    height: 170,
    justifyContent: "space-between",
    position: "relative",
    zIndex: 10,
    overflow: "hidden",
  },
  passHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  brandName: {
    color: "#FFF",
    fontWeight: "800",
    letterSpacing: 2,
    fontSize: 12,
    opacity: 0.9,
  },
  activeTag: {
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  activeTagText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "800",
  },
  planTitle: {
    color: "#FFF",
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 4,
  },
  planSubtitle: {
    color: "rgba(255,255,255,0.85)", // Increased opacity for visibility
    fontSize: 15,
  },
  bgCircle: {
    position: "absolute",
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "rgba(255,255,255,0.08)",
    bottom: -100,
    right: -50,
  },
  cardShadow: {
    position: "absolute",
    bottom: -10,
    left: 20,
    right: 20,
    height: 30,
    backgroundColor: "#000",
    opacity: 0.1,
    borderRadius: 20,
    zIndex: 1,
  },

  // Pets Card
  contentCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 20,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  packHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: COLORS.primaryText,
  },
  cardSubtitle: {
    fontSize: 14,
    color: COLORS.secondaryText,
    marginTop: 2,
  },
  editBtn: {
    padding: 4,
  },
  petsRow: {
    flexDirection: "row",
    gap: 15,
    marginBottom: 20,
  },
  petSlot: {
    alignItems: "center",
    justifyContent: "center",
  },
  petCircle: {
    width: 60,
    height: 60,
    borderRadius: 30, // Circle
    justifyContent: "center",
    alignItems: "center",
  },
  petFilled: {
    backgroundColor: COLORS.accent,
    shadowColor: COLORS.accent,
    shadowOpacity: 0.4,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },
  petEmpty: {
    backgroundColor: "#F2E8E6", // Darker pink-grey for better visibility
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
    position: "absolute",
    bottom: 0,
    right: 0,
    borderWidth: 1.5,
    borderColor: "#FFF",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#F2F2F2",
  },
  actionRowText: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.secondaryText,
  },

  // Check In
  checkInContainer: {
    borderRadius: 24,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
    marginBottom: 20,
  },
  checkInGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderRadius: 24,
    height: 100,
  },
  checkInContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  pinIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
  },
  checkInTexts: {
    justifyContent: "center",
  },
  checkInTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFF",
  },
  checkInSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    marginTop: 2,
  },
  arrowCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
  },
});
