import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text as RNText,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Image,
  Alert,
  Platform,
  Modal,
} from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { RootStackParamList } from "../../type"; // Adjust path as needed
import axios from "axios";
import { MaterialCommunityIcons } from "@expo/vector-icons"; // Add this for Excel icon
import Icon from "react-native-vector-icons/FontAwesome";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Buffer } from "buffer"; // Import buffer from npm
import CustomAlert from "../components/CustomAlert";
import { PermissionsAndroid } from "react-native";
import { check, request, PERMISSIONS, RESULTS } from "react-native-permissions";

// Custom Text component to disable font scaling globally
const Text = (props: any) => {
  return <RNText {...props} allowFontScaling={false} />;
};

// Define the navigation prop type
type ViewPatientTablePageNavigationProp = NavigationProp<
  RootStackParamList,
  "ViewPatientTablePage"
>;

interface PatientProfile {
  patient_id: string;
  name: string;
  age: number | string; // Adjust based on your actual data
  // Add other fields as needed
}

const ViewPatientTablePage: React.FC = () => {
  const [patientProfiles, setPatientProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation<ViewPatientTablePageNavigationProp>();
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [deleteAlertVisible, setDeleteAlertVisible] = useState(false);
  const [deletePatientID, setDeletePatientID] = useState<string | null>(null); // Store patientID for deletion

  const jumpAnimation = useRef(new Animated.Value(0)).current;
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    console.log("Menu visible:", menuVisible); // Logs the value whenever it changes
  }, [menuVisible]); // Runs every time menuVisible changes

  useEffect(() => {
    const fetchPatientProfiles = async () => {
      try {
        const response = await axios.get(
          "https://indheart.pinesphere.in/api/api/patients/"
        ); // Adjust the URL to your API endpoint

        const sortedProfiles = response.data.sort(
          (a: PatientProfile, b: PatientProfile) => {
            // Extract numeric parts of patient IDs
            const idA = a.patient_id.match(/(\D+)(\d+)/);
            const idB = b.patient_id.match(/(\D+)(\d+)/);

            // Check if idA or idB match is null (for safety)
            if (!idA || !idB) {
              return 0; // or handle the case as you wish
            }

            // Compare the string parts first
            const prefixComparison = idA[1].localeCompare(idB[1]);
            if (prefixComparison !== 0) {
              return prefixComparison;
            }

            // If prefixes are the same, compare the numeric parts
            return parseInt(idA[2], 10) - parseInt(idB[2], 10);
          }
        );

        setPatientProfiles(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to load patient profiles:", error);
        setError("Failed to load patient profiles");
        setLoading(false);
      }
    };

    fetchPatientProfiles();

    Animated.loop(
      Animated.sequence([
        Animated.timing(jumpAnimation, {
          toValue: -30,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(jumpAnimation, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [jumpAnimation]);

  const handleEdit = () => {
    navigation.navigate("AddMetabolicProfilePage");
  };


  const handleExcelDownload = async () => {
    try {
      if (Platform.OS === "android") {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: "Storage Permission Required",
            message:
              "This app needs access to your storage to download the Excel file",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK",
          }
        );
  
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.log("Storage permission denied");
          setAlertTitle("Permission Denied");
          setAlertMessage("Storage permission is required to download the file.");
          return;
        }
      }
  
      const response = await axios.get(
        "https://indheart.pinesphere.in/api/patients/download/",
        { responseType: "arraybuffer" } // Use arraybuffer instead of blob
      );
  
      // Convert ArrayBuffer to Base64 string
      const base64Data = Buffer.from(response.data, "binary").toString("base64");
      // Create a file path
      const fileUri = FileSystem.documentDirectory + "patients.xlsx";
  
      // Write the file
      await FileSystem.writeAsStringAsync(fileUri, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });
  
      // Log the file path for debugging
      console.log("File saved to:", fileUri);
  
      // Share or open the file
      await Sharing.shareAsync(fileUri);
  
      setAlertTitle("Download Successful");
      setAlertMessage("Excel file has been downloaded.");
    } catch (error) {
      console.error("Failed to download Excel file:", error);
      setAlertTitle("Error");
      setAlertMessage("Failed to download Excel file.");
    }
  };

  /* const handleDelete = (patientID: string) => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this profile?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: async () => {
            try {
              await axios.delete(
                `https://indheart.pinesphere.in/api/api/patients/${patientID}/`
              ); // Adjust the URL to your API endpoint
              setPatientProfiles((prevProfiles) =>
                prevProfiles.filter(
                  (profile) => profile.patient_id !== patientID
                )
              );
            } catch (error) {
              console.error("Failed to delete patient profile:", error);
              Alert.alert("Error", "Failed to delete patient profile");
            }
          },
        },
      ]
    );
  }; */
  const handleDelete = (patientID: string) => {
    // Trigger the custom alert instead of the default Alert
    setDeletePatientID(patientID); // Store patientID for deletion
    setDeleteAlertVisible(true); // Show the custom alert
  };
  if (loading) {
    return <Text style={styles.loadingText}>Loading...</Text>;
  }

  if (error) {
    return <Text style={styles.errorText}>{error}</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <CustomAlert
        title="Confirm Deletion"
        message="Are you sure you want to delete this profile?"
        visible={deleteAlertVisible}
        onClose={() => setDeleteAlertVisible(false)} // Close the alert on close
        mode="confirm"
        onYes={async () => {
          try {
            if (deletePatientID) {
              await axios.delete(
                `https://indheart.pinesphere.in/api/api/patients/${deletePatientID}/`
              ); // Adjust the URL to your API endpoint
              setPatientProfiles((prevProfiles) =>
                prevProfiles.filter(
                  (profile) => profile.patient_id !== deletePatientID
                )
              );
            }
          } catch (error) {
            console.error("Failed to delete patient profile:", error);
            setAlertTitle("Error");
            setAlertMessage("Failed to delete patient profile");
          } finally {
            setDeleteAlertVisible(false); // Close the alert after handling the response
          }
        }}
        onNo={() => setDeleteAlertVisible(false)} // Close the alert on "No"
      />
      <TouchableOpacity
        style={styles.backButtonContainer}
        onPress={() => navigation.navigate("AdminDashboardPage")} // Navigate to AdminDashboard
      >
        <MaterialIcons name="arrow-back" size={20} color="#000" />
      </TouchableOpacity>

      {/* Header with Edit and Excel Download Icons */}
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Patient Logs</Text>
        <View style={styles.iconsContainer}>
          <View style={styles.iconBackground}>
            <TouchableOpacity onPress={handleEdit}>
              <Icon name="edit" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          <View style={styles.iconBackground}>
            <TouchableOpacity onPress={handleExcelDownload}>
              <Icon name="file-excel-o" size={22} color="#000" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.table}>
        <View style={styles.headerRow}>
          <Text style={styles.headerCell}>Patient ID</Text>
          <Text style={styles.headerCell}>Name</Text>
          <Text style={styles.headerCell}>Age</Text>
          <Text style={styles.headerCell}>Action</Text>
        </View>

        {patientProfiles.length > 0 ? (
          patientProfiles.map((patient, index) => {
            const age =
              typeof patient.age === "string"
                ? parseInt(patient.age, 10)
                : patient.age;

            return (
              <View key={index} style={styles.row}>
                <Text style={styles.cell}>{patient.patient_id}</Text>
                <Text style={styles.cell}>{patient.name}</Text>
                <Text style={styles.cell}>{age}</Text>
                <View style={styles.actionsContainer}>
                  <TouchableOpacity
                    style={styles.viewButton}
                    onPress={() =>
                      navigation.navigate("ViewPatientProfile", {
                        patientID: patient.patient_id,
                      })
                    }
                  >
                    <MaterialIcons
                      name="visibility"
                      size={20}
                      color="#1E90FF"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete(patient.patient_id)}
                  >
                    <MaterialIcons name="delete" size={20} color="#FF6347" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        ) : (
          <Text style={styles.noDataText}>No patient profiles found.</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 10,
    backgroundColor: "#ffffff",
    paddingTop: 60,
  },

  topLeftImageContainer: {
    position: "absolute",
    top: 60,
    right: 20,
    width: 100,
    height: 100,
    zIndex: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
    color: "#2a3439",
    marginTop: 5,
    flex: 1,
  },

  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 5,
    paddingHorizontal: 10,
    bottom: 45,
    right: 20,
  },

  iconsContainer: {
    flexDirection: "row",
    marginVertical: 5,
    justifyContent: "space-between",
    width: 60,
    right: 20,
  },

  iconBackground: {
    borderRadius: 60, // To make the background circular or rounded
    padding: 8, // Add padding to create space around the icon
    marginHorizontal: 8, // Space between individual icon containers
  },

  backButtonContainer: {
    flex: 0, // Ensures the back button stays compact
    justifyContent: "flex-start",
    backgroundColor: "#fff",
    borderRadius: 25,
    alignItems: "center",
    elevation: 10,
    zIndex: 10,
    padding: 7,
    width: "10%",
  },

  icon: {
    marginHorizontal: 10, // Space between individual icons
  },

  image: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },

  table: {
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
    elevation: 5,
    marginBottom: 5,
    bottom: 35,
    width: "100%",
    alignSelf: "center",
  },
  headerRow: {
    flexDirection: "row",
    backgroundColor: "#e0e0e0",
    paddingVertical: 10,
    paddingHorizontal: -5,
  },
  headerCell: {
    flex: 1,
    color: "#000",
    fontWeight: "bold",
    textAlign: "center",
    paddingVertical: 5,
  },
  row: {
    flexDirection: "row",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  cell: {
    flex: 1,
    textAlign: "center",
    marginLeft: -36,
    paddingHorizontal: -3,
  },
  viewButton: {
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  deleteButton: {
    justifyContent: "center",
    alignItems: "center",
    color: "#F08080",
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  noDataText: {
    textAlign: "center",
    fontSize: 18,
    marginTop: 50,
  },
  loadingText: {
    textAlign: "center",
    fontSize: 18,
    marginTop: 50,
  },
  errorText: {
    textAlign: "center",
    fontSize: 18,
    marginTop: 50,
    color: "red",
  },
  downloadContainer: {
    position: "absolute",
    top: 15,
    right: 20, // Adjust to avoid overlap with the back button
    padding: 5,
    width: 36,
    height: 36,
    borderRadius: 25,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10, // Ensure this button is on top
  },
  /* backButtonContainer: {
    position: "absolute",
    top: 15, // Ensure this is consistent
    left: 20,
    width: 30,
    height: 30,
    borderRadius: 25,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 10,
    zIndex: 10, // Ensure this button is on top as well
  }, */

  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Ensure the background has opacity
  },
  menuContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: 250,
    alignItems: "center",
  },
  menuItem: {
    padding: 10,
    flexDirection: "row", // Align items in a row
    alignItems: "center",
  },
  menuText: {
    fontSize: 16,
    textAlign: "center",
    marginLeft: 10,
  },
});

export default ViewPatientTablePage;
