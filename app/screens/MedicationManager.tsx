import React, { useState, useEffect } from "react";
import {
  View,
  Text as RNText,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  FlatList,
  Dimensions,
  TouchableWithoutFeedback,
  Platform,
  Keyboard,
  BackHandler,
} from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "../../type";
import Icon from "react-native-vector-icons/MaterialIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useFocusEffect } from "@react-navigation/native";
import { RFValue } from "react-native-responsive-fontsize"; // If you choose to use responsive font size library
import CustomAlert from "../components/CustomAlert";
// Custom Text component to disable font scaling globally
const Text = (props: any) => {
  return <RNText {...props} allowFontScaling={false} />;
};

type PatientProfileScreenNavigationProp = NavigationProp<
  RootStackParamList,
  "MedicationManager"
>;
type PickerOption = {
  label: string;
  value: string;
};

type FormField = {
  label: string;
  type: "text" | "picker" | "button-group";
  value?: string | null; // Make value optional for picker
  onChange?: (value: string) => void; // Make onChange optional for picker
  selectedValue?: string | null; // Use this for picker selected value
  onValueChange?: (value: string) => void; // Use this for picker value change
  options?: PickerOption[];
  keyboardType?: "default" | "numeric" | "email-address" | "phone-pad";
};

interface PatientDetails {
  patient_id: string; // Keep the patient_id string if you need it for other purposes
  diet: string;
  name: string; // Make sure to add this line
}

