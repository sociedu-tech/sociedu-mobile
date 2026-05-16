import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';

import { useAuthStore } from '../src/core/store/authStore';
import { theme } from '../src/theme/theme';

const AUTH_SCREENS_ALLOWED_WHEN_AUTHENTICATED = new Set(['otp', 'verify-email', 'reset-password']);

export default function RootLayout() {
  const hydrate = useAuthStore((s) => s.hydrate);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const loading = useAuthStore((s) => s.loading);

  const segments = useSegments();
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    hydrate().finally(() => setHydrated(true));
  }, [hydrate]);

  useEffect(() => {
    if (!hydrated || loading) return;

    const rootSegment = segments[0];
    const inAuthGroup = rootSegment === '(auth)';
    const authScreen = segments[1];

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
      return;
    }

    if (
      isAuthenticated &&
      inAuthGroup &&
      !AUTH_SCREENS_ALLOWED_WHEN_AUTHENTICATED.has(authScreen ?? '')
    ) {
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
      <Stack.Screen name="profile/edit" options={{ headerShown: false }} />
      <Stack.Screen name="profile/phone-verification" options={{ headerShown: false }} />
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
