import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { Typography } from '@/src/components/typography/Typography';
import { theme } from '@/src/theme/theme';

export default function MarketplaceDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        padding: theme.spacing.lg,
        backgroundColor: theme.colors.background,
      }}
    >
      <Typography
        variant="h3"
        align="center"
        color="secondary"
        style={{ marginBottom: theme.spacing.sm }}
      >
        Chi tiet noi dung
      </Typography>
      <Typography variant="h1" color="primary" align="center">
        ID: {id ?? 'unknown'}
      </Typography>
    </View>
  );
}