export default function MedicationManager() {
  const navigation = useNavigation<PatientProfileScreenNavigationProp>();

  const [patientID, setPatientID] = useState("");
  const [medicationName, setMedicationName] = useState("");
  const [route, setRoute] = useState("");
  const [dosageAmt, setDosageAmt] = useState("");
  const [dosageType, setDosageType] = useState("");
  const [timeToTake, setTimeToTake] = useState("");
  const [whenToConsume, setWhenToConsume] = useState("");
  const [actionOfDrug, setActionOfDrug] = useState("");

  const [isPatientIDModalVisible, setPatientIDModalVisible] = useState(false);
  const [isTimeToTakeModalVisible, setTimeToTakeModalVisible] = useState(false);
  const [isWhenToConsumeModalVisible, setWhenToConsumeModalVisible] =
    useState(false);

  const timeOptions = ["Morning", "Afternoon", "Evening", "Night"];
  const consumeOptions = ["Before Food", "After Food"];
  const [phoneNumber, setPhoneNumber] = useState("");
  const [patientDetails, setPatientDetails] = useState<PatientDetails | null>(
    null
  );
  const [patientIDOptions, setPatientIDOptions] = useState<PickerOption[]>([]);
  const dosageOptions = ["Tablet/mg", "Syrup/ml", "Capsule/mg"]; // Options for dosage types
  const [isDosageTypeModalVisible, setDosageTypeModalVisible] = useState(false); // New state for dosage type modal
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [cancelAlertVisible, setCancelAlertVisible] = useState(false);
  const [skipAlertVisible, setSkipAlertVisible] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [regularAlertVisible, setRegularAlertVisible] = useState(false);
  const [missingFieldsAlertVisible, setMissingFieldsAlertVisible] =
    useState(false);

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
      console.log("Fetching patient details:", error);
    }
  };

  useEffect(() => {
    const fetchPatientIDs = async () => {
      try {
        const response = await fetch(
          "https://indheart.pinesphere.in/api/api/get-existing-patient-ids/"
        );
        const data = await response.json();
        const options = data.patient_ids.map((id: string) => ({
          label: id,
          value: id,
        }));
        setPatientIDOptions(options);
        if (options.length > 0) {
          // Set the last patient ID as the default selected patient ID
          setPatientID(options[options.length - 1].value);
        }
      } catch (error) {
        //Alert.alert("Error", "Failed to fetch patient IDs.");
        setAlertTitle("Error");
        setAlertMessage("Failed to fetch patient IDs.");
      }
    };

    fetchPatientIDs();
  }, []);

  const handleSave = async () => {
    const formattedStartDate = startDate
      ? startDate.toISOString().split("T")[0]
      : null;
    const formattedEndDate = endDate
      ? endDate.toISOString().split("T")[0]
      : null;

    // Construct the form data object
    const formData = {
      patient_id: patientID,
      medication_name: medicationName,
      start_date: formattedStartDate,
      end_date: formattedEndDate,
      route: route,
      dosage_amonut: dosageAmt,
      dosage_type: dosageType,
      drug_take: timeToTake,
      consume: whenToConsume,
      drug_action: actionOfDrug,
    };

    try {
      // Send a POST request to your Django backend to save the form data
      const response = await axios.post(
        "https://indheart.pinesphere.in/api/api/medical-manager/", // Adjust the URL based on your actual endpoint
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      // Handle success response
      //Alert.alert("Success", "Medication details saved successfully!");
    } catch (error: unknown) {
      // Handle error response

      // Check if error is of type AxiosError
      if (axios.isAxiosError(error)) {
        let errorMessage = "Failed to save medication details.";

        // Check for response data and format the error messages
        if (error.response && error.response.data) {
          const errors = error.response.data; // Assuming this is an object with field names as keys
          errorMessage = Object.entries(errors)
            .map(([field, messages]) => {
              // Use type assertion to specify that messages is an array of strings
              const typedMessages = messages as string[];
              return `${
                field.charAt(0).toUpperCase() + field.slice(1)
              }: ${typedMessages.join(", ")}`;
            })
            .join("\n");
        }

        // Show the formatted error message in the alert box
        Alert.alert("Error", errorMessage);
      } else {
        // Handle non-Axios error
        Alert.alert("Error", "An unexpected error occurred.");
      }
    }
  };

  const handleSubmitAndAdd = () => {
    handleSave();
    setMedicationName("");
    setRoute("");
    setDosageAmt("");
    setDosageType("");
    setTimeToTake("");
    setWhenToConsume("");
    setActionOfDrug("");
  };

  /* const handleSkipAndSubmit = async () => {
    await handleSave(); // Save data without clearing the form

    handleClear(); // Clear other fields if needed
  }; */
  // Handle Skip and Submit logic
  const handleSkipAndSubmit = async () => {
    if (
      !patientID ||
      !medicationName ||
      !route ||
      !dosageAmt ||
      !dosageType ||
      !timeToTake ||
      !whenToConsume ||
      !actionOfDrug
    ) {
      // If some fields are missing, show the missing fields alert
      setMissingFieldsAlertVisible(true);
    } else {
      // If all fields are filled, show the Skip and Submit confirmation alert
      setSkipAlertVisible(true);
    }
  };

  const handleClear = () => {
    // Reset all fields to empty
    setPatientID("");
    setMedicationName("");
    setRoute("");
    setDosageAmt("");
    setDosageType("");
    setTimeToTake("");
    setWhenToConsume("");
    setActionOfDrug("");
    setShowStartPicker(false);
    setShowEndPicker(false);
    setStartDate(null); // or setStartDate(new Date()) if you want to reset to today's date
    setEndDate(null);
  };

  const handleCancel = () => {
    Alert.alert("Form Cancelled", "Navigating to Patient Dashboard", [
      {
        text: "OK",
        onPress: () => navigation.navigate("AdminDashboardPage"),
      },
    ]);
  };

  const handleSubmitButton = () => {
    Alert.alert("Form Cancelled", "Navigating to Patient Dashboard", [
      {
        text: "OK",
        onPress: () => navigation.navigate("AdminDashboardPage"),
      },
    ]);
  };

  const handleSelectOption = (
    item: string,
    setOption: React.Dispatch<React.SetStateAction<string>>,
    closeModal: () => void
  ) => {
    setOption(item);
    closeModal(); // Close modal after selecting the option
  };

  const onChangeStart = (event: any, selectedDate?: Date | undefined) => {
    const currentDate = selectedDate || startDate;
    setShowStartPicker(false);
    setStartDate(currentDate);
  };

  const onChangeEnd = (event: any, selectedDate?: Date | undefined) => {
    const currentDate = selectedDate || endDate;
    setShowEndPicker(false);
    setEndDate(currentDate);
  };

  const showDatePickerModal = (field: string) => {
    if (field === "start") {
      setShowStartPicker(true); // Show start date picker
    } else if (field === "end") {
      setShowEndPicker(true); // Show end date picker
    }
  };

  const renderOption = (
    item: string,
    setOption: React.Dispatch<React.SetStateAction<string>>,
    closeModal: () => void
  ) => (
    <TouchableOpacity
      style={styles.modalOption}
      onPress={() => handleSelectOption(item, setOption, closeModal)}
      activeOpacity={0.7} // Makes the touch feedback more pronounced
    >
      <Text
        style={{ fontSize: 18 }} // Set font size to 18
        numberOfLines={1} // Ensures the text does not wrap
        ellipsizeMode="tail" // Adds ellipsis if text overflows
      >
        {item}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
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
      {/* Missing Fields Alert */}
      <CustomAlert
        title="Missing Inputs"
        message="Some required fields are missing. Please fill them out before proceeding."
        visible={missingFieldsAlertVisible}
        onClose={() => setMissingFieldsAlertVisible(false)} // Close on cancel
        //mode="confirm" // Alert type
        onYes={() => setMissingFieldsAlertVisible(false)} // Close alert
      />

      {/* Skip and Submit Confirmation Alert */}
      <CustomAlert
        title="Skip and Submit"
        message="Are you sure you want to Skip and Submit?"
        visible={skipAlertVisible}
        onClose={() => setSkipAlertVisible(false)} // Close the alert on cancel
        mode="confirm" // Yes/No buttons
        onYes={async () => {
          await handleSave(); // Save data without clearing the form
          handleClear(); // Clear other fields if needed
          setSkipAlertVisible(false); // Close the alert after confirming
        }}
        onNo={() => setSkipAlertVisible(false)} // Close the alert on No
      />

      <Text style={styles.header}>Medication Manager</Text>
      {/* clear icon */}
      <View style={styles.clearIconContainer}>
        <TouchableOpacity
          style={styles.clearIcon}
          onPress={() => {
            handleClear(); // Call the handleClear function
            console.log("Form Cleared"); // Log message for debugging
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="trash" size={18} color="grey" />
        </TouchableOpacity>
      </View>

      {/* cancel icon */}
      <View style={styles.cancelIconContainer}>
        <TouchableOpacity
          style={styles.cancelIcon}
          onPress={() => {
            console.log("Form Cancelled and Navigated to Admin Dashboard"); // Log message for debugging
            //handleCancel(); // Call the handleCancel function
            navigation.navigate("AdminDashboardPage"); // Navigate to the Admin Dashboard
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={18} color="red" />
        </TouchableOpacity>
      </View>

      <View style={styles.backIconContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            console.log("Back button clicked");
            navigation.navigate("AdminDashboardPage");
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={18} color="#000" />
        </TouchableOpacity>
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.label}>Patient ID</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setPatientIDModalVisible(true)}
        >
          <Text style={patientID ? {} : styles.placeholderText}>
            {patientID || "Select Patient ID"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.label}>Medication Type</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setDosageTypeModalVisible(true)} // Open dosage type modal
        >
          <Text style={dosageType ? {} : styles.placeholderText}>
            {dosageType || "Select Dosage Type"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.label}>Medication Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Medication Name"
          value={medicationName}
          onChangeText={setMedicationName}
        />

        <Text style={styles.label}>Start Date</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => {
            Keyboard.dismiss();
            showDatePickerModal("start");
          }}
        >
          <Text
            style={[
              styles.pickerButtonText,
              { color: startDate ? "black" : "gray" }, // Dynamic text color
            ]}
          >
            {startDate ? startDate.toLocaleDateString() : "Select Start Date"}
          </Text>
        </TouchableOpacity>
        {showStartPicker && (
          <DateTimePicker
            testID="dateTimePicker"
            value={startDate || new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "inline" : "calendar"}
            //onChange={(event: any, selectedDate: Date | undefined) => onChangeStart(event, selectedDate)}
            onChange={onChangeStart} //cancel should not take the date
          />
        )}

        <Text style={styles.label}>End Date</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => {
            Keyboard.dismiss();
            showDatePickerModal("end");
          }}
        >
          <Text
            style={[
              styles.pickerButtonText,
              { color: endDate ? "black" : "gray" }, // Dynamic text color
            ]}
          >
            {endDate ? endDate.toLocaleDateString() : "Select End Date"}
          </Text>
        </TouchableOpacity>
        {showEndPicker && (
          <DateTimePicker
            testID="dateTimePicker"
            value={endDate || new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "inline" : "calendar"}
            onChange={onChangeEnd} //cancel should not take the date
          />
        )}

        <Text style={[styles.label, { allowFontScaling: false }]}>
          Route (e.g., oral, IV)
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Route"
          value={route}
          onChangeText={setRoute}
        />

        <Text style={styles.label}>Dosage Amount</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Dosage Amount"
          value={dosageAmt}
          onChangeText={setDosageAmt}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Time to Take the Drug</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setTimeToTakeModalVisible(true)}
        >
          <Text style={timeToTake ? {} : styles.placeholderText}>
            {timeToTake || "Select Time"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.label}>When to Consume</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setWhenToConsumeModalVisible(true)}
        >
          <Text style={whenToConsume ? {} : styles.placeholderText}>
            {whenToConsume || "Select When"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.label}>Action of the Drug</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Action of the Drug"
          value={actionOfDrug}
          onChangeText={setActionOfDrug}
        />

        {/* Patient ID Modal */}
        <Modal
          transparent={true}
          visible={isPatientIDModalVisible}
          animationType="slide"
          onRequestClose={() => setPatientIDModalVisible(false)}
        >
          <TouchableWithoutFeedback
            onPress={() => setPatientIDModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <TouchableWithoutFeedback>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Select Patient ID</Text>
                  <FlatList
                    data={patientIDOptions} // Use fetched patient IDs here
                    keyExtractor={(item) => item.value} // Use the 'value' for the key
                    renderItem={({ item }) =>
                      renderOption(item.label, setPatientID, () =>
                        setPatientIDModalVisible(false)
                      )
                    }
                  />
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Dosage Type Modal */}
        <Modal
          transparent={true}
          visible={isDosageTypeModalVisible}
          animationType="slide"
          onRequestClose={() => setDosageTypeModalVisible(false)}
        >
          <TouchableWithoutFeedback
            onPress={() => setDosageTypeModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <TouchableWithoutFeedback>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Select Dosage Type</Text>
                  <FlatList<string>
                    data={dosageOptions}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) =>
                      renderOption(item, setDosageType, () =>
                        setDosageTypeModalVisible(false)
                      )
                    }
                  />
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Time to Take Modal */}
        <Modal
          transparent={true}
          visible={isTimeToTakeModalVisible}
          animationType="slide"
          onRequestClose={() => setTimeToTakeModalVisible(false)}
        >
          <TouchableWithoutFeedback
            onPress={() => setTimeToTakeModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <TouchableWithoutFeedback>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>
                    Select Time to Take the Drug
                  </Text>
                  <FlatList<string>
                    data={timeOptions}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) =>
                      renderOption(item, setTimeToTake, () =>
                        setTimeToTakeModalVisible(false)
                      )
                    }
                  />
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* When to Consume Modal */}
        <Modal
          transparent={true}
          visible={isWhenToConsumeModalVisible}
          animationType="slide"
          onRequestClose={() => setWhenToConsumeModalVisible(false)}
        >
          <TouchableWithoutFeedback
            onPress={() => setWhenToConsumeModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <TouchableWithoutFeedback>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Select When to Consume</Text>
                  <FlatList
                    data={consumeOptions}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) =>
                      renderOption(item, setWhenToConsume, () =>
                        setWhenToConsumeModalVisible(false)
                      )
                    }
                  />
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </ScrollView>

      {/* Footer Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmitAndAdd}
        >
          <Text style={styles.footerButtonText}>Submit & Add</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.skipAndsubmitButton}
          onPress={handleSkipAndSubmit}
        >
          <Text style={styles.footerButtonText}>Skip & Submit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
    marginTop: 50,
  },
  clearIconContainer: {
    position: "absolute", // Position the clear icon container absolutely
    top: 7,
    right: 50,
    paddingRight: 10,
  },
  cancelIconContainer: {
    position: "absolute", // Position the cancel icon container absolutely
    top: 7,
    right: 15, // Adjusted to position it next to the clear icon
  },
  clearIcon: {
    width: 30,
    height: 30,
    borderRadius: 30,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    marginTop: 10,
    marginLeft: 10,
  },
  cancelIcon: {
    width: 30,
    height: 30,
    borderRadius: 30,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    marginTop: 10,
    marginLeft: 10,
  },

  backIconContainer: {
    position: "absolute", // Position the back button container absolutely
    top: 0,
    marginBottom: 10,
    left: 7,
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
    marginTop: 15,
    marginLeft: 10,
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: "500",
    marginBottom: 20,
    alignItems: "center",
    textAlign: "left",
    paddingLeft: 45,
  },
  label: {
    fontSize: RFValue(14),
    marginVertical: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#c0c0c0",
    padding: 10,
    borderRadius: 30,
    color: "#000",
    fontSize: RFValue(10),
    maxHeight: "20%",
  },
  placeholderText: {
    color: "#888",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Updated to add some background for better shadow visibility
    // iOS Shadow
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    // Android Shadow
    elevation: 5,
  },

  modalContent: {
    width: "60%",
    maxHeight: "70%",
    backgroundColor: "#fff",
    borderRadius: 50,
    padding: 20,
    alignItems: "center",
    elevation: 5,
    alignSelf: "center",
    textAlign: "center",
  },
  modalTitle: {
    fontSize: 18,
    padding: 10,
    fontWeight: "500",
    marginBottom: 10,
    textAlign: "center",
  },
  modalOption: {
    padding: 15,
    width: "100%",
    alignItems: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
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
  skipAndsubmitButton: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: "#007BFF",
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
    backgroundColor: "transparent",

    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: "transparent",

    justifyContent: "center",
    alignItems: "center",
  },
  footerButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },

  clearButtonText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "bold",
  },
  cancelButtonText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "bold",
  },
  pickerButtonText: {
    fontSize: 14,
    color: "#aba9a9",
  },
});
