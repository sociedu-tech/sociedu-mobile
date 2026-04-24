import { Redirect, Stack } from 'expo-router';

import { useAuthStore } from '@/src/features/auth/store/authStore';

export default function AuthLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="login" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="otp" />
      <Stack.Screen name="reset-password" />
      <Stack.Screen name="register" options={{ headerShown: true, title: 'Đăng ký' }} />
    </Stack>
  );
}
