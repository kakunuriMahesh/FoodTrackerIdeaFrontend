import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface FoodEntry {
  _id: string;
  userId: string;
  name: string;
  imageUrl: string | null;
  tags: string[];
  likeScore: number | null;
  feelingText: string | null;
  mealTime: string | null;
  imageUploaded: boolean;
  createdAt: string;
  dateKey: string;
}

interface FoodStore {
  dailyFoodsByDate: Record<string, FoodEntry[]>; // Cached by date
  historyFoods: FoodEntry[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setDailyFoods: (dateKey: string, foods: FoodEntry[]) => void;
  setHistoryFoods: (foods: FoodEntry[]) => void;
  appendHistoryFoods: (foods: FoodEntry[]) => void; // For pagination
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addFoodToDaily: (food: FoodEntry) => void;
  updateFood: (food: FoodEntry) => void;
  removeFood: (foodId: string) => void;
  clearAllDailyFoods: () => void;
}

export const useFoodStore = create<FoodStore>()(
  persist(
    (set) => ({
      dailyFoodsByDate: {},
      historyFoods: [],
      isLoading: false,
      error: null,

      setDailyFoods: (dateKey, foods) =>
        set((state) => ({
          dailyFoodsByDate: { ...state.dailyFoodsByDate, [dateKey]: foods },
        })),

      setHistoryFoods: (foods) => set({ historyFoods: foods }),

      appendHistoryFoods: (newFoods) =>
        set((state) => {
          const combined = [...state.historyFoods, ...newFoods];
          const unique = Array.from(
            new Map(combined.map((item) => [item._id, item])).values()
          );
          return { historyFoods: unique };
        }),

      setIsLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      addFoodToDaily: (food) =>
        set((state) => {
          const dateKey = food.dateKey;
          const existingDaily = state.dailyFoodsByDate[dateKey] || [];
          
          // Optimistically add to both daily and history
          return {
            dailyFoodsByDate: {
              ...state.dailyFoodsByDate,
              [dateKey]: [food, ...existingDaily],
            },
            historyFoods: [food, ...state.historyFoods],
          };
        }),

      updateFood: (updatedFood) =>
        set((state) => {
          const dateKey = updatedFood.dateKey;
          const existingDaily = state.dailyFoodsByDate[dateKey] || [];
          
          return {
            dailyFoodsByDate: {
              ...state.dailyFoodsByDate,
              [dateKey]: existingDaily.map((f) =>
                f._id === updatedFood._id ? updatedFood : f
              ),
            },
            historyFoods: state.historyFoods.map((f) =>
              f._id === updatedFood._id ? updatedFood : f
            ),
          };
        }),

      removeFood: (foodId) =>
        set((state) => {
          const newDailyByDate = { ...state.dailyFoodsByDate };
          Object.keys(newDailyByDate).forEach((date) => {
            newDailyByDate[date] = newDailyByDate[date].filter((f) => f._id !== foodId);
          });
          return {
            dailyFoodsByDate: newDailyByDate,
            historyFoods: state.historyFoods.filter((f) => f._id !== foodId),
          };
        }),

      clearAllDailyFoods: () => set({ dailyFoodsByDate: {} }),
    }),
    {
      name: "food-tracker-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
