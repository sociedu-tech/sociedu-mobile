import { View } from 'react-native';
import { useRouter } from 'expo-router';

import { CustomButton } from '@/src/components/button/CustomButton';
import { Typography } from '@/src/components/typography/Typography';
import { theme } from '@/src/theme/theme';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View
      style={{
        flex: 1,
        padding: theme.spacing.lg,
        justifyContent: 'center',
        backgroundColor: theme.colors.background,
      }}
    >
      <Typography variant="h1" color="primary" align="center" style={{ marginBottom: theme.spacing.md }}>
        UniShare
      </Typography>
      <Typography variant="body" color="secondary" align="center" style={{ marginBottom: theme.spacing.xl }}>
        Nen tang chia se tai lieu va ket noi Mentor tot nhat danh cho sinh vien.
      </Typography>

      <CustomButton
        label="Dang Nhat Ngay"
        onPress={() => router.push('/(auth)/login')}
        style={{ marginBottom: theme.spacing.md }}
      />
      <CustomButton
        label="Tao Tai Khoan"
        variant="outline"
        onPress={() => router.push('/(auth)/register')}
      />
    </View>
  );
}
