import React, { useState, useCallback, useEffect } from "react";
import {
  Text as RNText,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Platform,
  Alert,
  SafeAreaView,
  StatusBar,
  BackHandler,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../type";
import texts from "../translation/texts";
import Icon from "react-native-vector-icons/MaterialIcons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { RFValue } from "react-native-responsive-fontsize";
import CustomAlert from "../components/CustomAlert";

// Custom Text component to disable font scaling globally
const Text = (props: any) => {
  return <RNText {...props} allowFontScaling={false} />;
};

// Define the props type
type YogaNavigationProp = StackNavigationProp<
  RootStackParamList,
  "DailyExercise"
>;

interface WalkingProps {
  navigation: YogaNavigationProp;
}
interface PatientDetails {
  patient_id: string; // Keep the patient_id string if you need it for other purposes
  diet: string;
  name: string; // Make sure to add this line
}

const YogaPage: React.FC<WalkingProps> = ({ navigation }) => {
  // Toggle between Tamil and English based on the button click
  const [isTranslatingToTamil, setIsTranslatingToTamil] = useState(false);

  // Toggle between Tamil and English based on the button click for placeholder
  const languageText = isTranslatingToTamil ? texts.tamil : texts.english;

  // Update language state dynamically
  const language: "english" | "tamil" = isTranslatingToTamil
    ? "tamil"
    : "english";
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [duration, setDuration] = useState<string>("");
  const [durationHours, setDurationHours] = useState<string>(""); // State for hours
  const [durationMinutes, setDurationMinutes] = useState<string>(""); // State for minutes
  const [phoneNumber, setPhoneNumber] = useState("");
  const [patientDetails, setPatientDetails] = useState<PatientDetails | null>(
    null
  );
  const [alertMode, setAlertMode] = useState("");
  const [customAlertVisible, setCustomAlertVisible] = useState(false);
  const [cancelAlertVisible, setCancelAlertVisible] = useState(false);
  // State for Yes/No selections
  const [yogaToday, setYogaToday] = useState<string | null>(null);
  const [mindfulYoga, setMindfulYoga] = useState<string | null>(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  //Device back button handler
  useFocusEffect(
    React.useCallback(() => {
      const backAction = () => {
        /*  Alert.alert("Cancel", "Are you sure you want to cancel?", [
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
      console.log("Fetching patient details for phone:", phone);
      const response = await axios.get(
        `https://vs3k4b04-8000.inc1.devtunnels.ms/patient/patient/${phone}/`
      );

      // Set only patient_id and diet
      setPatientDetails({
        patient_id: response.data.patient_id, // Keep this as your unique identifier
        diet: response.data.diet,
        name: response.data.name, // Correctly set the name

        // Remove id if not needed
      });
    } catch (error) {
      console.error("Error fetching patient details:", error);
    }
  };
  // Handler functions for buttons
  /*  const handleSubmit = async () => {
    if (!patientDetails || !selectedDate) {
      //Alert.alert("Error", "Please make sure all fields are filled.");
      setAlertTitle("Error");
      setAlertMessage("Please make sure all fields are filled.");
      setAlertVisible(true);
      return;
    }

    try {
      const payload = {
        patient_id: patientDetails.patient_id,
        date: selectedDate.toISOString().split("T")[0], // Format date as YYYY-MM-DD
        performed_yoga: yogaToday === "yes", // Convert "yes" to true and "no" to false
        duration_hours: parseInt(durationHours, 10) || 0,
        duration_minutes: parseInt(durationMinutes, 10) || 0,
        mindful_yoga: mindfulYoga === "yes", // Convert "yes" to true and "no" to false
      };

      console.log("Payload:", payload);

      const response = await axios.post(
        "https://vs3k4b04-8000.inc1.devtunnels.ms/patient/yoga-data/",
        payload
      );

      if (response.status === 201) {
        Alert.alert("Success", "Yoga activity saved successfully!", [
          {
            text: "OK",
            onPress: () => navigation.navigate("LifestyleMonitoring"),
          },
        ]);
      } else {
        Alert.alert("Error", "Failed to save yoga activity.");
      }
    } catch (error) {
      let errorMessage = "Failed to submit Walking Details.";

      if (axios.isAxiosError(error)) {
        if (error.response) {
          // Check if the error message indicates a unique constraint violation
          if (error.response.data.non_field_errors) {
            errorMessage =
              "Submission failed: This date has already been saved for this patient.";
          } else {
            // General error response
            errorMessage =
              error.response.data.detail || "Failed to submit water intake.";
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

      // Show the same success popup with the error message
      Alert.alert("Error", errorMessage, [{ text: "OK" }]);
    }
  }; */

  const handleSubmit = async () => {
    if (!patientDetails || !selectedDate) {
      setAlertTitle(languageText.errorTitle);
      setAlertMessage(languageText.errorMessage);
      setAlertVisible(true);
      return;
    }

    try {
      const payload = {
        patient_id: patientDetails.patient_id,
        date: selectedDate.toISOString().split("T")[0], // Format date as YYYY-MM-DD
        performed_yoga: yogaToday === "yes", // Convert "yes" to true and "no" to false
        duration_hours: parseInt(durationHours, 10) || 0,
        duration_minutes: parseInt(durationMinutes, 10) || 0,
        mindful_yoga: mindfulYoga === "yes", // Convert "yes" to true and "no" to false
      };

      console.log("Payload:", payload);

      const response = await axios.post(
        "https://vs3k4b04-8000.inc1.devtunnels.ms/patient/yoga-data/",
        payload
      );

      if (response.status === 201) {
        // Show custom alert for success
        setAlertTitle(languageText.successTitle);
        setAlertMessage(languageText.alertSuccessMessage);
        setAlertVisible(true); // Show custom alert
      } else {
        // Show custom alert for failure
        setAlertTitle(languageText.errorTitle);
        setAlertMessage("Failed to save yoga activity.");
        setAlertVisible(true); // Show custom alert
      }
    } catch (error) {
      let errorMessage = languageText.defaultErrorYogaMessage;

      if (axios.isAxiosError(error)) {
        if (error.response) {
          // Check if the error message indicates a unique constraint violation
          if (error.response.data.non_field_errors) {
            errorMessage =
              languageText.existingAlert;
          } else {
            // General error response
            errorMessage =
              error.response.data.detail || languageText.defaultErrorMessage;
          }
        } else if (error.request) {
          // No response received
          errorMessage =
            languageText.noResponseFromServer;
        }
      } else {
        // Non-Axios or general error
        errorMessage = (error as Error).message;
      }

      // Show the error message in custom alert
      setAlertTitle(languageText.errorTitle);
      setAlertMessage(errorMessage);
      setAlertVisible(true); // Show custom alert
    }
  };

  const handleClear = useCallback(() => {
    setYogaToday(null);
    setMindfulYoga(null);
    setSelectedDate(null);
    setDuration("");
    setDurationHours("");
    setDurationMinutes("");
  }, []); // Empty dependency array means this function won't change unless the component unmounts.

 /*  const handleCancel = useCallback(() => {
    Alert.alert(
      languageText.confirmCancelTitle,
      languageText.confirmCancelMessage,
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          onPress: () => navigation.navigate("PatientDashboardPage"),
        }, // Navigate back to patient dashboard
      ],
      { cancelable: false }
    );
  }, [navigation]); */
  const handleCancel = () => {
    // Trigger the custom alert instead of the default Alert
    setCancelAlertVisible(true);
  };
  // Handle Translation
  const handleTranslate = useCallback(() => {
    setIsTranslatingToTamil((prev) => !prev);
    console.log("Translate button pressed");
  }, []);

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === "ios") {
      setShowDatePicker((prevState) => !prevState); // Toggles the visibility
    } else {
      setShowDatePicker(false); // Close the picker after selecting the date for non-iOS platforms
    }

    if (date) {
      setSelectedDate(date); // Update selected date if available
    }
  };

  return (
    <SafeAreaProvider>
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
      <CustomAlert
        title={alertTitle}
        message={alertMessage}
        visible={alertVisible}
        onClose={() => {
          setAlertVisible(false); // Close the alert
          if (alertTitle === "Success") {
            navigation.navigate("LifestyleMonitoring"); // Navigate to the desired screen on success
          }
        }}
        okText={languageText.alertOk} // Translated OK text
        yesText={languageText.alertYes} // Translated Yes text
        noText={languageText.alertNo} // Translated No text
      />

      <CustomAlert
        title={alertTitle}
        message={alertMessage}
        visible={customAlertVisible}
        onClose={() => {
          setCustomAlertVisible(false); // Close the alert
          if (alertMode === "success") {
            navigation.navigate("PatientMedication"); // Navigate on success
          }
        }}
        okText={languageText.alertOk} // Translated OK text
        yesText={languageText.alertYes} // Translated Yes text
        noText={languageText.alertNo} // Translated No text
      />
      <SafeAreaView style={styles.safeArea}>
        {/* Adjust StatusBar visibility */}
        <StatusBar
          barStyle="dark-content" // Set the color of status bar text
          backgroundColor="transparent" // Make the background transparent
          translucent={true} // Make status bar translucent
        />

        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          {/* Top Cover Image Container */}
          <Text style={styles.title}>{languageText.yogaTrackerTitle}</Text>
          <View style={styles.coverContainer}>
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
            <Image
              source={require("../../assets/images/yogaImg.jpg")}
              style={styles.coverImage}
            />
          </View>

          {/* Date Picker Component */}
          <View style={styles.calendarContainer}>
            <View style={styles.datePickerContainer}>
              <Image
                source={require("../../assets/images/calendar.png")}
                style={styles.calendarIcon} // Position the calendar icon
              />
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                style={styles.datePickerField}
              >
                <Text style={styles.datePickerText}>
                  {selectedDate ? selectedDate.toDateString() : "Select Date"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* DateTimePicker */}
            {showDatePicker && (
              <DateTimePicker
                testID="dateTimePicker"
                value={selectedDate || new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "inline" : "calendar"}
                onChange={handleDateChange}
              />
            )}
          </View>

          {/* Combined Container for All Questions */}
          <View style={styles.containerItem}>
            <Text style={styles.containerText}>
              {languageText.yogaDailyRoutine}
            </Text>
            <View style={styles.textWrapper}>
              {/* Question 1 */}
              <View style={styles.row}>
                <Text style={styles.questionText}>
                  {languageText.didYouPerformYoga}
                </Text>
                <View style={styles.buttonGroup}>
                  <TouchableOpacity
                    style={[
                      styles.button,
                      styles.buttonFlex,
                      yogaToday === "yes" ? styles.buttonYes : {},
                    ]}
                    onPress={() => setYogaToday("yes")}
                  >
                    <Text>{languageText.yes}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.button,
                      styles.buttonFlex,
                      yogaToday === "no" ? styles.buttonNo : {},
                    ]}
                    onPress={() => setYogaToday("no")}
                  >
                    <Text>{languageText.no}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Question 2 */}
              <View style={styles.row}>
                <Text style={styles.questionText}>
                  {languageText.yogaDuration}
                </Text>
                <View style={styles.durationContainer}>
                  <TextInput
                    style={[styles.input, { fontSize: RFValue(10) }]}
                    placeholder={languageText.placeholderHH}
                    keyboardType="numeric"
                    value={durationHours} // Bind durationHours state
                    onChangeText={setDurationHours} // Update durationHours state
                  />
                  <TextInput
                    style={[styles.input, { fontSize: RFValue(10) }]}
                    placeholder={languageText.placeholderMM}
                    keyboardType="numeric"
                    value={durationMinutes} // Bind durationMinutes state
                    onChangeText={setDurationMinutes} // Update durationMinutes state
                  />
                </View>
              </View>

              {/* Question 3 */}
              <View style={styles.row}>
                <Text style={styles.questionText}>
                  {languageText.wereYouMindful}
                </Text>
                <View style={styles.buttonGroup}>
                  <TouchableOpacity
                    style={[
                      styles.button,
                      styles.buttonFlex,
                      mindfulYoga === "yes" ? styles.buttonYes : {},
                    ]}
                    onPress={() => setMindfulYoga("yes")}
                  >
                    <Text>{languageText.yes}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.button,
                      styles.buttonFlex,
                      mindfulYoga === "no" ? styles.buttonNo : {},
                    ]}
                    onPress={() => setMindfulYoga("no")}
                  >
                    <Text>{languageText.no}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
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
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    marginTop: 60,
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },

  coverContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },
  coverImage: {
    width: "99%",
    height: 340,
    resizeMode: "cover",
    borderRadius: 40,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#36454F",
    textAlign: "center",
    marginVertical: 10,
  },

  containerItem: {
    backgroundColor: "#f5f5f5",
    paddingTop: 15,
    borderRadius: 30,
    padding: 20,
    marginBottom: 10,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5,
  },
  textWrapper: {
    flexDirection: "column",
    flex: 1,
  },
  containerText: {
    fontSize: 20,
    color: "#36454F",
    textAlign: "center",
    fontWeight: "600",
    marginBottom: 20,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
    paddingVertical: 10,
    backgroundColor: "transparent",
  },
  submitButton: {
    flex: 1,
    marginHorizontal: 10,
    backgroundColor: "#3CB371",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
  },
  clearButton: {
    flex: 1,
    marginHorizontal: 10,
    backgroundColor: "#FFC30B",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
  },
  cancelButton: {
    flex: 1,
    marginHorizontal: 10,
    backgroundColor: "#FF6347",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
  },
  footerButtonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 16,
    padding: 5,
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  button: {
    margin: 5,
    padding: 10,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#c5c5c5",
    flex: 1,
    marginHorizontal: 10,
  },
  buttonYes: {
    backgroundColor: "#4CAF50",
  },
  buttonNo: {
    backgroundColor: "#F44336",
  },
  questionText: {
    fontSize: 16,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 20,
    padding: 7,
    fontSize: 12,
    flex: 1,
    marginHorizontal: 5,
  },
  durationContainer: {
    flexDirection: "row",
    justifyContent: "space-between", // Change this to 'center' if you want them centered
    alignItems: "center",
    width: "100%",
  },
  row: {
    marginBottom: 20,
  },
  buttonFlex: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  calendarContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  calendarIcon: {
    width: 40,
    height: 40,
    marginRight: 10, // Add margin to separate it from the button
  },
  datePickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E0E0E0",
    borderRadius: 20,
    padding: 10,
  },

  datePickerField: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    borderRadius: 5,
  },
  datePickerText: {
    fontSize: 16,
    color: "#000",
  },
  translateContainer: {
    flex: 1,
    right: 15,
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
    bottom: 10,

    alignSelf: "center",
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
});

export default YogaPage;
