import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from '../typography/Typography';
import { theme } from '../../theme/theme';
import { Ionicons } from '@expo/vector-icons';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  actionText?: string;
  onAction?: () => void;
  fullScreen?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon = 'folder-open-outline',
  actionText,
  onAction,
  fullScreen = true
}) => {
  return (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={48} color={theme.colors.primary} />
      </View>
      <Typography variant="h3" color="primary" align="center" style={styles.title}>
        {title}
      </Typography>
      {description ? (
        <Typography variant="body" color="secondary" align="center" style={styles.description}>
          {description}
        </Typography>
      ) : null}
      {/* Chúng ta sẽ chèn CustomButton ở đây sau khi hoàn thành Bước 3 */}
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
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: theme.colors.primaryLighter,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    marginBottom: theme.spacing.sm,
  },
  description: {
    maxWidth: 280, // Giữ độ rộng vừa phải để text xuống dòng đẹp mắt
  }
});
