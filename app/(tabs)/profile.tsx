import { View } from 'react-native';
import { Typography } from '../../src/components/typography/Typography';
import { CustomButton } from '../../src/components/button/CustomButton';
import { theme } from '../../src/theme/theme';
import { useAuthStore } from '../../src/core/store/authStore';

export default function ProfileScreen() {
  const logout = useAuthStore((state) => state.logout);

  return (
    <View style={{ flex: 1, padding: theme.spacing.lg, justifyContent: 'center', backgroundColor: theme.colors.background }}>
      <Typography variant="h2" align="center" style={{ marginBottom: theme.spacing.xl }}>
        Hồ sơ Cá nhân
      </Typography>
      
      <CustomButton label="Đăng xuất" variant="primary" onPress={logout} />
    </View>
  );
}
