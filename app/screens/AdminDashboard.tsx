import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text as RNText,
  StyleSheet,
  Platform,
  Image,
  TouchableOpacity,
  ScrollView,
  Animated,
  StatusBar,
  SafeAreaView,
} from "react-native";
import Constants from "expo-constants";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../type";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Custom Text component to disable font scaling globally
const Text = (props: any) => {
  return <RNText {...props} allowFontScaling={false} />;
};

type AdminDashboardPageNavigationProp = StackNavigationProp<
  RootStackParamList,
  "AdminDashboardPage"
>;

const AdminDashboardPage: React.FC = () => {
  const navigation = useNavigation<AdminDashboardPageNavigationProp>();

  // State for menu panel visibility
  const [menuVisible, setMenuVisible] = useState(false);

  // Animated value for menu panel sliding
  const menuAnim = useRef(new Animated.Value(-250)).current;

  // Animated value for pulsing effect
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const [metrics, setMetrics] = useState({
    total_patients: 0,
    active_patients: 0,
    inactive_patients: 0,
    patient_logs: 0,
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch(
          "https://vs3k4b04-8000.inc1.devtunnels.ms/api/metrics/"
        );
        const data = await response.json();
        setMetrics(data);
      } catch (error) {
        console.error("Error fetching metrics:", error);
      }
    };

    fetchMetrics();
  }, []);

  // Function to handle logout
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("authToken");
      navigation.reset({
        index: 0,
        routes: [{ name: "LoginPage" }],
      });
    } catch (error) {
      console.log("Error during logout:", error);
    }
  };

  // Navigate to various pages
  const navigateToAddPatientProfile = () => {
    navigation.navigate("AddPatientProfile");
  };

  const navigateToViewPatientTablePage = () => {
    navigation.navigate("ViewPatientTablePage");
  };

  const navigateToLoginPage = () => {
    navigation.navigate("LoginPage");
  };

  const navigateToAddClinicalProfilePage = () => {
    navigation.navigate("AddClinicalProfilePage");
  };

  const navigateToAddMetabolicProfilePage = () => {
    navigation.navigate("AddMetabolicProfilePage");
  };

  // Handle avatar click to toggle menu panel
  const handleAvatarClick = () => {
    setMenuVisible(!menuVisible);
    Animated.timing(menuAnim, {
      toValue: menuVisible ? -250 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleCloseMenu = () => {
    console.log("Closing menu"); // Debugging message
    setMenuVisible(false);
    menuAnim.setValue(-1000); // Ensure menu is off-screen
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Adjust StatusBar visibility */}
      <StatusBar
        barStyle="dark-content" // Set the color of status bar text
        backgroundColor="transparent" // Make the background transparent
        translucent={true} // Make status bar translucent
      />
      <View style={styles.mainContainer}>
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={handleAvatarClick}>
            <Image
              source={require("../../assets/images/admin.png")}
              style={styles.avatar}
            />
          </TouchableOpacity>

          <Text style={styles.profileText}>Hi, Admin!</Text>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <MaterialIcons name="logout" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        <Animated.View
          style={[styles.menuPanel, { transform: [{ translateX: menuAnim }] }]}
        >
          {/* Profile Container */}
          <View style={styles.profileContainer}>
            <TouchableOpacity onPress={handleAvatarClick}>
              <Image
                source={require("../../assets/images/admin.png")}
                style={styles.avatar}
              />
            </TouchableOpacity>
            <Text style={styles.profileName}>Admin</Text>
          </View>

          {/* Close Icon to minimize/close the menu panel */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleCloseMenu}
          >
            <MaterialIcons name="close" size={18} color="#333" />
          </TouchableOpacity>

          {/* Menu Items */}
          <TouchableOpacity
            onPress={() => {
              setMenuVisible(false);
              navigation.navigate("AddPatientProfile"); // Navigate to AddPatientProfile screen
            }}
            style={styles.menuItem}
          >
            <MaterialIcons name="assignment" size={24} color="#CD5C5C" />
            <Text style={styles.menuText}>Patient Forms</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setMenuVisible(false);
              navigation.navigate("ViewPatientTablePage"); // Navigate to ViewPatientTablePage screen
            }}
            style={styles.menuItem}
          >
            <MaterialIcons name="history" size={24} color="#CD5C5C" />
            <Text style={styles.menuText}>Patient Logs</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setMenuVisible(false);
              console.log("Navigating to MedicationManager");
              navigation.navigate("MedicationManager");
            }}
            style={styles.menuItem}
          >
            <MaterialIcons name="local-pharmacy" size={24} color="#CD5C5C" />
            <Text style={styles.menuText}>Prescription Manager</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setMenuVisible(false);
              navigation.navigate("PatientDailyLogTableScreen");
            }}
            style={styles.menuItem}
          >
            <MaterialIcons name="note" size={24} color="#CD5C5C" />
            <Text style={styles.menuText}>Patient Daily Logs</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setMenuVisible(false);
              navigation.navigate("ReviewFeedbackScreen");
            }}
            style={styles.menuItem}
          >
            <MaterialIcons name="support-agent" size={24} color="#CD5C5C" />
            <Text style={styles.menuText}>Feedback</Text>
          </TouchableOpacity>
        </Animated.View>

        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topImageContainer}>
            <Image
              source={require("../../assets/images/aa.jpg")}
              style={styles.profileImage}
            />
          </View>

          <View style={styles.tilesSection}>
            <Text style={styles.tileTitle}>User Metrics</Text>
            <View style={styles.tilesContainer}>
              <TouchableOpacity
                style={[styles.tile, styles.tile1]}
                onPress={() => navigation.navigate("ViewPatientTablePage")}
              >
                <Text style={styles.largeNumber}>{metrics.total_patients}</Text>
                <Text style={styles.tileLabel}>Total Users</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tile, styles.tile2]}
                onPress={() => navigation.navigate("ViewPatientTablePage")}
              >
                <Text style={styles.largeNumber}>
                  {metrics.active_patients}
                </Text>
                <Text style={styles.tileLabel}>Active Users</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tile, styles.tile3]}
                onPress={() => navigation.navigate("ViewPatientTablePage")}
              >
                <Text style={styles.largeNumber}>
                  {metrics.inactive_patients}
                </Text>
                <Text style={styles.tileLabel}>Inactive Users</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tile, styles.tile4]}
                onPress={() =>
                  navigation.navigate("PatientDailyLogTableScreen")
                }
              >
                <Text style={styles.largeNumber}>{metrics.patient_logs}</Text>
                <Text style={styles.tileLabel}>User Logs</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.patientData}>
            <Text style={styles.sectionTwo}>Patient Data</Text>
            <View style={styles.tilesRow}>
              <View style={styles.userContainer}>
                <Image
                  source={require("../../assets/images/adduser.jpg")}
                  style={styles.userImage}
                />
                <Text style={styles.cardText}>Patient Profile</Text>
                <TouchableOpacity
                  style={styles.button}
                  onPress={navigateToAddPatientProfile}
                >
                  <Text style={styles.buttonText}>Add</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.clinicalContainer}>
                <Image
                  source={require("../../assets/images/clinical.jpg")}
                  style={styles.userImage}
                />
                <Text style={styles.cardText}>Clinical Info</Text>
                <TouchableOpacity
                  style={styles.button}
                  onPress={navigateToAddClinicalProfilePage}
                >
                  <Text style={styles.buttonText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.tilesRow}>
              <View style={styles.metabolicContainer}>
                <Image
                  source={require("../../assets/images/metabolic.jpg")}
                  style={styles.userImage}
                />
                <Text style={styles.cardText}>Metabolic Info</Text>
                <TouchableOpacity
                  style={styles.button}
                  onPress={navigateToAddMetabolicProfilePage}
                >
                  <Text style={styles.buttonText}>Add</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.logContainer}>
                <Image
                  source={require("../../assets/images/logs.png")}
                  style={styles.userImage}
                />
                <Text style={styles.cardText}>Log Information</Text>
                <TouchableOpacity
                  style={styles.button}
                  onPress={navigateToViewPatientTablePage}
                >
                  <Text style={styles.buttonText}>View</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerContainer: {
    //paddingTop: 50,
    paddingTop: Constants.statusBarHeight + 10, // Adjusts based on device's status bar height
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginBottom: -6,
    backgroundColor: "transparent",
    paddingHorizontal: 10,
    width: "100%",
    shadowColor: "#000",
  },
  logoutButton: {
    zIndex: 10,
    position: "absolute",
    top: 56,
    left: "91%",
    padding: 5,
    marginBottom: 20,
    backgroundColor: "#f60c6a",
    borderRadius: 20,
    // iOS shadow properties
    shadowColor: "#000",
    shadowOffset: {
      // Offset of the shadow
      width: 0,
      height: 4, // Vertical offset
    },
    shadowOpacity: 0.25, // Opacity of the shadow
    shadowRadius: 4, // Blur radius of the shadow

    // Android shadow property
    elevation: 5,
    marginTop: 10,
  },
  profileText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#36454F",
    marginLeft: 5,
    top: 0,
    marginTop: 10,
    marginBottom: 5,
  },
  avatar: {
    width: 40,
    height: 38,
    borderRadius: 40,
    backgroundColor: "transparent",
    marginRight: 7,
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 5,
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: "center",
    paddingBottom: 20,
  },
  topImageContainer: {
    height: 260,
    width: "100%",
    alignSelf: "center",
    marginBottom: 5,
    marginTop: 10,
    backgroundColor: "#transparent",
    position: "relative",
    overflow: "hidden",
    bottom: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  profileImage: {
    width: "95%",
    height: "90%",
    padding: 10,
    borderRadius: 30,
    top: 0,
    bottom: 20,
    left: 0,
    resizeMode: "cover",
  },

  sectionTwo: {
    fontSize: 20,
    fontWeight: "700",
    color: "#36454F",
    marginVertical: 10,
    paddingBottom: 5,
    bottom: 50,
  },

  cardText: {
    fontSize: 16,
    fontWeight: "600",
    top: 10,
  },
  tilesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 5,

    bottom: 80,
  },
  patientData: {
    backgroundColor: "#fff",
    marginTop: 25, // Set to 0 to reduce space above
    marginBottom: -60, // Ensure there's no margin below
    paddingBottom: 0, // Ensure there's no padding below
    alignItems: "center",
  },

  userContainer: {
    width: 180,
    height: 150,
    backgroundColor: "#fff",
    borderRadius: 35,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.9,
    shadowRadius: 5,
    elevation: 5,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5,
    marginVertical: 10,
  },
  clinicalContainer: {
    width: 180,
    height: 150,
    backgroundColor: "#fff",
    borderRadius: 35,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.9,
    shadowRadius: 5,
    elevation: 5,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5,
    marginVertical: 50,
  },
  metabolicContainer: {
    width: 180,
    height: 150,
    backgroundColor: "#fff",
    borderRadius: 35,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.9,
    shadowRadius: 5,
    elevation: 5,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5,
    marginVertical: 5,
  },
  logContainer: {
    width: 180,
    height: 150,
    backgroundColor: "#fff",
    borderRadius: 35,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.9,
    shadowRadius: 5,
    elevation: 5,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5,
    marginVertical: 10,
  },
  userImage: {
    width: 120,
    height: 120,
    borderRadius: 30,
  },

  button: {
    width: "55%",
    paddingVertical: 10,
    backgroundColor: "#36454F",
    borderRadius: 20,
    marginTop: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },

  tilesSection: {
    padding: 5,
    backgroundColor: "transparent",
    paddingBottom: Platform.OS === "ios" ? 50 : 30,
    bottom: 20,
  },
  tileTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
    textAlign: "center",
    top: 10,
  },
  tilesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    marginVertical: 5,
    paddingHorizontal: 2,
    top: 15,
  },
  tile: {
    width: "45%",
    height: 120,
    borderRadius: 20,
    padding: 5,
    margin: 5,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tile1: {
    backgroundColor: "#FF5733",
  },
  tile2: {
    backgroundColor: "#1E90FF",
  },
  tile3: {
    backgroundColor: "#4db6ac",
  },
  tile4: {
    backgroundColor: "#cbb537",
  },
  largeNumber: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
  },
  tileLabel: {
    fontSize: 16,
    color: "#fff",
  },
  menuPanel: {
    position: "absolute",

    top: 0,
    left: 0,
    width: 230,
    borderTopRightRadius: 70,
    borderBottomRightRadius: 70,
    height: "100%",
    backgroundColor: "#f0e9e9",
    padding: 20,
    zIndex: 1000,

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
    elevation: 5, // Elevation value for Android shadow
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 15,
    marginHorizontal: 3,
    top: 60,
  },
  menuText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 15,
  },
  closeButton: {
    position: "absolute",
    top: 60,
    right: 10,
    padding: 10,
    borderRadius: 50,
  },
  profileContainer: {
    padding: 16,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    marginBottom: 10,
    top: 40,
    borderRadius: 30,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
    color: "#333",
    right: 5,
  },
});

export default AdminDashboardPage;
