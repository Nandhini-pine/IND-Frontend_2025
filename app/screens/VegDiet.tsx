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
  BackHandler,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../type";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import texts from "../translation/texts";
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
}

type LanguageType = "english" | "tamil";
type NavigationProp = StackNavigationProp<RootStackParamList, "VegDietPage">;

const images = [
  require("../../assets/images/sprouts.png"),
  require("../../assets/images/cookedveggie.png"),
  require("../../assets/images/salad.png"),
  require("../../assets/images/greens.png"),
];

// Toggle between Tamil and English based on the button click

const VegDietPage: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [patientDetails, setPatientDetails] = useState<PatientDetails | null>(
    null
  );
  const [isTranslatingToTamil, setIsTranslatingToTamil] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cancelAlertVisible, setCancelAlertVisible] = useState(false);
  const [regularAlertVisible, setRegularAlertVisible] = useState(false);
  const [alertMode, setAlertMode] = useState("info"); // Info, success, or error

  // Toggle between Tamil and English based on the button click
  const languageText = isTranslatingToTamil ? texts.tamil : texts.english;
  const language: "english" | "tamil" = isTranslatingToTamil
    ? "tamil"
    : "english"; // Update language state dynamically

  const nutrientTitles = isTranslatingToTamil
    ? {
        nutrientIntakeJournal: "நூற்பொருள் உண்ணல் தினசரி",
        nutritiousSprouts: "சத்தான வளர்முளைகள்",
        cookedvegetables: "சமைத்த காய்கறிகள்",
        crispFreshSalads: "சாலட்",
        vitalGreens: "அவசியமான பச்சை",
      }
    : {
        nutrientIntakeJournal: "Nutrient Intake Journal",
        nutritiousSprouts: "Nutritious Sprouts",
        cookedvegetables: "Cooked Vegetables",
        crispFreshSalads: "Crisp Fresh Salads",
        vitalGreens: "Vital Greens",
      };

  const cardData = [
    { title: nutrientTitles.nutritiousSprouts, hasQuantity: true },
    { title: nutrientTitles.cookedvegetables, hasQuantity: true },
    { title: nutrientTitles.crispFreshSalads, hasQuantity: true },
    { title: nutrientTitles.vitalGreens, hasQuantity: true },
  ];
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
        // Remove id if not needed
      });
    } catch (error) {
      console.error("Error fetching patient details:", error);
    }
  };

  const [responses, setResponses] = useState(
    cardData.map(() => ({ yes: false, quantity: "" }))
  );

  const [isCalendarVisible, setCalendarVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [showAlert, setShowAlert] = useState(false);

  const [quantities, setQuantities] = useState({
    guava: "",
    orange: "",
    apple: "",
    grapes: "",
    muskmelon: "",
    watermelon: "",
    others: "",
    othersFruit: "",
    qty: "",
  });

  const [legumes, setLegumes] = React.useState({
    greenGram: "",
    chickpea: "",
    soybean: "",
    cowpea: "",
    channa: "",
    kidneybeans: "",
    nuts: "",
    others: "",
    qty: "",
  });

  const handleNavigate = () => {
    if (patientDetails && patientDetails.diet === "Both") {
      navigation.navigate("NonVegDietPage");
    }
  };

  const handleYes = (index: number) => {
    setResponses((prevResponses) =>
      prevResponses.map((response, i) =>
        i === index ? { ...response, yes: true } : response
      )
    );
  };

  const handleNo = (index: number) => {
    setResponses((prevResponses) =>
      prevResponses.map((response, i) =>
        i === index ? { ...response, yes: false } : response
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
    setIsTranslatingToTamil((prev) => !prev);
    console.log("Translate button pressed");
  }, []);

  const handleClear = () => {
    setResponses(cardData.map(() => ({ yes: false, quantity: "" })));
    setSelectedDate(null);
    setLegumes({
      greenGram: "",
      chickpea: "",
      soybean: "",
      others: "",
      cowpea: "",
      channa: "",
      kidneybeans: "",
      nuts: "",
      qty: "",
    });
    setQuantities({
      guava: "",
      orange: "",
      apple: "",
      grapes: "",
      muskmelon: "",
      watermelon: "",
      others: "",
      othersFruit: "", // Add this new field

      qty: "",
    });
  };

  const handleSubmit = async () => {
    console.log("Responses before submitting:", responses); // Log responses state for debugging

    if (patientDetails) {
      // Format the date to 'YYYY-MM-DD'
      const formattedDate = selectedDate
        ? selectedDate.toISOString().split("T")[0]
        : null;

      // Prepare the payload with only guava
      const requestData = {
        patient_id: patientDetails.patient_id,
        date: formattedDate,
        sprouts_quantity: responses[0].quantity || 0,
        cooked_vegetables_quantity: responses[1].quantity || 0,
        fresh_salads_quantity: responses[2].quantity || 0,
        green_leafy_vegetables: responses[3].yes || false,

        guava_quantity: quantities.guava || 0,
        orange_quantity: quantities.orange || 0,
        apple_quantity: quantities.apple || 0,
        grapes_quantity: quantities.grapes || 0,
        muskmelon_quantity: quantities.muskmelon || 0,
        watermelon_quantity: quantities.watermelon || 0,
        other_fruits: quantities.othersFruit || 0,
        other_fruits_quantity: quantities.others || 0,
        green_gram_quantity: legumes.greenGram || 0,
        chickpea_quantity: legumes.chickpea || 0,
        soybean_quantity: legumes.soybean || 0,
        cowpea_quantity: legumes.cowpea || 0,
        channa_quantity: legumes.channa || 0,
        kidney_beans_quantity: legumes.kidneybeans || 0,
        nuts_quantity: legumes.nuts || 0,
        other_legumes: legumes.others || "",
        other_legumes_quantity: legumes.qty || 0,
      };

      console.log("Request Data:", requestData); // Log the payload

      try {
        const response = await axios.post(
          "https://indheart.pinesphere.in/patient/vegetarian-diets/",
          requestData
        );
        console.log("Vegetarian diet saved successfully:", response.data);

        // Set custom success alert
        setAlertTitle(languageText.alertSuccessTitle);
        setAlertMessage(texts[language].successMessage);
        setAlertVisible(true); // Show the alert with the appropriate state

        // You can navigate here if needed
        if (patientDetails.diet === "Both") {
          navigation.navigate("NonVegDietPage");
        } else {
          navigation.navigate("WaterPage");
        }
      } catch (error) {
        // Handle Axios error responses
        if (axios.isAxiosError(error)) {
          const errorMessages = error.response?.data || {};

          if (
            errorMessages.non_field_errors &&
            errorMessages.non_field_errors.includes(
              "The fields patient_id, date must make a unique set."
            )
          ) {
            setAlertTitle(texts[language].error);
            setAlertMessage(texts[language].entryExists);
          } else if (errorMessages.date) {
            setAlertTitle(texts[language].error);
            setAlertMessage(texts[language].dateRequired);
          } else if (!requestData.patient_id || !requestData.date) {
            setAlertTitle(texts[language].error);
            setAlertMessage(texts[language].valuesRequired);
          } else {
            setAlertTitle(texts[language].error);
            setAlertMessage(texts[language].issueSavingDiet);
          }
        } else {
          setAlertTitle(texts[language].error);
          setAlertMessage(texts[language].unexpectedError);
        }
        setAlertVisible(true); // Show the custom alert message
      }
    }
  };

  /* const handleCancel = () => {
    Alert.alert("Cancel", "Are you sure you want to cancel?", [
      { text: "No", style: "cancel" },
      { text: "Yes", onPress: () => navigation.navigate("DailyUploads") }, // Navigate to PatientDashboard
    ]);
  }; */

  const handleCancel = () => {
    // Trigger the custom alert instead of the default Alert
    setCancelAlertVisible(true);
  };

  return (
    <SafeAreaProvider>
      {/* Custom alert for errors */}
      {/* Custom alerts */}

      <CustomAlert
        title={alertTitle}
        message={alertMessage}
        visible={alertVisible}
        onClose={() => {
          setAlertVisible(false); // Close the alert
          if (alertMode === "success") {
            // Navigate to WaterPage after the success alert closes
            navigation.navigate("NonVegDietPage");
          }
        }}
        onYes={() => {
          setAlertVisible(false); // Close the alert
          if (alertMode === "success") {
            // Navigate to WaterPage after the success alert closes
            navigation.navigate("NonVegDietPage");
          }
        }}
        okText={languageText.alertOk} // Translated OK text
        yesText={languageText.alertYes} // Translated Yes text
        noText={languageText.alertNo} // Translated No text
      />

      {/* Custom cancel alert */}
      <CustomAlert
        title={languageText.alertCancelTitle} // Use translation for the title
        message={languageText.alertCancelMessage}
        visible={cancelAlertVisible}
        onClose={() => setCancelAlertVisible(false)} // Close the alert on close
        mode="confirm"
        onYes={() => {
          // Navigate to PatientDashboardPage when "Yes" is clicked
          navigation.navigate("PatientDashboardPage");
          setCancelAlertVisible(false); // Close the alert after navigation
        }}
        onNo={() => setCancelAlertVisible(false)} // Close the alert on "No"
        yesText={languageText.alertYes} // Use translation for Yes button text
        noText={languageText.alertNo}
      />

      <SafeAreaView style={styles.container}>
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
              source={require("../../assets/images/veg.jpg")}
              style={styles.topImage}
            />
            <View style={styles.textOverlay}>
              <Text style={styles.topText}>{languageText.evaluate}</Text>
              <Text style={styles.topSubText}>
                {languageText.vegetarianDiet}
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
            {languageText.nutrientIntakeJournal}
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
                        placeholder={texts[language].saladQuantityPlaceholder}
                        /* placeholder={
                          card.title === nutrientTitles.crispFreshSalads
                            ? texts[language].saladQuantityPlaceholder // Special placeholder for Salad
                            : texts[language].quantityPlaceholder // Default placeholder
                        } */
                        keyboardType="numeric"
                        value={responses[index].quantity}
                        onChangeText={(text) =>
                          handleQuantityChange(index, text)
                        }
                      />
                      {/* <Icon
                        name="ramen-dining"
                        size={20}
                        color="#3CB371"
                        style={styles.quantityIcon}
                      /> */}
                    </View>
                  )}
                </View>
              </View>
            ))}

            {/* Fruits Picker */}

            <View style={styles.fruitContainer}>
              <Text style={styles.fruitsTitle}>
                {languageText.fruitsPicker}
              </Text>
              <View style={styles.guavaContainer}>
                <TextInput
                  style={styles.guavaQty}
                  placeholder={texts[language].piecesPlaceholder}
                  keyboardType="numeric"
                  value={quantities.guava}
                  onChangeText={(text) =>
                    setQuantities((prev) => ({
                      ...prev,
                      guava: text.replace(/[^0-9]/g, ""),
                    }))
                  }
                />
                <Image
                  source={require("../../assets/images/guava.png")}
                  style={styles.guavaImage}
                />
                <Text style={styles.guavaTitle}>{languageText.guava}</Text>
              </View>

              <View style={styles.orangeContainer}>
                <TextInput
                  style={styles.orangeQty}
                  placeholder={texts[language].piecesPlaceholder}
                  keyboardType="numeric"
                  value={quantities.orange}
                  onChangeText={(text) =>
                    setQuantities((prev) => ({
                      ...prev,
                      orange: text.replace(/[^0-9]/g, ""),
                    }))
                  }
                />
                <Image
                  source={require("../../assets/images/orange.png")}
                  style={styles.orangeImage}
                />
                <Text style={styles.orangeTitle}>{languageText.orange}</Text>
              </View>

              <View style={styles.appleContainer}>
                <TextInput
                  style={styles.appleQty}
                  placeholder={texts[language].piecesPlaceholder}
                  keyboardType="numeric"
                  value={quantities.apple}
                  onChangeText={(text) =>
                    setQuantities((prev) => ({
                      ...prev,
                      apple: text.replace(/[^0-9]/g, ""),
                    }))
                  }
                />
                <Image
                  source={require("../../assets/images/apple.png")}
                  style={styles.appleImage}
                />
                <Text style={styles.appleTitle}>{languageText.apple}</Text>
              </View>

              <View style={styles.grapesContainer}>
                <TextInput
                  style={styles.grapesQty}
                  placeholder={texts[language].piecesPlaceholder}
                  keyboardType="numeric"
                  value={quantities.grapes}
                  onChangeText={(text) =>
                    setQuantities((prev) => ({
                      ...prev,
                      grapes: text.replace(/[^0-9]/g, ""),
                    }))
                  }
                />
                <Image
                  source={require("../../assets/images/grapes.png")}
                  style={styles.grapesImage}
                />
                <Text style={styles.grapesTitle}>{languageText.grapes}</Text>
              </View>

              <View style={styles.muskmelonContainer}>
                <TextInput
                  style={styles.muskmelonQty}
                  placeholder={texts[language].piecesPlaceholder}
                  keyboardType="numeric"
                  value={quantities.muskmelon}
                  onChangeText={(text) =>
                    setQuantities((prev) => ({
                      ...prev,
                      muskmelon: text.replace(/[^0-9]/g, ""),
                    }))
                  }
                />
                <Image
                  source={require("../../assets/images/musk.png")}
                  style={styles.muskmelonImage}
                />
                <Text style={styles.muskmelonTitle}>
                  {languageText.muskmelon}
                </Text>
              </View>

              <View style={styles.watermelonContainer}>
                <TextInput
                  style={styles.watermelonQty}
                  placeholder={texts[language].piecesPlaceholder}
                  keyboardType="numeric"
                  value={quantities.watermelon}
                  onChangeText={(text) =>
                    setQuantities((prev) => ({
                      ...prev,
                      watermelon: text.replace(/[^0-9]/g, ""),
                    }))
                  }
                />
                <Image
                  source={require("../../assets/images/watermelon.png")}
                  style={styles.watermelonImage}
                />
                <Text style={styles.watermelonTitle}>
                  {languageText.watermelon}
                </Text>
              </View>

              <View style={styles.othersContainer}>
                <Text style={styles.fruitOtherLabel}></Text>

                <View style={styles.fruitInputContainer}>
                  <TextInput
                    style={styles.othersFruitName}
                    placeholder={texts[language].fruitNamePlaceholder}
                    value={quantities.othersFruit || ""} // Keep track of the fruit name
                    onChangeText={(text) =>
                      setQuantities((prev) => ({
                        ...prev,
                        othersFruit: text, // Store the fruit name
                      }))
                    }
                    numberOfLines={2}
                    multiline={true}
                  />

                  <TextInput
                    style={styles.othersQtyss}
                    placeholder={texts[language].piecesPlaceholder}
                    keyboardType="numeric"
                    value={quantities.others || ""}
                    onChangeText={(text) =>
                      setQuantities((prev) => ({
                        ...prev,
                        others: text.replace(/[^0-9]/g, ""),
                      }))
                    }
                  />
                </View>

                <Text style={styles.othersTitle}>{languageText.others}</Text>
              </View>
            </View>

            {/* Legumes Section */}
            <View style={styles.section}>
              <Text style={styles.title}>
                {languageText.legumesConsumption}
              </Text>

              <View style={styles.legumeContainer}>
                <LinearGradient
                  colors={["#f5f7fa", "#c3cfe2"]} // Start and end colors for the gradient
                  style={styles.legumeBox}
                >
                  <Text style={styles.legumeLabel}>
                    {languageText.greenGram}
                  </Text>
                </LinearGradient>

                <TextInput
                  style={styles.legumeInput}
                  placeholder={texts[language].saladQuantityPlaceholder}
                  keyboardType="numeric"
                  value={legumes.greenGram}
                  onChangeText={(text) =>
                    handleLegumeCountChange("greenGram", text)
                  }
                />
              </View>

              <View style={styles.legumeContainer}>
                <LinearGradient
                  colors={["#f5f7fa", "#c3cfe2"]}
                  style={styles.legumeBox}
                >
                  <Text style={styles.legumeLabel}>
                    {languageText.chickpea}
                  </Text>
                </LinearGradient>
                <TextInput
                  style={styles.legumeInput}
                  placeholder={texts[language].saladQuantityPlaceholder}
                  keyboardType="numeric"
                  value={legumes.chickpea}
                  onChangeText={(text) =>
                    handleLegumeCountChange("chickpea", text)
                  }
                />
              </View>

              <View style={styles.legumeContainer}>
                <LinearGradient
                  colors={["#f5f7fa", "#c3cfe2"]}
                  style={styles.legumeBox}
                >
                  <Text style={styles.legumeLabel}>{languageText.soybean}</Text>
                </LinearGradient>
                <TextInput
                  style={styles.legumeInput}
                  placeholder={texts[language].saladQuantityPlaceholder}
                  keyboardType="numeric"
                  value={legumes.soybean}
                  onChangeText={(text) =>
                    handleLegumeCountChange("soybean", text)
                  }
                />
              </View>

              <View style={styles.legumeContainer}>
                <LinearGradient
                  colors={["#f5f7fa", "#c3cfe2"]}
                  style={styles.legumeBox}
                >
                  <Text style={styles.legumeLabel}>{languageText.cowpea}</Text>
                </LinearGradient>
                <TextInput
                  style={styles.legumeInput}
                  placeholder={texts[language].saladQuantityPlaceholder}
                  keyboardType="numeric"
                  value={legumes.cowpea}
                  onChangeText={(text) =>
                    handleLegumeCountChange("cowpea", text)
                  }
                />
              </View>

              <View style={styles.legumeContainer}>
                <LinearGradient
                  colors={["#f5f7fa", "#c3cfe2"]}
                  style={styles.legumeBox}
                >
                  <Text style={styles.legumeLabel}>{languageText.channa}</Text>
                </LinearGradient>
                <TextInput
                  style={styles.legumeInput}
                  placeholder={texts[language].saladQuantityPlaceholder}
                  keyboardType="numeric"
                  value={legumes.channa}
                  onChangeText={(text) =>
                    handleLegumeCountChange("channa", text)
                  }
                />
              </View>

              <View style={styles.legumeContainer}>
                <LinearGradient
                  colors={["#f5f7fa", "#c3cfe2"]}
                  style={styles.legumeBox}
                >
                  <Text style={styles.legumeLabel}>
                    {languageText.kidneyBeans}
                  </Text>
                </LinearGradient>
                <TextInput
                  style={styles.legumeInput}
                  placeholder={texts[language].saladQuantityPlaceholder}
                  keyboardType="numeric"
                  value={legumes.kidneybeans}
                  onChangeText={(text) =>
                    handleLegumeCountChange("kidneybeans", text)
                  }
                />
              </View>

              <View style={styles.legumeContainer}>
                <LinearGradient
                  colors={["#f5f7fa", "#c3cfe2"]}
                  style={styles.legumeBox}
                >
                  <Text style={styles.legumeLabel}>{languageText.nuts}</Text>
                </LinearGradient>
                <TextInput
                  style={styles.legumeInput}
                  placeholder={texts[language].saladQuantityPlaceholder}
                  keyboardType="numeric"
                  value={legumes.nuts}
                  onChangeText={(text) => handleLegumeCountChange("nuts", text)}
                />
              </View>

              {/* <LinearGradient
    colors={["#f5f7fa", "#c3cfe2"]}
    style={styles.legumeBox}
  > */}
              <Text style={styles.legumeOtherLabel}>
                {languageText.legumeOther}
              </Text>
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
                  placeholder={texts[language].saladQuantityPlaceholder} // Ensure language is set correctly
                  keyboardType="numeric"
                  value={legumes.qty}
                  onChangeText={(text) => handleLegumeCountChange("qty", text)}
                />
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
    alignItems: "center",
  },
  scrollContainer: {
    padding: 10,
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
  },
  topText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
    right: 50,
    bottom: 30,
  },
  topSubText: {
    fontSize: 22,
    fontWeight: "600",
    color: "#ffffff",
    right: 60,
    bottom: 35,
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
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 10,

    left: 5,
    textAlign: "center",
    color: "#4B4B4B",
    bottom: 65,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: "#505050",
  },
  fruitContainer: {
    borderRadius: 15,
    padding: 10,
    backgroundColor: "transparent", // Or any other style you need
    width: "100%",
    marginTop: 10,
    alignItems: "center", // Center items horizontally
  },

  fruitsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    marginTop: 10,
    textAlign: "center", // Center aligns the text
    color: "#4B4B4B",
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
    fontSize: 13,
    fontWeight: "600",
    color: "#000",
    padding: 2,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    marginTop: 10,
    position: "relative", // Set position relative to contain the icon
  },
  quantityInput: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    width: "100%",
    textAlign: "center",
    marginTop: 10,
    fontSize: 10,
  },
  quantityIcon: {
    position: "absolute",
    marginLeft: 10,
    marginRight: 5,
    color: "#c0c0c0",
    bottom: 10,
  },
  datePickerField: {
    width: "50%",
    left: 100,
    bottom: 47,
    marginVertical: 15,
    padding: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 45,
    backgroundColor: "#fff",
  },
  datePickerText: {
    fontSize: 14,
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
    marginLeft: 5,
    fontSize: 10,
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
    fontSize: 10,
    width: "38%",
    textAlign: "center",
    right: 0,
    top: 5,
    height: 40,
    backgroundColor: "#FFF0E0",
    borderRadius: 30,
    marginTop: 5,
    marginLeft: 5,
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
    fontSize: 10,
    width: "38%",
    textAlign: "center",
    left: 180,
    top: 5,
    height: 40,
    backgroundColor: "#FAD1DB",
    borderRadius: 30,
    marginTop: 5,
    marginLeft: 5,
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
    fontSize: 10,
    width: "38%",
    textAlign: "center",
    alignItems: "center",
    right: 0,
    top: 5,
    height: 40,
    backgroundColor: "#F1F2FD",
    borderRadius: 30,
    marginTop: 5,
    padding: 10,
    marginLeft: 5,
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
    fontSize: 10,
    width: "38%",
    textAlign: "center",
    left: 200,
    top: 5,
    height: 40,
    backgroundColor: "#E0E9DE",
    borderRadius: 30,
    marginTop: 5,
    marginLeft: 5,
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
    height: "150%",
    bottom: 60,
    left: 130,
    resizeMode: "contain",
  },
  watermelonQty: {
    fontSize: 10,
    width: "38%",
    textAlign: "center",
    right: 0,
    top: 5,
    height: 40,
    backgroundColor: "#D9F2E0",
    borderRadius: 30,
    marginTop: 5,
    marginLeft: 5,
  },
  othersContainer: {
    borderRadius: 15,
    padding: 10,
    backgroundColor: "#FFFACD",
    height: 130,
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

  guavaTitle: {
    position: "absolute",
    right: 180,
    top: 25,
    fontSize: 16,
    fontWeight: "bold",

    padding: 5,
  },

  orangeTitle: {
    position: "absolute",
    left: 150,
    top: 25,
    fontSize: 16,
    fontWeight: "bold",

    padding: 5,
  },
  appleTitle: {
    position: "absolute",
    right: 190,
    top: 25,
    fontSize: 16,
    fontWeight: "bold",

    padding: 5,
  },
  grapesTitle: {
    position: "absolute",
    left: 160,
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
    bottom: 30,
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
    marginBottom: 15,

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
    marginLeft: 0, // Removed marginLeft if you want them perfectly aligned
  },
  legumeLabel: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  legumeInput: {
    fontSize: 10,
    width: "40%",
    height: 40,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    textAlign: "center",
    paddingHorizontal: 10,
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
 
  
  legumeInputOther: {
    fontSize: 10,
    width: "100%",
    height: 60,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    textAlign: "left",
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  legumeOtherLabel: {
    fontSize: 15,
    fontWeight: "bold",
    textAlign: "left",
    marginBottom: 10,
    padding: 5,
  },
  legumeInputContainer: {
    marginBottom: 20,
  },
  legumeInputQty: {
    fontSize: 10,
    width: "100%",
    height: 40,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    textAlign: "left",
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 10,
  },
  fruitOtherLabel: {
    fontSize: 16,
    marginBottom: 8,
    // Add additional styling if needed
  },
  fruitInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8, // Space between inputs
  },
  othersFruitName: {
    fontSize: 8,
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 8,
    marginRight: 10,
    // Increase line height if necessary for better spacing inside
    lineHeight: 12,
    paddingVertical: 5, // Adjust vertical padding to give more space for the placeholder text
  },

  othersQtyss: {
    fontSize: 8,
    width: 80, // Fixed width for quantity input (this is a narrow width)
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 8,
    textAlign: "center", // Ensure text is centered properly
    paddingVertical: 10, // Adjust vertical padding if placeholder text is cropped
  },

  translateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "transparent", // Light background for contrast
    width: "100%", // Slightly reduced width for padding
    height: 100,
    marginBottom: 10,
    borderRadius: 15,
    top: 60,
    padding: 8,
    marginLeft: 5,
  },
  translateButton: {
    position: "absolute",
    bottom: 50,
    right: 17, // Adjust right spacing as needed
    backgroundColor: "#ffffff",
    flexDirection: "row", // Align items horizontally
    alignItems: "center", // Center items vertically
    padding: 5,
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
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 5, // Space between icon and text
  },
});
export default VegDietPage;