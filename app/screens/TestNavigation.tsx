import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../type';
import { SafeAreaProvider } from 'react-native-safe-area-context';

type TestNotoficationPageNavigationProp = StackNavigationProp<RootStackParamList, 'TempTestNavigation'>;

const TempTestNavigation: React.FC = () => {
  
  const navigation = useNavigation<TestNotoficationPageNavigationProp>();

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Text style={styles.title}>Form Navigation</Text>

          {/* Each TouchableOpacity now has a button with a label */}
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('SleepRitualsPage')}
          >
            <Text style={styles.buttonText}>Sleep Rituals</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('VegDietPage')}
          >
            <Text style={styles.buttonText}>Vegetarian Diet</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('NonVegDietPage')}
          >
            <Text style={styles.buttonText}>Non-Vegetarian Diet</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('WaterPage')}
          >
            <Text style={styles.buttonText}>Water Intake</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('PatientMedication')}
          >
            <Text style={styles.buttonText}>Patient Medication</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Exercise')}
          >
            <Text style={styles.buttonText}>Exercise</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('BreathingExercise')}
          >
            <Text style={styles.buttonText}>Breathing Exercise</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Walking')}
          >
            <Text style={styles.buttonText}>Walking</Text>
          </TouchableOpacity>

          

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('YogaPage')}
          >
            <Text style={styles.buttonText}>Yoga</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('LifestyleMonitoring')}
          >
            <Text style={styles.buttonText}>Lifestyle Monitoring</Text>
          </TouchableOpacity>
        </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 50,
  },
  scrollContainer: {
    flexGrow: 1,
    
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#DC143C',
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
    marginVertical: 10,
    width: '60%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default TempTestNavigation;
