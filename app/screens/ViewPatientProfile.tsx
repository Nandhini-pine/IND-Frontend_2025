import React, { useEffect, useState } from "react";
import {
  View,
  Text as RNText,
  StyleSheet,
  Image,
  ActivityIndicator,
  ScrollView,
  Platform,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import axios from "axios";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../type"; // Adjust path as needed
import { Ionicons } from "@expo/vector-icons";

// Custom Text component to disable font scaling globally
const Text = (props: any) => {
  return <RNText {...props} allowFontScaling={false} />;
};

type ViewPatientProfileNavigationProp = StackNavigationProp<
  RootStackParamList,
  "PatientDashboardPage"
>;

const ViewPatientProfile: React.FC = () => {
  const navigation = useNavigation<ViewPatientProfileNavigationProp>();
  const route = useRoute();
  const { patientID } = route.params as { patientID: string };

  const [patientData, setPatientData] = useState<any>(null);
  const [clinicalData, setClinicalData] = useState<any[]>([]);
  const [metabolicData, setMetabolicData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const response = await axios.get(
          `https://indheart.pinesphere.in/api/api/patients/${patientID}/`
        );
        setPatientData(response.data);
        // Fetch related data after patient data is loaded
        await fetchClinicalData();
        await fetchMetabolicData();
      } catch (error) {
        setError("Failed to load patient data");
      } finally {
        setLoading(false);
      }
    };

    const fetchClinicalData = async () => {
      try {
        const response = await axios.get(
          `https://indheart.pinesphere.in/api/api/clinical-data/?patient_id=${patientID}`
        );
        setClinicalData(response.data);
      } catch (error) {
        setError("Failed to load clinical data");
      }
    };

    const fetchMetabolicData = async () => {
      try {
        const response = await axios.get(
          `https://indheart.pinesphere.in/api/api/metabolic-data/?patient_id=${patientID}`
        );
        setMetabolicData(response.data);
      } catch (error) {
        setError("Failed to load metabolic data");
      }
    };

    if (patientID) {
      fetchPatientData();
    } else {
      setError("Patient ID is undefined");
    }
  }, [patientID]);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (error) {
    return <Text>{error}</Text>;
  }

  if (!patientData) {
    return <Text>No data available</Text>;
  }

  return (
    <View style={styles.mainContainer}>
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
      {/* Static Header */}
      <View style={styles.headerContainer}>
        {/* <Text style={styles.title}>General Details</Text> */}
      </View>

      {/* Scrollable Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Cover Container */}
        <View style={styles.coverContainer}>
          <Image
            source={require("../../assets/images/vvv.jpg")}
            style={styles.vectorImage}
          />
        </View>

        {/* Profile Container */}
        <View style={styles.profileContainer}>
          {/* Patient Details */}
          <View style={styles.detailsContainer}>
            {/* Profile Picture and Name */}
            <View style={styles.profileRow}>
              <View style={styles.profilePicContainer}>
                <Image
                  source={require("../../assets/images/heartPro.jpg")}
                  style={styles.profilePic}
                />
              </View>
              <Text style={styles.nameText}>{patientData.name}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.rowLabel}>Patient ID:</Text>
              <Text style={styles.rowValue}>{patientData.patient_id}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Age:</Text>
              <Text style={styles.rowValue}>{patientData.age}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Gender:</Text>
              <Text style={styles.rowValue}>{patientData.gender}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Education:</Text>
              <Text style={styles.rowValue}>{patientData.education}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Occupation:</Text>
              <Text style={styles.rowValue}>{patientData.occupation}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Marital Status:</Text>
              <Text style={styles.rowValue}>{patientData.marital_status}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Diet:</Text>
              <Text style={styles.rowValue}>{patientData.diet}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Smoking:</Text>
              <Text style={styles.rowValue}>
                {patientData.smoking ? "Yes" : "No"}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Alcoholic:</Text>
              <Text style={styles.rowValue}>
                {patientData.alcoholic ? "Yes" : "No"}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Patient contact number:</Text>
              <Text style={styles.rowValue}>
                {patientData.patient_contact_number}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Emergency doctor number:</Text>
              <Text style={styles.rowValue}>
                {patientData.emergency_doctor_number}
              </Text>
            </View>
          </View>

          {/* Clinical Data */}

          <View style={styles.detailsContainer}>
            <Text style={styles.sectionHeader}>Clinical Data</Text>
            {clinicalData.length > 0 ? (
              clinicalData.map((data: any, index: number) => (
                <View key={index}>
                  <View style={styles.row}>
                    <Text style={styles.rowLabel}>Duration of CAD:</Text>
                    <Text style={styles.rowValue}>
                      {data.cad_duration || "N/A"}
                    </Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.rowLabel}>
                      Number of Stents Placed:
                    </Text>
                    <Text style={styles.rowValue}>
                      {data.stents_placed || "N/A"}
                    </Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.rowLabel}>Ejection Fraction (EF):</Text>
                    <Text style={styles.rowValue}>
                      {data.ejection_fraction || "N/A"}
                    </Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.rowLabel}>Vessels Involved:</Text>
                    <Text style={styles.rowValue}>
                      {data.vessels_involved || "N/A"}
                    </Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.rowLabel}>Co-morbidities:</Text>
                    <Text style={styles.rowValue}>
                      {data.comorbidities || "N/A"}
                    </Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.rowLabel}>
                      Duration of Comorbidities:
                    </Text>
                    <Text style={styles.rowValue}>
                      {data.duration_of_comorbidities || "N/A"}
                    </Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.rowLabel}>Next Follow-Up Date:</Text>
                    <Text style={styles.rowValue}>
                      {data.next_follow_up_date || "N/A"}
                    </Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.rowLabel}>Date of Operation:</Text>
                    <Text style={styles.rowValue}>
                      {data.date_of_operation || "N/A"}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <Text>No Clinical data available</Text>
            )}
          </View>

          {/* Metabolic Data */}

          <View style={styles.detailsContainer}>
            <Text style={styles.sectionHeader}>Metabolic Data</Text>
            {metabolicData.length > 0 ? (
              metabolicData.map((data: any, index: number) => (
                <View key={index}>
                  <View style={styles.row}>
                    <Text style={styles.rowLabel}>Height:</Text>
                    <Text style={styles.rowValue}>{data.height || "N/A"}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.rowLabel}>Weight:</Text>
                    <Text style={styles.rowValue}>{data.weight || "N/A"}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.rowLabel}>BMI:</Text>
                    <Text style={styles.rowValue}>{data.bmi || "N/A"}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.rowLabel}>Waist Circumference:</Text>
                    <Text style={styles.rowValue}>
                      {data.waist_circumference || "N/A"}
                    </Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.rowLabel}>Hip Circumference:</Text>
                    <Text style={styles.rowValue}>
                      {data.hip_circumference || "N/A"}
                    </Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.rowLabel}>Blood Pressure (BP):</Text>
                    <Text style={styles.rowValue}>{data.sbp || "N/A"}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.rowLabel}>
                      Fasting Blood Sugar (FBS):
                    </Text>
                    <Text style={styles.rowValue}>{data.fbs || "N/A"}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.rowLabel}>
                      Diastolic Blood Pressure (DBP):
                    </Text>
                    <Text style={styles.rowValue}>{data.dbp || "N/A"}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.rowLabel}>
                      Low-Density Lipoprotein (LDL):
                    </Text>
                    <Text style={styles.rowValue}>{data.ldl || "N/A"}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.rowLabel}>
                      High-Density Lipoprotein (HDL):
                    </Text>
                    <Text style={styles.rowValue}>{data.hdl || "N/A"}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.rowLabel}>Triglycerides:</Text>
                    <Text style={styles.rowValue}>
                      {data.triglycerides || "N/A"}
                    </Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.rowLabel}>Total Cholesterol:</Text>
                    <Text style={styles.rowValue}>
                      {data.total_cholesterol || "N/A"}
                    </Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.rowLabel}>
                      6 Minutes Walk Test Meters:
                    </Text>
                    <Text style={styles.rowValue}>
                      {data.meters_walked || "N/A"}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <Text>No Metabolic data available</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    zIndex: 100,
    marginTop: 0,
  },
  backIconContainer: {
    position: "absolute", // Position the back button container absolutely
    top: 15,
    left: 15,
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
    marginTop: 50,
    marginLeft: 10,
    zIndex: 10,
  },
  top: {
    position: "absolute",
    backgroundColor: "#000",
  },
  mainContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  headerContainer: {
    paddingTop: Platform.OS === "ios" ? 30 : 30, // Adjust for iOS and Android
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    paddingVertical: 10,
    width: "100%",
    position: "absolute",
    top: 0,
    zIndex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#36454F",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingTop: 70, // Adjust to avoid overlap with the static header
    paddingBottom: 20,
  },
  coverContainer: {
    height: 230,
    bottom: 60,
    marginTop: 30,
    padding: 10,
    alignItems: "center",
    borderRadius: 30, // Border radius for the container
    //overflow: "hidden", // Ensures the image follows the container's border radius
  },

  vectorImage: {
    width: "100%", // Ensures the image fills the container width
    height: "75%", // Ensures the image fills the container height
    borderRadius: 30, // Apply border radius to the image itself
  },

  profileContainer: {
    bottom: 35,
  },

  profilePicContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "transparent",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15, // Space between profile picture and text field
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    width: "100%",
  },
  /* profilePicContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#fff',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15, // Space between profile picture and text field
  }, */
  profilePic: {
    width: "100%",
    height: "90%",
    borderRadius: 50,
  },
  nameText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  detailsContainer: {
    width: "98%",
    alignSelf: "center",
    borderRadius: 40,
    backgroundColor: "#f3f3f3",
    paddingTop: 20,
    paddingBottom: 20,
    paddingRight: 10,
    paddingLeft: 10,
    marginTop: -70,
    marginBottom: -45,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    height: 40,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  rowLabel: {
    fontSize: 16,
    color: "#333",
  },
  rowValue: {
    fontSize: 16,
    color: "#666",
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#444",
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
});

export default ViewPatientProfile;
