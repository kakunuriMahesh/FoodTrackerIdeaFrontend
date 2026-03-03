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
} from "react-native";
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

  // fetch history when profile loads
  React.useEffect(() => {
    const loadHistory = async () => {
      try {
        const resp = await apiClient.getHistory(0, 1, 1000); // request all entries (days=0) with high limit
        setHistoryFoods(resp.data.foods || []);
      } catch (e) {
        console.error("Failed to load history for profile stats", e);
      }
    };
    loadHistory();
  }, [setHistoryFoods]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      await GoogleSignin.signOut(); // Force Google account chooser next time
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
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await apiClient.deleteAccount();
              // clear local state as well
              await handleLogout();
              // reset food store caches
              const { clearAllDailyFoods, setHistoryFoods } = useFoodStore.getState();
              clearAllDailyFoods();
              setHistoryFoods([]);
            } catch (err) {
              console.error("Delete account failed", err);
              alert("Failed to delete account");
            }
          },
        },
      ]
    );
  };

  const openLinkPlaceholder = () => {
    // placeholder for external URL, to be filled by user later
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>👤 Profile</Text>
      </View>

      <View style={styles.content}>
        {/* User Info */}
        <View style={styles.userCard}>
          <Text style={styles.userName}>{user?.displayName || "User"}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        {/* Stats Placeholder */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{historyFoods.length}</Text>
            <Text style={styles.statLabel}>Total Foods</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{
              historyFoods.filter((f: FoodEntry) => {
                const created = new Date(f.createdAt);
                const now = new Date();
                return now.getTime() - created.getTime() <= 7 * 24 * 60 * 60 * 1000;
              }).length
            }</Text>
            <Text style={styles.statLabel}>This Week</Text>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.settingsSection}>
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingLabel}>⚙️ Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem} onPress={() => Linking.openURL("https://lemonchiffon-heron-497115.hostingersite.com/Help-Support.html")}>
            <Text style={styles.settingLabel}>❓ Help & Support</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigation.navigate("About")}
          >
            <Text style={styles.settingLabel}>📋 About</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem} onPress={openLinkPlaceholder}>
            <Text style={styles.settingLabel}>🔒 Privacy Policy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem} onPress={openLinkPlaceholder}>
            <Text style={styles.settingLabel}>📄 Terms & Conditions</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem} onPress={handleDeleteAccount}>
            <Text style={styles.settingLabel}>🗑️ Delete Account</Text>
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
        >
          <Text style={styles.logoutBtnText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  userCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  userName: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#007AFF",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#999",
  },
  settingsSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 20,
  },
  settingItem: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  settingLabel: {
    fontSize: 16,
  },
  logoutBtn: {
    backgroundColor: "#ff3b30",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  logoutBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
