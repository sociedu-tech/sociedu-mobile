import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CustomButton } from '@/src/components/button/CustomButton';
import { Typography } from '@/src/components/typography/Typography';
import { theme } from '@/src/theme/theme';

import { authService } from '../services/authService';

const colors = {
  bg: '#F3F2EF',
  surface: '#FFFFFF',
  dark: '#222222',
  error: '#DC2626',
  errorBg: '#FEF2F2',
  errorBorder: '#FECACA',
};

export default function OTPScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email?: string }>();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(59);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (!email) {
      router.replace('/(auth)/forgot-password');
    }
  }, [email, router]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleChange = (text: string, index: number) => {
    const next = [...otp];

    if (text.length > 1) {
      const pasted = text.replace(/\D/g, '').slice(0, 6).split('');
      const merged = [...Array(6).fill('')];
      pasted.forEach((item, pastedIndex) => {
        merged[pastedIndex] = item;
      });
      setOtp(merged);
      inputRefs.current[Math.min(pasted.length, 5)]?.focus();
      return;
    }

    next[index] = text.replace(/\D/g, '');
    setOtp(next);
    setError(null);

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    Keyboard.dismiss();
    const code = otp.join('');

    if (!email) {
      setError('Thiếu email để xác thực OTP.');
      return;
    }

    if (code.length < 6) {
      setError('Vui lòng nhập đầy đủ 6 chữ số OTP.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await authService.verifyResetPasswordOtp({
        email,
        otp: code,
      });

      router.push({
        pathname: '/(auth)/reset-password',
        params: {
          email,
          resetToken: result.resetToken,
        },
      });
    } catch (err: any) {
      setError(err.message || 'Không thể xác thực OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email || timer > 0) {
      return;
    }

    setResending(true);
    setError(null);

    try {
      await authService.forgotPassword(email);
      setOtp(['', '', '', '', '', '']);
      setTimer(59);
    } catch (err: any) {
      setError(err.message || 'Không thể gửi lại mã OTP.');
    } finally {
      setResending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <View style={styles.content}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color={colors.dark} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Typography variant="h1" style={styles.title}>
              Xác thực OTP
            </Typography>
            <Typography variant="body" color="secondary" style={styles.subtitle}>
              Nhập mã 6 chữ số đã được gửi đến {email || 'email của bạn'}.
            </Typography>
          </View>

          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                style={[styles.otpInput, digit ? styles.otpInputActive : null]}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={(text) => handleChange(text, index)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                textAlign="center"
              />
            ))}
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color={colors.error} />
              <Typography variant="label" style={styles.errorText}>
                {error}
              </Typography>
            </View>
          ) : null}

          <View style={styles.timerRow}>
            <Typography variant="body" color="secondary">
              Không nhận được mã?
            </Typography>
            {timer > 0 ? (
              <Typography variant="bodyMedium" style={styles.timerText}>
                Gửi lại sau {timer}s
              </Typography>
            ) : (
              <TouchableOpacity onPress={handleResend} disabled={resending} activeOpacity={0.7}>
                <Typography variant="bodyMedium" style={styles.timerText}>
                  {resending ? 'Đang gửi...' : 'Gửi lại ngay'}
                </Typography>
              </TouchableOpacity>
            )}
          </View>

          <CustomButton
            label="Xác nhận OTP"
            onPress={handleVerify}
            loading={loading}
            disabled={loading || otp.join('').length < 6}
            style={styles.verifyBtn}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    color: colors.dark,
    fontWeight: '800',
    marginBottom: 12,
  },
  subtitle: {
    lineHeight: 22,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: theme.colors.border.default,
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  otpInputActive: {
    borderColor: theme.colors.primary,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.errorBg,
    borderWidth: 1,
    borderColor: colors.errorBorder,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  errorText: {
    color: colors.error,
    fontWeight: '700',
    flex: 1,
  },
  timerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 40,
  },
  timerText: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  verifyBtn: {
    marginTop: 'auto',
    marginBottom: 40,
    borderRadius: 16,
  },
});
