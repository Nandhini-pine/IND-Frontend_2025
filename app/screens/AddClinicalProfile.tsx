//app/screens/AddClinicalProfilePage.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text as RNText,
  StyleSheet,
  TextInput,
  Alert,
  TouchableOpacity,
  Platform,
  FlatList,
  Modal,
  Keyboard,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../type";
import { createClinical } from "../services/apiService";
import DateTimePicker from "@react-native-community/datetimepicker";
import Icon from "react-native-vector-icons/MaterialIcons"; // Import the icon library
import { RFValue } from "react-native-responsive-fontsize"; // If you choose to use responsive font size library
// Custom Text component to disable font scaling globally
import CustomAlert from "../components/CustomAlert";

const Text = (props: any) => {
  return <RNText {...props} allowFontScaling={false} />;
};

type AddClinicalProfileNavigationProp = StackNavigationProp<
  RootStackParamList,
  "AddClinicalProfilePage"
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

const AddClinicalProfilePage: React.FC = () => {
  const [patientID, setPatientID] = useState<string>(""); // Add this line

  const [patientIDOptions, setPatientIDOptions] = useState<PickerOption[]>([]);

  //fetch patiend info
  const [patientData, setPatientData] = useState<any>(null); // State to store fetched patient data
  // New clinical data fields
  const [cadDuration, setCadDuration] = useState<string>("");
  const [stentsPlaced, setStentsPlaced] = useState<string>("");
  const [ejectionFraction, setEjectionFraction] = useState<string>("");
  const [vesselsInvolved, setVesselsInvolved] = useState<string>("");
  const [comorbidities, setComorbidities] = useState<string>("");
  const [durationOfComorbidities, setDurationOfComorbidities] =
    useState<string>("");
  // const [nextFollowUpDate, setNextFollowUpDate] = useState<string>("");
  const [dateOfOperation, setDateOfOperation] = useState<string>("");
  const [nextFollowUpDate, setNextFollowUpDate] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [dateField, setDateField] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [pickerModalVisible, setPickerModalVisible] = useState<boolean>(false);
  const [currentPickerOptions, setCurrentPickerOptions] = useState<
    PickerOption[]
  >([]);
  const [currentPickerLabel, setCurrentPickerLabel] = useState<string>("");
  const [currentPickerValue, setCurrentPickerValue] = useState<string | null>(
    null
  );
  const [cancelAlertVisible, setCancelAlertVisible] = useState(false);
  const [regularAlertVisible, setRegularAlertVisible] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [successAlertVisible, setSuccessAlertVisible] = useState(false);
  const [errorAlertVisible, setErrorAlertVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigation = useNavigation<AddClinicalProfileNavigationProp>();

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

  const today = new Date(); // Get today's date (Sep 18, 2024)

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);

    // Check if the user canceled the date selection
    if (event.type === "dismissed") {
      return; // Exit early without setting any date
    }

    if (date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set time to start of the day for accurate comparison

      const formattedDate = date.toISOString().split("T")[0]; // Format date as yyyy-mm-dd
      setSelectedDate(date);

      if (dateField === "nextFollowUpDate") {
        if (date < today) {
          //Alert.alert("Invalid Date", "Please select a valid future date.");
          setAlertTitle("Invalid Date");
          setAlertMessage("Please select a valid future date.");
          return;
        }
        setNextFollowUpDate(formattedDate);
      } else if (dateField === "dateOfOperation") {
        setDateOfOperation(formattedDate);
      }
    }
  };

  const showDatePickerModal = (field: string) => {
    Keyboard.dismiss(); // Dismiss the keyboard first
    setDateField(field);
    setShowDatePicker(true);
  };

  const handleSave = async () => {
    if (
      !patientID ||
      !cadDuration ||
      !stentsPlaced ||
      !ejectionFraction ||
      !vesselsInvolved ||
      !comorbidities ||
      !durationOfComorbidities ||
      !nextFollowUpDate ||
      !dateOfOperation
    ) {
      /* Alert.alert(
        "Validation Error",
        "Please fill in all required fields before saving."
      ); */
      setAlertTitle("Validation Error");
      setAlertMessage("Please fill in all required fields before saving.");
      return;
    }

    // Convert ejectionFraction to a number
    const ejectionFractionNumber = Number(ejectionFraction);

    const newclinicalData = {
      patient_id: patientID, // Ensure this matches the field name in your backend
      cad_duration: cadDuration,
      stents_placed: stentsPlaced,
      ejection_fraction: ejectionFractionNumber, // Convert to number
      vessels_involved: vesselsInvolved,
      comorbidities: comorbidities,
      duration_of_comorbidities: durationOfComorbidities,
      date_of_operation: dateOfOperation,
      next_follow_up_date: nextFollowUpDate,
    };

    try {
      await createClinical(newclinicalData);
      setSuccessAlertVisible(true);
      handleClear(); // Clear the form after successful submission
    } catch (error: any) {
      setErrorMessage(
        error.message || "An error occurred while saving the data."
      );
      setErrorAlertVisible(true);
    }
  };

  const handleClear = () => {
    setPatientID("");
    setCadDuration("");
    setStentsPlaced("");
    setEjectionFraction("");
    setVesselsInvolved("");
    setComorbidities("");
    setDurationOfComorbidities("");
    setNextFollowUpDate("");
    setDateOfOperation("");
  };

  /* const handleCancel = () => {
    Alert.alert("Cancel", "Are you sure you want to cancel?", [
      {
        text: "No",
        style: "cancel",
      },
      {
        text: "Yes",
        onPress: () => {
          handleClear();
          navigation.navigate("AdminDashboardPage");
        },
      },
    ]);
  }; */

  const handleCancel = () => {
    setCancelAlertVisible(true);
  };

  const openPickerModal = (
    options: PickerOption[],
    label: string,
    selectedValue: string | null,
    onValueChange: (value: string) => void
  ) => {
    setCurrentPickerOptions(options);
    setCurrentPickerLabel(label);
    setCurrentPickerValue(selectedValue);
    setPickerModalVisible(true);
  };

  const comorbiditiesOptions: PickerOption[] = [
    { label: "Diabetes mellitus", value: "Diabetes mellitus" },
    { label: "Hypertension", value: "Hypertension" },
    { label: "Both", value: "Both" },
    { label: "Nil", value: "Nil" },
  ];

  const renderItem = ({ item }: { item: FormField }) => {
    return (
      <View style={styles.fieldContainer}>
        <CustomAlert
          title="Form Submitted"
          message="Clinical Information has been saved successfully!"
          visible={successAlertVisible}
          onClose={() => setSuccessAlertVisible(false)}
          mode="ok"
          onOk={() => {
            setSuccessAlertVisible(false);
            navigation.navigate("AddMetabolicProfilePage");
          }}
        />

        <CustomAlert
          title="Error"
          message={errorMessage}
          visible={errorAlertVisible}
          onClose={() => setErrorAlertVisible(false)}
          mode="ok"
        />

        <CustomAlert
          title="Cancel"
          message="Are you sure you want to cancel?"
          visible={cancelAlertVisible}
          onClose={() => setCancelAlertVisible(false)}
          mode="confirm"
          onYes={() => {
            handleClear();
            navigation.navigate("AdminDashboardPage");
          }}
          onNo={() => setCancelAlertVisible(false)}
        />
        <Text style={styles.label}>{item.label}:</Text>

        {item.type === "text" ? (
          item.label === "Patient ID" ? (
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() =>
                openPickerModal(
                  patientIDOptions,
                  item.label,
                  patientID,
                  setPatientID
                )
              }
            >
              <Text style={styles.pickerButtonText}>
                {patientID ? patientID : `Select ${item.label}`}
              </Text>
            </TouchableOpacity>
          ) : item.label === "Date of Operation" ||
            item.label === "Next Follow-Up Date" ? (
            <TouchableOpacity
              style={styles.input}
              onPress={() => {
                if (item.label === "Date of Operation") {
                  showDatePickerModal("dateOfOperation");
                } else if (item.label === "Next Follow-Up Date") {
                  showDatePickerModal("nextFollowUpDate");
                }
              }}
            >
              <Text
                style={{
                  color:
                    item.label === "Date of Operation"
                      ? dateOfOperation
                        ? "#000"
                        : "#888"
                      : nextFollowUpDate
                      ? "#000"
                      : "#888",
                  textAlign: "left",
                  lineHeight: 40,
                }}
              >
                {item.label === "Date of Operation"
                  ? dateOfOperation || `Select ${item.label}`
                  : nextFollowUpDate || `Select ${item.label}`}
              </Text>
            </TouchableOpacity>
          ) : (
            <TextInput
              style={styles.input}
              placeholder={` ${item.label}`}
              value={item.value || ""}
              onChangeText={item.onChange}
              keyboardType={item.keyboardType}
              editable={true} // Keep editable for other fields
              onFocus={() => {}}
              blurOnSubmit={false}
              selectTextOnFocus={false}
            />
          )
        ) : item.type === "picker" ? (
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() =>
              openPickerModal(
                item.options || [],
                item.label,
                item.selectedValue || "",
                item.onValueChange || (() => {})
              )
            }
          >
            <Text
              style={[
                styles.pickerButtonText,
                { color: item.selectedValue ? "#000" : "#888" },
              ]}
            >
              {item.selectedValue ? item.selectedValue : `Select ${item.label}`}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  };

  const formData: FormField[] = [
    {
      label: "Patient ID",
      type: "text",
      value: patientID,
      onChange: setPatientID,
    },
    {
      label: "Duration of CAD",
      type: "text",
      value: cadDuration,
      onChange: setCadDuration,
      keyboardType: "numeric",
    },
    {
      label: "Number of Stents Placed",
      type: "text",
      value: stentsPlaced,
      onChange: setStentsPlaced,
      keyboardType: "numeric",
    },
    {
      label: "Ejection Fraction in % (EF)",
      type: "text",
      value: ejectionFraction,
      onChange: setEjectionFraction,
      keyboardType: "numeric",
    },
    {
      label: "Vessels Involved",
      type: "text",
      value: vesselsInvolved,
      onChange: setVesselsInvolved,
      keyboardType: "default",
    },
    {
      label: "Co-morbidities",
      type: "picker",
      selectedValue: comorbidities,
      onValueChange: setComorbidities,
      options: [
        { label: "Diabetes mellitus", value: "Diabetes mellitus" },
        { label: "Hypertension", value: "Hypertension" },
        { label: "Both", value: "Both" },
        { label: "Nil", value: "Nil" },
      ],
    },
    {
      label: "Duration of Co-morbidities",
      type: "text",
      value: durationOfComorbidities,
      onChange: setDurationOfComorbidities,
      keyboardType: "numeric",
    },
    {
      label: "Next Follow-Up Date",
      type: "text",
      value: nextFollowUpDate,
      onChange: setNextFollowUpDate,
    },
    {
      label: "Date of Operation",
      type: "text",
      value: dateOfOperation,
      onChange: setDateOfOperation,
    },
  ];

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButtonContainer}
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-back" size={20} color="#000" />
      </TouchableOpacity>
      <Text style={styles.title}>Clinical Form</Text>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {formData.map((item) => (
          <View key={item.label}>{renderItem({ item })}</View>
        ))}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.clearButton]}
          onPress={handleClear}
        >
          <Text style={styles.buttonText}>Clear</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={handleCancel}
        >
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={handleSave}
        >
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <View style={styles.datePickerContainer}>
          <DateTimePicker
            testID="dateTimePicker"
            value={selectedDate || new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "inline" : "calendar"}
            onChange={handleDateChange}
            minimumDate={
              dateField === "nextFollowUpDate" ? new Date() : undefined
            } // Restrict future dates only for "Next Follow-Up Date"
          />
        </View>
      )}

      {pickerModalVisible && (
        <Modal
          transparent={true}
          visible={pickerModalVisible}
          onRequestClose={() => setPickerModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setPickerModalVisible(false)}
              >
                <Icon name="close" size={20} color="#000" />
              </TouchableOpacity>
              <Text style={styles.modalLabel}>{currentPickerLabel}</Text>
              {/* Adding ScrollView for the options inside the modal */}
              <ScrollView
                contentContainerStyle={{ paddingBottom: 20 }} // Add padding if necessary
                showsVerticalScrollIndicator={false}
              >
                {currentPickerOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.modalButton,
                      currentPickerValue === option.value &&
                        styles.modalButtonSelected,
                    ]}
                    onPress={() => {
                      setCurrentPickerValue(option.value); // Update the current picker value
                      if (currentPickerLabel === "Patient ID") {
                        setPatientID(option.value); // Update patientID state
                      } else if (currentPickerLabel === "Co-morbidities") {
                        setComorbidities(option.value); // Set the selected co-morbidities
                      }
                      setPickerModalVisible(false); // Hide the modal
                    }}
                  >
                    <Text
                      style={[
                        styles.modalButtonText,
                        currentPickerValue === option.value &&
                          styles.modalButtonTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,

    backgroundColor: "#fff",

    paddingTop: Platform.OS === "ios" ? 110 : 110,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  scrollContainer: {
    flexGrow: 1, // Ensure the content expands to fill the available space
    paddingBottom: 20, // Add padding at the bottom if needed
  },
  fieldContainer: {
    marginBottom: 15,
  },
  fieldName: {
    fontSize: RFValue(18),
    marginBottom: 5,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
  },
  picker: {
    height: 50,
    width: "100%",
  },
  backButtonContainer: {
    position: "absolute",
    top: Platform.OS === "ios" ? 58 : 55,
    left: Platform.OS === "ios" ? 20 : 20,
    width: 36,
    height: Platform.OS === "ios" ? 35 : 35,
    borderRadius: 25,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 10,
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderRadius: 10,
  },

  mainContentContainer: {
    marginTop: 10,
  },
  placeholderText: {
    color: "#888",
    fontSize: 14,

    top: 10,
  },

  title: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 60,
    left: 30,
    right: 0,
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#000",
    zIndex: 5,
    marginBottom: Platform.OS === "android" ? 10 : 20,
  },
  datePickerContainer: {},

  label: {
    fontSize: RFValue(14),
    fontWeight: "500",
    flex: 1, // Takes up space on the left
  },
  input: {
    height: 40,
    borderColor: "#d3d3d3",
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 10,
    fontSize: RFValue(10),
    flex: 2, // Takes up space on the right
    marginTop: 10,
    textAlignVertical: "center",
  },
  pickerButton: {
    height: 40,
    borderColor: "#d3d3d3",
    borderWidth: 1,
    borderRadius: 15,
    justifyContent: "center",
    paddingHorizontal: 10,
    fontSize: 12,
    flex: 2, // Takes up space on the right
    marginTop: 10,
  },
  pickerButtonText: {
    fontSize: 14,
    color: "#000",
  },
  /*   buttonGroupContainer: {
      flexDirection: 'row',
      marginTop: 20,
      bottom: 10,
      right: 28,
    }, */
  buttonGroupContainer: {
    flexDirection: "row",
    justifyContent: "space-between", // Align buttons in a straight line
    marginTop: 10,
    marginBottom: 10,
  },
  buttonGroupButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 15,
    backgroundColor: "#fff",
    marginHorizontal: 5, // Adjust margin between buttons
    alignItems: "center",
    justifyContent: "center",
  },
  buttonGroupButtonSelected: {
    backgroundColor: "#007bff",
  },
  buttonGroupButtonText: {
    fontSize: 16,
  },
  buttonGroupButtonTextSelected: {
    color: "#fff",
  },
  buttonContainer: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  button: {
    flex: 1,
    marginHorizontal: 14,
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: "center",
    height: 50,
    left: 0,
    justifyContent: "space-between",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
  },
  clearButton: {
    backgroundColor: "#FFC107",
  },
  cancelButton: {
    backgroundColor: "#F44336",
  },

  buttonText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
  },

  modalLabel: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    borderRadius: 35,
  },
  modalButton: {
    padding: 10,

    borderRadius: 35,
    marginTop: 4,
    backgroundColor: "#fff",
  },
  modalButtonSelected: {
    backgroundColor: "#007bff",
  },
  modalContainer: {
    flex: 1,
    position: "absolute", // Ensure it is positioned on top of everything else
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center", // Center content vertically
    alignItems: "center", // Center content horizontally
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Dim the background
    zIndex: 9999, // Ensure the modal stays above other content
  },
  modalContent: {
    width: "60%", // You can adjust this width
    maxHeight: "70%", // Ensure the modal does not exceed 70% of the screen height
    backgroundColor: "#fff",
    borderRadius: 30,
    padding: 20,
    elevation: 5,
    alignSelf: "center",
    textAlign: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalOption: {
    paddingVertical: 10,
  },
  modalOptionText: {
    fontSize: 16,
  },
  modalButtonText: {
    fontSize: 16,
  },
  modalButtonTextSelected: {
    color: "#fff",
  },
  closeButton: {
    position: "absolute",
    top: 15,
    right: 15,
    zIndex: 1,
  },
});

export default AddClinicalProfilePage;
