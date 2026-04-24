import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { CustomButton } from '@/src/components/button/CustomButton';
import { ProtectedRoute } from '@/src/components/ProtectedRoute';
import { Typography } from '@/src/components/typography/Typography';
import { theme } from '@/src/theme/theme';

function MentorDashboardContent() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconWrapper}>
          <Ionicons name="school-outline" size={48} color={theme.colors.primary} />
        </View>
        <Typography variant="h2" style={styles.title}>
          Mentor Dashboard
        </Typography>
        <Typography variant="body" style={styles.subtitle}>
          Quản lý lịch dạy, gói dịch vụ và thông tin mentor của bạn.
        </Typography>

        <View style={styles.actions}>
          <CustomButton
            label="Quản lý gói dịch vụ"
            onPress={() => router.push('/mentor/services' as any)}
          />
          <CustomButton
            label="Cập nhật hồ sơ"
            variant="outline"
            onPress={() => router.push('/profile/edit' as any)}
          />
        </View>
      </View>
    </View>
  );
}

export default function MentorDashboardScreen() {
  return (
    <ProtectedRoute allowedRoles={['mentor']}>
      <MentorDashboardContent />
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
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    color: theme.colors.text.primary,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  actions: {
    width: '100%',
    gap: 12,
  },
});
