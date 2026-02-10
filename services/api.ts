import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TEST_TOKEN = "test_token_12345";

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: "http://192.168.1.114:4000", // Use computer's IP
      headers: { "Content-Type": "application/json" },
    });

    // Request interceptor - get token from AsyncStorage
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        try {
          // Try to get real token from AsyncStorage
          const token = await AsyncStorage.getItem("firebaseToken");
          config.headers.Authorization = `Bearer ${token || TEST_TOKEN}`;
          console.log("📍 [API]", config.method?.toUpperCase(), config.url);
        } catch (e) {
          config.headers.Authorization = `Bearer ${TEST_TOKEN}`;
        }
        return config;
      }
    );

    this.client.interceptors.response.use(
      (response) => {
        console.log("✅ [API] OK:", response.config.url);
        return response;
      },
      (error) => {
        console.error("❌ [API] Error:", error.response?.status, error.response?.data);
        return Promise.reject(error);
      }
    );
  }

  // Create food with optional dateKey for specific dates
  async createFood(data: { 
    name: string; 
    tags?: string[]; 
    likeScore?: number; 
    feelingText?: string; 
    hasImage?: boolean;
    dateKey?: string; // NEW: Allow specifying date
  }) {
    return this.client.post("/food", data);
  }

  // Updated: Upload image URL (after Cloudinary upload)
  async uploadImage(foodId: string, imageUrl: string, publicId: string) {
    return this.client.post(`/food/${foodId}/image`, { imageUrl, publicId });
  }

  // NEW: Get Cloudinary upload signature
  async getUploadSignature() {
    return this.client.get("/food/sign-upload");
  }

  async getDailyTimeline(date: string) {
    return this.client.get("/food/timeline/daily", { params: { date } });
  }

  async getHistory(days: number = 3, page: number = 1) {
    return this.client.get("/food/timeline/history", { params: { days, page } });
  }

  async getFoodById(id: string) {
    return this.client.get(`/food/${id}`);
  }

  async updateFood(id: string, data: Partial<any>) {
    return this.client.patch(`/food/${id}`, data);
  }

  async deleteFood(id: string) {
    return this.client.delete(`/food/${id}`);
  }

  // NEW: Get tag suggestions
  async getSuggestedTags(query: string) {
    return this.client.get("/food/tags/suggestions", { params: { q: query } });
  }

  // NEW: Search food entries
  async searchFood(query: string) {
    return this.client.get("/food/search", { params: { q: query } });
  }
}

export const apiClient = new ApiClient();
