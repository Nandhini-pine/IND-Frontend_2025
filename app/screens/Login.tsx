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
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../type"; 
import AsyncStorage from "@react-native-async-storage/async-storage";
import texts from "../translation/texts";
import CustomAlert from "../components/CustomAlert";

// Custom Text component
const Text = (props: TextProps) => {
  return <RNText {...props} allowFontScaling={false} />;
};

type LoginPageNavigationProp = StackNavigationProp<RootStackParamList, "LoginPage">;

const LoginPage: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [isTranslatingToTamil, setIsTranslatingToTamil] = useState(true);
  const navigation = useNavigation<LoginPageNavigationProp>();
  const languageText = isTranslatingToTamil ? texts.english : texts.tamil;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.1, duration: 1000, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ]).start(() => animate());
    };
    animate();
  }, [scale]);

  const handleLogin = async () => {
    if (phoneNumber.length !== 10) {
      setAlertTitle("Error");
      setAlertMessage("Phone number must be exactly 10 digits.");
      setAlertVisible(true);
      return;
    }

    try {
      const response = await fetch("https://indheart.pinesphere.in/api/api/login_with_mobile/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ phone_number: phoneNumber }).toString(),
      });

      const data = await response.json();

      if (data.status === "success") {
        await AsyncStorage.setItem("phoneNumber", phoneNumber);
        if (data.user_type === "Admin") {
          navigation.navigate("AdminDashboardPage");
        } else {
          if (data.is_first_time_login) {
            navigation.navigate("DisclaimerPage");
          } else {
            navigation.navigate("PatientDashboardPage");
          }
        }
      } else {
        setAlertTitle("Error");
        setAlertMessage(data.message);
        setAlertVisible(true);
      }
    } catch (error) {
      console.error("Error in handleLogin:", error);
      setAlertTitle("Error");
      setAlertMessage("Failed to log in. Please try again later.");
      setAlertVisible(true);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <CustomAlert visible={alertVisible} title={alertTitle} message={alertMessage} onClose={() => setAlertVisible(false)} />
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>{languageText.welcome}</Text>
            <Text style={styles.appText}>{languageText.appName}</Text>
          </View>
          <View style={styles.imageContainer}>
            <Animated.Image source={require("../../assets/images/login.png")} style={[styles.backgroundImage, { transform: [{ scale }] }]} />
          </View>
          <View style={styles.formWrapper}>
            <View style={styles.formContainer}>
              <View style={styles.phoneContainer}>
                <TextInput
                  style={[styles.phoneInput, !phoneNumber ? styles.placeholder : null]}
                  placeholder="Enter Mobile Number"
                  placeholderTextColor="#888"
                  value={phoneNumber}
                  onChangeText={(text) => setPhoneNumber(text.replace(/\D/g, "").slice(0, 10))}
                  keyboardType="number-pad"
                  allowFontScaling={false}
                />
                <TouchableOpacity style={styles.button} onPress={handleLogin}>
                  <Text style={styles.buttonText}>Login</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setIsTranslatingToTamil(!isTranslatingToTamil)}>
                  <Text style={styles.buttonTranslateText}>
                    {isTranslatingToTamil ? "தமிழில் படிக்க" : "Translate to English"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", marginTop: 50, paddingHorizontal: 10 },
  safeArea: { flex: 1, backgroundColor: "#fff" },
  welcomeContainer: { alignItems: "center", marginBottom: -20, paddingTop: 10 },
  welcomeText: { bottom: 40, fontWeight: "bold", fontSize: 26, color: "#D73F6E", marginBottom: 10, textAlign: "center" },
  appText: { bottom: 40, fontSize: 24, fontWeight: "bold", color: "#878787", textAlign: "center", marginBottom: 20 },
  scrollView: { flexGrow: 1, justifyContent: "center", paddingBottom: 20 },
  imageContainer: { width: "90%", height: 190, borderRadius: 10, overflow: "hidden", alignSelf: "center", marginTop: 10 },
  backgroundImage: { width: "100%", height: "100%", resizeMode: "contain" },
  formWrapper: { marginTop: 10, width: "85%", alignSelf: "center" },
  formContainer: { backgroundColor: "white", borderRadius: 35, padding: 20, shadowColor: "#D73F6E", elevation: 15 },
  phoneContainer: { marginBottom: 10, width: "100%", marginTop: 20, paddingHorizontal: 10, alignItems: "center" },
  phoneInput: { flex: 1, minHeight: 50, paddingHorizontal: 10, color: "#2F4F4F", fontWeight: "600", fontSize: 18, textAlign: "left" },
  placeholder: { fontSize: 18, fontWeight: "400", color: "#888", textAlign: "center" },
  button: { backgroundColor: "#D73F6E", borderRadius: 25, paddingVertical: 15, paddingHorizontal: 30, alignItems: "center" },
  buttonText: { color: "white", fontSize: 18, fontWeight: "bold" },
  buttonTranslateText: { color: "#4169E1", textDecorationLine: "underline", fontSize: 16, fontWeight: "700", textAlign: "center", marginTop: 30 },
});

export default LoginPage;
