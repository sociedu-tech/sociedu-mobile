import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '../src/core/store/authStore';
import { theme } from '../src/theme/theme';

/**
 * Root Layout
 * ─────────────────────────────────────────────
 * Web equivalent: <AuthProvider> wrapping <Router>
 *
 * Responsibilities:
 * 1. Hydrate auth state từ AsyncStorage khi app khởi động
 * 2. Auth guard: redirect chưa login → (auth), đã login → (tabs)
 * 3. Khai báo Stack cho tất cả route groups
 */
export default function RootLayout() {
  const hydrate = useAuthStore((s) => s.hydrate);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const loading = useAuthStore((s) => s.loading);

  const segments = useSegments();
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);

  // ── Step 1: Hydrate từ AsyncStorage ──────────────────────
  useEffect(() => {
    hydrate().finally(() => setHydrated(true));
  }, []);

  // ── Step 2: Auth guard ───────────────────────────────────
  // Yêu cầu:
  // - Chưa login → Bắt buộc redirect về /(auth)/login
  // - Đã login → Đẩy về /(tabs), không cho phép back lại login
  useEffect(() => {
    if (!hydrated || loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      // Chưa đăng nhập mà cố vào các route khác → chặn lại
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Đã đăng nhập → không cho ở lại auth screens
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments, hydrated, loading]);

  // ── Splash / loading ────────────────────────────────────
  if (!hydrated || loading) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // ── Step 3: Route declarations ──────────────────────────
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(auth)" />

      {/* Stack screens cho detail / protected pages */}
      <Stack.Screen name="profile/[id]" options={{ headerShown: true, title: 'Hồ sơ' }} />
      <Stack.Screen name="profile/edit" options={{ headerShown: false, title: 'Chỉnh sửa hồ sơ' }} />
      <Stack.Screen name="admin/index" options={{ headerShown: true, title: 'Quản trị' }} />
      <Stack.Screen name="mentor/dashboard" options={{ headerShown: true, title: 'Mentor Dashboard' }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
});
