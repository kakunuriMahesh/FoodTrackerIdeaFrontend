import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  StatusBar,
  RefreshControl,
  Image,
} from "react-native";

import { useFoodStore } from "../stores/foodStore";
import { apiClient } from "../services/api";
import { useNavigation } from "@react-navigation/native";
import { User } from "lucide-react-native";

import { FoodCard } from "../components/FoodCard";

const emptyFoodImage = require("../assets/ListPad.png");

interface HomeScreenProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onOpenAddModal: () => void;
}

export default function HomeScreen({
  selectedDate,
  onDateChange,
  onOpenAddModal,
}: HomeScreenProps) {
  const navigation = useNavigation<any>();

  const { dailyFoodsByDate, setDailyFoods, removeFood } =
    useFoodStore();

  const [isLoading, setIsLoading] = useState(false);

  const [refreshing, setRefreshing] = useState(false);

  // Format date
  const getDateKey = (date: Date) => date.toISOString().split("T")[0];

  const dateKey = getDateKey(selectedDate);

  const dailyFoods = dailyFoodsByDate[dateKey] || [];

  // Fetch timeline
  const fetchDailyFoods = async (date: Date, isRefreshing = false) => {
    if (isRefreshing) setRefreshing(true);
    else setIsLoading(true);

    try {
      const currentKey = getDateKey(date);

      const response = await apiClient.getDailyTimeline(currentKey);

      setDailyFoods(currentKey, response.data.foods);
    } catch (error) {
      console.error("Error fetching daily foods:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDailyFoods(selectedDate);
  }, [selectedDate]);

  const handleRefresh = () => {
    fetchDailyFoods(selectedDate, true);
  };

  const handlePrevDay = () => {
    const newDate = new Date(selectedDate);

    newDate.setDate(newDate.getDate() - 1);

    onDateChange(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);

    newDate.setDate(newDate.getDate() + 1);

    if (newDate <= new Date()) {
      onDateChange(newDate);
    }
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  const handleDeleteFood = async (foodId: string) => {
    try {
      await apiClient.deleteFood(foodId);

      removeFood(foodId);
    } catch (error) {
      console.error("Error deleting food:", error);

      alert("Failed to delete food");
    }
  };

  const isToday =
    getDateKey(selectedDate) === getDateKey(new Date());

  const formattedDate = selectedDate.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      {/* ================= HEADER ================= */}

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Food Tracker</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
          <User size={22} color="#2E8B57" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {/* ================= DATE SELECTOR ================= */}

      <View style={styles.dateSelector}>
        <TouchableOpacity
          onPress={handlePrevDay}
          style={styles.dateArrowBtn}
        >
          <Text style={styles.dateArrow}>‹</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleToday}
          style={styles.dateCenter}
        >
          <Text style={styles.dateText}>{formattedDate}</Text>

          {isToday && (
            <Text style={styles.todayText}>Today</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleNextDay}
          disabled={isToday}
          style={[
            styles.dateArrowBtn,
            isToday && styles.disabledArrowBtn,
          ]}
        >
          <Text
            style={[
              styles.dateArrow,
              isToday && styles.disabledArrow,
            ]}
          >
            ›
          </Text>
        </TouchableOpacity>
      </View>

      {/* ================= CONTENT ================= */}

      {isLoading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#2E8B57" />
        </View>
      ) : dailyFoods.length === 0 ? (
        <View style={styles.emptyContainer}>
          {/* Empty Image */}
          <Image
            source={emptyFoodImage}
            style={styles.emptyImage}
          />

          <Text style={styles.emptyTitle}>
            No foods added yet
          </Text>

          <Text style={styles.emptySubtitle}>
            Tap + Add Food to get started
          </Text>
        </View>
      ) : (
        <FlatList
          data={dailyFoods}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <FoodCard
              food={item}
              onDelete={() => handleDeleteFood(item._id)}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* ================= FLOATING ADD BUTTON ================= */}

      {/* <TouchableOpacity
        style={styles.floatingBtn}
        activeOpacity={0.8}
        onPress={onOpenAddModal}
      >
        <Text style={styles.floatingBtnText}>＋</Text>
      </TouchableOpacity> */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8F7",
    paddingTop:
      Platform.OS === "android"
        ? StatusBar.currentHeight
        : 0,
  },

  // ================= HEADER =================

  header: {
    height: 64,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
  },

  // ================= DATE =================

  dateSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 20,
    backgroundColor: "#FFFFFF",
  },

  dateArrowBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },

  dateArrow: {
    fontSize: 28,
    color: "#222",
  },

  dateCenter: {
    alignItems: "center",
    gap: 6,
  },

  dateText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
  },

  todayText: {
    fontSize: 13,
    color: "#2E8B57",
    fontWeight: "700",
  },

  disabledArrowBtn: {
    opacity: 0.25,
  },

  disabledArrow: {
    color: "#999",
  },

  // ================= EMPTY =================

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
    marginBottom: 100,
  },

  emptyImage: {
    width: 220,
    height: 220,
    resizeMode: "contain",
    marginBottom: 24,
  },

  emptyTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111",
    marginBottom: 10,
  },

  emptySubtitle: {
    fontSize: 15,
    color: "#7A7A7A",
    textAlign: "center",
  },

  // ================= LIST =================

  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 140,
  },

  // ================= FLOATING BUTTON =================

  floatingBtn: {
    position: "absolute",
    bottom: 95,
    alignSelf: "center",

    width: 68,
    height: 68,
    borderRadius: 34,

    backgroundColor: "#2E8B57",

    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#2E8B57",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },

  floatingBtnText: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "400",
    marginTop: -2,
  },

  // ================= COMMON =================

  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});