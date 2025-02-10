import React, { useState, useEffect } from "react";
import {
  View,
  Text as RNText,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BarChart } from "react-native-chart-kit";


// Custom Text component to disable font scaling globally 
const Text = (props: any) => { return <RNText {...props} allowFontScaling={false} />; };


interface PatientDetails {
  patient_id: string;
  diet: string;
}

interface WeekReportItem {
  day: string;
  date: string;
  id: string;
}

const ActivitiesBottomMenu = () => {
  const screenWidth = Dimensions.get("window").width;

  const [walkingData, setWalkingData] = useState([0, 0, 0, 0, 0, 0, 0]);
  const [error, setError] = useState("");
  const [patientDetails, setPatientDetails] = useState<PatientDetails | null>(null);
  const [weekReport, setWeekReport] = useState<WeekReportItem[]>([]); // Use the defined type here

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
      const response = await axios.get(
        `https://indheart.pinesphere.in/patient/patient/${phone}/`
      );
      setPatientDetails(response.data);
    } catch (error) {
      console.error("Error fetching patient details:", error);
    }
  };

  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    if (patientDetails) {
      const fetchWalkingData = async () => {
        try {
          const date = getCurrentDate();
          const url = `https://indheart.pinesphere.in/patient/patient/${patientDetails.patient_id}/week-walking-data/${date}/`;
          const response = await axios.get(url);
          const activities = response.data.walking_activities;

          const weeklyData = [0, 0, 0, 0, 0, 0, 0];
          const dayIndexMap = {
            Mon: 0,
            Tue: 1,
            Wed: 2,
            Thu: 3,
            Fri: 4,
            Sat: 5,
            Sun: 6,
          };

          activities.forEach(
            (activity: { date: string; distance_km: string }) => {
              const date = new Date(activity.date);
              const dayName = date.toLocaleDateString("en-US", {
                weekday: "short",
              }) as keyof typeof dayIndexMap;
              const index = dayIndexMap[dayName];
              if (index !== undefined) {
                weeklyData[index] += parseFloat(activity.distance_km);
              }
            }
          );

          setWalkingData(weeklyData);
        } catch (err) {
          console.error("Error fetching walking data:", err);
          setError("Failed to fetch walking data.");
        }
      };

      fetchWalkingData();
    }
  }, [patientDetails]);

  const fetchMedicationData = async () => {
    if (!patientDetails) return;

    try {
      const currentDate = getCurrentDate();
      const url = `https://indheart.pinesphere.in/patient/patient/${patientDetails.patient_id}/week-medicine-data/${currentDate}/`;
      const response = await axios.get(url);

      const weekData = response.data.data; // Weekly medication status
      const today = new Date(currentDate);
      const updatedWeekReport = weekData.map((item: any) => {
        const itemDate = new Date(response.data.week_start);
        itemDate.setDate(
          itemDate.getDate() +
            ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(item.day)
        );

        item.date = itemDate.toLocaleDateString(); // Or any custom date format

        if (itemDate < today && item.status === "No") {
          return { ...item, id: "missed" };
        } else if (
          itemDate.getTime() === today.getTime() &&
          item.status === "No"
        ) {
          return { ...item, id: "yet to take" };
        } else if (itemDate > today) {
          return { ...item, id: "future" };
        } else if (item.status === "Taken") {
          return { ...item, id: "taken" }; // Add the "taken" case here
        } else {
          return { ...item, id: item.status.toLowerCase() }; // Keeps 'yes' or 'no'
        }
      });

      setWeekReport(updatedWeekReport);
    } catch (err) {
      console.error("Error fetching medication data:", err);
    }
  };

  useEffect(() => {
    fetchMedicationData();
  }, [patientDetails]);

  const getRowColor = (id: string) => {
    switch (id) {
      case "yes":
        return "#d1f7d1"; // Soft Light Green
      case "no":
        return "#f7d1d1"; // Soft Light Red
      case "future":
        return "#d1e4f7"; // Soft Light Blue
      case "yet to take":
        return "#f7e0a2"; // Soft Warm Yellow
      case "taken":
        return "#d1f7d1";
      case "missed":
        return "#f7b8b8"; // Light Red
      default:
        return "transparent";
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent={true}
        />
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.container}>
            <Text style={styles.title}>Walking Metrics</Text>
            
            {/* Walking Metrics Chart */}
            <View style={styles.chartContainer}>
              <BarChart
                data={{
                  labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                  datasets: [
                    {
                      data: walkingData,
                    },
                  ],
                }}
                width={screenWidth - 40}  // Slightly reduced width to prevent overflow
                height={250}  // Increased height for better spacing
                yAxisLabel=""
                yAxisSuffix=" km"
                chartConfig={{
                  backgroundColor: "#ffffff",
                  backgroundGradientFrom: "#ffffff",
                  backgroundGradientTo: "#ffffff",
                  decimalPlaces: 2,
                  color: (opacity = 1) => `rgba(34, 202, 236, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: {
                    borderRadius: 16,
                    marginLeft: 15,  // Add extra margin to prevent cropping on the left
                  },
                  propsForDots: {
                    r: "6",
                    strokeWidth: "2",
                    stroke: "#ffa726",
                  },
                }}
                style={{
                  marginVertical: 8,
                  borderRadius: 16,
                  marginLeft: 20,  // Adjusted to give more space on the left
                  marginRight: 10,
                }}
              />
            </View>

            <View style={styles.table}>
              <View style={styles.rowHeader}>
                <Text style={styles.cellHeader}>Day</Text>
                <Text style={styles.cellHeader}>Distance (km)</Text>
              </View>
              {walkingData.map((distance, index) => (
                <View key={index} style={styles.row}>
                  <Text style={styles.cell}>
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index]}
                  </Text>
                  <Text style={styles.cell}>{distance.toFixed(2)}</Text>
                </View>
              ))}
            </View>

            {/* Medication Table */}
            <Text style={styles.title}>Medication Intake Report</Text>
            <View style={styles.table}>
              {weekReport.length > 0 ? (
                weekReport.map((item, index) => (
                  <View
                    key={index}
                    style={[styles.row, { backgroundColor: getRowColor(item.id) }]}
                  >
                    <Text style={styles.cell}>{item.day}</Text>
                    <Text style={styles.cell}>{item.date}</Text>
                    <Text style={styles.cell}>
                      {item.id.replace(/-/g, " ")}
                    </Text>
                  </View>
                ))
              ) : (
                <Text>No medication data available</Text>
              )}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 10,
  },
  container: {
    marginVertical: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
    marginLeft: 8,
  },
  chartContainer: {
    marginBottom: -10,
    width: "100%",
    paddingHorizontal: 10,
    alignItems: "center",
    padding: 10,
  },
  table: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 25,
    overflow: "hidden",
    marginBottom: 10,
  },
  rowHeader: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    padding: 10,
  },
  row: {
    flexDirection: "row",
    padding: 10,
  },
  cellHeader: {
    flex: 1,
    fontWeight: "bold",
    textAlign: "center",
  },
  cell: {
    flex: 1,
    textAlign: "center",
  },
});

export default ActivitiesBottomMenu;
