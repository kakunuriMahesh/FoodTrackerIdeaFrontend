import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Platform,
  StatusBar,
} from "react-native";
import { useAuthStore } from "../stores/authStore";
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Configure Google Sign-In
GoogleSignin.configure({
  // webClientId: "625952089607-cr9l3vd5rnlecj8lrimjsd05dkrek1q3.apps.googleusercontent.com",
  webClientId: "614315366879-a0e0rr97gbis4sh3cgfcvra3uj7j4hm6.apps.googleusercontent.com",
  profileImageSize: 128,
  offlineAccess: true,
});

export default function LoginScreen() {
  const { setUser, setToken } = useAuthStore();
  const [isLoading, setLocalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    console.log("🔵 [LoginScreen] Google Sign-In button pressed");
    setLocalLoading(true);
    setError(null);

    try {
      await GoogleSignin.hasPlayServices();
      console.log("✅ [LoginScreen] Google Play Services available");
      
      const response = await GoogleSignin.signIn();
      console.log("✅ [LoginScreen] Google Sign-In response:", response);
      
      if (isSuccessResponse(response)) {
        const { idToken, user } = response.data;
        
        if (idToken) {
          // Store the token
          await AsyncStorage.setItem("firebaseToken", idToken);
          console.log("✅ [LoginScreen] Token stored in AsyncStorage");

          // Update auth store - this triggers navigation automatically
          setToken(idToken);
          setUser({
            uid: user.id || "",
            email: user.email || "",
            displayName: user.name || "",
            photoURL: user.photo || null,
          });

          console.log("🎉 [LoginScreen] Login complete for:", user.email);
        } else {
          setError("No ID token received");
        }
      } else {
        console.log("❌ [LoginScreen] Google Sign-In failed:", response);
        setError("Google sign-in failed");
      }
    } catch (error) {
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            console.log("⏭️ [LoginScreen] User cancelled sign-in");
            break;
          case statusCodes.IN_PROGRESS:
            setError("Sign-in already in progress");
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            setError("Google Play Services not available");
            break;
          default:
            setError(error.message || "Google sign-in failed");
            break;
        }
      } else {
        setError("Google sign-in failed");
      }
    } finally {
      setLocalLoading(false);
    }
  };


  // Skip login with test token
  const handleSkipLogin = async () => {
    console.log("⏭️ [LoginScreen] Skipping authentication for testing");
    setLocalLoading(true);
    setError(null);
    try {
      const testToken = "test_token_12345";
      await AsyncStorage.setItem("firebaseToken", testToken);
      setToken(testToken);
      setUser({
        uid: "test_user_id",
        email: "test@example.com",
        displayName: "Test User",
        photoURL: null,
      });
      console.log("🎉 [LoginScreen] Test user set!");
    } catch (err: any) {
      console.error("❌ [LoginScreen] Error:", err);
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
            By signing in, you agree to our
          </Text>
          <View style={styles.footerLinks}>
            <TouchableOpacity onPress={() => {}}>
              <Text style={styles.linkText}>Terms</Text>
            </TouchableOpacity>
            <Text style={styles.linkSeparator}>|</Text>
            <TouchableOpacity onPress={() => {}}>
              <Text style={styles.linkText}>Privacy Policy</Text>
            </TouchableOpacity>
          </View>
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
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
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
  errorBox: {
    backgroundColor: "#ffe6e6",
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
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
  footerLinks: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 4,
  },
  linkText: {
    fontSize: 12,
    color: "#007AFF",
    textDecorationLine: "underline",
    marginHorizontal: 4,
  },
  linkSeparator: {
    fontSize: 12,
    color: "#999",
  },
});
