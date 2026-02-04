import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
} from "react-native";
import { FoodEntry } from "../stores/foodStore";

interface FoodCardProps {
  food: FoodEntry;
  onPress?: () => void;
  onDelete?: () => void;
}

const DEFAULT_IMAGE =
  "https://static.wikia.nocookie.net/versus-compendium/images/0/00/Link_BotW.png/revision/latest?cb=20181128185543";

export const FoodCard: React.FC<FoodCardProps> = ({
  food,
  onPress,
  onDelete,
}) => {
  const formattedDate = new Date(food.createdAt).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      {/* Image */}
      {/* <ImageBackground
        source={{ uri: food.imageUrl || DEFAULT_IMAGE }}
        style={styles.image}
        imageStyle={styles.imageStyle}
      >
      </ImageBackground> */}
      <Image
        source={{ uri: food.imageUrl || DEFAULT_IMAGE }}
        style={styles.image}
      />

      {/* Content */}
      <View style={styles.content}>
        
        <Text style={styles.name} numberOfLines={2}>
          {food.name}
        </Text>

        {food.feelingText && (
          <Text style={styles.feeling} numberOfLines={2}>
            {food.feelingText}
          </Text>
        )}

        {food.tags && food.tags.length > 0 && (
          <View style={styles.tagsRow}>
            {food.tags.slice(0, 2).map((tag) => (
              <View key={tag} style={styles.tagBadge}>
                <Text style={styles.tagBadgeText}>{tag}</Text>
              </View>
            ))}
            {food.tags.length > 2 && (
              <Text style={styles.moreText}>+{food.tags.length - 2}</Text>
            )}
          </View>
        )}
        {food.likeScore && (
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreBadgeText}>
              {"⭐".repeat(food.likeScore)}
            </Text>
          </View>
        )}
        <Text style={styles.time}>{formattedDate}</Text>
      </View>

      {/* Delete Button */}
      {onDelete && (
        <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
          <Text style={styles.deleteBtnText}>🗑️</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    display: "flex",
    flexDirection: "row",
  },
  image: {
    // width: "100%",
    width: 150,
    height: 150,
    justifyContent: "flex-end",
  },
  imageStyle: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  scoreBadge: {
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    // marginRight: 8,
    marginBottom: 8,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginLeft: 8,
  },
  scoreBadgeText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  content: {
    padding: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
  },
  feeling: {
    fontSize: 13,
    color: "#666",
    marginBottom: 8,
    lineHeight: 18,
  },
  tagsRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 8,
    alignItems: "center",
  },
  tagBadge: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagBadgeText: {
    fontSize: 11,
    color: "#555",
  },
  moreText: {
    fontSize: 11,
    color: "#999",
    fontWeight: "500",
  },
  time: {
    fontSize: 11,
    color: "#999",
  },
  deleteBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteBtnText: {
    fontSize: 16,
  },
});
