import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Image,
} from "react-native";
import { useAuthStore } from "../stores/authStore";
import { useFoodStore, FoodEntry } from "../stores/foodStore";
import { apiClient } from "../services/api";
import { imageService } from "../services/imageService";

interface AddFoodModalProps {
  visible: boolean;
  onClose: () => void;
  onFoodAdded: (food: FoodEntry) => void;
}

export const AddFoodModal: React.FC<AddFoodModalProps> = ({
  visible,
  onClose,
  onFoodAdded,
}) => {
  const { token } = useAuthStore();
  const [name, setName] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [likeScore, setLikeScore] = useState<number | null>(null);
  const [feelingText, setFeelingText] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tagInput, setTagInput] = useState("");

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handlePickImage = async () => {
    const croppedImage = await imageService.pickAndCropImage("gallery");
    if (croppedImage) {
      setImageUri(croppedImage.uri);
    }
  };

  const handleCaptureImage = async () => {
    const croppedImage = await imageService.pickAndCropImage("camera");
    if (croppedImage) {
      setImageUri(croppedImage.uri);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      alert("Please enter food name");
      return;
    }

    setIsLoading(true);
    try {
      // 1. Create food entry (fast)
      const response = await apiClient.createFood({
        name: name.trim(),
        tags,
        likeScore,
        feelingText: feelingText.trim() || undefined,
        hasImage: !!imageUri,
      });

      const foodId = response.data.foodId;

      // 2. Upload image async (in background)
      if (imageUri) {
        setTimeout(() => {
          // This runs in background
          apiClient.uploadImage(foodId, imageUri).catch((err) => {
            console.error("Image upload failed:", err);
          });
        }, 0);
      }

      // 3. Return food entry immediately
      const foodEntry: FoodEntry = {
        _id: foodId,
        userId: "",
        name,
        imageUrl: null,
        tags,
        likeScore,
        feelingText: feelingText.trim() || null,
        imageUploaded: false,
        createdAt: new Date().toISOString(),
        dateKey: new Date().toISOString().split("T")[0],
      };

      onFoodAdded(foodEntry);

      // Reset form
      setName("");
      setTags([]);
      setLikeScore(null);
      setFeelingText("");
      setImageUri(null);
      onClose();
    } catch (error) {
      console.error("Error creating food:", error);
      alert("Failed to create food entry");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelBtn}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Add Food</Text>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isLoading || !name.trim()}
          >
            <Text
              style={[
                styles.saveBtn,
                isLoading || !name.trim() ? styles.disabledBtn : {},
              ]}
            >
              Save
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          {/* Food Name */}
          <View style={styles.section}>
            <Text style={styles.label}>Food Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Idli, Dosa, Pizza"
              placeholderTextColor="#ccc"
              value={name}
              onChangeText={setName}
              editable={!isLoading}
            />
          </View>

          {/* Image Selection */}
          <View style={styles.section}>
            <Text style={styles.label}>Image (Optional)</Text>
            {imageUri && (
              <Image source={{ uri: imageUri }} style={styles.preview} />
            )}
            <View style={styles.imageButtonRow}>
              <TouchableOpacity
                style={styles.imageBtn}
                onPress={handleCaptureImage}
                disabled={isLoading}
              >
                <Text style={styles.imageBtnText}>📷 Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.imageBtn}
                onPress={handlePickImage}
                disabled={isLoading}
              >
                <Text style={styles.imageBtnText}>🖼️ Gallery</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Like Score */}
          <View style={styles.section}>
            <Text style={styles.label}>How much did you like it?</Text>
            <View style={styles.scoreRow}>
              {[1, 2, 3, 4, 5].map((score) => (
                <TouchableOpacity
                  key={score}
                  style={[
                    styles.scoreBtn,
                    likeScore === score ? styles.scoreBtnActive : {},
                  ]}
                  onPress={() => setLikeScore(score)}
                  disabled={isLoading}
                >
                  <Text
                    style={[
                      styles.scoreBtnText,
                      likeScore === score ? styles.scoreBtnTextActive : {},
                    ]}
                  >
                    {score}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Tags */}
          <View style={styles.section}>
            <Text style={styles.label}>Tags (Optional)</Text>
            <View style={styles.tagInputRow}>
              <TextInput
                style={styles.tagInput}
                placeholder="Add tag..."
                placeholderTextColor="#ccc"
                value={tagInput}
                onChangeText={setTagInput}
                onSubmitEditing={handleAddTag}
                editable={!isLoading}
              />
              <TouchableOpacity
                style={styles.addTagBtn}
                onPress={handleAddTag}
                disabled={isLoading}
              >
                <Text style={styles.addTagBtnText}>+</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.tagsContainer}>
              {tags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                  <TouchableOpacity onPress={() => handleRemoveTag(tag)}>
                    <Text style={styles.tagRemove}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          {/* Feeling Text */}
          <View style={styles.section}>
            <Text style={styles.label}>How did you feel? (Optional)</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              placeholder="Add notes..."
              placeholderTextColor="#ccc"
              value={feelingText}
              onChangeText={setFeelingText}
              multiline
              numberOfLines={4}
              editable={!isLoading}
            />
          </View>

          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>Creating food entry...</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginTop: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  cancelBtn: {
    fontSize: 16,
    color: "#999",
  },
  saveBtn: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "600",
  },
  disabledBtn: {
    color: "#ccc",
  },
  form: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  multilineInput: {
    textAlignVertical: "top",
    paddingTop: 10,
  },
  preview: {
    width: "100%",
    height: 250,
    borderRadius: 8,
    marginBottom: 12,
  },
  imageButtonRow: {
    flexDirection: "row",
    gap: 12,
  },
  imageBtn: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    alignItems: "center",
  },
  imageBtnText: {
    fontSize: 14,
  },
  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  scoreBtn: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    alignItems: "center",
  },
  scoreBtnActive: {
    backgroundColor: "#FFD700",
    borderColor: "#FFD700",
  },
  scoreBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  scoreBtnTextActive: {
    color: "#333",
  },
  tagInputRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  tagInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  addTagBtn: {
    width: 44,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#007AFF",
    borderRadius: 8,
    backgroundColor: "#007AFF",
  },
  addTagBtnText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "600",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#f0f0f0",
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
  },
  tagRemove: {
    fontSize: 12,
    fontWeight: "600",
    color: "#999",
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },
});
