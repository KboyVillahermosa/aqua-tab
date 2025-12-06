import { Stack } from 'expo-router';
import { useEffect } from 'react';
import Toast from 'react-native-toast-message';
import { notificationManager } from './services/notificationManager';
import { LogBox } from 'react-native';

// Suppress Expo Go push notification warning in UI
LogBox.ignoreLogs([
  /expo-notifications: android push notifications.*removed from expo go/i,
  /expo go.*push notifications.*sdk 53/i,
  /expo go.*remote notifications/i,
]);

export default function RootLayout() {
  useEffect(() => {
    // Initialize notification manager
    notificationManager.initialize();

    // Cleanup on unmount
    return () => {
      notificationManager.cleanup();
    };
  }, []);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      <Toast />
    </>
  );
}
