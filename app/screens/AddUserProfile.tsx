import React, { useState } from 'react';
import { View, Text as RNText, TextInput, StyleSheet, ScrollView, Alert, Platform, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { Picker} from '@react-native-picker/picker';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Custom Text component to disable font scaling globally 
const Text = (props: any) => { return <RNText {...props} allowFontScaling={false} />; };

const AddUserProfilePage: React.FC = () => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState(''); // Default value for Picker
  const [otherDetails, setOtherDetails] = useState('');

  const handleSave = () => {
    Alert.alert('Saved', 'User profile has been saved.');
  };

  const handleClear = () => {
    setName('');
    setAge('');
    setGender('');
    setOtherDetails('');
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel',
      'Are you sure you want to cancel?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () => {
            // Handle cancel action here, e.g., navigate back
            console.log('Cancellation confirmed.');
          },
        },
      ]
    );
  };

  const handleViewUserTable = () => {
    Alert.alert('View User Table', 'This feature is not implemented yet.');
  };

  return (
    <SafeAreaProvider> 
<SafeAreaView style={styles.safeArea}>
      {/* Adjust StatusBar visibility */}
      <StatusBar 
        barStyle="dark-content"        // Set the color of status bar text
        backgroundColor="transparent"  // Make the background transparent
        translucent={true}             // Make status bar translucent
      />

    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Add User Profile</Text>
      <View style={styles.formWrapper}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Name:</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter name"
          />
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Age:</Text>
          <TextInput
            style={styles.input}
            value={age}
            onChangeText={setAge}
            placeholder="Enter age"
            keyboardType="numeric"
          />
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Gender:</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={gender}
              onValueChange={(itemValue) => setGender(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Select gender" value="" style={styles.placeholder} />
              <Picker.Item label="Male" value="male" />
              <Picker.Item label="Female" value="female" />
              <Picker.Item label="Other" value="other" />
            </Picker>
          </View>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.clearButton]} onPress={handleClear}>
            <Text style={styles.buttonText}>Clear</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleCancel}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={[styles.button, styles.viewTableButton]} onPress={handleViewUserTable}>
        <Text style={styles.buttonText}>View User Table</Text>
      </TouchableOpacity>
    </ScrollView>
    </SafeAreaView>
</SafeAreaProvider>

  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'ios' ? 70 : 70,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#36454F',
    marginBottom: 20,
    textAlign: 'center',
  },
  formWrapper: {
    backgroundColor: '#f9f9f9',
    borderRadius: 35,
    padding: 16,
    borderColor: '#fff',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  formGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'medium',
    color: '#36454F',
    flex: 1,
  },
  input: {
    flex: 2,
    height: 40,
    borderColor: '#fff',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  pickerWrapper: {
    flex: 2,
    borderColor: '#fff',
    borderWidth: 1,
    borderRadius: 5,
    overflow: 'hidden',
    right: 8,
  },
  picker: {
    height: 40,
    width: '100%',
  },
  placeholder: {
    color: '#9e9e9e', // Grey color for placeholder text
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 15,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  clearButton: {
    backgroundColor: '#FFC107',
  },
  cancelButton: {
    backgroundColor: '#F44336',
  },
  viewTableButton: {
    backgroundColor: '#3F51B5', // Different color for distinction
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
    marginVertical: 20, // Add margin to separate from other buttons
    height: 50,
  },
});

export default AddUserProfilePage;
