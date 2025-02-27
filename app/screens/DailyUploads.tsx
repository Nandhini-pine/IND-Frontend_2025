import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  TouchableOpacity,
  Image,
  Text as RNText,
  StyleSheet,
  Dimensions,
  ImageSourcePropType,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../type"; // Adjust path as needed
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import texts from "../translation/texts";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Ionicons } from "@expo/vector-icons";
import { InterruptionModeAndroid } from "expo-av";

// Custom Text component to disable font scaling globally 
const Text = (props: any) => { return <RNText {...props} allowFontScaling={false} />; };


interface PatientDetails {
  patient_id: string; // Ensure this is defined
  diet: string;
}

const screenWidth = Dimensions.get("window").width;

// Define your image sources
const images: ImageSourcePropType[] = [
  require("../../assets/images/dailySleep.png"),
  require("../../assets/images/foodImg.png"),
  require("../../assets/images/hydrated.png"),
  require("../../assets/images/tablet.png"),
  require("../../assets/images/exercise.png"),
  require("../../assets/images/yoga.png"),
];

// Define titles for each image
const titles: string[] = [
  "Sleep",
  "Healthy Diet",
  "Stay Hydrated",
  "Medication",
  "Exercise",
  "Yoga Practice",
];

// Define Tamil translations for the titles
const tamilTitles: string[] = [
  "உறக்கம்",
  "சுகமான உணவு",
  "தண்ணீர் பருகுங்கள்",
  "மருந்து",
  "விளையாட்டு",
  "யோகவாழ்வு",
];

// Define quotes for each image in English
const englishQuotes: string[] = [
  "A person’s health is a reflection of their internal state of mind. - Integrative Medicine",
  "Biomarkers are critical for diagnosing diseases before symptoms arise. - Clinical Pathology",
  "Epigenetics reveals how our environment can alter gene expression. - Molecular Biology",
  "Chronic inflammation can be the root cause of many chronic diseases. - Rheumatology",
  "Microbiome diversity is crucial for maintaining overall health and immunity. - Gastroenterology",
  "Pharmacogenomics can personalize medicine based on genetic makeup. - Personalized Medicine",
];

// Define Tamil translations for the quotes
const tamilQuotes: string[] = [
  "ஒரு மனிதனின் உடல்நிலை அவர்களின் உள்நிலை மனநிலையின் பிரதிபலிப்பு ஆகும். - ஒருங்கிணைந்த மருத்துவம்",
  "நோயின் அறிகுறிகள் தோன்றும் முன்பே அதைக் கண்டறிய உயிரணுக்கள் முக்கியமானவை. - மருத்துவவியல்",
  "எபிஜெனெடிக்ஸ் நமது சூழல் மரபணு வெளிப்பாட்டை எவ்வாறு மாற்றும் என்பதை வெளிப்படுத்துகிறது",
  "நீடித்த அழற்சி பல நீண்டகால நோய்களின் முக்கியக் காரணமாக இருக்க முடியும். - ரியுமாடாலஜி",
  "நம் உடல் ஆரோக்கியத்தை மற்றும் நோயெதிர்ப்புத் திறனை பராமரிப்பதற்காக உடலின் நுண்ணுயிர்க்குழுக்கள் அவசியம். - குடலியல்",
  "ஜீன்களின் அமைப்பைப் பொறுத்து மருந்துகளை நாமே தகுந்தவாறு மாற்ற முடியும். - தனிப்பயன் மருத்துவம்",
];

// Define navigation targets for each image
const exploreTargets: Array<keyof RootStackParamList> = [
  "SleepRitualsPage",
  "VegDietPage",
  "WaterPage",
  "PatientMedication",
  "Exercise",
  "YogaPage",
];

type DailyUploadsNavigationProp = StackNavigationProp<
  RootStackParamList,
  "DailyUploads"
>;

