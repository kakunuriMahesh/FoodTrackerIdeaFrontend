import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system/legacy";
import { Alert, Platform } from "react-native";
import { CONSTANTS } from "../config/constants";
import { apiClient } from "./api";

export interface CroppedImage {
  uri: string;
  width: number;
  height: number;
  localUri: string; // Persistent local path
}

export interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
}

export const imageService = {
  // 1. Permission Handling (Soft Prompt)
  async checkPermission(type: "camera" | "gallery"): Promise<boolean> {
    const permissionMethod =
      type === "camera"
        ? ImagePicker.getCameraPermissionsAsync
        : ImagePicker.getMediaLibraryPermissionsAsync;
    
    const requestMethod =
      type === "camera"
        ? ImagePicker.requestCameraPermissionsAsync
        : ImagePicker.requestMediaLibraryPermissionsAsync;

    const { status: initialStatus } = await permissionMethod();

    if (initialStatus === "granted") return true;

    // Show soft prompt if not already granted
    return new Promise((resolve) => {
      Alert.alert(
        `${type === "camera" ? "Camera" : "Photo Library"} Access`,
        `FoodTracker needs access to your ${
          type === "camera" ? "camera" : "photos"
        } to let you add food images.`,
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => resolve(false),
          },
          {
            text: "Continue",
            onPress: async () => {
              const { status } = await requestMethod();
              resolve(status === "granted");
            },
          },
        ]
      );
    });
  },

  // 2. Pick and Crop
  async pickAndCropImage(source: "camera" | "gallery"): Promise<CroppedImage | null> {
    try {
      const hasPermission = await this.checkPermission(source);
      if (!hasPermission) {
        console.warn("Permission denied for", source);
        return null;
      }

      const launchMethod =
        source === "camera"
          ? ImagePicker.launchCameraAsync
          : ImagePicker.launchImageLibraryAsync;

      const result = await launchMethod({
        mediaTypes: ["images"],
        allowsEditing: true, // Mandatory cropping
        aspect: [1, 1],      // Mandatory 1:1
        quality: 0.8,
      });

      if (result.canceled) return null;

      const rawUri = result.assets[0].uri;

      // Double check size/resize if needed (though allowsEditing usually handles it, explicit resize is safer for consistency)
      const manipulated = await ImageManipulator.manipulateAsync(
        rawUri,
        [{ resize: { width: 1200, height: 1200 } }], // Force 1200x1200
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      // 3. Local Caching (Move to app document directory)
      const fileName = `food_${Date.now()}.jpg`;
      const localUri = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.copyAsync({
        from: manipulated.uri,
        to: localUri,
      });

      return {
        uri: localUri, // Use localUri for immediate display
        width: 1200,
        height: 1200,
        localUri,
      };
    } catch (error) {
      console.error("Image pick error:", error);
      Alert.alert("Error", "Failed to pick or crop image.");
      return null;
    }
  },

  // 4. Cloudinary Upload
  async uploadToCloudinary(localUri: string): Promise<CloudinaryResponse | null> {
    try {
      // Get signature from backend
      const signResponse = await apiClient.getUploadSignature();
      const { signature, timestamp, cloudName, apiKey, folder } = signResponse.data;

      if (!cloudName || !apiKey) {
        console.warn("Cloudinary configuration missing on server");
        return null;
      }

      // Create form data
      const uploadResult = await FileSystem.uploadAsync(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        localUri,
        {
          httpMethod: "POST",
          uploadType: FileSystem.FileSystemUploadType.MULTIPART,
          fieldName: "file",
          parameters: {
            api_key: apiKey,
            timestamp: timestamp.toString(),
            signature: signature,
            folder: folder,
          },
        }
      );

      if (uploadResult.status !== 200) {
        console.error("Cloudinary upload failed:", uploadResult.body);
        return null;
      }

      const data = JSON.parse(uploadResult.body);
      return {
        secure_url: data.secure_url,
        public_id: data.public_id,
      };
    } catch (error) {
      console.error("Upload error:", error);
      return null;
    }
  },
};
