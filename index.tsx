import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import { registerRootComponent } from "expo";
import { Provider } from "react-redux";
import StackNavigation from "./app/navigations/StackNavigation";
import { store } from "./app/redux/store";
import { Text as RNText, TextProps } from "react-native";
import firebase from '@react-native-firebase/app';
import messaging from '@react-native-firebase/messaging';
import axios from 'axios';

// Custom Text component to disable font scaling globally
const Text = (props: TextProps) => {
  console.log("Custom Text component rendering");
  return <RNText {...props} allowFontScaling={false} />;
};

const firebaseConfig = {
  apiKey: "AIzaSyA5UEWEkfKOEtIERUI-6NF5vGkuMA1ZqFM",
  authDomain: "ind-heart-suraksha.firebaseapp.com",
  projectId: "ind-heart-suraksha",
  storageBucket: "ind-heart-suraksha.firebasestorage.app",
  messagingSenderId: "1083035191759",
  appId: "1:1083035191759:android:7d839f9743ac6f2c7aeaba",
  databaseURL: "https://ind-heart-suraksha.firebaseio.com/"
};


if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig)
    .then(() => {
      console.log('🔥 Firebase initialized successfully');
      requestUserPermission();
    })
    .catch(error => console.error('🚨 Firebase init error:', error));
} else {
  console.log('🔥 Firebase already initialized');
  requestUserPermission();
}

async function sendTokenToServer(token: string) {
  try {
    await axios.post('https://ntt4m9hq-8000.inc1.devtunnels.ms/patient/api/save-token/', { token });
    console.log('Token sent to server successfully');
  } catch (error) {
    console.error('Error sending token to server:', error);
  }
}

async function sendNotification(token: string, title: string, message: string) {
  try {
    await axios.post('https://ntt4m9hq-8000.inc1.devtunnels.ms/patient/api/notify-user/', {
      token,
      title,
      message
    });
    console.log('Notification sent successfully');
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}

messaging()
  .getToken()
  .then(token => {
    console.log('FCM Token:', token);
    sendTokenToServer(token);
    sendNotification(token, 'IND Title', 'IND Test');
  })
  .catch(error => {
    console.error('Error fetching FCM token:', error);
  });

export const name = 'indheart';

async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  console.log('Notification permission status:', authStatus);

  if (authStatus === messaging.AuthorizationStatus.AUTHORIZED || authStatus === messaging.AuthorizationStatus.PROVISIONAL) {
    messaging()
      .getToken()
      .then(token => {
        console.log('FCM Token:', token);
      })
      .catch(error => {
        console.error('Error fetching FCM token:', error);
      });
  }
}

const App = () => {
  useEffect(() => {
    console.warn("🔥 Firebase Initialized for IND");

    // Request permission for push notifications
    requestUserPermission();

    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('📩 Background Notification:', remoteMessage);
    });

    messaging().onMessage(async remoteMessage => {
      try {
        console.log('Foreground notification received:', remoteMessage);
        showAlert("Title", "" + remoteMessage.notification?.body);
      } catch (error) {
        console.error('Error handling foreground notification:', error);
      }
    });

    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('Notification caused app to open from background state:', remoteMessage.notification);
    });

  }, []);

  const showAlert = (title: string, message: string) => {
    Alert.alert(title, message, [{ text: 'OK' }]);
  };

  return (
    <Provider store={store}>
      <StackNavigation />
    </Provider>
  );
};

// Register the root component of the app
registerRootComponent(App);

export default App;