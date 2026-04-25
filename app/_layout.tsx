import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';

import { useAuthStore } from '@/src/features/auth/store/authStore';
import { theme } from '@/src/theme/theme';

export default function RootLayout() {
  const hydrate = useAuthStore((state) => state.hydrate);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const loading = useAuthStore((state) => state.loading);

  const segments = useSegments();
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    hydrate().finally(() => setHydrated(true));
  }, [hydrate]);

  useEffect(() => {
    if (!hydrated || loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [hydrated, isAuthenticated, loading, router, segments]);

  if (!hydrated || loading) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="profile/[id]" options={{ headerShown: true, title: 'Hồ sơ' }} />
      <Stack.Screen name="profile/edit" options={{ headerShown: false, title: 'Chỉnh sửa hồ sơ' }} />
      <Stack.Screen name="booking/payment-result" options={{ headerShown: false }} />
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
