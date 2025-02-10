// WaterReminderPopupWindow.tsx
import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Image,
  TouchableWithoutFeedback,
  GestureResponderEvent,
  Animated,
  Easing,
  Alert,
} from "react-native";


interface WaterReminderPopupWindowProps {
  visible: boolean;
  onClose: (response?: string) => void;
}

const WaterReminderPopupWindow: React.FC<WaterReminderPopupWindowProps> = ({
  visible,
  onClose,
}) => {
  const slideAnim = useRef(new Animated.Value(50000)).current;
  const [isVisible, setIsVisible] = useState(visible);

  useEffect(() => {
    setIsVisible(visible);
  }, [visible]);

  const handleOptionPress = () => {
    Animated.timing(slideAnim, {
      toValue: 500,
      duration: 800,
      easing: Easing.in(Easing.exp),
      useNativeDriver: true,
    }).start(() => {
      onClose();
      setIsVisible(false);
    });
  };

  const handleCloseOutside = (event: GestureResponderEvent) => {
    onClose();
    setIsVisible(false);
  };

  return (
    <Modal
      transparent={true}
      animationType="none"
      visible={isVisible}
      onRequestClose={() => onClose()}
    >
      <TouchableWithoutFeedback onPress={handleCloseOutside}>
        <View style={styles.overlay}>
          <Animated.View
            style={[
              styles.popupContainer,
              { transform: [{ translateX: slideAnim }] },
            ]}
          >
            {/* <Image
              source={require("../../assets/gif/drinkingwater.gif")}
              style={styles.gifStyle}
              resizeMode="contain"
            /> */}

            <TouchableOpacity onPress={handleOptionPress} style={styles.button}>
              <Text style={styles.buttonText}>
                Stay Energized - Drink 200ml Water Now!
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  popupContainer: {
    width: 300,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  gifStyle: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#4CAF50",
    borderRadius: 5,
    padding: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default WaterReminderPopupWindow;
