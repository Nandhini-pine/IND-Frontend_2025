import React, { useState, useEffect } from "react";
import {
  View,
  Text as RNText,
  TextProps,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Dimensions,
  Linking,
  SafeAreaViewBase,
  StatusBar,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../type";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Icon from "react-native-vector-icons/MaterialIcons";
import texts from "../translation/texts";
import HealthActivityPopup from "../components/HealthActivityPopup";
import { SafeAreaProvider } from "react-native-safe-area-context";

// Custom Text component to disable font scaling globally
const Text = (props: TextProps) => {
  return <RNText {...props} allowFontScaling={false} />;
};


Icon.loadFont();

type PatientDashboardPageNavigationProp = StackNavigationProp<
  RootStackParamList,
  "PatientDashboardPage"
>;

interface PatientDetails {
  emergency_doctor_number: string;
  patient_id: string; // Ensure this is defined
  diet: string;
}
const screenWidth = Dimensions.get("window").width;

const PatientDashboardPage: React.FC = () => {
  const navigation = useNavigation<PatientDashboardPageNavigationProp>();
  const [currentIndex, setCurrentIndex] = useState(0);
  /*   const { t, i18n } = useTranslation();
   */ const [isTamil, setIsTamil] = useState(false);

  const [phoneNumber, setPhoneNumber] = useState("");
  const [patientDetails, setPatientDetails] = useState<PatientDetails | null>(
    null
  );
  const [popupVisible, setPopupVisible] = useState(false);

  const [isTranslatingToTamil, setIsTranslatingToTamil] = useState(true);
  const languageText = isTranslatingToTamil ? texts.english : texts.tamil;
  const [hasSleepData, setHasSleepData] = useState(false);
  const [waterIntake, setWaterIntake] = useState(0);
  const [hasvegDietData, setHasvegDietData] = useState(false);
  const [hasnonvegDietData, setHasnonvegDietData] = useState(false);
  const [WalkingData, setWalkingData] = useState(0);
  const [ExerciseData, setExerciseData] = useState(0);
  const [YogaData, setYogaData] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0); // State for notification count
  const [MedicineData, setMedicineData] = useState(0);
  const [LifestyleData, setLifestyleData] = useState(0);
  useEffect(() => {
    if (notificationCount > 0) {
      const intervalId = setInterval(() => {
        setPopupVisible(true);
        setTimeout(() => {
          setPopupVisible(false);
        }, 5000); 
      }, 60000);
   
      return () => clearInterval(intervalId); 
    }
  }, [notificationCount]);

  useEffect(() => {
    const intervalId = setInterval(async () => {
      // Perform your patient dashboard refresh logic here (e.g., fetch data, update state)
      console.log('Patient dashboard refreshed'); // Placeholder for now
    }, 30000); // 30000 milliseconds = 30 seconds

    return () => clearInterval(intervalId); // Cleanup interval on unmount
  }, []); // Empty dependency array to run only once

  useEffect(() => {
    const fetchNotificationCount = async () => {
      if (patientDetails) {
        try {
          console.log(
            "Fetching notification count for patient:",
            patientDetails.patient_id
          );
          const response = await axios.get(
            `https://vs3k4b04-8000.inc1.devtunnels.ms/patient/patient/${patientDetails.patient_id}/notification-count/`
          );
          console.log("Notification count response:", response.data); // Log the response for debugging
          setNotificationCount(response.data.notification_count); // Use notification_count from response
        } catch (error) {
          console.error("Error fetching notification count:", error);
        }
      } else {
        console.log("No patient details available.");
      }
    };

    fetchNotificationCount();
  }, [patientDetails]); // Fetch the count whenever patientDetails change


  // Auto-refresh the page every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // Fetch the latest patient details and notification count
      if (phoneNumber) {
        fetchPatientDetails(phoneNumber);
      }
    }, 1000); // 30 seconds interval

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [phoneNumber]);

  const handlePopupClose = (response?: string) => {
    // Check if patientDetails is defined before accessing its properties
    const { patient_id } = patientDetails || {};

    // Close the popup if response is 'close'
    if (response === "close") {
      setPopupVisible(false); // Close the popup without navigation
      return;
    }

    // Otherwise, navigate to the corresponding page based on missing data
    if (!hasSleepData) {
      navigation.navigate("SleepRitualsPage");
    } else if (!hasvegDietData) {
      navigation.navigate("VegDietPage");
    } else if (!hasnonvegDietData) {
      navigation.navigate("NonVegDietPage");
    } else if (!waterIntake) {
      navigation.navigate("WaterPage");
    } else if (!MedicineData) {
      navigation.navigate("PatientMedication");
    } else if (!ExerciseData) {
      navigation.navigate("DailyExercise");
    } else if (!YogaData) {
      navigation.navigate("YogaPage");
    } else if (!WalkingData) {
      navigation.navigate("Walking");
    } else if (!LifestyleData) {
      navigation.navigate("LifestyleMonitoring");
    } else {
      navigation.navigate("SleepRitualsPage");
    }

    // Close the popup after navigation
    setPopupVisible(false);
  };

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
      const response = await axios.get(
        `https://vs3k4b04-8000.inc1.devtunnels.ms/patient/patient/${phone}/`
      );
      setPatientDetails(response.data);

      // Fetch the actual token from AsyncStorage
      const token = await AsyncStorage.getItem('authToken');
      
      // Run the additional API to save token, patient name, and group name
      if (token) {
        await axios.post('https://vs3k4b04-8000.inc1.devtunnels.ms/patient/api/save-token/', {
          patient_id: response.data.patient_id,
          token: token,
          group_name: 'Patient', // Set group_name to 'Patient'
        });
      } else {
        //console.error("Token not found in AsyncStorage");
      }
    } catch (error) {
      console.error("Error fetching patient details:", error);
    }
  };

  const checkSleepData = async () => {
    if (patientDetails) {
      try {
        const response = await axios.get(
          `https://vs3k4b04-8000.inc1.devtunnels.ms/patient/patient/${patientDetails.patient_id}/sleep-data/`
        );
        setHasSleepData(response.data.exists);
      } catch (error) {
        console.error("Error fetching sleep data:", error);
      }
    }
  };

  useEffect(() => {
    checkSleepData();
  }, [patientDetails]);

  const checkVegDietData = async () => {
    if (phoneNumber && patientDetails?.diet !== "Non-Vegetarian") { 
      try {
        const response = await axios.get(
          `https://vs3k4b04-8000.inc1.devtunnels.ms/patient/patient/${phoneNumber}/vegdiet-data/`
        );
        setHasvegDietData(response.data.exists);
      } catch (error) {
        //console.error("Error fetching vegdiet data:", error);
      }
    }
  };
  useEffect(() => {
    checkVegDietData();
  }, [phoneNumber, patientDetails]); // Re-run when phone number or patient details change
  
  

  const checkNonVegDietData = async () => {
    if (phoneNumber && patientDetails?.diet !== "Vegetarian") { 
      try {
        const response = await axios.get(
          `https://vs3k4b04-8000.inc1.devtunnels.ms/patient/patient/${phoneNumber}/nonvegdiet-data/`
        );
        setHasnonvegDietData(response.data.exists);
      } catch (error) {
       // console.error("Error fetching nonvegdiet data:", error);
      }
    }
  };
  useEffect(() => {
    checkNonVegDietData();
  }, [phoneNumber, patientDetails]); // Re-run when phone number or patient details change
  

  const checkWaterData = async () => {
    if (patientDetails) {
      try {
        const response = await axios.get(
          `https://vs3k4b04-8000.inc1.devtunnels.ms/patient/patient/${patientDetails.patient_id}/water-data/`
        );
        setWaterIntake(response.data.exists);
      } catch (error) {
        console.error("Error fetching sleep data:", error);
      }
    }
  };

  useEffect(() => {
    checkWaterData();
  }, [patientDetails]);

  const checkDailyExerciseData = async () => {
    if (patientDetails) {
      try {
        const response = await axios.get(
          `https://vs3k4b04-8000.inc1.devtunnels.ms/patient/patient/${patientDetails.patient_id}/daily-exercise-data/`
        );
        setExerciseData(response.data.exists);
      } catch (error) {
        console.error("Error fetching daily exercise data:", error);
      }
    }
  };

  useEffect(() => {
    checkDailyExerciseData();
  }, [patientDetails]);

  const checkWalkingData = async () => {
    if (patientDetails) {
      try {
        const response = await axios.get(
          `https://vs3k4b04-8000.inc1.devtunnels.ms/patient/patient/${patientDetails.patient_id}/walking-data/`
        );
        setWalkingData(response.data.exists);
      } catch (error) {
        console.error("Error fetching walking data:", error);
      }
    }
  };

  useEffect(() => {
    checkWalkingData();
  }, [patientDetails]);

  const checkYogaData = async () => {
    if (patientDetails) {
      try {
        const response = await axios.get(
          `https://vs3k4b04-8000.inc1.devtunnels.ms/patient/patient/${patientDetails.patient_id}/yoga-data/`
        );
        setYogaData(response.data.exists);
      } catch (error) {
        console.error("Error fetching yoga data:", error);
      }
    }
  };

  useEffect(() => {
    checkYogaData();
  }, [patientDetails]);

  const checkMedicineData = async () => {
    if (patientDetails) {
      try {
        const response = await axios.get(
          `https://vs3k4b04-8000.inc1.devtunnels.ms/patient/patient/${patientDetails.patient_id}/medicine-data/`
        );
        setMedicineData(response.data.exists);
      } catch (error) {
        console.error("Error fetching medicine data:", error);
      }
    }
  };

  useEffect(() => {
    checkMedicineData();
  }, [patientDetails]);

  const checklifestyleData = async () => {
    if (patientDetails) {
      try {
        const response = await axios.get(
          `https://vs3k4b04-8000.inc1.devtunnels.ms/patient/patient/${patientDetails.patient_id}/lifestyle-data/`
        );
        setLifestyleData(response.data.exists);
      } catch (error) {
        console.error("Error fetching lifestyle data:", error);
      }
    }
  };

  useEffect(() => {
    checklifestyleData();
  }, [patientDetails]);

  const handleTranslate = () => {
    setIsTranslatingToTamil(!isTranslatingToTamil);
    console.log("Translate button pressed");
  };

  const handleExplore = (category: string) => {
    console.log(`Navigating to ${category}`);
    switch (category) {
      case "sleep":
        navigation.navigate("SleepRitualsPage");
        break;
      case "food":
        navigation.navigate("VegDietPage");
        break;
      case "water":
        navigation.navigate("WaterPage");
        break;
      case "medication":
        navigation.navigate("PatientMedication");
        break;
      case "yoga":
        navigation.navigate("YogaPage");
        break;
      case "exercise":
        navigation.navigate("Exercise");
        break;
      case "LifestyleMonitoring":
        navigation.navigate("LifestyleMonitoring");
        break;
      case "Insights":
        navigation.navigate("Insights");
        break;
      case "Lifestyle":
        navigation.navigate("Insights");
        break;
      case "Activities":
        navigation.navigate("ActivitiesBottomMenu");
        break;
      default:
        console.warn(`No navigation found for category: ${category}`);
        break;
    }
  };

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

  const handleContactDoctor = () => {
    if (patientDetails && patientDetails.emergency_doctor_number) {
      Linking.openURL(`tel:${patientDetails.emergency_doctor_number}`);
    } else {
      console.warn("Emergency doctor number is not available.");
    }
  };

  const handleScroll = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
    setCurrentIndex(index);
  };

  /* const handleTranslate = () => {
    const newLanguage = isTamil ? "en" : "ta";
    i18n.changeLanguage(newLanguage);
    setIsTamil(!isTamil);
  }; */

  const handleUpload = () => {
    navigation.navigate("DailyUploads"); // Navigate to the DailyUploads screen
  };

  const graphData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], // Days of the week
    datasets: [
      {
        data: [80, 90, 70, 100, 50, 60, 40], // Completion status as a percentage for each day
      },
    ],
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        {/* <Text style={styles.title}>{("Dashboard")}</Text> */}
        <Text style={styles.title}>{languageText.dashboard}</Text>

        {/* Icon Container: Align Bell and Logout in a straight line */}
        <View style={styles.topIconsContainer}>
          <View style={styles.bellContainer}>
            <MaterialIcons
              name="notifications"
              size={20}
              color="#fff"
              style={styles.bellIcon}
              onPress={() => navigation.navigate("NotificationPage")}
            />
            {notificationCount > 0 && (
              <View style={styles.countContainer}>
                <Text style={styles.countText}>{notificationCount}</Text>
              </View>
            )}
          </View>

          <MaterialIcons
            name="logout"
            size={20}
            color="#fff"
            style={styles.logoutIcon}
            onPress={handleLogout}
          />
        </View>

        <View style={styles.contentContainer}>
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            style={styles.scrollView}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            <View style={styles.emptyContainer}>
              <Image
                source={require("../../assets/images/patientCover.png")}
                style={styles.coverImage}
                resizeMode="cover"
              />
              <TouchableOpacity
                style={styles.contactButton}
                onPress={handleContactDoctor}
              >
                {/* <Text style={styles.contactButtonText}>Contact Doctor</Text> */}
                <Text style={styles.contactButtonText}>
                  {languageText.contactDoctor}
                </Text>
              </TouchableOpacity>
              {/* <Text style={styles.quoteText}>
              For expert advice and reliable guidance, don't hesitate to consult
              your doctor
            </Text> */}
              <Text style={styles.quoteText}>{languageText.expertAdvice}</Text>
            </View>

            <View style={styles.translateContainer}>
              <TouchableOpacity
                onPress={handleTranslate}
                style={styles.translateButton}
              >
                <Icon
                  name={isTranslatingToTamil ? "language" : "translate"}
                  size={20}
                  color="#4169E1" // Icon color
                />
                <Text style={styles.buttonTranslateText}>
                  {isTranslatingToTamil
                    ? "தமிழில் படிக்க"
                    : "Translate to English"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.infoTile}>
              <TouchableOpacity
                style={styles.infoTile1}
                onPress={() => handleExplore("water")}
              >
                <View style={styles.imageWrapper}>
                  <Image
                    source={require("../../assets/images/waterglass.png")}
                    style={styles.infoTileImage}
                  />
                </View>
                <Text style={styles.infoTileText}>
                  {languageText.goalText} {languageText.goalAmount}
                </Text>
                <Text style={styles.helpText}>{languageText.perDay}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.infoTile2}
                onPress={() => handleExplore("exercise")}
              >
                <View style={styles.imageWrapper}>
                  <Image
                    source={require("../../assets/images/walkingman.png")}
                    style={styles.infoTileImage}
                  />
                </View>
                <Text style={styles.infoTileText}>
                  {languageText.goalText} {languageText.goalSteps}
                </Text>
                <Text style={styles.helpText}>{languageText.perDay}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.uploadContainer}>
              <Image
                source={require("../../assets/images/dailyupload.png")}
                style={styles.uploadImage}
              />
              {/* <Text style={styles.uploadText}>Upload Daily Routines</Text>
            <Text style={styles.subText}>For Health Betterment</Text> */}

              <TouchableOpacity
                style={styles.uploadButton}
                onPress={handleUpload}
              >
                {/* <Text style={styles.uploadButtonText}>Upload</Text> */}
                <Text style={styles.uploadButtonText}>
                  {languageText.upload}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.graphContainer}
              onPress={() => navigation.navigate("ActivitiesBottomMenu")}
            >
              <Icon
                name="bar-chart"
                size={24}
                color="black"
                style={styles.iconGraph}
              />
              <Text style={styles.graphTitle}>
                {languageText.viewMetricsTitle}
              </Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Bottom Tab Menu */}
          <View style={styles.iconsContainer}>
            <TouchableOpacity
              onPress={() => handleExplore("LifestyleMonitoring")}
              style={styles.iconWithTitle}
            >
              <MaterialIcons name="spa" size={26} color="#000" />
              <Text style={styles.iconTitle}>{languageText.lifestyle}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleExplore("Insights")}
              style={styles.iconWithTitle}
            >
              <MaterialIcons name="bar-chart" size={26} color="#000" />
              <Text style={styles.iconTitle}>{languageText.insights}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleExplore("Activities")}
              style={styles.iconWithTitle}
            >
              <MaterialIcons name="directions-run" size={26} color="#000" />
              <Text style={styles.iconTitle}>{languageText.activities}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate("PatientProfile")}
              style={styles.iconWithTitle}
            >
              <MaterialIcons name="person" size={26} color="#000" />
              <Text style={styles.iconTitle}>{languageText.profile}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Popup Component */}
        {popupVisible && (
          <HealthActivityPopup
            visible={popupVisible} // Passing the 'visible' prop
            onClose={handlePopupClose}
          />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 0,
  },
  translateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "transparent", // Light background for contrast
    width: "95%", // Slightly reduced width for padding
    height: 100,
    marginBottom: 15,
    borderRadius: 15,
    padding: 10,
    bottom: 60,
  },
  translateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    padding: 10,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonTranslateText: {
    color: "#4169E1", // Text color
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 8, // Space between icon and text
  },

  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 20,
    paddingHorizontal: 2,
    marginTop: 50,
  },

  coverImage: {
    width: "97%",
    height: 200,
    borderRadius: 50,
    marginVertical: 10, // Adjusted margin for top and bottom
  },
  backButton: {
    position: "absolute",
    top: 45, // Adjusted for better visibility on iOS and Android
    left: 15,
    padding: 5,
    alignItems: "flex-start",
    backgroundColor: "#fff", // Background color of the button
    borderRadius: 30, // Optional: Adds rounded corners
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    textAlign: "left",
    marginVertical: 3,
    marginLeft: 15,
  },
  contactButton: {
    position: "absolute",
    bottom: 40, // Adjusted to fit better in view
    left: 25,
    backgroundColor: "#ff6347",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  contactButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
  },
  quoteText: {
    position: "absolute", // Use absolute positioning to place it precisely
    top: 50, // Adjusted for better visibility
    left: 30, // Adjusted for better visibility
    fontSize: 14,
    color: "#000",
    textAlign: "left", // Align text to the left
    zIndex: 1, // Ensure the text is above other content
    width: 150,
    fontWeight: "500",
  },
  uploadContainer: {
    bottom: 100,
    width: "97%",
    height: 100,
    backgroundColor: "#fff",
    borderRadius: 40,
    padding: 5,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 6,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },

  uploadText: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: "600",
    bottom: 15,
    left: 20,
  },
  subText: {
    fontSize: 16,
    fontWeight: "400",
    bottom: 15,
    left: 20,
    textAlign: "center",
  },
  uploadImage: {
    width: 100,
    height: 130,
    left: 20,
    top: 20,
    alignSelf: "flex-start",
  },
  uploadButton: {
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 30,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    bottom: 65,
    left: 55,
  },
  uploadButtonText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
  },

  contentContainer: {
    flex: 1,
    paddingBottom: 40, // Ensure content does not overlap the tab menu
  },

  iconsContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    elevation: 5,
    borderRadius: 0,
  },
  iconWithTitle: {
    alignItems: "center",
  },
  iconTitle: {
    color: "#000",
    fontSize: 12,
    marginTop: 5,
  },

  scrollView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 10,
  },

  imageContainer: {
    width: "100%",
    height: 230, // Adjust the height as needed
    overflow: "visible",
    position: "relative",
    marginBottom: 10, // Ensure no extra margin
    marginTop: -10, // Adjust this value to reduce space between title and image
  },
  image: {
    width: "100%",
    height: 250, // Same height as container to cover it
    resizeMode: "cover",
    position: "absolute", // Absolute positioning within the container
    bottom: 5, // Align the bottom of the image with the bottom of the container
  },

  countContainer: {
    position: "absolute",
    right: -10, // Adjust to position count correctly
    top: -10, // Adjust for vertical positioning
    backgroundColor: "red",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  countText: {
    color: "white", // Text color for count
    fontWeight: "bold", // Make count bold
    fontSize: 12,
  },

  topIconsContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center", // Vertically center the icons
    position: "absolute", // Position them relative to the container
    top: 20, // Adjust vertical position from the top
    right: 15, // Adjust horizontal position from the right
  },

  bellContainer: {
    position: "relative", // Keep relative positioning for notification count
  },

  bellIcon: {
    padding: 5,
    backgroundColor: "#000", // Background color of the button
    borderRadius: 30, // Rounded corners for the bell icon
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },

  logoutIcon: {
    padding: 5,
    backgroundColor: "#eb176c", // Background color of the button
    borderRadius: 30, // Rounded corners for the logout icon
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    marginLeft: 20,
  },

  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 10,
  },
  titleText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    paddingHorizontal: 5,
    paddingBottom: 15,
  },
  activeTitleText: {
    color: "#ff6347",
  },

  imageBackground: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  bottomContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },

  logoutButtonContainer: {
    position: "absolute",
    top: 55,
    right: 10,
    borderRadius: 20,
    padding: 6,
  },

  logoutImage: {
    width: 110, // Fixed size for logout image
    height: 55,
    left: 40,
    top: -5,
    alignSelf: "center",
  },

  iconContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10,
    backgroundColor: "#f3f3f3",
    width: "95%",
    borderRadius: 30,
    left: 10,
    marginBottom: 5,
    marginTop: 10,
    overflow: "visible",
    // Shadow for iOS
    shadowColor: "#000", // Shadow color
    shadowOffset: {
      width: 0,
      height: 5, // Vertical shadow
    },
    shadowOpacity: 0.3, // Opacity of the shadow
    shadowRadius: 6.68, // Shadow blur
    // Shadow for Android
    elevation: 10,
  },
  iconStyle: {
    width: 60,
    height: 60,
    borderRadius: 20,
    top: 3,
  },

  rowTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    bottom: 150,
    left: 10,
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    width: "100%",
    bottom: 150,
  },
  iconWrapper: {
    width: "30%",
    height: 170,
    marginHorizontal: 5,
    padding: 10,
    borderRadius: 30,
    backgroundColor: "#fff", // Tile background color
    shadowColor: "#000", // Shadow color
    shadowOffset: { width: 0, height: 2 }, // Shadow offset
    shadowOpacity: 0.1, // Shadow opacity
    shadowRadius: 5, // Shadow blur radius
    elevation: 5, // Elevation for Android shadow
    justifyContent: "center", // Center content vertically
    alignItems: "center",
  },
  iconImage: {
    width: "100%", // Fit image width
    height: "70%", // Fit image height, adjust as needed
    resizeMode: "contain", // Scale image to fit within bounds
  },

  iconLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    textAlign: "center", // Center text horizontally
    marginTop: 10, // Space between image and text
  },
  iconPlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: "#b0bec5", // Pale shade placeholder
    borderRadius: 30,
    marginBottom: 5,
  },

  icon: {
    marginBottom: 5,
    top: 30,
  },
  vectors: {
    width: 55, // Adjust the width and height based on the size of the icon
    height: 45,
    marginBottom: 0,
  },
  bottomTabButton: {
    margin: 20,
    padding: 15,
    backgroundColor: "#007BFF",
    borderRadius: 5,
    alignItems: "center",
  },
  bottomTabButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  infoTile: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "98%",
    alignSelf: "center",
    marginBottom: 20,
    bottom: 90,
  },
  infoTile1: {
    width: "49%", // Slightly adjusted width to fit well within the container
    height: 180,
    backgroundColor: "#f5f5f5", // White background
    borderRadius: 50,
    borderColor: "#f5f5f5", // Light grey border
    borderWidth: 1,

    justifyContent: "center",
    alignItems: "center",
  },
  infoTile2: {
    width: "49%", // Slightly adjusted width to fit well within the container
    height: 180,
    backgroundColor: "#f5f5f5", // White background
    borderRadius: 50, // Circular border radius
    borderColor: "#f5f5f5", // Light grey border
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  imageWrapper: {
    backgroundColor: "#fff",
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  infoTileImage: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
  infoTileText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
  },
  helpText: {
    fontSize: 12,
    fontWeight: "600",
    color: "grey",
    textAlign: "center",
    marginTop: 4,
  },
  graphContainer: {
    flexDirection: "row", // Align items horizontally
    alignItems: "center", // Center icon and text vertically
    padding: 10, // Add padding for spacing
    backgroundColor: "#f0f0f0", // Light background color
    borderRadius: 15, // Rounded corners for the container
    shadowColor: "#000", // Shadow effect for the container
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    marginHorizontal: 10,
    bottom: 90,
    height: "15%",
  },
  iconGraph: {
    marginRight: 10,

    // Space between icon and text
  },
  graphTitle: {
    fontSize: 18, // Font size for the text
    fontWeight: "600", // Slightly bold text
    color: "#333",
    alignItems: "center",
    marginLeft: 90, // Text color
  },
});

export default PatientDashboardPage;