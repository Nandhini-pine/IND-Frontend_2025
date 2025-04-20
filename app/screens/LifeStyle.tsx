import React, { useState, useCallback, useEffect } from "react";
import {
  Text as RNText,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Dimensions,
  Platform,
  TextInput,
  SafeAreaView,
  StatusBar,
  BackHandler,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../type";
import Icon from "react-native-vector-icons/MaterialIcons";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaProvider } from "react-native-safe-area-context";
import texts from "../translation/texts";
import CustomAlert from "../components/CustomAlert";
import { RFValue } from "react-native-responsive-fontsize";

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

const LifeStyleMonitoring: React.FC<WalkingProps> = ({ navigation }) => {
  const [isTranslatingToTamil, setIsTranslatingToTamil] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [responses, setResponses] = useState({
    question1: null,
    question2: null,
  });
  const [selectedTrackingOptions, setSelectedTrackingOptions] = useState<{
    [key: string]: boolean;
  }>({});
  const [otherOptionText, setOtherOptionText] = useState(""); // State for the text input
  const [smokingCount, setSmokingCount] = useState(""); // State for the smoking count input
  const [phoneNumber, setPhoneNumber] = useState("");
  const [patientDetails, setPatientDetails] = useState<PatientDetails | null>(
    null
  );
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [cancelAlertVisible, setCancelAlertVisible] = useState(false);
  const [successAlertVisible, setSuccessAlertVisible] = useState(false);
  const [errorAlertVisible, setErrorAlertVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  // Toggle between Tamil and English based on the button click
  const languageText = isTranslatingToTamil ? texts.tamil : texts.english;

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

  //Device back button handling
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
        const handleCancel = () => {
          setCancelAlertVisible(true);
        };
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        backAction
      );

      return () => backHandler.remove();
    }, [navigation])
  );

  const handleSuccess = () => {
    setSuccessAlertVisible(true);
  };

  const fetchPatientDetails = async (phone: string) => {
    try {
      console.log("Fetching patient details for phone:", phone);
      const response = await axios.get(
        `https://indheart.pinesphere.in/patient/patient/${phone}/`
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
  const trackingOptions = [
    { label: languageText.pastries },
    { label: languageText.sweets },
    { label: languageText.saltedItems },
    { label: languageText.preservedFoods },
    { label: languageText.pickles },
    { label: languageText.dryFish },
    { label: languageText.friedFood },
    { label: languageText.processedMeat },
    { label: languageText.others },
  ];

  // Handle Translation
  const handleTranslate = () => {
    setIsTranslatingToTamil(!isTranslatingToTamil);
    console.log("Translate button pressed");
  };

  /* const handleCancel = useCallback(() => {
    Alert.alert(
      "Confirm Cancel",
      "Are you sure you want to cancel?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          onPress: () => navigation.navigate("PatientDashboardPage"),
        },
      ],
      { cancelable: false }
    );
  }, [navigation]); */
  const handleCancel = () => {
    setCancelAlertVisible(true);
  };

  const handleDateSelect = (event: any, date?: Date | undefined) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };

  const showPicker = () => {
    setShowDatePicker(true);
  };

  const formatDate = (date: Date) => {
    const options = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    } as const;
    return date.toLocaleDateString(undefined, options);
  };

  const handleResponse = (question: string, answer: boolean) => {
    setResponses((prev) => ({
      ...prev,
      [question]: answer,
    }));
    console.log("Response for", question, ":", answer); // Add this line to debug

    if (question === "question1") {
      if (answer) {
        //Alert.alert("Warning", "Smoking is harmful to your health!");
        setAlertTitle("Warning");
        setAlertMessage("Smoking is harmful to your health!");
      } else {
        //Alert.alert("Thank You!", "Your decision to not smoke is appreciated.");
        setAlertTitle("Thank You!");
        setAlertMessage("Your decision to not smoke is appreciated.");
        setSmokingCount(""); // Clear the input if they select "No"
      }
    } else if (question === "question2") {
      if (answer) {
        //Alert.alert("Reminder", "Alcohol is harmful to your health!");
        setAlertTitle("Reminder");
        setAlertMessage("Alcohol is harmful to your health!");
      } else {
        /* Alert.alert(
          "Great Choice!",
          "Staying active contributes to a healthy lifestyle."
        ); */
        setAlertTitle("Great Choice!");
        setAlertMessage("Staying active contributes to a healthy lifestyle.");
      }
    }
  };

  const handleTrackingOptionSelect = (label: string) => {
    setSelectedTrackingOptions((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));

    // Reset otherOptionText if "Others" is unselected
    if (label === "Others" && selectedTrackingOptions[label]) {
      setOtherOptionText(""); // Reset text if unselected
    }
  };

  // Only declare the function once
  const handleError = (message: string) => {
    setAlertMessage(message);
    setAlertTitle("Error");
    setAlertVisible(true);
  };

  const handleSubmit = async () => {
    if (!patientDetails || !selectedDate) {
      //("Error", "Patient details or date is missing.");
      setAlertTitle("Error");
      setAlertMessage("Patient details or date is missing.");
      setAlertVisible(true);
      return;
    }

    // Prepare the payload with the form data
    const payload = {
      patient_id: patientDetails.patient_id,
      date: selectedDate.toISOString().split("T")[0], // Format date
      smoking: responses.question1 === true,
      no_of_cigraretes: smokingCount ? parseInt(smokingCount) : 0,
      alcoholic: responses.question2 === true,
      pastries: selectedTrackingOptions["Pastries"] || false,
      sweets: selectedTrackingOptions["Sweets"] || false,
      salted_items: selectedTrackingOptions["Salted Items"] || false,
      preserved_foods: selectedTrackingOptions["Preserved Foods"] || false,
      pickles: selectedTrackingOptions["Pickles"] || false,
      dry_fish: selectedTrackingOptions["Dry Fish"] || false,
      fried_food: selectedTrackingOptions["Fried Food"] || false,
      processed_meat: selectedTrackingOptions["Processed Meat"] || false,
      others_track: otherOptionText || null, // Track the other text
    };

    try {
      // Make the POST request to your Django API
      const response = await axios.post(
        "https://indheart.pinesphere.in/patient/lifestyle-data/",
        payload
      );

      // Show success alert and navigate
      /* Alert.alert("Success", "Your data has been saved successfully.", [
        {
          text: "OK",
          onPress: () => navigation.navigate("PatientDashboardPage"),
        },
      ]); */
      // On success, show the success alert
      handleSuccess();

      handleClear(); // Clear the form after successful submission
    } catch (error) {
      let errorMessage = "Failed to submit Lifestyle Details.";

      if (axios.isAxiosError(error)) {
        if (error.response) {
          // Check if the error message indicates a unique constraint violation
          if (error.response.data.non_field_errors) {
            errorMessage =
              languageText.dateAlreadySavedWater;
          } else {
            // General error response
            errorMessage =
              error.response.data.detail ||
              "Failed to submit Lifestyle Tracker.";
          }
        } else if (error.request) {
          // No response received
          errorMessage =
            "No response from server. Please check your connection.";
        }
      } else {
        // Non-Axios or general error
        errorMessage = (error as Error).message;
        handleError(errorMessage); // Trigger custom error alert
      }

      // Show the same success popup with the error message
      //Alert.alert("Error", errorMessage, [{ text: "OK" }]);
      // On error, show the error alert with the error message
      handleError(errorMessage);
    }
  };

  const handleClear = useCallback(() => {
    setResponses({ question1: null, question2: null }); // Clear responses
    setSelectedTrackingOptions({}); // Clear selected tracking options
    setSmokingCount("");
    setOtherOptionText(""); // Clear other input text
    setShowDatePicker(false); // Hide the date picker if visible
  }, []);

  return (
    <SafeAreaProvider>
      {/* Custom Alert for Submission Error */}
      <CustomAlert
        title={alertTitle} // Set dynamically based on submission result
        message={alertMessage} // Set dynamically based on submission result
        visible={alertVisible} // Controls visibility of the custom alert
        onClose={() => setAlertVisible(false)} // Close the alert when the user presses OK
      />
      <CustomAlert
        title="Cancel"
        message="Are you sure you want to cancel?"
        visible={cancelAlertVisible}
        onClose={() => setCancelAlertVisible(false)}
        mode="confirm"
        onYes={() => {
          navigation.navigate("PatientDashboardPage");
        }}
        onNo={() => setCancelAlertVisible(false)}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Adjust StatusBar visibility */}
        <StatusBar
          barStyle="dark-content" // Set the color of status bar text
          backgroundColor="transparent" // Make the background transparent
          translucent={true} // Make status bar translucent
        />

        <View style={styles.container}>
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
          >
            <View style={styles.headerContainer}>
              <Text style={styles.title}>
                {languageText.lifeStyleTrackerTitle}
              </Text>
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

            <View style={styles.coverContainer}>
              <Image
                source={require("../../assets/images/lifestylecoverimge.jpg")}
                style={styles.coverImage}
              />
            </View>

            {/* Date Picker Button */}
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={showPicker}
            >
              <Text style={styles.datePickerButtonText}>
                {selectedDate ? formatDate(selectedDate) : "Select Date"}
              </Text>
            </TouchableOpacity>

            {/* DateTimePicker Component */}
            {showDatePicker && (
              <DateTimePicker
                value={selectedDate ? selectedDate : new Date()} // Set current date if no date selected
                mode="date" // Choose date mode
                display={Platform.OS === "ios" ? "inline" : "calendar"}
                onChange={handleDateSelect} // Handle date selection
              />
            )}

            {/* Question Container */}
            <View style={styles.questionContainer}>
              <Text style={styles.questionTitle}>{languageText.upload}</Text>

              {/* Sample Question 1 */}
              <View
                style={[
                  styles.question,
                  responses.question1 === true
                    ? styles.questionBgRed
                    : responses.question1 === false
                    ? styles.questionBgGreen
                    : null,
                ]}
              >
                <Text style={styles.questionText}>
                  {languageText.smokeQuest}
                </Text>
                <View style={styles.responseButtons}>
                  <TouchableOpacity
                    style={[
                      styles.answerButton,
                      responses.question1 === true
                        ? styles.yesButtonSelected
                        : null,
                    ]}
                    onPress={() => handleResponse("question1", true)}
                  >
                    <Text style={styles.answerButtonText}>
                      {languageText.yes}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.answerButton,
                      responses.question1 === false
                        ? styles.noButtonSelected
                        : null,
                    ]}
                    onPress={() => handleResponse("question1", false)}
                  >
                    <Text style={styles.answerButtonText}>
                      {languageText.no}
                    </Text>
                  </TouchableOpacity>
                </View>
                {/* Display the smoking count input when "Yes" is selected */}
                {responses.question1 === true && (
                  <TextInput
                    style={styles.otherInput}
                    placeholder="Enter smoking count"
                    value={smokingCount}
                    onChangeText={setSmokingCount} // Update smoking count input
                    keyboardType="numeric" // Ensure the input is numeric
                  />
                )}
              </View>

              {/* Sample Question 2 */}
              <View
                style={[
                  styles.question,
                  responses.question2 === true
                    ? styles.questionBgRed
                    : responses.question2 === false
                    ? styles.questionBgGreen
                    : null,
                ]}
              >
                <Text style={styles.questionText}>
                  {languageText.alcoholQuest}
                </Text>
                <View style={styles.responseButtons}>
                  <TouchableOpacity
                    style={[
                      styles.answerButton,
                      responses.question2 === true
                        ? styles.yesButtonSelected
                        : null,
                    ]}
                    onPress={() => handleResponse("question2", true)}
                  >
                    <Text style={styles.answerButtonText}>
                      {languageText.yes}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.answerButton,
                      responses.question2 === false
                        ? styles.noButtonSelected
                        : null,
                    ]}
                    onPress={() => handleResponse("question2", false)}
                  >
                    <Text style={styles.answerButtonText}>
                      {languageText.no}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Tracking Options */}
            <View style={styles.trackingContainer}>
              <Text style={styles.trackingTitle}>
                {languageText.pickEatables}:
              </Text>
              {trackingOptions.map((option, index) => (
                <View key={index}>
                  <TouchableOpacity
                    style={styles.trackingOption}
                    onPress={() => handleTrackingOptionSelect(option.label)}
                  >
                    <Text style={styles.trackingOptionText}>
                      {option.label}
                    </Text>
                    {selectedTrackingOptions[option.label] && (
                      <Icon
                        name="check"
                        size={20}
                        color="green"
                        style={styles.tickIcon}
                      />
                    )}
                  </TouchableOpacity>

                  {/* Text input for "Others" option */}
                  {option.label === "Others" &&
                    selectedTrackingOptions[option.label] && (
                      <TextInput
                        style={styles.otherInput}
                        placeholder="Please specify"
                        value={otherOptionText}
                        onChangeText={setOtherOptionText} // Update text input
                      />
                    )}
                </View>
              ))}
            </View>
          </ScrollView>

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    marginTop: 35,
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },

  scrollContainer: {
    paddingBottom: 100,
  },
  translateButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  buttonTranslateText: {
    marginLeft: 5,
    color: "#4169E1",
    fontWeight: "500",
    fontSize: 12,
    flexShrink: 1,
  },

  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 20,
    maxWidth: "100%", // Ensure it doesn't exceed the screen
  },
  coverContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },
  coverImage: {
    width: "97%",
    height: 200,
    resizeMode: "cover",
    borderRadius: 20,
    marginBottom: 1,
    marginTop: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#36454F",
  },
  datePickerButton: {
    marginVertical: 20,
    backgroundColor: "#c5c5c5",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    marginHorizontal: 20,
    width: "50%",
    alignSelf: "center",
    top: 5,
  },
  datePickerButtonText: {
    color: "#000",
    fontWeight: "600",
    padding: 2,
  },
  questionContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  questionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  question: {
    marginBottom: 15,
  },
  questionText: {
    fontSize: 16,
    color: "#555",
  },
  responseButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  answerButton: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 10,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
  },
  selectedButton: {
    backgroundColor: "#4169E1",
  },
  answerButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    backgroundColor: "#fff",
    elevation: 5,
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
    backgroundColor: "#FFD700",
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
    color: "#fff",
    fontWeight: "600",
  },
  questionBgRed: {
    backgroundColor: "#FFE4E1", // Change to your desired value
    padding: 20,
    borderRadius: 30,
  },
  questionBgGreen: {
    backgroundColor: "#AFEEEE", // Change to your desired value
    padding: 20,
    borderRadius: 30,
  },
  yesButtonSelected: {
    backgroundColor: "#F08080", // Change to your desired value
    padding: 10,
  },
  noButtonSelected: {
    backgroundColor: "#20B2AA", // Change to your desired value
    padding: 10,
  },
  trackingContainer: {
    marginTop: 16,
    padding: 20,
  },
  trackingTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  trackingOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#f0f0f0",
    marginBottom: 8,
  },
  trackingOptionText: {
    fontSize: 16,
  },
  tickIcon: {
    marginLeft: 10,
  },
  otherInput: {
    backgroundColor: "#fff",

    borderRadius: 20,
    padding: 10,
    marginTop: 15,
  },
});

export default LifeStyleMonitoring;
