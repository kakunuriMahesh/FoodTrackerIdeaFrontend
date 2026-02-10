import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  TextInput,
  Platform,
  StatusBar,
  RefreshControl,
} from "react-native";
import { useFoodStore } from "../stores/foodStore";
import { apiClient } from "../services/api";
import { FoodCard } from "../components/FoodCard";
import { useFocusEffect } from "@react-navigation/native";
import { FoodEntry } from "../stores/foodStore";

export default function TimelineScreen() {
  const { historyFoods, setHistoryFoods, appendHistoryFoods, removeFood } = useFoodStore();
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // Use a ref to track hasMore for the check to avoid dependency loop
  const hasMoreRef = React.useRef(true);
  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch history
  const fetchHistory = useCallback(async (pageNum: number = 1, isRefreshing = false) => {
    if (!hasMoreRef.current && pageNum > 1 && !isRefreshing) return;

    if (isRefreshing) setRefreshing(true);
    else setIsLoading(true);

    try {
      const response = await apiClient.getHistory(3, pageNum);
      const newFoods: FoodEntry[] = response.data.foods;

      if (pageNum === 1) {
        setHistoryFoods(newFoods);
      } else {
        appendHistoryFoods(newFoods);
      }

      const stillHasMore = pageNum < response.data.pagination.pages;
      setHasMore(stillHasMore);
      setPage(pageNum);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [setHistoryFoods, appendHistoryFoods]);

  const handleRefresh = () => {
    setHasMore(true);
    fetchHistory(1, true);
  };

  // Refresh on focus
  useFocusEffect(
    useCallback(() => {
      fetchHistory(1);
    }, [fetchHistory])
  );

  // Search functionality
  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    
    if (query.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await apiClient.searchFood(query.trim());
      setSearchResults(response.data.foods);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchHistory(1);
  }, []);

  // Handle load more
  const handleLoadMore = () => {
    if (hasMore && !isLoading && searchQuery.trim().length < 2) {
      const nextPage = page + 1;
      fetchHistory(nextPage);
    }
  };

  const handleDeleteFood = async (foodId: string) => {
    try {
      await apiClient.deleteFood(foodId);
      removeFood(foodId);
      // Also remove from search results
      setSearchResults(prev => prev.filter(f => f._id !== foodId));
    } catch (error) {
      console.error("Error deleting food:", error);
      alert("Failed to delete food");
    }
  };

  // Display data - search results or history
  const displayData = searchQuery.trim().length >= 2 ? searchResults : historyFoods;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>📅 Timeline</Text>
        
        {/* Search Bar */}
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Search foods, tags, notes..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={handleSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {/* Foods List */}
      {(isLoading && page === 1) || isSearching ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : displayData.length === 0 ? (
        <View style={styles.centerContent}>
          <Text style={styles.emptyText}>
            {searchQuery ? "No results found" : "No foods yet"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={displayData}
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
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
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
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    fontSize: 16,
    color: "#333",
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
