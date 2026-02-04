import { create } from "zustand";

export interface FoodEntry {
  _id: string;
  userId: string;
  name: string;
  imageUrl: string | null;
  tags: string[];
  likeScore: number | null;
  feelingText: string | null;
  imageUploaded: boolean;
  createdAt: string;
  dateKey: string;
}

interface FoodStore {
  dailyFoods: FoodEntry[];
  historyFoods: FoodEntry[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setDailyFoods: (foods: FoodEntry[]) => void;
  setHistoryFoods: (foods: FoodEntry[]) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addFoodToDaily: (food: FoodEntry) => void;
  updateFood: (food: FoodEntry) => void;
  removeFood: (foodId: string) => void;
  clearDailyFoods: () => void;
}

export const useFoodStore = create<FoodStore>((set) => ({
  dailyFoods: [],
  historyFoods: [],
  isLoading: false,
  error: null,

  setDailyFoods: (foods) => set({ dailyFoods: foods }),
  setHistoryFoods: (foods) => set({ historyFoods: foods }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  addFoodToDaily: (food) =>
    set((state) => ({
      dailyFoods: [food, ...state.dailyFoods],
    })),

  updateFood: (updatedFood) =>
    set((state) => ({
      dailyFoods: state.dailyFoods.map((f) =>
        f._id === updatedFood._id ? updatedFood : f
      ),
      historyFoods: state.historyFoods.map((f) =>
        f._id === updatedFood._id ? updatedFood : f
      ),
    })),

  removeFood: (foodId) =>
    set((state) => ({
      dailyFoods: state.dailyFoods.filter((f) => f._id !== foodId),
      historyFoods: state.historyFoods.filter((f) => f._id !== foodId),
    })),

  clearDailyFoods: () => set({ dailyFoods: [] }),
}));
