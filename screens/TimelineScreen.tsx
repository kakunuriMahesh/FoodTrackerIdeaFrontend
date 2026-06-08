import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";

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
  TouchableOpacity,
  Modal,
} from "react-native";

import {
  Search,
  CalendarDays,
} from "lucide-react-native";

import { useFoodStore } from "../stores/foodStore";
import { apiClient } from "../services/api";
import { useFocusEffect } from "@react-navigation/native";
import { FoodEntry } from "../stores/foodStore";
import { FoodCard } from "../components/FoodCard";

export default function TimelineScreen() {
  const {
    historyFoods,
    setHistoryFoods,
    appendHistoryFoods,
    removeFood,
  } = useFoodStore();

  const [isLoading, setIsLoading] =
    useState(false);

  const [refreshing, setRefreshing] =
    useState(false);

  const [page, setPage] = useState(1);

  const [hasMore, setHasMore] =
    useState(true);

  const hasMoreRef = React.useRef(true);

  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  // ================= DATE FILTER =================

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  const formattedSelectedDate = selectedDate
    ? selectedDate.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setShowDatePicker(false);
  };

  const handleClearDate = () => {
    setSelectedDate(null);
    setShowDatePicker(false);
  };

  const todayStr = new Date().toISOString().split("T")[0];

  const calendarGrid = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();

    const weeks: (Date | null)[][] = [];
    let week: (Date | null)[] = [];

    for (let i = 0; i < firstDay; i++) {
      week.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      week.push(date);
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
    }

    if (week.length > 0) {
      while (week.length < 7) week.push(null);
      weeks.push(week);
    }

    return { weeks, month, year };
  }, [calendarMonth]);

  const monthLabel = calendarMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const isFutureDay = (date: Date) => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return date > today;
  };

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // ================= SEARCH =================

  const [searchQuery, setSearchQuery] =
    useState("");

  const [searchResults, setSearchResults] =
    useState<any[]>([]);

  const [isSearching, setIsSearching] =
    useState(false);

  // ================= FETCH HISTORY =================

  const fetchHistory = useCallback(
    async (
      pageNum: number = 1,
      isRefreshing = false
    ) => {
      if (
        !hasMoreRef.current &&
        pageNum > 1 &&
        !isRefreshing
      ) {
        return;
      }

      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        const response =
          await apiClient.getHistory(
            3,
            pageNum
          );

        const newFoods: FoodEntry[] =
          response.data.foods;

        if (pageNum === 1) {
          setHistoryFoods(newFoods);
        } else {
          appendHistoryFoods(newFoods);
        }

        const stillHasMore =
          pageNum <
          response.data.pagination.pages;

        setHasMore(stillHasMore);

        setPage(pageNum);
      } catch (error) {
        console.error(
          "Error fetching history:",
          error
        );
      } finally {
        setIsLoading(false);
        setRefreshing(false);
      }
    },
    [setHistoryFoods, appendHistoryFoods]
  );

  // ================= REFRESH =================

  const handleRefresh = () => {
    setHasMore(true);
    fetchHistory(1, true);
  };

  // ================= SCREEN FOCUS =================

  useFocusEffect(
    useCallback(() => {
      fetchHistory(1);
    }, [fetchHistory])
  );

  // ================= SEARCH =================

  const handleSearch = useCallback(
    async (query: string) => {
      setSearchQuery(query);

      if (query.trim().length < 2) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);

      try {
        const response =
          await apiClient.searchFood(
            query.trim()
          );

        setSearchResults(response.data.foods);
      } catch (error) {
        console.error(
          "Search error:",
          error
        );
      } finally {
        setIsSearching(false);
      }
    },
    []
  );

  // ================= INITIAL LOAD =================

  useEffect(() => {
    fetchHistory(1);
  }, []);

  // ================= LOAD MORE =================

  const handleLoadMore = () => {
    if (
      hasMore &&
      !isLoading &&
      searchQuery.trim().length < 2
    ) {
      fetchHistory(page + 1);
    }
  };

  // ================= DELETE FOOD =================

  const handleDeleteFood = async (
    foodId: string
  ) => {
    try {
      await apiClient.deleteFood(foodId);

      removeFood(foodId);

      setSearchResults((prev) =>
        prev.filter((f) => f._id !== foodId)
      );
    } catch (error) {
      console.error(
        "Error deleting food:",
        error
      );

      alert("Failed to delete food");
    }
  };

  // ================= DISPLAY DATA =================

  const displayData = useMemo(() => {
    let data = searchQuery.trim().length >= 2
      ? searchResults
      : historyFoods;

    if (selectedDate) {
      const key = selectedDate.toISOString().split("T")[0];
      data = data.filter((food) => food.dateKey === key);
    }

    return data;
  }, [historyFoods, searchResults, searchQuery, selectedDate]);

  // ================= GROUP BY DATE =================

  const groupedFoods = useMemo(() => {
    const grouped: Record<
      string,
      FoodEntry[]
    > = {};

    displayData.forEach((food) => {
      const date = new Date(
        food.createdAt
      ).toDateString();

      if (!grouped[date]) {
        grouped[date] = [];
      }

      grouped[date].push(food);
    });

    return Object.entries(grouped).map(
      ([date, foods]) => ({
        date,
        foods,
      })
    );
  }, [displayData]);

  // ================= FORMAT DATE =================

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );
  };

  // ================= RENDER GROUP =================

  const renderFoodItem = ({
    item,
  }: {
    item: {
      date: string;
      foods: FoodEntry[];
    };
  }) => {
    return (
      <View style={styles.dateSection}>
        {/* DATE */}
        <Text style={styles.dateText}>
          {formatDate(item.date)}
        </Text>

        {/* FOODS */}
        {item.foods.map((food) => (
          <FoodCard
            key={food._id}
            food={food}
            onDelete={() =>
              handleDeleteFood(food._id)
            }
          />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* ================= HEADER ================= */}

      <View style={styles.header}>
        <Text style={styles.title}>
          Timeline
        </Text>

        {/* SEARCH */}
        <View style={styles.searchContainer}>
          <Search
            size={18}
            color="#888"
          />

          <TextInput
            style={styles.searchInput}
            placeholder="Search foods, tags, notes..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={handleSearch}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TouchableOpacity onPress={() => { setCalendarMonth(selectedDate || new Date()); setShowDatePicker(true); }}>
            <CalendarDays
              size={20}
              color={selectedDate ? "#2E8B57" : "#888"}
              strokeWidth={selectedDate ? 2.5 : 2}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* ================= DATE FILTER BANNER ================= */}

      {selectedDate && (
        <View style={styles.dateFilterBanner}>
          <Text style={styles.dateFilterText}>
            Showing foods for {formattedSelectedDate}
          </Text>
          <TouchableOpacity onPress={handleClearDate}>
            <Text style={styles.dateFilterClear}>Clear</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ================= CONTENT ================= */}

      {(isLoading && page === 1) ||
      isSearching ? (
        <View style={styles.centerContent}>
          <ActivityIndicator
            size="large"
            color="#4CAF50"
          />
        </View>
      ) : groupedFoods.length === 0 ? (
        <View style={styles.centerContent}>
          <Text style={styles.emptyText}>
            {searchQuery
              ? "No results found"
              : "No foods yet"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={groupedFoods}
          keyExtractor={(item) => item.date}
          renderItem={renderFoodItem}
          contentContainerStyle={
            styles.listContent
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
            />
          }
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            isLoading ? (
              <ActivityIndicator
                size="small"
                color="#4CAF50"
              />
            ) : null
          }
        />
      )}
      {/* ================= DATE PICKER MODAL ================= */}

      <Modal
        visible={showDatePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDatePicker(false)}
        >
          <TouchableOpacity
            style={styles.datePickerModal}
            activeOpacity={1}
            onPress={() => {}}
          >
            <Text style={styles.datePickerTitle}>Select Date</Text>

            {/* Month/Year header */}
            <View style={styles.calendarHeader}>
              <TouchableOpacity
                onPress={() => {
                  const d = new Date(calendarMonth);
                  d.setMonth(d.getMonth() - 1);
                  setCalendarMonth(d);
                }}
                style={styles.calendarNavBtn}
              >
                <Text style={styles.calendarNavArrow}>‹</Text>
              </TouchableOpacity>

              <Text style={styles.calendarMonthLabel}>{monthLabel}</Text>

              <TouchableOpacity
                onPress={() => {
                  const d = new Date(calendarMonth);
                  d.setMonth(d.getMonth() + 1);
                  if (d <= new Date()) setCalendarMonth(d);
                }}
                style={styles.calendarNavBtn}
              >
                <Text style={styles.calendarNavArrow}>›</Text>
              </TouchableOpacity>
            </View>

            {/* Day labels */}
            <View style={styles.calendarWeekRow}>
              {dayLabels.map((label) => (
                <Text key={label} style={styles.calendarDayLabel}>
                  {label}
                </Text>
              ))}
            </View>

            {/* Calendar grid */}
            {calendarGrid.weeks.map((week, wi) => (
              <View key={wi} style={styles.calendarWeekRow}>
                {week.map((date, di) => (
                  <TouchableOpacity
                    key={di}
                    style={[
                      styles.calendarDayCell,
                      date && isSameDay(date, new Date()) && styles.calendarDayToday,
                      date && selectedDate && isSameDay(date, selectedDate) && styles.calendarDaySelected,
                    ]}
                    onPress={() => {
                      if (date && !isFutureDay(date)) {
                        handleDateSelect(date);
                      }
                    }}
                    disabled={!date || isFutureDay(date)}
                  >
                    <Text style={[
                      styles.calendarDayText,
                      date && isSameDay(date, new Date()) && styles.calendarDayTextToday,
                      date && selectedDate && isSameDay(date, selectedDate) && styles.calendarDayTextSelected,
                      date && isFutureDay(date) && styles.calendarDayTextDisabled,
                    ]}>
                      {date ? date.getDate() : ""}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}

            <View style={styles.dateActions}>
              <TouchableOpacity
                onPress={handleClearDate}
                style={styles.dateActionBtn}
              >
                <Text style={styles.dateActionBtnText}>Show All</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f6f6",
    paddingTop:
      Platform.OS === "android"
        ? StatusBar.currentHeight
        : 0,
  },

  // ================= HEADER =================

  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 16,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111",
    marginBottom: 16,
    textAlign: "center",
  },

  // ================= DATE FILTER BANNER =================

  dateFilterBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 18,
    paddingVertical: 10,
  },

  dateFilterText: {
    fontSize: 13,
    color: "#2E7D32",
    fontWeight: "600",
    flex: 1,
  },

  dateFilterClear: {
    fontSize: 13,
    color: "#2E8B57",
    fontWeight: "700",
    marginLeft: 12,
  },

  // ================= SEARCH =================

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f1f1",
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
  },

  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: "#222",
  },

  // ================= MODAL =================

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  datePickerModal: {
    width: 300,
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
  },

  datePickerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
    marginBottom: 16,
  },

  // ================= CALENDAR =================

  calendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 16,
  },

  calendarNavBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },

  calendarNavArrow: {
    fontSize: 20,
    color: "#333",
    fontWeight: "600",
  },

  calendarMonthLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
  },

  calendarWeekRow: {
    flexDirection: "row",
    width: "100%",
    marginBottom: 4,
  },

  calendarDayLabel: {
    flex: 1,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "600",
    color: "#9CA3AF",
    paddingVertical: 6,
  },

  calendarDayCell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: 36,
    borderRadius: 8,
  },

  calendarDayToday: {
    backgroundColor: "#F3F4F6",
  },

  calendarDaySelected: {
    backgroundColor: "#2E8B57",
  },

  calendarDayText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111",
  },

  calendarDayTextToday: {
    fontWeight: "700",
    color: "#2E8B57",
  },

  calendarDayTextSelected: {
    color: "#FFF",
    fontWeight: "700",
  },

  calendarDayTextDisabled: {
    color: "#D1D5DB",
  },

  dateActions: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },

  dateActionBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },

  dateActionBtnPrimary: {
    backgroundColor: "#2E8B57",
    borderColor: "#2E8B57",
  },

  dateActionBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },

  dateActionBtnTextPrimary: {
    color: "#FFF",
  },

  // ================= CONTENT =================

  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 30,
  },

  dateSection: {
    marginBottom: 24,
  },

  dateText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#555",
    marginBottom: 12,
  },

  // ================= COMMON =================

  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyText: {
    fontSize: 16,
    color: "#999",
    fontWeight: "600",
  },
});
