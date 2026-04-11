import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from '../../src/components/typography/Typography';
import { ProtectedRoute } from '../../src/components/ProtectedRoute';
import { theme } from '../../src/theme/theme';
import { useAuthStore } from '../../src/core/store/authStore';

/**
 * EditProfileScreen – tương đương "/edit-profile" trên web (cần auth).
 * Được bọc trong ProtectedRoute – redirect nếu chưa đăng nhập.
 */
function EditProfileContent() {
  const { user } = useAuthStore();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Typography variant="h2" style={styles.title}>
          Chỉnh sửa hồ sơ
        </Typography>
        <Typography variant="body" style={styles.subtitle}>
          Xin chào, {user?.fullName || 'Người dùng'}! Tính năng chỉnh sửa hồ sơ sẽ sớm ra mắt.
        </Typography>
      </View>
    </View>
  );
}

export default function EditProfileScreen() {
  return (
    <ProtectedRoute>
      <EditProfileContent />
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  title: {
    color: theme.colors.text.primary,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
});
