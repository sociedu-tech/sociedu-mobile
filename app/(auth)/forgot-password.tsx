import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { TextInput } from '../../src/components/form/TextInput';
import { CustomButton } from '../../src/components/button/CustomButton';
import { Typography } from '../../src/components/typography/Typography';
import { authService } from '../../src/core/services/authService';
import { theme } from '../../src/theme/theme';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const normalizedEmail = email.trim();
    if (!normalizedEmail) {
      setError('Vui lòng nhập email để gửi liên kết đặt lại mật khẩu.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await authService.forgotPassword(normalizedEmail);
      Alert.alert('Đã gửi yêu cầu', 'Nếu email tồn tại, backend đã gửi liên kết đặt lại mật khẩu qua email.');
      router.push({
        pathname: '/(auth)/reset-password',
        params: { email: normalizedEmail },
      } as any);
    } catch (err: any) {
      setError(err.message || 'Không thể gửi yêu cầu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Typography variant="h1" style={styles.title}>Quên mật khẩu</Typography>
          <Typography variant="body" color="secondary" style={styles.subtitle}>
            Backend gửi token qua email trong liên kết đặt lại mật khẩu. Bạn có thể dùng deep link hoặc nhập token thủ công ở màn đặt lại mật khẩu.
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
              label="Gửi liên kết đặt lại"
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
