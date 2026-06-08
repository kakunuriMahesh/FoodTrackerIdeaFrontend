import React, { useEffect, useState } from "react";
import { StatusBar, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from 'react-native-safe-area-context'; 
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from "./stores/authStore";
import { useFoodStore } from "./stores/foodStore";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./services/firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { House, CalendarDays, User } from "lucide-react-native";
import HomeScreen from "./screens/HomeScreen";
import TimelineScreen from "./screens/TimelineScreen";
import ProfileScreen from "./screens/ProfileScreen";
import LoginScreen from "./screens/LoginScreen";
import AboutScreen from "./screens/AboutScreen";
import AddFoodModal  from "./components/AddFoodModal";
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function AddPlaceholder() {
  return null;
}

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
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="About" component={AboutScreen} />
        </Stack.Navigator>
        <StatusBar barStyle="dark-content" />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

function MainTabs() {
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const addFoodToDaily = useFoodStore((s) => s.addFoodToDaily);

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#2E8B57",
          tabBarInactiveTintColor: "#9CA3AF",
          tabBarStyle: {
            height: 72,
            paddingTop: 8,
            paddingBottom: 10,
            backgroundColor: "#FFFFFF",
            borderTopWidth: 1,
            borderTopColor: "#ECECEC",
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600",
            marginTop: 2,
          },
        }}
      >
        <Tab.Screen
          name="Home"
          options={{
            tabBarLabel: "Today",
            tabBarIcon: ({ color, focused }) => (
              <House
                size={22}
                color={color}
                strokeWidth={focused ? 2.5 : 2}
              />
            ),
          }}
        >
          {() => (
            <HomeScreen
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              onOpenAddModal={() => setAddModalVisible(true)}
            />
          )}
        </Tab.Screen>

        <Tab.Screen
          name="Add"
          component={AddPlaceholder}
          options={{
            tabBarLabel: "Add",
            tabBarIcon: ({ color, focused }) => (
              <View style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: focused ? "#2E8B57" : "#E8F5E9",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <Text style={{
                  color: focused ? "#FFF" : "#2E8B57",
                  fontSize: 22,
                  fontWeight: "700",
                  marginTop: -2,
                }}>＋</Text>
              </View>
            ),
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              setAddModalVisible(true);
            },
          }}
        />

        <Tab.Screen
          name="Timeline"
          component={TimelineScreen}
          options={{
            tabBarLabel: "Timeline",
            tabBarIcon: ({ color, focused }) => (
              <CalendarDays
                size={22}
                color={color}
                strokeWidth={focused ? 2.5 : 2}
              />
            ),
          }}
        />
      </Tab.Navigator>

      <AddFoodModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onFoodAdded={(food) => addFoodToDaily(food)}
        selectedDate={selectedDate}
      />
    </View>
  );
}


