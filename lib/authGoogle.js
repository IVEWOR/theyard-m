import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { supabase } from "./supabase";
import { ensureUserProfile } from "./ensureUserProfile";

let isSigningIn = false;

export async function signInWithGoogleNative() {
  if (isSigningIn) return;

  try {
    isSigningIn = true;

    await GoogleSignin.hasPlayServices({
      showPlayServicesUpdateDialog: true,
    });

    // Native Google popup
    const response = await GoogleSignin.signIn();

    const idToken = response?.data?.idToken;
    if (!idToken) {
      throw new Error("No Google ID token");
    }

    // Supabase login
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: "google",
      token: idToken,
    });

    if (error) {
      throw error;
    }

    // Ensure User table row exists
    if (data?.user) {
      await ensureUserProfile(data.user);
    }
  } catch (error) {
    if (
      error.code === statusCodes.SIGN_IN_CANCELLED ||
      error.code === statusCodes.IN_PROGRESS
    ) {
      return;
    }
    throw error;
  } finally {
    isSigningIn = false;
  }
}
