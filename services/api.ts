import axios, { AxiosInstance } from "axios";
import { API_URL } from "../config/constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      // baseURL: API_URL,
      // baseURL: 'http://localhost:4000',
      // baseURL: 'http://10.10.1.215:4000',
      baseURL: 'http://192.168.1.113:4000',
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add request interceptor to include auth token
    this.client.interceptors.request.use(
      async (config) => {
        console.log("🔐 [API Client] Request interceptor - getting token from AsyncStorage");
        // const token = await AsyncStorage.getItem("firebaseToken");
        const token = "test_user_id12345"; // For testing without auth
        console.log("📍 [API Client] Retrieved token:", token);
        
        if (token) {
          console.log("✅ [API Client] Token found, attaching to Authorization header");
          console.log("🔑 [API Client] Token length:", token.length, "chars");
          config.headers.Authorization = `Bearer ${token}`;
          console.log("📍 [API Client] Request URL:", config.url);
          console.log("📍 [API Client] Request Method:", config.method?.toUpperCase());
        } else {
          console.warn("⚠️ [API Client] No token found in AsyncStorage - request will likely fail");
        }
        return config;
      },
      (error) => {
        console.error("❌ [API Client] Request interceptor error:", error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        console.log("✅ [API Client] Response successful:", {
          url: response.config.url,
          status: response.status,
          dataLength: JSON.stringify(response.data).length,
        });
        return response;
      },
      (error) => {
        console.error("❌ [API Client] Response error:", {
          url: error.config?.url,
          status: error.response?.status,
          message: error.message,
          data: error.response?.data,
        });
        return Promise.reject(error);
      }
    );
  }

  // Food API
  async createFood(data: {
    name: string;
    tags?: string[];
    likeScore?: number;
    feelingText?: string;
    hasImage?: boolean;
  }) {
    console.log("📝 [API] Creating food entry:", data);
    return this.client.post("/food", data);
  }

  async uploadImage(foodId: string, imageData: string) {
    console.log("📸 [API] Uploading image for food ID:", foodId);
    return this.client.post(`/food/${foodId}/image`, { imageData });
  }

  async getDailyTimeline(date: string) {
    console.log("📅 [API] Getting daily timeline for date:", date);
    return this.client.get("/food/timeline/daily", { params: { date } });
  }

  async getHistory(days: number = 3, page: number = 1) {
    console.log("📚 [API] Getting history for days:", days, "page:", page);
    return this.client.get("/food/timeline/history", {
      params: { days, page },
    });
  }

  async getFoodById(id: string) {
    console.log("🔍 [API] Getting food by ID:", id);
    return this.client.get(`/food/${id}`);
  }

  async updateFood(id: string, data: Partial<any>) {
    console.log("✏️ [API] Updating food ID:", id, "with data:", data);
    return this.client.patch(`/food/${id}`, data);
  }

  async deleteFood(id: string) {
    console.log("🗑️ [API] Deleting food ID:", id);
    return this.client.delete(`/food/${id}`);
  }
}

export const apiClient = new ApiClient();
