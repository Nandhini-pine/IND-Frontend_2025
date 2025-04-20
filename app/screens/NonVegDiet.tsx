import React, { useState, useEffect, useCallback } from "react";
import {
  Text as RNText,
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TextInput,
  TouchableOpacity,
  Modal,
  Dimensions,
  Platform,
  Alert,
  SafeAreaViewBase,
  StatusBar,
  BackHandler
} from "react-native";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Icon from "react-native-vector-icons/MaterialIcons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../type";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import texts from "../translation/texts";
import { useFocusEffect } from "@react-navigation/native";
import CustomAlert from "../components/CustomAlert";

// Custom Text component to disable font scaling globally 
const Text = (props: any) => { return <RNText {...props} allowFontScaling={false} />; };


interface PatientDetails {
  patient_id: string; // Keep the patient_id string if you need it for other purposes
  diet: string;
  name: string; // Make sure to add this line
}

type NavigationProp = StackNavigationProp<RootStackParamList, "NonVegDietPage">;

interface LegumesState {
  egg: string;
  fish: string;
  salt: string;
  milk: string;
  curd: string;
  butter: string;
  cheese: string;
  paneer: string;
  cream: string;
  ghee: string;
  qty: string;
  others: string;
}

const images = [
  require("../../assets/images/eggplate.jpg"),
  require("../../assets/images/fishplate.jpg"),
  require("../../assets/images/salt.png"),
  require("../../assets/images/milk.png"),
];

