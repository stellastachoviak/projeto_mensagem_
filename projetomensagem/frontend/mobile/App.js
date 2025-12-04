import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/screens/LoginScreen';
import AgentsListScreen from './src/screens/AgentsListScreen';
import ChatScreen from './src/screens/ChatScreen';
import { registerForPushNotificationsAsync } from './src/push/register';
import { Platform } from 'react-native';

const Stack = createNativeStackNavigator();

export default function App() {
  useEffect(() => {
    (async () => {
      try {
        await registerForPushNotificationsAsync();
      } catch (e) {
        console.log('push register error', e);
      }
    })();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Agents" component={AgentsListScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
