import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuthStore } from '../core/store/authStore';
import { theme } from '../theme/theme';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /**
   * Roles được phép truy cập. Ví dụ: ['admin'] hoặc ['mentor'].
   * Nếu không truyền → chỉ cần đăng nhập là đủ.
   */
  allowedRoles?: string[];
}

/**
 * ProtectedRoute
 * ─────────────────────────────────────────────
 * Web equivalent: sociedu-web/src/components/ProtectedRoute.tsx
 *
 * Logic:
 *   loading  → spinner
 *   !auth    → redirect /(auth)/login
 *   sai role → redirect /(tabs)
 *   ok       → render children
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const loading = useAuthStore((s) => s.loading);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  if (allowedRoles && !user?.roles.some((role) => allowedRoles.includes(role))) {
    return <Redirect href="/(tabs)" />;
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
});
