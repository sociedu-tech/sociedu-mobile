import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { TextInput } from '../../src/components/form/TextInput';
import { CustomButton } from '../../src/components/button/CustomButton';
import { Typography } from '../../src/components/typography/Typography';
import { authService } from '../../src/core/services/authService';
import { theme } from '../../src/theme/theme';

export default function LoginOtpRequestScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState(typeof params.email === 'string' ? params.email : '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendOtp = async () => {
    const normalizedEmail = email.trim();
    if (!normalizedEmail) {
      setError('Vui lòng nhập email để nhận OTP.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await authService.sendLoginOtp(normalizedEmail);
      Alert.alert('Đã gửi OTP', 'Nếu email hợp lệ, mã OTP đã được gửi.');
      router.push({
        pathname: '/(auth)/otp',
        params: { mode: 'login-otp', email: normalizedEmail },
      } as any);
    } catch (err: any) {
      setError(err.message || 'Không thể gửi OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Typography variant="h1" style={styles.title}>Đăng nhập bằng OTP</Typography>
          <Typography variant="body" color="secondary" style={styles.subtitle}>
            Màn hình này dùng để gửi OTP đăng nhập qua email bằng endpoint `/auth/otp/send`, sau đó bạn nhập mã 6 số ở bước tiếp theo.
          </Typography>

          <View style={styles.card}>
            <TextInput
              label="EMAIL"
              placeholder="name@university.edu"
              leftIcon="mail"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              error={error ?? undefined}
            />

            <CustomButton
              label="Gửi OTP"
              variant="gradient"
              size="lg"
              loading={loading}
              onPress={handleSendOtp}
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
    marginBottom: 24,
    lineHeight: 22,
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