const NonVegDietPage: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  // Toggle between Tamil and English based on the button click

  const [isTranslatingToTamil, setIsTranslatingToTamil] = useState(false);

  // Toggle between Tamil and English based on the button click
  const languageText = isTranslatingToTamil ? texts.tamil : texts.english;
  const language: "english" | "tamil" = isTranslatingToTamil
    ? "tamil"
    : "english"; // Update language state dynamically
  const nutrientTitles = isTranslatingToTamil
    ? {
        eggs: "முட்டைகள்", // Tamil for "Eggs"
        fish: "மீன்", // Tamil for "Fish"
        salt: "உப்பு", // Tamil for "Salt"
        milk: "பால்", // Tamil for "Milk"
      }
    : {
        eggs: "Eggs", // English text
        fish: "Fish", // English text
        salt: "Salt", // English text
        milk: "Milk", // English text
      };

  const cardData = [
    { title: nutrientTitles.eggs, hasQuantity: true },
    { title: nutrientTitles.fish, hasQuantity: true },
    { title: nutrientTitles.salt, hasQuantity: true },
    { title: nutrientTitles.milk, hasQuantity: true },
  ];

  // Now you can safely use cardData to initialize responses
  const [responses, setResponses] = useState(
    cardData.map(() => ({ yes: false, quantity: "" }))
  );

  const [isCalendarVisible, setCalendarVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [patientDetails, setPatientDetails] = useState<PatientDetails | null>(
    null
  );
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cancelAlertVisible, setCancelAlertVisible] = useState(false);
  const [regularAlertVisible, setRegularAlertVisible] = useState(false);
  const [alertMode, setAlertMode] = useState("info"); // Info, success, or error


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

  const [legumes, setLegumes] = useState<LegumesState>({
    egg: "",
    fish: "",
    salt: "",
    milk: "",
    curd: "",
    butter: "",
    cheese: "",
    paneer: "",
    cream: "",
    ghee: "",
    qty: "", // Initialize if necessary
    others: "",
  });

  const handleNavigate = () => {
    console.log("Navigating to NonVegDietPage");
    navigation.navigate("NonVegDietPage");
  };

  const handleYes = (index: number) => {
    setResponses((prevResponses) =>
      prevResponses.map((response, i) =>
        i === index
          ? {
              ...response,
              yes: true,
              quantity: response.yes ? response.quantity : "",
            }
          : response
      )
    );
  };

  const handleNo = (index: number) => {
    setResponses((prevResponses) =>
      prevResponses.map((response, i) =>
        i === index ? { ...response, yes: false, quantity: "" } : response
      )
    );
  };

  const handleQuantityChange = (index: number, quantity: string) => {
    setResponses((prevResponses) =>
      prevResponses.map((response, i) =>
        i === index ? { ...response, quantity } : response
      )
    );
  };

  const handleDateChange = (event: any, date?: Date | undefined) => {
    // Check if the date is defined before updating the state
    if (date && event.type !== "dismissed") {
      setSelectedDate(date);
    }
    setShowDatePicker(false);
  };

  const handleLegumeCountChange = (legume: string, value: string) => {
    setLegumes((prevLegumes) => ({
      ...prevLegumes,
      [legume]: value,
    }));
  };

  // Handle Translation
  const handleTranslate = useCallback(() => {
    setIsTranslatingToTamil(prev => !prev);
    console.log("Translate button pressed");
}, []);

  const handleClear = () => {
    setResponses(cardData.map(() => ({ yes: false, quantity: "" })));
    setSelectedDate(null);
    setLegumes({
      egg: "",
      fish: "",
      salt: "",
      milk: "",
      curd: "",
      butter: "",
      cheese: "",
      paneer: "",
      cream: "",
      ghee: "",
      qty: "", // Add if necessary
      others: "",
    });
  };
  /* const handleCancel = () => {
    Alert.alert("Cancel", "Are you sure you want to cancel?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes",
        onPress: () => {
          // Navigate based on patientDetails diet
          if (patientDetails && patientDetails.diet === "Both") {
            navigation.navigate("VegDietPage"); // Navigate to Vegetarian page
          } else {
            navigation.navigate("DailyUploads"); // Navigate to DailyUploads
          }
        },
      },
    ]);
  }; */
  const handleCancel = () => {
    // Trigger the custom alert instead of the default Alert
    setCancelAlertVisible(true);
  };

 /*  const handleSubmit = async () => {
    console.log("Responses before submitting:", responses); // Log responses state for debugging

    if (patientDetails) {
      // Format the date to 'YYYY-MM-DD'
      const formattedDate = selectedDate
        ? selectedDate.toISOString().split("T")[0]
        : null;

      // Prepare the payload
      const requestData = {
        patient_id: patientDetails.patient_id, // Keep it as a string
        date: formattedDate,
        eggs_quantity: responses[0].quantity || 0,
        fish_quantity: responses[1].quantity || 0,
        salt_quantity: responses[2].quantity || 0,
        milk_quantity: responses[3].quantity || 0,
        condensed_milk_quantity: legumes.milk || 0,
        curd_quantity: legumes.curd || 0,
        butter_quantity: legumes.butter || 0,
        cheese_quantity: legumes.cheese || 0,
        paneer_quantity: legumes.paneer || 0,
        cream_quantity: legumes.cream || 0,
        ghee_quantity: legumes.ghee || 0,
        others_name: legumes.others || 0,
        others_quantity: legumes.qty || 0,
      };

      console.log("Request Data:", requestData); // Log the payload

      try {
        const response = await axios.post(
          "https://indheart.pinesphere.in/patient/nonvegetarian-diets/",
          requestData
        );
        console.log("NonVegetarian diet saved successfully:", response.data);

        // Show success alert and navigate to WaterPage
        Alert.alert(
          "Success",
          "Your non-vegetarian diet has been saved successfully!",
          [
            {
              text: "OK",
              onPress: () => {
                navigation.navigate("WaterPage"); // Navigate to WaterPage
              },
            },
          ]
        );
      
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const errorMessages = error.response?.data || {};

          // Handle specific error messages
          if (
            errorMessages.non_field_errors &&
            errorMessages.non_field_errors.includes(
              "The fields patient_id, date must make a unique set."
            )
          ) {
            setAlertTitle("Error");
            setAlertMessage("The dietary entry for this date has already been saved.");
            setAlertMode("error");
          } else if (errorMessages.date) {
            setAlertTitle("Error");
            setAlertMessage("The date for the dietary entry is required.");
            setAlertMode("error");
          } else if (!requestData.patient_id || !requestData.date) {
            setAlertTitle("Error");
            setAlertMessage("Please provide all required values.");
            setAlertMode("error");
          } else {
            setAlertTitle("Error");
            setAlertMessage("There was an issue saving your non-vegetarian diet. Please try again.");
            setAlertMode("error");
          }
        } else {
          setAlertTitle("Error");
          setAlertMessage("An unexpected error occurred. Please try again.");
          setAlertMode("error");
        }
        setAlertVisible(true); // Show error alert
      }
    } else {
      console.error("No patient details available.");
    }
  }; */

  const handleSubmit = async () => {
    console.log("Responses before submitting:", responses); // Log responses state for debugging
  
    if (patientDetails) {
      // Format the date to 'YYYY-MM-DD'
      const formattedDate = selectedDate
        ? selectedDate.toISOString().split("T")[0]
        : null;
  
      // Prepare the payload
      const requestData = {
        patient_id: patientDetails.patient_id, // Keep it as a string
        date: formattedDate,
        eggs_quantity: responses[0].quantity || 0,
        fish_quantity: responses[1].quantity || 0,
        salt_quantity: responses[2].quantity || 0,
        milk_quantity: responses[3].quantity || 0,
        condensed_milk_quantity: legumes.milk || 0,
        curd_quantity: legumes.curd || 0,
        butter_quantity: legumes.butter || 0,
        cheese_quantity: legumes.cheese || 0,
        paneer_quantity: legumes.paneer || 0,
        cream_quantity: legumes.cream || 0,
        ghee_quantity: legumes.ghee || 0,
        others_name: legumes.others || 0,
        others_quantity: legumes.qty || 0,
      };
  
      console.log("Request Data:", requestData); // Log the payload
  
      try {
        const response = await axios.post(
          "https://indheart.pinesphere.in/patient/nonvegetarian-diets/",
          requestData
        );
        console.log("NonVegetarian diet saved successfully:", response.data);
  
        // Show success alert and navigate to WaterPage
        setAlertTitle(languageText.alertSuccessTitle);
        setAlertMessage(languageText.nonVegSuccessAlert);
        setAlertMode("success");
        setAlertVisible(true); // Show success alert after saving
  
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const errorMessages = error.response?.data || {};
  
          // Handle specific error messages
          if (
            errorMessages.non_field_errors &&
            errorMessages.non_field_errors.includes(
              "The fields patient_id, date must make a unique set."
            )
          ) {
            setAlertTitle(languageText.alertErrorTitle);
            setAlertMessage(languageText.nonVegExistingErrorMessage);
            setAlertMode("error");
          } else if (errorMessages.date) {
            setAlertTitle(languageText.alertErrorTitle);
            setAlertMessage(languageText.existingAlert);
            setAlertMode("error");
          } else if (!requestData.patient_id || !requestData.date) {
            setAlertTitle(languageText.alertErrorTitle);
            setAlertMessage(languageText.missingAlert);
            setAlertMode("error");
          } else {
            setAlertTitle(languageText.alertErrorTitle);
            setAlertMessage(languageText.tryAgainAlert);
            setAlertMode("error");
          }
        } else {
          setAlertTitle(languageText.alertErrorTitle);
          setAlertMessage(languageText.unexpectedError);
          setAlertMode("error");
        }
        setAlertVisible(true); // Show error alert if there was an issue
      }
    } else {
      console.error("No patient details available.");
    }
  };
  return (
    <SafeAreaProvider>
     <CustomAlert
  title={languageText.alertCancelTitle}
  message={languageText.alertCancelMessage}
  visible={cancelAlertVisible}
  onClose={() => setCancelAlertVisible(false)}
  mode="confirm"
  onYes={() => {
    // Ensure that navigation happens when "Yes" is clicked
    navigation.navigate("PatientDashboardPage"); // Navigate to PatientDashboardPage
  }}
  onNo={() => setCancelAlertVisible(false)} // Close the alert on No
  okText={languageText.alertOk} // Translated OK text
        yesText={languageText.alertYes} // Translated Yes text
        noText={languageText.alertNo} // Translated No text
/>
<CustomAlert
  title={alertTitle}
  message={alertMessage}
  visible={alertVisible}
  onClose={() => {
    setAlertVisible(false); // Close the alert
    if (alertMode === "success") {
      // Navigate to WaterPage after the success alert closes
      navigation.navigate("WaterPage");
    }
  }}
  onYes={() => {
    setAlertVisible(false); // Close the alert
    if (alertMode === "success") {
      // Navigate to WaterPage after the success alert closes
      navigation.navigate("WaterPage");
    }
  }}
  okText={languageText.alertOk} // Translated OK text
        yesText={languageText.alertYes} // Translated Yes text
        noText={languageText.alertNo} // Translated No text
/>
     


    <SafeAreaView style={styles.container}>
      <Text style={styles.greeting}>
        Hi, {patientDetails ? patientDetails.name : "Loading..."} !
      </Text>
      <View style={styles.translateContainer}>
        <TouchableOpacity
          onPress={handleTranslate}
          style={styles.translateButton}
        >
          <Icon
            name={isTranslatingToTamil ? "language" : "translate"}
            size={20}
            color="#4169E1"
            style={styles.icon}
          />
          <Text style={styles.buttonTranslateText}>
            {isTranslatingToTamil ? "Translate to English" : "தமிழில் படிக்க"}
          </Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        {/* Navigation Button */}

        <View style={styles.topContainer}>
          <Image
            source={require("../../assets/images/nv.jpg")}
            style={styles.topImage}
          />
          <View style={styles.textOverlay}>
            <Text style={styles.topText}>{languageText.evaluate}</Text>
            <Text style={styles.topSubText}>
              {languageText.nonVegetarianDiet}
            </Text>
          </View>
        </View>

        {/* Date Picker Field with Image */}
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

        {/* Nutrient Intake Journal */}
        <Text style={styles.cardsTitle}>
          {languageText.proteinIntakeJournal}
        </Text>
        <View style={styles.cardsContainer}>
          {cardData.map((card, index) => (
            <View key={index} style={styles.cardRow}>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>{card.title}</Text>
                <Image source={images[index]} style={styles.cardImage} />
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[
                      styles.button,
                      responses[index].yes
                        ? styles.yesButtonActive
                        : styles.yesButtonInactive,
                    ]}
                    onPress={() => handleYes(index)}
                  >
                    <Text style={styles.buttonText}>{languageText.yes}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.button,
                      !responses[index].yes
                        ? styles.noButtonActive
                        : styles.noButtonInactive,
                    ]}
                    onPress={() => handleNo(index)}
                  >
                    <Text style={styles.buttonText}>{languageText.no}</Text>
                  </TouchableOpacity>
                </View>
                {card.hasQuantity && responses[index].yes && (
                  <View style={styles.quantityContainer}>
                    <TextInput
                      style={[styles.quantityInput, { paddingLeft: 25 }]}
                      /* placeholder={card.title === "Salt" ? "Quantity in gm" : card.title === "Milk" ? "Quantity in ml" : "Quantity in cups"} */
                      placeholder={texts[language].quantityPlaceholder}
                      keyboardType="numeric"
                      value={responses[index].quantity}
                      onChangeText={(text) => handleQuantityChange(index, text)}
                    />
                    <Icon
                      name="straighten"
                      size={16}
                      color="#3CB371"
                      style={styles.quantityIcon}
                    />
                  </View>
                )}
              </View>
            </View>
          ))}

          {/* Milk in ML section */}

          {/* Legumes Section */}
          <View style={styles.section}>
            <Text style={styles.title}>{languageText.milkProducts}</Text>

            <View style={styles.legumeContainer}>
              <LinearGradient
                colors={["#f5f7fa", "#c3cfe2"]} // Start and end colors for the gradient
                style={styles.legumeBox}
              >
                <Text style={styles.legumeLabel}>
                  {languageText.condensedMilk}
                </Text>
              </LinearGradient>

              <TextInput
                style={styles.legumeInput}
                placeholder={texts[language].quantityPlaceholder}
                keyboardType="numeric"
                value={legumes.milk}
                onChangeText={(text) => handleLegumeCountChange("milk", text)}
              />
            </View>

            <View style={styles.legumeContainer}>
              <LinearGradient
                colors={["#f5f7fa", "#c3cfe2"]}
                style={styles.legumeBox}
              >
                <Text style={styles.legumeLabel}>{languageText.curd}</Text>
              </LinearGradient>
              <TextInput
                style={styles.legumeInput}
                placeholder={texts[language].quantityPlaceholder}
                keyboardType="numeric"
                value={legumes.curd}
                onChangeText={(text) => handleLegumeCountChange("curd", text)}
              />
            </View>

            <View style={styles.legumeContainer}>
              <LinearGradient
                colors={["#f5f7fa", "#c3cfe2"]}
                style={styles.legumeBox}
              >
                <Text style={styles.legumeLabel}>{languageText.butter}</Text>
              </LinearGradient>
              <TextInput
                style={styles.legumeInput}
                placeholder={texts[language].quantityPlaceholder}
                keyboardType="numeric"
                value={legumes.butter}
                onChangeText={(text) => handleLegumeCountChange("butter", text)}
              />
            </View>

            <View style={styles.legumeContainer}>
              <LinearGradient
                colors={["#f5f7fa", "#c3cfe2"]}
                style={styles.legumeBox}
              >
                <Text style={styles.legumeLabel}>{languageText.cheese}</Text>
              </LinearGradient>
              <TextInput
                style={styles.legumeInput}
                placeholder={texts[language].quantityPlaceholder}
                keyboardType="numeric"
                value={legumes.cheese}
                onChangeText={(text) => handleLegumeCountChange("cheese", text)}
              />
            </View>

            <View style={styles.legumeContainer}>
              <LinearGradient
                colors={["#f5f7fa", "#c3cfe2"]}
                style={styles.legumeBox}
              >
                <Text style={styles.legumeLabel}>{languageText.paneer}</Text>
              </LinearGradient>
              <TextInput
                style={styles.legumeInput}
                placeholder={texts[language].quantityPlaceholder}
                keyboardType="numeric"
                value={legumes.paneer}
                onChangeText={(text) => handleLegumeCountChange("paneer", text)}
              />
            </View>

            <View style={styles.legumeContainer}>
              <LinearGradient
                colors={["#f5f7fa", "#c3cfe2"]}
                style={styles.legumeBox}
              >
                <Text style={styles.legumeLabel}>{languageText.cream}</Text>
              </LinearGradient>
              <TextInput
                style={styles.legumeInput}
                placeholder={texts[language].quantityPlaceholder}
                keyboardType="numeric"
                value={legumes.cream}
                onChangeText={(text) => handleLegumeCountChange("cream", text)}
              />
            </View>

            <View style={styles.legumeContainer}>
              <LinearGradient
                colors={["#f5f7fa", "#c3cfe2"]}
                style={styles.legumeBox}
              >
                <Text style={styles.legumeLabel}>{languageText.ghee}</Text>
              </LinearGradient>
              <TextInput
                style={styles.legumeInput}
                placeholder={texts[language].quantityPlaceholder}
                keyboardType="numeric"
                value={legumes.ghee}
                onChangeText={(text) => handleLegumeCountChange("ghee", text)}
              />
            </View>

            <View>
              {/* <LinearGradient
    colors={["#f5f7fa", "#c3cfe2"]}
    style={styles.legumeBox}
  > */}
              <Text style={styles.legumeOtherLabel}>{languageText.others}</Text>
              {/* </LinearGradient> */}
              <View style={styles.legumeInputContainer}>
                <TextInput
                  style={styles.legumeInputOther}
                  placeholder={texts[language].otherEatablesPlaceholder}
                  value={legumes.others}
                  onChangeText={(text) => {
                    handleLegumeCountChange("others", text);
                  }}
                />
                <TextInput
                  style={styles.legumeInputQty}
                  placeholder={texts[language].quantityPlaceholder}
                  keyboardType="numeric"
                  value={legumes.qty}
                  onChangeText={(text) => handleLegumeCountChange("qty", text)}
                />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
      {/* Footer Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.footerButtonText}>{languageText.submit}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
          <Text style={styles.footerButtonText}>{languageText.clear}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.footerButtonText}>{languageText.cancel}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    marginTop: 0,
    paddingTop: 60,
    paddingBottom: 10, // Ensure space at the bottom for the submit button
    backgroundColor: "#fff",
  },
  scrollContainer: {
    padding: 10,
  },
  greeting: {
    left: 20,
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
    top: 15,
  },
  topContainer: {
    width: Dimensions.get("window").width - 20,
    height: 200,
    backgroundColor: "#f0f0f0",
    borderRadius: 30,
    borderColor: "#c0c0c0",
    borderWidth: 1,
    marginBottom: 10,
    overflow: "hidden",
    elevation: 5,
  },
  topImage: {
    width: "100%",
    height: "150%",
    borderRadius: 10,
  },
  textOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
  topText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,

    bottom: 40,
    textAlign: "center",
    alignItems: "center",
  },
  topSubText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    bottom: 40,
    flexWrap: "wrap",
    width: "100%",
  },
  cardRow: {
    width: "48%",
    marginBottom: 10, // Space between rows
  },
  cardsContainer: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap", // Allows the cards to wrap onto multiple lines
    justifyContent: "space-between", // Adjusts spacing between cards
    bottom: 60,
  },
  cardWrapper: {
    width: Dimensions.get("window").width - 20,
    marginBottom: 20,
  },
  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 10,
    elevation: 2, // Optional, for shadow effect on Android
  },
  cardsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 10,

    left: 5,
    textAlign: "center",
    color: "#4B4B4B",
    bottom: 65,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
    color: "#505050",
  },
  fruitsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 10,
    left: 130,
    textAlign: "center",
    color: "#4B4B4B",
    bottom: 65,
  },

  cardImage: {
    width: "100%",
    height: 150,
    resizeMode: "cover",
    marginBottom: 8,
  },
  datePickerContainer: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginVertical: 10,
  },

  yesButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
    marginHorizontal: 5,
    backgroundColor: "#00FF00",
  },
  noButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
    marginHorizontal: 5,
    backgroundColor: "#FA8072", // Red color for "No" button
  },

  quantityInput: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 30,
    paddingHorizontal: 10,
    paddingVertical: 8,
    width: "100%",
    textAlign: "center",
    marginTop: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
    marginHorizontal: 5,
    borderWidth: 2, // Border width for inactive state
  },
  yesButtonActive: {
    backgroundColor: "#3CB371", // Green color for active "Yes" button
    borderColor: "transparent",
  },
  noButtonActive: {
    backgroundColor: "#FF6347", // Red color for active "No" button
    borderColor: "transparent",
  },
  yesButtonInactive: {
    borderColor: "#fff",
    backgroundColor: "#f3f3f3",
  },
  noButtonInactive: {
    borderColor: "#fff",
    backgroundColor: "#f3f3f3",
  },
  buttonText: {
    fontSize: 16,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    position: "relative", // Set position relative to contain the icon
  },
  quantityIcon: {
    position: "absolute",
    left: 10, // Adjust as needed
    color: "#c0c0c0",
    bottom: 8,
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
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  modalContainer: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalCloseButton: {
    marginTop: 15,
    backgroundColor: "#00FF00",
    padding: 10,
    borderRadius: 5,
  },
  modalCloseText: {
    color: "#fff",
    fontSize: 16,
  },
  fruitContainer: {
    borderRadius: 15,
    padding: 10,
    backgroundColor: "transparent", // Or any other style you need
    width: "100%",
  },

  guavaContainer: {
    borderRadius: 15,
    padding: 10,
    backgroundColor: "#D0F0C0", // Set a visible color
    height: 80, // Adjust height as needed
    width: "100%", // Adjust width as needed
    //paddingBottom: 20,
    marginBottom: 20,
  },
  guavaImage: {
    width: "100%",
    height: "250%",
    bottom: 80,
    right: 120,
    resizeMode: "contain",
  },
  guavaQty: {
    width: "38%",
    textAlign: "center",
    left: 180,
    top: 5,
    height: 40,
    backgroundColor: "#E8F8E0",
    borderRadius: 30,
    marginTop: 5,
  },
  orangeContainer: {
    borderRadius: 15,
    padding: 10,
    backgroundColor: "#FFDAB9",
    height: 80,
    width: "100%",
    marginBottom: 20,
  },
  orangeImage: {
    width: "100%",
    height: "270%",
    bottom: 85,
    left: 120,
    resizeMode: "contain",
  },
  orangeQty: {
    width: "38%",
    textAlign: "center",
    right: 0,
    top: 5,
    height: 40,
    backgroundColor: "#FFF0E0",
    borderRadius: 30,
    marginTop: 5,
  },
  appleContainer: {
    borderRadius: 15,
    padding: 10,
    backgroundColor: "#F5B5C5",
    height: 80,
    width: "100%",
    marginBottom: 20,
  },
  appleImage: {
    width: "100%",
    height: "230%",
    top: -80,
    right: 130,
    resizeMode: "contain",
  },
  appleQty: {
    width: "38%",
    textAlign: "center",
    left: 180,
    top: 5,
    height: 40,
    backgroundColor: "#FAD1DB",
    borderRadius: 30,
    marginTop: 5,
  },
  grapesContainer: {
    borderRadius: 15,
    padding: 10,
    backgroundColor: "#E3E4FA",
    height: 80,
    width: "100%",
    marginBottom: 20,
  },
  grapesImage: {
    width: "100%",
    height: "170%",
    bottom: 60,
    left: 130,
    resizeMode: "contain",
  },
  grapesQty: {
    width: "38%",
    textAlign: "center",
    right: 0,
    top: 5,
    height: 40,
    backgroundColor: "#F1F2FD",
    borderRadius: 30,
    marginTop: 5,
  },
  muskmelonContainer: {
    borderRadius: 15,
    padding: 10,
    backgroundColor: "#C5D3C1",
    height: 80,
    width: "100%",
    marginBottom: 20,
  },
  muskmelonImage: {
    width: "100%",
    height: "160%",
    bottom: 55,
    right: 120,
    resizeMode: "contain",
  },
  muskmelonQty: {
    width: "38%",
    textAlign: "center",
    left: 200,
    top: 5,
    height: 40,
    backgroundColor: "#E0E9DE",
    borderRadius: 30,
    marginTop: 5,
  },
  watermelonContainer: {
    borderRadius: 15,
    padding: 10,
    backgroundColor: "#ACE1AF",
    height: 80,
    width: "100%",
    marginBottom: 20,
  },
  watermelonImage: {
    width: "100%",
    height: "170%",
    bottom: 60,
    left: 120,
    resizeMode: "contain",
  },
  watermelonQty: {
    width: "38%",
    textAlign: "center",
    right: 0,
    top: 5,
    height: 40,
    backgroundColor: "#D9F2E0",
    borderRadius: 30,
    marginTop: 5,
  },
  othersContainer: {
    borderRadius: 15,
    padding: 10,
    backgroundColor: "#FFFACD",
    height: 80,
    width: "100%",
    marginBottom: 20,
  },
  othersImage: {
    width: "100%",
    height: "160%",
    bottom: 60,
    right: 120,
    resizeMode: "contain",
  },
  othersQty: {
    width: "38%",
    textAlign: "center",
    left: 200,
    top: 5,
    height: 40,
    backgroundColor: "#FFFFF0",
    borderRadius: 30,
    marginTop: 5,
  },
  guavaTitle: {
    position: "absolute",
    right: 200,
    top: 25,
    fontSize: 16,
    fontWeight: "bold",

    padding: 5,
  },

  orangeTitle: {
    position: "absolute",
    left: 160,
    top: 25,
    fontSize: 16,
    fontWeight: "bold",

    padding: 5,
  },
  appleTitle: {
    position: "absolute",
    right: 210,
    top: 25,
    fontSize: 16,
    fontWeight: "bold",

    padding: 5,
  },
  grapesTitle: {
    position: "absolute",
    left: 190,
    top: 25,
    fontSize: 16,
    fontWeight: "bold",

    padding: 5,
  },
  muskmelonTitle: {
    position: "absolute",
    right: 140,
    top: 10,
    fontSize: 16,
    fontWeight: "bold",

    padding: 5,
  },
  watermelonTitle: {
    position: "absolute",
    left: 150,
    bottom: 15,
    fontSize: 16,
    fontWeight: "bold",
    color: "black",

    borderRadius: 5,
  },
  othersTitle: {
    position: "absolute",
    top: 10,
    right: 170,
    fontSize: 16,
    fontWeight: "bold",

    padding: 5,
  },

  section: {
    padding: 16,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#ddd",
    width: "100%",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    paddingBottom: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  textInputContainer: {
    flex: 1,
  },
  legumeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    justifyContent: "space-between",
  },
  legumeBox: {
    flex: 1,
    backgroundColor: "#f8f8f8",
    borderRadius: 30,
    padding: 15,
    marginRight: 10,
    justifyContent: "center",
    shadowColor: "#000", // Shadow color
    shadowOffset: { width: 0, height: 2 }, // Shadow offset
    shadowOpacity: 0.2, // Shadow opacity
    shadowRadius: 4, // Shadow blur radius
    elevation: 4,
  },
  legumeLabel: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  legumeInputContainer: {
    marginBottom: 20,
  },
  legumeInput: {
    width: 80,
    height: 40,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    textAlign: "center",
    paddingHorizontal: 10,
  },
  legumeInputQty: {
    width: "100%",
    height: 40,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    textAlign: "center",
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 10,
  },
  legumeInputOther: {
    width: "100%",
    height: 60,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    textAlign: "left",
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  legumeOtherLabel: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "left",
    marginBottom: 10,
    padding: 5,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    backgroundColor: "#fff",
    top: 10,
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
  navigationButton: {
    backgroundColor: "transparent",
    padding: 10,
    borderRadius: 5,
    margin: 10,
    alignItems: "center",
  },
  navigationButtonText: {
    color: "red",
    fontSize: 16,
    fontWeight: "bold",
  },

  translateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "transparent", // Light background for contrast
    width: "100%", // Slightly reduced width for padding
    height: 100,
    marginBottom: 1,
    borderRadius: 15,
    top: 15,
    padding: 10,
    marginLeft: 5,
  },
  translateButton: {
    position: "absolute",
    bottom: 10, // Position at the top
    right: 10, // Adjust right spacing as needed
    backgroundColor: "#ffffff",
    flexDirection: "row", // Align items horizontally
    alignItems: "center", // Center items vertically
    padding: 7,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1,
    marginBottom: 10,
  },
  buttonTranslateText: {
    color: "#4169E1", // Text color
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 5, // Space between icon and text
  },
});

export default NonVegDietPage;
