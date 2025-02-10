import React, { useState, useEffect, useCallback } from "react";
import {
  Text as RNText,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Image,
  Alert,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../type";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { AxiosError } from "axios";
import texts from "../translation/texts";
import CustomAlert from "../components/CustomAlert";
// Custom Text component to disable font scaling globally
const Text = (props: any) => {
  return <RNText {...props} allowFontScaling={false} />;
};

type TimeOfDay = "Morning" | "Afternoon" | "Evening" | "Night";

interface Translations {
  [key: string]: {
    [key in `${TimeOfDay}Medication`]: string;
  };
}

type SelectedMedicationsState = {
  [key in TimeOfDay]: number[];
};

interface MedicationToSave {
  patient_id: string;
  date: string;
  medication_name: string;
  route: string;
  dosage_amount: number; // Change type based on your backend requirements
  dosage_type: string;
  drug_take: TimeOfDay;
  consume: string;
  drug_action: string;
  start_date: string;
  end_date: string;
  taken: boolean;
}

type NavigationProp = StackNavigationProp<RootStackParamList, "DailyUploads">;

const PatientMedication: React.FC = () => {
  const [toggleCount, setToggleCount] = useState(0); // Add a counter to track toggle clicks
  const navigation = useNavigation<NavigationProp>();
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activeTime, setActiveTime] = useState("");
  const [customAlertVisible, setCustomAlertVisible] = useState(false);
  const [selectedMedications, setSelectedMedications] =
    useState<SelectedMedicationsState>({
      Morning: [],
      Afternoon: [],
      Evening: [],
      Night: [],
    });
  const [medications, setMedications] = useState<any[]>([]); // Holds medication data
  // Inside the Insights component
  const [isTranslatingToTamil, setIsTranslatingToTamil] = useState(false);

  // Toggle between Tamil and English based on the button click
  const languageText = isTranslatingToTamil ? texts.tamil : texts.english;
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertMode, setAlertMode] = useState<
    "success" | "error" | "confirm" | null
  >(null); // Define the possible modes
  const [cancelAlertVisible, setCancelAlertVisible] = useState(false);

  // Handle Translation
  const handleTranslate = () => {
    setIsTranslatingToTamil(!isTranslatingToTamil);
    console.log("Translate button pressed");
  };

  useEffect(() => {
    const fetchLoggedPatientData = async () => {
      try {
        const storedPhoneNumber = await AsyncStorage.getItem("phoneNumber");
        if (storedPhoneNumber) {
          const response = await axios.get(
            `https://indheart.pinesphere.in/patient/patient/${storedPhoneNumber}/`
          );
          const patient_id = response.data.patient_id;
          fetchMedications(patient_id);
        }
      } catch (error) {
        console.error("Error fetching patient details:", error);
      }
    };

    fetchLoggedPatientData();
    updateActiveTime();
  }, []);

  const fetchMedications = async (patient_id: string) => {
    try {
      const response = await axios.get(
        `https://indheart.pinesphere.in/api/api/medical-manager/?patient_id=${patient_id}`
      );
      if (response.data.length === 0) {
        console.log("No medication data available.");
      } else {
        console.log(
          `Fetched medications for patient ${patient_id}:`,
          response.data
        );
      }
      setMedications(response.data);
    } catch (error) {
      console.error("Error fetching medications:", error);
    }
  };

  const handleSubmit = useCallback(async () => {
    if (!date) {
      //Alert.alert("Missing required fields", "Please select a date.");
      setAlertTitle(languageText.medicationSuccessAlert);
      setAlertMessage(languageText.selectDate);
      setCustomAlertVisible(true); // Show custom alert

      return;
    }

    try {
      const selectedMedicationsToSave: MedicationToSave[] = [];
      const errors: string[] = [];

      // Check for duplicates before adding to the list
      Object.entries(selectedMedications).forEach(([timeOfDay, indexes]) => {
        indexes.forEach((index) => {
          const medication = medications.filter(
            (med) => med.drug_take === timeOfDay
          )[index];

          if (medication) {
            // Check if this medication has already been added for the same date and time
            const isDuplicate = selectedMedicationsToSave.some(
              (med) =>
                med.patient_id === medication.patient_id &&
                med.medication_name === medication.medication_name &&
                med.date === date.toISOString().split("T")[0] &&
                med.drug_take === timeOfDay
            );

            if (isDuplicate) {
              errors.push(
                `Duplicate entry for ${
                  medication.medication_name
                } at ${timeOfDay} on ${date.toISOString().split("T")[0]}.`
              );
            } else {
              selectedMedicationsToSave.push({
                patient_id: medication.patient_id,
                date: date.toISOString().split("T")[0],
                medication_name: medication.medication_name,
                route: medication.route,
                dosage_amount: medication.dosage_amount || 0,
                dosage_type: medication.dosage_type,
                drug_take: timeOfDay as TimeOfDay,
                consume: medication.consume,
                drug_action: medication.drug_action,
                start_date: medication.start_date,
                end_date: medication.end_date,
                taken: true,
              });
            }
          }
        });
      });

      if (errors.length > 0) {
        //Alert.alert("Duplicate Entry", errors.join("\n"));
        setAlertTitle(languageText.duplicateEntry);
        setAlertMessage(errors.join("\n"));
        return;
      }

      console.log("Data to be saved:", selectedMedicationsToSave);

      // Make the POST request to save each medication instance
      const response = await axios.post(
        "https://indheart.pinesphere.in/patient/medications/",
        selectedMedicationsToSave
      );

      console.log("Response from server:", response.data);
      /*  Alert.alert("Success", "Medication details saved successfully.", [
        {
          text: "OK",
          onPress: () => navigation.navigate("DailyExercise"), // Redirect to the Dashboard
        },
      ]);   */
      setAlertTitle(languageText.alertSuccessTitle);
      setAlertMessage(languageText.medicationSuccessAlert);
      setAlertVisible(true);
      setAlertMode("success");
    } catch (error: any) {
      // Handle duplicate entry or other errors
      if (error.response && error.response.status === 400) {
        // Check if the error is due to a unique constraint violation
        const errorMessage =
          error.response.data?.detail || languageText.alreadyExists;
        //Alert.alert("Duplicate Entry", errorMessage);
        setAlertTitle(languageText.duplicateEntry);
        setAlertMessage(errorMessage);
      } else {
        //Alert.alert("Error", "There was an issue saving the data");
        setAlertTitle(languageText.alertErrorTitle);
        setAlertMessage(languageText.errorSaving);
      }
    }
  }, [date, medications, selectedMedications]);

  const handleClear = useCallback(() => {
    setSelectedMedications({
      Morning: [],
      Afternoon: [],
      Evening: [],
      Night: [],
    });
    //Alert.alert("Cleared", "Your data has been cleared successfully.");
    setAlertTitle(languageText.clearTitle);
    setAlertMessage(languageText.clearedMessage);
  }, []);

  /* const handleCancel = () => {
    Alert.alert("Cancel", "Are you sure you want to cancel?", [
      { text: "No", style: "cancel" },
      { text: "Yes", onPress: () => navigation.navigate("DailyUploads") }, // Navigate to PatientDashboard
    ]);
  }; */
  const handleCancel = () => {
    // Trigger the custom alert instead of the default Alert
    setCancelAlertVisible(true);
  };
  const updateActiveTime = () => {
    const hours = new Date().getHours();
    if (hours < 12) {
      setActiveTime("Morning");
    } else if (hours < 15) {
      setActiveTime("Afternoon");
    } else if (hours < 21) {
      setActiveTime("Evening");
    } else {
      setActiveTime("Night");
    }
  };
  const toggleSelection = (timeOfDay: TimeOfDay, index: number) => {
    setSelectedMedications((prevSelected) => {
      const currentSelection = prevSelected[timeOfDay] || [];
      const updatedSelection = currentSelection.includes(index)
        ? currentSelection.filter((i) => i !== index)
        : [...currentSelection, index];

      // Identify the medication object based on the time of day and index
      const medication = medications.filter(
        (med) => med.drug_take === timeOfDay
      )[index];

      // Check if the medication is being selected or deselected
      const isSelected = !currentSelection.includes(index);
      if (isSelected && medication) {
        setToggleCount((prevCount) => {
          const newCount = prevCount + 1;
          console.log(
            `Toggle click ${newCount} - Medication name: ${medication.medication_name}`
          );
          return newCount;
        });
      }

      return { ...prevSelected, [timeOfDay]: updatedSelection };
    });
  };

  return (
    <SafeAreaProvider>
      {/* Custom alert for cancel action */}
      <CustomAlert
        title={languageText.alertCancelTitle}
        message={languageText.alertCancelMessage}
        visible={cancelAlertVisible}
        onClose={() => setCancelAlertVisible(false)}
        mode="confirm"
        onYes={() => {
          navigation.navigate("PatientDashboardPage"); // Navigate to PatientDashboardPage
        }}
        onNo={() => setCancelAlertVisible(false)} // Close the alert on No
        okText={languageText.alertOk} // Translated OK text
        yesText={languageText.alertYes} // Translated Yes text
        noText={languageText.alertNo} // Translated No text
      />

      {/* Success Custom Alert */}
      <CustomAlert
        title={alertTitle}
        message={alertMessage}
        visible={alertVisible}
        onClose={() => {
          setAlertVisible(false); // Close the alert
          if (alertMode === "success") {
            navigation.navigate("DailyExercise"); // Redirect to the Dashboard
          }
        }}
        onYes={() => {
          setAlertVisible(false); // Close the alert
          if (alertMode === "success") {
            navigation.navigate("DailyExercise"); // Redirect to the Dashboard
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

        <View style={styles.outerContainer}>
          <View style={styles.coverContainer}>
            <Text style={styles.title}>{languageText.medicationTitle}</Text>
          </View>

          <View style={styles.datePickerTranslateContainer}>
            <View style={styles.datePickerContainer}>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Icon name="calendar" size={22} color="#808080" />
                <Text style={styles.datePickerText}>
                  {date.toLocaleDateString()}
                </Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display={Platform.OS === "ios" ? "inline" : "calendar"}
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    setDate(selectedDate || date);
                  }}
                />
              )}
            </View>
            <TouchableOpacity
              onPress={handleTranslate}
              style={styles.translateButton}
            >
              <Text style={styles.translateButtonText}>
                {isTranslatingToTamil
                  ? "Translate to English"
                  : "தமிழில் படிக்க"}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.container}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
          >
            {(["Morning", "Afternoon", "Evening", "Night"] as TimeOfDay[]).map(
              (timeOfDay) => (
                <View key={timeOfDay}>
                  <Text style={styles.morningMedicationText}>
                    {isTranslatingToTamil
                      ? texts.tamil[
                          `${
                            timeOfDay.toLowerCase() as
                              | "morning"
                              | "afternoon"
                              | "evening"
                              | "night"
                          }Medication`
                        ]
                      : texts.english[
                          `${
                            timeOfDay.toLowerCase() as
                              | "morning"
                              | "afternoon"
                              | "evening"
                              | "night"
                          }Medication`
                        ]}
                  </Text>

                  <View style={styles.morningMedicationContainer}>
                    {medications.filter((med) => med.drug_take === timeOfDay)
                      .length === 0 ? (
                      <Text style={styles.noDataText}>
                        {languageText.noMedicationDataText}{" "}
                        {timeOfDay.toLowerCase()}.
                      </Text>
                    ) : (
                      medications
                        .filter((med) => med.drug_take === timeOfDay)
                        .map((medication, index) => (
                          <TouchableOpacity
                            key={index}
                            style={[
                              styles.medicationContainer,
                              selectedMedications[timeOfDay].includes(
                                index
                              ) && {
                                backgroundColor: "#f4fff3",
                                borderColor: "#13bd13",
                                borderWidth: 1,
                              },
                            ]}
                            onPress={() => toggleSelection(timeOfDay, index)}
                          >
                            <View style={styles.medicationItemContainer}>
                              <Image
                                source={
                                  medication.dosage_type === "Syrup/ml"
                                    ? require("../../assets/images/syrup.png") // Show syrup image
                                    : medication.dosage_type === "Tablet/mg" ||
                                      medication.dosage_type === "Capsule/mg"
                                    ? require("../../assets/images/pill.png") // Show pill image for Tablet or Capsule
                                    : require("../../assets/images/syrup.png") // Optional: Provide a default image if needed
                                }
                                style={styles.iconMedication}
                              />
                              <View style={styles.medicationTextContainer}>
                                <Text style={styles.medicationItem}>
                                  <Text style={styles.boldText}>
                                    {medication.medication_name}
                                  </Text>
                                </Text>
                                <Text style={styles.medicationDetails}>
                                  {`${medication.dosage_amount} - ${medication.consume}`}
                                </Text>
                              </View>
                            </View>
                            <Text style={styles.morningMedicationDetail}>
                              {/* Start and End Dates from Previous Screen */}
                              <View style={styles.datesContainer}>
                                <Text style={styles.medicationDetails}>
                                  <Text style={styles.dateText}>
                                    {languageText.startDate}:{" "}
                                    {medication.start_date}
                                  </Text>
                                </Text>
                              </View>
                              <View style={styles.datesContainer}>
                                <Text style={styles.medicationDetails}>
                                  <Text style={styles.dateText}>
                                    {languageText.endDate}:{" "}
                                    {medication.end_date}
                                  </Text>
                                </Text>
                              </View>

                              {/* Note Text */}
                            </Text>
                          </TouchableOpacity>
                        ))
                    )}
                  </View>
                  <View style={styles.noteContainer}>
                    <Text style={styles.noteText}>{languageText.note}</Text>
                    <Text style={styles.noteContent}>
                      {languageText.medicationNote}
                    </Text>
                  </View>

                  <View style={styles.separator} />
                </View>
              )
            )}
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
  outerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    marginTop: 40,
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },

  container: {
    width: "100%",
    height: "50%", // Adjust height to 50% to show half of the container
    backgroundColor: "#F5F5F5",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingTop: 20,
  },
  buttonTranslateText: {
    marginLeft: 5,
    color: "#4169E1",
    fontWeight: "500",
    fontSize: 12,
    flexShrink: 1,
  },
  coverContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: -10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#36454F",
    textAlign: "center",
    marginVertical: 5,
    marginBottom: 30,
  },
  datePickerTranslateContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  datePickerContainer: {
    width: "50%",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 0,
  },
  datePickerButton: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "85%",
  },
  datePickerText: {
    fontSize: 15,
    color: "#36454F",
    fontWeight: "500",
    textAlign: "center",
    marginLeft: 20,
  },
  translateButton: {
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    width: "43%",
    marginLeft: 10,
  },
  translateButtonText: {
    color: "#4164f0",
    fontSize: 15,
    textAlign: "center",
    fontWeight: "600",
  },
  tilesContainer: {
    alignItems: "center",
    paddingBottom: 10,
    marginTop: -10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-around", // Distributes tiles equally
    width: "100%",
    marginBottom: 10,
  },
  tile: {
    borderRadius: 10,
    padding: 10,
    width: "42%", // Adjust the width to reduce space between tiles
    marginHorizontal: 5, // Add small margins between the tiles
  },

  tileContent: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  activeTile: {
    backgroundColor: "#fff",
  },
  inactiveTile: {
    backgroundColor: "#D3D3D3",
  },
  activeText: {
    color: "#00796B", // Dark green for active text
  },
  inactiveText: {
    color: "#36454F", // Dark gray for inactive text
  },
  separator: {
    height: 0.5,
    backgroundColor: "#c0c0c0", // Light gray color for the separator line
    marginVertical: 10, // Space above and below the line
    width: "100%", // Full width of the container
  },
  morningMedicationText: {
    fontSize: 16,
    fontWeight: "700",
    marginVertical: 0,
    textAlign: "left",
    color: "#585858",
    marginLeft: 20,
    marginBottom: 10,
    paddingBottom: 10,
  },
  morningMedicationContainer: {
    marginBottom: -15,
    flex: 1, // Allow the container to expand
    paddingHorizontal: 10,
    padding: 5,
  },
  medicationList: {
    paddingVertical: 5,
  },
  medicationContainer: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 30,
    elevation: 1,
    flexWrap: "wrap", // Allow content to wrap
    flexDirection: "row",
    alignItems: "flex-start",
    minHeight: 100, // Increase this value as necessary
    width: "100%",
  },
  medicationItemContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconMedication: {
    width: 50,
    height: 40,
    marginRight: 10,
    backgroundColor: "#f5f5f5", // Light background for medication details
    borderRadius: 30,
    alignSelf: "center",
    alignItems: "center",
    top: 10,
  },
  medicationTextContainer: {
    flex: 1,
  },
  medicationItem: {
    fontSize: 16,
  },
  medicationDetails: {
    fontSize: 14,
    color: "#457aec",
    fontWeight: "600",
    marginBottom: 5,
    marginTop: 5,
    marginVertical: 5,
    flexWrap: "wrap", // Allows the content to wrap
    textAlign: "left", // Align text to the left
    width: "100%", // Ensure it takes full width of the container
    lineHeight: 22, // Makes the line height more comfortable for readability
  },
  morningMedicationDetail: {
    fontSize: 12,
    marginTop: 0,
    marginLeft: 60, // Ensure proper alignment
    textAlign: "left", // Align text to the left
    color: "#B0B0B0",
    flexWrap: "wrap", // Allow text to wrap if needed
    flex: 1, // Allow container to expand
    width: "auto", // Ensure it doesn't have a fixed width
  },
  boldText: {
    fontWeight: "700",
    color: "#505050",
  },
  noteContainer: {
    marginLeft: 10,
    marginBottom: 5, // Space below the note content
  },
  noteText: {
    fontWeight: "700",
    color: "#505050",
    marginTop: 10,
    marginBottom: 5,
    textAlign: "left",
    marginLeft: 15,
  },
  noteContent: {
    fontWeight: "400",
    marginLeft: 15,
    color: "#505050",
    marginBottom: 15,
    textAlign: "left", // Ensure text is aligned left under the note
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    backgroundColor: "#fff",
    elevation: 5,
    width: "100%",
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
  noDataText: {
    fontSize: 14,
    color: "#f76464",
    textAlign: "center",
    paddingVertical: 10,
  },
  datesContainer: {
    marginBottom: 5,
    padding: 5,
    width: "100%",
  },

  dateText: {
    fontWeight: "700",
    color: "#505050",
    fontSize: 14,
    flexWrap: "wrap", // Allow text to wrap within its container
    textAlign: "left", // Align text to the left for better readability
    width: "100%",
  },
});

export default PatientMedication;
