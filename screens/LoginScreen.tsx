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
  StatusBar,
  Image,
  ImageBackground,
} from "react-native";

import { useAuthStore } from "../stores/authStore";

import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";

import AsyncStorage from "@react-native-async-storage/async-storage";

const leafImage = require("../assets/DropImgLogin.png");
const plateSpoonsImage = require("../assets/PlateSpoons.png");

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId:
    "614315366879-a0e0rr97gbis4sh3cgfcvra3uj7j4hm6.apps.googleusercontent.com",
  profileImageSize: 128,
  offlineAccess: true,
});

export default function LoginScreen() {
  const { setUser, setToken } = useAuthStore();

  const [isLoading, setLocalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLocalLoading(true);
    setError(null);

    try {
      await GoogleSignin.hasPlayServices();

      const response = await GoogleSignin.signIn();

      if (isSuccessResponse(response)) {
        const { idToken, user } = response.data;

        if (idToken) {
          await AsyncStorage.setItem("firebaseToken", idToken);

          setToken(idToken);

          setUser({
            uid: user.id || "",
            email: user.email || "",
            displayName: user.name || "",
            photoURL: user.photo || null,
          });
        } else {
          setError("No ID token received");
        }
      } else {
        setError("Google sign-in failed");
      }
    } catch (error: any) {
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.SIGN_IN_CANCELLED:
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

  const handleSkipLogin = async () => {
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
    } catch (err) {
      setError("Failed to set test mode");
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Content */}
        <View style={styles.contentWrapper}>
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <Image source={plateSpoonsImage} style={styles.plateHero} />

            <Text style={styles.appTitle}>Food Tracker</Text>

            <Text style={styles.tagline}>
              Track what you eat,{"\n"}
              remember how it felt
            </Text>
          </View>
        </View>

        {/* Bottom Wave + Buttons */}
        <View style={styles.bottomSection}>
          <ImageBackground
            source={leafImage}
            style={styles.leafDecorWrapper}
            resizeMode="cover"
            imageStyle={styles.leafImage}
          >
            <View style={styles.authSection}>
              {/* Google Login */}
              <TouchableOpacity
                style={styles.googleBtn}
                onPress={handleGoogleLogin}
                disabled={isLoading}
                activeOpacity={0.9}
              >
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <>
                    <View style={styles.googleIconWrapper}>
                      <Text style={styles.googleIcon}>G</Text>
                    </View>

                    <Text style={styles.authBtnText}>
                      Continue with Google
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Skip Button */}
              <TouchableOpacity
                style={styles.skipBtn}
                onPress={handleSkipLogin}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator color="#666" />
                ) : (
                  <>
                    <Text style={styles.skipBtnText}>Skip (Testing)</Text>

                    <Text style={styles.skipBtnArrow}>›</Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Error */}
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
              <TouchableOpacity>
                <Text style={styles.linkText}>Terms</Text>
              </TouchableOpacity>

              <Text style={styles.linkSeparator}>|</Text>

              <TouchableOpacity>
                <Text style={styles.linkText}>Privacy Policy</Text>
              </TouchableOpacity>
            </View>
          </View>
          </ImageBackground>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FBF8",
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: "space-between",
    paddingTop: Platform.OS === "android" ? 70 : 40,
  },

  contentWrapper: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  heroSection: {
    alignItems: "center",
    marginTop: 40,
  },

  plateHero: {
    width: 140,
    height: 140,
    resizeMode: "contain",
    marginBottom: 24,
  },

  appTitle: {
    fontSize: 38,
    fontWeight: "700",
    color: "#163D2A",
    marginBottom: 12,
    letterSpacing: 0.3,
  },

  tagline: {
    fontSize: 16,
    lineHeight: 24,
    color: "#62756A",
    textAlign: "center",
    paddingHorizontal: 20,
  },

  // =========================
  // Bottom Section
  // =========================

  bottomSection: {
    width: "100%",
    marginTop: 40,
    height: '100%',
  },

  leafDecorWrapper: {
    width: "100%",
    height: '60%',
    justifyContent: "flex-end",
    paddingHorizontal: 22,
    paddingBottom: 28,
  },

  leafImage: {
    width: "120%",
    height: "100%",
  },

  authSection: {
    gap: 14,
  },

  googleBtn: {
    height: 58,
    backgroundColor: "#2E8B57",
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#2E8B57",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },

  googleIconWrapper: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  googleIcon: {
    fontSize: 14,
    fontWeight: "700",
    color: "#4285F4",
  },

  authBtnText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.2,
  },

  skipBtn: {
    height: 56,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D7E8DA",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  skipBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2D5F45",
  },

  skipBtnArrow: {
    fontSize: 22,
    color: "#2D5F45",
    marginLeft: 8,
    marginTop: -1,
  },

  errorBox: {
    backgroundColor: "#FFE8E8",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },

  errorText: {
    textAlign: "center",
    color: "#D32F2F",
    fontSize: 13,
    fontWeight: "500",
  },

  footer: {
    alignItems: "center",
    paddingBottom: 28,
    paddingTop: 50,
  },

  footerText: {
    fontSize: 12,
    color: "#7A8D80",
    marginBottom: 4,
  },

  footerLinks: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  linkText: {
    fontSize: 12,
    color: "#2A6B4F",
    textDecorationLine: "underline",
    fontWeight: "500",
    marginHorizontal: 6,
  },

  linkSeparator: {
    color: "#7A8D80",
    fontSize: 12,
  },
});