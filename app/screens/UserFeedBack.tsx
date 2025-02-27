import React, { useState, useEffect } from "react";
import {
  View,
  Text as RNText,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  TouchableWithoutFeedback,
  Keyboard,
  SafeAreaView,
  StatusBar,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "../../type";
import CustomAlert from "../components/CustomAlert";

// Custom Text component to disable font scaling globally 
const Text = (props: any) => { return <RNText {...props} allowFontScaling={false} />; };


interface PatientDetails {
  patient_id: string;
  diet: string;
  name: string;
}

type PatientProfileScreenNavigationProp = NavigationProp<
  RootStackParamList,
  "PatientProfile"
>;

const UserFeedbackForm: React.FC = () => {
  const navigation = useNavigation<PatientProfileScreenNavigationProp>();
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0); // State to manage the selected rating
  const [phoneNumber, setPhoneNumber] = useState("");
  const [patientDetails, setPatientDetails] = useState<PatientDetails | null>(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    const fetchPhoneNumber = async () => {
      const storedPhoneNumber = await AsyncStorage.getItem("phoneNumber");
      if (storedPhoneNumber) {
        setPhoneNumber(storedPhoneNumber);
        fetchPatientDetails(storedPhoneNumber);
      }
    };

    fetchPhoneNumber();
  }, []);

  const fetchPatientDetails = async (phone: string) => {
    try {
      const response = await axios.get(
        `https://vs3k4b04-8000.inc1.devtunnels.ms/patient/patient/${phone}/`
      );
      setPatientDetails({
        patient_id: response.data.patient_id,
        diet: response.data.diet,
        name: response.data.name,
      });
    } catch (error) {
      console.error("Error fetching patient details:", error);
    }
  };

 /*  const handleSubmit = async () => {
    // Get the current date in 'YYYY-MM-DD' format
    const currentDate = new Date().toISOString().split('T')[0]; // Format: 'YYYY-MM-DD'
  
    try {
      const response = await axios.post(`https://vs3k4b04-8000.inc1.devtunnels.ms/patient/user-feedback-data/`, {
        patient_id: patientDetails?.patient_id,
        feedback: feedback,
        rating: rating,
        date: currentDate, // Include the current date
      });
  
      if (response.status === 201) {
         Alert.alert(
          "Your feedback data submitted!"
        ); 
         // Clear the form fields
      setFeedback(""); // Reset feedback to an empty string
      setRating(0);    // Reset rating to its initial state (0)
      } else {
        // If the status code is not 201
        throw new Error(`Unexpected response code: ${response.status}`);
      }
    } catch (error) {
      let errorMessage = "Failed to submit user feedback.";
  
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // Check if the error message indicates a unique constraint violation
          if (error.response.data.non_field_errors) {
            errorMessage = "Submission failed: This date has already been saved for this patient.";
          } else {
            // General error response
            errorMessage = error.response.data.detail || "Failed to submit user feedback.";
          }
        } else if (error.request) {
          // No response received
          errorMessage = "No response from server. Please check your connection.";
        }
      } else {
        // Non-Axios or general error
        errorMessage = (error as Error).message;
      }
  
      // Show the error popup with the error message
      Alert.alert(
        "Error",
        errorMessage,
        [{ text: "OK" }]
      );
    }
  }; */
  
  const handleSubmit = async () => {
    // Get the current date in 'YYYY-MM-DD' format
    const currentDate = new Date().toISOString().split('T')[0]; // Format: 'YYYY-MM-DD'
  
    try {
      const response = await axios.post(`https://vs3k4b04-8000.inc1.devtunnels.ms/patient/user-feedback-data/`, {
        patient_id: patientDetails?.patient_id,
        feedback: feedback,
        rating: rating,
        date: currentDate, // Include the current date
      });
  
      if (response.status === 201) {
        setAlertMessage("Your feedback data submitted!");
        setAlertTitle("Success");
        setAlertVisible(true); // Show the alert
        setFeedback(""); // Reset feedback to an empty string
        setRating(0);    // Reset rating to its initial state (0)
      } else {
        throw new Error(`Unexpected response code: ${response.status}`);
      }
    } catch (error) {
      let errorMessage = "Failed to submit user feedback.";
  
      if (axios.isAxiosError(error)) {
        if (error.response) {
          if (error.response.data.non_field_errors) {
            errorMessage = "Submission failed: This date has already been saved for this patient.";
          } else {
            errorMessage = error.response.data.detail || "Failed to submit user feedback.";
          }
        } else if (error.request) {
          errorMessage = "No response from server. Please check your connection.";
        }
      } else {
        errorMessage = (error as Error).message;
      }
  
      // Show the error popup with the error message using CustomAlert
      setAlertMessage(errorMessage);
      setAlertTitle("Error");
      setAlertVisible(true); // Show the error alert
    }
  };
  

  return (
    <SafeAreaProvider> 
      <CustomAlert
  title={alertTitle}
  message={alertMessage}
  visible={alertVisible}
  onClose={() => {
    console.log('Alert closed');
    setAlertVisible(false);

    // Example: Navigate to a specific screen after closing the alert
    if (alertTitle === "Success") {
      navigation.navigate("PatientDashboardPage");  // Navigate to WaterPage on success
    }
  }}
  onYes={() => {
    console.log('Alert confirmed');
    setAlertVisible(false);

    // Navigate based on the alert mode or title
    if (alertTitle === "Success") {
      navigation.navigate("PatientDashboardPage");  // Navigate on success
    } else {
      console.log('Error alert confirmed, no navigation.');
    }
  }}
/>


<SafeAreaView style={styles.safeArea}>
      {/* Adjust StatusBar visibility */}
      <StatusBar 
        barStyle="dark-content"        // Set the color of status bar text
        backgroundColor="transparent"  // Make the background transparent
        translucent={true}             // Make status bar translucent
      />
<View style={styles.backIconContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              console.log("Back button clicked");
              navigation.navigate("PatientProfile");
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={18} color="#000" />
          </TouchableOpacity>
        </View>

    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.outerContainer}>
        <Image
          source={require("../../assets/images/feedback.png")}
          style={styles.image}
        />
        <View style={styles.formContainer}>
          <Text style={styles.title}>
            <Text style={styles.feedbackText}>Feedback</Text>
            <Text style={styles.surveyText}> Survey</Text>
          </Text>

          {/* Emoji rating section */}
          <View style={styles.ratingContainer}>
            {['😢', '😟', '😐', '😊', '😁'].map((emoji, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setRating(index + 1)}
                style={[styles.emojiButton, rating === index + 1 && styles.selectedEmoji]}
              >
                <Text style={styles.emoji}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={[styles.input, styles.feedbackInput]}
            placeholder="Your Feedback"
            value={feedback}
            onChangeText={setFeedback}
            multiline
            numberOfLines={4}
          />

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit Feedback</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
    </SafeAreaView>
</SafeAreaProvider>

  );
};

export default UserFeedbackForm;

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa", // Light background for contrast
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },

  formContainer: {
    width: "90%", // Adjust width as needed
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 5, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  image: {
    width: "65%",
    height: 235,
    marginBottom: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  backIconContainer: {
    paddingTop: 10,
    marginLeft: 20,
    padding: 10,
    top: 60,
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
    zIndex: 1,
  },
  feedbackText: {
    color: "black",
  },
  surveyText: {
    color: "#4DB8B1",
  },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  feedbackInput: {
    height: 100,
    textAlignVertical: "top",
    paddingBottom: 5,
    paddingTop: 10, // Add padding at the top
    paddingLeft: 10, // Add padding on the left
  },
  ratingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  emojiButton: {
    padding: 10,
  },
  emoji: {
    fontSize: 35, // Adjust size of emojis
  },
  selectedEmoji: {
    backgroundColor: "#4DB8B1", // Highlight selected emoji
    borderRadius: 50, // Make the button circular
  },
  submitButton: {
    backgroundColor: "#4DB8B1",
    paddingVertical: 15,
    borderRadius: 40,
    alignItems: "center",
    width: "50%",
    alignSelf: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
