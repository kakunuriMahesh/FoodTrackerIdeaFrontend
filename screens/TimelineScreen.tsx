import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { useFoodStore } from "../stores/foodStore";
import { apiClient } from "../services/api";
import { FoodCard } from "../components/FoodCard";

export default function TimelineScreen() {
  const { historyFoods, setHistoryFoods, removeFood } = useFoodStore();
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Fetch history
  const fetchHistory = async (pageNum: number = 1) => {
    if (!hasMore && pageNum > 1) return;

    setIsLoading(true);
    try {
      const response = await apiClient.getHistory(3, pageNum);
      const newFoods = response.data.foods;

      if (pageNum === 1) {
        setHistoryFoods(newFoods);
      } else {
        setHistoryFoods([...historyFoods, ...newFoods]);
      }

      setHasMore(pageNum < response.data.pagination.pages);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchHistory(1);
  }, []);

  // Handle load more
  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchHistory(nextPage);
    }
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>📅 Timeline</Text>
        <Text style={styles.subtitle}>Last 3 days</Text>
      </View>

      {/* Foods List */}
      {isLoading && page === 1 ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : historyFoods.length === 0 ? (
        <View style={styles.centerContent}>
          <Text style={styles.emptyText}>No foods yet</Text>
        </View>
      ) : (
        <FlatList
          data={historyFoods}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <FoodCard
              food={item}
              onDelete={() => handleDeleteFood(item._id)}
            />
          )}
          contentContainerStyle={styles.listContent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isLoading ? <ActivityIndicator size="small" color="#007AFF" /> : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: "#999",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#999",
  },
});
