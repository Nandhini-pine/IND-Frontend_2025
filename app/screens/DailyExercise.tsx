import React, { useState, useEffect, useCallback } from "react";
import {
  Text as RNText,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
  BackHandler,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Icon from "react-native-vector-icons/MaterialIcons";
import texts from "../translation/texts";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../type";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useFocusEffect } from "@react-navigation/native";
import CustomAlert from "../components/CustomAlert";
// Custom Text component to disable font scaling globally
const Text = (props: any) => {
  return <RNText {...props} allowFontScaling={false} />;
};

// Define the props type

type DailyExerciseNavigationProp = StackNavigationProp<
  RootStackParamList,
  "DailyExercise"
>;

interface DailyExerciseProps {
  navigation: DailyExerciseNavigationProp;
}
interface PatientDetails {
  patient_id: string; // Keep the patient_id string if you need it for other purposes
  diet: string;
  name: string; // Make sure to add this line
}

const DailyExercise: React.FC<DailyExerciseProps> = ({ navigation }) => {
  // Toggle between Tamil and English based on the button click
  const [isTranslatingToTamil, setIsTranslatingToTamil] = useState(false);

  // Toggle between Tamil and English based on the button click
  const languageText = isTranslatingToTamil ? texts.tamil : texts.english;
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successAlertVisible, setSuccessAlertVisible] = useState(false);

  const [regularAlertVisible, setRegularAlertVisible] = useState(false);
  const [cancelAlertVisible, setCancelAlertVisible] = useState(false);
  // Update language state dynamically
  const language: "english" | "tamil" = isTranslatingToTamil
    ? "tamil"
    : "english";

  const questionsTitles = isTranslatingToTamil
    ? {
        warmUp: "நீங்கள் உடலை வெப்பப்படுத்தும் உடற்பயிற்சியைச் செய்தீர்களா?", // Tamil for "Did you perform a Warm-Up Exercise?"
        difficulties:
          "நீங்கள் உடற்பயிற்சியின் போது எந்தவொரு சிரமங்களைச் சந்தித்தீர்களா?", // Tamil for "Did you encounter any difficulties?"
        chores:
          "நீங்கள் உடற்பயிற்சியின் போது பிற வீட்டு வேலைகளைச் செய்தீர்களா?", // Tamil for "Did you engage in shopping or other household chores?"
      }
    : {
        warmUp: "Did you perform a Warm-Up Exercise?", // English text
        difficulties: "Did you encounter any difficulties?", // English text
        chores: "Did you engage in shopping or other household chores?", // English text
      };

  const cardData = [
    { title: questionsTitles.warmUp },
    { title: questionsTitles.difficulties },
    { title: questionsTitles.chores },
  ];

  const [difficultiesText, setDifficultiesText] = useState<string>("");
  const [specificReason, setSpecificReason] = useState("");
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [answers, setAnswers] = useState<string[]>(["", "", ""]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [patientDetails, setPatientDetails] = useState<PatientDetails | null>(
    null
  );
  const questions = [
    questionsTitles.warmUp, // Updated to use the translated question
    questionsTitles.difficulties, // Updated to use the translated question
    questionsTitles.chores, // Updated to use the translated question
  ];

  useFocusEffect(
    React.useCallback(() => {
      const backAction = () => {
        /* Alert.alert ("Cancel", "Are you sure you want to cancel?", [
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

  //Backhandler
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

  const handleAnswerChange = (index: number, answer: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = answer;
    setAnswers(newAnswers);

    if (index === 1 && answer === "Yes") {
      // Show text input for difficulties
      setDifficultiesText(""); // Reset previous text input if "Yes" is selected
    } else if (index === 1 && answer === "No") {
      // Hide text input for difficulties
      setDifficultiesText(""); // Clear the text when "No" is selected
    }
  };

  const handleClear = () => {
    setDifficultiesText("");
    setSpecificReason("");
    setSelectedDate(null);
    setAnswers(["", "", ""]);
    //Alert.alert("Cleared successfully!"); // Show success alert
    setAlertMessage(languageText.clearedMessage);
  };

  const handleDateChange = (event: any, date?: Date | undefined) => {
    // Check if the date is defined before updating the state
    if (date && event.type !== "dismissed") {
      setSelectedDate(date);
    }
    setShowDatePicker(false);
  };
  const handleSave = async () => {
    if (patientDetails && selectedDate) {
      const formData = {
        patient_id: patientDetails.patient_id,
        date: selectedDate.toISOString().split("T")[0], // Format date as 'YYYY-MM-DD'
        warm_up: answers[0] === "Yes",
        difficulties: answers[1] === "Yes",
        difficulties_text: answers[1] === "Yes" ? difficultiesText : "", // Save difficulties text if applicable
        chores: answers[2] === "Yes",
      };

      try {
        const response = await axios.post(
          "https://indheart.pinesphere.in/patient/daily-exercise-data/",
          formData
        );

        if (response.status === 201) {
          /* Alert.alert("Success", "Your Exercise details have been saved!", [
            {
              text: "OK",
              onPress: () => {
                // Navigate to the DailyUpdates page
                navigation.navigate("Walking"); // Adjust the name if necessary
              },
            },
          ]); */
          setSuccessAlertVisible(true);
        } else {
          //Alert.alert("Error saving the form");
          setAlertMessage(languageText.errorMessage);
        }
      } catch (error: any) {
        // Handle duplicate entry or other errors
        if (error.response && error.response.status === 400) {
          // Check if the error is due to a unique constraint violation
          const errorMessage =
            error.response.data?.message || languageText.existingAlert;
          //Alert.alert("Duplicate Entry", errorMessage);
          setAlertTitle(languageText.duplicateEntry);
          setAlertMessage(errorMessage);
        } else {
          //Alert.alert("Error", "There was an issue saving the data");
          setAlertTitle(languageText.errorTitle);
          setAlertMessage(languageText.errorSaving);
        }
      }
    } else {
      //
      //Alert.alert("Missing required fields", "Please select a date.");
      setAlertTitle(languageText.missingAlert);
      setAlertMessage(languageText.selectDate);
    }
  };

  // Handle Translation
  const handleTranslate = useCallback(() => {
    setIsTranslatingToTamil((prev) => !prev);
  }, []);

  const hideDatePicker = () => setDatePickerVisibility(false);

  const handleConfirm = (date: Date) => {
    setSelectedDate(date);
    hideDatePicker();
  };

  const handleSubmit = () => {
    handleSave();
  };

  /* const handleCancel = () => {
    Alert.alert(
      languageText.confirmCancelTitle,
      languageText.confirmCancelMessage,
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          onPress: () => navigation.navigate("Exercise"),
        }, // Navigate back to patient dashboard
      ],
      { cancelable: false }
    );
  }; */
  const handleCancel = () => {
    setCancelAlertVisible(true);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* CustomAlert for cancel confirmation */}
      <CustomAlert
        title={languageText.confirmCancelTitle}
        message={languageText.confirmCancelMessage}
        visible={cancelAlertVisible}
        onClose={() => setCancelAlertVisible(false)}
        onYes={() => navigation.navigate("Exercise")} // Handles "Yes" button
        onNo={() => setCancelAlertVisible(false)} // Handles "No" button
        mode="confirm" // Optionally specify "confirm" for Yes/No buttons
        okText={languageText.alertOk} // Translated OK text
        yesText={languageText.alertYes} // Translated Yes text
        noText={languageText.alertNo} // Translated No text
      />

      {/* CustomAlert for success confirmation */}
      <CustomAlert
        title={languageText.successTitle}
        message={languageText.successExercise}
        visible={successAlertVisible}
        onClose={() => setSuccessAlertVisible(false)}
        mode="ok"
        onOk={() => {
          setSuccessAlertVisible(false);
          navigation.navigate("Walking"); // Adjust the name if necessary
        }}
        okText={languageText.alertOk} // Translated OK text
        yesText={languageText.alertYes} // Translated Yes text
        noText={languageText.alertNo} // Translated No text
      />

      <View style={styles.translateContainer}>
        <TouchableOpacity
          onPress={handleTranslate}
          style={styles.translateButton}
        >
          <Icon
            name={isTranslatingToTamil ? "language" : "translate"}
            size={16}
            color="#4169E1"
          />
          <Text style={styles.buttonTranslateText}>
            {isTranslatingToTamil ? "Translate to English" : "தமிழில் படிக்க"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false} // Disable vertical scroll indicator
        showsHorizontalScrollIndicator={false}
      >
        <View style={styles.headerContainer}></View>

        <View style={styles.coverImageContainer}>
          <Image
            source={require("../../assets/images/exer.jpg")}
            style={styles.coverImage}
          />
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.questionTitle}>{languageText.exercisetitle}</Text>
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

        {/* Display all questions */}
        <View style={styles.questionsContainer}>
          {questions.map((question, index) => (
            <View key={index} style={styles.questionContainer}>
              <Text style={styles.question}>{question}</Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[
                    styles.button,
                    answers[index] === "Yes" && styles.yesButton,
                  ]}
                  onPress={() => handleAnswerChange(index, "Yes")}
                >
                  <Text style={styles.buttonText}>{languageText.yes}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.button,
                    answers[index] === "No" && styles.noButton,
                  ]}
                  onPress={() => handleAnswerChange(index, "No")}
                >
                  <Text style={styles.buttonText}>{languageText.no}</Text>
                </TouchableOpacity>
              </View>

              {/* Display specific inputs based on previous answers */}
              {index === 1 && answers[index] === "Yes" && (
                <View>
                  <Text style={styles.reasonTitle}>{languageText.specifyDifficulties}</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder={languageText.specifyDifficulties}
                    value={difficultiesText} // This value will be the state holding the user's input
                    onChangeText={setDifficultiesText} // This updates the difficultiesText state when text is entered
                  />
                </View>
              )}
              {/* The logic is not hardcoded; it's dynamic and relies on the user's interaction with the buttons (Yes/No) */}
              {index === 2 && answers[index] === "No" && (
                <View>
                  <Text style={styles.reasonTitle}>{languageText.specifyReason}</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder={languageText.specifyReason}
                    value={specificReason}
                    onChangeText={setSpecificReason}
                  />
                </View>
              )}
            </View>
          ))}
        </View>

        {/* DatePicker Modal */}
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleConfirm}
          onCancel={hideDatePicker}
        />
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
    </KeyboardAvoidingView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 0,
    marginTop: 50,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 10,
  },
  headerContainer: {
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  greetText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  coverImageContainer: {
    marginBottom: 5,
    paddingHorizontal: 15,
    width: "100%",
    height: 200,
    justifyContent: "center",
    alignSelf: "center",
    alignItems: "center",
  },
  coverImage: {
    width: "120%",
    height: "100%",
    borderRadius: 30,
    borderColor: "#fff",
    borderWidth: 1,
    bottom: 28,
  },
  questionContainer: {
    marginBottom: 10,
    padding: 15,
    backgroundColor: "#F9F9F9",
    borderRadius: 30,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  titleContainer: {
    marginVertical: 16, // Add your desired margin
    alignItems: "center", // Center the title
  },
  questionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
    marginBottom: -10,
    bottom: 15,
  },
  question: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
    marginBottom: 10,
    //textAlign: 'center',
  },
  questionsContainer: {
    marginBottom: 10,
    bottom: 60,
    paddingTop: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
    
    
  },
  button: {
    backgroundColor: "#D3D3D3",
    paddingVertical: 10,
    paddingHorizontal: 20,  // This will ensure the buttons expand with content
    borderRadius: 30,
    marginHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",  // Centers text vertically
  },
  yesButton: {
    backgroundColor: "#4CAF50", // Green
    paddingHorizontal: 20,
  },
  noButton: {
    backgroundColor: "#F44336", // Red
  },
  buttonText: {
    color: "#fff",
  },
  textInput: {
    height: 40,
    borderColor: "#c5c5c5",
    borderWidth: 1,
    marginTop: 10,
    paddingLeft: 10,
    borderRadius: 20,
    fontSize: 10,
  },
  reasonTitle: {
    fontSize: 14,
    fontWeight: "400",
    marginTop: 10,
    left: 5,
  },
  dateInput: {
    padding: 10,
    borderColor: "#ccc",
    borderWidth: 1,
    width: "70%",
    borderRadius: 30,
    marginVertical: 8,
    alignItems: "center",
    bottom: 60,
    alignSelf: "center",
  },
  dateText: {
    fontSize: 16,
  },
  calendarContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  calendar: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 10,
  },
  calendarButton: {
    padding: 10,
  },
  calendarIcon: {
    width: 30,
    height: 30,
  },
  selectedDate: {
    fontSize: 16,
    marginLeft: 10,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    backgroundColor: "#fff",
    marginBottom: 5,
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
    top: 55,
    padding: 7,
    marginRight: 10,
    zIndex: 10,
  },
  translateButton: {
    position: "absolute",
    bottom: 10, // Position at the top
    right: 10, // Adjust right spacing as needed
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
  datePickerContainer: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    top: 10,
  },
});

export default DailyExercise;
