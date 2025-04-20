import React, { useState, useEffect, useCallback } from "react";
import {
  Text as RNText,
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  ScrollView,
  SafeAreaView,
  TextInput,
  Dimensions,
  Platform,
  Alert,
  SafeAreaViewBase,
  StatusBar,
  BackHandler,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../type";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import texts from "../translation/texts";
import CustomAlert from "../components/CustomAlert";

// Custom Text component to disable font scaling globally
const Text = (props: any) => {
  return <RNText {...props} allowFontScaling={false} />;
};

type SleepRitualsPageNavigationProp = StackNavigationProp<
  RootStackParamList,
  "SleepRitualsPage"
>;

interface PatientDetails {
  patient_id: string; // Keep the patient_id string if you need it for other purposes
  diet: string;
  name: string; // Make sure to add this line
}

const SleepRitualsPage: React.FC = () => {
  const navigation = useNavigation<SleepRitualsPageNavigationProp>();
  const [selectedRituals, setSelectedRituals] = useState<Set<string>>(
    new Set()
  ); // For boolean rituals

  const [selectedBreaks, setSelectedBreaks] = useState<number>(1);
  const [savedBreaks, setSavedBreaks] = useState<number>(1);
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [patientDetails, setPatientDetails] = useState<PatientDetails | null>(
    null
  );
  const [isTranslatingToTamil, setIsTranslatingToTamil] = useState(false);
  const languageText = isTranslatingToTamil ? texts.tamil : texts.english; // Use the correct text based on translation state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [cancelAlertVisible, setCancelAlertVisible] = useState(false);
  const [alertMode, setAlertMode] = useState<string>(""); // Initialize the alertMode state

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

  const rituals = [
    { name: languageText.warmMilk, icon: "local-drink" },
    { name: languageText.footMassage, icon: "spa" },
    { name: languageText.quietEnvironment, icon: "volume-off" },
    { name: languageText.screenTimeManagement, icon: "screen-share" },
    { name: languageText.bedtimeRegularity, icon: "alarm" },
  ];

  const handleRitualToggle = (ritual: string) => {
    setSelectedRituals((prevSelectedRituals) => {
      const newSelection = new Set(prevSelectedRituals);
      if (newSelection.has(ritual)) {
        newSelection.delete(ritual);
      } else {
        newSelection.add(ritual);
      }
      return newSelection;
    });
  };
  // Handle Translation
  const handleTranslate = useCallback(() => {
    setIsTranslatingToTamil((prev) => !prev);
    console.log("Translate button pressed");
  }, []);

  // Increment and decrement handlers for sleep breaks
  const handleIncrement = () => {
    setSelectedBreaks((prevBreaks) =>
      prevBreaks < 10 ? prevBreaks + 1 : prevBreaks
    );
  };

  const handleDecrement = () => {
    setSelectedBreaks((prevBreaks) =>
      prevBreaks > 0 ? prevBreaks - 1 : prevBreaks
    );
  };

  const handleSaveBreaks = () => {
    setSavedBreaks(selectedBreaks);
  };

  const handleDateChange = (event: any, date?: Date | undefined) => {
    // Check if the date is defined before updating the state
    if (date && event.type !== "dismissed") {
      setSelectedDate(date);
    }
    setShowDatePicker(false);
  };

  const handleSaveDuration = () => {
    const hrs = parseInt(hours, 10);
    const mins = parseInt(minutes, 10);

    if (!isNaN(hrs) && !isNaN(mins)) {
      console.log(`Nap Duration: ${hrs} hours and ${mins} minutes`);
    } else {
      console.log("Invalid input");
    }
  };

  /*  const handleSubmit = async () => {
    if (!selectedRituals.size) {
      //Alert.alert("Error", "Please enter values.", [{ text: "OK" }]);
      setAlertTitle("Error");
      setAlertMessage("Please enter values.");
      return;
    }

    if (!selectedDate) {
      //Alert.alert("Error", "Date is required.", [{ text: "OK" }]);
      setAlertTitle("Error");
      setAlertMessage("Date is required.");
      return;
    }

    if (patientDetails) {
      const formattedDate = selectedDate
        ? selectedDate.toISOString().split("T")[0]
        : null;

      const requestData = {
        patient_id: patientDetails.patient_id,
        date: formattedDate,
        warm_milk: selectedRituals.has(languageText.warmMilk),
        foot_massage: selectedRituals.has(languageText.footMassage),
        quiet_environment: selectedRituals.has(languageText.quietEnvironment),
        screen_time_management: selectedRituals.has(
          languageText.screenTimeManagement
        ),
        bedtime_regularity: selectedRituals.has(languageText.bedtimeRegularity),
        sleep_breaks: savedBreaks || 0,
        nap_duration_hours: hours || 0,
        nap_duration_minutes: minutes || 0,
      };

      try {
        const response = await axios.post(
          "https://indheart.pinesphere.in/patient/sleep-rituals/",
          requestData
        );
        console.log("Rituals saved successfully:", response.data);

        // Show success alert
        Alert.alert(
          "Success",
          "Your sleep rituals have been saved successfully!",
          [
            {
              text: "OK",
              onPress: () => {
                // Check the value of patientDetails.diet and navigate accordingly
                if (patientDetails.diet === "Both") {
                  navigation.navigate("VegDietPage"); // Navigate to VegDiet
                } else if (patientDetails.diet === "Vegetarian") {
                  navigation.navigate("VegDietPage"); // Navigate to VegDiet
                } else if (patientDetails.diet === "Non-Vegetarian") {
                  navigation.navigate("NonVegDietPage"); // Navigate to NonVegDietPage
                } else {
                  // Optional: Handle unexpected diet values
                  console.warn("Unexpected diet value:", patientDetails.diet);
                }
              },
            },
          ]
        );
      } catch (error) {
        if (axios.isAxiosError(error)) {
          // Handle specific backend error messages
          const errorMessages = error.response?.data || {};
          if (
            errorMessages.non_field_errors &&
            errorMessages.non_field_errors.includes(
              "The fields patient_id, date must make a unique set."
            )
          ) {
            Alert.alert("Error", "Date of rituals already saved.", [
              { text: "OK" },
            ]);
          } else {
            const errorMessageText = errorMessages.non_field_errors
              ? errorMessages.non_field_errors.join(", ")
              : "There was an issue saving your sleep rituals. Please try again.";

            Alert.alert("Error", errorMessageText, [{ text: "OK" }]);
          }
        } else {
          Alert.alert(
            "Error",
            "An unexpected error occurred. Please try again.",
            [{ text: "OK" }]
          );
        }
      }
    } else {
      Alert.alert(
        "Error",
        "No patient details available. Please make sure you're logged in.",
        [{ text: "OK" }]
      );
    }
  }; */

  const handleSubmit = async () => {
    if (!selectedRituals.size) {
      setAlertTitle(languageText.alertErrorTitle);
      setAlertMessage(languageText.alertErrorMessage);
      setAlertVisible(true); // Display the custom alert
      return;
    }

    if (!selectedDate) {
      setAlertTitle(languageText.alertErrorTitle);
      setAlertMessage(languageText.dateRequired);
      setAlertVisible(true); // Display the custom alert
      return;
    }

    if (patientDetails) {
      const formattedDate = selectedDate
        ? selectedDate.toISOString().split("T")[0]
        : null;

      const requestData = {
        patient_id: patientDetails.patient_id,
        date: formattedDate,
        warm_milk: selectedRituals.has(languageText.warmMilk),
        foot_massage: selectedRituals.has(languageText.footMassage),
        quiet_environment: selectedRituals.has(languageText.quietEnvironment),
        screen_time_management: selectedRituals.has(
          languageText.screenTimeManagement
        ),
        bedtime_regularity: selectedRituals.has(languageText.bedtimeRegularity),
        sleep_breaks: savedBreaks || 0,
        nap_duration_hours: hours || 0,
        nap_duration_minutes: minutes || 0,
      };

      try {
        const response = await axios.post(
          "https://indheart.pinesphere.in/patient/sleep-rituals/",
          requestData
        );
        console.log("Rituals saved successfully:", response.data);

        // Success alert
        setAlertTitle(languageText.successTitle);
        setAlertMessage(languageText.sleepSuccessAlertMessage);
        setAlertMode("success"); // Set alert mode to "success"
        setAlertVisible(true); // Display the custom alert
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const errorMessages = error.response?.data || {};
          if (
            errorMessages.non_field_errors &&
            errorMessages.non_field_errors.includes(
              "The fields patient_id, date must make a unique set."
            )
          ) {
            setAlertTitle(languageText.errorTitle);
            setAlertMessage(languageText.sleepExistingErrorMessage);
            setAlertVisible(true); // Display the custom alert
          } else {
            const errorMessageText = errorMessages.non_field_errors
              ? errorMessages.non_field_errors.join(", ")
              : languageText.issueSavingSleep;
            setAlertTitle(languageText.errorTitle);
            setAlertMessage(errorMessageText);
            setAlertVisible(true); // Display the custom alert
          }
        } else {
          setAlertTitle(languageText.errorTitle);
          setAlertMessage(languageText.unexpectedError);
          setAlertVisible(true); // Display the custom alert
        }
      }
    } else {
      setAlertTitle(languageText.errorTitle);
      setAlertMessage(languageText.noPatientInfoError);
      setAlertVisible(true); // Display the custom alert
    }
  };

  // Add handlers for Clear and Cancel
  const handleClear = () => {
    setSelectedRituals(new Set());
    setSelectedBreaks(1);
    setHours("");
    setMinutes("");
    setSelectedDate(null);
  };

  /*  const handleCancel = () => {
    Alert.alert("Cancel", "Are you sure you want to cancel?", [
      { text: "No", style: "cancel" },
      { text: "Yes", onPress: () => navigation.navigate("DailyUploads") }, // Navigate to PatientDashboard
    ]);
  }; */

  const handleCancel = () => {
    // Trigger the custom alert instead of the default Alert
    setCancelAlertVisible(true);
  };

  // Update the calculation for progress
  const totalRituals = rituals.length;
  const completedRituals = selectedRituals.size;
  const ritualProgress = (completedRituals / totalRituals) * 50;

  const breaksProgress = (Math.min(selectedBreaks, 10) / 10) * 25;
  const napDuration = parseInt(hours, 10) * 60 + parseInt(minutes, 10);
  const napProgress = Math.min(napDuration / 120, 1) * 25;

  const progress = ritualProgress + breaksProgress + napProgress;

  // Determine progress bar color
  const progressColor = "#FFFFFF"; // Default white color
  // Green when complete, gray otherwise

  return (
    <SafeAreaProvider>
      <CustomAlert
        title={alertTitle}
        message={alertMessage}
        visible={alertVisible}
        onClose={() => {
          console.log("Alert closed");
          setAlertVisible(false); // Close the alert
          if (alertMode === "success" && patientDetails) {
            console.log(
              "Navigating based on patient diet:",
              patientDetails.diet
            );

            // Navigate based on diet value when the alert is closed
            if (
              patientDetails.diet === "Both" ||
              patientDetails.diet === "Vegetarian"
            ) {
              console.log("Navigating to VegDietPage");
              navigation.navigate("VegDietPage");
            } else if (patientDetails.diet === "Non-Vegetarian") {
              console.log("Navigating to NonVegDietPage");
              navigation.navigate("NonVegDietPage");
            } else {
              console.warn("Unexpected diet value:", patientDetails.diet);
            }
          } else {
            console.warn("No patient details or alert mode is not success");
          }
        }}
        onYes={() => {
          console.log("Alert confirmed");
          console.log("Alert Mode:", alertMode); // Log the current alert mode
          console.log("Patient Details:", patientDetails); // Log the patient details

          setAlertVisible(false); // Close the alert
          if (alertMode === "success" && patientDetails) {
            console.log(
              "Navigating based on patient diet:",
              patientDetails.diet
            );

            // Navigate based on diet value when the alert is confirmed
            if (
              patientDetails.diet === "Both" ||
              patientDetails.diet === "Vegetarian"
            ) {
              console.log("Navigating to VegDietPage");
              navigation.navigate("VegDietPage");
            } else if (patientDetails.diet === "Non-Vegetarian") {
              console.log("Navigating to NonVegDietPage");
              navigation.navigate("NonVegDietPage");
            } else {
              console.warn("Unexpected diet value:", patientDetails.diet);
            }
          } else {
            console.warn("No patient details or alert mode is not success");
          }
        }}
        onOk={() => {
          console.log("Alert OK clicked");
          setAlertVisible(false); // Close the alert

          // You can optionally add any additional action here, if necessary.
        }}
        okText={languageText.alertOk} // Translated OK text
        yesText={languageText.alertYes} // Translated Yes text
        noText={languageText.alertNo} // Translated No text
      />

      <CustomAlert
        title={languageText.alertCancelTitle}
        message={languageText.alertCancelMessage}
        visible={cancelAlertVisible}
        onClose={() => setCancelAlertVisible(false)}
        mode="confirm"
        onYes={() => {
          // Ensure that navigation happens when "Yes" is clicked
          navigation.navigate("PatientDashboardPage"); // Navigate to PatientDashboardPage
        }}
        onNo={() => setCancelAlertVisible(false)} // Close the alert on No
        yesText={languageText.alertYes} // Translated Yes text
        noText={languageText.alertNo} // Translated No text
      />
      <SafeAreaView style={styles.container}>
        <View style={styles.rowContainer}>
          <Text style={styles.greeting}>
            Hi, {patientDetails ? patientDetails.name : "Loading..."} !
          </Text>
        </View>
        <View style={styles.translateContainer}>
          <TouchableOpacity
            onPress={handleTranslate}
            style={styles.translateButton}
          >
            <Icon
              name={isTranslatingToTamil ? "language" : "translate"}
              size={20}
              color="#4169E1"
              style={styles.icon}
            />
            <Text style={styles.buttonTranslateText}>
              {isTranslatingToTamil ? "Translate to English" : "தமிழில் படிக்க"}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          <View style={styles.topContainer}>
            <Image
              source={require("../../assets/images/sleeping.jpg")}
              style={styles.topImage}
            />
            <View style={styles.textOverlay}>
              <Text style={styles.topText}>{languageText.evaluateSleep}</Text>
              <Text style={styles.topSubText}>{languageText.sleepPattern}</Text>
            </View>
          </View>

          {/* Date Picker Field with Image */}
          <View style={styles.datePickerContainer}>
            <Image
              source={require("../../assets/images/calendar.png")}
              style={styles.datePickerImage}
            />
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={styles.datePickerField}
            >
              <Text style={styles.datePickerText}>
                {selectedDate
                  ? selectedDate.toDateString()
                  : languageText.selectDate}
              </Text>
            </TouchableOpacity>
          </View>

          {/* DateTimePicker */}
          {showDatePicker && (
            <View style={styles.datePickerWrapper}>
              <DateTimePicker
                value={selectedDate || new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "inline" : "calendar"}
                onChange={handleDateChange}
                style={Platform.OS === "ios" ? styles.iosDatePicker : undefined}
              />
            </View>
          )}

          {/* Sleep Interventions  */}
          <View style={styles.ritualsContainer}>
            <Text style={styles.optionTitle}>
              {languageText.selectSleepInterventions}
            </Text>
            {rituals.map((ritual) => (
              <TouchableOpacity
                key={ritual.name}
                style={[
                  styles.ritualItem,
                  selectedRituals.has(ritual.name) && styles.selectedRitual,
                ]}
                onPress={() => handleRitualToggle(ritual.name)}
              >
                <Icon
                  name={ritual.icon}
                  size={24}
                  color={
                    selectedRituals.has(ritual.name) ? "#4CAF50" : "#A9A9A9"
                  }
                />
                <Text style={styles.ritualText}>{ritual.name}</Text>
                {selectedRituals.has(ritual.name) && (
                  <Icon
                    name="check"
                    size={20}
                    color="#4CAF50"
                    style={styles.checkmarkIcon}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Sleep Breaks */}
          <Text style={styles.breakTitle}>
            {languageText.selectSleepBreaks}
          </Text>
          <View style={styles.breaksSelectorContainer}>
            <Image
              source={require("../../assets/images/clock.png")}
              style={styles.breaksImage}
            />
            <View style={styles.breaksControlContainer}>
              <TouchableOpacity
                onPress={handleDecrement}
                style={styles.controlButtonMinus}
              >
                <Icon name="remove" size={18} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.breaksCount}>{selectedBreaks}</Text>
              <TouchableOpacity
                onPress={handleIncrement}
                style={styles.controlButtonPlus}
              >
                <Icon name="add" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Nap Duration */}
          <Text style={styles.napTitle}>{languageText.enterNapDuration}</Text>
          <View style={styles.napDurationContainer}>
            <Image
              source={require("../../assets/images/sleep.png")}
              style={styles.durationImage}
            />
            <View style={styles.breaksControlContainer}>
              <TextInput
                style={[styles.timeInput, { textAlign: "left" }]}
                placeholder="HH"
                placeholderTextColor="#d3d3d3"
                keyboardType="numeric"
                maxLength={2}
                onChangeText={(text) => setHours(text)}
                value={hours}
                selectionColor="white"
              />
              <Text style={styles.timeSeparator}>:</Text>
              <TextInput
                style={[styles.timeInput, { textAlign: "left" }]}
                placeholder="MM"
                placeholderTextColor="#d3d3d3"
                keyboardType="numeric"
                maxLength={2}
                onChangeText={(text) => setMinutes(text)}
                value={minutes}
                selectionColor="white"
              />
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                { width: `${progress}%`, backgroundColor: progressColor },
              ]}
            />
          </View>
        </ScrollView>
        {/* Footer Buttons */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.footerButtonText}>{languageText.submit}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
            <Text style={styles.footerButtonText}>{languageText.clear}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.footerButtonText}>{languageText.cancel}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    marginTop: 35,
    paddingTop: 0,
    paddingBottom: 30,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    padding: 10,
  },
  greeting: {
    left: 15,
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 0,
    textAlign: "left",
    top: 25,

    marginRight: 10,
  },
  topContainer: {
    width: Dimensions.get("window").width - 10,
    height: 200,
    backgroundColor: "#f0f0f0",
    borderRadius: 30,
    borderColor: "#c0c0c0",
    borderWidth: 1,
    marginBottom: 10,
    overflow: "hidden",
    elevation: 5,
  },
  topImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  textOverlay: {
    position: "absolute",
    top: "40%",
    left: "10%",
  },
  topText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#CD5C5C",
    marginBottom: 3,
    right: 15,
    bottom: 65,
  },
  datePickerWrapper: {
    width: Dimensions.get("window").width * 0.9, // Ensures the calendar fits within 90% of the screen width
    alignItems: "center",
    justifyContent: "center",
    padding: 10, // Ensures enough padding on iOS
    marginVertical: 20, // Provides space around the calendar to avoid overlap
  },
  iosDatePicker: {
    width: Dimensions.get("window").width - 40, // Adjust to fit the screen
    height: 300, // Set a specific height for better visibility
  },
  datePickerField: {
    width: "50%",
    left: 100,
    bottom: 47,
    marginVertical: 15,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 45,
    backgroundColor: "#fff",
  },
  datePickerText: {
    fontSize: 16,
    color: "#333",
    alignItems: "center",
    textAlign: "center",
  },
  datePickerImage: {
    width: 35,
    height: 30,
    marginRight: 10,
    left: 55,
  },
  topSubText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    right: 15,
    bottom: 65,
  },

  optionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    right: -8,
    bottom: 30,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    textAlign: "center",
  },

  ritualsContainer: {
    marginBottom: 20,
    width: "100%",
  },
  ritualItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#fff",
    marginBottom: 10,
    backgroundColor: "#f9f9f9",
  },
  selectedRitual: {
    borderColor: "#4CAF50",
    backgroundColor: "#e8f5e9",
  },
  ritualText: {
    marginLeft: 10,
    fontSize: 16,
  },
  checkmarkIcon: {
    marginLeft: "auto",
  },

  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  datePickerContainer: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    top: 10,
  },
  calendar: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    backgroundColor: "#fff",
    padding: 10,
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#4CAF50",
    borderRadius: 5,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
  },

  breaksSelectorContainer: {
    width: "100%",
    height: 100,
    backgroundColor: "#f3f3f3",
    borderWidth: 1,
    borderColor: "#EEE8AA",
    borderRadius: 40,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 5,
    overflow: "hidden",
  },

  breakTitle: {
    fontSize: 20,
    fontWeight: "bold",
    right: -8,
    bottom: 10,
    marginTop: 5,
    marginBottom: 5,
  },
  breaksImage: {
    width: 150,
    height: 180,
    resizeMode: "contain",
    marginRight: 10,
    right: 20,
  },
  napTitle: {
    fontSize: 20,
    fontWeight: "bold",
    right: -8,
    bottom: 10,
    marginTop: 10,
    marginBottom: 0,
    paddingTop: 15,
  },
  durationImage: {
    width: "100%",
    height: 200,
    resizeMode: "contain",
    marginRight: 0,
    alignSelf: "center",
  },
  napDurationContainer: {
    flex: 1,
    marginTop: 5,
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
    width: Dimensions.get("window").width - 20,
  },
  durationInputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  inputWrapper: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginVertical: 5,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginRight: 10,
  },
  textInput: {
    width: 50,
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    padding: 5,
    textAlign: "center",
  },

  breaksControlContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    bottom: 2,
    right: 20,
    padding: 10,
    alignSelf: "center",
  },
  controlButtonPlus: {
    backgroundColor: "#4CAF50",
    borderRadius: 15,
    padding: 10,
    margin: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  controlButtonMinus: {
    backgroundColor: "#f44336",
    borderRadius: 15,
    padding: 10,
    margin: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  breaksCount: {
    fontSize: 18,
    fontWeight: "bold",
    marginHorizontal: 20,
  },

  napSaveButton: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#4CAF50",
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  napSaveText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },

  timeInput: {
    flex: 1,
    width: 50, // Adjust the width to fit your layout needs
    height: 40, // Adjust the height to fit your layout needs
    alignSelf: "center", // Center the input field horizontally
    backgroundColor: "#2281e6",
    borderRadius: 30,
    textAlign: "center", // Center the text inside the input field
    fontSize: 12, // Adjust the font size as needed
    marginHorizontal: 5, // Space between the inputs
    color: "#fff",
    padding: 10,
    alignItems: "center",
    marginLeft: 30, // Adjust the left margin as needed
    paddingLeft: 10, // Padding for inner text alignment
  },
  timeSeparator: {
    fontSize: 14,
    color: "#fff",
  },
  resultText: {
    fontSize: 14,
    marginHorizontal: 20,
    color: "#4CAF50",
    paddingTop: 5,
  },

  submitButtonContainer: {
    position: "absolute",
    bottom: 15,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    padding: 2,
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },

  boldText: {
    fontWeight: "bold",
    fontSize: 14,
  },

  progressBarContainer: {
    height: 10,
    backgroundColor: "#DDDDDD",
    borderRadius: 5,
    marginTop: 20,
  },
  progressBar: {
    height: "100%",
    borderRadius: 5,
  },

  translateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "transparent", // Light background for contrast
    width: "100%", // Slightly reduced width for padding
    height: 100,
    marginBottom: 10,
    borderRadius: 15,
    top: 50,
    padding: 10,
    marginLeft: 5,
  },
  translateButton: {
    position: "absolute",
    bottom: 50,
    right: 10, // Adjust right spacing as needed
    backgroundColor: "#ffffff",
    flexDirection: "row", // Align items horizontally
    alignItems: "center", // Center items vertically
    padding: 10,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1,
  },
  buttonTranslateText: {
    color: "#4169E1", // Text color
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 5, // Space between icon and text
  },
  icon: {
    marginRight: 5, // Reduced right margin for icon
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 15,
    marginBottom: 10,
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
});

export default SleepRitualsPage;
