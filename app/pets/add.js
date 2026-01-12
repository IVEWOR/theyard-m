import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Stack } from "expo-router";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import CryptoJS from "crypto-js";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";

// --- YOUR CLOUDINARY KEYS ---
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`;

// --- Theme Colors ---
const COLORS = {
  background: "#F9E9E8",
  surface: "#FFFFFF",
  primaryText: "#2D2424",
  secondaryText: "#5D4E4E",
  accent: "#C68E71",
  border: "#E0E0E0",
  placeholder: "#9CA3AF",
};

export default function AddPet() {
  const router = useRouter();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [checkingLimit, setCheckingLimit] = useState(true);

  // Form State
  const [form, setForm] = useState({
    name: "",
    age: "",
    breed: "",
    gender: "",
    color: "",
    vetName: "",
    vetContact: "",
    emergencyName: "",
    emergencyPhone: "",
    emergencyRelation: "",
  });

  // Files & Expiries
  const [files, setFiles] = useState({
    parvo: null,
    rabies: null,
    fecal: null,
    lepto: null,
  });
  const [expiries, setExpiries] = useState({
    parvo: null,
    rabies: null,
    fecal: null,
    lepto: null,
  });

  // Date Picker State
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activeDateField, setActiveDateField] = useState(null);
  const [tempDate, setTempDate] = useState(new Date());

  // --- 1. Check Limits ---
  useEffect(() => {
    checkSubscriptionLimit();
  }, []);

  const checkSubscriptionLimit = async () => {
    try {
      const { data: sub } = await supabase
        .from("Subscription")
        .select("allowedPets")
        .eq("userId", user.id)
        .single();
      const { count } = await supabase
        .from("Pet")
        .select("*", { count: "exact", head: true })
        .eq("userId", user.id);
      const allowed = sub?.allowedPets || 0;

      if (count >= allowed) {
        Alert.alert(
          "Limit Reached",
          `Your plan allows for ${allowed} pet(s).`,
          [{ text: "Go Back", onPress: () => router.back() }]
        );
      }
    } catch (error) {
      console.log("Error checking limit", error);
    } finally {
      setCheckingLimit(false);
    }
  };

  // --- 2. Handlers ---
  const updateForm = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const pickDocument = async (type) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });
      if (!result.canceled)
        setFiles((prev) => ({ ...prev, [type]: result.assets[0] }));
    } catch (err) {
      Alert.alert("Error", "Could not pick file");
    }
  };

  // --- Date Picker Handlers ---
  const openDatePicker = (field) => {
    setActiveDateField(field);
    const currentDate = expiries[field]
      ? new Date(expiries[field])
      : new Date();
    setTempDate(currentDate);
    setShowDatePicker(true);
  };

  const onDateChange = (event, selectedDate) => {
    if (Platform.OS === "android") setShowDatePicker(false);
    if (selectedDate) {
      if (Platform.OS === "android") {
        setExpiries((prev) => ({
          ...prev,
          [activeDateField]: selectedDate.toISOString().split("T")[0],
        }));
      } else {
        setTempDate(selectedDate);
      }
    }
  };

  const confirmIOSDate = () => {
    setExpiries((prev) => ({
      ...prev,
      [activeDateField]: tempDate.toISOString().split("T")[0],
    }));
    setShowDatePicker(false);
  };

  // --- 3. Signed Cloudinary Upload Logic ---
  const uploadToCloudinary = async (fileAsset) => {
    if (!fileAsset) return null;

    // 1. Generate Timestamp
    const timestamp = Math.floor(Date.now() / 1000);

    // 2. Create the "String to Sign"
    // For a basic upload, we are signing "timestamp=1234567890" + API_SECRET
    const stringToSign = `timestamp=${timestamp}${CLOUDINARY_API_SECRET}`;

    // 3. Generate SHA-1 Signature using crypto-js
    const signature = CryptoJS.SHA1(stringToSign).toString();

    // 4. Create FormData
    const formData = new FormData();
    formData.append("file", {
      uri: fileAsset.uri,
      type: "application/pdf", // Cloudinary handles PDFs best with explicit type
      name: fileAsset.name || "upload.pdf",
    });
    formData.append("api_key", CLOUDINARY_API_KEY);
    formData.append("timestamp", timestamp.toString());
    formData.append("signature", signature);

    try {
      const response = await fetch(CLOUDINARY_URL, {
        method: "POST",
        body: formData,
        headers: {
          // React Native automatically sets Content-Type to multipart/form-data with boundary
        },
      });

      const data = await response.json();

      if (data.secure_url) {
        return data.secure_url;
      } else {
        console.error("Cloudinary Error:", data);
        throw new Error(data.error?.message || "Upload failed");
      }
    } catch (error) {
      console.error("Upload Error:", error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    if (!form.name || !form.age || !form.breed) {
      Alert.alert("Missing Fields", "Please fill in the required basic info.");
      return;
    }

    setLoading(true);
    try {
      // 1. Upload Files
      const [parvoUrl, rabiesUrl, fecalUrl, leptoUrl] = await Promise.all([
        files.parvo ? uploadToCloudinary(files.parvo) : null,
        files.rabies ? uploadToCloudinary(files.rabies) : null,
        files.fecal ? uploadToCloudinary(files.fecal) : null,
        files.lepto ? uploadToCloudinary(files.lepto) : null,
      ]);

      // 2. Insert into Supabase (UPDATED COLUMN NAMES)
      const { error } = await supabase.from("Pet").insert({
        userId: user.id,
        name: form.name,
        age: parseInt(form.age),
        breed: form.breed,
        gender: form.gender,
        color: form.color,
        vetName: form.vetName,
        vetContact: form.vetContact,
        emergencyName: form.emergencyName,
        emergencyPhone: form.emergencyPhone,
        emergencyRelation: form.emergencyRelation,

        // --- FIXED MAPPING HERE ---
        parvoCertUrl: parvoUrl, // Was parvoUrl
        parvoExpiry: expiries.parvo || null,

        rabiesCertUrl: rabiesUrl, // Was rabiesUrl
        rabiesExpiry: expiries.rabies || null,

        fecalCertUrl: fecalUrl, // Was fecalUrl
        fecalExpiry: expiries.fecal || null,

        leptoCertUrl: leptoUrl, // Was leptoUrl
        leptoExpiry: expiries.lepto || null,
      });

      if (error) throw error;

      Alert.alert("Success", "Pet added successfully!", [
        { text: "OK", onPress: () => router.replace("/pets") },
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to save pet: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (checkingLimit) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primaryText} />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <Stack.Screen
        options={{
          headerTitle: "Add New Pet",
          headerStyle: { backgroundColor: COLORS.background },
          headerShadowVisible: false,
          headerTintColor: COLORS.primaryText,
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.headerBlock}>
            <Text style={styles.title}>New Registration</Text>
            <Text style={styles.subtitle}>
              Fill in the details to add a new pack member.
            </Text>
          </View>

          {/* Basic Info */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="paw" size={20} color={COLORS.accent} />
              <Text style={styles.sectionTitle}>Basic Info</Text>
            </View>
            <View style={styles.row}>
              <InputGroup
                label="Name *"
                value={form.name}
                onChangeText={(t) => updateForm("name", t)}
                style={{ flex: 1 }}
              />
              <InputGroup
                label="Age *"
                value={form.age}
                onChangeText={(t) => updateForm("age", t)}
                keyboardType="numeric"
                style={{ width: 80 }}
              />
            </View>
            <InputGroup
              label="Breed *"
              value={form.breed}
              onChangeText={(t) => updateForm("breed", t)}
            />
            <View style={styles.row}>
              <InputGroup
                label="Gender *"
                value={form.gender}
                onChangeText={(t) => updateForm("gender", t)}
                style={{ flex: 1 }}
              />
              <InputGroup
                label="Color"
                value={form.color}
                onChangeText={(t) => updateForm("color", t)}
                style={{ flex: 1 }}
              />
            </View>
          </View>

          {/* Vet Details */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="medkit" size={20} color={COLORS.accent} />
              <Text style={styles.sectionTitle}>Veterinary Details</Text>
            </View>
            <InputGroup
              label="Vet Name"
              value={form.vetName}
              onChangeText={(t) => updateForm("vetName", t)}
            />
            <InputGroup
              label="Vet Contact"
              value={form.vetContact}
              onChangeText={(t) => updateForm("vetContact", t)}
              keyboardType="phone-pad"
            />
          </View>

          {/* Emergency */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons
                name="shield-alert"
                size={20}
                color={COLORS.accent}
              />
              <Text style={styles.sectionTitle}>Emergency Contact</Text>
            </View>
            <InputGroup
              label="Contact Name *"
              value={form.emergencyName}
              onChangeText={(t) => updateForm("emergencyName", t)}
            />
            <InputGroup
              label="Phone Number *"
              value={form.emergencyPhone}
              onChangeText={(t) => updateForm("emergencyPhone", t)}
              keyboardType="phone-pad"
            />
            <InputGroup
              label="Relation *"
              value={form.emergencyRelation}
              onChangeText={(t) => updateForm("emergencyRelation", t)}
            />
          </View>

          {/* Documents */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="document-text" size={20} color={COLORS.accent} />
              <Text style={styles.sectionTitle}>Health Certificates (PDF)</Text>
            </View>

            <DocumentRow
              label="Parvo"
              file={files.parvo}
              onPick={() => pickDocument("parvo")}
              expiry={expiries.parvo}
              onOpenPicker={() => openDatePicker("parvo")}
            />
            <DocumentRow
              label="Rabies"
              file={files.rabies}
              onPick={() => pickDocument("rabies")}
              expiry={expiries.rabies}
              onOpenPicker={() => openDatePicker("rabies")}
            />
            <DocumentRow
              label="Fecal"
              file={files.fecal}
              onPick={() => pickDocument("fecal")}
              expiry={expiries.fecal}
              onOpenPicker={() => openDatePicker("fecal")}
            />
            <DocumentRow
              label="Lepto"
              file={files.lepto}
              onPick={() => pickDocument("lepto")}
              expiry={expiries.lepto}
              onOpenPicker={() => openDatePicker("lepto")}
            />
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.disabledBtn]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.submitText}>Save Pet Profile</Text>
            )}
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Picker Logic */}
      {showDatePicker &&
        (Platform.OS === "ios" ? (
          <Modal transparent animationType="slide" visible={showDatePicker}>
            <View style={styles.iosModalOverlay}>
              <View style={styles.iosModalContent}>
                <View style={styles.iosModalHeader}>
                  <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                    <Text style={{ color: "red", fontSize: 16 }}>Cancel</Text>
                  </TouchableOpacity>
                  <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                    Select Expiry
                  </Text>
                  <TouchableOpacity onPress={confirmIOSDate}>
                    <Text
                      style={{
                        color: COLORS.accent,
                        fontWeight: "bold",
                        fontSize: 16,
                      }}
                    >
                      Done
                    </Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={tempDate}
                  mode="date"
                  display="spinner"
                  onChange={onDateChange}
                  textColor="black"
                />
              </View>
            </View>
          </Modal>
        ) : (
          <DateTimePicker
            value={tempDate}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        ))}
    </SafeAreaView>
  );
}

// Helpers
const InputGroup = ({ label, style, ...props }) => (
  <View style={[styles.inputContainer, style]}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={styles.input}
      placeholderTextColor={COLORS.placeholder}
      {...props}
    />
  </View>
);

const DocumentRow = ({ label, file, onPick, expiry, onOpenPicker }) => (
  <View style={styles.docRow}>
    <View style={{ flex: 1, marginRight: 10 }}>
      <Text style={styles.label}>{label} Certificate</Text>
      <TouchableOpacity style={styles.fileBtn} onPress={onPick}>
        <Feather
          name={file ? "check-circle" : "upload"}
          size={16}
          color={file ? "green" : COLORS.secondaryText}
        />
        <Text
          style={[
            styles.fileBtnText,
            file && { color: "green", fontWeight: "600" },
          ]}
          numberOfLines={1}
        >
          {file ? file.name : "Select PDF"}
        </Text>
      </TouchableOpacity>
    </View>
    <View style={{ width: 130 }}>
      <Text style={styles.label}>Expiry Date</Text>
      <TouchableOpacity
        style={[styles.input, styles.dateBtn]}
        onPress={onOpenPicker}
      >
        <Text
          style={{ color: expiry ? COLORS.primaryText : COLORS.placeholder }}
        >
          {expiry || "Select Date"}
        </Text>
        <Feather name="calendar" size={16} color={COLORS.placeholder} />
      </TouchableOpacity>
    </View>
  </View>
);

// Styles
const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  scrollContent: { padding: 20 },
  headerBlock: { marginBottom: 20 },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.primaryText,
    marginBottom: 5,
  },
  subtitle: { fontSize: 14, color: COLORS.secondaryText },
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    paddingBottom: 10,
    gap: 10,
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: COLORS.primaryText },
  row: { flexDirection: "row", gap: 15 },
  inputContainer: { marginBottom: 15 },
  label: {
    fontSize: 13,
    color: COLORS.secondaryText,
    fontWeight: "600",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#FAFAFA",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: COLORS.primaryText,
  },
  docRow: { flexDirection: "row", alignItems: "flex-end", marginBottom: 15 },
  fileBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderStyle: "dashed",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  fileBtnText: { fontSize: 13, color: COLORS.secondaryText, flex: 1 },
  dateBtn: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  submitBtn: {
    backgroundColor: COLORS.primaryText,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  disabledBtn: { opacity: 0.7 },
  submitText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
  iosModalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  iosModalContent: {
    backgroundColor: "white",
    paddingBottom: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  iosModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    borderBottomWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#f9f9f9",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
});
