import {
  View,
  Text as RNText,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import React, { useState, useCallback, useEffect } from "react";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../type";
import texts from "../translation/texts";
// Custom Text component to disable font scaling globally
const Text = (props: any) => {
  return <RNText {...props} allowFontScaling={false} />;
};

export default function Exercise() {
  const navigation =
    useNavigation<StackNavigationProp<RootStackParamList, "Exercise">>();

  // State for toggling language
  const [isTranslatingToTamil, setIsTranslatingToTamil] = useState(false);

  // Animation values for tiles
  const fadeAnim = new Animated.Value(0); // Initial opacity value

  // Define the back press handler function inside the component
  const handleBackPress = useCallback(() => {
    console.log("Back button pressed"); // Add this to debug
    navigation.navigate("DailyUploads");
  }, [navigation]);

  // Array of slide animations for the images
  const slideAnim = [
    new Animated.Value(-50), // Slide position for the first image
    new Animated.Value(-70), // Slide position for the second image
    new Animated.Value(-80), // Slide position for the third image
    new Animated.Value(-90), // Slide position for the fourth image
  ];

  // Toggle between Tamil and English based on the button click
  const languageText = isTranslatingToTamil ? texts.tamil : texts.english;

  // Update language state dynamically
  const language: "english" | "tamil" = isTranslatingToTamil
    ? "tamil"
    : "english";

  // Handle Translation
  const handleTranslate = useCallback(() => {
    setIsTranslatingToTamil((prev) => !prev);
    console.log("Translate button pressed");
  }, []);

  // Animate the tiles and slide the images on mount
  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1, // Final opacity value
      duration: 500, // Duration of the animation
      useNativeDriver: true, // Use native driver for performance
    }).start();

    // Slide down animations for each image
    slideAnim.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: 0, // Final slide position (0 means fully visible)
        duration: 500 + index * 200, // Staggered durations for each image
        useNativeDriver: true, // Use native driver for performance
      }).start();
    });
  }, [fadeAnim, slideAnim]);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        {/* Adjust StatusBar visibility */}
        <StatusBar
          barStyle="dark-content" // Set the color of status bar text
          backgroundColor="transparent" // Make the background transparent
          translucent={true} // Make status bar translucent
        />

        <View style={styles.outerContainer}>
          <View style={styles.translateContainer}>
            <TouchableOpacity
              onPress={handleTranslate}
              style={styles.translateButton}
            >
              <Icon
                name={isTranslatingToTamil ? "language" : "translate"}
                size={20}
                color="#4169E1"
              />
              <Text style={styles.buttonTranslateText}>
                {isTranslatingToTamil
                  ? "Translate to English"
                  : "தமிழில் படிக்க"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Title */}
          <View style={styles.mainContainer}>
            <TouchableOpacity
              onPress={handleBackPress}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <Icon name="arrow-back" size={24} color="#020202" />
            </TouchableOpacity>
            <Text style={styles.greetingText}>
              {languageText.exerciseJournal}
            </Text>
          </View>

          <View style={styles.cardsContainer}>
            <View style={styles.cardContainer}>
              <TouchableOpacity
                style={[styles.card, styles.card1]}
                onPress={() => navigation.navigate("DailyExercise")}
              >
                <View style={[styles.cardBackground, styles.card1Background]}>
                  <Icon
                    name="fitness-center"
                    size={30}
                    color="#003366"
                    style={styles.cardIcon}
                  />
                </View>
              </TouchableOpacity>
              <Text style={styles.cardTitle}>{languageText.exercise}</Text>
            </View>

            <View style={styles.cardContainer}>
              <TouchableOpacity
                style={[styles.card, styles.card2]}
                onPress={() => navigation.navigate("ExerciseVideos")}
              >
                <View style={[styles.cardBackground, styles.card2Background]}>
                  <Icon
                    name="video-library"
                    size={30}
                    color="#004d00"
                    style={styles.cardIcon}
                  />
                </View>
              </TouchableOpacity>
              <Text style={styles.cardTitle}>{languageText.videos}</Text>
            </View>

            <View style={styles.cardContainer}>
              <TouchableOpacity
                style={[styles.card, styles.card3]}
                onPress={() => navigation.navigate("BreathingExercise")}
              >
                <View style={[styles.cardBackground, styles.card3Background]}>
                  <Icon
                    name="timer"
                    size={30}
                    color="#cc6600"
                    style={styles.cardIcon}
                  />
                </View>
              </TouchableOpacity>
              <Text style={styles.cardTitle}>{languageText.breathing}</Text>
            </View>

            <View style={styles.cardContainer}>
              <TouchableOpacity
                style={[styles.card, styles.card4]}
                onPress={() => navigation.navigate("Walking")}
              >
                <View style={[styles.cardBackground, styles.card4Background]}>
                  <Icon
                    name="directions-walk"
                    size={30}
                    color="#004d40"
                    style={styles.cardIcon}
                  />
                </View>
              </TouchableOpacity>
              <Text style={styles.cardTitle}>{languageText.walking}</Text>
            </View>
          </View>

          <Text style={styles.subTitle}>{languageText.wellnessConsole}</Text>

          {/* 4 Tiles with Different Heights */}
          <View style={styles.puzzledTilesContainer}>
            {/* Tile 1 */}
            <Animated.View
              style={[
                styles.puzzledTileContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim[0] }],
                },
              ]}
            >
              <View style={styles.puzzledTile1}>
                <Image
                  source={require("../../assets/images/tile1.jpg")}
                  style={styles.tile1Image}
                />
              </View>
            </Animated.View>

            {/* Tile 2 */}
            <Animated.View
              style={[
                styles.puzzledTileContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim[1] }],
                },
              ]}
            >
              <View style={styles.puzzledTile2}>
                <Image
                  source={require("../../assets/images/tile4.jpg")}
                  style={styles.tile2Image}
                />
              </View>
            </Animated.View>

            {/* Tile 3 */}
            <Animated.View
              style={[
                styles.puzzledTileContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim[2] }],
                },
              ]}
            >
              <View style={styles.puzzledTile3}>
                <Image
                  source={require("../../assets/images/tile3.jpg")}
                  style={styles.tile3Image}
                />
              </View>
            </Animated.View>

            {/* Tile 4 */}
            <Animated.View
              style={[
                styles.puzzledTileContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim[3] }],
                },
              ]}
            >
              <View style={styles.puzzledTile4}>
                <Image
                  source={require("../../assets/images/tile2.jpg")}
                  style={styles.tile4Image}
                />
              </View>
            </Animated.View>
          </View>

          {/* Scrollable Content */}
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
              {/* Your scrollable content here */}
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    justifyContent: "flex-start", // Changed to start for top alignment
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingTop: 20, // Added padding for better spacing
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },

  mainContainer: {
    padding: 15,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  backButton: {
    position: "absolute",
    left: -70,
    bottom: 50,
    backgroundColor: "#d7d7d7",
    padding: 5,
    width: 35,
    height: 35,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 25,
  },
  greetingText: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center", // Centered text
  },
  subTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#000",
    marginVertical: 8,
  },
  scrollContainer: {
    padding: 16,
  },
  container: {
    flex: 1,
  },
  cardsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: 7,
    width: "100%",
    marginHorizontal: 5,
  },
  cardContainer: {
    width: "24%",
    alignItems: "center",
    marginBottom: 10,
  },
  card: {
    borderRadius: 50,
    backgroundColor: "#fff",
  },
  card1: {
    width: "80%",
    height: 80,
  },
  card2: {
    width: "80%",
    height: 80,
  },
  card3: {
    width: "80%",
    height: 80,
  },
  card4: {
    width: "80%",
    height: 80,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "bold",
    marginTop: 8,
    textAlign: "center", // Centered text
  },
  cardIcon: {
    marginTop: 5,
  },
  cardBackground: {
    width: "100%",
    height: "90%",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  card1Background: {
    backgroundColor: "#e0f7fa", // Light cyan
  },
  card2Background: {
    backgroundColor: "#f1f8e9", // Light green
  },
  card3Background: {
    backgroundColor: "#fbe9e7", // Light pink
  },
  card4Background: {
    backgroundColor: "#e8f5e9", // Light green
  },
  puzzledTilesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  puzzledTileContainer: {
    width: "48%",
    marginBottom: 10,
    marginVertical: 8,
  },
  puzzledTile1: {
    height: 220, // Tile 1 height
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 50,
  },
  puzzledTile2: {
    height: 170, // Tile 2 height
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 30,
  },
  puzzledTile3: {
    height: 180, // Tile 3 height
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 30,
  },
  puzzledTile4: {
    height: 240, // Tile 4 height
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    bottom: 60,
  },
  tile1Image: {
    width: "100%",
    height: "100%",
    borderRadius: 15,
  },
  tile2Image: {
    width: "100%",
    height: "100%",
    borderRadius: 15,
  },
  tile3Image: {
    width: "100%",
    height: "100%",
    borderRadius: 15,
  },
  tile4Image: {
    width: "100%",
    height: "100%",
    borderRadius: 15,
  },
  translateContainer: {
    alignSelf: "flex-end", // Align to the right
    padding: 10,
    marginBottom: 10,
    top: 5,
  },
  translateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 25,
    padding: 5,
    paddingHorizontal: 15,
    elevation: 3,
    top: 30,
  },
  buttonTranslateText: {
    fontSize: 14,
    marginLeft: 5,
    color: "#4169E1",
    fontWeight: "600",
  },
});
