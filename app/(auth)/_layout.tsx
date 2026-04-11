import { Redirect, Stack } from 'expo-router';
import { useAuthStore } from '../../src/core/store/authStore';

/**
 * Auth Layout
 * ─────────────────────────────────────────────
 * Web equivalent: LoginPage / RegisterPage được render tự do,
 *   nhưng redirect về "/" nếu đã authenticated.
 *
 * Expo Router: nếu đã login → <Redirect> về (tabs).
 */
export default function AuthLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" options={{ headerShown: true, title: 'Đăng Ký' }} />
    </Stack>
  );
}
