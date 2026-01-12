import { Tabs } from "expo-router";
import { View, Platform, StyleSheet } from "react-native";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

// --- Theme Colors ---
const COLORS = {
  background: "#F9E9E8",
  tabBarBg: "#FFFFFF",
  active: "#C68E71", // Bronze
  inactive: "#9E8E8E", // Muted Grey
  textDark: "#2D2424", // Renamed for clarity
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        // --- Header Styling ---
        headerStyle: {
          backgroundColor: COLORS.background,
          elevation: 0, // Android shadow remove
          shadowOpacity: 0, // iOS shadow remove
          height: Platform.OS === "ios" ? 100 : 80,
        },
        headerTitleStyle: {
          fontWeight: "800",
          fontSize: 20,
          color: COLORS.textDark, // FIXED: Was undefined 'primaryText'
          letterSpacing: 0.5,
        },
        headerTitleAlign: "center",
        headerShadowVisible: false,

        // --- Tab Bar Styling ---
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: COLORS.tabBarBg,
          borderTopWidth: 0,
          elevation: 10, // Android Shadow
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 }, // iOS Shadow
          shadowOpacity: 0.1,
          shadowRadius: 4,
          height: Platform.OS === "ios" ? 85 : 65,
          paddingTop: 10,
        },
        tabBarActiveTintColor: COLORS.active,
        tabBarInactiveTintColor: COLORS.inactive,
      }}
    >
      {/* 1. DASHBOARD */}
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "The Yard",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={26}
              color={color}
            />
          ),
        }}
      />

      {/* 2. PETS */}
      <Tabs.Screen
        name="pets"
        options={{
          title: "My Pack",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "paw" : "paw-outline"}
              size={28}
              color={color}
            />
          ),
        }}
      />

      {/* 3. CHECK-IN (Floating Button) */}
      <Tabs.Screen
        name="checkin"
        options={{
          title: "Check In",
          tabBarIcon: ({ focused }) => (
            <View style={styles.floatingButtonShadow}>
              <LinearGradient
                colors={["#C68E71", "#A66E53"]}
                style={styles.floatingButton}
              >
                <MaterialCommunityIcons
                  name="map-marker-radius"
                  size={28}
                  color="#FFF"
                />
              </LinearGradient>
            </View>
          ),
          tabBarItemStyle: {
            top: -20, // Push visual up
          },
        }}
      />

      {/* 4. SUBSCRIPTION */}
      <Tabs.Screen
        name="subscription"
        options={{
          title: "Membership",
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={
                focused
                  ? "card-account-details"
                  : "card-account-details-outline"
              }
              size={28}
              color={color}
            />
          ),
        }}
      />

      {/* 5. USER */}
      <Tabs.Screen
        name="user"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <Feather
              name="user"
              size={26}
              color={color}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  floatingButtonShadow: {
    shadowColor: "#C68E71",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  floatingButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
});
