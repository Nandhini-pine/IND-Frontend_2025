// app/navigations/BottomTabs.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import LifestyleMonitoring from '../screens/LifeStyle';
import Insights from '../screens/Insights';
import MyActivity from '../screens/Myactivity';
import PatientProfile from '../screens/PatientProfile';

const Tab = createBottomTabNavigator();

const BottomTabs = () => (
  <Tab.Navigator
  screenOptions={{
    headerShown: false,
  }}
>
  <Tab.Screen name="Lifestyle" component={LifestyleMonitoring} />
  <Tab.Screen name="Insights" component={Insights} />
  <Tab.Screen name="Activities" component={MyActivity} />
  <Tab.Screen name="PatientProfile" component={PatientProfile} />
</Tab.Navigator>

);

export default BottomTabs;
