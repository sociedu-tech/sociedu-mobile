import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Typography } from '../typography/Typography';
import { theme } from '../../theme/theme';

interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = 'Đang tải dữ liệu...',
  fullScreen = true
}) => {
  return (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      {message ? (
        <Typography variant="body" color="secondary" align="center" style={styles.text}>
          {message}
        </Typography>
      ) : null}
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
  text: {
    marginTop: theme.spacing.md,
  }
});
