// app/screens/AddMetabolicProfilePage.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text as RNText,
  StyleSheet,
  TextInput,
  Alert,
  TouchableOpacity,
  FlatList,
  Keyboard,
  Platform,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { RFValue } from "react-native-responsive-fontsize"; // If you choose to use responsive font size library
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../type";
import Icon from "react-native-vector-icons/MaterialIcons"; // Import the icon library
import { saveOrUpdateMetabolic } from "../services/apiService";
import DateTimePicker from "@react-native-community/datetimepicker";
import CustomAlert from "../components/CustomAlert";
// Custom Text component to disable font scaling globally
const Text = (props: any) => {
  return <RNText {...props} allowFontScaling={false} />;
};

type AddMetabolicProfileNavigationProp = StackNavigationProp<
  RootStackParamList,
  "AddMetabolicProfilePage"
>;

type PickerOption = {
  label: string;
  value: string;
};

type FormField = {
  label: string;
  type: "text" | "picker";
  value?: string;
  selectedValue?: string | null;
  onChange?: (value: string) => void;
  onValueChange?: (value: string) => void;
  options?: PickerOption[];
  keyboardType?: "default" | "numeric" | "email-address" | "phone-pad";
};

const AddMetabolicProfilePage: React.FC = () => {
  // Existing state variables
  const [patientID, setPatientID] = useState<string>(""); // Add this line

  const [patientIDOptions, setPatientIDOptions] = useState<PickerOption[]>([]);

  // New state variables
  const [height, setHeight] = useState<string>("");
  const [weight, setWeight] = useState<string>("");
  const [bmi, setBmi] = useState<string>("");
  const [waistCircumference, setWaistCircumference] = useState<string>("");
  const [hipCircumference, setHipCircumference] = useState<string>("");
  const [sbp, setSbp] = useState<string>("");
  const [dbp, setDbp] = useState<string>("");
  const [fastingBloodSugar, setFastingBloodSugar] = useState<string>("");
  const [ldl, setLdl] = useState<string>("");
  const [hdl, setHdl] = useState<string>("");
  const [triglycerides, setTriglycerides] = useState<string>("");
  const [totalCholesterol, setTotalCholesterol] = useState<string>("");
  const [walkTest, setWalkTest] = useState<string>("");
  const [pickerModalVisible, setPickerModalVisible] = useState<boolean>(false);
  const [currentPickerOptions, setCurrentPickerOptions] = useState<
    PickerOption[]
  >([]);
  const [currentPickerLabel, setCurrentPickerLabel] = useState<string>("");
  const [currentPickerValue, setCurrentPickerValue] = useState<string | null>(
    null
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cancelAlertVisible, setCancelAlertVisible] = useState(false);
  const [regularAlertVisible, setRegularAlertVisible] = useState(false);
  const [successAlertVisible, setSuccessAlertVisible] = useState(false);
  const [errorAlertVisible, setErrorAlertVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const navigation = useNavigation<AddMetabolicProfileNavigationProp>();

  useEffect(() => {
    const fetchPatientIDs = async () => {
      try {
        const response = await fetch(
          "https://vs3k4b04-8000.inc1.devtunnels.ms/api/api/get-existing-patient-ids/"
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

  useEffect(() => {
    const fetchMetabolicData = async (patientID: string) => {
      try {
        const response = await fetch(
          `https://vs3k4b04-8000.inc1.devtunnels.ms/api/api/metabolic-data/?patient_id=${patientID}`
        );
        const data = await response.json();

        console.log("Fetched Metabolic Data:", data); // Log fetched data

        if (data.length > 0) {
          const metabolicData = data[0]; // Assuming you get an array of records

          // Populate form fields with existing metabolic data
          setHeight(metabolicData.height.toString());
          setWeight(metabolicData.weight.toString());
          setBmi(metabolicData.bmi.toString());
          setWaistCircumference(metabolicData.waist_circumference.toString());
          setHipCircumference(metabolicData.hip_circumference.toString());
          setSbp(metabolicData.sbp.toString());
          setDbp(metabolicData.dbp.toString());
          setFastingBloodSugar(metabolicData.fbs.toString());
          setLdl(metabolicData.ldl.toString());
          setHdl(metabolicData.hdl.toString());
          setTriglycerides(metabolicData.triglycerides.toString());
          setTotalCholesterol(metabolicData.total_cholesterol.toString());
          setWalkTest(metabolicData.meters_walked.toString());
        } else {
          // Clear the fields if no data is found for the selected patient
          handleClear();
        }
      } catch (error) {
        //Alert.alert("Error", "Failed to fetch metabolic data.");
        setAlertTitle("Error");
        setAlertMessage("Failed to fetch metabolic data.");
        console.error("Error fetching metabolic data:", error); // Log the error
      }
    };

    if (patientID) {
      fetchMetabolicData(patientID);
    }
  }, [patientID]);

  const handleSave = async () => {
    if (
      !patientID ||
      !height ||
      !weight ||
      !bmi ||
      !waistCircumference ||
      !hipCircumference ||
      !sbp ||
      !dbp ||
      !fastingBloodSugar ||
      !ldl ||
      !hdl ||
      !triglycerides ||
      !totalCholesterol ||
      !walkTest
    ) {
      /* Alert.alert(
        "Validation Error",
        "Please fill in all required fields before saving."
      ); */
      setAlertTitle("Validation Error");
      setAlertMessage("Please fill in all required fields before saving.");
      return;
    }

    const newMetabolicData = {
      patient_id: patientID,
      height: parseFloat(height),
      weight: parseFloat(weight),
      bmi: parseFloat(bmi),
      waist_circumference: parseFloat(waistCircumference),
      hip_circumference: parseFloat(hipCircumference),
      sbp: parseFloat(sbp),
      dbp: parseFloat(dbp),
      fbs: parseFloat(fastingBloodSugar),
      ldl: parseFloat(ldl),
      hdl: parseFloat(hdl),
      triglycerides: parseFloat(triglycerides),
      total_cholesterol: parseFloat(totalCholesterol),
      meters_walked: parseFloat(walkTest),
    };

    try {
      await saveOrUpdateMetabolic(newMetabolicData);
      setSuccessAlertVisible(true);
      handleClear(); // Clear the form after successful submission
    } catch (error: any) {
      setErrorMessage(
        error.message || "An error occurred while saving the data."
      );
      setErrorAlertVisible(true);
    }
  };

  const newmetabolicData = {
    patient_id: patientID,
    height: parseFloat(height),
    weight: parseFloat(weight),
    bmi: parseFloat(bmi),
    waist_circumference: parseFloat(waistCircumference),
    hip_circumference: parseFloat(hipCircumference),
    sbp: parseFloat(sbp),
    dbp: parseFloat(dbp),
    fbs: parseFloat(fastingBloodSugar),
    ldl: parseFloat(ldl),
    hdl: parseFloat(hdl),
    triglycerides: parseFloat(triglycerides),
    total_cholesterol: parseFloat(totalCholesterol),
    meters_walked: parseFloat(walkTest),
  };

  const handleClear = () => {
    setHeight("");
    setWeight("");
    setBmi("");
    setWaistCircumference("");
    setHipCircumference("");
    setSbp("");
    setDbp("");
    setFastingBloodSugar("");
    setLdl("");
    setHdl("");
    setTriglycerides("");
    setTotalCholesterol("");
    setWalkTest("");
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
          navigation.navigate("AdminDashboardPage");
          handleClear();
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

  const renderItem = ({ item }: { item: FormField }) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{item.label}</Text>
      {item.label === "Blood Pressure (BP):" ? (
        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.halfWidth]}
            placeholder="SBP"
            value={sbp}
            onChangeText={(value) => {
              setSbp(value);
              item.onChange?.(`${value} / ${dbp}`);
            }}
            keyboardType={item.keyboardType}
          />
          <TextInput
            style={[styles.input, styles.halfWidth]}
            placeholder="DBP"
            value={dbp}
            onChangeText={(value) => {
              setDbp(value);
              item.onChange?.(`${sbp} / ${value}`);
            }}
            keyboardType={item.keyboardType}
          />
        </View>
      ) : (
        <>
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
            ) : (
              <TextInput
                style={styles.input}
                // Remove colon from the placeholder text
                placeholder={`${item.label.replace(":", "")}`}
                value={item.value || ""}
                onChangeText={item.onChange}
                keyboardType={item.keyboardType}
                editable={item.label === "Patient ID" ? false : true} // Disable Patient ID editing
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
                {item.selectedValue
                  ? item.selectedValue
                  : `Select ${item.label}`}
              </Text>
            </TouchableOpacity>
          ) : null}
        </>
      )}
    </View>
  );

  const formData: FormField[] = [
    {
      label: "Patient ID",
      type: "text",
      value: patientID,
      onChange: setPatientID,
    },
    {
      label: "Height:",
      type: "text",
      value: height,
      onChange: setHeight,
      keyboardType: "numeric",
    },
    {
      label: "Weight:",
      type: "text",
      value: weight,
      onChange: setWeight,
      keyboardType: "numeric",
    },
    {
      label: "BMI:",
      type: "text",
      value: bmi,
      onChange: setBmi,
      keyboardType: "numeric",
    },
    {
      label: "Waist Circumference:",
      type: "text",
      value: waistCircumference,
      onChange: setWaistCircumference,
      keyboardType: "numeric",
    },
    {
      label: "Hip Circumference:",
      type: "text",
      value: hipCircumference,
      onChange: setHipCircumference,
      keyboardType: "numeric",
    },
    {
      label: "Blood Pressure (BP):", // Adjusted this line
      type: "text",
      value: `${sbp} / ${dbp}`,
      onChange: (value) => {
        const [sbpValue, dbpValue] = value.split(" / ");
        setSbp(sbpValue || "");
        setDbp(dbpValue || "");
      },
      keyboardType: "numeric",
    },
    {
      label: "Fasting Blood Sugar (FBS):",
      type: "text",
      value: fastingBloodSugar,
      onChange: setFastingBloodSugar,
      keyboardType: "numeric",
    },
    {
      label: "Low-Density Lipoprotein (LDL):",
      type: "text",
      value: ldl,
      onChange: setLdl,
      keyboardType: "numeric",
    },
    {
      label: "High-Density Lipoprotein (HDL):",
      type: "text",
      value: hdl,
      onChange: setHdl,
      keyboardType: "numeric",
    },
    {
      label: "Triglycerides:",
      type: "text",
      value: triglycerides,
      onChange: setTriglycerides,
      keyboardType: "numeric",
    },
    {
      label: "Total Cholesterol:",
      type: "text",
      value: totalCholesterol,
      onChange: setTotalCholesterol,
      keyboardType: "numeric",
    },
    {
      label: "6 Minutes Walk Test Meters:",
      type: "text",
      value: walkTest,
      onChange: setWalkTest,
      keyboardType: "numeric",
    },
  ];

  return (
    <View style={styles.container}>
      <CustomAlert
        title="Form Submitted"
        message="Metabolic Information has been saved successfully!"
        visible={successAlertVisible}
        onClose={() => setSuccessAlertVisible(false)}
        mode="ok"
        onOk={() => {
          setSuccessAlertVisible(false);
          navigation.navigate("ViewPatientTablePage");
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
      <TouchableOpacity
        style={styles.backButtonContainer}
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-back" size={20} color="#000" />
      </TouchableOpacity>
      <Text style={styles.title}>Metabolic Form</Text>

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
          <Text style={styles.buttonText}>Save</Text>
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

              {/* Adding ScrollView for the options inside the modal */}
              <ScrollView
                contentContainerStyle={{ paddingBottom: 20 }} // Adjust as needed
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

    backgroundColor: "#fff",
    padding: 15,
    paddingTop: 110,
  },
  scrollContainer: {
    flexGrow: 1, // Ensures the content can scroll if it overflows
    //paddingBottom: 70, // Space for the keyboard to avoid overlapping
  },
  innerContainer: {
    flex: 1,

    justifyContent: "center",
  },
  closeButton: {
    position: "absolute",
    top: 15,
    right: 15,
    zIndex: 1,
  },
  backButtonContainer: {
    position: "absolute",
    top: Platform.OS === "ios" ? 58 : 55,
    left: Platform.OS === "ios" ? 20 : 20,
    width: 36,
    height: Platform.OS === "ios" ? 35 : 35,
    borderRadius: 25,
    backgroundColor: "#fff", // Same background color for both
    justifyContent: "center",
    alignItems: "center",
    elevation: 10,
    zIndex: 10,
  },
  closeIcon: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 1, // Ensures the close icon is above other content
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfWidth: {
    flex: 1,
    marginRight: 8,
  },

  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
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
  title: {
    position: "absolute",
    top: Platform.OS === "ios" ? 63 : 60,
    // left: 45, // Center the title by leaving left at 0 and using textAlign 30
    left: Platform.OS === "ios" ? 30 : 45,
    right: 0, // Ensure it takes up the full width
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center", // Center the title
    color: "#000", // Adjust color for visibility
    zIndex: 5, // Ensure the title is on top of the content but behind the back button
    /* marginBottom: 10,
    marginBottom: 25, */
    marginBottom: Platform.OS === "android" ? 10 : 10,
  },

  label: {
    fontSize: RFValue(14),
    fontWeight: "500",
    flex: 1, // Takes up space on the left
  },
  input: {
    height: 40,
    color: "#000",
    borderColor: "#d3d3d3",
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 10,
    fontSize: RFValue(10),
    flex: 2, // Takes up space on the right
    marginTop: 10,
  },

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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
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
  modalContent: {
    width: "60%",
    padding: 20,
    borderRadius: 35,
    backgroundColor: "white",
    elevation: 5, // Adds shadow for Android
    shadowColor: "#000", // Shadow color for iOS
    shadowOffset: { width: 0, height: 2 }, // Shadow offset
    shadowOpacity: 0.3, // Shadow opacity
    shadowRadius: 4, // Shadow blur radius
  },

  closeButtonText: {
    color: "blue",
    fontSize: 16,
    textDecorationLine: "underline", // Underline text to indicate it's a link
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
  datePickerContainer: {
    // define your styles here
  },
});

export default AddMetabolicProfilePage;
