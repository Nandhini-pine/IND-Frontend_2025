import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Text as RNText,
  TextProps,
  TouchableOpacity,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../type"; // Adjust the path to your types file
import AsyncStorage from "@react-native-async-storage/async-storage";
import texts from "../translation/texts";
import CustomAlert from "../components/CustomAlert";

// Custom Text component to disable font scaling globally
const Text = (props: TextProps) => {
  return <RNText {...props} allowFontScaling={false} />;
};



type LoginPageNavigationProp = StackNavigationProp<
  RootStackParamList,
  "LoginPage"
>;

const LoginPage: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(10); // 1 minute timer
  const [resendEnabled, setResendEnabled] = useState(false);
  const [isTranslatingToTamil, setIsTranslatingToTamil] = useState(true);
  const navigation = useNavigation<LoginPageNavigationProp>();
  const otpRefs = useRef<Array<TextInput | null>>([]);
  const languageText = isTranslatingToTamil ? texts.english : texts.tamil;
  const scale = useRef(new Animated.Value(1)).current;
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');


  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => animate());
    };
    animate();
  }, [scale]);

  useEffect(() => {
    let timerInterval: NodeJS.Timeout;

    if (otpSent && !resendEnabled) {
      timerInterval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timerInterval);
            setResendEnabled(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timerInterval);
  }, [otpSent, resendEnabled]);

  /* const handleSendOtp = async () => {
    if (phoneNumber.length !== 10) {
      setAlertTitle("Error");
      setAlertMessage(languageText.phoneNumberError);
      setAlertVisible(true);
      setTimeout(() => {
        setAlertVisible(false);
      }, 5000); // 5 seconds delay for closing the alert
      return;
    }
  
    try {
      const response = await fetch("https://indheart.pinesphere.in/api/send_otp/", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          phone_number: phoneNumber,
        }).toString(),
      });
  
      const data = await response.json();
  
      if (data.status === "success") {
        setOtpSent(true);
        setResendEnabled(false);
        setTimer(100);
        setAlertTitle("Success");
        setAlertMessage(languageText.otpSentSuccessfully);
        setAlertVisible(true);
        // Close alert after 5 seconds
        setTimeout(() => {
          setAlertVisible(false);
        }, 5000); // 5 seconds delay for closing the alert
      } else {
        if (data.message === "Phone number already verified. Please login.") {
          if (data.user_type === "Admin") {
            setAlertTitle(languageText.info);
            setAlertMessage(languageText.phoneAlreadyVerifiedAdmin);
            setAlertVisible(true);
            setTimeout(() => {
              setAlertVisible(false);
            }, 5000); // 5 seconds delay for closing the alert
            navigation.navigate("AdminDashboardPage");
          } else if (data.user_type === "Patient") {
            await AsyncStorage.setItem("phoneNumber", phoneNumber);
            setAlertTitle(languageText.info);
            setAlertMessage(languageText.phoneAlreadyVerifiedPatient);
            setAlertVisible(true);
            setTimeout(() => {
              setAlertVisible(false);
            }, 5000); // 5 seconds delay for closing the alert
            navigation.navigate("PatientDashboardPage");
          } else {
            setAlertTitle(languageText.error);
            setAlertMessage(languageText.unexpectedUserType);
            setAlertVisible(true);
            setTimeout(() => {
              setAlertVisible(false);
            }, 5000); // 5 seconds delay for closing the alert
          }
        } else {
          setAlertTitle(languageText.error);
          setAlertMessage(data.message);
          setAlertVisible(true);
          setTimeout(() => {
            setAlertVisible(false);
          }, 5000); // 5 seconds delay for closing the alert
        }
      }
    } catch (error) {
      console.error("Error in handleSendOtp:", error);
      setAlertTitle("Error");
      setAlertMessage("Failed to send OTP. Please try again later.");
      setAlertVisible(true);
      setTimeout(() => {
        setAlertVisible(false);
      }, 5000); // 5 seconds delay for closing the alert
    }
  }; */
  
  const handleSendOtp = async () => {
    if (phoneNumber.length !== 10) {
      setAlertTitle("Error");
      setAlertMessage(languageText.phoneNumberError);
      setAlertVisible(true);
      return;
    }
  
    try {
      const response = await fetch("https://indheart.pinesphere.in/api/send_otp/", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          phone_number: phoneNumber,
        }).toString(),
      });
  
      const data = await response.json();
  
      if (data.status === "success") {
        setOtpSent(true);
        setResendEnabled(false);
        setTimer(100);
        setAlertTitle("Success");
        setAlertMessage(languageText.otpSentSuccessfully);
        setAlertVisible(true);
      } else {
        if (data.message === "Phone number already verified. Please login.") {
          if (data.user_type === "Admin") {
            setAlertTitle(languageText.info);
            setAlertMessage(languageText.phoneAlreadyVerifiedAdmin);
            setAlertVisible(true);
            navigation.navigate("AdminDashboardPage");
          } else if (data.user_type === "Patient") {
            await AsyncStorage.setItem("phoneNumber", phoneNumber);
            setAlertTitle(languageText.info);
            setAlertMessage(languageText.phoneAlreadyVerifiedPatient);
            setAlertVisible(true);
            navigation.navigate("PatientDashboardPage");
          } else {
            setAlertTitle(languageText.error);
            setAlertMessage(languageText.unexpectedUserType);
            setAlertVisible(true);
          }
        } else {
          setAlertTitle(languageText.error);
          setAlertMessage(data.message);
          setAlertVisible(true);
        }
      }
    } catch (error) {
      console.error("Error in handleSendOtp:", error);
      setAlertTitle("Error");
      setAlertMessage("Failed to send OTP. Please try again later.");
      setAlertVisible(true);
    }
  };
  
  
  

  

  // Handle Translation
  const handleTranslate = useCallback(() => {
    setIsTranslatingToTamil((prev) => !prev);
    console.log("Translate button pressed");
  }, []);

  const handleVerifyOtp = async () => {
    try {
      const response = await fetch(
        "https://indheart.pinesphere.in/api/verify_otp/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            phone_number: phoneNumber,
            otp: otp,
          }).toString(),
        }
      );

      const data = await response.json();
      if (data.status === "success") {
        await AsyncStorage.setItem("phoneNumber", phoneNumber);

        navigation.navigate("DisclaimerPage");

        resetState();
      } else {
  //Alert.alert("Error", data.message);
  setAlertTitle("Error");
  setAlertMessage(data.message);
      }
    } catch (error) {
      console.error("Error in handleVerifyOtp:", error);
      //Alert.alert("Error", "Failed to verify OTP");
      setAlertTitle("Error");
      setAlertMessage("Failed to verify OTP");
    }
  };

  const handleResendOtp = async () => {
    if (phoneNumber.length !== 10) {
      //Alert.alert("Error", "Phone number must be exactly 10 digits.");
      setAlertTitle("Error");
      setAlertMessage("Phone number must be exactly 10 digits.");
      return;
    }
    console.log("handleResendOtp called");

    try {
      const response = await fetch("https://indheart.pinesphere.in/api/send_otp/", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          phone_number: phoneNumber,
        }).toString(),
      });

      const data = await response.json();
      if (data.status === "success") {
        setTimer(60); // Reset timer
        setResendEnabled(false); // Reset resend button
        setOtp(""); // Clear the entered OTP
        //Alert.alert("Success", "OTP resent successfully");
        setAlertTitle("Success");
        setAlertMessage("OTP resent successfully");
      } else {
        //Alert.alert("Error", data.message);
        setAlertTitle("Error");
        setAlertMessage(data.message);
      }
    } catch (error) {
      console.error("Error in handleResendOtp:", error);
      //Alert.alert("Error", "Failed to resend OTP");
      setAlertTitle("Error");
      setAlertMessage("Failed to resend OTP");
    }
  };

  const resetState = () => {
    setPhoneNumber("");
    setOtp("");
    setOtpSent(false);
    setResendEnabled(false);
    setTimer(60);
  };

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = otp.split("");
    newOtp[index] = text;
    setOtp(newOtp.join(""));

    if (text && otpRefs.current[index + 1]) {
      otpRefs.current[index + 1]?.focus();
    }

    if (!text && otpRefs.current[index - 1]) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (event: any) => {
    const pastedText = event.clipboardData.getData("text");
    handleOtpChangeText(pastedText);
  };

  const handleOtpChangeText = (text: string) => {
    const sanitizedText = text.replace(/\D/g, "");
    const otpArray = sanitizedText.split("").slice(0, 4);
    const newOtp = otpArray.join("");

    setOtp(newOtp);

    if (otpArray.length > 0 && otpRefs.current[otpArray.length - 1]) {
      otpRefs.current[otpArray.length - 1]?.focus();
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      // Reset state when screen gains focus
      resetState();
    }, [])
  );

  const otpDigits = otp.split("");

  return (
    <SafeAreaView style={styles.safeArea}>
      <CustomAlert
      visible={alertVisible}
      title={alertTitle}
      message={alertMessage}
      onClose={() => setAlertVisible(false)}
    />
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
        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={styles.welcomeContainer}>
            {/* Welcome text that navigates to AdminDashboardPage */}
           {/*  <TouchableOpacity
              onPress={() => navigation.navigate("AdminDashboardPage")}
            > */}
              {/* <Text style={styles.welcomeText}>Welcome to</Text> */}
              <Text style={styles.welcomeText}>{languageText.welcome}</Text>
            {/* </TouchableOpacity> */}

            {/* IND Heart text that navigates to PatientDashboardPage */}
            {/* <TouchableOpacity
              onPress={() => navigation.navigate("DisclaimerPage")}
            > */}
              <Text style={styles.appText}>{languageText.appName}</Text>
            {/* </TouchableOpacity> */}
            {/* Temp Test Link */}
            {/* <TouchableOpacity
              onPress={() => navigation.navigate("TempTestNavigation")}
            >
              <Text style={styles.tempTestLink}>Test Link</Text>
            </TouchableOpacity> */}
          </View>
          <View style={styles.imageContainer}>
            <Animated.Image
              source={require("../../assets/images/login.png")}
              style={[styles.backgroundImage, { transform: [{ scale }] }]}
            />
          </View>
          <View style={styles.formWrapper}>
            <View style={styles.formContainer}>
              {!otpSent ? (
                <View style={styles.phoneContainer}>
                  <TextInput
                    style={[
                      styles.phoneInput,
                      !phoneNumber ? styles.placeholder : null,
                      { textAlignVertical: "top", minHeight: 50 },
                    ]} // Apply placeholder style when input is empty
                    placeholder={languageText.phonePlaceholder}
                    placeholderTextColor="#888" // Set placeholder color
                    value={phoneNumber}
                    onChangeText={(text) => {
                      // Remove non-digit characters and ensure the length is at most 10
                      const cleanedText = text.replace(/\D/g, "").slice(0, 10);
                      setPhoneNumber(cleanedText);
                    }}
                    numberOfLines={2} // Optional: Specify number of lines
                    keyboardType="number-pad"
                    multiline={true}
                    allowFontScaling={false} // Disable font scaling
                  />

                  <TouchableOpacity
                    style={styles.button}
                    onPress={handleSendOtp}
                    disabled={otpSent}
                  >
                    <Text style={styles.buttonText}>
                      {otpSent ? languageText.otpSent : languageText.sendOtp}
                    </Text>
                  </TouchableOpacity>
                  {/* Add Translate button here */}
                  <TouchableOpacity onPress={handleTranslate}>
                    <Text style={styles.buttonTranslateText}>
                      {isTranslatingToTamil
                        ? "தமிழில் படிக்க"
                        : "Translate to English"}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.otpContainer}>
                  <Text style={styles.titleOTP}>Enter OTP</Text>
                  <View style={styles.otpInputWrapper}>
                    <TextInput
                      style={styles.otpBox}
                      value={otpDigits[0] || ""}
                      onChangeText={(text) => handleOtpChange(text, 0)}
                      keyboardType="numeric"
                      maxLength={1}
                      textAlign="center"
                      ref={(ref) => (otpRefs.current[0] = ref)}
                    />
                    <TextInput
                      style={styles.otpBox}
                      value={otpDigits[1] || ""}
                      onChangeText={(text) => handleOtpChange(text, 1)}
                      keyboardType="numeric"
                      maxLength={1}
                      textAlign="center"
                      ref={(ref) => (otpRefs.current[1] = ref)}
                    />
                    <TextInput
                      style={styles.otpBox}
                      value={otpDigits[2] || ""}
                      onChangeText={(text) => handleOtpChange(text, 2)}
                      keyboardType="numeric"
                      maxLength={1}
                      textAlign="center"
                      ref={(ref) => (otpRefs.current[2] = ref)}
                    />
                    <TextInput
                      style={styles.otpBox}
                      value={otpDigits[3] || ""}
                      onChangeText={(text) => handleOtpChange(text, 3)}
                      keyboardType="numeric"
                      maxLength={1}
                      textAlign="center"
                      ref={(ref) => (otpRefs.current[3] = ref)}
                    />
                  </View>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={handleVerifyOtp}
                  >
                    <Text style={styles.buttonText}>Submit OTP</Text>
                  </TouchableOpacity>
                  <View style={styles.timerContainer}>
                    <Text style={styles.timerText}>
                      {resendEnabled ? (
                        <TouchableOpacity onPress={handleResendOtp}>
                          <Text style={styles.resendText}>Resend OTP</Text>
                        </TouchableOpacity>
                      ) : (
                        `Resend available in ${timer}s`
                      )}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    marginTop: 50,
    paddingHorizontal: 10, // Add padding to prevent content from touching screen edges
  },
  alertText: {
    fontSize: 16, // Adjust the font size as needed
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  welcomeContainer: {
    alignItems: "center",
    marginBottom: -20,
    paddingTop: 10,
  },
  welcomeText: {
    bottom: 40,
    fontWeight: "bold",
    fontSize: 26,
    color: "#D73F6E",
    marginBottom: 10,
    textAlign: "center",
  },
  appText: {
    bottom: 40,
    fontSize: 24,
    fontWeight: "bold",
    color: "#878787",
    textAlign: "center",
    marginBottom: 20,
  },
  tempTestLink: {
    top: 500,
    fontSize: 24,
    fontWeight: "bold",
    color: "#c42482",
    textAlign: "center",
    textDecorationLine: "underline",
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: "center",
    paddingBottom: 20,
  },
  imageContainer: {
    width: "90%",
    height: 190, // Reduced height of the image container
    borderRadius: 10,
    overflow: "hidden",
    alignSelf: "center",
    marginTop: 10,
  },
  backgroundImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  formWrapper: {
    marginTop: 10, // Adjust top margin to fit better
    width: "85%",
    alignSelf: "center",
  },
  formContainer: {
    backgroundColor: "white",
    borderRadius: 35,
    padding: 20, // Reduced padding
    shadowColor: "#D73F6E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 15,
  },
  phoneContainer: {
    marginBottom: 10, // Reduced margin
    width: "100%", // Changed width to full to prevent shifting
    marginTop: 20,
    paddingHorizontal: 10,
    alignItems: "center", 
    alignSelf: "center",
    textAlign: "center",
    alignContent: "center",
  },
  phoneInputWrapper: {
    flexDirection: "row", // Arrange items horizontally
    alignItems: "center",
    borderColor: "#d3d3d3",
    borderWidth: 1,
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 10, // Reduced margin
    paddingHorizontal: 10, // Added padding for better alignment
  },
  phoneInput: {
    flex: 1,
    minHeight: 50,
    paddingHorizontal: 10,
    color: "#2F4F4F",
    fontWeight: "600",
    fontSize: 18,
    textAlign: "left",
    textAlignVertical: "center",
    lineHeight: 22,
    paddingVertical: 5,
  },

  placeholder: {
    fontSize: 18, // Match phoneInput fontSize for consistency
    fontWeight: "400", // Reduce weight for placeholder text
    color: "#888", // Ensure placeholder text is visible
    padding: 0, // Remove padding to avoid conflicts
    margin: 0,
    textAlign: "center",
  },

  otpContainer: {
    marginBottom: 10,
    padding: 20,
  },
  otpInputWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  otpBox: {
    flex: 1,
    height: 50,
    borderColor: "#d3d3d3",
    borderWidth: 1,
    borderRadius: 15,
    marginHorizontal: 8, // Reduced space between boxes
    marginVertical: 8, // Reduced vertical margin
  },
  buttonWrapper: {
    alignItems: "center", // Center button horizontally within the form container
    marginTop: 10, // Adjust space above the button
  },
  button: {
    backgroundColor: "#D73F6E",
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },

  buttonTranslateText: {
    color: "#4169E1",
    textDecorationLine: "underline",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center", // Center align text horizontally
    marginTop: 30,
    width: "60%", // This controls the width of the text container
    alignSelf: "center",
  },
  tempBtn: {
    backgroundColor: "transparent", // Set background color for visibility
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 30,
    marginTop: 20, // Add space above the button
    alignItems: "center",
  },
  tempTxt: {
    color: "#1E90FF",
    fontSize: 18,
    fontWeight: "medium",
    textDecorationLine: "underline",
  },
  titleOTP: {
    left: 10,
    color: "#A9A9A9",
  },
  linksContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingHorizontal: 10,
  },
  linkText: {
    fontSize: 14,
    color: "#007BFF", // Set link text color to blue
    textDecorationLine: "underline",
  },
  timerContainer: {
    marginTop: 10,
  },
  timerText: {
    fontSize: 16,
    color: "#666",
  },
  resendText: {
    color: "blue",
    textDecorationLine: "underline",
  },
});

export default LoginPage;