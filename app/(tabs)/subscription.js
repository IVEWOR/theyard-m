import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  Linking,
  StatusBar,
} from "react-native";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";

// --- Configuration ---
const WEB_PRICING_URL = "https://the-yard.netlify.app/pricing";
const WEB_MANAGE_URL = "https://the-yard.netlify.app/dashboard/subscription";

// --- Static Data (Matches your Web App) ---
const PLANS = [
  { priceId: "price_1Q6dT3Gpnjr9yNMYdxcT5XkQ", title: "Daily Drop-In" },
  { priceId: "price_1Q6aumGpnjr9yNMYtwh7nf8y", title: "Monthly Membership" },
  { priceId: "price_1Q6d0YGpnjr9yNMYyuvSQAuH", title: "Yearly Membership" },
];

const COLORS = {
  background: "#F9E9E8",
  primaryText: "#2D2424",
  secondaryText: "#5D4E4E",
  accent: "#C68E71",
  successBg: "#D1FADF",
  successText: "#027A48",
  cardBg: "#FFFFFF",
};

export default function Subscription() {
  const { user } = useAuth();
  const [sub, setSub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from("Subscription")
        .select("priceId, status, currentPeriodEnd, allowedPets")
        .eq("userId", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching sub:", error);
      }

      if (data) {
        // Match the priceId to our readable title
        const planDetails = PLANS.find((p) => p.priceId === data.priceId);
        setSub({ ...data, ...planDetails });
      } else {
        setSub(null);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadSubscription();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadSubscription();
  }, []);

  // --- Handlers ---
  const handleOpenWebPricing = () => {
    Linking.openURL(WEB_PRICING_URL);
  };

  const handleManageBilling = () => {
    // Redirects to the web dashboard where they can trigger the Stripe Portal
    Linking.openURL(WEB_MANAGE_URL);
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={COLORS.primaryText} />
      </View>
    );
  }

  const isActive = sub?.status === "active" || sub?.status === "trialing";

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primaryText}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Membership</Text>
          <Text style={styles.sub}>Manage your plan and access.</Text>
        </View>

        {isActive && sub ? (
          // --- ACTIVE SUBSCRIPTION VIEW ---
          <View>
            {/* Membership Card */}
            <LinearGradient
              colors={["#C68E71", "#8D5B46"]}
              style={styles.activeCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.cardHeader}>
                <View style={styles.row}>
                  <Ionicons
                    name="paw"
                    size={20}
                    color="rgba(255,255,255,0.9)"
                  />
                  <Text style={styles.cardBrand}>THE YARD</Text>
                </View>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>
                    {sub.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View>
                <Text style={styles.planName}>
                  {sub.title || "Unknown Plan"}
                </Text>
                <Text style={styles.planDetail}>
                  {sub.allowedPets} Pet(s) Included
                </Text>
                <Text style={styles.renewalText}>
                  Renews on{" "}
                  {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                </Text>
              </View>

              {/* Decorative Circle */}
              <View style={styles.bgCircle} />
            </LinearGradient>

            {/* Manage Button */}
            <View style={styles.actionContainer}>
              <Text style={styles.infoText}>
                Need to change your plan or update your payment method?
              </Text>
              <TouchableOpacity
                style={styles.outlineBtn}
                onPress={handleManageBilling}
              >
                <Text style={styles.outlineBtnText}>Manage Billing on Web</Text>
                <Feather
                  name="external-link"
                  size={16}
                  color={COLORS.primaryText}
                />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          // --- NO ACTIVE PLAN VIEW ---
          <View style={styles.emptyState}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons
                name="crown-outline"
                size={50}
                color={COLORS.accent}
              />
            </View>

            <Text style={styles.emptyTitle}>Join the Pack</Text>
            <Text style={styles.emptySub}>
              You are currently on a free account. Upgrade to a membership to
              unlock unlimited park access.
            </Text>

            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handleOpenWebPricing}
            >
              <Text style={styles.primaryBtnText}>View Plans & Pricing</Text>
              <Feather name="arrow-right" size={20} color="#FFF" />
            </TouchableOpacity>

            <Text style={styles.disclaimer}>
              You will be redirected to our secure website to complete your
              purchase.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loader: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 50,
  },

  // Header
  header: {
    marginBottom: 30,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.primaryText,
    marginBottom: 8,
  },
  sub: {
    fontSize: 16,
    color: COLORS.secondaryText,
    textAlign: "center",
  },

  // Active Card Styles
  activeCard: {
    borderRadius: 24,
    padding: 24,
    height: 200,
    justifyContent: "space-between",
    marginBottom: 30,
    position: "relative",
    overflow: "hidden",
    shadowColor: "#C68E71",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardBrand: {
    color: "rgba(255,255,255,0.9)",
    fontWeight: "800",
    letterSpacing: 2,
    fontSize: 12,
  },
  statusBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  statusText: {
    color: "#FFF",
    fontWeight: "800",
    fontSize: 10,
  },
  planName: {
    color: "#FFF",
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 4,
  },
  planDetail: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 16,
    marginBottom: 4,
    fontWeight: "500",
  },
  renewalText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
  },
  bgCircle: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.1)",
    bottom: -80,
    right: -60,
  },

  // Action Area
  actionContainer: {
    alignItems: "center",
    marginTop: 10,
  },
  infoText: {
    textAlign: "center",
    color: COLORS.secondaryText,
    marginBottom: 15,
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  outlineBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: COLORS.primaryText,
  },
  outlineBtnText: {
    color: COLORS.primaryText,
    fontWeight: "700",
    fontSize: 15,
  },

  // Empty State Styles
  emptyState: {
    alignItems: "center",
    paddingTop: 20,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.cardBg,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.primaryText,
    marginBottom: 10,
  },
  emptySub: {
    fontSize: 15,
    color: COLORS.secondaryText,
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 22,
  },
  primaryBtn: {
    backgroundColor: COLORS.primaryText,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryBtnText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
  disclaimer: {
    marginTop: 20,
    fontSize: 12,
    color: "#9C8C8C",
    textAlign: "center",
  },
});
