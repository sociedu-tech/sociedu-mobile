import { View } from 'react-native';
import { Typography } from '../../src/components/typography/Typography';
import { CustomButton } from '../../src/components/button/CustomButton';
import { theme } from '../../src/theme/theme';
import { useAuthStore } from '../../src/core/store/authStore';

export default function LoginScreen() {
  const login = useAuthStore((state) => state.login);

  return (
    <View style={{ flex: 1, padding: theme.spacing.lg, justifyContent: 'center', backgroundColor: theme.colors.background }}>
      <Typography variant="h2" align="center" style={{ marginBottom: theme.spacing.xl }}>
        Mô phỏng Đăng Nhập
      </Typography>
      
      <CustomButton label="Bấm vào đây để Login" onPress={login} />
    </View>
  );
}
