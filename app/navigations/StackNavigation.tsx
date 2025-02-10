import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { RootStackParamList } from "../../type";
import { StackNavigationOptions } from '@react-navigation/stack';
import BottomTabs from "./BottomTabNavigator";
import WelcomePage from "../screens/Welcome";
import LoginPage from "../screens/Login";
import DisclaimerPage from "../screens/Disclaimer";
import AdminDashboardPage from "../screens/AdminDashboard";
import AddPatientProfile from "../screens/AddPatientProfile";
import AddUserProfilePage from "../screens/AddUserProfile";
import ViewPatientProfile from "../screens/ViewPatientProfile";
import AddClinicalProfilePage from "../screens/AddClinicalProfile";
//import ViewClinicalTablePage from "../screens/ViewClinicalTable";
import ViewPatientTablePage from "../screens/ViewPatientTable";
import AddMetabolicProfilePage from "../screens/AddMetabolicProfile";
//import ViewMetabolicTablePage from "../screens/ViewMetabolicTable";
import PatientDashboardPage from "../screens/PatientDashboard";
import VegDietPage from "../screens/VegDiet";
import WaterPage from "../screens/Water";
import YogaPage from "../screens/Yoga";
import SleepRitualsPage from "../screens/SleepRituals";
import LifestyleMonitoring from "../screens/LifeStyle";
import NonVegDietPage from "../screens/NonVegDiet";
import Insights from "../screens/Insights";
import Exercise from "../screens/Exercise";
import ExerciseVideos from "../screens/ExerciseVideos";
import BreathingExercise from "../screens/BreathingExercise";
import DailyExercise from "../screens/DailyExercise";
import Walking from "../screens/Walking";
import MedicationManager from "../screens/MedicationManager";
import MedicationInclusion from "../screens/MedicationInclusion";
import PatientMedication from "../screens/PatientMedication";
import PatientProfile from "../screens/PatientProfile";
import DailyUploads from "../screens/DailyUploads";
import PatientDailyLogTableScreen from "../screens/PatientDailyLogTable";
import UserFeedbackForm from "../screens/UserFeedBack";
import NotificationPage from "../screens/NotificationPage";
import DietaryChange from "../screens/DietaryChange";
import MyFoodPlate from "../screens/MyFoodPlate";
import WalkingGuidelines from "../screens/WalkingGuidelines";
import ReviewFeedbackScreen from "../screens/ReviewFeedback";
import SupportPage from "../screens/Support";
import ActivitiesBottomMenu from "../screens/ActivitiesBottomMenu";
import TempTestNavigation from "../screens/TestNavigation";


// Extend StackNavigationOptions type
interface CustomStackNavigationOptions extends StackNavigationOptions {
  animationEnabled?: boolean; // Add the missing property
}
const Stack = createStackNavigator<RootStackParamList>();

const StackNavigation: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="WelcomePage">
      <Stack.Screen
  name="WelcomePage"
  component={WelcomePage}
  options={{
    headerShown: false,
    animationEnabled: true, // Now valid after extension
  } as CustomStackNavigationOptions} // Cast to the custom type
/>
<Stack.Screen
  name="LoginPage"
  component={LoginPage}
  options={{
    headerShown: false,
    animationEnabled: true, // Now valid after extension
  } as CustomStackNavigationOptions} // Cast to the custom type
/>

        <Stack.Screen
          name="DisclaimerPage"
          component={DisclaimerPage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AdminDashboardPage"
          component={AdminDashboardPage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AddPatientProfile"
          component={AddPatientProfile}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AddUserProfilePage"
          component={AddUserProfilePage}
          options={{ headerShown: false }}
        />
        
        <Stack.Screen
  name="ViewPatientProfile"
  component={ViewPatientProfile}
  options={{
    headerShown: false,  // Show the header
    headerTitle: '',    // Hide the title
  }}
/>


        <Stack.Screen
          name="AddClinicalProfilePage"
          component={AddClinicalProfilePage}
          options={{ headerShown: false }}
        />
        {/* <Stack.Screen
          name="ViewClinicalTablePage"
          component={ViewClinicalTablePage}
          options={{ headerShown: false }}
        /> */}
        <Stack.Screen
          name="ViewPatientTablePage"
          component={ViewPatientTablePage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AddMetabolicProfilePage"
          component={AddMetabolicProfilePage}
          options={{ headerShown: false }}
        />
        {/* <Stack.Screen
          name="ViewMetabolicTablePage"
          component={ViewMetabolicTablePage}
          options={{ headerShown: false }}
        /> */}
        <Stack.Screen
          name="PatientDashboardPage"
          component={PatientDashboardPage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="VegDietPage"
          component={VegDietPage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="WaterPage"
          component={WaterPage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="YogaPage"
          component={YogaPage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SleepRitualsPage"
          component={SleepRitualsPage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="LifestyleMonitoring"
          component={LifestyleMonitoring}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="NonVegDietPage"
          component={NonVegDietPage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Insights"
          component={Insights}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Exercise"
          component={Exercise}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ExerciseVideos"
          component={ExerciseVideos}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="BreathingExercise"
          component={BreathingExercise}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="DailyExercise"
          component={DailyExercise}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Walking"
          component={Walking}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="MedicationManager"
          component={MedicationManager}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="MedicationInclusion"
          component={MedicationInclusion}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PatientMedication"
          component={PatientMedication}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PatientProfile"
          component={PatientProfile}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="DailyUploads"
          component={DailyUploads}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="BottomTabs"
          component={BottomTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PatientDailyLogTableScreen"
          component={PatientDailyLogTableScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="UserFeedbackForm"
          component={UserFeedbackForm}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="NotificationPage"
          component={NotificationPage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="DietaryChange"
          component={DietaryChange}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="MyFoodPlate"
          component={MyFoodPlate}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="WalkingGuidelines"
          component={WalkingGuidelines}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ReviewFeedbackScreen"
          component={ReviewFeedbackScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SupportPage"
          component={SupportPage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
  name="ActivitiesBottomMenu"
  component={ActivitiesBottomMenu}
  options={{
    headerShown: true,
    title: 'Activity Details',
    headerTitleStyle: {
      fontSize: 16, // Fixed font size for the title
      fontWeight: 'bold',
    }
  }}
/>

        <Stack.Screen
          name="TempTestNavigation"
          component={TempTestNavigation}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default StackNavigation;
