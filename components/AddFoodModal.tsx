
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
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useAuthStore } from "../stores/authStore";
import { useFoodStore, FoodEntry } from "../stores/foodStore";
import { apiClient } from "../services/api";
import { imageService } from "../services/imageService";

interface AddFoodModalProps {
  visible: boolean;
  onClose: () => void;
  onFoodAdded: (food: FoodEntry) => void;
  selectedDate: Date;
}

export default function AddFoodModal ({
  visible,
  onClose,
  onFoodAdded,
  selectedDate,
}: AddFoodModalProps){
  const { token } = useAuthStore();

  const [name, setName] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [likeScore, setLikeScore] = useState<number | null>(null);
  const [mealTime, setMealTime] = useState<string | null>(null);
  const [feelingText, setFeelingText] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);

  React.useEffect(() => {
    const timer = setTimeout(async () => {
      if (tagInput.trim().length >= 1) {
        try {
          const query = tagInput.trim();

          const response = await apiClient.getSuggestedTags(query);

          const filteredItems = response.data.tags.filter(
            (tag: string) =>
              tag.toLowerCase().includes(query.toLowerCase()) &&
              !tags.includes(tag)
          );

          setSuggestedTags(filteredItems);
        } catch (error) {
          console.error("Suggestion error:", error);
        }
      } else {
        setSuggestedTags([]);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [tagInput, tags]);

  const resetForm = () => {
    setName("");
    setTags([]);
    setLikeScore(null);
    setMealTime(null);
    setFeelingText("");
    setImageUri(null);
    setTagInput("");
    setSuggestedTags([]);
  };

  const handleCancel = () => {
    Alert.alert(
      "Are you sure!",
      "All added data will be removed.",
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Yes",
          style: "destructive",
          onPress: () => {
            resetForm();
            onClose();
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
      setSuggestedTags([]);
    }
  };

  const handleSelectSuggestion = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput("");
      setSuggestedTags([]);
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleUploadImage = async () => {
    Alert.alert("Upload Image", "Choose an option", [
      {
        text: "Camera",
        onPress: async () => {
          const croppedImage =
            await imageService.pickAndCropImage("camera");

          if (croppedImage) {
            setImageUri(croppedImage.uri);
          }
        },
      },
      {
        text: "Gallery",
        onPress: async () => {
          const croppedImage =
            await imageService.pickAndCropImage("gallery");

          if (croppedImage) {
            setImageUri(croppedImage.uri);
          }
        },
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]);
  };

  const handleRemoveImage = () => {
    setImageUri(null);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      alert("Please enter food name");
      return;
    }

    try {
      setIsLoading(true);

      const dateKey = selectedDate.toISOString().split("T")[0];

      const response = await apiClient.createFood({
        name: name.trim(),
        tags,
        likeScore: likeScore || undefined,
        feelingText: feelingText.trim() || undefined,
        mealTime: mealTime || undefined,
        hasImage: !!imageUri,
        dateKey,
      });

      const foodId = response.data.foodId;

      if (imageUri) {
        setTimeout(async () => {
          try {
            const uploadResult =
              await imageService.uploadToCloudinary(imageUri);

            if (uploadResult) {
              await apiClient.uploadImage(
                foodId,
                uploadResult.secure_url,
                uploadResult.public_id
              );
            }
          } catch (err) {
            console.error("Upload error:", err);
          }
        }, 100);
      }

      const foodEntry: FoodEntry = {
        _id: foodId,
        userId: "",
        name,
        imageUrl: imageUri,
        tags,
        likeScore,
        feelingText: feelingText.trim() || null,
        mealTime: mealTime || null,
        imageUploaded: false,
        createdAt: new Date().toISOString(),
        dateKey,
      };

      onFoodAdded(foodEntry);

      resetForm();

      onClose();
    } catch (error) {
      console.error("Error creating food:", error);
      alert("Failed to create food entry");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleCancel}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.container}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* HEADER */}
            <View style={styles.header}>
              <TouchableOpacity onPress={handleCancel}>
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
                    (isLoading || !name.trim()) && styles.disabledBtn,
                  ]}
                >
                  Save
                </Text>
              </TouchableOpacity>
            </View>

            {/* DATE BANNER */}
            <View style={styles.dateBanner}>
              <Text style={styles.dateBannerLabel}>Date</Text>
              <Text style={styles.dateBannerValue}>
                {selectedDate.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </Text>
            </View>

            {/* FOOD NAME */}
            <View style={styles.section}>
              <Text style={styles.label}>
                Food Name <Text style={{ color: "#EF4444" }}>*</Text>
              </Text>

              <TextInput
                style={styles.input}
                placeholder="e.g., Idli, Dosa, Pizza"
                placeholderTextColor="#BDBDBD"
                value={name}
                onChangeText={setName}
                editable={!isLoading}
              />
            </View>

            {/* PHOTO */}
            <View style={styles.section}>
              <Text style={styles.label}>Add Photo (Optional)</Text>

              <View style={styles.photoRow}>
                {imageUri ? (
                  <View style={styles.imageWrapper}>
                    <Image
                      source={{ uri: imageUri }}
                      style={styles.previewImage}
                    />

                    <TouchableOpacity
                      style={styles.removeImageBtn}
                      onPress={handleRemoveImage}
                    >
                      <Text style={styles.removeImageText}>×</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
              </View>

              <TouchableOpacity
                style={[
                  styles.uploadBtn,
                  imageUri && styles.uploadBtnDisabled,
                ]}
                onPress={handleUploadImage}
                disabled={!!imageUri || isLoading}
              >
                <Text style={styles.uploadIcon}>📤</Text>

                <Text
                  style={[
                    styles.uploadText,
                    imageUri && styles.uploadTextDisabled,
                  ]}
                >
                  {imageUri ? "Image Uploaded" : "Upload Image"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* LIKE SCORE */}
            <View style={styles.section}>
              <Text style={styles.label}>How much did you like it?</Text>

              <Text style={styles.subLabel}>Rate your experience</Text>

              <View style={styles.scoreRow}>
                {[1, 2, 3, 4, 5].map((score) => {
                  const active = likeScore === score;

                  return (
                    <TouchableOpacity
                      key={score}
                      style={[
                        styles.scoreBtn,
                        active && styles.scoreBtnActive,
                      ]}
                      onPress={() => setLikeScore(score)}
                      disabled={isLoading}
                    >
                      <Text
                        style={[
                          styles.scoreText,
                          active && styles.scoreTextActive,
                        ]}
                      >
                        {score}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* MEAL TIME */}
            <View style={styles.section}>
              <Text style={styles.label}>Meal Time</Text>

              <View style={styles.mealTimeRow}>
                {[
                  { value: "FN", label: "FN" },
                  { value: "AN", label: "AN" },
                  { value: "EV", label: "EV" },
                  { value: "NT", label: "NT" },
                ].map((option) => {
                  const active = mealTime === option.value;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.mealTimeBtn,
                        active && styles.mealTimeBtnActive,
                      ]}
                      onPress={() =>
                        setMealTime(active ? null : option.value)
                      }
                      disabled={isLoading}
                    >
                      <Text
                        style={[
                          styles.mealTimeText,
                          active && styles.mealTimeTextActive,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* TAGS */}
            <View style={styles.section}>
              <Text style={styles.label}>Tags (Optional)</Text>

              <View style={styles.tagInputRow}>
                <TextInput
                  style={styles.tagInput}
                  placeholder="Add tags (e.g. healthy, dinner)"
                  placeholderTextColor="#BDBDBD"
                  value={tagInput}
                  onChangeText={setTagInput}
                  onSubmitEditing={handleAddTag}
                  editable={!isLoading}
                />

                <TouchableOpacity
                  style={styles.addBtn}
                  onPress={handleAddTag}
                >
                  <Text style={styles.addBtnText}>+</Text>
                </TouchableOpacity>
              </View>

              {suggestedTags.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  {suggestedTags.map((tag) => (
                    <TouchableOpacity
                      key={tag}
                      style={styles.suggestionChip}
                      onPress={() => handleSelectSuggestion(tag)}
                    >
                      <Text style={styles.suggestionText}>{tag}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <View style={styles.tagsContainer}>
                {tags.map((tag) => (
                  <View key={tag} style={styles.tagChip}>
                    <Text style={styles.tagText}>{tag}</Text>

                    <TouchableOpacity onPress={() => handleRemoveTag(tag)}>
                      <Text style={styles.tagRemove}>×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>

            {/* FEELING */}
            <View style={styles.section}>
              <Text style={styles.label}>How did you feel? (Optional)</Text>

              <TextInput
                style={styles.notesInput}
                placeholder="Felt light and energetic after this meal."
                placeholderTextColor="#BDBDBD"
                multiline
                numberOfLines={4}
                value={feelingText}
                onChangeText={setFeelingText}
                editable={!isLoading}
                maxLength={200}
              />

              <Text style={styles.characterCount}>
                {feelingText.length}/200
              </Text>
            </View>

            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#22C55E" />
                <Text style={styles.loadingText}>
                  Creating food entry...
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const PRIMARY = "#2E7D32";
const LIGHT_GREEN = "#E8F5E9";
const BORDER = "#E5E7EB";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  scrollContent: {
    paddingBottom: 120,
  },

  header: {
    marginTop: 52,
    paddingHorizontal: 20,
    paddingBottom: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F1F1",
  },

  cancelBtn: {
    color: PRIMARY,
    fontSize: 15,
    fontWeight: "500",
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },

  saveBtn: {
    color: PRIMARY,
    fontSize: 15,
    fontWeight: "700",
  },

  disabledBtn: {
    opacity: 0.4,
  },

  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },

  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 10,
  },

  subLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 12,
  },

  input: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 14,
    color: "#111827",
    backgroundColor: "#FFF",
  },

  photoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },

  imageWrapper: {
    position: "relative",
  },

  previewImage: {
    width: 88,
    height: 88,
    borderRadius: 12,
  },

  removeImageBtn: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
  },

  removeImageText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 18,
  },

  uploadBtn: {
    height: 48,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF",
  },

  uploadBtnDisabled: {
    backgroundColor: "#F3F4F6",
    opacity: 0.7,
  },

  uploadIcon: {
    marginRight: 8,
    fontSize: 16,
  },

  uploadText: {
    color: PRIMARY,
    fontWeight: "600",
    fontSize: 14,
  },

  uploadTextDisabled: {
    color: "#6B7280",
  },

  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  scoreBtn: {
    width: 52,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BORDER,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
  },

  scoreBtnActive: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },

  scoreText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
  },

  scoreTextActive: {
    color: "#FFFFFF",
  },

  tagInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  tagInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 14,
    backgroundColor: "#FFF",
    color: "#111827",
  },

  addBtn: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: PRIMARY,
    justifyContent: "center",
    alignItems: "center",
  },

  addBtnText: {
    color: "#FFF",
    fontSize: 22,
    fontWeight: "600",
  },

  suggestionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14,
  },

  suggestionChip: {
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  suggestionText: {
    color: "#374151",
    fontSize: 12,
    fontWeight: "500",
  },

  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 14,
  },

  tagChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: LIGHT_GREEN,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },

  tagText: {
    color: PRIMARY,
    fontSize: 12,
    fontWeight: "600",
  },

  tagRemove: {
    marginLeft: 6,
    color: PRIMARY,
    fontWeight: "700",
    fontSize: 13,
  },

  notesInput: {
    minHeight: 110,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 14,
    fontSize: 14,
    color: "#111827",
    backgroundColor: "#FFF",
    textAlignVertical: "top",
  },

  characterCount: {
    textAlign: "right",
    marginTop: 6,
    fontSize: 11,
    color: "#9CA3AF",
  },

  loadingContainer: {
    marginTop: 30,
    alignItems: "center",
  },

  loadingText: {
    marginTop: 12,
    color: "#6B7280",
    fontSize: 14,
  },

  // ================= MEAL TIME =================

  mealTimeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  mealTimeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: "#FFF",
  },

  mealTimeBtnActive: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },

  mealTimeText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },

  mealTimeTextActive: {
    color: "#FFFFFF",
  },

  // ================= DATE BANNER =================

  dateBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: LIGHT_GREEN,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },

  dateBannerLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: PRIMARY,
    marginRight: 8,
  },

  dateBannerValue: {
    fontSize: 13,
    fontWeight: "700",
    color: PRIMARY,
  },
});