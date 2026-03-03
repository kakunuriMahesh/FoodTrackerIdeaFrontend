import React, { useEffect } from "react";
import { StatusBar, StyleSheet, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from 'react-native-safe-area-context'; 
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from "./stores/authStore";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./services/firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Screens
import HomeScreen from "./screens/HomeScreen";
import TimelineScreen from "./screens/TimelineScreen";
import ProfileScreen from "./screens/ProfileScreen";
import LoginScreen from "./screens/LoginScreen";
import AboutScreen from "./screens/AboutScreen";
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

export default function App() {
  const { user, setUser, setIsLoading } = useAuthStore();

  useEffect(() => {
    console.log("🚀 [App] Initializing Firebase auth state listener");
    
    // Initialize auth state
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("🔄 [App] Auth state changed");
      
      if (firebaseUser) {
        console.log("✅ [App] User is authenticated");
        console.log("👤 [App] Firebase user data:", {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL ? "✓ Present" : "✗ None",
        });

        try {
          console.log("📍 [App] Getting Firebase ID token...");
          const token = await firebaseUser.getIdToken();
          console.log("✅ [App] Token obtained, length:", token.length, "chars");
          
          console.log("📍 [App] Storing token to AsyncStorage...");
          await AsyncStorage.setItem("firebaseToken", token);
          console.log("✅ [App] Token stored successfully");

          console.log("📍 [App] Updating Zustand auth store...");
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || "",
            displayName: firebaseUser.displayName || "",
            photoURL: firebaseUser.photoURL,
          });
          console.log("✅ [App] Auth store updated");
        } catch (err: any) {
          console.error("❌ [App] Error during auth initialization:", {
            message: err.message,
            code: err.code,
            stack: err.stack,
          });
        }
      } else {
        console.log("❌ [App] User is NOT authenticated (no firebaseUser)");
        setUser(null);
        console.log("📍 [App] Removing token from AsyncStorage...");
        await AsyncStorage.removeItem("firebaseToken");
        console.log("✅ [App] Token removed");
      }
      
      console.log("📍 [App] Setting isLoading to false");
      setIsLoading(false);
      console.log("✅ [App] App ready for user interaction");
    });

    return () => {
      console.log("🔴 [App] Cleaning up auth state listener");
      unsubscribe();
    };
  }, [setUser, setIsLoading]);

  console.log("🎨 [App] Rendering - user state:", user ? `Logged in as ${user.email}` : "Not logged in");

  if (!user) {
    console.log("📱 [App] Showing LoginScreen");
    return <LoginScreen />;
  }

  console.log("📱 [App] Showing MainApp (Stack + Tabs)");
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="About" component={AboutScreen} />
        </Stack.Navigator>
        <StatusBar barStyle="dark-content" />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "#ccc",
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: "Today",
          tabBarIcon: ({ color }) => <Text style={{ color }}>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="Timeline"
        component={TimelineScreen}
        options={{
          tabBarLabel: "Timeline",
          tabBarIcon: ({ color }) => <Text style={{ color }}>📅</Text>,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ color }) => <Text style={{ color }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
