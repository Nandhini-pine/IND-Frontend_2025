import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text as RNText,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Platform,
  TextInput,
  Alert,
  Modal,
  SafeAreaView,
  StatusBar,
  BackHandler,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as Progress from "react-native-progress";
import { FontAwesome } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import Icon from "react-native-vector-icons/MaterialIcons";
import texts from "../translation/texts";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../type";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { RFValue } from "react-native-responsive-fontsize";
import CustomAlert from "../components/CustomAlert";

// Custom Text component to disable font scaling globally
const Text = (props: any) => {
  return <RNText {...props} allowFontScaling={false} />;
};

// Define the props type

type WalkingNavigationProp = StackNavigationProp<
  RootStackParamList,
  "DailyExercise"
>;

interface WalkingProps {
  navigation: WalkingNavigationProp;
}
interface PatientDetails {
  patient_id: string; // Keep the patient_id string if you need it for other purposes
  diet: string;
  name: string; // Make sure to add this line
}

const Walking: React.FC<WalkingProps> = ({ navigation }) => {
  // Toggle between Tamil and English based on the button click
  const [isTranslatingToTamil, setIsTranslatingToTamil] = useState(false);

  // Toggle between Tamil and English based on the button click for placeholder
  const languageText = isTranslatingToTamil ? texts.tamil : texts.english;

  // Update language state dynamically
  const language: "english" | "tamil" = isTranslatingToTamil
    ? "tamil"
    : "english";

  const [currentSteps, setCurrentSteps] = useState(0);
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [hours, setHours] = useState("");
  const [difficultyText, setText] = useState("");
  const [minutes, setMinutes] = useState("");
  const [isTranslated, setIsTranslated] = useState(false); // State to manage translation

  const [dateOfOperation, setDateOfOperation] = useState<Date | null>(
    new Date() // Ensure this is never null during initialization
  );
  const [phoneNumber, setPhoneNumber] = useState("");
  const [patientDetails, setPatientDetails] = useState<PatientDetails | null>(
    null
  );
  const [eligibilityStatus, setEligibilityStatus] =
    useState<string>("Not available"); // Provide a default non-null string
  const [suggestedWalk, setSuggestedWalk] = useState<string>("Not available"); // Provide a default non-null string
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [walkedToday, setWalkedToday] = useState<boolean | null>(false);
  const [date, setDate] = useState<Date | null>(new Date());
  const [progressValue, setProgressValue] = useState(0.5);
  // New state for confetti visibility
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiTimeout, setConfettiTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  // New state for modal popup
  const [showCongrats, setShowCongrats] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [cancelAlertVisible, setCancelAlertVisible] = useState(false);
  const [customAlertVisible, setCustomAlertVisible] = useState(false);

  // Function to trigger the styled congratulation message
  const showCongratulationAlert = () => {
    setShowCongrats(true);
    setTimeout(() => setShowCongrats(false), 2000); // Hide the modal after 3 seconds
  };

  // Function to trigger confetti display
  const triggerConfetti = () => {
    // Clear any existing timeout to prevent conflicts
    if (confettiTimeout) {
      clearTimeout(confettiTimeout);
    }

    setShowConfetti(true);

    // Hide confetti after 4 seconds
    const timeoutId = setTimeout(() => {
      setShowConfetti(false);
    }, 4000); // Hide after 4 seconds

    setConfettiTimeout(timeoutId); // Store the timeout ID
  };

  //Device back button handler
  useFocusEffect(
    React.useCallback(() => {
      const backAction = () => {
        /* Alert.alert("Cancel", "Are you sure you want to cancel?", [
          {
            text: "No",
            onPress: () => null,
            style: "cancel",
          },
          {
            text: "Yes",
            onPress: () => navigation.navigate("PatientDashboardPage"),
          },
        ]); */
        setCancelAlertVisible(true);
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        backAction
      );

      return () => backHandler.remove();
    }, [navigation])
  );

  useEffect(() => {
    const fetchData = () => {
      setDateOfOperation(new Date("2024-08-01"));
      setEligibilityStatus("Eligible");
      setSuggestedWalk("30 minutes daily");
    };
    fetchData();
  }, []);

  /* useEffect(() => {
    const fetchPhoneNumber = async () => {
      const storedPhoneNumber = await AsyncStorage.getItem("phoneNumber");
      if (storedPhoneNumber) {
        setPhoneNumber(storedPhoneNumber);
        fetchPatientDetails(storedPhoneNumber);
      }
    };

    fetchPhoneNumber();
  }, []); */

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedPhoneNumber = await AsyncStorage.getItem("phoneNumber");

        if (storedPhoneNumber) {
          fetchPatientDetails(storedPhoneNumber);
        } else {
          // Handle the case where phoneNumber is not found in AsyncStorage
          console.warn("Phone number not found in AsyncStorage.");
          // You might want to navigate to a login screen or display an error message
        }
      } catch (error) {
        console.error("Error fetching phone number from AsyncStorage:", error);
        // Handle the error, e.g., display an error message
      }
    };

    fetchData();
  }, []);

  const fetchPatientDetails = async (phone: string) => {
    try {
      const response = await axios.get(
        `https://indheart.pinesphere.in/patient/patient/${phone}/`
      );

      setPatientDetails({
        patient_id: response.data.patient_id,
        diet: response.data.diet,
        name: response.data.name,
      });

      // Fetch clinical data for the patient to get the date of operation
      const clinicalResponse = await axios.get(
        `https://indheart.pinesphere.in/api/api/clinical-data/?patient_id=${response.data.patient_id}/`
      );

      // Assuming that you want the first record for simplicity
      if (clinicalResponse.data.length > 0) {
        const clinicalData = clinicalResponse.data[0];
        setDateOfOperation(
          clinicalData.date_of_operation
            ? new Date(clinicalData.date_of_operation)
            : null
        );
      }
    } catch (error) {
      console.error("Error fetching patient details:", error);
    }
  };

  const [isConfettiShowing, setIsConfettiShowing] = useState(false);

  useEffect(() => {
    if (parseInt(distance) >= 6 && !isConfettiShowing) {
      setIsConfettiShowing(true);
      triggerConfetti();
      showCongratulationAlert();

      const timer = setTimeout(() => {
        setIsConfettiShowing(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [distance]);

  const calculateWeeksSinceOperation = (operationDate: Date | null): number => {
    if (!operationDate) return 0;
    const today = new Date();
    const timeDifference = today.getTime() - operationDate.getTime();
    return Math.floor(timeDifference / (1000 * 3600 * 24 * 7)); // Convert milliseconds to weeks
  };

  const getGoalDistance = (weeks: number): number => {
    switch (weeks) {
      case 0:
        return 0.5;
      case 1:
        return 0;
      case 2:
        return 0.5; // 0.5 km for 2nd week
      case 3:
        return 1; // 1 km for 3rd week
      case 4:
        return 2; // 2 km for 4th week
      case 5:
        return 3; // 3 km for 5th week
      case 6:
        return 4; // 4 km for 6th week
      default:
        return weeks > 6 ? 6 : 4; // 6 km after 6 weeks
    }
  };

  // Calculate the weeks since operation and the goal distance based on that
  const weeksSinceOperation = calculateWeeksSinceOperation(dateOfOperation);
  const goalDistance = getGoalDistance(weeksSinceOperation); // Declare goalDistance here

  useEffect(() => {
    // Convert current distance input to a number for progress calculation
    const currentDistance = parseFloat(distance) || 0; // Safely parse distance input
    setProgressValue(goalDistance > 0 ? currentDistance / goalDistance : 0); // Prevent division by zero
  }, [distance, goalDistance]);

  useEffect(() => {
    const currentDistance = parseFloat(distance) || 0; // Safely parse distance input
    const progress = goalDistance > 0 ? currentDistance / goalDistance : 0;
    setProgressValue(Math.min(1, Math.max(0, progress))); // Check if current distance meets or exceeds goal distance
    if (currentDistance >= goalDistance && goalDistance > 0) {
      triggerConfetti();
      showCongratulationAlert();
    }
  }, [distance, goalDistance]);

  useEffect(() => {
    const currentDistance = parseFloat(distance) || 0;
    if (currentDistance >= goalDistance && goalDistance > 0) {
      triggerConfetti(); // Trigger confetti when distance meets or exceeds goal distance
      setShowCongrats(true);
      showCongratulationAlert();

      // Hide the popup after 3 seconds
      const timer = setTimeout(() => {
        setShowCongrats(false); // Hide the popup
      }, 3000); // 3000 milliseconds = 3 seconds

      // Cleanup function to clear the timer if the component unmounts or distance changes
      return () => clearTimeout(timer);
    }
  }, [distance, goalDistance]);

  useEffect(() => {
    const currentDistance = parseFloat(distance) || 0;
    if (parseInt(distance) >= 6) {
      triggerConfetti(); // Trigger confetti when distance is 6 or greater
      setShowCongrats(true);
      showCongratulationAlert();

      // Hide the popup after 3 seconds
      const timer = setTimeout(() => {
        setShowCongrats(false); // Hide the popup
      }, 3000); // 3000 milliseconds = 3 seconds

      // Cleanup function to clear the timer if the component unmounts or distance changes
      return () => clearTimeout(timer);
    }
  }, [distance]); // Run this effect whenever the distance changes

  // Handler functions
  const handleSubmit = async () => {
    // Log current state
    console.log({ date, distance, hours, minutes, difficultyText });

    // Check if the form is filled
    if (!date || !distance || !hours || !difficultyText) {
      setAlertTitle(languageText.errorTitle);
      setAlertMessage(languageText.errorMessage);
      setCustomAlertVisible(true); // Show custom alert
      return;
    }

    try {
      const response = await axios.post(
        "https://indheart.pinesphere.in/patient/walking-data/",
        {
          // Prepare data to send
          patient_id: patientDetails?.patient_id,
          date: date?.toISOString().split("T")[0], // Format date to 'YYYY-MM-DD'
          distance_km: parseFloat(distance), // Ensure distance is a number
          duration_hours: parseInt(hours, 10) || 0, // Ensure hours are an integer
          duration_minutes: parseInt(minutes, 10) || 0, // Ensure minutes are an integer
          difficulty_text: difficultyText,
        }
      );

      // Make API call to save walking data
      if (response.status === 201) {
        // Show custom styled modal alert for success
        setAlertTitle(languageText.successTitle);
        setAlertMessage(languageText.walkingDetailsSubmitted);
        setCustomAlertVisible(true); // Show custom alert for success
      } else {
        throw new Error(`Unexpected response code: ${response.status}`);
      }
    } catch (error) {
      let errorMessage = "Failed to submit Walking Details.";

      if (axios.isAxiosError(error)) {
        if (error.response) {
          // Check if the error message indicates a unique constraint violation
          if (error.response.data.non_field_errors) {
            errorMessage = languageText.dateAlreadySavedWater;
          } else {
            // General error response
            errorMessage =
              error.response.data.detail || "Failed to submit walking details.";
          }
        } else if (error.request) {
          // No response received
          errorMessage =
            "No response from server. Please check your connection.";
        }
      } else {
        // Non-Axios or general error
        errorMessage = (error as Error).message;
      }

      // Show the error message in custom alert
      setAlertTitle(languageText.errorTitle);
      setAlertMessage(errorMessage);
      setCustomAlertVisible(true); // Show custom alert for the error
    }
  };

  const handleClear = () => {
    setCurrentSteps(0);
    setDistance("");
    setDuration("");
    setHours("");
    setMinutes(""); // Reset minutes
    setWalkedToday(null); // Reset walkedToday
    setDate(null); // Reset date to undefined
    setProgressValue(0); // Reset progress bar to 0
    setText("");
    Alert.alert(languageText.successTitle, languageText.formCleared);
  };

  // Handle Translation
  const handleTranslate = useCallback(() => {
    setIsTranslatingToTamil((prev) => !prev);
  }, []);

  /*   const handleCancel = () => {
    Alert.alert(
      languageText.confirmCancelTitle,
      languageText.confirmCancelMessage,
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          onPress: () => navigation.navigate("Exercise"),
        }, // Navigate back to patient dashboard
      ],
      { cancelable: false }
    );
  }; */
  const handleCancel = () => {
    // Trigger the custom alert instead of the default Alert
    setCancelAlertVisible(true);
  };

  const onDateChange = (event: any, selectedDate: Date | undefined) => {
    if (event.type === "dismissed") {
      setShowDatePicker(false);
      return;
    }

    const currentDate = selectedDate || date;
    setShowDatePicker(false); // This is correct
    setDate(currentDate); // Update date state
  };

  const handleDateChange = (event: any, selectedDate: Date | undefined) => {
    const currentDate = selectedDate || date; // Use existing date if selectedDate is undefined
    setShowDatePicker(false); // Correct this line as well
    setDate(currentDate); // Update date state
  };
  return (
    <SafeAreaProvider>
      <CustomAlert
        title={alertTitle}
        message={alertMessage}
        visible={customAlertVisible}
        onClose={() => {
          setCustomAlertVisible(false); // Close the alert
          if (alertTitle === languageText.successTitle) {
            navigation.navigate("YogaPage"); // Navigate to Yoga screen if success
          }
        }}
        okText={languageText.alertOk} // Translated OK text
        yesText={languageText.alertYes} // Translated Yes text
        noText={languageText.alertNo} // Translated No text
      />

      {/* Custom cancel alert */}
      <CustomAlert
        title={languageText.alertCancelTitle}
        message={languageText.alertCancelMessage}
        visible={cancelAlertVisible}
        onClose={() => setCancelAlertVisible(false)} // Close the alert on close
        mode="confirm"
        onYes={() => {
          // Navigate to PatientDashboardPage when "Yes" is clicked
          navigation.navigate("PatientDashboardPage");
          setCancelAlertVisible(false); // Close the alert after navigation
        }}
        onNo={() => setCancelAlertVisible(false)} // Close the alert on "No"
        okText={languageText.alertOk} // Translated OK text
        yesText={languageText.alertYes} // Translated Yes text
        noText={languageText.alertNo} // Translated No text
      />
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        {/* Adjust StatusBar visibility */}
        <StatusBar
          barStyle="dark-content" // Set the color of status bar text
          backgroundColor="transparent" // Make the background transparent
          translucent={true} // Make status bar translucent
        />

        <View style={styles.container}>
          <Text style={styles.title}>{languageText.walkingtitle}</Text>
          <View style={styles.translateContainer}>
            <TouchableOpacity
              onPress={handleTranslate}
              style={styles.translateButton}
            >
              <Icon
                name={isTranslatingToTamil ? "language" : "translate"}
                size={20}
                color="#4169E1"
              />
              <Text style={styles.buttonTranslateText}>
                {isTranslatingToTamil
                  ? "Translate to English"
                  : "தமிழில் படிக்க"}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.goalText}>
            {languageText.goalText} &nbsp;{goalDistance} KM
          </Text>
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.progressContainer}>
              <Progress.Circle
                progress={progressValue}
                size={270}
                thickness={6}
                showsText={false}
                color="#28d2a2"
              />
              <Image
                source={require("../../assets/gif/wk.png")}
                style={styles.imageInsideProgress}
                resizeMode="contain"
              />
            </View>

            {/* Info Container */}
            <View style={styles.infoContainer}>
              <View style={styles.cardRow}>
                <InfoCard
                  icon="calendar"
                  title={languageText.dateOfOperation}
                  info={
                    dateOfOperation
                      ? dateOfOperation.toLocaleDateString()
                      : "N/A"
                  }
                />
                <InfoCard
                  icon="check"
                  title={languageText.eligibilityStatus}
                  info={eligibilityStatus || "Not available"} // Fallback to "Not available"
                />
              </View>
              <View style={styles.cardRow}>
                <InfoCard
                  icon="heartbeat"
                  title={languageText.suggestedWalk}
                  info={eligibilityStatus || "Not available"} // Fallback to "Not available"
                />
                <InfoCard
                  icon="clock-o"
                  title={languageText.weeksSinceOperation}
                  info={`${weeksSinceOperation} weeks`}
                />
              </View>
            </View>

            <View style={styles.container}>
              {showConfetti && (
                <Image
                  source={require("../../assets/gif/confetti.gif")}
                  style={{
                    width: "100%",
                    height: "100%",
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 9999,
                  }}
                  resizeMode="cover"
                />
              )}
            </View>
            {/* Date Picker Component */}
            {showDatePicker && (
              <DateTimePicker
                value={date || new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "inline" : "default"}
                onChange={onDateChange}
              />
            )}

            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={styles.dateInput}
            >
              <Text style={styles.dateText}>
                {date ? date.toLocaleDateString() : "Select Date"}
              </Text>
            </TouchableOpacity>

            {/* Daily Routine Container */}
            <View style={styles.dailyRoutineContainer}>
              <Text style={styles.dailyRoutineTitle}>Daily Routine</Text>

              <Text style={styles.dailyRoutineText}>
                {languageText.enterDistance}{" "}
                {/* Update this to reflect kilometers */}
              </Text>
              <TextInput
                style={[styles.input, { fontSize: RFValue(10) }]}
                //placeholder={`Enter distance (e.g., 0.5 or 1 km)`}
                placeholder={languageText.enterDistance}
                onChangeText={(text) => {
                  setDistance(text); // Update the state for distance

                  // Trigger confetti if the length of the input is 6 or more
                  if (text.length >= 6) {
                    showCongratulationAlert();
                    triggerConfetti(); // Call the trigger function
                  } else {
                    // Optionally stop confetti for shorter inputs
                    setShowConfetti(false);
                  }
                }}
                value={distance}
                keyboardType="decimal-pad" // Allow decimal input for km
              />

              <Text style={styles.dailyRoutineText}>
                {languageText.enterDuration}
              </Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, { fontSize: RFValue(10) }]}
                  onChangeText={setHours}
                  value={hours}
                  placeholder={languageText.placeholderHH}
                  keyboardType="numeric" // Ensure only numbers can be entered
                />

                <TextInput
                  style={[styles.input, { fontSize: RFValue(10) }]}
                  onChangeText={setMinutes}
                  value={minutes}
                  placeholder={languageText.placeholderMM}
                  keyboardType="numeric" // Ensure only numbers can be entered
                />
              </View>
              <Text style={styles.anyDifficultyText}>
                {languageText.difficultyText}
              </Text>
              <TextInput
                style={[styles.input, { fontSize: RFValue(10) }]}
                onChangeText={setText}
                value={difficultyText}
                placeholder={languageText.placeholderText}
                keyboardType="default"
              />
            </View>
          </ScrollView>

          {/* Custom Congratulations Modal */}
          <Modal
            animationType="fade"
            transparent={true}
            visible={showCongrats}
            onRequestClose={() => setShowCongrats(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalView}>
                <Image
                  source={require("../../assets/images/congratulation.png")} // Replace with your image path
                  style={styles.congratulationsImage}
                />
                <Text style={styles.modalTitle}>
                  {languageText.congratulations}
                </Text>
                <Text style={styles.modalText}>{languageText.dailyGoal}</Text>
                <TouchableOpacity
                  onPress={() => setShowCongrats(false)}
                ></TouchableOpacity>
              </View>
            </View>
          </Modal>
          {/* Footer Buttons */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
            >
              <Text style={styles.footerButtonText}>{languageText.submit}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
              <Text style={styles.footerButtonText}>{languageText.clear}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
            >
              <Text style={styles.footerButtonText}>{languageText.cancel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

// Info Card Component
interface InfoCardProps {
  icon: keyof typeof FontAwesome.glyphMap; // Ensure the icon type corresponds to valid FontAwesome icons
  title: string;
  info: string;
  onPress?: () => void; // Optional onPress handler for card press action
}

const InfoCard: React.FC<InfoCardProps> = ({ icon, title, info, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.iconContainer}>
        <FontAwesome name={icon} size={22} color="#13c89e" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardInfo}>{info}</Text>
      </View>
    </TouchableOpacity>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
    marginTop: 50,
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },

  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "left",
    marginBottom: 16,
    top: -5,
    width: "80%", // Adjust based on your layout
    flexWrap: "wrap",
  },
  progressContainer: {
    alignItems: "center",
    marginBottom: 30,
    marginTop: 30,
  },
  imageInsideProgress: {
    position: "absolute",
    width: 250,
    height: 200,
    top: 30,
  },
  goalText: {
    top: -30,
    fontSize: 18,
    fontWeight: "bold",
    backgroundColor: "#13c89e",
    elevation: 2,
    padding: 10,
    paddingHorizontal: 20, // Add horizontal padding for space around the text
    borderRadius: 40,
    textAlign: "center",
    alignSelf: "center",
    color: "#e1f6f2",
    marginBottom: -20,
  },

  infoContainer: {
    marginBottom: 10,
    marginTop: 10,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",  // Ensure vertical alignment of items
    marginBottom: 2,
    paddingHorizontal: -10,  // Add some horizontal padding to avoid overlap
  },
  
  iconContainer: {
    top: 20,
  },
  card: {
    flex: 1,
    maxWidth: "100%", // Ensure it doesn't exceed the container's width
    paddingVertical: 5,
    paddingHorizontal: 15,
    backgroundColor: "#f8f8f8",
    borderRadius: 20,
    margin: 5,
    elevation: 2,
  },

  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  textContainer: {
    marginLeft: 16, // Space between icon and text
    flex: 1, // Allow text container to take remaining space
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
    bottom: 10,
    left: 18,
  },
  cardInfo: {
    fontSize: 14,
    color: "#666",
    bottom: 10,
    left: 23,
  },
  dateInput: {
    padding: 12,
    backgroundColor: "#13c89e",
    borderRadius: 30,
    marginBottom: 10,
    alignItems: "center",
    bottom: 70,
    width: "50%",
    alignSelf: "center",
  },
  dateText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
  dailyRoutineContainer: {
    marginTop: 10,
    padding: 16,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    bottom: 60,
    marginBottom: -30,
  },
  dailyRoutineTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  dailyRoutineText: {
    fontSize: 16,
    marginBottom: 10,
    left: 10,
  },
  anyDifficultyText: {
    fontSize: 16,
    marginBottom: 10,
    left: 10,
  },
  input: {
    flex: 1, // Make inputs take equal space
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    textAlign: "left", // Center the text in the input
    marginHorizontal: 5,
    marginBottom: 15,
  },
  inputContainer: {
    flexDirection: "row", // Aligns inputs in a row
    alignItems: "center", // Centers items vertically
    justifyContent: "space-between", // Space between items
  },

  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    justifyContent: "center",
  },

  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    backgroundColor: "#fff",
    top: 10,
  },

  submitButton: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: "#3CB371",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    padding: 10,
    textAlign: "center",
  },
  clearButton: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: "#FFC30B",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    padding: 10,
  },
  cancelButton: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: "#FF6347",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    padding: 10,
  },
  footerButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  translateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "transparent", // Light background for contrast
    width: "100%", // Slightly reduced width for padding
    height: 100,
    marginBottom: 1,
    paddingLeft: 10,
    borderRadius: 15,
    bottom: 35,
    padding: 10,
    marginLeft: 30,
  },
  translateButton: {
    position: "absolute",
    bottom: -5, // Position at the top
    right: 10, // Adjust right spacing as needed
    backgroundColor: "#ffffff",
    flexDirection: "row", // Align items horizontally
    alignItems: "center", // Center items vertically
    padding: 7,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1,
    marginBottom: 10,
  },
  buttonTranslateText: {
    color: "#4169E1", // Text color
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 5, // Space between icon and text
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    width: 300,
    height: 260,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 80,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#4CAF50",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 20,
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 10,
  },
  congratulationsImage: {
    width: 100, // Adjust width
    height: 100, // Adjust height
    resizeMode: "contain", // Adjusts how the image fits in the specified dimensions
    marginBottom: 5, // Optional: adds space below the image
  },
});

export default Walking;
