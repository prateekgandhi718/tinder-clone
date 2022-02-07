import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { AuthProvider } from './hooks/useAuth';
import StackNavigator from './StackNavigator';
import { LogBox } from 'react-native';


export default function App() {
  LogBox.ignoreLogs(['Setting a timer']);
  return (
    <NavigationContainer>
      <AuthProvider>
        <StackNavigator />
      </AuthProvider>
    </NavigationContainer>
  );
}


