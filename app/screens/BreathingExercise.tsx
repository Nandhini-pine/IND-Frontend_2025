import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  View,
  Text as RNText,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  BackHandler,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Audio } from "expo-av"; // Import Audio from expo-av
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../type";
import { RFValue } from "react-native-responsive-fontsize"; // If you choose to use responsive font size library
import CustomAlert from "../components/CustomAlert";
// Custom Text component to disable font scaling globally
const Text = (props: any) => {
  return <RNText {...props} allowFontScaling={false} />;
};

const INHALE_DURATION = 5000; // 10 seconds
const EXHALE_DURATION = 10000; // 20 seconds

const BreathingExercise = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const animationValue = useRef(new Animated.Value(0)).current; // Animation value for breathing
  const fadeAnim = useRef(new Animated.Value(0)).current; // Animation value for fade effect
  const [timer, setTimer] = useState(INHALE_DURATION); // Initialize with inhale duration
  const [isRunning, setIsRunning] = useState(false); // State to track if breathing is active
  const [currentPhase, setCurrentPhase] = useState<"inhale" | "exhale">(
    "inhale"
  ); // Track current phase
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | undefined>(
    undefined
  ); // Explicitly typed interval
  const sound = useRef(new Audio.Sound()).current; // Reference for the sound

  const [countdown, setCountdown] = useState(3); // New state for countdown
  const [countdownActive, setCountdownActive] = useState(true); // State to track countdown activity
  const [showElements, setShowElements] = useState(false); // State to control visibility of elements
  const [cancelAlertVisible, setCancelAlertVisible] = useState(false);

  const loadSound = async () => {
    try {
      await sound.loadAsync(require("../../assets/sounds/breathing.mp3")); // Load sound
    } catch (error) {
      console.log("Error loading sound:", error);
    }
  };

  const playSound = async () => {
    try {
      await sound.playAsync(); // Play sound
    } catch (error) {
      console.log("Error playing sound:", error);
    }
  };
  const stopSound = async () => {
    try {
      const status = await sound.getStatusAsync(); // Get sound status
      if (status.isLoaded) {
        await sound.stopAsync(); // Stop sound if it's loaded
        await sound.unloadAsync(); // Add unloadAsync to fully cleanup the sound
      }
    } catch (error) {
      console.log("Error stopping sound:", error);
    }
  };

  /* const handleExit = async () => {
    console.log("Exiting the current screen...");
    // Navigate to the desired screen, e.g., "Home"
    navigation.navigate("Exercise");
  }; */

  const handleExit = async () => {
    console.log("Exiting the current screen...");
    // Cleanup before navigation
    setIsRunning(false);
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(undefined);
    }
    await stopSound(); // Stop and unload sound before navigation
    navigation.navigate("Exercise");
  };

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
    loadSound(); // Load sound on component mount
    return () => {
      sound.unloadAsync(); // Unload sound on unmount
    };
  }, [sound]);

  useEffect(() => {
    if (isRunning) {
      playSound(); // Play sound when starting
    } else {
      stopSound(); // Stop sound when stopping
    }
  }, [isRunning]);

  useEffect(() => {
    // Countdown logic
    if (countdownActive && countdown > 0) {
      const countdownInterval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(countdownInterval); // Cleanup interval on unmount or when countdown changes
    } else if (countdown === 0) {
      setCountdownActive(false); // Stop countdown
      setIsRunning(true); // Start breathing exercise
      setShowElements(true); // Show elements after countdown
    }
  }, [countdown, countdownActive]);

  useEffect(() => {
    if (isRunning) {
      const startBreathingAnimation = () => {
        // Inhale animation
        Animated.timing(animationValue, {
          toValue: 1,
          duration: INHALE_DURATION,
          useNativeDriver: false,
        }).start(() => {
          setCurrentPhase("exhale"); // Update phase to exhale
          setTimer(EXHALE_DURATION); // Set timer for exhale
          // Exhale animation
          Animated.timing(animationValue, {
            toValue: 2,
            duration: EXHALE_DURATION,
            useNativeDriver: false,
          }).start(() => {
            animationValue.setValue(0); // Reset animation value for the next cycle
            setCurrentPhase("inhale"); // Update phase to inhale for the next cycle
            setTimer(INHALE_DURATION); // Set timer for inhale again
            startBreathingAnimation(); // Loop the breathing animation
          });
        });
      };

      startBreathingAnimation();

      // Timer decrement logic
      const id = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1000) {
            return 0; // Prevent timer from going below zero
          }
          return prev - 1000; // Decrement timer every second
        });
      }, 1000);
      setIntervalId(id); // Store interval ID in state
    } else {
      // Clear interval when not running
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(undefined); // Reset interval ID
      }
    }

    return () => {
      animationValue.setValue(0); // Reset animation value on unmount
      if (intervalId) {
        clearInterval(intervalId); // Cleanup interval on unmount
      }
    };
  }, [isRunning, animationValue]);

  // Format timer to display as MM:SS
  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
  };

  const rotate = animationValue.interpolate({
    inputRange: [0, 1, 2],
    outputRange: ["0deg", "360deg", "0deg"], // Rotate the orbit
  });

  const toggleBreathing = () => {
    if (isRunning) {
      setIsRunning(false); // Pause the breathing animation
      animationValue.stopAnimation(); // Stop the current animation
      if (intervalId) {
        clearInterval(intervalId); // Clear the timer
        setIntervalId(undefined);
      }
      animationValue.setValue(0); // Reset animation value when stopping
    } else {
      // Reset all states to start from the beginning
      setCurrentPhase("inhale"); // Reset phase to inhale when starting
      setTimer(INHALE_DURATION); // Reset timer for inhale duration
      animationValue.setValue(0); // Reset animation value
      setIsRunning(true); // Start the breathing animation
    }
  };

  // Fade-in animation
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1, // Fade to full opacity
      duration: 1000, // 1 second for fade-in
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // Determine circle colors based on the current phase
  const outerCircleColor = currentPhase === "inhale" ? "#4CAF50" : "red"; // Green for inhale, red for exhale
  const innerCircleColor = currentPhase === "inhale" ? "#e0f7e0" : "#f8d7da"; // Light green for inhale, light red for exhale

  return (
    <SafeAreaProvider>
      <CustomAlert
        title="Cancel"
        message="Are you sure you want to cancel?"
        visible={cancelAlertVisible}
        onClose={() => setCancelAlertVisible(false)}
        mode="confirm"
        onYes={() => {
          navigation.navigate("PatientDashboardPage");
        }}
        onNo={() => setCancelAlertVisible(false)}
      />
      <SafeAreaView style={styles.safeArea}>
        {/* Adjust StatusBar visibility */}
        <StatusBar
          barStyle="dark-content" // Set the color of status bar text
          backgroundColor="transparent" // Make the background transparent
          translucent={true} // Make status bar translucent
        />

        <ImageBackground
          source={require("../../assets/images/breath.jpg")} // Local background image
          style={styles.background}
        >
          {/* Title Text */}
          <Text style={styles.title}>Breathing Exercise</Text>

          {/* Countdown Timer */}
          <View style={styles.countdownContainer}>
            {countdownActive ? (
              <Text style={styles.timerText}>{countdown}</Text>
            ) : (
              <Animated.View
                style={[
                  styles.container,
                  { opacity: fadeAnim, transform: [{ scale: fadeAnim }] },
                ]}
              >
                <View
                  style={[styles.circle, { borderColor: outerCircleColor }]}
                >
                  <View
                    style={[
                      styles.innerCircle,
                      { backgroundColor: innerCircleColor },
                    ]}
                  >
                    <Image
                      source={require("../../assets/images/innerCircle.jpg")} // Local background image
                      style={styles.innerImage}
                    />
                  </View>
                </View>
                {/* Orbiting element */}
                {showElements && (
                  <Animated.View
                    style={[styles.orbit, { transform: [{ rotate }] }]}
                  >
                    <View style={styles.orbitCircle} />
                  </Animated.View>
                )}
                {/* Timer display */}
                <View style={styles.timerContainer}>
                  <Text style={styles.timerText}>
                    {Math.floor(timer / 1000)}
                  </Text>
                </View>
                {/* Start/Stop button */}
                {showElements && (
                  <TouchableOpacity
                    style={styles.button}
                    onPress={toggleBreathing}
                  >
                    <Text style={styles.buttonText}>
                      {isRunning
                        ? currentPhase === "inhale"
                          ? "Inhale"
                          : "Exhale"
                        : "Inhale"}
                    </Text>
                    <TouchableOpacity
                      style={styles.exitButton}
                      onPress={handleExit}
                    >
                      <Text style={styles.exitButtonText}>Exit</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                )}
              </Animated.View>
            )}
          </View>
        </ImageBackground>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    marginTop: 40,
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  exitButton: {
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
  exitButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 30, // Title font size
    color: "#fff", // White color for the title
    fontWeight: "bold",
    marginBottom: 10,
    top: 100,
  },
  circle: {
    width: 300,
    height: 300,
    borderRadius: 200,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute", // Position the main circle at the center
  },
  innerCircle: {
    width: 240,
    height: 240,
    borderRadius: 150,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
  },
  innerImage: {
    width: "100%", // Fit the image within the inner circle
    height: "100%",
    borderRadius: 120,
  },
  orbit: {
    position: "absolute",
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  orbitCircle: {
    width: 15,
    height: 15,
    borderRadius: 10,
    backgroundColor: "#fff",
    position: "absolute",
    top: 0,
    left: "50%",
    marginLeft: -10,
    transform: [{ translateY: -56 }],
  },
  timerContainer: {
    position: "absolute",
    top: 130,
    justifyContent: "center",
    alignItems: "center",
  },
  timerText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  button: {
    position: "absolute",
    bottom: 100,
    backgroundColor: "#0b7f1b",
    padding: 15,
    borderRadius: 30,
    width: "30%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 10,
  },
  countdownContainer: {
    alignItems: "center",
    marginTop: 20, // Adjust margin as needed
  },
});

export default BreathingExercise;
