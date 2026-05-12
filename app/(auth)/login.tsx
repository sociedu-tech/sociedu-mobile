import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { Typography } from '../../src/components/typography/Typography';
import { TextInput } from '../../src/components/form/TextInput';
import { CustomButton } from '../../src/components/button/CustomButton';
import { theme } from '../../src/theme/theme';
import { useAuthStore } from '../../src/core/store/authStore';
import { authService } from '../../src/core/services/authService';

export default function LoginScreen() {
  const router = useRouter();
  const storeLogin = useAuthStore((s) => s.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const handleLogin = async () => {
    const normalizedEmail = email.trim();
    const nextErrors: { email?: string; password?: string } = {};

    if (!normalizedEmail) nextErrors.email = 'Vui lòng nhập email.';
    if (!password) nextErrors.password = 'Vui lòng nhập mật khẩu.';

    setFieldErrors(nextErrors);
    setError(null);

    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    try {
      const user = await authService.login({ email: normalizedEmail, password });
      storeLogin(user);
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.message || 'Đăng nhập thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <LinearGradient colors={[theme.colors.primary, '#7C3AED']} style={StyleSheet.absoluteFill} />

      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.branding}>
              <View style={styles.logoCircle}>
                <Ionicons name="flash" size={40} color={theme.colors.primary} />
              </View>
              <Typography variant="h1" style={styles.brandTitle}>UniShare</Typography>
              <Typography variant="body" style={styles.brandSubtitle}>
                Đăng nhập để tiếp tục hành trình học tập.
              </Typography>
            </View>

            <View style={styles.card}>
              <Typography variant="h2" style={styles.cardTitle}>Chào mừng trở lại</Typography>
              <Typography variant="caption" color="muted" style={styles.cardSubtitle}>
                Sử dụng mật khẩu hoặc OTP email tùy theo luồng backend bạn muốn kiểm thử.
              </Typography>

              <TextInput
                label="EMAIL"
                placeholder="name@university.edu"
                leftIcon="mail"
                value={email}
                onChangeText={(value) => {
                  setEmail(value);
                  setFieldErrors((prev) => ({ ...prev, email: undefined }));
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                error={fieldErrors.email}
              />

              <TextInput
                label="MẬT KHẨU"
                placeholder="••••••••"
                leftIcon="lock-closed"
                rightIcon={showPassword ? 'eye-off' : 'eye'}
                onRightIconPress={() => setShowPassword((prev) => !prev)}
                value={password}
                onChangeText={(value) => {
                  setPassword(value);
                  setFieldErrors((prev) => ({ ...prev, password: undefined }));
                }}
                secureTextEntry={!showPassword}
                error={fieldErrors.password}
              />

              <TouchableOpacity
                style={styles.inlineAction}
                onPress={() => router.push('/(auth)/forgot-password')}
              >
                <Typography variant="label" color="primary">Quên mật khẩu?</Typography>
              </TouchableOpacity>

              {error ? (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle" size={16} color={theme.colors.error} />
                  <Typography variant="caption" style={styles.errorText}>{error}</Typography>
                </View>
              ) : null}

              <CustomButton
                label="Đăng nhập"
                variant="gradient"
                size="lg"
                loading={loading}
                onPress={handleLogin}
                style={styles.primaryButton}
              />

              <CustomButton
                label="Đăng nhập bằng OTP"
                variant="outline"
                size="lg"
                disabled={loading}
                onPress={() =>
                  router.push({
                    pathname: '/(auth)/login-otp-request',
                    params: email.trim() ? { email: email.trim() } : undefined,
                  } as any)
                }
                style={styles.secondaryButton}
              />

              <View style={styles.footerRow}>
                <Typography variant="body" color="secondary">Chưa có tài khoản?</Typography>
                <Link href="/(auth)/register" asChild>
                  <TouchableOpacity>
                    <Typography variant="body" style={styles.footerLink}> Đăng ký ngay</Typography>
                  </TouchableOpacity>
                </Link>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 40,
  },
  branding: {
    alignItems: 'center',
    marginBottom: 36,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 28,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    ...theme.shadows.premium,
  },
  brandTitle: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 36,
  },
  brandSubtitle: {
    color: 'rgba(255,255,255,0.82)',
    textAlign: 'center',
    marginTop: 8,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 32,
    padding: 28,
    ...theme.shadows.medium,
  },
  cardTitle: {
    fontWeight: '900',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  cardSubtitle: {
    marginBottom: 24,
  },
  inlineAction: {
    alignSelf: 'flex-end',
    marginTop: -10,
    marginBottom: 8,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF1F2',
    padding: 12,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  errorText: {
    color: theme.colors.error,
    fontWeight: '700',
    flex: 1,
  },
  primaryButton: {
    marginTop: 24,
    borderRadius: 16,
  },
  secondaryButton: {
    marginTop: 12,
    borderRadius: 16,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  footerLink: {
    fontWeight: '800',
    color: theme.colors.primary,
  },
});
