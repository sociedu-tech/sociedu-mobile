import { View } from 'react-native';
import { Typography } from '../../src/components/typography/Typography';
import { CustomButton } from '../../src/components/button/CustomButton';
import { theme } from '../../src/theme/theme';

export default function RegisterScreen() {
  return (
    <View style={{ flex: 1, padding: theme.spacing.lg, justifyContent: 'center', backgroundColor: theme.colors.background }}>
      <Typography variant="h2" align="center" style={{ marginBottom: theme.spacing.xl }}>
        Đăng Ký Tài Khoản
      </Typography>
      <CustomButton label="Tính năng chưa mở" disabled />
    </View>
  );
}