const DailyUploads: React.FC = () => {
  const navigation = useNavigation<DailyUploadsNavigationProp>();
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [patientDetails, setPatientDetails] = useState<PatientDetails | null>(
    null
  );
  const [hasSleepData, setHasSleepData] = useState(false);
  const [waterIntake, setWaterIntake] = useState(0);
  const [hasvegDietData, setHasvegDietData] = useState(false);
  const [hasnonvegDietData, setHasnonvegDietData] = useState(false);
  const [WalkingData, setWalkingData] = useState(0);
  const [ExerciseData, setExerciseData] = useState(0);
  const [YogaData, setYogaData] = useState(0);
  const [MedicineData, setMedicineData] = useState(0);

  const [isTranslatingToTamil, setIsTranslatingToTamil] = useState(false);

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
        `https://vs3k4b04-8000.inc1.devtunnels.ms/patient/patient/${phone}/`
      );
      setPatientDetails(response.data);
    } catch (error) {
      console.error("Error fetching patient details:", error);
    }
  };

  // Handle Translation
  // Handle Translation
  const handleTranslate = useCallback(() => {
    setIsTranslatingToTamil((prev) => !prev);
    console.log("Translate button pressed");
  }, []);

  // Handle Previous button click
  const handlePrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  // Handle Next button click
  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const checkSleepData = async () => {
    if (patientDetails) {
      try {
        const response = await axios.get(
          `https://vs3k4b04-8000.inc1.devtunnels.ms/patient/patient/${patientDetails.patient_id}/sleep-data/`
        );
        setHasSleepData(response.data.exists);
      } catch (error) {
        console.error("Error fetching sleep data:", error);
      }
    }
  };

  useEffect(() => {
    checkSleepData();
  }, [patientDetails]);

  const checkVegDietData = async () => {
    if (patientDetails) {
      try {
        const response = await axios.get(
          `https://vs3k4b04-8000.inc1.devtunnels.ms/patient/patient/${patientDetails.patient_id}/vegdiet-data/`
        );
        setHasvegDietData(response.data.exists);
      } catch (error) {
        console.error("Error fetching vegdiet data:", error);
      }
    }
  };
  useEffect(() => {
    checkVegDietData();
  }, [patientDetails]);

  const checkNonVegDietData = async () => {
    if (patientDetails) {
      try {
        const response = await axios.get(
          `https://vs3k4b04-8000.inc1.devtunnels.ms/patient/patient/${patientDetails.patient_id}/nonvegdiet-data/`
        );
        setHasnonvegDietData(response.data.exists);
      } catch (error) {
        console.error("Error fetching nonvegdiet data:", error);
      }
    }
  };
  useEffect(() => {
    checkNonVegDietData();
  }, [patientDetails]);

  const checkWaterData = async () => {
    if (patientDetails) {
      try {
        const response = await axios.get(
          `https://vs3k4b04-8000.inc1.devtunnels.ms/patient/patient/${patientDetails.patient_id}/water-data/`
        );
        setWaterIntake(response.data.exists);
      } catch (error) {
        console.error("Error fetching sleep data:", error);
      }
    }
  };

  useEffect(() => {
    checkWaterData();
  }, [patientDetails]);

  const checkDailyExerciseData = async () => {
    if (patientDetails) {
      try {
        const response = await axios.get(
          `https://vs3k4b04-8000.inc1.devtunnels.ms/patient/patient/${patientDetails.patient_id}/daily-exercise-data/`
        );
        setExerciseData(response.data.exists);
      } catch (error) {
        console.error("Error fetching daily exercise data:", error);
      }
    }
  };

  useEffect(() => {
    checkDailyExerciseData();
  }, [patientDetails]);

  const checkWalkingData = async () => {
    if (patientDetails) {
      try {
        const response = await axios.get(
          `https://vs3k4b04-8000.inc1.devtunnels.ms/patient/patient/${patientDetails.patient_id}/walking-data/`
        );
        setWalkingData(response.data.exists);
      } catch (error) {
        console.error("Error fetching walking data:", error);
      }
    }
  };

  useEffect(() => {
    checkWalkingData();
  }, [patientDetails]);

  const checkYogaData = async () => {
    if (patientDetails) {
      try {
        const response = await axios.get(
          `https://vs3k4b04-8000.inc1.devtunnels.ms/patient/patient/${patientDetails.patient_id}/yoga-data/`
        );
        setYogaData(response.data.exists);
      } catch (error) {
        console.error("Error fetching yoga data:", error);
      }
    }
  };

  useEffect(() => {
    checkYogaData();
  }, [patientDetails]);

  const checkMedicineData = async () => {
    if (patientDetails) {
      try {
        const response = await axios.get(
          `https://vs3k4b04-8000.inc1.devtunnels.ms/patient/patient/${patientDetails.patient_id}/medicine-data/`
        );
        setMedicineData(response.data.exists);
      } catch (error) {
        console.error("Error fetching medicine data:", error);
      }
    }
  };

  useEffect(() => {
    checkMedicineData();
  }, [patientDetails]);

  // Handle Explore button click
  const handleExplore = () => {
    if (patientDetails) {
      const { diet } = patientDetails;

      switch (currentIndex) {
        case 0:
          navigation.navigate("SleepRitualsPage");
          break;
        case 1:
          // Navigate based on diet
          if (diet === "Vegetarian") {
            navigation.navigate("VegDietPage");
          } else if (diet === "Non-Vegetarian") {
            navigation.navigate("NonVegDietPage");
          } else if (diet === "Both") {
            navigation.navigate("VegDietPage");
          } else {
            console.error("Unknown diet type");
          }
          break;
        case 2:
          navigation.navigate("WaterPage");
          break;
        case 3:
          navigation.navigate("PatientMedication");
          break;
        case 4:
          navigation.navigate("Exercise");
          break;
        case 5:
          navigation.navigate("YogaPage");
          break;
        default:
          console.error("Invalid screen index");
      }
    } else {
      console.error("Patient details not loaded yet");
    }
  };

  // Determine the button text based on currentIndex and translation state
  const getButtonText = () => {
    switch (currentIndex) {
      case 0:
        return isTranslatingToTamil
          ? hasSleepData
            ? "தொடங்கியது"
            : "உறக்கம் துவங்கவும்"
          : hasSleepData
          ? "Started"
          : "Start Sleep";
      case 1:
        if (patientDetails) {
          const { diet } = patientDetails;
          if (diet === "Vegetarian") {
            return isTranslatingToTamil
              ? hasvegDietData
                ? "சைவ உணவு முறை தொடங்கியது"
                : "சர்க்கரை உணவு துவங்கவும்"
              : hasvegDietData
              ? "Vegetarian Diet Started"
              : "Vegetarian Diet Started";
          } else if (diet === "Non-Vegetarian") {
            return isTranslatingToTamil
              ? hasnonvegDietData
                ? "அசைவ உணவு முறை தொடங்கியது"
                : "அசைவ உணவைத் தொடங்குங்கள்"
              : hasnonvegDietData
              ? "Non-Vegetarian Diet Started"
              : "Start Non-Vegetarian Diet";
          } else if (diet === "Both") {
            return isTranslatingToTamil
              ? hasvegDietData && hasnonvegDietData
                ? "இரண்டு டயட்களும் ஆரம்பித்தன"
                : "இரண்டு உணவுகளையும் தொடங்குங்கள்"
              : hasvegDietData && hasnonvegDietData
              ? "Both Diets Started"
              : "Start Both Diets";
          }
        }
        return isTranslatingToTamil ? "உணவு தொடங்கவும்" : "Start Diet";
      case 2:
        return isTranslatingToTamil
          ? waterIntake
            ? "தொடங்கியது"
            : "தண்ணீர் துவங்கவும்"
          : waterIntake
          ? "Started"
          : "Start Water";
      case 3:
        return isTranslatingToTamil
          ? MedicineData
            ? "தொடங்கியது"
            : "மருந்து துவங்கவும்"
          : MedicineData
          ? "Started"
          : "Start Medicine";
      case 4:
        return isTranslatingToTamil
          ? ExerciseData
            ? "தொடங்கியது"
            : "விளையாட்டு துவங்கவும்"
          : ExerciseData
          ? "Started"
          : "Start Exercise";
      case 5:
        return isTranslatingToTamil
          ? WalkingData
            ? "தொடங்கியது"
            : "நடையை துவங்கவும்"
          : WalkingData
          ? "Started"
          : "Start Walking";
      case 6:
        return isTranslatingToTamil
          ? YogaData
            ? "தொடங்கியது"
            : "யோகா துவங்கவும்"
          : YogaData
          ? "Started"
          : "Start Yoga";
      default:
        return isTranslatingToTamil ? "துவங்கவும்" : "Start";
    }
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
        <View style={styles.mainWrapper}>
          <View style={styles.backIconContainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                console.log("Back button clicked");
                navigation.navigate("PatientDashboardPage");
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={18} color="#000" />
            </TouchableOpacity>
          </View>
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
              <Text style={styles.translateButtonText}>
                {isTranslatingToTamil
                  ? "Translate to English"
                  : "தமிழில் படிக்க"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.container}>
            <TouchableOpacity onPress={handlePrevious}>
              <MaterialIcons name="arrow-back-ios" size={24} color="black" />
            </TouchableOpacity>
            <Image source={images[currentIndex]} style={styles.image} />
            <TouchableOpacity onPress={handleNext}>
              <MaterialIcons name="arrow-forward-ios" size={24} color="black" />
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>
            {isTranslatingToTamil
              ? tamilTitles[currentIndex]
              : titles[currentIndex]}
          </Text>

          <Text style={styles.quote}>
            {isTranslatingToTamil
              ? tamilQuotes[currentIndex]
              : englishQuotes[currentIndex]}
          </Text>

          <TouchableOpacity
            onPress={handleExplore}
            style={styles.buttonContainer}
          >
            <Text style={styles.buttonText}>{getButtonText()}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  mainWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative", // Make this relative for absolute positioning of child elements
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },

  backIconContainer: {
    position: "absolute", // Position the back button container absolutely
    top: 15,
    left: 15,
  },
  translateIconContainer: {
    position: "absolute", // Position the translate button container absolutely
    top: 15,
    right: 15,
  },
  backButton: {
    width: 30,
    height: 30,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    marginTop: 50,
    marginLeft: 10,
  },
  translateContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  translateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 20,
    bottom: 60,
    left: 80,
  },
  translateButtonText: {
    marginLeft: 5,
    fontSize: 16,
    fontWeight: "bold",
    color: "#4169E1",
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  image: {
    width: screenWidth * 0.8,
    height: screenWidth * 0.9,
    resizeMode: "contain",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 20,
  },
  quote: {
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  buttonContainer: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default DailyUploads;
