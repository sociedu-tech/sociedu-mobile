import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ProtectedRoute } from '@/src/components/ProtectedRoute';
import { Typography } from '@/src/components/typography/Typography';
import { theme } from '@/src/theme/theme';

function AdminContent() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconWrapper}>
          <Ionicons
            name="shield-checkmark-outline"
            size={48}
            color={theme.colors.primary}
          />
        </View>
        <Typography variant="h2" style={styles.title}>
          Trang Quan tri
        </Typography>
        <Typography variant="body" style={styles.subtitle}>
          Quan ly nguoi dung, bao cao va cai dat he thong.
        </Typography>
      </View>
    </View>
  );
}

export default function AdminDashboardScreen() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminContent />
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
