// Firebase Configuration
export const FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY",
  authDomain: "foodtracker.firebaseapp.com",
  projectId: "foodtracker-dac43",
  storageBucket: "foodtracker.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};

// API Configuration
// export const API_URL = "http://192.168.1.100:4000"; // Change to your backend URL
// export const API_URL = "http://10.10.1.215:4000"; // Change to your backend URL
export const API_URL = "http://10.10.3.81:4000"; // Change to your backend URL
// export const API_URL = "http://10.29.180.183:4000"; // Change to your backend URL
// export const API_URL = "http://localhost:4000"; // Change to your backend URL
export const API_ENDPOINTS = {
  CREATE_FOOD: "/food",
  UPLOAD_IMAGE: (id) => `/food/${id}/image`,
  GET_DAILY_TIMELINE: "/food/timeline/daily",
  GET_HISTORY: "/food/timeline/history",
  GET_FOOD: (id) => `/food/${id}`,
  UPDATE_FOOD: (id) => `/food/${id}`,
  DELETE_FOOD: (id) => `/food/${id}`,
};

// App Constants
export const CONSTANTS = {
  IMAGE_SIZE: 1200,
  DEFAULT_TAGS: ["breakfast", "lunch", "dinner", "snack", "dessert"],
  LIKE_SCORE_MAX: 5,
  LIKE_SCORE_MIN: 1,
  TIMELINE_DAYS: 3,
  ITEMS_PER_PAGE: 20,
};
