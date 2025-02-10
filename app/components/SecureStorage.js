// src/utils/SecureStorage.js
import * as SecureStore from 'expo-secure-store';



// Function to save data
export const saveData = async (key, value) => {
  await SecureStore.setItemAsync(key, value);
};

// Function to get data
export const getData = async (key) => {
  const result = await SecureStore.getItemAsync(key);
  return result;
};

// Example usage - you can call these functions in your components
export const storeData = async () => {
  await saveData('userToken', 'your_secure_token_here');
};

export const retrieveData = async () => {
  const token = await getData('userToken');
  console.log('Retrieved token:', token);
};
