import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
  Alert,
  Linking,
  ScrollView,
  ImageBackground,
} from "react-native";

import {
  Settings,
  CircleHelp,
  Info,
  Shield,
  FileText,
  Trash2,
  ChevronRight,
  LogOut,
} from "lucide-react-native";

import { useAuthStore } from "../stores/authStore";
import { useFoodStore, FoodEntry } from "../stores/foodStore";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";
import { useNavigation } from "@react-navigation/native";

import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { apiClient } from "../services/api";

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const { historyFoods, setHistoryFoods } = useFoodStore();
  const navigation = useNavigation<any>();

  React.useEffect(() => {
    const loadHistory = async () => {
      try {
        const resp = await apiClient.getHistory(0, 1, 1000);

        setHistoryFoods(resp.data.foods || []);
      } catch (e) {
        console.error(
          "Failed to load history for profile stats",
          e
        );
      }
    };

    loadHistory();
  }, [setHistoryFoods]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      await GoogleSignin.signOut();

      await logout();
    } catch (error) {
      console.error("Logout error:", error);
      alert("Failed to logout");
    }
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? All your entries will be removed and this action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await apiClient.deleteAccount();

              await handleLogout();

              const {
                clearAllDailyFoods,
                setHistoryFoods,
              } = useFoodStore.getState();

              clearAllDailyFoods();
              setHistoryFoods([]);
            } catch (err) {
              console.error(
                "Delete account failed",
                err
              );

              alert("Failed to delete account");
            }
          },
        },
      ]
    );
  };

  const openLinkPlaceholder = () => {
    // placeholder
  };

  const weeklyFoods = historyFoods.filter(
    (f: FoodEntry) => {
      const created = new Date(f.createdAt);
      const now = new Date();

      return (
        now.getTime() - created.getTime() <=
        7 * 24 * 60 * 60 * 1000
      );
    }
  ).length;

  const firstLetter =
    user?.displayName?.charAt(0)?.toUpperCase() || "U";

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: 30,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* TOP SECTION */}
        <ImageBackground
  source={require("../assets/ProfileBg.png")}
  style={styles.topSection}
  // imageStyle={styles.topBackgroundImage}
>
        {/* PROFILE */}
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {firstLetter}
              </Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.userName}>
                {user?.displayName || "User"}
              </Text>

              <Text style={styles.userEmail}>
                {user?.email}
              </Text>
            </View>
          </View>

          {/* STATS */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {historyFoods.length}
              </Text>

              <Text style={styles.statLabel}>
                Total Foods
              </Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {weeklyFoods}
              </Text>

              <Text style={styles.statLabel}>
                This Week
              </Text>
            </View>
          </View>
</ImageBackground>
        {/* <View style={styles.topSection}>
          
        </View> */}

        {/* MENU */}
        <View style={styles.menuContainer}>
          {/* SETTINGS */}
          {/* <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <Settings
                size={20}
                color="#4CAF50"
                strokeWidth={2}
              />

              <Text style={styles.menuText}>
                Settings
              </Text>
            </View>

            <ChevronRight
              size={20}
              color="#999"
            />
          </TouchableOpacity> */}

          {/* HELP */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() =>
              Linking.openURL(
                "https://lemonchiffon-heron-497115.hostingersite.com/Help-Support.html"
              )
            }
          >
            <View style={styles.menuLeft}>
              <CircleHelp
                size={20}
                color="#4CAF50"
                strokeWidth={2}
              />

              <Text style={styles.menuText}>
                Help & Support
              </Text>
            </View>

            <ChevronRight
              size={20}
              color="#999"
            />
          </TouchableOpacity>

          {/* ABOUT */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() =>
              navigation.navigate("About")
            }
          >
            <View style={styles.menuLeft}>
              <Info
                size={20}
                color="#4CAF50"
                strokeWidth={2}
              />

              <Text style={styles.menuText}>
                About
              </Text>
            </View>

            <ChevronRight
              size={20}
              color="#999"
            />
          </TouchableOpacity>

          {/* PRIVACY */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={openLinkPlaceholder}
          >
            <View style={styles.menuLeft}>
              <Shield
                size={20}
                color="#4CAF50"
                strokeWidth={2}
              />

              <Text style={styles.menuText}>
                Privacy Policy
              </Text>
            </View>

            <ChevronRight
              size={20}
              color="#999"
            />
          </TouchableOpacity>

          {/* TERMS */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={openLinkPlaceholder}
          >
            <View style={styles.menuLeft}>
              <FileText
                size={20}
                color="#4CAF50"
                strokeWidth={2}
              />

              <Text style={styles.menuText}>
                Terms & Conditions
              </Text>
            </View>

            <ChevronRight
              size={20}
              color="#999"
            />
          </TouchableOpacity>

          {/* DELETE */}
          <TouchableOpacity
            style={[
              styles.menuItem,
              {
                borderBottomWidth: 0,
              },
            ]}
            onPress={handleDeleteAccount}
          >
            <View style={styles.menuLeft}>
              <Trash2
                size={20}
                color="#4CAF50"
                strokeWidth={2}
              />

              <Text
                style={[
                  styles.menuText,
                ]}
              >
                Delete Account
              </Text>
            </View>

            <ChevronRight
              size={20}
              color="#999"
            />
          </TouchableOpacity>
        </View>

        {/* LOGOUT */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
        >
          <LogOut
            size={18}
            color="#fff"
            strokeWidth={2.5}
          />

          <Text style={styles.logoutText}>
            Logout
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const PRIMARY_GREEN = "#4CAF50";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop:
      Platform.OS === "android"
        ? StatusBar.currentHeight
        : 0,
  },

  topSection: {
    // backgroundColor: PRIMARY_GREEN,
    paddingHorizontal: 20,
    paddingTop: 24,
    height: 180,
    paddingBottom: 30,
    marginBottom: 50,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },

  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },

  avatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  avatarText: {
    fontSize: 28,
    fontWeight: "700",
    color: PRIMARY_GREEN,
  },

  userName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },

  userEmail: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
  },

  statsContainer: {
    flexDirection: "row",
    position: "absolute",
    bottom: -50,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,

    gap: 14,
  },

  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: "center",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,

    elevation: 3,
  },

  statValue: {
    fontSize: 26,
    fontWeight: "700",
    color: PRIMARY_GREEN,
    marginBottom: 6,
  },

  statLabel: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },

  menuContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 22,
    borderRadius: 18,
    overflow: "hidden",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 4,

    elevation: 2,
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },

  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  menuText: {
    fontSize: 16,
    color: "#222",
    fontWeight: "500",
  },

  logoutBtn: {
    backgroundColor: "#ff3b30",
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,

    shadowColor: "#ff3b30",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,

    elevation: 3,
  },

  logoutText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
});
