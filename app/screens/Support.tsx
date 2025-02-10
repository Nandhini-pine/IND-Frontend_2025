import React, { useRef, useEffect } from "react";
import {
  View,
  Text as RNText,
  StyleSheet,
  Image,
  ScrollView,
  Linking,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { useCallback, useState } from "react";
import texts from "../translation/texts";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../type";
import { SafeAreaProvider } from "react-native-safe-area-context";
// Custom Text component to disable font scaling globally
const Text = (props: any) => {
  return <RNText {...props} allowFontScaling={false} />;
};

const SupportPage = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  // State for language toggle
  const [isTranslatingToTamil, setIsTranslatingToTamil] = useState(false);

  // Select appropriate text based on language
  const languageText = isTranslatingToTamil ? texts.tamil : texts.english;

  const language: "english" | "tamil" = isTranslatingToTamil
    ? "tamil"
    : "english";

  const handleTranslate = () => {
    setIsTranslatingToTamil(!isTranslatingToTamil);
    console.log("Translate button pressed");
  };

  // Animation references
  const coverImageOpacity = useRef(new Animated.Value(0)).current;
  const infoContainerSlide = useRef(new Animated.Value(50)).current;

  // Slide-in animation for info containers
  useEffect(() => {
    Animated.timing(coverImageOpacity, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    Animated.timing(infoContainerSlide, {
      toValue: 0,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  // Function to open dialer with phone number
  const dialCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleBackPress = () => {
    navigation.navigate("Insights");
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent={true}
        />
        <ScrollView style={styles.container}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="#020202" />
          </TouchableOpacity>
          {/* Translation */}
          <TouchableOpacity
            onPress={handleTranslate}
            style={styles.translateButton}
          >
            <Icon
              name={isTranslatingToTamil ? "language" : "translate"}
              size={20}
              color="#4169E1"
            />
            <Text style={styles.translateButtonText}>
              {isTranslatingToTamil ? "Translate to English" : "தமிழில் படிக்க"}
            </Text>
          </TouchableOpacity>

          {/* Cover Image with Fade-In Animation */}
          <Animated.Image
            source={require("../../assets/images/s.png")}
            style={[styles.coverImage, { opacity: coverImageOpacity }]}
          />

          {/* Main Content */}
          <View style={styles.content}>
            <Text style={styles.pageTitle}>{languageText.supportTitle}</Text>

            {/* Animated Info Containers */}
            <Animated.View
              style={[
                styles.infoContainer,
                { transform: [{ translateY: infoContainerSlide }] },
              ]}
            >
              <Text style={styles.containerText}>
                {languageText.principalInvestigatorName}
              </Text>
              <Text style={styles.containerSubText}>
                {languageText.principalInvestigator}
              </Text>
              <TouchableOpacity
                style={styles.phoneContainer}
                onPress={() => dialCall("9444150993")}
              >
                <Image
                  source={require("../../assets/icons/phone.png")}
                  style={styles.phoneGif}
                />
                <Text style={styles.phoneText}>+91 94441 50993</Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Duplicate and Customize for Each Info Container */}
            <Animated.View
              style={[
                styles.infoContainer,
                { transform: [{ translateY: infoContainerSlide }] },
              ]}
            >
              <Text style={styles.containerText}>
                {languageText.coinvestigatorName}
              </Text>
              <Text style={styles.containerSubText}>
                {languageText.coinvestigator}
              </Text>
              <TouchableOpacity
                style={styles.phoneContainer}
                onPress={() => dialCall("8838312572")}
              >
                <Image
                  source={require("../../assets/icons/phone.png")}
                  style={styles.phoneGif}
                />
                <Text style={styles.phoneText}>+91 88383 12572</Text>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View
              style={[
                styles.infoContainer,
                { transform: [{ translateY: infoContainerSlide }] },
              ]}
            >
              <Text style={styles.containerText}>
                {languageText.coinvestigatorNameSub}
              </Text>
              <Text style={styles.containerSubText}>
                {languageText.coinvestigator}
              </Text>
              <TouchableOpacity
                style={styles.phoneContainer}
                onPress={() => dialCall("9626484936")}
              >
                <Image
                  source={require("../../assets/icons/phone.png")} // Path to your GIF
                  style={styles.phoneGif} // Add styling for the GIF
                />
                <Text style={styles.phoneText}>+91 96264 84936</Text>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View
              style={[
                styles.infoContainer,
                { transform: [{ translateY: infoContainerSlide }] },
              ]}
            >
              <Text style={styles.containerText}>
                {languageText.consultantInterventionName}
              </Text>
              <Text style={styles.containerSubText}>
                {languageText.consultantIntervention}
              </Text>
              <TouchableOpacity
                style={styles.phoneContainer}
                onPress={() => dialCall("0422-4323123")}
              >
                <Image
                  source={require("../../assets/icons/phone.png")} // Path to your GIF
                  style={styles.phoneGif} // Add styling for the GIF
                />
                <Text style={styles.phoneText}>+91 96264 84936</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f9fc",
    marginTop: 60,
    marginBottom: 20,
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  translateButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 4,
    borderRadius: 50,
    backgroundColor: "#ffffff",
    // iOS Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    // Android Shadow
    elevation: 5,
    position: "absolute", // Add absolute positioning
    top: 5, // Align to the top
    right: 20, // Align to the right
  },
  translateButtonText: {
    color: "#4169E1",
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 8,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#3a3a3a",
    textAlign: "center",
    marginBottom: 20,
    marginTop: -35,
  },
  coverImage: {
    width: "100%",
    height: 240,
    resizeMode: "cover",
    borderRadius: 8,
    marginBottom: 0,
    marginTop: -10,
  },
  content: {
    paddingHorizontal: 20,
  },
  infoContainer: {
    backgroundColor: "#ebebeb",
    padding: 20,
    borderRadius: 20,
    marginBottom: 7,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  infoContainer3: {
    backgroundColor: "#ebebeb",
    padding: 20,
    borderRadius: 20,
    marginBottom: 7,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  infoContainer4: {
    backgroundColor: "#ebebeb",
    padding: 20,
    borderRadius: 20,
    marginBottom: 7,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  containerText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#3a3a3a",
  },
  containerSubText: {
    fontSize: 14,
    color: "#495057",
    marginTop: 4,
  },
  phoneContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  phoneText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ea6830",
    marginLeft: 5,
  },
  phoneGif: {
    width: 20,
    height: 20,
    marginRight: 5,
  },
  backButton: {
    marginLeft: 20,
    marginTop: 5,
    backgroundColor: "#d7d7d7",
    padding: 7,
    width: "10%",
    alignItems: "center",
    borderRadius: 50,
  },
});

export default SupportPage;
