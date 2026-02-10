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
} from "react-native";
import { useAuthStore } from "../stores/authStore";
import { useFoodStore } from "../stores/foodStore";
import { apiClient } from "../services/api";
import { AddFoodModal } from "../components/AddFoodModal";
import { FoodCard } from "../components/FoodCard";

export default function HomeScreen() {
  const { user } = useAuthStore();
  const { dailyFoodsByDate, setDailyFoods, addFoodToDaily, removeFood } =
    useFoodStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);

  // Format date as YYYY-MM-DD
  const getDateKey = (date: Date) => date.toISOString().split("T")[0];
  const dateKey = getDateKey(selectedDate);
  const dailyFoods = dailyFoodsByDate[dateKey] || [];

  // Fetch daily timeline
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

  const handleRefresh = () => {
    fetchDailyFoods(selectedDate, true);
  };

  // Load foods when date changes
  useEffect(() => {
    fetchDailyFoods(selectedDate);
  }, [selectedDate]);

  // Handlers
  const handlePrevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    
    // Prevent future dates
    if (newDate <= new Date()) {
      setSelectedDate(newDate);
    }
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  const handleFoodAdded = (newFood: any) => {
    addFoodToDaily(newFood);
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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appTitle}>🍽️ Food Tracker</Text>
      </View>

      {/* Date Selector */}
      <View style={styles.dateSelector}>
        <TouchableOpacity onPress={handlePrevDay} style={styles.arrowBtn}>
          <Text style={styles.arrow}>←</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleToday} style={styles.dateDisplay}>
          <Text style={styles.dateText}>{formattedDate}</Text>
          {isToday && <Text style={styles.todayBadge}>Today</Text>}
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={handleNextDay} 
          style={[styles.arrowBtn, isToday && styles.disabledArrowBtn]}
          disabled={isToday}
        >
          <Text style={[styles.arrow, isToday && styles.disabledArrow]}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Add Button */}
      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => setAddModalVisible(true)}
      >
        <Text style={styles.addBtnText}>+</Text>
      </TouchableOpacity>

      {/* Foods List */}
      {isLoading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : dailyFoods.length === 0 ? (
        <View style={styles.centerContent}>
          <Text style={styles.emptyText}>No foods added yet</Text>
          <Text style={styles.emptySubtext}>Tap + Add Food to get started</Text>
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
          scrollEnabled
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      )}

      {/* Add Food Modal */}
      <AddFoodModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onFoodAdded={handleFoodAdded}
        selectedDate={selectedDate} // Pass selected date
      />
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  appTitle: {
    fontSize: 24,
    fontWeight: "700",
  },
  dateSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  arrowBtn: {
    padding: 8,
  },
  arrow: {
    fontSize: 24,
  },
  dateDisplay: {
    alignItems: "center",
    gap: 4,
  },
  dateText: {
    fontSize: 16,
    fontWeight: "600",
  },
  todayBadge: {
    fontSize: 11,
    color: "#007AFF",
    fontWeight: "600",
  },
  addBtn: {
    marginHorizontal: 16,
    marginVertical: 12,
    paddingVertical: 12,
    backgroundColor: "#007AFF",
    borderRadius: 30,
    alignItems: "center",
    position: "absolute",
    bottom: 20,
    right: 16,
    left: 16,
    zIndex: 10,
  },
  addBtnText: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "600",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
  },
  disabledArrowBtn: {
    opacity: 0.3,
  },
  disabledArrow: {
    color: "#ccc",
  },
});
