import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';

import { CustomButton } from '@/src/components/button/CustomButton';
import { Typography } from '@/src/components/typography/Typography';
import { theme } from '@/src/theme/theme';

export default function MarketplaceScreen() {
  const router = useRouter();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        padding: theme.spacing.lg,
        backgroundColor: theme.colors.background,
      }}
    >
      <Typography variant="h2" align="center" style={{ marginBottom: theme.spacing.xl }}>
        Marketplace Area
      </Typography>

      <CustomButton
        label="Xem Document ID: 123"
        onPress={() => router.push('/(tabs)/marketplace/123')}
      />
    </View>
  );
}
