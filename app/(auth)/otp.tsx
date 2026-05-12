import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput as RNTextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { CustomButton } from '../../src/components/button/CustomButton';
import { Typography } from '../../src/components/typography/Typography';
import { authService } from '../../src/core/services/authService';
import { useAuthStore } from '../../src/core/store/authStore';
import { theme } from '../../src/theme/theme';

const OTP_LENGTH = 6;

type OtpMode = 'login-otp' | 'phone-verify';

export default function OtpScreen() {
  const router = useRouter();
  const storeLogin = useAuthStore((s) => s.login);
  const params = useLocalSearchParams<{ mode?: OtpMode; email?: string; phoneNumber?: string }>();
  const mode: OtpMode = params.mode === 'phone-verify' ? 'phone-verify' : 'login-otp';
  const email = typeof params.email === 'string' ? params.email.trim() : '';
  const phoneNumber = typeof params.phoneNumber === 'string' ? params.phoneNumber.trim() : '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(59);

  const inputRefs = useRef<(RNTextInput | null)[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const focusNextAvailable = (nextOtp: string[]) => {
    const nextEmptyIndex = nextOtp.findIndex((digit) => digit === '');
    if (nextEmptyIndex >= 0) {
      inputRefs.current[nextEmptyIndex]?.focus();
    } else {
      inputRefs.current[OTP_LENGTH - 1]?.focus();
    }
  };

  const handlePasteOrChange = (text: string, index: number) => {
    const sanitized = text.replace(/\D/g, '');
    if (!sanitized && text.length > 0) return;

    if (sanitized.length > 1) {
      const nextOtp = Array(OTP_LENGTH).fill('');
      sanitized
        .slice(0, OTP_LENGTH)
        .split('')
        .forEach((digit, digitIndex) => {
          nextOtp[digitIndex] = digit;
        });
      setOtp(nextOtp);
      focusNextAvailable(nextOtp);
      return;
    }

    const nextOtp = [...otp];
    nextOtp[index] = sanitized;
    setOtp(nextOtp);

    if (sanitized && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (event: { nativeEvent: { key: string } }, index: number) => {
    if (event.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    Keyboard.dismiss();
    const code = otp.join('');
    if (code.length < OTP_LENGTH) {
      Alert.alert('OTP chưa đủ', 'Vui lòng nhập đầy đủ 6 chữ số.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'phone-verify') {
        if (!phoneNumber) {
          throw new Error('Không tìm thấy số điện thoại cho luồng xác thực.');
        }

        await authService.verifyPhoneOtp({ phoneNumber, otpCode: code });

        try {
          const sessionUser = await authService.getSessionMe();
          storeLogin(sessionUser);
        } catch {
          // Keep current session if auth/me does not expose new phone state yet.
        }

        Alert.alert('Xác thực thành công', 'Số điện thoại đã được xác thực.');
        router.replace('/profile/phone-verification');
        return;
      }

      if (!email) {
        throw new Error('Không tìm thấy email cho luồng đăng nhập bằng OTP.');
      }

      const user = await authService.loginWithOtp({ email, otpCode: code });
      storeLogin(user);
      Alert.alert('Đăng nhập thành công', 'Bạn đã đăng nhập bằng OTP.');
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Không thể xác thực', err.message || 'Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      if (mode === 'phone-verify') {
        if (!phoneNumber) throw new Error('Không tìm thấy số điện thoại để gửi lại OTP.');
        await authService.sendPhoneVerificationOtp({ phoneNumber });
      } else {
        if (!email) throw new Error('Không tìm thấy email để gửi lại OTP.');
        await authService.sendLoginOtp(email);
      }

      setTimer(59);
      setOtp(['', '', '', '', '', '']);
      Alert.alert('Đã gửi lại', 'Mã OTP mới đã được gửi.');
    } catch (err: any) {
      Alert.alert('Không thể gửi lại', err.message || 'Vui lòng thử lại sau.');
    } finally {
      setResending(false);
    }
  };

  const subtitle =
    mode === 'phone-verify'
      ? `Nhập mã OTP đã được gửi tới email tài khoản để xác thực số ${phoneNumber || 'điện thoại'}.`
      : `Nhập mã OTP 6 số đã được gửi tới email ${email || 'của bạn'} để đăng nhập.`;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
        <View style={styles.content}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Typography variant="h1" style={styles.title}>
              {mode === 'phone-verify' ? 'Xác thực số điện thoại' : 'Đăng nhập bằng OTP'}
            </Typography>
            <Typography variant="body" color="secondary" style={styles.subtitle}>
              {subtitle}
            </Typography>
          </View>

          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <RNTextInput
                key={index}
                ref={(element) => {
                  inputRefs.current[index] = element;
                }}
                style={[styles.otpInput, digit !== '' && styles.otpInputActive]}
                keyboardType="number-pad"
                maxLength={index === 0 ? OTP_LENGTH : 1}
                value={digit}
                onChangeText={(text) => handlePasteOrChange(text, index)}
                onKeyPress={(event) => handleKeyPress(event, index)}
                textAlign="center"
              />
            ))}
          </View>

          <View style={styles.timerRow}>
            <Typography variant="body" color="secondary">Không nhận được mã?</Typography>
            {timer > 0 ? (
              <Typography variant="body" style={styles.timerText}>Gửi lại sau {timer}s</Typography>
            ) : (
              <TouchableOpacity onPress={handleResend} disabled={resending}>
                <Typography variant="body" style={styles.timerText}>Gửi lại ngay</Typography>
              </TouchableOpacity>
            )}
          </View>

          <CustomButton
            label={mode === 'phone-verify' ? 'Xác thực số điện thoại' : 'Đăng nhập bằng OTP'}
            onPress={handleVerify}
            loading={loading || resending}
            disabled={otp.join('').length < OTP_LENGTH || loading || resending}
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
    backgroundColor: theme.colors.background,
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
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 12,
  },
  subtitle: {
    lineHeight: 22,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    borderWidth: 1.5,
    borderColor: theme.colors.border.default,
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  otpInputActive: {
    borderColor: theme.colors.primary,
    backgroundColor: '#FFF',
  },
  timerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  timerText: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  verifyBtn: {
    borderRadius: 16,
  },
});
