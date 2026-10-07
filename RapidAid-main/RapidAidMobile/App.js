import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import DriverLoginScreen from './src/screens/DriverLoginScreen';
import DriverRegisterScreen from './src/screens/DriverRegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import TrackingScreen from './src/screens/TrackingScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#e53935',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Register" 
          component={RegisterScreen}
          options={{ title: 'Register' }}
        />
        <Stack.Screen 
          name="DriverLogin" 
          component={DriverLoginScreen}
          options={{ title: 'Driver Login', headerShown: false }}
        />
        <Stack.Screen 
          name="DriverRegister" 
          component={DriverRegisterScreen}
          options={{ title: 'Driver Register' }}
        />
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ title: 'RapidAid - Home' }}
        />
        <Stack.Screen 
          name="Tracking" 
          component={TrackingScreen}
          options={{ title: 'Track Ambulance' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

