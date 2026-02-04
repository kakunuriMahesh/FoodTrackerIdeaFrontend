import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Platform,
} from "react-native";
import { useAuthStore } from "../stores/authStore";
import {
  GoogleAuthProvider,
  signInWithCredential,
  OAuthProvider,
  OAuthCredential,
} from "firebase/auth";
import { auth } from "../services/firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Google from "expo-auth-session/providers/google";
import * as AppleAuthentication from "expo-apple-authentication";

export default function LoginScreen() {
  const { setUser, setToken, setIsLoading } = useAuthStore();
  const [isLoading, setLocalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Google Sign-In Configuration
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId:
      "144512005460-v70da4omtckabt1jr4r1vlskdabhp9em.apps.googleusercontent.com", // Replace with your Expo Client ID
    clientId:
      "144512005460-v70da4omtckabt1jr4r1vlskdabhp9em.apps.googleusercontent.com", // Replace with your Google Client ID
    // iosClientId: "YOUR_IOS_CLIENT_ID.apps.googleusercontent.com", // Replace with your iOS Client ID
    redirectUri: "https://auth.expo.io/@srcdesigns/frontend",
    androidClientId:
      "144512005460-v70da4omtckabt1jr4r1vlskdabhp9em.apps.googleusercontent.com", // Replace with your Android Client ID
  });

  React.useEffect(() => {
    console.log("🔵 [LoginScreen] Google login response received:", response);

    if (response?.type === "success") {
      console.log("✅ [LoginScreen] Google auth successful, response params:", {
        idToken: response.params.id_token ? "✓ Present" : "✗ Missing",
        accessToken: response.params.access_token ? "✓ Present" : "✗ Missing",
        params: Object.keys(response.params),
      });
      handleGoogleLoginWithToken(response.params);
    } else if (response?.type === "error") {
      console.error("❌ [LoginScreen] Google auth error:", response.params);
      setError("Google authentication failed. Please try again.");
    } else if (response?.type === "dismiss") {
      console.log("⏭️ [LoginScreen] User dismissed Google sign-in");
    }
  }, [response]);

  //   const handleGoogleLoginWithToken = async (params: any) => {
  //     setLocalLoading(true);
  //     setError(null);
  //     try {
  //       const { id_token } = params;
  //       if (!id_token) {
  //         throw new Error("No ID token received from Google");
  //       }

  //       const credential = GoogleAuthProvider.credential(id_token);
  //       const userCredential = await signInWithCredential(auth, credential);
  //       const token = await userCredential.user.getIdToken();
  //       await AsyncStorage.setItem("firebaseToken", token);

  //       setToken(token);
  //       setUser({
  //         uid: userCredential.user.uid,
  //         email: userCredential.user.email || "",
  //         displayName: userCredential.user.displayName || "",
  //         photoURL: userCredential.user.photoURL,
  //       });
  //     } catch (err: any) {
  //       console.error("Google login error:", err);
  //       setError(err.message || "Google login failed");
  //     } finally {
  //       setLocalLoading(false);
  //     }
  //   };

  const handleGoogleLoginWithToken = async (params: any) => {
    console.log(
      "🔄 [handleGoogleLoginWithToken] Starting Google login flow...",
    );
    setLocalLoading(true);
    setError(null);
    try {
      const { id_token } = params;
      console.log("📍 [handleGoogleLoginWithToken] Step 1: Checking ID token");
      if (!id_token) {
        const errorMsg =
          "No ID token received from Google. This is an auth.expo.io configuration issue.";
        console.error("❌ " + errorMsg);
        throw new Error(errorMsg);
      }
      console.log(
        "✅ [handleGoogleLoginWithToken] Step 1 PASSED: ID token present",
      );

      console.log(
        "📍 [handleGoogleLoginWithToken] Step 2: Creating Firebase credential",
      );
      const credential = GoogleAuthProvider.credential(id_token);
      console.log(
        "✅ [handleGoogleLoginWithToken] Step 2 PASSED: Credential created",
      );

      console.log(
        "📍 [handleGoogleLoginWithToken] Step 3: Signing in with Firebase",
      );
      const userCredential = await signInWithCredential(auth, credential);
      console.log(
        "✅ [handleGoogleLoginWithToken] Step 3 PASSED: Firebase sign-in successful",
      );
      console.log("👤 [handleGoogleLoginWithToken] User data:", {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
        photoURL: userCredential.user.photoURL ? "✓ Present" : "✗ None",
      });

      console.log(
        "📍 [handleGoogleLoginWithToken] Step 4: Getting Firebase ID token",
      );
      const token = await userCredential.user.getIdToken();
      console.log(
        "✅ [handleGoogleLoginWithToken] Step 4 PASSED: Firebase token obtained",
      );
      console.log(
        "🔑 [handleGoogleLoginWithToken] Token length:",
        token.length,
        "chars",
      );

      console.log(
        "📍 [handleGoogleLoginWithToken] Step 5: Storing token in AsyncStorage",
      );
      await AsyncStorage.setItem("firebaseToken", token);
      console.log(
        "✅ [handleGoogleLoginWithToken] Step 5 PASSED: Token stored",
      );

      console.log(
        "📍 [handleGoogleLoginWithToken] Step 6: Updating auth store",
      );
      setToken(token);
      setUser({
        uid: userCredential.user.uid,
        email: userCredential.user.email || "",
        displayName: userCredential.user.displayName || "",
        photoURL: userCredential.user.photoURL,
      });
      console.log(
        "✅ [handleGoogleLoginWithToken] Step 6 PASSED: Auth store updated",
      );
      console.log(
        "🎉 [handleGoogleLoginWithToken] Google sign-in completed successfully!",
      );
    } catch (err: any) {
      console.error("❌ [handleGoogleLoginWithToken] ERROR:", {
        message: err.message,
        code: err.code,
        stack: err.stack,
      });
      const errorMessage = err.message || "Google login failed";
      setError(errorMessage);
      setLocalLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    console.log("🔵 [handleGoogleLogin] User clicked Google Sign-In button");
    console.log("📱 [handleGoogleLogin] Current Expo Config:", {
      expoClientId:
        "144512005460-v70da4omtckabt1jr4r1vlskdabhp9em.apps.googleusercontent.com",
      redirectUri: "https://auth.expo.io/@srcdesigns/frontend",
      platform: Platform.OS,
    });
    try {
      console.log("📍 [handleGoogleLogin] Step 1: Calling Google promptAsync");
      const result = await promptAsync();
      console.log("✅ [handleGoogleLogin] Step 1 PASSED: Prompt completed");
      console.log("📊 [handleGoogleLogin] Prompt result type:", result?.type);
    } catch (err: any) {
      console.error("❌ [handleGoogleLogin] ERROR:", {
        message: err.message,
        code: err.code,
        stack: err.stack,
      });
      setError(err.message || "Google login failed");
    }
  };

  const handleAppleLogin = async () => {
    setLocalLoading(true);
    setError(null);
    try {
      if (!AppleAuthentication.isAvailableAsync()) {
        setError("Apple Sign-In is not available on this device");
        setLocalLoading(false);
        return;
      }

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (credential.identityToken) {
        const appleProvider = new OAuthProvider("apple.com");
        const firebaseCredential = new OAuthCredential(
          appleProvider,
          credential.identityToken,
          credential.identityToken,
        );

        const userCredential = await signInWithCredential(
          auth,
          firebaseCredential,
        );
        const token = await userCredential.user.getIdToken();
        await AsyncStorage.setItem("firebaseToken", token);

        setToken(token);
        setUser({
          uid: userCredential.user.uid,
          email: userCredential.user.email || credential.email || "",
          displayName:
            credential.fullName?.givenName ||
            userCredential.user.displayName ||
            "",
          photoURL: userCredential.user.photoURL,
        });
      }
    } catch (err: any) {
      if (err.code === "ERR_REQUEST_CANCELLED") {
        setError(null); // User cancelled
      } else {
        console.error("Apple login error:", err);
        setError(err.message || "Apple login failed");
      }
    } finally {
      setLocalLoading(false);
    }
  };

  // Skip login with default token for testing
  const handleSkipLogin = async () => {
    console.log("⏭️ [LoginScreen] Skipping authentication for testing");
    setLocalLoading(true);
    setError(null);
    try {
      const dummyToken =
        "eyJhbGciOiJSUzI1NiIsImtpZCI6IjRzMWxhMzMifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20iLCJhdWQiOiJmb29kdHJhY2tlci1kYWM0MyIsImF1dGhfdGltZSI6MTcwNzA1MDQwMCwidXNlcl9pZCI6InRlc3RfdXNlcl9pZCIsInN1YiI6InRlc3RfdXNlcl9pZCIsImlhdCI6MTcwNzA1MDQwMCwiZXhwIjo5OTk5OTk5OTk5LCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20ifQ.signature";

      console.log("📝 [handleSkipLogin] Setting dummy token");
      await AsyncStorage.setItem("firebaseToken", dummyToken);
      console.log("✅ [handleSkipLogin] Dummy token stored");

      console.log("📍 [handleSkipLogin] Updating auth store with test user");
      setToken(dummyToken);
      setUser({
        uid: "test_user_id",
        email: "test@example.com",
        displayName: "Test User",
        photoURL: null,
      });
      console.log("🎉 [handleSkipLogin] Test user set - ready to test app!");
    } catch (err: any) {
      console.error("❌ [handleSkipLogin] Error:", err);
      setError("Failed to set test mode");
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.appTitle}>🍽️</Text>
          <Text style={styles.appName}>Food Tracker</Text>
          <Text style={styles.tagline}>
            Track what you eat, remember how it felt
          </Text>
        </View>

        {/* Features */}
        {/* <View style={styles.featuresSection}>
          <View style={styles.feature}>
            <Text style={styles.featureEmoji}>📸</Text>
            <Text style={styles.featureText}>Capture food photos</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureEmoji}>⭐</Text>
            <Text style={styles.featureText}>Rate & review meals</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureEmoji}>📅</Text>
            <Text style={styles.featureText}>Timeline history</Text>
          </View>
        </View> */}

        {/* Login Buttons */}
        <View style={styles.authSection}>
          <TouchableOpacity
            style={styles.googleBtn}
            onPress={handleGoogleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.googleBtnEmoji}>🔵</Text>
                <Text style={styles.authBtnText}>Sign in with Google</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.appleBtn}
            onPress={handleAppleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.appleBtnEmoji}>🍎</Text>
                <Text style={styles.authBtnText}>Sign in with Apple</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipBtn}
            onPress={handleSkipLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#666" />
            ) : (
              <>
                <Text style={styles.skipBtnEmoji}>⏭️</Text>
                <Text style={styles.skipBtnText}>Skip (Testing)</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Auth Error */}
          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By signing in, you agree to our{"\n"}Terms & Privacy Policy
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  heroSection: {
    alignItems: "center",
    marginBottom: 45,
  },
  appTitle: {
    fontSize: 72,
    marginBottom: 6,
  },
  appName: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },
  featuresSection: {
    marginBottom: 40,
  },
  feature: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  featureEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  featureText: {
    fontSize: 14,
    color: "#555",
  },
  errorBox: {
    backgroundColor: "#ffe6e6",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  errorText: {
    color: "#d32f2f",
    fontSize: 13,
    textAlign: "center",
  },
  authSection: {
    gap: 12,
    marginBottom: 40,
  },
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4285f4",
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  googleBtnEmoji: {
    fontSize: 18,
  },
  appleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000",
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  appleBtnEmoji: {
    fontSize: 18,
  },
  skipBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f0f0",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  skipBtnEmoji: {
    fontSize: 18,
  },
  skipBtnText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "500",
  },
  authBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    lineHeight: 18,
  },
});
