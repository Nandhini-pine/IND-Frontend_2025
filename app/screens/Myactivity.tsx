import React, { useState } from "react";
import {
  View,
  Text as RNText,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Platform,
  TextInput,
  SafeAreaViewBase,
  StatusBar,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaProvider } from "react-native-safe-area-context";
// Custom Text component to disable font scaling globally
const Text = (props: any) => {
  return <RNText {...props} allowFontScaling={false} />;
};

const MyActivity: React.FC = () => {
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState<"date" | "time">("date");
  const [answers, setAnswers] = useState<{
    selectedDate: string | null;
    smokerStatus: string | null;
    cigarettesSmoked: number | null;
  }>({
    selectedDate: null,
    smokerStatus: null,
    cigarettesSmoked: null,
  });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(1);
  const totalQuestions = 3; // Total number of questions
  const navigation = useNavigation();

  const openDatePicker = () => {
    setDatePickerMode("date");
    setDatePickerVisible(true);
  };

  const onConfirmDate = (event: any, selectedDate: Date | undefined) => {
    setDatePickerVisible(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split("T")[0];
      setAnswers({ ...answers, selectedDate: formattedDate });
      goToNextQuestion();
    }
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 1) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Define handleAnswer to accept two parameters
  const handleAnswer = (answer: string | number, questionKey: string): void => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionKey]: answer,
    }));
    if (questionKey === "smokerStatus" && answer === "Yes") {
      // Stay on the current question to input the number of cigarettes
    } else {
      // Move to the next question
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const renderQuestion = () => {
    return (
      <View style={styles.container}>
        <Text style={styles.mainTitle}>
          Help Us Understand Your Lifestyle Habits for Better Insights
        </Text>

        <LinearGradient
          colors={["#fce4ec", "#ffffff"]}
          style={styles.questionContainer}
        >
          {currentQuestionIndex === 1 && (
            <>
              <Text style={styles.questionText}>Did you smoke today?</Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.yesButton]}
                  onPress={() => handleAnswer("Yes", "smokerStatus")}
                  accessibilityLabel="Yes"
                >
                  <Text style={styles.buttonText}>Yes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.noButton]}
                  onPress={() => handleAnswer("No", "smokerStatus")}
                  accessibilityLabel="No"
                >
                  <Text style={styles.buttonText}>No</Text>
                </TouchableOpacity>
              </View>

              {/* Conditionally render the input box if 'Yes' is selected */}
              {answers.smokerStatus === "Yes" && (
                <>
                  <Text style={styles.questionText}>
                    Number of cigarettes smoked today:
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    keyboardType="numeric"
                    onChangeText={(text) =>
                      handleAnswer(parseInt(text), "cigaretteCount")
                    }
                    placeholder="Enter number of cigarettes"
                    accessibilityLabel="Cigarettes smoked today"
                  />
                </>
              )}
            </>
          )}
          {currentQuestionIndex === 2 && (
            <>
              <Text style={styles.questionText}>Do you consume alcohol?</Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.yesButton]}
                  onPress={() => handleAnswer("Yes", "alcoholStatus")}
                  accessibilityLabel="Yes"
                >
                  <Text style={styles.buttonText}>Yes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.noButton]}
                  onPress={() => handleAnswer("No", "alcoholStatus")}
                  accessibilityLabel="No"
                >
                  <Text style={styles.buttonText}>No</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {currentQuestionIndex === 3 && (
            <Text style={styles.questionText}>
              Thank you for your responses!
            </Text>
          )}

          {currentQuestionIndex === totalQuestions && (
            <TouchableOpacity
              style={[styles.button, styles.submitButton]}
              onPress={() => {
                // Handle submit action here
              }}
              accessibilityLabel="Submit"
            >
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
          )}

          <View style={styles.buttonContainer}>
            {currentQuestionIndex > 1 && (
              <TouchableOpacity
                style={[styles.button, styles.previousButton]}
                onPress={goToPreviousQuestion}
                accessibilityLabel="Previous"
              >
                <Text style={styles.prevButtonText}>Previous</Text>
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>
      </View>
    );
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          {/* Back icon */}
          <View style={styles.backIconContainer}>
            <Icon
              name="arrow-back"
              size={18}
              color="#000"
              onPress={() => navigation.goBack()}
            />
          </View>

          {/* Title */}
          <Text style={styles.title}>Lifestyle Tracker</Text>

          {/* Image Container */}
          <View style={styles.imageContainer}>
            <Image
              source={require("../../assets/images/lifestylecoverimge.jpg")}
              style={styles.lifestyleImage}
            />
          </View>

          {/* Date Picker */}
          <View style={styles.datePickerContainer}>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={openDatePicker}
            >
              <Text style={styles.optionText}>
                {answers.selectedDate
                  ? `Date: ${answers.selectedDate}`
                  : "Select a Date"}
              </Text>
            </TouchableOpacity>
            {datePickerVisible && (
              <Modal
                transparent={true}
                animationType="slide"
                visible={datePickerVisible}
                onRequestClose={() => setDatePickerVisible(false)}
              >
                <View style={styles.datePickerModal}>
                  <DateTimePicker
                    value={new Date()}
                    mode={datePickerMode}
                    display="default"
                    onChange={onConfirmDate}
                  />
                </View>
              </Modal>
            )}
          </View>

          {renderQuestion()}
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    marginTop: Platform.OS === "ios" ? 20 : 50,
  },
  content: {
    flexGrow: 1,
    alignItems: "center",
    width: "100%",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginVertical: 10,
  },
  backIconContainer: {
    position: "absolute",
    top: Platform.OS === "ios" ? 10 : 10,
    left: 10,
    backgroundColor: "#f3f3f3",
    borderRadius: 30,
    padding: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    zIndex: 1,
  },
  imageContainer: {
    alignItems: "center",
    marginVertical: 20,
    width: "100%",
    height: 240,
    borderRadius: 30,
    padding: 5,
    bottom: 20,
  },
  lifestyleImage: {
    width: "100%",
    height: 240,
    resizeMode: "cover",
    borderRadius: 25,
  },
  datePickerContainer: {
    marginTop: 20,
    width: "100%",
    alignItems: "center",
    bottom: 40,
  },
  optionButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginVertical: 5,
  },
  optionText: {
    color: "#fff",
    fontSize: 16,
  },
  datePickerModal: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  mainTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5, // Space between title and container
    textAlign: "left",
    bottom: 75,
  },
  questionContainer: {
    marginTop: 10,
    padding: 20,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 2,
    backgroundColor: "#fce4ec", // Background color to make it visible
    width: "100%", // Reduced width to fit better
    alignSelf: "center", // Center horizontally
    maxWidth: 550,
    bottom: 70,
  },
  questionText: {
    fontSize: 18,
    marginBottom: 15,
  },
  textInput: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center", // Center buttons horizontally
    alignItems: "center",
    marginTop: 20,
    width: "100%",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center", // Center buttons horizontally
    alignItems: "center", // Center vertically
    width: "100%",
    marginBottom: 15,
    paddingVertical: 5,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginHorizontal: 5,
    alignItems: "center", // Center text inside button
  },
  yesButton: {
    backgroundColor: "#4CAF50", // Green for Yes
  },
  noButton: {
    backgroundColor: "#F44336", // Red for No
  },
  submitButton: {
    backgroundColor: "#2196F3",
    width: "50%",
    left: 100,
  },
  previousButton: {
    backgroundColor: "transparent",
    right: 220,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  prevButtonText: {
    color: "#1E90FF",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});

export default MyActivity;
