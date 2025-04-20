//app/screens/AddPatientProfile.tsx
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
  KeyboardAvoidingView,
  ScrollView,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../type";
import { createPatient } from "../services/apiService";
import Icon from "react-native-vector-icons/Ionicons";
import { RFValue } from "react-native-responsive-fontsize"; // If you choose to use responsive font size library
import CustomAlert from "../components/CustomAlert";

// Custom Text component to disable font scaling globally
const Text = (props: any) => {
  return <RNText {...props} allowFontScaling={false} />;
};

type AddPatientProfileNavigationProp = StackNavigationProp<
  RootStackParamList,
  "AddPatientProfile"
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

const AddPatientProfile: React.FC = () => {
  const [patientID, setPatientID] = useState("");
  const [patientName, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<string | null>(null);
  const [education, setEducation] = useState<string | null>(null);
  const [occupation, setOccupation] = useState<string | null>(null);
  const [maritalStatus, setMaritalStatus] = useState<string | null>(null);
  const [diet, setDiet] = useState<string | null>(null);
  const [smokinghabits, setSmokingHabits] = useState<string | null>(null);
  const [alcoholhabits, setAlcoholHabits] = useState<string | null>(null);
  const [emergency, setEmergencyDoctorContactNumber] = useState<string | null>(
    null
  );
  const [phone, setPatientContactNumber] = useState<string | null>(null);
  const smokingAsBoolean = smokinghabits === "Yes"; // Assuming "Yes" means true
  const alcoholicAsBoolean = alcoholhabits === "Yes"; // Assuming "Yes" means true

  const [pickerModalVisible, setPickerModalVisible] = useState<boolean>(false);
  const [currentPickerOptions, setCurrentPickerOptions] = useState<
    PickerOption[]
  >([]);
  const [currentPickerLabel, setCurrentPickerLabel] = useState<string>("");
  const [currentPickerValue, setCurrentPickerValue] = useState<string | null>(
    null
  );
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cancelAlertVisible, setCancelAlertVisible] = useState(false);
  const [regularAlertVisible, setRegularAlertVisible] = useState(false);

  const navigation = useNavigation<AddPatientProfileNavigationProp>();
  useEffect(() => {
    const fetchNextPatientID = async () => {
      try {
        const response = await fetch(
          "https://indheart.pinesphere.in/api/api/get-next-patient-id/"
        );
        const data = await response.json();
        setPatientID(data.next_patient_id);
      } catch (error) {
        //Alert.alert("Error", "Failed to fetch the next patient ID.");
        setAlertTitle("Error");
        setAlertMessage("Failed to fetch the next patient ID.");
      }
    };

    fetchNextPatientID();
  }, []);

  // Function to handle input change and restrict to 3 digits
  const handleAgeChange = (text: string) => {
    // Allow only numeric values and restrict to a maximum of 3 digits
    if (/^\d{0,3}$/.test(text)) {
      setAge(text);
    }
  };

  const handleSave = async () => {
    if (isSubmitting) return; // Prevent multiple submissions

    setIsSubmitting(true);
    if (
      !patientID ||
      !patientName ||
      !age ||
      !gender ||
      !education ||
      !occupation ||
      !maritalStatus ||
      !diet ||
      !smokinghabits ||
      !alcoholhabits ||
      !phone ||
      !emergency
    ) {
      /* Alert.alert(
        "Validation Error",
        "Please fill in all required fields before saving."
      ); */
      setAlertTitle("Validation Error");
      setAlertMessage("Please fill in all required fields before saving.");
      setAlertVisible(true);
      setIsSubmitting(false); // Reset isSubmitting once form validation fails
      return;
    }

    const newPatientData = {
      patientID,
      name: patientName,
      age,
      gender,
      education,
      occupation,
      marital_status: maritalStatus,
      diet,
      smoking: smokingAsBoolean, // Correct type
      alcoholic: alcoholicAsBoolean, // Correct type
      patient_contact_number: phone,
      emergency_doctor_number: emergency, // Update field name here
    };

    try {
      await createPatient(newPatientData);
      setAlertTitle("Form Submitted");
      setAlertMessage("Patient Information has been saved successfully!");
      setAlertVisible(true); // Show the custom alert
      handleClear(); // Clear the form after successful submission
      navigation.navigate("AddClinicalProfilePage"); // Navigate to AddClinicalProfile screen
    } catch (error: any) {
      setAlertTitle("Error");
      setAlertMessage(
        error.message || "An error occurred while saving the data."
      );
      setAlertVisible(true);
    }

    setIsSubmitting(false);
  };

  const handleClear = () => {
    setName("");
    setAge("");
    setGender(null);
    setEducation(null);
    setOccupation(null);
    setMaritalStatus(null);
    setDiet(null);
    setSmokingHabits(null);
    setAlcoholHabits(null);
    setEmergencyDoctorContactNumber(null);
    setPatientContactNumber(null);
  };

  /*  const handleCancel = () => {
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
  const handleViewSubmittedData = () => {
    console.log("Navigating to Adding clinical Data");
    navigation.navigate("AddClinicalProfilePage");
  };

  const handleEmergencyContact = (text: string) => {
    const cleanedText = text.replace(/[^0-9]/g, "").substring(0, 11);
    setEmergencyDoctorContactNumber(cleanedText);
  };

  const handlePatientPhoneContact = (text: string) => {
    const cleanedText = text.replace(/[^0-9]/g, "").substring(0, 10);
    setPatientContactNumber(cleanedText);
  };

  const handleAlphabetInput = (text: string) => {
    // Replace all non-alphabetic characters (including numbers and special characters) with an empty string
    const cleanedText = text.replace(/[^A-Za-z\s]/g, "");
    setName(cleanedText); // Update the state with the cleaned text
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

  const genderOptions: PickerOption[] = [
    { label: "Male", value: "Male" },
    { label: "Female", value: "Female" },
    { label: "Other", value: "Other" },
  ];
  const educationOptions: PickerOption[] = [
    { label: "High School", value: "High School" },
    { label: "Bachelor's Degree", value: "Bachelor's Degree" },
    { label: "Master's Degree", value: "Master's Degree" },
    { label: "PhD", value: "PhD" },
  ];
  const occupationOptions: PickerOption[] = [
    { label: "Sedentary Worker", value: "Sedentary Worker" },
    { label: "Moderate Worker", value: "Moderate Worker" },
    { label: "Heavy Worker", value: "Heavy Worker" },
  ];
  const maritalStatusOptions: PickerOption[] = [
    { label: "Single", value: "Single" },
    { label: "Married", value: "Married" },
    { label: "Divorced", value: "Divorced" },
    { label: "Widowed", value: "Widowed" },
  ];
  const dietOptions: PickerOption[] = [
    { label: "Vegetarian", value: "Vegetarian" },
    { label: "Non-Vegetarian", value: "Non-Vegetarian" },
    { label: "Both", value: "Both" },
  ];

  const handleButtonGroupPress = (
    group: "smoking" | "alcohol",
    value: string
  ) => {
    if (group === "smoking") {
      setSmokingHabits(value);
    } else if (group === "alcohol") {
      setAlcoholHabits(value);
    }
  };

  const renderItem = ({ item }: { item: FormField }) => {
    return (
      <View style={styles.fieldContainer}>
        {/* Cancel confirmation with Yes/No buttons */}
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

        <Text style={[styles.label, { allowFontScaling: false }]}>
          {item.label}:
        </Text>
        {item.type === "text" ? (
          <TextInput
            style={styles.input}
            placeholder={` ${item.label}`}
            value={item.value || ""}
            onChangeText={item.onChange}
            keyboardType={item.keyboardType}
            editable={item.label === "Patient ID" ? false : true}
          />
        ) : item.type === "button-group" ? (
          <View style={styles.buttonGroupContainer}>
            {item.options?.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.buttonGroupButton,
                  item.selectedValue === option.value &&
                    styles.buttonGroupButtonSelected,
                ]}
                onPress={() =>
                  handleButtonGroupPress(
                    item.label === "Smoking Habits" ? "smoking" : "alcohol",
                    option.value
                  )
                }
              >
                <Text
                  style={[
                    styles.buttonGroupButtonText,
                    item.selectedValue === option.value &&
                      styles.buttonGroupButtonTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
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
                { color: item.selectedValue ? "#000" : "#888" }, // Use item.selectedValue to determine color
              ]}
            >
              {item.selectedValue ? item.selectedValue : `Select ${item.label}`}
            </Text>
          </TouchableOpacity>
        )}
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
      label: "Name",
      type: "text",
      value: patientName,
      onChange: handleAlphabetInput,
      keyboardType: "default",
    },
    {
      label: "Age",
      type: "text",
      value: age,
      onChange: handleAgeChange,
      keyboardType: "numeric",
    },
    {
      label: "Gender",
      type: "picker",
      selectedValue: gender,
      onValueChange: setGender,
      options: genderOptions,
    },
    {
      label: "Patient Contact Number",
      type: "text",
      value: phone,
      onChange: handlePatientPhoneContact,
      keyboardType: "numeric",
    },
    {
      label: "Emergency Doctor Contact Number",
      type: "text",
      value: emergency,
      onChange: handleEmergencyContact,
      keyboardType: "numeric",
    },
    {
      label: "Education",
      type: "picker",
      selectedValue: education,
      onValueChange: setEducation,
      options: educationOptions,
    },
    {
      label: "Occupation",
      type: "picker",
      selectedValue: occupation,
      onValueChange: setOccupation,
      options: occupationOptions,
    },
    {
      label: "Marital Status",
      type: "picker",
      selectedValue: maritalStatus,
      onValueChange: setMaritalStatus,
      options: maritalStatusOptions,
    },
    {
      label: "Diet",
      type: "picker",
      selectedValue: diet,
      onValueChange: setDiet,
      options: dietOptions,
    },
    {
      label: "Smoking Habits",
      type: "button-group",
      selectedValue: smokinghabits,
      onValueChange: (value) => handleButtonGroupPress("smoking", value),
      options: [
        { label: "Yes", value: "Yes" },
        { label: "No", value: "No" },
      ],
    },
    {
      label: "Alcohol Habits",
      type: "button-group",
      selectedValue: alcoholhabits,
      onValueChange: (value) => handleButtonGroupPress("alcohol", value),
      options: [
        { label: "Yes", value: "Yes" },
        { label: "No", value: "No" },
        /* { label: "Both", value: "Both" },
        { label: "Neither", value: "Neither" }, */
      ],
    },
  ];

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        {/* Adjust StatusBar visibility */}
        <StatusBar
          barStyle="dark-content" // Set the color of status bar text
          backgroundColor="transparent" // Make the background transparent
          translucent={true} // Make status bar translucent
        />

        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <TouchableOpacity
            style={styles.backButtonContainer}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={20} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>Patient Registration Form</Text>

          <FlatList
            data={formData}
            renderItem={renderItem}
            keyExtractor={(item) => item.label}
            showsVerticalScrollIndicator={false}
          />
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
                  <ScrollView>
                    {currentPickerOptions.map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.modalButton,
                          currentPickerValue === option.value &&
                            styles.modalButtonSelected,
                        ]}
                        onPress={() => {
                          setCurrentPickerValue(option.value);
                          if (currentPickerLabel === "Gender") {
                            setGender(option.value);
                          } else if (currentPickerLabel === "Education") {
                            setEducation(option.value);
                          } else if (currentPickerLabel === "Occupation") {
                            setOccupation(option.value);
                          } else if (currentPickerLabel === "Marital Status") {
                            setMaritalStatus(option.value);
                          } else if (currentPickerLabel === "Diet") {
                            setDiet(option.value);
                          }
                          setPickerModalVisible(false);
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
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: Platform.OS === "ios" ? 110 : 110,
    backgroundColor: "#fff",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
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
  title: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 60,
    left: 30,
    right: 0,
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    color: "#000",
    zIndex: 5,
    marginBottom: Platform.OS === "android" ? 10 : 20,
  },
  fieldContainer: {
    marginBottom: 15,
  },
  fieldName: {
    fontSize: 18,
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
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderRadius: 10,
  },

  mainContentContainer: {
    marginTop: 10,
  },

  label: {
    fontSize: RFValue(16),
    fontWeight: "500",
    flex: 1,
  },
  input: {
    height: 40,
    borderColor: "#d3d3d3",
    borderWidth: 1,
    borderRadius: 55,
    paddingHorizontal: 10,
    fontSize: RFValue(9),
    flex: 2,
    marginTop: 10,
  },
  closeButton: {
    position: "absolute",
    top: 15,
    right: 15,
    zIndex: 1,
  },
  pickerButton: {
    height: 40,
    borderColor: "#d3d3d3",
    borderWidth: 1,
    borderRadius: 55,
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
    padding: 8,
    borderWidth: 1,
    borderColor: "#d9d7d7",
    borderRadius: 55,
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Optional: adds a semi-transparent background
  },
  modalContent: {
    width: "80%", // You can adjust this width
    maxHeight: "70%", // Ensure the modal does not exceed 70% of the screen height
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 20,
    elevation: 5, // Optional: for Android shadow
  },
  modalLabel: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalButton: {
    padding: 10,

    borderRadius: 4,
    marginTop: 4,
    backgroundColor: "#fff",
  },
  modalButtonSelected: {
    backgroundColor: "#007bff",
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
});

export default AddPatientProfile;
