import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
  StatusBar,
} from "react-native";

export default function AboutScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* <ScrollView contentContainerStyle={styles.content}>
      </ScrollView> */}
      <View style={styles.header}>
        <Text style={styles.title}>About Food Tracker</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.paragraph}>
          Food Tracker is a simple app to help you log what you eat and how it
          made you feel. All data is stored locally in our database and is only
          accessible by you.
        </Text>

        <Text style={styles.paragraph}>
          We do not share your data with any third parties. Your meals,
          pictures, and notes stay with you unless you choose to delete them or
          delete your account.
        </Text>

        <Text style={styles.paragraph}>Contact us at:</Text>
        <Text
          style={styles.contactEmail}
          onPress={() => Linking.openURL("mailto:team@srcdesigns.in")}
        >
          team@srcdesigns.in
        </Text>

        <View style={styles.linksRow}>
          <TouchableOpacity onPress={() => Linking.openURL("https://lemonchiffon-heron-497115.hostingersite.com/PrivacyPolicyFoodTracker.html")}>
            <Text style={styles.link}>Privacy Policy</Text>
          </TouchableOpacity>
          <Text style={styles.separator}>|</Text>
          <TouchableOpacity onPress={() => Linking.openURL("https://lemonchiffon-heron-497115.hostingersite.com/Terms-ConditionsFoodTracker.html")}>
            <Text style={styles.link}>Terms & Conditions</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 16,
  },
  paragraph: {
    fontSize: 16,
    marginBottom: 12,
    lineHeight: 22,
  },
  contactEmail: {
    fontSize: 16,
    color: "#007AFF",
    marginBottom: 20,
  },
  linksRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  link: {
    color: "#007AFF",
    textDecorationLine: "underline",
    fontSize: 14,
  },
  separator: {
    marginHorizontal: 8,
    fontSize: 14,
    color: "#444",
  },
});
