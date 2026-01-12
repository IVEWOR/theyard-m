import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Linking,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { router } from "expo-router";
import { supabase } from "../../lib/supabase";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

// --- Theme Colors ---
const COLORS = {
  background: "#F9E9E8",
  surface: "#FFFFFF",
  primaryText: "#2D2424",
  secondaryText: "#5D4E4E",
  accent: "#C68E71",
  danger: "#E53935",
  border: "rgba(0,0,0,0.05)",
};

export default function UserProfile() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState(null);
  const [petCount, setPetCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      if (!user) return;

      // 1. Get User Data
      const { data: userData, error: userError } = await supabase
        .from("User")
        .select("*")
        .eq("id", user.id)
        .single();

      if (userError) throw userError;
      setProfile(userData);

      // 2. Get Pet Count
      const { count, error: countError } = await supabase
        .from("Pet")
        .select("*", { count: "exact", head: true })
        .eq("userId", user.id);

      if (!countError) setPetCount(count || 0);
    } catch (error) {
      console.log("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: () => {
          signOut();
          router.replace("/");
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={COLORS.primaryText} />
      </View>
    );
  }

  // Fallbacks
  const displayName = profile?.name || "Pack Member";
  const displayEmail = profile?.email || user?.email;
  const initials = displayName.slice(0, 2).toUpperCase();
  const memberSince = new Date(profile?.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* --- Header Profile Card --- */}
        <View style={styles.profileCard}>
          <LinearGradient
            colors={[COLORS.primaryText, "#453E3E"]}
            style={styles.avatarCircle}
          >
            <Text style={styles.avatarText}>{initials}</Text>
          </LinearGradient>

          <Text style={styles.nameText}>{displayName}</Text>
          <Text style={styles.emailText}>{displayEmail}</Text>

          {profile?.isAdmin && (
            <View style={styles.adminBadge}>
              <MaterialCommunityIcons
                name="shield-crown"
                size={14}
                color="#FFF"
              />
              <Text style={styles.adminText}>ADMIN</Text>
            </View>
          )}

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{petCount}</Text>
              <Text style={styles.statLabel}>Pets</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {new Date(profile?.createdAt).getFullYear()}
              </Text>
              <Text style={styles.statLabel}>Member Since</Text>
            </View>
          </View>
        </View>

        {/* --- Menu Options --- */}
        <Text style={styles.sectionTitle}>Account Settings</Text>
        <View style={styles.menuContainer}>
          {/* Edit Profile (Placeholder) */}
          <MenuOption
            icon="edit-3"
            label="Edit Profile"
            onPress={() =>
              Alert.alert(
                "Coming Soon",
                "Profile editing will be available soon!"
              )
            }
          />

          {/* Terms (Using acceptedTerms version logic) */}
          <MenuOption
            icon="file-text"
            label={`Terms of Service (v${profile?.acceptedTerms || "1.0"})`}
            onPress={() =>
              Linking.openURL("https://the-yard.netlify.app/terms")
            }
          />

          <MenuOption
            icon="help-circle"
            label="Support"
            onPress={() => Linking.openURL("mailto:support@theyard.com")}
          />
        </View>

        {/* --- Sign Out --- */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleSignOut}>
          <Feather name="log-out" size={20} color={COLORS.danger} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>App Version 1.0.2</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Helper Component ---
const MenuOption = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuRow}>
      <View style={styles.iconBox}>
        <Feather name={icon} size={20} color={COLORS.secondaryText} />
      </View>
      <Text style={styles.menuText}>{label}</Text>
    </View>
    <Feather name="chevron-right" size={20} color="#CDC" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loaderContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },

  // Profile Card
  profileCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: COLORS.primaryText,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFF",
  },
  nameText: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.primaryText,
    marginBottom: 4,
  },
  emailText: {
    fontSize: 14,
    color: COLORS.secondaryText,
    marginBottom: 12,
  },
  adminBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    marginBottom: 15,
  },
  adminText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "80%",
    marginTop: 10,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.primaryText,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.secondaryText,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.border,
  },

  // Menu
  sectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#9C8C8C",
    marginBottom: 15,
    paddingLeft: 4,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  menuContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    paddingVertical: 8,
    marginBottom: 30,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  menuText: {
    fontSize: 16,
    color: COLORS.primaryText,
    fontWeight: "500",
  },

  // Logout
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEE2E2", // Light red bg
    padding: 16,
    borderRadius: 16,
    gap: 10,
  },
  logoutText: {
    color: COLORS.danger,
    fontSize: 16,
    fontWeight: "bold",
  },
  versionText: {
    textAlign: "center",
    color: "#CCC",
    marginTop: 20,
    fontSize: 12,
  },
});
