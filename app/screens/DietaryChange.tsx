import {
  View,
  Text as RNText,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { Ionicons } from "@expo/vector-icons"; // Ensure you have installed expo vector icons
import { SafeAreaProvider } from "react-native-safe-area-context";
import texts from "../translation/texts";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../type";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useCallback, useState } from "react";

// Custom Text component to disable font scaling globally
const Text = (props: any) => {
  return <RNText {...props} allowFontScaling={false} />;
};

const DietaryChange = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  // Toggle between Tamil and English based on the button click
  // Inside the Insights component
  const [isTranslatingToTamil, setIsTranslatingToTamil] = useState(false);

  // Toggle between Tamil and English based on the button click
  const languageText = isTranslatingToTamil ? texts.tamil : texts.english;
  // Update language state dynamically
  const language: "english" | "tamil" = isTranslatingToTamil
    ? "tamil"
    : "english";

  const handleTranslate = () => {
    setIsTranslatingToTamil(!isTranslatingToTamil);
    console.log("Translate button pressed");
  };

  const handleBackPress = useCallback(() => {
    console.log("Back button pressed"); // Add this to debug
    navigation.navigate("Insights");
  }, [navigation]);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        {/* Adjust StatusBar visibility */}
        <StatusBar
          barStyle="dark-content" // Set the color of status bar text
          backgroundColor="transparent" // Make the background transparent
          translucent={true} // Make status bar translucent
        />

        <View style={styles.container}>
          {/* Header outside the ScrollView */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={handleBackPress}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={20} color="#000" />
            </TouchableOpacity>
            <Text style={styles.title}>{languageText.dietaryTitle}</Text>
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
                {isTranslatingToTamil
                  ? "Translate to English"
                  : "தமிழில் படிக்க"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Scrollable Content */}
          <ScrollView showsVerticalScrollIndicator={false}>
            <Image
              source={require("../../assets/images/dc.jpg")} // Ensure the correct path to your image
              style={styles.image}
              resizeMode="contain" // Adjust image sizing
            />

            {/* Content Area with Green Background */}
            <View style={styles.contentContainer}>
              <View style={styles.content}>
                <View style={styles.bulletPoint}>
                  <Ionicons name="leaf" size={20} color="#5a8321" />
                  <Text style={styles.contentText}>{languageText.dietOne}</Text>
                </View>
                <View style={styles.bulletPoint}>
                  <Ionicons name="leaf" size={20} color="#5a8321" />
                  <Text style={styles.contentText}>{languageText.dietTwo}</Text>
                </View>
                <View style={styles.bulletPoint}>
                  <Ionicons name="leaf" size={20} color="#5a8321" />
                  <Text style={styles.contentText}>
                    {languageText.dietThree}
                  </Text>
                </View>
                <View style={styles.bulletPoint}>
                  <Ionicons name="leaf" size={20} color="#5a8321" />
                  <Text style={styles.contentText}>
                    {languageText.dietFour}
                  </Text>
                </View>
                <View style={styles.bulletPoint}>
                  <Ionicons name="leaf" size={20} color="#5a8321" />
                  <Text style={styles.contentText}>
                    {languageText.dietFive}
                  </Text>
                </View>
                <View style={styles.bulletPoint}>
                  <Ionicons name="leaf" size={20} color="#5a8321" />
                  <Text style={styles.contentText}>{languageText.dietSix}</Text>
                </View>
                <View style={styles.bulletPoint}>
                  <Ionicons name="leaf" size={20} color="#5a8321" />
                  <Text style={styles.contentText}>
                    {languageText.dietSeven}
                  </Text>
                </View>
                <View style={styles.bulletPoint}>
                  <Ionicons name="leaf" size={20} color="#5a8321" />
                  <Text style={styles.contentText}>
                    {languageText.dietEight}
                  </Text>
                </View>
                <View style={styles.bulletPoint}>
                  <Ionicons name="leaf" size={20} color="#5a8321" />
                  <Text style={styles.contentText}>
                    {languageText.dietNine}
                  </Text>
                </View>
                <View style={styles.bulletPoint}>
                  <Ionicons name="leaf" size={20} color="#5a8321" />
                  <Text style={styles.contentText}>{languageText.dietTen}</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    marginTop: 50,
    padding: 15,
    marginBottom: -60,
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    backgroundColor: "#fff",
  },
  backButton: {
    padding: 5,
    right: 10,
    backgroundColor: "#dad7d7",
    borderRadius: 50,
    marginRight: 5,
  },
  title: {
    flex: 1,
    fontSize: 19,
    fontWeight: "bold",
    textAlign: "center",
    marginHorizontal: 10,
    right: 15,
    marginRight: 5,
  },
  translateButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 6,
    borderRadius: 50,
    backgroundColor: "#ffffff",
    // iOS Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,

    // Android Shadow
    elevation: 5,
  },
  translateButtonText: {
    color: "#4169E1",
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 8,
  },
  contentContainer: {
    backgroundColor: "#C4DFB8",
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    padding: 16,
    paddingBottom: 10,
    marginBottom: 10,
    bottom: 70,
  },
  image: {
    width: "100%",
    height: 300,
    marginBottom: 10,
    bottom: 40,
  },
  content: {
    flex: 1,
  },
  bulletPoint: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: -15,
  },
  contentText: {
    marginTop: 8,
    marginHorizontal: 5,
    fontSize: 16,
    marginLeft: 8,
    padding: 10,
    fontWeight: "600",
  },
});

export default DietaryChange;
