import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../../src/components/typography/Typography';
import { ProtectedRoute } from '../../src/components/ProtectedRoute';
import { theme } from '../../src/theme/theme';

/**
 * MentorDashboard – tương đương "/mentor-dashboard" trên web (cần role=mentor).
 */
function MentorDashboardContent() {
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
          Quản lý lịch dạy, đánh giá từ học viên và thu nhập của bạn.
        </Typography>
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
  },
});
