import { StackNavigationProp } from "@react-navigation/stack";
import { BottomTabNavigationProp as RNBottomTabNavigationProp } from "@react-navigation/bottom-tabs"; // Renamed to avoid conflict

export type PatientData = {
  patientID: string;
  patientName: string;
  age: string;
  gender: string | null;
  education: string | null;
  occupation: string | null;
  maritalStatus: string | null;
  diet: string | null;
};

interface InsightsDetailRouteParams {
  title: string;
  content: string | string[]; // Allow content to be either string or string[]
  image: any;
}

export type RootStackParamList = {
  WelcomePage: undefined;
  LoginPage: undefined;
  DisclaimerPage: undefined;
  AdminDashboardPage: undefined;
  AddPatientProfile: undefined;
  AddUserProfilePage: undefined;
  ViewUserTablePage: undefined;
  ViewPatientProfile: { patientID: string };
  AddClinicalProfilePage: undefined;
  ViewClinicalTablePage: undefined;
  ViewPatientTablePage: undefined;
  AddMetabolicProfilePage: undefined;
  ViewMetabolicTablePage: undefined;
  PatientDashboardPage: undefined;
  VegDietPage: undefined;
  WaterPage: undefined;
  YogaPage: undefined;
  SleepRitualsPage: undefined;
  LifestyleMonitoring: undefined;
  NonVegDietPage: undefined;
  Insights: undefined;
  Exercise: undefined;
  ExerciseVideos: undefined;
  BreathingExercise: undefined;
  DailyExercise: undefined;
  Walking: undefined;
  MedicationManager: undefined;
  MedicationInclusion: undefined;
  // MedicationManager: { paramName: string } | undefined; // If params are optional or required
  PatientMedication: undefined;
  PatientProfile: undefined;
  DailyUploads: undefined;
  BottomTabs: undefined;
  PatientDailyLogTableScreen: undefined;
  i18n: undefined;
  UserFeedbackForm: undefined;
  NotificationPage: undefined;
  DietaryChange: undefined;
  MyFoodPlate: undefined;
  WalkingGuidelines: undefined;
  ReviewFeedbackScreen: undefined;
  SupportPage: undefined;
  ActivitiesBottomMenu: undefined;
  TranslationContext: undefined;
  TempTestNavigation: undefined;
};

// Define the navigation prop types with the new name
export type ViewPatientTableNavigationProp = StackNavigationProp<
  RootStackParamList,
  "ViewPatientTablePage"
>;
export type AdminDashboardPageNavigationProp = StackNavigationProp<
  RootStackParamList,
  "AdminDashboardPage"
>;
