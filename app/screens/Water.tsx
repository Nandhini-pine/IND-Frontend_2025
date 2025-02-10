import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Text as RNText,
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Alert,
  Image,
  ImageBackground,
  Platform,
  Modal,
  SafeAreaView,
  StatusBar,
  BackHandler,
} from "react-native";
import { Audio } from "expo-av";
import DateTimePicker from "@react-native-community/datetimepicker";
import texts from "../translation/texts";
import Icon from "react-native-vector-icons/MaterialIcons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../type";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import CustomAlert from "../components/CustomAlert";

// Custom Text component to disable font scaling globally
const Text = (props: any) => {
  return <RNText {...props} allowFontScaling={false} />;
};

interface PatientDetails {
  patient_id: string; // Keep the patient_id string if you need it for other purposes
  diet: string;
  name: string; // Make sure to add this line
}

type NavigationProp = StackNavigationProp<RootStackParamList, "DailyUploads">;

const WaterPage: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [fadeAnim] = useState(new Animated.Value(0)); // Initial value for opacity: 0
  const [waterIntake, setWaterIntake] = useState(0);
  const [isTranslatingToTamil, setIsTranslatingToTamil] = useState(false);
  const languageText = isTranslatingToTamil ? texts.tamil : texts.english;
  // Update language state dynamically
  const language: "english" | "tamil" = isTranslatingToTamil
    ? "tamil"
    : "english";

  const [glasses, setGlasses] = useState(0);
  const [activeIcon, setActiveIcon] = useState<number | null>(null);
  const [showDrop, setShowDrop] = useState(false);
  const waterDropAnimation = useRef(new Animated.Value(0)).current;
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const fillHeight = (waterIntake / 2000) * 100;
  const [fillAnimation] = useState(new Animated.Value(0));
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [patientDetails, setPatientDetails] = useState<PatientDetails | null>(
    null
  );
  const [cancelAlertVisible, setCancelAlertVisible] = useState(false);
  const scaleAnimation = useRef(new Animated.Value(1)).current; // Initialize scaleAnimation
  // New state for confetti visibility
  const [showConfetti, setShowConfetti] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [customAlertVisible, setCustomAlertVisible] = useState(false);
  const [confettiTimeout, setConfettiTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  const [showCongrats, setShowCongrats] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false); // For custom alert visibility

  const [alertMode, setAlertMode] = useState(""); // For alert mode (e.g., success, error)

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
      console.error("Error fetching patient details:", error);
    }
  };

  const showCongratulationAlert = () => {
    setShowCongrats(true);

    // Sequence of animations
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        delay: 2000,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Hide the modal after animations are complete
      setTimeout(() => setShowCongrats(false), 2500); // Hide the modal after 3 seconds
    });
  };

  const triggerConfetti = () => {
    // Clear any existing timeout to prevent conflicts
    if (confettiTimeout) {
      clearTimeout(confettiTimeout);
    }

    setShowConfetti(true);

    // Hide confetti after 4 seconds
    const timeoutId = setTimeout(() => {
      setShowConfetti(false);
    }, 4000); // Hide after 4 seconds

    setConfettiTimeout(timeoutId); // Store the timeout ID
  };

  const handleAddWater = (amount: number) => {
    if (selectedAmount !== amount) {
      setSelectedAmount(amount);
      setWaterIntake(amount); // Set water intake to the selected amount
      const newGlasses = Math.ceil(amount / 500);
      setGlasses(newGlasses);

      if (amount >= 2000) {
        showCongratulationAlert(); // Show custom styled modal alert

        setShowConfetti(true); // Show confetti when the goal is reached
      }

      triggerWaterDropAnimation();
      playSound(); // Play sound when water is added
    }
  };

  const triggerWaterDropAnimation = () => {
    setShowDrop(true); // Show the drop

    Animated.timing(waterDropAnimation, {
      toValue: 1, // Animate to 1
      duration: 1000,
      useNativeDriver: true,
    }).start(() => {
      // Hide the drop after the animation ends
      setShowDrop(false);
      waterDropAnimation.setValue(0); // Reset for next time
    });
  };

  const playSound = async () => {
    if (sound) {
      await sound.replayAsync(); // Replay the sound
    }
  };

  const handleDateChange = (event: any, date?: Date | undefined) => {
    // Check if the date is defined before updating the state
    if (date && event.type !== "dismissed") {
      setSelectedDate(date);
    }
    setShowDatePicker(false);
  };

  // Handle Translation
  const handleTranslate = useCallback(() => {
    setIsTranslatingToTamil((prev) => !prev);
    console.log("Translate button pressed");
  }, []);

  const handleSubmit = async () => {
    // Check if selected date is null
    if (!selectedDate) {
      setAlertTitle(languageText.errorTitle);
      setAlertMessage(languageText.alertWater);
      setAlertMode("error");
      setCustomAlertVisible(true); // Show custom alert
      return;
    }

    // Format the date
    const formattedDate = selectedDate.toISOString().split("T")[0];

    try {
      const response = await axios.post(
        `https://indheart.pinesphere.in/patient/water-data/`,
        {
          patient_id: patientDetails?.patient_id,
          date: formattedDate,
          ml_500: waterIntake >= 500,
          ml_1000: waterIntake >= 1000,
          ml_1500: waterIntake >= 1500,
          ml_2000: waterIntake >= 2000,
          ml_2500: waterIntake >= 2500,
          ml_3000: waterIntake >= 3000,
        }
      );

      if (response.status === 201) {
        setAlertTitle(languageText.success);
        setAlertMessage(
          `${languageText.recorded} ${waterIntake} ml ${languageText.intake}`
        );
        setAlertMode("success");
        setCustomAlertVisible(true); // Show custom alert
      } else {
        throw new Error(`Unexpected response code: ${response.status}`);
      }
    } catch (error) {
      let errorMessage = "Failed to submit water intake.";

      if (axios.isAxiosError(error)) {
        if (error.response) {
          if (error.response.data.non_field_errors) {
            errorMessage = languageText.dateAlreadySavedWater;
          } else {
            errorMessage =
              error.response.data.detail || languageText.defaultErrorMessage;
          }
        } else if (error.request) {
          //errorMessage = "No response from server. Please check your connection.";
          errorMessage = languageText.noResponseFromServer;
        }
      } else {
        errorMessage = (error as Error).message;
      }

      // Show the error message in custom alert
      setAlertTitle(languageText.alertErrorTitle);
      setAlertMessage(errorMessage);
      setAlertMode("error");
      setCustomAlertVisible(true); // Show custom alert
    }
  };

  const handleClear = () => {
    setWaterIntake(0);
    setGlasses(0);
    setSelectedAmount(null);
    setActiveIcon(null);
    setSelectedDate(null);
    setShowDrop(false);
    // Reset any states as necessary
    setShowConfetti(false); // Stop confetti when clearing
    if (confettiTimeout) {
      clearTimeout(confettiTimeout); // Clear the existing timeout if any
      setConfettiTimeout(null); // Reset the timeout ID
    }
    //setShowConfetti(false); // Stop confetti when clearing
    //Alert.alert(languageText.clearedTitle, languageText.clearedMessage);
  };

  // Modified sound cleanup function
  const cleanupSound = async () => {
    if (sound) {
      try {
        await sound.stopAsync();
        await sound.unloadAsync();
      } catch (error) {
        console.log("Error cleaning up sound:", error);
      }
    }
  };

  // Modified handleCancel with sound cleanup
  /*  const handleCancel = async () => {
    Alert.alert("Cancel", "Are you sure you want to cancel?", [
      { text: "No", style: "cancel" },
      { 
        text: "Yes", 
        onPress: async () => {
          await cleanupSound();
          navigation.navigate("DailyUploads");
        }
      },
    ]);
  }; */
  const handleCancel = () => {
    // Trigger the custom alert instead of the default Alert
    setCancelAlertVisible(true);
  };
  useEffect(() => {
    const fillHeight = (waterIntake / 2000) * 100;
    Animated.timing(fillAnimation, {
      toValue: fillHeight,
      duration: 500,
      easing: Easing.ease,
      useNativeDriver: false,
    }).start();
  }, [waterIntake]);

  // Add navigation event listener for cleanup
  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", async (e) => {
      await cleanupSound();
    });

    return unsubscribe;
  }, [navigation, sound]);

  // Modified sound loading effect
  useEffect(() => {
    const loadSound = async () => {
      try {
        const { sound: newSound } = await Audio.Sound.createAsync(
          require("../../assets/sounds/water-drops.mp3")
        );
        setSound(newSound);
      } catch (error) {
        console.log("Error loading sound:", error);
      }
    };

    loadSound();

    // Cleanup function
    return () => {
      cleanupSound();
    };
  }, []);

  useEffect(() => {
    // Zoom in and out animation when component mounts
    Animated.sequence([
      Animated.timing(scaleAnimation, {
        toValue: 1.1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <SafeAreaProvider>
      <CustomAlert
        title="Cancel"
        message="Are you sure you want to cancel?"
        visible={cancelAlertVisible}
        onClose={() => setCancelAlertVisible(false)} // Close the alert on close
        mode="confirm"
        onYes={() => {
          // Navigate to PatientDashboardPage when "Yes" is clicked
          navigation.navigate("PatientDashboardPage");
          setCancelAlertVisible(false); // Close the alert after navigation
        }}
        onNo={() => setCancelAlertVisible(false)} // Close the alert on "No"
        okText={languageText.alertOk} // Translated OK text
        yesText={languageText.alertYes} // Translated Yes text
        noText={languageText.alertNo} // Translated No text
      />
      <SafeAreaView style={styles.safeArea}>
        {/* Adjust StatusBar visibility */}
        <StatusBar
          barStyle="dark-content" // Set the color of status bar text
          backgroundColor="transparent" // Make the background transparent
          translucent={true} // Make status bar translucent
        />
        <CustomAlert
          title={alertTitle}
          message={alertMessage}
          visible={customAlertVisible}
          onClose={() => {
            setCustomAlertVisible(false); // Close the alert
            if (alertMode === "success") {
              navigation.navigate("PatientMedication"); // Navigate on success
            }
          }}
          okText={languageText.alertOk} // Translated OK text
          yesText={languageText.alertYes} // Translated Yes text
          noText={languageText.alertNo} // Translated No text
        />

        <ImageBackground
          source={require("../../assets/images/w.jpg")}
          style={styles.container}
        >
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
                  ? "Translate to English"
                  : "தமிழில் படிக்க"}
              </Text>
            </TouchableOpacity>
            <Text style={styles.title}>{languageText.waterConsumption}</Text>
          </View>

          {/* Custom Congratulation Modal */}
          <Modal
            animationType="fade"
            transparent={true}
            visible={showCongrats}
            onRequestClose={() => setShowCongrats(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalView}>
                <Image
                  source={require("../../assets/images/congratulation.png")} // Replace with your image path
                  style={styles.congratulationsImage}
                />
                <Text style={styles.modalTitle}>
                  {languageText.congratulations}
                </Text>
                <Text style={styles.modalText}>{languageText.dailyGoal}</Text>
              </View>
            </View>
          </Modal>

          <View style={styles.datePickerContainer}>
            <Image
              source={require("../../assets/images/calendar.png")}
              style={styles.datePickerImage}
            />
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={styles.datePickerField}
            >
              <Text style={styles.datePickerText}>
                {selectedDate ? selectedDate.toDateString() : "Select Date"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* DateTimePicker */}
          {showDatePicker && (
            <View style={styles.datePickerContainer}>
              <DateTimePicker
                testID="dateTimePicker"
                value={selectedDate || new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "inline" : "calendar"}
                onChange={handleDateChange}
              />
            </View>
          )}

          <View style={styles.circularContainer}>
            <View style={styles.tumblerContainer}>
              <View style={styles.tumbler}>
                <Animated.View
                  style={[
                    styles.fill,
                    {
                      height: fillAnimation.interpolate({
                        inputRange: [0, 100],
                        outputRange: ["0%", "100%"],
                      }),
                      bottom: 0,
                    },
                  ]}
                />
              </View>
              <Text style={styles.totalText}>
                {languageText.intakeText} - {waterIntake} ml
              </Text>
              <Text style={styles.goalText}>
                {languageText.goalText} - 2000 ml
              </Text>
            </View>

            {showDrop && (
              <Animated.View
                style={[
                  styles.waterDrop,
                  {
                    opacity: waterDropAnimation.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [1, 1, 0],
                    }),
                    transform: [
                      {
                        translateY: waterDropAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 150],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Image
                  source={require("../../assets/images/water-drop.png")}
                  style={styles.waterDropIcon}
                />
              </Animated.View>
            )}
          </View>

          {showConfetti && (
            <Image
              source={require("../../assets/gif/confetti.gif")} // Adjust the path as needed
              style={{ width: "100%", height: "70%", position: "absolute" }} // Adjust styles as needed
            />
          )}

          <Text style={styles.instructionText}>
            {languageText.instructionText}
          </Text>
          <View style={styles.tumblerIconsContainer}>
            {[500, 1000, 1500, 2000, 2500, 3000].map((amount) => (
              <TouchableOpacity
                key={amount}
                style={[
                  styles.tumblerIcon,
                  { opacity: activeIcon === amount ? 1 : 0.5 },
                ]}
                onPress={() => {
                  handleAddWater(amount);
                  setActiveIcon(amount);

                  // Trigger confetti for 2000ml, 2500ml, and 3000ml only
                  if (amount === 2000 || amount === 2500 || amount === 3000) {
                    triggerConfetti(); // Call to trigger confetti
                  }
                }}
              >
                <Animated.Image // Apply animation scale to tumbler image
                  source={require("../../assets/images/tumbler.png")}
                  style={[
                    styles.icon,
                    {
                      transform: [
                        { scale: activeIcon === amount ? scaleAnimation : 1 },
                      ],
                    },
                  ]} // Scale effect
                />
                <Text style={styles.iconText}>{amount}ml</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
            >
              <Text style={styles.footerButtonText}>{languageText.submit}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
              <Text style={styles.footerButtonText}>{languageText.clear}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
            >
              <Text style={styles.footerButtonText}>{languageText.cancel}</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff", // Sky blue background
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    padding: 10,
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
    //position: "absolute",
    bottom: -50,
  },

  translateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "transparent", // Light background for contrast
    width: "100%", // Slightly reduced width for padding
    height: 100,

    borderRadius: 15,
    top: 10,
    padding: 10,
    marginLeft: 5,
  },

  translateButton: {
    position: "absolute",

    right: 10,
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    padding: 6,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1,

    // Adjusted marginBottom to reduce space
  },

  circularContainer: {
    width: 340, // Adjust width for the circular container
    height: 330, // Adjust height for the circular container
    justifyContent: "center",
    bottom: 30,
    alignItems: "center",
    borderRadius: 330 / 2, // Make it circular
    backgroundColor: "#fff", // Light background color
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10, // Shadow effect for Android
    position: "relative",
  },
  tumblerContainer: {
    width: 110,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  tumbler: {
    width: 110,
    height: 200,
    borderWidth: 2,
    borderColor: "#4682B4",
    borderTopWidth: 0, // Remove top border line
    borderBottomLeftRadius: 20, // Rounded bottom corners
    borderBottomRightRadius: 20, // Rounded bottom corners
    borderTopLeftRadius: 30, // Adjust to move top corners outward
    borderTopRightRadius: 30, // Adjust to move top corners outward
    backgroundColor: "#fff",
    overflow: "hidden",
    position: "relative", // Ensure positioning of fill is relative to this container
    paddingBottom: 20, // Create a visible gap at the top of the filling
  },

  fill: {
    width: "100%",
    backgroundColor: "#00aaff",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderRadius: 8, // Round the top corners for better visual effect
  },
  waterDrop: {
    position: "absolute",
    top: 0, // Start from the top of the circular container
    width: 50, // Adjust size of water drop icon
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  waterDropIcon: {
    width: "100%",
    height: "100%",
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 20,
    marginTop: 20, // Space between the circular container and info container
  },
  infoLeft: {
    alignItems: "flex-start",
  },
  infoRight: {
    alignItems: "flex-end",
  },
  infoText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 2,
    top: 30,
    left: 5,
  },
  goalText: {
    color: "#000",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 5,
    textAlign: "center",
  },
  totalText: {
    color: "#000",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 25,
    textAlign: "center",
  },
  tumblerIconsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    padding: 20,
    marginTop: 20,
    bottom: 60,
  },
  tumblerIcon: {
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    width: 50,
    height: 50,
  },
  iconText: {
    marginTop: 5,
    fontSize: 10,
    color: "#c3c3c3",
  },
  dateInput: {
    height: 40,
    borderColor: "#c5c5c5", // Border color
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    width: "60%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    marginTop: 5,
    bottom: 35,
  },
  datePickerField: {
    width: "50%",
    left: 100,
    bottom: 47,
    marginVertical: 15,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 45,
    backgroundColor: "#fff",
  },
  datePickerText: {
    fontSize: 16,
    color: "#333",
    alignItems: "center",
    textAlign: "center",
  },
  datePickerImage: {
    width: 35,
    height: 30,
    marginRight: 10,
    left: 55,
  },
  dateText: {},
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    backgroundColor: "transparent",
    top: 10,
    marginBottom: 10,
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
  clearButton: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: "#FFC30B",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    padding: 10,
  },
  cancelButton: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: "#FF6347",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    padding: 10,
  },
  footerButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  instructionText: {
    fontSize: 12,
    top: 100,
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
  },
  datePickerContainer: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    top: 10,
    marginTop: 30,
  },
  /*  translateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "transparent", // Light background for contrast
    width: "100%", // Slightly reduced width for padding
    height: 100,
    
    borderRadius: 15,
    top: 10,
    padding: 10,
    marginLeft: 5,
  }, */
  /* translateButton: {
    position: "absolute",
    
    right: 10,
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    padding: 6,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1,
    marginBottom: 13,
  }, */

  buttonTranslateText: {
    color: "#4169E1",
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 5,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    width: 300,
    height: 260,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 80,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#4CAF50",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 20,
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 10,
  },
  congratulationsImage: {
    width: 100,
    height: 100,
    resizeMode: "contain",
    marginBottom: 5,
  },
});
export default WaterPage;
