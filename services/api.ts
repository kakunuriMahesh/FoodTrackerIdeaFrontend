import axios, { AxiosInstance } from "axios";
import { API_URL } from "../config/constants";

const TEST_TOKEN = "test_token_12345";

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      // baseURL: "http://10.10.3.53:4000", // Use computer's IP, not localhost
      // baseURL: "http://10.166.120.183:4000", // Use computer's IP, not localhost
      baseURL: "http://10.29.180.183:4000", // Use computer's IP, not localhost
      headers: { "Content-Type": "application/json" },
    });

    this.client.interceptors.request.use((config) => {
      config.headers.Authorization = `Bearer ${TEST_TOKEN}`;
      console.log("📍 [API]", config.method?.toUpperCase(), config.url);
      return config;
    });

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

  async createFood(data: { name: string; tags?: string[]; likeScore?: number; feelingText?: string; hasImage?: boolean }) {
    return this.client.post("/food", data);
  }

  async uploadImage(foodId: string, imageData: string) {
    return this.client.post(`/food/${foodId}/image`, { imageData });
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
}

export const apiClient = new ApiClient();
