import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Link } from 'expo-router';

import { Typography } from '@/src/components/typography/Typography';
import { theme } from '@/src/theme/theme';

export default function ModalScreen() {
  return (
    <View style={styles.container}>
      <Typography variant="h2" style={{ marginBottom: theme.spacing.md }}>
        Đây là một modal
      </Typography>
      <Link href="/" dismissTo>
        <Typography variant="bodyMedium" style={{ color: theme.colors.primary, fontWeight: '700' }}>
          Quay về trang chủ
        </Typography>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: theme.colors.background,
  },
});
