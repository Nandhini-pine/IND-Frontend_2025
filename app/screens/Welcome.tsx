import React, { useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Animated,
  Easing,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Video, ResizeMode } from "expo-av";

type RootStackParamList = {
  WelcomePage: undefined;
  LoginPage: undefined;
};

type WelcomePageNavigationProp = StackNavigationProp<
  RootStackParamList,
  "WelcomePage"
>;

const WelcomePage: React.FC = () => {
  const navigation = useNavigation<WelcomePageNavigationProp>();
  const logoAnim = useRef(new Animated.Value(0)).current; // Animation for logo
  const scaleAnim = useRef(new Animated.Value(0)).current; // Animation for scale

  useEffect(() => {
    // Logo animation (fade-in and scale)
    Animated.timing(logoAnim, {
      toValue: 1,
      duration: 1500,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();

    // Scale animation
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 1500,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();

    // Set a timer to navigate after 3 seconds
    const timer = setTimeout(() => {
      navigation.navigate("LoginPage"); // Adjust 'LoginPage' to match your route name
    }, 3000);

    // Clean up the timer if the component unmounts
    return () => clearTimeout(timer);
  }, [navigation, logoAnim, scaleAnim]);

  // Animated styles for logo
  const animatedLogoStyle = {
    opacity: logoAnim,
    transform: [
      {
        scale: scaleAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.5, 1], // Scale from smaller to normal size
        }),
      },
    ],
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent={true}
      />
      <View style={styles.container}>
        <Video
          source={require("../../assets/videos/logoVid.mp4")} // Path to your video
          style={styles.video}
          resizeMode={ResizeMode.COVER}
          isLooping
          shouldPlay
        />
        <Animated.View style={[styles.overlay, animatedLogoStyle]}>
          {/* Place any overlay content here if needed */}
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000", // Optional: set a background color
  },
  container: {
    flex: 1,
  },
  video: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default WelcomePage;