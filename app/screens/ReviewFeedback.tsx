import React, { useState, useEffect } from "react";
import {
  View,
  Text as RNText,
  FlatList,
  StyleSheet,
  ListRenderItem,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../type";
import axios from "axios";
import { SafeAreaProvider } from 'react-native-safe-area-context';
// Custom Text component to disable font scaling globally 
const Text = (props: any) => { return <RNText {...props} allowFontScaling={false} />; };

type ReviewFeedbackScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "ReviewFeedbackScreen"
>;

type Feedback = {
  id: string;
  patient_id: string;
  feedback: string;
  uploadedAt: string;
  rating: number;
  timestamp: string; // Include timestamp in the type
};

const ReviewFeedbackScreen: React.FC = () => {
  const navigation = useNavigation<ReviewFeedbackScreenNavigationProp>();
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);

  // Fetch feedback data from API endpoint
  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const response = await axios.get(
          "https://vs3k4b04-8000.inc1.devtunnels.ms/patient/user-feedback-data/"
        );
        // Map the response data to include uploadedAt field
        const feedbackData = response.data.map((item: any) => ({
          id: item.id,
          patient_id: item.patient_id,
          feedback: item.feedback,
          uploadedAt: new Date(item.timestamp).toLocaleString(),
          rating: item.rating,
        }));
        setFeedbackList(feedbackData);
      } catch (error) {
        console.error("Error fetching feedback data:", error);
      }
    };

    fetchFeedback();
  }, []);

  // Render each feedback item
  // Render each feedback item
  const renderItem: ListRenderItem<Feedback> = ({ item }) => {
    console.log("Item Rating:", item.rating); // Debugging log to see the rating

    return (
      <View style={styles.feedbackItem}>
        <Text style={styles.patientId}>Patient ID: {item.patient_id}</Text>
        <Text style={styles.feedbackText}>{item.feedback}</Text>

        {/* Emoji rating icons */}
        {/* Emoji rating icons */}
        <View style={styles.ratingContainer}>
          {["😢", "😟", "😐", "😊", "😁"].map((emoji, index) => (
            <Text
              key={`${emoji}-${index}`} // Unique key for each emoji
              style={[
                styles.emoji,
                item.rating === index + 1
                  ? styles.selectedEmojiText
                  : styles.grayEmoji,
              ]}
            >
              {emoji}
            </Text>
          ))}
        </View>

        {/* Display upload date and time */}
        <View style={styles.uploadedAtContainer}>
          <Ionicons
            name="calendar"
            size={16}
            color="#888"
            style={styles.icon}
          />
          <Text style={styles.uploadedAtText}>
            {item.uploadedAt.split(",")[0]}
          </Text>
          <Ionicons name="time" size={16} color="#888" style={styles.icon} />
          <Text style={styles.uploadedAtText}>
            {item.uploadedAt.split(",")[1]}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaProvider> 
<SafeAreaView style={styles.safeArea}>
      {/* Adjust StatusBar visibility */}
      <StatusBar 
        barStyle="dark-content"        // Set the color of status bar text
        backgroundColor="transparent"  // Make the background transparent
        translucent={true}             // Make status bar translucent
      />

    <View style={styles.container}>
      <View style={styles.backIconContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate("AdminDashboardPage")}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={18} color="#000" />
        </TouchableOpacity>
      </View>
      <Text style={styles.header}>Review Patient Feedback</Text>
      <FlatList
        data={feedbackList}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        bounces={false}
      />
    </View>
    </SafeAreaView>
</SafeAreaProvider>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#ececec",
    marginTop: 50,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },

  backIconContainer: {
    position: "absolute", // Position the back button container absolutely
    paddingTop: 20,
    marginLeft: 15,
  },
  backButton: {
    width: 30,
    height: 30,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    marginLeft: 20,
    textAlign: "center",
  },
  feedbackItem: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 0,
    borderTopLeftRadius: 40,
    borderBottomRightRadius: 40,
    marginBottom: 15,
    /* shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3, */
    width: "98%",
    alignSelf: "center",
  },
  patientName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  feedbackText: {
    fontSize: 16,
    marginTop: 5,
    color: "#555",
  },
  ratingContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  emojiButton: {
    padding: 5,
  },
  emoji: {
    fontSize: 24,
  },
  selectedEmoji: {
    color: "#d0f9d6",
    borderRadius: 5,
  },
  selectedEmojiText: {
    fontWeight: "bold",
    fontSize: 30,
    backgroundColor: "#92e191",
    padding: 6,
    borderRadius: 30,
  },
  uploadedAtText: {
    marginTop: 5,
    fontSize: 14,
    color: "#888",
  },
  uploadedAtContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  icon: {
    marginHorizontal: 5,
  },
  grayEmoji: {
    color: "#f5f5f5", // Use a distinct gray for unselected
    fontSize: 24,
    opacity: 0.5,
  },
  patientId: {
    // Ensure this style is defined
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
});

export default ReviewFeedbackScreen;
