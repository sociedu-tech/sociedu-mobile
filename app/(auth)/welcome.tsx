import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Typography } from '../../src/components/typography/Typography';
import { CustomButton } from '../../src/components/button/CustomButton';
import { theme } from '../../src/theme/theme';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, padding: theme.spacing.lg, justifyContent: 'center', backgroundColor: theme.colors.background }}>
      <Typography variant="h1" color="primary" align="center" style={{ marginBottom: theme.spacing.md }}>
        UniShare
      </Typography>
      <Typography variant="body" color="secondary" align="center" style={{ marginBottom: theme.spacing.xl }}>
        Nền tảng chia sẻ tài liệu và kết nối Mentor tốt nhất dành cho sinh viên.
      </Typography>
      
      <CustomButton 
        label="Đăng Nhật Ngay" 
        onPress={() => router.push('/(auth)/login')} 
        style={{ marginBottom: theme.spacing.md }} 
      />
      <CustomButton 
        label="Tạo Tài Khoản" 
        variant="outline" 
        onPress={() => router.push('/(auth)/register')} 
      />
    </View>
  );
}
