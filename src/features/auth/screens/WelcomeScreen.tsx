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
        Nền tảng kết nối sinh viên với mentor phù hợp để được định hướng,
        tư vấn và phát triển kỹ năng.
      </Typography>

      <CustomButton
        label="Đăng nhập ngay"
        onPress={() => router.push('/(auth)/login')}
        style={{ marginBottom: theme.spacing.md }}
      />
      <CustomButton
        label="Tạo tài khoản"
        variant="outline"
        onPress={() => router.push('/(auth)/register')}
      />
    </View>
  );
}
