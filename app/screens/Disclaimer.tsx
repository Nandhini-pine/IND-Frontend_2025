import React, { useState, useEffect } from "react";
import {
  View,
  Text as RNText,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  StatusBar,
  Platform,
  SafeAreaView,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../../type";
//import { SafeAreaView } from 'react-native-safe-area-context';
import { SafeAreaProvider } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomAlert from "../components/CustomAlert";
// Custom Text component to disable font scaling globally
const Text = (props: any) => {
  return <RNText {...props} allowFontScaling={false} />;
};

type DisclaimerPageNavigationProp = StackNavigationProp<
  RootStackParamList,
  "DisclaimerPage"
>;

const DisclaimerPage: React.FC = () => {
  const navigation = useNavigation<DisclaimerPageNavigationProp>();
  const [isChecked, setIsChecked] = useState(false); // State for checkbox
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');


  // Fetch phone number and role after login
  useEffect(() => {
    const fetchPhoneNumber = async () => {
      const storedPhoneNumber = await AsyncStorage.getItem("phoneNumber");
      if (storedPhoneNumber) {
        setPhoneNumber(storedPhoneNumber);
        console.log("Phone Number:", storedPhoneNumber); // Log phone number

        // After getting phone number, you would typically fetch the role (admin or patient) here
        fetchRole(storedPhoneNumber);
      }
    };

    const fetchRole = async (phone: string) => {
      // Example: You can make an API call or access a local storage value to get the role
      // Replace this with your logic to fetch the role based on the phone number
      // For now, we'll assume a dummy role fetching logic
      // Fetch role (admin or patient) based on phone number
      const fetchedRole = phone === "adminPhone" ? "Admin" : "Patient"; // Example condition
      setRole(fetchedRole);
      console.log("User Role:", fetchedRole); // Log the role (Admin or Patient)
    };

    fetchPhoneNumber();
  }, []);

  const handleProceed = async () => {
    if (isChecked) {
      if (role === "Patient") {
        try {
          const response = await fetch("https://indheart.pinesphere.in/api/api/mark_first_time_login_false/", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ phone_number: phoneNumber }),
          });
  
          const data = await response.json();
          console.log("API Response:", data);
  
          if (data.status === "success") {
            navigation.navigate("PatientDashboardPage");
          } else {
            Alert.alert("Error", data.message);
          }
        } catch (error) {
          console.error("API Error:", error);
          Alert.alert("Error", "Failed to update first time login status.");
        }
      } else {
        navigation.navigate("AdminDashboardPage");
      }
    } else {
      setAlertTitle("Disclaimer");
      setAlertMessage("Please acknowledge the disclaimer by checking the box.");
      setAlertVisible(true);
    }
  };
  

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent={true}
        />
        <View style={styles.container}>
          <Text style={styles.title}>Disclaimer</Text>
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
          >
            <Text style={styles.content}>
              Welcome to IND HEART SURAKSHA app. This app is designed to
              facilitate healthy life for heart disease patient.
            </Text>
            <Text style={styles.content}>
              This app stores basic information regarding your age and
              lifestyle. The data can be accessed by the patients and research
              team only. The collected data is stored confidentially and will be
              used only for research purposes.
            </Text>
            <Text style={styles.content}>
              This software serves as your personal guide to aid in heart
              disease prevention. If you need medical assistance in case of any
              emergency, always get in touch with your Doctor or consultant.
            </Text>
            <View style={styles.coverImageContainer}>
              <Image
                source={require("../../assets/images/disclaimer.jpg")}
                style={styles.coverImage}
              />
            </View>
          </ScrollView>

          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => setIsChecked(!isChecked)}
            >
              <View
                style={isChecked ? styles.checkedBox : styles.uncheckedBox}
              />
              <Text style={styles.checkboxText}>
                I have read and understood the disclaimer
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleProceed}>
            <Text style={styles.buttonText}>Proceed</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    marginTop: Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0, // Adjust for status bar height
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    paddingBottom: 0,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
    textAlign: "center",
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 30,
    color: "#555",
    paddingRight: 15,
    textAlign: "left",
  },
  button: {
    backgroundColor: "#DC143C",
    padding: 15,
    borderRadius: 30,
    alignItems: "center",
    margin: 0,
    width: "40%",
    alignSelf: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
  },
  coverImageContainer: {
    marginBottom: 5,
    paddingHorizontal: 15,
    width: "100%",
    height: 230,
    justifyContent: "center",
    alignSelf: "center",
    alignItems: "center",
  },
  coverImage: {
    width: "115%",
    height: "100%",
    borderRadius: 30,
    borderColor: "#fff",
    borderWidth: 1,
    bottom: 28,
    alignSelf: "center",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
    paddingLeft: 15,
  },
  checkbox: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkedBox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#DC143C",
    backgroundColor: "#DC143C",
    marginRight: 10,
  },
  uncheckedBox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#DC143C",
    backgroundColor: "#fff",
    marginRight: 10,
  },
  checkboxText: {
    fontSize: 16,
    color: "#333",
  },
});

export default DisclaimerPage;
