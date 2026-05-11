import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { TextInput } from '../../src/components/form/TextInput';
import { CustomButton } from '../../src/components/button/CustomButton';
import { Typography } from '../../src/components/typography/Typography';
import { authService } from '../../src/core/services/authService';
import { useAuthStore } from '../../src/core/store/authStore';
import { theme } from '../../src/theme/theme';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const storeLogin = useAuthStore((s) => s.login);
  const params = useLocalSearchParams<{ token?: string; email?: string }>();
  const initialToken = typeof params.token === 'string' ? params.token : '';
  const email = typeof params.email === 'string' ? params.email : '';
  const [token, setToken] = useState(initialToken);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const autoSubmitRef = useRef(false);

  const verifyToken = useCallback(async (value: string) => {
    const normalizedToken = value.trim();
    if (!normalizedToken) {
      setError('Vui lòng nhập token xác minh.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const user = await authService.verifyEmail(normalizedToken);
      if (user) {
        storeLogin(user);
        Alert.alert('Xác minh thành công', 'Tài khoản đã được kích hoạt và đăng nhập.');
        router.replace('/(tabs)');
      } else {
        Alert.alert('Xác minh thành công', 'Email đã được xác minh. Vui lòng đăng nhập lại.');
        router.replace('/(auth)/login');
      }
    } catch (err: any) {
      setError(err.message || 'Không thể xác minh email.');
    } finally {
      setLoading(false);
    }
  }, [router, storeLogin]);

  useEffect(() => {
    if (!initialToken || autoSubmitRef.current) return;
    autoSubmitRef.current = true;
    void verifyToken(initialToken);
  }, [initialToken, verifyToken]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Typography variant="h1" style={styles.title}>Xác minh email</Typography>
          <Typography variant="body" color="secondary" style={styles.subtitle}>
            Màn hình này hỗ trợ cả deep link và nhập token thủ công để kiểm thử luồng `/auth/verify-email`.
          </Typography>

          <View style={styles.card}>
            <TextInput
              label="TOKEN"
              placeholder="Dán token từ email vào đây"
              value={token}
              onChangeText={setToken}
              autoCapitalize="none"
              error={error ?? undefined}
              helperText={email ? `Email đang kiểm thử: ${email}` : undefined}
            />

            <CustomButton
              label="Xác minh email"
              variant="gradient"
              size="lg"
              loading={loading}
              onPress={() => verifyToken(token)}
              style={styles.button}
            />

            {email ? (
              <CustomButton
                label="Gui lai email xac minh"
                variant="outline"
                size="lg"
                disabled={loading}
                onPress={async () => {
                  try {
                    await authService.resendVerification(email);
                    Alert.alert('Đã gửi lại', 'Hệ thống đã gửi lại email xác minh nếu email hợp lệ.');
                  } catch (err: any) {
                    Alert.alert('Không thể gửi lại', err.message || 'Vui lòng thử lại sau.');
                  }
                }}
                style={styles.buttonSecondary}
              />
            ) : null}
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
  buttonSecondary: {
    marginTop: 12,
    borderRadius: 16,
  },
});
