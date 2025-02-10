import React from 'react';
import { View, Text as RNText, TouchableOpacity, Modal, StyleSheet, ImageBackground } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

// Custom Text component to disable font scaling globally 
const Text = (props: any) => { return <RNText {...props} allowFontScaling={false} />; };



interface HealthActivityPopupProps {
  visible: boolean;
  onClose: (response?: string) => void; // Callback to handle closing or navigation
}

const HealthActivityPopup: React.FC<HealthActivityPopupProps> = ({ visible, onClose }) => {
  return (
    <Modal
      transparent={true}
      animationType="slide"
      visible={visible}
      onRequestClose={() => onClose('close')} // Close the modal only when "close" is triggered
    >
      <View style={styles.overlay}>
        <ImageBackground
          source={require('../../assets/images/popupdash.jpg')} // Ensure the image path is correct
          style={styles.popupContainer}
          imageStyle={styles.image}
        >
          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={() => onClose('close')}>
            <FontAwesome name="times" size={22} color="#696969" />
          </TouchableOpacity>

          <View style={styles.contentContainer}>
            <Text style={styles.title}>Quick Check-In</Text>
            {/* You can add additional content here if needed */}
          </View>

          {/* Let's Go Button (Triggers navigation) */}
          <View style={styles.optionsContainer}>
            <TouchableOpacity style={styles.optionButton} onPress={() => onClose('letsgo')}>
              <FontAwesome name="heart" size={18} color="#DC143C" />
              <Text style={styles.optionText}>Let's Go</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)', // Semi-transparent background
  },
  popupContainer: {
    width: '80%', // Responsive width
    height: '55%', // Responsive height
    borderRadius: 40,
    overflow: 'visible',
    backgroundColor: '#fff',
  },
  image: {
    resizeMode: 'contain',
    width: '100%', // Full width of the popup
    height: '100%', // Full height of the popup
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    bottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 200, // Adjust the bottom margin as needed
  },
  optionsContainer: {
    justifyContent: 'flex-end', // Align options to the bottom
    alignItems: 'center',
    width: '100%',
    paddingBottom: 20, // Add padding at the bottom
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'rgba(255,0,0, 0.2)', // Light red background
    margin: 8, // Margin for spacing
    borderRadius: 55,
    justifyContent: 'center',
  },
  optionText: {
    marginLeft: 10,
    fontSize: 14,
  },
  closeButton: {
    position: 'absolute', // Position the close button absolutely within the popup
    top: 10, // Position from the top
    right: 10, // Position from the right
    borderWidth: 1,
    borderRadius: 40,
    borderColor: "#fff",
    backgroundColor: "#fff", // White background for the close button
    padding: 10, // Padding for the close button
  },
});

export default HealthActivityPopup;