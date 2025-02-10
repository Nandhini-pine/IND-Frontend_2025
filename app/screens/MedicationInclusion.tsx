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
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import Icon from "react-native-vector-icons/Ionicons";
import CustomAlert from "../components/CustomAlert";

// Custom Text component to disable font scaling globally
const Text = (props: any) => {
  return <RNText {...props} allowFontScaling={false} />;
};

const medications = [
  {
    type: "pill",
    name: "Tablet",
    dosage: "500 mg - Before food",
    count: "1/20",
  },
  {
    type: "syrup",
    name: "Syrup 1",
    dosage: "50 ml - After food",
    count: "2/10",
  },
  {
    type: "pill",
    name: "Capsule",
    dosage: "500 mg - Before food",
    count: "1/10",
  },
];

// Define types for selectedMedications state
type TimeOfDay = "Morning" | "Afternoon" | "Evening" | "Night";
type SelectedMedicationsState = {
  [key in TimeOfDay]: number[];
};

const PatientMedication: React.FC = () => {
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activeTime, setActiveTime] = useState("");
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const [selectedMedications, setSelectedMedications] =
    useState<SelectedMedicationsState>({
      Morning: [],
      Afternoon: [],
      Evening: [],
      Night: [],
    });

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

  const handleSubmit = useCallback(() => {
    //Alert.alert("Submitted", "Your data has been submitted successfully.");
    setAlertTitle('Submitted');
    setAlertMessage('Your data has been submitted successfully.');
  }, []);

  const handleClear = useCallback(() => {
    setSelectedMedications({
      Morning: [],
      Afternoon: [],
      Evening: [],
      Night: [],
    });
    //Alert.alert("Cleared", "Your data has been cleared successfully.");
    setAlertTitle('Cleared');
    setAlertMessage('Your data has been cleared successfully.');
  }, []);

  const handleCancel = useCallback(() => {
    //Alert.alert("Cancelled", "Your data has been cancelled successfully.");
    setAlertTitle('Cancelled');
    setAlertMessage('Your data has been cancelled successfully.');
  }, []);

  const handleTranslate = () => {
    console.log("Translate button pressed");
  };

  const onChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setDate(currentDate);
  };

  const showPicker = () => {
    setShowDatePicker(true);
  };

  useEffect(() => {
    updateActiveTime();
  }, []);

  const medications = [
    { type: "pill", name: "Tablet", dosage: "500 mg - Before food" },
    { type: "syrup", name: "Syrup 1", dosage: "50 ml - After food" },
    { type: "pill", name: "Capsule", dosage: "500 mg - Before food" },
  ];

  const toggleSelection = (timeOfDay: TimeOfDay, index: number) => {
    setSelectedMedications((prevSelected) => {
      const currentSelection = prevSelected[timeOfDay];
      const updatedSelection = currentSelection.includes(index)
        ? currentSelection.filter((i: number) => i !== index) // i is typed as number
        : [...currentSelection, index];
      return { ...prevSelected, [timeOfDay]: updatedSelection };
    });
  };

  return (
    <View style={styles.outerContainer}>
      <ScrollView
        style={styles.container}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.coverContainer}>
          <Text style={styles.title}>Medication Information</Text>
        </View>

        {/* DatePicker and Translate Button */}
        <View style={styles.datePickerTranslateContainer}>
          <View style={styles.datePickerContainer}>
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={showPicker}
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
                onChange={onChange}
              />
            )}
          </View>
          {/* <TouchableOpacity style={styles.translateButton} onPress={handleTranslate}>
            <Text style={styles.translateButtonText}>Translate</Text>
          </TouchableOpacity> */}
        </View>

        <View style={styles.separator} />

        {(["Morning", "Afternoon", "Evening", "Night"] as TimeOfDay[]).map(
          (timeOfDay) => (
            <View key={timeOfDay}>
              <Text style={styles.morningMedicationText}>
                {timeOfDay} Medication
              </Text>
              <View style={styles.morningMedicationContainer}>
                {medications.map((medication, index) => (
                  <View key={index} style={styles.medicationWrapper}>
                    <TouchableOpacity
                      style={[
                        styles.medicationContainer,
                        selectedMedications[timeOfDay].includes(index) && {
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
                            medication.type === "pill"
                              ? require("../../assets/images/pill.png")
                              : require("../../assets/images/syrup.png")
                          }
                          style={styles.iconMedication}
                        />
                        <View style={styles.medicationTextContainer}>
                          <Text style={styles.medicationItem}>
                            <Text style={styles.boldText}>
                              {medication.name}
                            </Text>
                          </Text>
                          <Text style={styles.medicationDetails}>
                            {medication.dosage}
                          </Text>

                          {/* Start and End Dates from Previous Screen */}
                          <View style={styles.datesContainer}>
                            <Text style={styles.medicationDetails}>
                              <Text style={styles.dateText}>Start Date: </Text>
                              {/* {startDate ? startDate.toLocaleDateString() : 'Not set'} */}
                              {" | "} {/* Separator between dates */}
                              <Text style={styles.dateText}>End Date: </Text>
                              {/* {endDate ? endDate.toLocaleDateString() : 'Not set'} */}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <Text style={styles.medicationDetail}>
                        <Text style={styles.boldText}>Note:</Text> Please take
                        your medication at the scheduled time.
                      </Text>
                    </TouchableOpacity>

                    {/* White Box next to Medication Container */}
                    <View style={styles.whiteBox}>
                      <Text style={styles.whiteBoxText}>1/10 </Text>
                    </View>
                  </View>
                ))}
              </View>
              <View style={styles.separator} />
            </View>
          )
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.footerButtonText}>Submit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
          <Text style={styles.footerButtonText}>Clear</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.footerButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  container: {
    width: "100%",
    height: "50%", // Adjust height to 50% to show half of the container
    backgroundColor: "#F5F5F5",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingTop: 60,
  },
  coverContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: -10,
  },
  datesContainer: {
    flexDirection: "row",
    alignItems: "center", // Align items vertically centered
    marginVertical: 5, // Adjust margin as needed
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#36454F",
    textAlign: "center",
    marginVertical: 5,
  },
  datePickerTranslateContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 15,
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
    width: "35%",
    marginLeft: 10,
  },
  translateButtonText: {
    color: "#585858",
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

  tileText: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 15,
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
    fontSize: 18,
    fontWeight: "700",
    marginVertical: 10,
    textAlign: "left",
    color: "#585858",
    marginLeft: 20,
    paddingBottom: 10,
  },
  morningMedicationContainer: {
    marginBottom: 40,
  },
  medicationWrapper: {
    flexDirection: "row", // Aligns the medication container and the white box horizontally
    alignItems: "flex-start", // Adjust alignment as needed
    marginBottom: 10, // Spacing between medication items
  },

  medicationList: {
    paddingVertical: 5,
  },
  medicationContainer: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#fff", // Light background for medication details
    //borderRadius: 30,
    elevation: 1,
    marginVertical: -8,
    width: "73%",
  },
  whiteBox: {
    width: "26%",
    height: "91%",
    bottom: 9,
    backgroundColor: "white",
    marginLeft: 3,
    borderRadius: 0,
    shadowColor: "#000",

    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2, // For Android shadow
  },
  whiteBoxText: {
    fontSize: 22,
    color: "#686868",
    fontWeight: "bold",
    textAlign: "center",
    alignSelf: "center",
    top: 50,
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
    color: "#808080",
    fontWeight: "700",
    marginBottom: 5,
    marginTop: 5,
  },
  medicationDetail: {
    fontSize: 12,
    marginTop: 0,
    marginLeft: 60,
    textAlign: "left",
    color: "#B0B0B0",
  },
  boldText: {
    fontWeight: "700",
    color: "#505050",
  },
  dateText: {
    fontWeight: "700",
    color: "#505050",
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
});

export default PatientMedication;
