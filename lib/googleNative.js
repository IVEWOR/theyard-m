import { GoogleSignin } from "@react-native-google-signin/google-signin";

export function configureGoogleSignIn() {
  GoogleSignin.configure({
    // MUST be Web Application OAuth Client ID
    webClientId:
      "451344283008-4piccc7djbnfmeaeu2ks7q9b165k2fis.apps.googleusercontent.com",

    // REQUIRED to receive ID token
    requestIdToken: true,

    scopes: ["profile", "email"],
    offlineAccess: false,
    forceCodeForRefreshToken: false,
  });
}
