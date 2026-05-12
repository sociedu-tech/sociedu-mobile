import { Redirect, Stack, useSegments } from 'expo-router';

import { useAuthStore } from '../../src/core/store/authStore';

const AUTH_SCREENS_ALLOWED_WHEN_AUTHENTICATED = new Set(['otp', 'verify-email', 'reset-password']);

export default function AuthLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const segments = useSegments();
  const currentScreen = segments[1];

  if (
    isAuthenticated &&
    !AUTH_SCREENS_ALLOWED_WHEN_AUTHENTICATED.has(currentScreen ?? '')
  ) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="login-otp-request" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="otp" />
      <Stack.Screen name="verify-email-pending" />
      <Stack.Screen name="verify-email" />
      <Stack.Screen name="reset-password" />
    </Stack>
  );
}
