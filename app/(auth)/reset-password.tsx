import React, { useEffect, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { TextInput } from '../../src/components/form/TextInput';
import { CustomButton } from '../../src/components/button/CustomButton';
import { Typography } from '../../src/components/typography/Typography';
import { authService } from '../../src/core/services/authService';
import { theme } from '../../src/theme/theme';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ token?: string; email?: string }>();
  const [token, setToken] = useState(typeof params.token === 'string' ? params.token : '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const tokenAutoFilled = useRef(Boolean(params.token));

  useEffect(() => {
    if (typeof params.token === 'string' && tokenAutoFilled.current) {
      setToken(params.token);
    }
  }, [params.token]);

  const handleSubmit = async () => {
    const normalizedToken = token.trim();
    if (!normalizedToken) {
      setError('Vui lòng nhập token đặt lại mật khẩu.');
      return;
    }
    if (!password) {
      setError('Vui lòng nhập mật khẩu mới.');
      return;
    }
    if (password.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await authService.resetPassword(normalizedToken, password);
      Alert.alert('Đặt lại thành công', 'Bạn có thể đăng nhập lại bằng mật khẩu mới.');
      router.replace('/(auth)/login');
    } catch (err: any) {
      setError(err.message || 'Không thể đặt lại mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Typography variant="h1" style={styles.title}>Đặt lại mật khẩu</Typography>
          <Typography variant="body" color="secondary" style={styles.subtitle}>
            Màn hình này nhận token từ deep link nếu có, hoặc cho phép nhập token thủ công để kiểm thử nhanh.
          </Typography>

          <View style={styles.card}>
            <TextInput
              label="TOKEN"
              placeholder="Dán token từ email vào đây"
              value={token}
              onChangeText={setToken}
              autoCapitalize="none"
              helperText={typeof params.email === 'string' ? `Email đang kiểm thử: ${params.email}` : undefined}
            />

            <TextInput
              label="MẬT KHẨU MỚI"
              placeholder="••••••••"
              leftIcon="lock-closed"
              rightIcon={showPassword ? 'eye-off' : 'eye'}
              onRightIconPress={() => setShowPassword((prev) => !prev)}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />

            <TextInput
              label="XÁC NHẬN MẬT KHẨU"
              placeholder="••••••••"
              leftIcon="shield-checkmark"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
              error={error ?? undefined}
            />

            <CustomButton
              label="Cập nhật mật khẩu"
              variant="gradient"
              size="lg"
              loading={loading}
              onPress={handleSubmit}
              style={styles.button}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: 24,
    paddingTop: 32,
  },
  title: {
    fontWeight: '900',
    marginBottom: 8,
  },
  subtitle: {
    lineHeight: 22,
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    ...theme.shadows.soft,
  },
  button: {
    marginTop: 8,
    borderRadius: 16,
  },
});
