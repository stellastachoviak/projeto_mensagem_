import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { BACKEND_URL } from '../config';

export async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) {
    console.log('Must use physical device for Push Notifications');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    console.log('Failed to get push token for push notification!');
    return null;
  }

  const tokenData = await Notifications.getExpoPushTokenAsync();
  const token = tokenData.data;
  console.log('Push token:', token);

  // Envie o token para o backend para associar ao usuário
  try {
    const endpoint = (BACKEND_URL || process.env.BACKEND_URL) + '/api/push/register';
    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
  } catch (e) {
    console.log('send token error', e);
  }

  return token;
}
