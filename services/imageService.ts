import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { CONSTANTS } from "../config/constants";

export interface CroppedImage {
  uri: string;
  width: number;
  height: number;
  base64: string;
}

export const imageService = {
  // Open camera
  async pickFromCamera(): Promise<ImagePicker.ImagePickerAsset | null> {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      aspect: [1, 1],
    });

    return result.canceled ? null : result.assets[0];
  },

  // Open gallery
  async pickFromGallery(): Promise<ImagePicker.ImagePickerAsset | null> {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      aspect: [1, 1],
    });

    return result.canceled ? null : result.assets[0];
  },

  // Crop image to 1200x1200
  async cropImage(imageUri: string): Promise<CroppedImage> {
    const result = await ImageManipulator.manipulateAsync(imageUri, [
      {
        resize: {
          width: CONSTANTS.IMAGE_SIZE,
          height: CONSTANTS.IMAGE_SIZE,
        },
      },
    ]);

    return {
      uri: result.uri,
      width: CONSTANTS.IMAGE_SIZE,
      height: CONSTANTS.IMAGE_SIZE,
      base64: result.base64 || "",
    };
  },

  // Full flow: pick and crop
  async pickAndCropImage(source: "camera" | "gallery"): Promise<CroppedImage | null> {
    try {
      const image =
        source === "camera"
          ? await this.pickFromCamera()
          : await this.pickFromGallery();

      if (!image) return null;

      return await this.cropImage(image.uri);
    } catch (error) {
      console.error("Image picking error:", error);
      return null;
    }
  },
};
