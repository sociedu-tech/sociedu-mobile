import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { Typography } from '../../src/components/typography/Typography';
import { TextInput } from '../../src/components/form/TextInput';
import { CustomButton } from '../../src/components/button/CustomButton';
import { theme } from '../../src/theme/theme';
import { authService } from '../../src/core/services/authService';

interface FieldErrors {
  lastName?: string;
  firstName?: string;
  email?: string;
  password?: string;
}

export default function RegisterScreen() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const validate = (): boolean => {
    const nextErrors: FieldErrors = {};

    if (!lastName.trim()) nextErrors.lastName = 'Vui lòng nhập họ.';
    if (!firstName.trim()) nextErrors.firstName = 'Vui lòng nhập tên.';

    const normalizedEmail = email.trim();
    if (!normalizedEmail) {
      nextErrors.email = 'Vui lòng nhập email.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      nextErrors.email = 'Email không đúng định dạng.';
    }

    if (!password) {
      nextErrors.password = 'Vui lòng nhập mật khẩu.';
    } else if (password.length < 6) {
      nextErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự.';
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setLoading(true);
    setError(null);

    try {
      const normalizedEmail = email.trim();
      await authService.register({
        email: normalizedEmail,
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });

      router.replace({
        pathname: '/(auth)/verify-email-pending',
        params: { email: normalizedEmail },
      } as any);
    } catch (err: any) {
      setError(err.message || 'Không thể đăng ký lúc này.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <LinearGradient colors={[theme.colors.primary, '#7C3AED']} style={StyleSheet.absoluteFill} />

      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            <View style={styles.branding}>
              <View style={styles.logoCircle}>
                <Ionicons name="sparkles" size={34} color={theme.colors.primary} />
              </View>
              <Typography variant="h1" style={styles.brandTitle}>Tham gia UniShare</Typography>
              <Typography variant="body" style={styles.brandSubtitle}>
                Tạo tài khoản, nhận email xác minh, sau đó tiếp tục kiểm thử luồng xác minh email.
              </Typography>
            </View>

            <View style={styles.card}>
              <Typography variant="h2" style={styles.cardTitle}>Tạo tài khoản</Typography>

              <View style={styles.row}>
                <View style={styles.half}>
                  <TextInput
                    label="HỌ"
                    placeholder="Nguyễn"
                    value={lastName}
                    onChangeText={(value) => {
                      setLastName(value);
                      setFieldErrors((prev) => ({ ...prev, lastName: undefined }));
                    }}
                    error={fieldErrors.lastName}
                  />
                </View>
                <View style={{ width: 12 }} />
                <View style={styles.half}>
                  <TextInput
                    label="TÊN"
                    placeholder="Văn A"
                    value={firstName}
                    onChangeText={(value) => {
                      setFirstName(value);
                      setFieldErrors((prev) => ({ ...prev, firstName: undefined }));
                    }}
                    error={fieldErrors.firstName}
                  />
                </View>
              </View>

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

              {error ? (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle" size={16} color={theme.colors.error} />
                  <Typography variant="caption" style={styles.errorText}>{error}</Typography>
                </View>
              ) : null}

              <CustomButton
                label="Đăng ký ngay"
                variant="gradient"
                size="lg"
                loading={loading}
                onPress={handleRegister}
                style={styles.primaryButton}
              />

              <View style={styles.footerRow}>
                <Typography variant="body" color="secondary">Đã có tài khoản?</Typography>
                <Link href="/(auth)/login" asChild>
                  <TouchableOpacity>
                    <Typography variant="body" style={styles.footerLink}> Đăng nhập ngay</Typography>
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
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },
  branding: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 24,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    ...theme.shadows.medium,
  },
  brandTitle: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 28,
    textAlign: 'center',
  },
  brandSubtitle: {
    color: 'rgba(255,255,255,0.82)',
    textAlign: 'center',
    marginTop: 8,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 32,
    padding: 24,
    ...theme.shadows.medium,
  },
  cardTitle: {
    fontWeight: '900',
    color: theme.colors.text.primary,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
  },
  half: {
    flex: 1,
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
