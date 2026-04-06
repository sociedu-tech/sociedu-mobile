import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Typography } from '../typography/Typography';
import { theme } from '../../theme/theme';
import { Ionicons } from '@expo/vector-icons';

interface ErrorStateProps {
  error?: string;
  onRetry?: () => void;
  fullScreen?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  error = 'Đã có lỗi xảy ra. Vui lòng thử lại sau.',
  onRetry,
  fullScreen = true
}) => {
  return (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      <View style={styles.iconContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={theme.colors.error} />
      </View>
      <Typography variant="h2" align="center" style={styles.title}>
        Rất tiếc!
      </Typography>
      <Typography variant="body" color="secondary" align="center" style={styles.description}>
        {error}
      </Typography>
      
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry} activeOpacity={0.7}>
          <Ionicons name="refresh" size={18} color={theme.colors.text.inverse} style={styles.retryIcon} />
          <Typography variant="label" color="inverse">
            Thử lại
          </Typography>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEE2E2', // Nền đỏ lợt
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    marginBottom: theme.spacing.sm,
  },
  description: {
    maxWidth: 280,
    marginBottom: theme.spacing.xl,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  retryIcon: {
    marginRight: theme.spacing.sm,
  }
});
