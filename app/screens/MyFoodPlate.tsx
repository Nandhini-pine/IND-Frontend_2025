import React from "react";
import {
  View,
  StyleSheet,
  Image,
  ScrollView,
  Text as RNText,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../type";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useCallback, useState } from "react";
import texts from "../translation/texts";
// Custom Text component to disable font scaling globally
const Text = (props: any) => {
  return <RNText {...props} allowFontScaling={false} />;
};

const MyFoodPlate = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  // State for language toggle
  const [isTranslatingToTamil, setIsTranslatingToTamil] = useState(false);

  // Select appropriate text based on language
  const languageText = isTranslatingToTamil ? texts.tamil : texts.english;
  const language = isTranslatingToTamil ? "tamil" : "english";

  const handleTranslate = () => {
    setIsTranslatingToTamil(!isTranslatingToTamil);
    console.log("Translate button pressed");
  };

  // Sample data for each tile - updated with translations
  const tileData = [
    {
      title: languageText.tiles.wholeGrains.title,
      sampleText: languageText.tiles.wholeGrains.description,
      imageSource: require("../../assets/images/salad.png"),
      iconSource: require("../../assets/images/grains.png"),
    },
    {
      title: languageText.tiles.richInProtein.title,
      sampleText: languageText.tiles.richInProtein.description,
      imageSource: require("../../assets/images/salad.png"),
      iconSource: require("../../assets/images/proteins.png"),
    },
    {
      title: languageText.tiles.vegetables.title,
      sampleText: languageText.tiles.vegetables.description,
      imageSource: require("../../assets/images/salad.png"),
      iconSource: require("../../assets/images/vegetables.png"),
    },
    {
      title: languageText.tiles.lessAffordableFruits.title,
      sampleText: languageText.tiles.lessAffordableFruits.description,
      imageSource: require("../../assets/images/salad.png"),
      iconSource: require("../../assets/images/fruits.png"),
    },
    {
      title: languageText.tiles.oilToConsiderate.title,
      sampleText: languageText.tiles.oilToConsiderate.description,
      imageSource: require("../../assets/images/salad.png"),
      iconSource: require("../../assets/images/oil.png"),
    },
    {
      title: languageText.tiles.liquidConsumption.title,
      sampleText: languageText.tiles.liquidConsumption.description,
      imageSource: require("../../assets/images/salad.png"),
      iconSource: require("../../assets/images/waterCup.png"),
    },
  ];
  // Define the back press handler function inside the component
  const handleBackPress = useCallback(() => {
    console.log("Back button pressed"); // Add this to debug
    navigation.navigate("Insights");
  }, [navigation]);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        {/* Adjust StatusBar visibility */}
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent={true}
        />

        <View style={styles.container}>
          <View style={styles.header}>
            {/* Back Button */}
            <TouchableOpacity
              onPress={handleBackPress}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <Icon name="arrow-back" size={24} color="#020202" />
            </TouchableOpacity>

            {/* Title */}
            <Text style={styles.title}>{languageText.myfoodPlateTitle}</Text>

            {/* Translate Button */}
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

          <Image
            source={require("../../assets/images/myfoodplate.png")} // Replace with your main image filename
            style={styles.image}
          />
          <View style={styles.whiteContainer}>
            <ScrollView
              contentContainerStyle={styles.scrollContainer}
              showsVerticalScrollIndicator={false}
            >
              {tileData.map((tile, index) => (
                <View key={index} style={styles.tile}>
                  <View style={styles.iconContainer}>
                    <Image
                      source={tile.iconSource} // Use the icon image for each tile
                      style={styles.icon}
                    />
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={styles.heading}>{tile.title}</Text>
                    <Text style={styles.sampleText}>{tile.sampleText}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 10,
    marginTop: 20,
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row", // Align items in a row
    alignItems: "center", // Vertically align items
    justifyContent: "space-between", // Space between back button, title, and translate button
    marginTop: 30, // Adjust as needed for spacing
    paddingHorizontal: 10, // Add padding on both sides
  },
  backButton: {
    backgroundColor: "#d7d7d7",
    padding: 7,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    flex: 1, // Take up remaining space between buttons
    fontSize: 20,
    fontWeight: "900",
    textAlign: "center", // Center the text
    marginHorizontal: 10, // Add some spacing between title and buttons
  },
  translateButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 6,
    borderRadius: 50,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5, // For Android shadow
  },
  translateButtonText: {
    color: "#4169E1",
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 8,
  },
  image: {
    marginTop: -15,
    left: 20,
    alignItems: "center",
    width: "85%", // Set your desired width
    height: "40%", // Set your desired height
    marginBottom: 10, // Space between image and white container
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5, // For Android shadow
    alignSelf: "center",
  },

  whiteContainer: {
    flex: 1,
    backgroundColor: "#fff",
    marginTop: -30, // Adjust as needed
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 10,
  },
  scrollContainer: {
    alignItems: "center", // Center align tiles
  },
  tile: {
    width: "100%",
    height: 110,
    backgroundColor: "#F5F5F5",
    marginVertical: 10,
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    overflow: "hidden",
    marginBottom: 5,
    paddingTop: 5,
    bottom: 10,
  },
  iconContainer: {
    width: 90,
    height: 80,
    backgroundColor: "#fff",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  icon: {
    width: 80,
    height: 80,
  },
  textContainer: {
    flex: 1, // Use flex to take up remaining space
  },
  heading: {
    fontWeight: "bold", // Make the heading bold
    fontSize: 18,
    marginTop: 15,
  },
  sampleText: {
    fontSize: 12, // Set the desired font size for sample text
    color: "#333", // Set the desired text color
    marginTop: 5,
    marginBottom: 6,
  },
});

export default MyFoodPlate;
