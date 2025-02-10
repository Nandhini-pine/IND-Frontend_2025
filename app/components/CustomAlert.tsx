import React from 'react';
import { Modal, View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import CustomText from './CustomText';

type CustomAlertProps = {
  title: string;
  message: string;
  visible: boolean;
  onClose: () => void;
  onOk?: () => void;  // Optional callback for OK button
  mode?: 'ok' | 'confirm';  // 'ok' for single button, 'confirm' for Yes/No
  onYes?: () => void;
  onNo?: () => void;
  okText?: string;  // Optional text for OK button
  yesText?: string; // Optional text for Yes button
  noText?: string;  // Optional text for No button
  englishOkText?: string;
};


const CustomAlert: React.FC<CustomAlertProps> = ({ 
  title, 
  message, 
  visible, 
  onClose,
  onOk,
  mode = 'ok',
  onYes,
  onNo,
  englishOkText,
  okText = 'OK',  // Default text for OK button
  yesText = 'Yes', // Default text for Yes button
  noText = 'No'  // Default text for No button
}) => {
  const handleOk = () => {
    if (visible) {
      onOk?.();
      onClose();
    }
  };

  const handleYes = () => {
    if (visible) {
      onYes?.();
      onClose();
    }
  };

  const handleNo = () => {
    if (visible) {
      onNo?.();
      onClose();
    }
  };
   // Correctly determine the OK button text with optional chaining
   const displayOkText = okText ?? (englishOkText ?? "OK");

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={mode === 'ok' ? handleOk : handleNo}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <CustomText style={styles.modalTitle}>{title}</CustomText>
          <CustomText style={styles.modalMessage}>{message}</CustomText>
          
          {mode === 'ok' ? (
            // Single OK button
            <TouchableOpacity 
              style={styles.okButton} 
              onPress={handleOk}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>{okText}</Text>
            </TouchableOpacity>
          ) : (
            // Yes/No buttons
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.button, styles.noButton]} 
                onPress={handleNo}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>{noText}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.yesButton]} 
                onPress={handleYes}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>{yesText}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(85, 84, 84, 0.5)',
  },
  modalView: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    marginVertical: 10,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 15,
    justifyContent: 'center',
    width: '100%',
    gap: 10,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 50,
    minWidth: 100,
    alignItems: 'center',
  },
  okButton: {
    backgroundColor: '#f42525',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 50,
    marginTop: 15,
    minWidth: 100,
    alignItems: 'center',
  },
  yesButton: {
    backgroundColor: '#28a745',  // Green color for Yes
  },
  noButton: {
    backgroundColor: '#dc3545',  // Red color for No
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default CustomAlert;