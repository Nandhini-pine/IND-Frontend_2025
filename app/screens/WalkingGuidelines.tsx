import React, { useCallback } from "react";
import {
  View,
  Text as RNText,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  ImageBackground,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import Icon from "react-native-vector-icons/MaterialIcons";
import texts from "../translation/texts";
import { RootStackParamList } from "../../type";
import { SafeAreaProvider } from "react-native-safe-area-context";
// Custom Text component to disable font scaling globally
const Text = (props: any) => {
  return <RNText {...props} allowFontScaling={false} />;
};

// Define the props type
type WalkingNavigationProp = StackNavigationProp<
  RootStackParamList,
  "WalkingGuidelines"
>;

interface WalkingProps {
  navigation: WalkingNavigationProp;
}

const WalkingGuidelines: React.FC<WalkingProps> = ({ navigation }) => {
  const [isTranslatingToTamil, setIsTranslatingToTamil] = React.useState(false);
  const language: "english" | "tamil" = isTranslatingToTamil
    ? "tamil"
    : "english";

  const handleTranslate = useCallback(() => {
    setIsTranslatingToTamil((prev) => !prev);
  }, []);

  const handleNext = () => {
    navigation.navigate("PatientDashboardPage"); // Navigate back to patient dashboard
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        {/* Adjust StatusBar visibility */}
        <StatusBar
          barStyle="dark-content" // Set the color of status bar text
          backgroundColor="transparent" // Make the background transparent
          translucent={true} // Make status bar translucent
        />

        <ImageBackground
          source={require("../../assets/images/warningbg.jpg")} // Add your background image path here
          style={styles.background}
          resizeMode="cover"
        >
          <View style={styles.container}>
            <Text style={styles.title}>{texts[language].walkinginfo}</Text>

            {/* Align translate option at top right */}
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
                  {isTranslatingToTamil
                    ? "Translate to English"
                    : "தமிழில் படிக்க"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Scrollable Content Area */}
            <View style={styles.scrollContainer}>
              <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* New Note Container */}
                <View style={styles.noteContainer}>
                  <Image
                    source={require("../../assets/gif/warning.gif")} // Update this path to your image location
                    style={styles.noteImage}
                  />
                  <Text style={styles.noteText}>
                    During your first week post-surgery, consider resting or
                    taking light walks around your home!
                  </Text>
                </View>

                {/* Week-based Tracking Table */}
                <View style={styles.tableWrapper}>
                  <View style={styles.table}>
                    <View style={styles.tableHeader}>
                      <Text style={styles.tableHeaderText}>Week</Text>
                      <Text style={styles.tableHeaderText}>Timing</Text>
                      <Text style={styles.tableHeaderText}>Recommended</Text>
                      <Text style={styles.tableHeaderText}>Covered</Text>
                    </View>
                    <View style={styles.tableRow}>
                      <Text style={styles.tableCell}>1st Week</Text>
                      <Text style={styles.tableCell}>-</Text>
                      <Text style={styles.tableCell}>-</Text>
                      <Text style={styles.tableCell}>-</Text>
                    </View>
                    <View style={styles.tableRow}>
                      <Text style={styles.tableCell}>2nd Week</Text>
                      <Text style={styles.tableCell}>10 minutes</Text>
                      <Text style={styles.tableCell}>500 m</Text>
                      <Text style={styles.tableCell}>-</Text>
                    </View>
                    <View style={styles.tableRow}>
                      <Text style={styles.tableCell}>3rd Week</Text>
                      <Text style={styles.tableCell}>15 minutes</Text>
                      <Text style={styles.tableCell}>1 Km</Text>
                      <Text style={styles.tableCell}>-</Text>
                    </View>
                    <View style={styles.tableRow}>
                      <Text style={styles.tableCell}>4th Week</Text>
                      <Text style={styles.tableCell}>20 minutes</Text>
                      <Text style={styles.tableCell}>2 Km</Text>
                      <Text style={styles.tableCell}>-</Text>
                    </View>
                    <View style={styles.tableRow}>
                      <Text style={styles.tableCell}>5th Week</Text>
                      <Text style={styles.tableCell}>25 minutes</Text>
                      <Text style={styles.tableCell}>3 Km</Text>
                      <Text style={styles.tableCell}>-</Text>
                    </View>
                    <View style={styles.tableRow}>
                      <Text style={styles.tableCell}>6th Week</Text>
                      <Text style={styles.tableCell}>30 minutes</Text>
                      <Text style={styles.tableCell}>4 Km</Text>
                      <Text style={styles.tableCell}>-</Text>
                    </View>
                    <View style={styles.tableRow}>
                      <Text style={styles.tableCell}>After 6 Weeks</Text>
                      <Text style={styles.tableCell}>30 minutes Minimum</Text>
                      <Text style={styles.tableCell}>45 minutes Desirable</Text>
                      <Text style={styles.tableCell}>4 Km</Text>
                      <Text style={styles.tableCell}>6 Km</Text>
                    </View>
                  </View>
                </View>
              </ScrollView>
            </View>

            {/* Footer Navigation Buttons */}
            <View style={styles.footer}>
              <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                <Text style={styles.footerButtonText}>
                  {texts[language].next}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 50,
    backgroundColor: "transparent",
    padding: 10,
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },

  background: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    margin: 20,
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 25,
    maxHeight: 60,
    overflow: "hidden",
  },

  warningNote: {
    fontSize: 14,
    color: "red",
    textAlign: "center",
    marginVertical: 15,
  },

  // New Note Container Styles
  noteContainer: {
    backgroundColor: "#f9f9f9",
    padding: 10,
    borderRadius: 30,
    marginVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    width: "90%", // Adjust width to fit nicely in the container
  },

  noteText: {
    fontSize: 14,
    color: "#FF6F61",
    textAlign: "left",
    flex: 1,
    fontWeight: "500",
  },

  noteImage: {
    width: 40,
    height: 40,
    marginRight: 10,
  },

  scrollContainer: {
    flex: 1,
    marginBottom: 60,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  translateContainer: {
    bottom: 25,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5,
  },
  translateButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
  },
  buttonTranslateText: {
    marginLeft: 5,
    fontSize: 12,
    fontWeight: "600",
    color: "#1E90FF",
    alignSelf: "center",
    textAlign: "center",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: "transparent",
  },
  nextButton: {
    backgroundColor: "#4caf50",
    padding: 10,
    borderRadius: 20,
    flex: 1,
    alignItems: "center",
    alignSelf: "center",
    width: "40%",
  },
  footerButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  icon: {
    marginRight: 5,
  },
  tableWrapper: {
    paddingHorizontal: 10,
    width: "100%",
  },
  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 30,
    overflow: "hidden",
    marginTop: 20,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  tableHeader: {
    backgroundColor: "#1E90FF",
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
  },
  tableHeaderText: {
    color: "#fff",
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  tableCell: {
    flex: 1,
    textAlign: "center",
  },
});

export default WalkingGuidelines;
