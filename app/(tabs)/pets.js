import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { router, Stack } from "expo-router";
import { Ionicons, Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";

// --- Theme Colors (Matches Dashboard) ---
const COLORS = {
  background: "#F9E9E8",
  surface: "#FFFFFF",
  primaryText: "#2D2424",
  secondaryText: "#5D4E4E",
  accent: "#C68E71", // Bronze
  accentDark: "#8D5B46",
  border: "rgba(0,0,0,0.05)",
};

export default function Pets() {
  const { user } = useAuth();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load Data
  const load = async () => {
    try {
      const { data, error } = await supabase
        .from("Pet")
        .select("*")
        .eq("userId", user.id)
        .order("createdAt", { ascending: false }); // Newest first

      if (error) throw error;
      setPets(data || []);
    } catch (e) {
      console.log(e);
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

  // --- Render Components ---

  const renderPetItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      style={styles.card}
      onPress={() => router.push(`/pets/${item.id}`)}
    >
      <View style={styles.cardContent}>
        {/* Avatar / Icon */}
        <View style={styles.avatarContainer}>
          <LinearGradient
            colors={["#C68E71", "#A66E53"]}
            style={styles.avatarGradient}
          >
            <Ionicons name="paw" size={20} color="#FFF" />
          </LinearGradient>
        </View>

        {/* Info */}
        <View style={styles.textContainer}>
          <Text style={styles.petName}>{item.name}</Text>
          <Text style={styles.petBreed}>{item.breed || "Unknown Breed"}</Text>
        </View>

        {/* Arrow */}
        <View style={styles.arrowContainer}>
          <Feather name="chevron-right" size={20} color={COLORS.accent} />
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconCircle}>
        <Ionicons name="paw-outline" size={40} color={COLORS.accent} />
      </View>
      <Text style={styles.emptyTitle}>No dogs found</Text>
      <Text style={styles.emptySub}>
        Add your first furry friend to get started.
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={COLORS.primaryText} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Hide default header so we can use our custom layout if desired, 
          or keep it simple. Here we customize the status bar. */}
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <Stack.Screen
        options={{
          title: "My Pack",
          headerStyle: { backgroundColor: COLORS.background },
          headerShadowVisible: false,
          headerTintColor: COLORS.primaryText,
          headerTitleStyle: { fontWeight: "800", fontSize: 20 },
        }}
      />

      <SafeAreaView style={{ flex: 1 }}>
        <FlatList
          data={pets}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderPetItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primaryText}
            />
          }
        />

        {/* Floating/Fixed Bottom Button */}
        <View style={styles.footerContainer}>
          <TouchableOpacity
            style={styles.addButton}
            activeOpacity={0.9}
            onPress={() => router.push("/pets/add")}
          >
            <LinearGradient
              colors={[COLORS.primaryText, "#453E3E"]} // Dark charcoal gradient
              style={styles.gradientButton}
            >
              <Ionicons name="add" size={24} color="#FFF" />
              <Text style={styles.btnText}>Add Dog</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  listContent: {
    padding: 20,
    paddingBottom: 100, // Space for the bottom button
  },

  // --- Card Styles ---
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    marginBottom: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatarGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
  },
  petName: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.primaryText,
    marginBottom: 4,
  },
  petBreed: {
    fontSize: 14,
    color: COLORS.secondaryText,
    fontWeight: "500",
  },
  arrowContainer: {
    padding: 8,
  },

  // --- Empty State ---
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 60,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.primaryText,
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    color: COLORS.secondaryText,
    textAlign: "center",
    maxWidth: "70%",
  },

  // --- Footer Button ---
  footerContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 30, // Extra padding for safe area
    backgroundColor: "transparent", // Or fade gradient if needed
  },
  addButton: {
    shadowColor: COLORS.primaryText,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    borderRadius: 30,
  },
  gradientButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    borderRadius: 30,
    gap: 8,
  },
  btnText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
