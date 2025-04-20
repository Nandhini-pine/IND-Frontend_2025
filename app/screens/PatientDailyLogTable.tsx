import React, { useState, useEffect } from "react";
import {
  View,
  Text as RNText,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
  Modal,
  Alert,
  PermissionsAndroid,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";
import RNFS from "react-native-fs";



// Custom Text component to disable font scaling globally 
const Text = (props: any) => { return <RNText {...props} allowFontScaling={false} />; };

interface PatientDetails {
  patient_id: string; // Ensure this is defined
  diet: string;
}

const PatientDailyLogScreen = () => {
  const navigation = useNavigation<NavigationProp<any>>();

  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const showPicker = () => {
    setShowDatePicker(true);
  };
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [patientIds, setPatientIds] = useState([]);

  const [patientDetails, setPatientDetails] = useState<PatientDetails | null>(
    null
  );
  const [sleepData, setSleepData] = useState<Record<string, boolean>>({});
  const [vegData, setVegData] = useState<Record<string, boolean>>({});
  const [nonvegData, setNonVegData] = useState<Record<string, boolean>>({});
  const [waterData, setWaterData] = useState<Record<string, boolean>>({});
  const [exerciseData, setExerciseData] = useState<Record<string, boolean>>({});
  const [walkData, setwalkData] = useState<Record<string, boolean>>({});
  const [yogaData, setyogaData] = useState<Record<string, boolean>>({});
  const [medicineData, setmedicineData] = useState<Record<string, boolean>>({});
  const [lifestyleData, setlifestyleData] = useState<Record<string, boolean>>(
    {}
  );
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setExcelAlertTitle] = useState('');
  const [alertMessage, setExcelAlertMessage] = useState('');


// ✅ Request Storage Permission (Keeps Your Existing Logic Intact)
const requestStoragePermission = async () => {
  if (Platform.OS !== "android") return true; // iOS doesn't need permissions

  if (Platform.Version >= 30) {
    console.log("✅ Android 11+ detected. Using Scoped Storage, no permission needed.");
    return true; // Scoped Storage allows access to Downloads without extra permission
  }

  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      {
        title: "Storage Permission",
        message: "App needs access to storage to save Excel files.",
        buttonPositive: "OK",
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.warn("❌ Storage permission error:", err);
    return false;
  }
};







  // Fetch all data functions here
  const fetchDataForAllPatients = async () => {
    console.log("Fetching data for all patients...");
    await fetchSleepDataForAllPatients(date);
    await fetchVegDataForAllPatients(date);
    await fetchNonVegDataForAllPatients(date);
    await fetchWaterDataForAllPatients(date);
    await fetchExerciseDataForAllPatients(date);
    await fetchWalkingDataForAllPatients(date);
    await fetchYogaDataForAllPatients(date);
    await fetchMedicineForAllPatients(date);
    await fetchLifestyleForAllPatients(date);
  };
  const onClearFilter = () => {
    setSelectedPatientId("");
    setDate(new Date()); // Reset date to the current date
    fetchDataForAllPatients(); // Fetch all data again without filters
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setDate(currentDate);
    fetchDataForAllPatients(); // Fetch data when the date changes
  };

  // Fetch existing patient IDs from API
  useEffect(() => {
    const fetchPatientIds = async () => {
      try {
        const response = await fetch(
          "https://indheart.pinesphere.in/api/api/get-existing-patient-ids/"
        );
        const data = await response.json();
        setPatientIds(data.patient_ids);
        console.log("Fetched Patient IDs:", data.patient_ids);
      } catch (error) {
        console.error("Error fetching patient IDs:", error);
      }
    };

    fetchPatientIds();
  }, []);

  useEffect(() => {
    if (patientIds.length > 0) {
      fetchDataForAllPatients(); // Fetch all data when patientIds are available
    }
  }, [patientIds]);

 
  // ✅ Helper function: Convert Blob to Base64 properly
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result?.toString().split(",")[1] ?? "");
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };
  
  // ✅ Main function: Handle Download
  const handleExportPatientDataDownload = async () => {
    try {
        console.log("=== Starting Excel download request ===");

        // ✅ Request Storage Permission Before Downloading
        const hasPermission = await requestStoragePermission();
        if (!hasPermission) {
            Alert.alert("Permission Denied", "Storage access is required to download files.");
            return;
        }

        // ✅ Fetch Excel File
        const response = await fetch(
            "https://indheart.pinesphere.in/patient/export-patient-data/"
        );

        if (!response.ok) throw new Error(`Failed to download Excel file. Status: ${response.status}`);

        const blob = await response.blob();
        const base64Data = await blobToBase64(blob);

        // ✅ Get the Downloads folder path
        const downloadsDir = RNFS.DownloadDirectoryPath;
        let fileName = "exported_patient_data.xlsx";
        let fileUri = `${downloadsDir}/${fileName}`;
        let counter = 1;

        // ✅ Check if the file already exists, and generate a new name if needed
        while (await RNFS.exists(fileUri)) {
            fileName = `exported_patient_data(${counter}).xlsx`;
            fileUri = `${downloadsDir}/${fileName}`;
            counter++;
        }

        // ✅ Save the new file
        await RNFS.writeFile(fileUri, base64Data, "base64");

        console.log(`✅ File saved at: ${fileUri}`);
        Alert.alert("Download Successful", `Excel file saved as ${fileName} in Downloads.`);
    } catch (error) {
        console.error("❌ Download Error:", error instanceof Error ? error.message : String(error));
        Alert.alert("Download Failed", `Error: ${error instanceof Error ? error.message : String(error)}`);
    }
};

  
/*   // ✅ Corrected Function to Open Excel File
  const openFile = async (filePath: string) => {
    try {
      console.log("Opening file:", filePath);
      await Linking.openURL(`file://${filePath}`);
    } catch (error) {
      console.error("❌ Error opening file:", error);
      Alert.alert("Error", "Unable to open the Excel file.");
    }
  }; */

  const handlePatientSelect = (patientId: string) => {
    setSelectedPatientId(patientId); // Store the selected patient ID
    setModalVisible(false); // Close the modal
  };

  const handlePatientIdSelect = (id: string) => {
    setSelectedPatientId(id);
    setModalVisible(false);
  };

  const fetchSleepDataForAllPatients = async (selectedDate: Date) => {
    try {
      const formattedDate = selectedDate.toISOString().split("T")[0]; // Format date as yyyy-mm-dd
      const newSleepData: Record<string, boolean> = {};

      await Promise.all(
        patientIds.map(async (patientId) => {
          try {
            const response = await axios.get(
              `https://indheart.pinesphere.in/patient/patient/${patientId}/all-sleep-data/${formattedDate}/`
            );
            console.log(`Response for patient ${patientId} (Sleep):`, response.data);

            newSleepData[patientId] = response.data.exists;
          } catch (error) {
            console.error(`Error fetching sleep data for patient ${patientId}:`, error);

            newSleepData[patientId] = false; // Default to false if there's an error
          }
        })
      );

      setSleepData(newSleepData);
      console.log("Updated Sleep Data:", newSleepData);
    } catch (error) {
      console.error("Error fetching sleep data:", error);
    }
  };

  const fetchVegDataForAllPatients = async (selectedDate: Date) => {
    try {
      const formattedDate = selectedDate.toISOString().split("T")[0];
      const newVegData: Record<string, boolean> = {};

      await Promise.all(
        patientIds.map(async (patientId) => {
          try {
            const response = await axios.get(
              `https://indheart.pinesphere.in/patient/patient/${patientId}/all-vegdiet-data/${formattedDate}/`
            );
            console.log(`Response for patient ${patientId} (Veg):`, response.data);
            newVegData[patientId] = response.data.exists;
          } catch (error) {
            console.error(`Error fetching veg data for patient ${patientId}:`, error);
            newVegData[patientId] = false;
          }
        })
      );

      setVegData(newVegData);
      console.log("Updated Veg Data:", newVegData);
    } catch (error) {
      console.error("Error fetching veg data:", error);
    }
  };

  const fetchNonVegDataForAllPatients = async (selectedDate: Date) => {
    try {
      const formattedDate = selectedDate.toISOString().split("T")[0];
      const newNonVegData: Record<string, boolean> = {};

      await Promise.all(
        patientIds.map(async (patientId) => {
          try {
            const response = await axios.get(
              `https://indheart.pinesphere.in/patient/patient/${patientId}/all-nonvegdiet-data/${formattedDate}/`
            );
            console.log(`Response for patient ${patientId} (Non-Veg):`, response.data);
            newNonVegData[patientId] = response.data.exists;
          } catch (error) {
            console.error(`Error fetching non-veg data for patient ${patientId}:`, error);
            newNonVegData[patientId] = false;
          }
        })
      );

      setNonVegData(newNonVegData);
      console.log("Updated Non-Veg Data:", newNonVegData);
    } catch (error) {
      console.error("Error fetching non-veg data:", error);
    }
  };

  const fetchWaterDataForAllPatients = async (selectedDate: Date) => {
    try {
      const formattedDate = selectedDate.toISOString().split("T")[0];
      const newWaterData: Record<string, boolean> = {};

      await Promise.all(
        patientIds.map(async (patientId) => {
          try {
            const response = await axios.get(
              `https://indheart.pinesphere.in/patient/patient/${patientId}/all-water-data/${formattedDate}/`
            );
            console.log(`Response for patient ${patientId} (Water):`, response.data);
            newWaterData[patientId] = response.data.exists;
          } catch (error) {
            console.error(`Error fetching water data for patient ${patientId}:`, error);
            newWaterData[patientId] = false;
          }
        })
      );

      setWaterData(newWaterData);
      console.log("Updated Water Data:", newWaterData);
    } catch (error) {
      console.error("Error fetching water data:", error);
    }
  };

  const fetchExerciseDataForAllPatients = async (selectedDate: Date) => {
    try {
      const formattedDate = selectedDate.toISOString().split("T")[0];
      const newExerciseData: Record<string, boolean> = {};

      await Promise.all(
        patientIds.map(async (patientId) => {
          try {
            const response = await axios.get(
              `https://indheart.pinesphere.in/patient/patient/${patientId}/all-dailyexercise-data/${formattedDate}/`
            );
            console.log(`Response for patient ${patientId} (Exercise):`, response.data);
            newExerciseData[patientId] = response.data.exists;
          } catch (error) {
            console.error(`Error fetching exercise data for patient ${patientId}:`, error);
            newExerciseData[patientId] = false;
          }
        })
      );

      setExerciseData(newExerciseData);
      console.log("Updated Exercise Data:", newExerciseData);
    } catch (error) {
      console.error("Error fetching exercise data:", error);
    }
  };

  const fetchWalkingDataForAllPatients = async (selectedDate: Date) => {
    try {
      const formattedDate = selectedDate.toISOString().split("T")[0];
      const newWalkingData: Record<string, boolean> = {};

      await Promise.all(
        patientIds.map(async (patientId) => {
          try {
            const response = await axios.get(
              `https://indheart.pinesphere.in/patient/patient/${patientId}/all-walking-data/${formattedDate}/`
            );
            console.log(`Response for patient ${patientId} (Walking):`, response.data);
            newWalkingData[patientId] = response.data.exists;
          } catch (error) {
            console.error(`Error fetching walking data for patient ${patientId}:`, error);
            newWalkingData[patientId] = false;
          }
        })
      );

      setwalkData(newWalkingData);
      console.log("Updated Walking Data:", newWalkingData);
    } catch (error) {
      console.error("Error fetching walking data:", error);
    }
  };

  const fetchYogaDataForAllPatients = async (selectedDate: Date) => {
    try {
      const formattedDate = selectedDate.toISOString().split("T")[0];
      const newYogaData: Record<string, boolean> = {};

      await Promise.all(
        patientIds.map(async (patientId) => {
          try {
            const response = await axios.get(
              `https://indheart.pinesphere.in/patient/patient/${patientId}/all-yoga-data/${formattedDate}/`
            );
            console.log(`Response for patient ${patientId} (Yoga):`, response.data);
            newYogaData[patientId] = response.data.exists;
          } catch (error) {
            console.error(`Error fetching yoga data for patient ${patientId}:`, error);
            newYogaData[patientId] = false;
          }
        })
      );

      setyogaData(newYogaData);
      console.log("Updated Yoga Data:", newYogaData);
    } catch (error) {
      console.error("Error fetching yoga data:", error);
    }
  };

  const fetchMedicineForAllPatients = async (selectedDate: Date) => {
    try {
      const formattedDate = selectedDate.toISOString().split("T")[0];
      const newMedicineData: Record<string, boolean> = {};

      await Promise.all(
        patientIds.map(async (patientId) => {
          try {
            const response = await axios.get(
              `https://indheart.pinesphere.in/patient/patient/${patientId}/all-medicine-data/${formattedDate}/`
            );
            console.log(`Response for patient ${patientId} (Medicine):`, response.data);
            newMedicineData[patientId] = response.data.exists;
          } catch (error) {
            console.error(`Error fetching medicine data for patient ${patientId}:`, error);
            newMedicineData[patientId] = false;
          }
        })
      );

      setmedicineData(newMedicineData);
      console.log("Updated Medicine Data:", newMedicineData);
    } catch (error) {
      console.error("Error fetching medicine data:", error);
    }
  };

  const fetchLifestyleForAllPatients = async (selectedDate: Date) => {
    try {
      const formattedDate = selectedDate.toISOString().split("T")[0];
      const newLifestyleData: Record<string, boolean> = {};

      await Promise.all(
        patientIds.map(async (patientId) => {
          try {
            const response = await axios.get(
              `https://indheart.pinesphere.in/patient/patient/${patientId}/all-lifestyle-data/${formattedDate}/`
            );
            console.log(`Response for patient ${patientId} (Lifestyle):`, response.data);
            newLifestyleData[patientId] = response.data.exists;
          } catch (error) {
            console.error(`Error fetching lifestyle data for patient ${patientId}:`, error);
            newLifestyleData[patientId] = false;
          }
        })
      );

      setlifestyleData(newLifestyleData);
      console.log("Updated Lifestyle Data:", newLifestyleData);
    } catch (error) {
      console.error("Error fetching lifestyle data:", error);
    }
  };

  const filteredData = patientIds
    .filter((patientId) => {
      // Only include patients with the selected ID
      return selectedPatientId ? patientId === selectedPatientId : true;
    })
    .map((patientId) => ({
      patientId: patientId,
      hasSleepData: sleepData[patientId] || false,
      hasVegData: vegData[patientId] || false,
      hasNonVegData: nonvegData[patientId] || false,
      hasWaterData: waterData[patientId] || false,
      hasExerciseData: exerciseData[patientId] || false,
      hasWalkData: walkData[patientId] || false,
      hasYogaData: yogaData[patientId] || false,
      hasMedicineData: medicineData[patientId] || false,
      hasLifestyleData: lifestyleData[patientId] || false,
    }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate("AdminDashboardPage")}
        >
          <Ionicons name="arrow-back" size={20} color="black" />
        </TouchableOpacity>

        <Text style={styles.title}>Patient Daily Log</Text>

        <TouchableOpacity
          style={styles.clearFilterButton}
          onPress={onClearFilter}
        >
          <Text style={styles.clearFilterText}>Clear Filter</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.downloadButton}
          onPress={handleExportPatientDataDownload}
        >
          <Image
            source={require("../../assets/images/excel.png")}
            style={styles.excelImage}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={styles.input}
        >
          <Text>
            {selectedPatientId ? selectedPatientId : "Select Patient ID"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={showPicker} style={styles.dateInput}>
          <Text style={styles.dateText}>{date.toLocaleDateString()}</Text>
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={date}
          mode="date"
          is24Hour={true}
          display={Platform.OS === "ios" ? "inline" : "calendar"}
          onChange={onDateChange}
        />
      )}

      {modalVisible && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalContainer}
            onPress={() => setModalVisible(false)}
          >
            <TouchableOpacity style={styles.modalContent} activeOpacity={1}>
              <Text style={styles.modalTitle}>Select Patient ID</Text>
              <ScrollView style={styles.scrollView}>
                {patientIds.map((patientId) => (
                  <TouchableOpacity
                    key={patientId}
                    style={styles.modalItem}
                    onPress={() => handlePatientSelect(patientId)}
                  >
                    <Text>{patientId}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      )}

      {/* Scrollable Table */}
      <ScrollView
        horizontal
        style={{ flexGrow: 1 }}
        showsHorizontalScrollIndicator={true}
        showsVerticalScrollIndicator={true}
      >
        <ScrollView
          style={styles.tableContainer}
          contentContainerStyle={{ flexGrow: 1 }}
          showsHorizontalScrollIndicator={true}
          showsVerticalScrollIndicator={true}
        >
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              {[
                "Patient ID",
                "Sleep",
                "Food (Veg)",
                "Food (NV)",
                "Water",
                "Exercise",
                "Medication",
                "Walk",
                "Yoga",
                "Lifestyle",
              ].map((header) => (
                <Text key={header} style={styles.tableHeaderText}>
                  {header}
                </Text>
              ))}
            </View>
            {filteredData.map((row, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableRowText}>{row.patientId}</Text>

                {/* Each Image will be wrapped in a View for better alignment */}
                <View style={styles.imageContainer}>
                  <Image  
                      key={row.hasSleepData.toString()} 

                    source={
                      row.hasSleepData
                        ? require("../../assets/images/check.png")
                        : require("../../assets/images/cross.png")
                    }
                    style={styles.statusImage}
                  />
                </View>

                <View style={styles.imageContainer}>
                
                  <Image
                    key={row.hasVegData.toString()}
                    source={
                      row.hasVegData
                        ? require("../../assets/images/check.png")
                        : require("../../assets/images/cross.png")
                    }
                    style={styles.statusImage}
                  />
                </View>

                <View style={styles.imageContainer}>
                  <Image
                    key={row.hasNonVegData.toString()}
                    source={
                      row.hasNonVegData
                        ? require("../../assets/images/check.png")
                        : require("../../assets/images/cross.png")
                    }
                    style={styles.statusImage}
                  />
                </View>

                <View style={styles.imageContainer}>
                  <Image
                    key={row.hasWaterData.toString()}
                    source={
                      row.hasWaterData
                        ? require("../../assets/images/check.png")
                        : require("../../assets/images/cross.png")
                    }
                    style={styles.statusImage}
                  />
                </View>

                <View style={styles.imageContainer}>
                  <Image
                    key={row.hasExerciseData.toString()}
                    source={
                      row.hasExerciseData
                        ? require("../../assets/images/check.png")
                        : require("../../assets/images/cross.png")
                    }
                    style={styles.statusImage}
                  />
                </View>

                <View style={styles.imageContainer}>
                  <Image
                    key={row.hasMedicineData.toString()}
                    source={
                      row.hasMedicineData
                        ? require("../../assets/images/check.png")
                        : require("../../assets/images/cross.png")
                    }
                    style={styles.statusImage}
                  />
                </View>
                <View style={styles.imageContainer}>
                  <Image
                    key={row.hasWalkData.toString()}
                    source={
                      row.hasWalkData
                        ? require("../../assets/images/check.png")
                        : require("../../assets/images/cross.png")
                    }
                    style={styles.statusImage}
                  />
                </View>

                <View style={styles.imageContainer}>
                  <Image
                    key={row.hasYogaData.toString()}
                    source={
                      row.hasYogaData
                        ? require("../../assets/images/check.png")
                        : require("../../assets/images/cross.png")
                    }
                    style={styles.statusImage}
                  />
                </View>

                <View style={styles.imageContainer}>
                  <Image
                    key={row.hasLifestyleData.toString()}
                    source={
                      row.hasLifestyleData
                        ? require("../../assets/images/check.png")
                        : require("../../assets/images/cross.png")
                    }
                    style={styles.statusImage}
                  />
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#fff",
    marginTop: 50,
    
  },
  statusText: {
    fontSize: 14,
    color: "#000",
    textAlign: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  downloadButton: {
    marginLeft: "auto",
    marginRight: 5,
  },
  excelImage: {
    width: 24,
    height: 24,
  },
  dateInput: {
    height: 40,
    borderColor: "#c5c5c5",
    borderWidth: 1,
    borderRadius: 30,
    paddingHorizontal: 15,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
    flex: 1,
  },
  input: {
    height: 40,
    flex: 1,
    borderColor: "#c5c5c5",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 20,
    justifyContent: "center", // Centers the text vertically
    alignItems: "center", // Centers the text horizontally
  },
  tableContainer: {
    marginTop: 15,
    flexGrow: 1,
    width: "100%",
  },
  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#c5c5c5",
    borderRadius: 30,

    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f2f2f2",
    padding: 10,
    justifyContent: "space-between",
    alignItems: "center",
  },
  tableHeaderText: {
    flex: 1,
    padding: 5,
    fontWeight: "bold",
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 5,
  },
  tableRow: {
    flexDirection: "row",
    padding: 5,
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginHorizontal: -3,
  },
  tableRowText: {
    fontSize: 14,
    color: "#000",
    flex: 1,
    padding: 5,
    justifyContent: "center", // Center the content vertically
    alignItems: "center",
    marginHorizontal: 8,
  },
  imageContainer: {
    flex: 1,
    justifyContent: "center", // Center the images vertically
    alignItems: "center", // Center the images horizontally
  },

  statusImage: {
    width: 20, // Adjust the width of the images
    height: 20, // Adjust the height of the images
    resizeMode: "contain",
    marginHorizontal: 27,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 20,
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 15,
  },
  dateText: {
    textAlign: "center",
    color: "#333",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
  },
  modalContent: {
    width: "70%",
    maxHeight: 300, // Set a maximum height
    backgroundColor: "white",
    borderRadius: 50,
    padding: 30,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  patientItem: {
    padding: 10,
  },
  patientText: {
    fontSize: 16,
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#007BFF",
    borderRadius: 5,
    alignItems: "center",
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
  },

  scrollView: {
    maxHeight: 150, // Adjust as needed
  },
  modalItem: {
    padding: 10,
  },
  button: {
    backgroundColor: "#007BFF", // Example color
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff", // Text color
    fontSize: 16,
  },
  clearFilterButton: {
    marginLeft: 25,
    padding: 8,
    backgroundColor: "#f46060",
    borderRadius: 50,
    // iOS shadow properties
    shadowColor: "#000", // Color of the shadow
    shadowOffset: {
      // Offset of the shadow
      width: 0, // Horizontal offset
      height: 2, // Vertical offset
    },
    shadowOpacity: 0.25, // Opacity of the shadow
    shadowRadius: 4, // Blur radius of the shadow

    // Android shadow property
    elevation: 5,
  },
  clearFilterText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default PatientDailyLogScreen;