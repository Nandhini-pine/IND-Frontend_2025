import React, { useState, useEffect } from "react";
import {
  View,
  Text as RNText,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RootStackParamList } from "../../type";

// Custom Text component to disable font scaling globally 
const Text = (props: any) => { return <RNText {...props} allowFontScaling={false} />; };


// Define the notification item type
type NotificationItem = {
  id: string; // Ensure this is a string; it doesn't have to be a key of RootStackParamList
  title: string;
  description: string;
  destination: keyof RootStackParamList; // Keep this as it is
};

interface PatientDetails {
  patient_id: string;
  diet: string;
  name: string;
}

const NotificationPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [patientDetails, setPatientDetails] = useState<PatientDetails | null>(null);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const checkDataAndNotify = async () => {
    const currentDate = new Date();
    const currentHour = currentDate.getHours();
    const currentMinutes = currentDate.getMinutes();
    const isPastFourPM = currentHour > 8 || (currentHour === 8 && currentMinutes > 0);

    const checkData = async (url: string, dataType: string, destination: keyof RootStackParamList) => {
      try {
        const response = await axios.get(url);
        if (!response.data.exists && isPastFourPM) {
          setNotifications(prev => [
            ...prev,
            {
              id: `${dataType}-notification`, // Keep this as a string
              title: `${dataType.charAt(0).toUpperCase() + dataType.slice(1)} Data Reminder`,
              description: `Please fill out your ${dataType} data.`,
              destination, // Set the destination for navigation
            }
          ]);
        }
      } catch (error) {
        console.error(`Error fetching ${dataType} data:`, error);
      }
    };

    if (patientDetails) {
      await Promise.all([
        checkData(`https://indheart.pinesphere.in/patient/patient/${patientDetails.patient_id}/sleep-data/`, "sleep", "SleepRitualsPage"),
        checkData(`https://indheart.pinesphere.in/patient/patient/${patientDetails.patient_id}/vegdiet-data/`, "veg diet", "VegDietPage"),
        checkData(`https://indheart.pinesphere.in/patient/patient/${patientDetails.patient_id}/nonvegdiet-data/`, "non-veg diet", "NonVegDietPage"),
        checkData(`https://indheart.pinesphere.in/patient/patient/${patientDetails.patient_id}/water-data/`, "water", "WaterPage"),
        checkData(`https://indheart.pinesphere.in/patient/patient/${patientDetails.patient_id}/daily-exercise-data/`, "exercise", "DailyExercise"),
        checkData(`https://indheart.pinesphere.in/patient/patient/${patientDetails.patient_id}/walking-data/`, "walking", "Walking"),
        checkData(`https://indheart.pinesphere.in/patient/patient/${patientDetails.patient_id}/yoga-data/`, "yoga", "YogaPage"),
        checkData(`https://indheart.pinesphere.in/patient/patient/${patientDetails.patient_id}/medicine-data/`, "medicine", "PatientMedication"),
        checkData(`https://indheart.pinesphere.in/patient/patient/${patientDetails.patient_id}/lifestyle-data/`, "lifestyle", "LifestyleMonitoring"),

      ]);
    }
  };

  useEffect(() => {
    const fetchPhoneNumber = async () => {
      const storedPhoneNumber = await AsyncStorage.getItem("phoneNumber");
      if (storedPhoneNumber) {
        fetchPatientDetails(storedPhoneNumber);
      }
    };

    fetchPhoneNumber();
  }, []);

  const fetchPatientDetails = async (phone: string) => {
    try {
      const response = await axios.get(`https://indheart.pinesphere.in/patient/patient/${phone}/`);
      setPatientDetails({
        patient_id: response.data.patient_id,
        diet: response.data.diet,
        name: response.data.name,
      });
    } catch (error) {
      console.error("Error fetching patient details:", error);
    }
  };

  useEffect(() => {
    if (patientDetails) {
      checkDataAndNotify();
    }
  }, [patientDetails]);

  const handleNotificationPress = (destination: keyof RootStackParamList) => {
    navigation.navigate(destination as never); // Use as never to bypass type check
  };

  const renderNotificationItem = ({ item }: { item: NotificationItem }) => (
    <TouchableOpacity onPress={() => handleNotificationPress(item.destination)}>
      <View style={styles.notificationItem}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationDescription}>{item.description}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={20} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotificationItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text style={styles.emptyText}>No notifications</Text>}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    marginTop: 50,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 15,
  },
  listContainer: {
    padding: 16,
  },
  notificationItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginBottom: 10,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  notificationDescription: {
    fontSize: 14,
    color: "#555",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#888",
  },
});

export default NotificationPage;